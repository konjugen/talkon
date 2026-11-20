"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Check, X, AlertCircle } from "lucide-react";

interface MicCheckModalProps {
  isOpen: boolean;
  onReady: () => void;
  onCancel: () => void;
}

export const MicCheckModal: React.FC<MicCheckModalProps> = ({
  isOpen,
  onReady,
  onCancel,
}) => {
  const [micAllowed, setMicAllowed] = useState<boolean | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      cleanupAudio();
      return;
    }

    startMicTest();

    return () => {
      cleanupAudio();
    };
  }, [isOpen]);

  const cleanupAudio = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  const startMicTest = async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicAllowed(true);

      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        // Normalize 0 to 100
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalized);

        animationFrameRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter();
    } catch (err: unknown) {
      setMicAllowed(false);
      const error = err as Error;
      setErrorMessage(
        error.name === "NotAllowedError"
          ? "Mikrofon izni verilmedi. Lütfen tarayıcı ayarlarından mikrofona izin verin."
          : "Mikrofon başlatılamadı. Cihazınızı kontrol edin."
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
          title="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <Mic className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold">Sahneye Çıkış Hazırlığı</h3>
          <p className="text-sm text-neutral-400 mt-1">
            Konuşmacı koltuğuna geçmeden önce mikrofonunuzu test edin.
          </p>
        </div>

        {/* Audio Meter Visualizer */}
        <div className="bg-neutral-950 rounded-xl p-4 border border-neutral-800 mb-6">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span>Ses Girişi (Mikrofon Seviyesi)</span>
            <span className={audioLevel > 15 ? "text-emerald-400 font-semibold" : "text-neutral-500"}>
              {audioLevel > 15 ? "Ses Algılandı" : "Sessiz"}
            </span>
          </div>

          <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden flex items-center p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                audioLevel > 60
                  ? "bg-rose-500"
                  : audioLevel > 20
                  ? "bg-emerald-500"
                  : "bg-neutral-600"
              }`}
              style={{ width: `${Math.max(5, audioLevel)}%` }}
            />
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2 mt-3 text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/50">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <div className="text-xs text-neutral-400 mb-6 space-y-1 bg-neutral-800/40 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Kabul etmek sahneye çıkmak anlamına gelmez.</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>&quot;Hazırım&quot; dediğiniz anda sesiniz yayına açılır.</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-700 hover:bg-neutral-800 text-sm font-medium transition-colors"
          >
            Vazgeç
          </button>
          <button
            onClick={() => {
              cleanupAudio();
              onReady();
            }}
            disabled={micAllowed === false}
            className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
          >
            <Check className="w-4 h-4" />
            Hazırım
          </button>
        </div>
      </div>
    </div>
  );
};
