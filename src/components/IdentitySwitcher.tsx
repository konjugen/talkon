"use client";

import React from "react";
import { UserCheck, Shield, Headphones } from "lucide-react";
import { TalkOnUser } from "@/types/talkon";
import { Avatar } from "./Avatar";

interface IdentitySwitcherProps {
  currentUser: TalkOnUser;
  identities: TalkOnUser[];
  onSwitchIdentity: (user: TalkOnUser) => void;
}

export const IdentitySwitcher: React.FC<IdentitySwitcherProps> = ({
  currentUser,
  identities,
  onSwitchIdentity,
}) => {
  return (
    <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-1.5 px-3">
      <div className="flex items-center gap-2">
        <Avatar seed={currentUser.avatarSeed} size="sm" />
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-white leading-none">{currentUser.handle}</p>
          <span className="text-[10px] text-purple-400 capitalize">
            {currentUser.role === "moderator" ? "👑 Moderatör" : "🎧 Dinleyici"}
          </span>
        </div>
      </div>

      <div className="h-5 w-px bg-neutral-800 mx-1 hidden sm:block" />

      {/* Quick Switch Buttons for A/B Acceptance Testing */}
      <div className="flex items-center gap-1">
        {identities.map((ident) => {
          const isActive = ident.id === currentUser.id;
          return (
            <button
              key={ident.id}
              onClick={() => onSwitchIdentity(ident)}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 ${
                isActive
                  ? "bg-purple-600 text-white font-semibold shadow-sm"
                  : "bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
              title={`${ident.handle} (${ident.role}) olarak test et`}
            >
              {ident.role === "moderator" ? (
                <Shield className="w-3 h-3" />
              ) : (
                <Headphones className="w-3 h-3" />
              )}
              <span>{ident.role === "moderator" ? "Moderatör" : "Dinleyici"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
