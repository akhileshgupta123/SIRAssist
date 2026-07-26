import React, { useState } from 'react';
import { Vote, Sparkles, Database, Code, Upload, LogOut, UserCheck, Layers, ClipboardList, ShieldCheck, Mail, IdCard, MapPin, ChevronDown, X } from 'lucide-react';
import { UserSession } from './LoginScreen';

interface HeaderProps {
  activeTab: 'dashboard' | 'records' | 'field-verification' | 'prompt-lab' | 'python-inspector';
  setActiveTab: (tab: 'dashboard' | 'records' | 'field-verification' | 'prompt-lab' | 'python-inspector') => void;
  onOpenNewRecordModal: () => void;
  onOpenUploadModal: () => void;
  onRunBatchAudit: () => void;
  isAuditing: boolean;
  dbStatus: boolean;
  currentUser?: UserSession | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewRecordModal,
  onOpenUploadModal,
  onRunBatchAudit,
  isAuditing,
  dbStatus,
  currentUser,
  onLogout,
}) => {
  const [showProfileCard, setShowProfileCard] = useState(false);

  return (
    <header className="bg-[#0176d3] border-b border-[#015ba3] text-white sticky top-0 z-40 shadow-sm relative">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors">
              <Vote className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                  SIRAssist <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-white/20 text-white border border-white/30">Electoral Roll SIR Platform</span>
                </h1>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#014486] text-blue-100">SLDS v1.2</span>
              </div>
              <p className="text-[11px] text-blue-100 hidden sm:block">
                Salesforce Lightning Platform for Electoral Revision, Gemini AI & Field Audits
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setShowProfileCard(!showProfileCard)}
                  className="flex items-center space-x-2 text-xs bg-[#015ba3] hover:bg-[#014486] px-2.5 py-1 rounded border border-white/20 text-white transition-all cursor-pointer"
                  title="Click to view logged in officer details"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <div className="text-[11px] leading-tight text-left hidden sm:block">
                    <span className="font-bold block max-w-[130px] truncate">{currentUser.name}</span>
                    <span className="text-[9px] text-blue-200 block truncate">{currentUser.role}</span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-blue-200 hidden sm:block" />
                </button>

                {/* Profile Popover Details Dropdown */}
                {showProfileCard && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-[#dddbda] rounded-lg shadow-2xl text-slate-800 z-50 p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#dddbda]">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-md bg-[#0176d3] text-white flex items-center justify-center font-bold text-sm">
                          {currentUser.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{currentUser.name}</h4>
                          <span className="text-[10px] text-[#027e46] font-bold">Authenticated Session</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowProfileCard(false)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Official Role</span>
                        <div className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#0176d3]" />
                          {currentUser.role}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Officer Email</span>
                        <div className="font-mono text-[11px] text-slate-700 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {currentUser.email}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Badge ID & Constituency</span>
                        <div className="text-slate-700 space-y-1 mt-0.5">
                          <div className="flex items-center gap-1 font-mono font-bold text-[11px] text-slate-800">
                            <IdCard className="w-3.5 h-3.5 text-slate-400" />
                            {currentUser.officerId}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-[#0176d3]" />
                            {currentUser.constituency}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#dddbda] flex justify-end">
                      {onLogout && (
                        <button
                          onClick={() => {
                            setShowProfileCard(false);
                            onLogout();
                          }}
                          className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-[#ba0517] border border-[#fcc2c1] text-xs font-semibold rounded transition-all flex items-center justify-center gap-1.5"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Log Out / Switch Account
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={onRunBatchAudit}
              disabled={isAuditing}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs font-semibold rounded transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isAuditing ? 'animate-spin' : ''}`} />
              {isAuditing ? 'Auditing Rolls...' : 'Run AI Audit'}
            </button>

            <button
              onClick={onOpenUploadModal}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs font-semibold rounded transition-all flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-blue-100" />
              <span className="hidden sm:inline">Upload List</span>
            </button>

            <button
              onClick={onOpenNewRecordModal}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>+ Ingest Record</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Log out of Electoral Officer Session"
                className="p-1.5 bg-white/10 hover:bg-rose-600/80 text-white border border-white/30 text-xs font-semibold rounded transition-all flex items-center gap-1 ml-1"
              >
                <LogOut className="w-3.5 h-3.5 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Header Navigation Tabs Bar (SLDS White Background Bar) */}
      <div className="bg-white border-b border-[#dddbda] text-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-md transition-all flex items-center gap-1.5 border-b-2 ${
                activeTab === 'dashboard'
                  ? 'border-[#0176d3] text-[#0176d3] bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Dashboard & Simulation
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-md transition-all flex items-center gap-1.5 border-b-2 ${
                activeTab === 'records'
                  ? 'border-[#0176d3] text-[#0176d3] bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Electoral Records
            </button>
            <button
              onClick={() => setActiveTab('field-verification')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-md transition-all flex items-center gap-1.5 border-b-2 ${
                activeTab === 'field-verification'
                  ? 'border-[#0176d3] text-[#0176d3] bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              BLO Field Queue
            </button>
            <button
              onClick={() => setActiveTab('prompt-lab')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-md transition-all flex items-center gap-1.5 border-b-2 ${
                activeTab === 'prompt-lab'
                  ? 'border-[#0176d3] text-[#0176d3] bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Gemini SIR Lab
            </button>
            <button
              onClick={() => setActiveTab('python-inspector')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-md transition-all flex items-center gap-1.5 border-b-2 ${
                activeTab === 'python-inspector'
                  ? 'border-[#0176d3] text-[#0176d3] bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-emerald-600" />
              Python Inspector
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
