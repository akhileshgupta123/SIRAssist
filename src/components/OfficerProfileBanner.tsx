import React, { useState } from 'react';
import { UserCheck, ShieldCheck, MapPin, Mail, IdCard, LogOut, ChevronDown, ChevronUp, Sparkles, Building2 } from 'lucide-react';
import { UserSession } from './LoginScreen';

interface OfficerProfileBannerProps {
  currentUser: UserSession;
  onLogout: () => void;
}

export const OfficerProfileBanner: React.FC<OfficerProfileBannerProps> = ({ currentUser, onLogout }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white border border-[#dddbda] rounded-lg p-4 shadow-sm mb-6 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Officer Primary Avatar & Info */}
        <div className="flex items-start space-x-3.5">
          <div className="w-11 h-11 rounded-lg bg-[#0176d3] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm">
            {currentUser.name ? currentUser.name.charAt(0) : 'O'}
          </div>

          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h2 className="text-base font-bold text-slate-900">{currentUser.name}</h2>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-[#0176d3] border border-blue-200 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#0176d3]" />
                {currentUser.role}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#e3f5ed] text-[#027e46] border border-[#c3ebda] font-bold">
                Active Session
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1 flex items-center flex-wrap gap-x-4 gap-y-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {currentUser.email}
              </span>
              <span className="flex items-center gap-1 font-mono text-slate-600 font-semibold">
                <IdCard className="w-3.5 h-3.5 text-slate-400" />
                ID: {currentUser.officerId}
              </span>
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#0176d3]" />
                {currentUser.constituency}
              </span>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 self-end md:self-auto">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-[#dddbda] text-xs font-semibold rounded transition-all flex items-center gap-1.5"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{isExpanded ? 'Hide Details' : 'View Session Scope'}</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-[#ba0517] border border-[#fcc2c1] text-xs font-semibold rounded transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch Officer / Log Out</span>
          </button>
        </div>
      </div>

      {/* Expanded Session & Jurisdiction Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-[#dddbda] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-md border border-[#dddbda]/60">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Electoral Jurisdiction</span>
            <p className="font-semibold text-slate-800 mt-0.5">{currentUser.constituency}</p>
            <p className="text-[11px] text-slate-500">ECI West Bengal Division • State Code WB-164</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Officer Clearances & Scope</span>
            <p className="font-semibold text-slate-800 mt-0.5">{currentUser.role}</p>
            <p className="text-[11px] text-slate-500">Authorized for Form-7 Duplicate Purging & Field Verification</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">AI Integration Level</span>
            <p className="font-semibold text-[#0176d3] mt-0.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Gemini 3.6 Flash SIR Tool Enabled
            </p>
            <p className="text-[11px] text-slate-500">Automated SQLite duplicate voter matching enabled</p>
          </div>
        </div>
      )}
    </div>
  );
};
