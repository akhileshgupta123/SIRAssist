import React, { useState } from 'react';
import { Vote, ShieldCheck, Lock, User, Sparkles, Key, CheckCircle2, Building2 } from 'lucide-react';

export interface UserSession {
  name: string;
  role: 'Electoral Registration Officer (ERO)' | 'Booth Level Officer (BLO)' | 'District Election Officer (DEO)' | 'System Admin';
  email: string;
  constituency: string;
  officerId: string;
}

interface LoginScreenProps {
  onLoginSuccess: (user: UserSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [activeMode, setActiveMode] = useState<'login' | 'register'>('login');
  
  // Login state
  const [username, setUsername] = useState('ero.kolkata@eci.gov.in');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState<UserSession['role']>('Electoral Registration Officer (ERO)');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserSession['role']>('Electoral Registration Officer (ERO)');
  const [regConstituency, setRegConstituency] = useState('AC-164 Kolkata South');
  const [regOfficerId, setRegOfficerId] = useState('ERO-WB-2026-99');
  const [regSuccessMsg, setRegSuccessMsg] = useState('');

  const [registeredAccounts, setRegisteredAccounts] = useState<UserSession[]>(() => {
    const saved = localStorage.getItem('sir_registered_officers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const demoAccounts: UserSession[] = [
    {
      name: 'A. K. Sharma, IAS',
      role: 'Electoral Registration Officer (ERO)',
      email: 'ero.kolkata@eci.gov.in',
      constituency: 'AC-164 Kolkata South',
      officerId: 'ERO-WB-2026-01'
    },
    {
      name: 'Anindita Banerjee',
      role: 'Booth Level Officer (BLO)',
      email: 'blo.part12@eci.gov.in',
      constituency: 'Part 12 (Booth 14-A)',
      officerId: 'BLO-WB-164-12'
    },
    {
      name: 'S. K. Mukherjee',
      role: 'District Election Officer (DEO)',
      email: 'deo.kolkata@eci.gov.in',
      constituency: 'Kolkata District HQ',
      officerId: 'DEO-WB-01'
    },
    ...registeredAccounts
  ];

  const handleSelectDemo = (acc: UserSession) => {
    setUsername(acc.email);
    setSelectedRole(acc.role);
    setActiveMode('login');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const activeAccount = demoAccounts.find((a) => a.email.toLowerCase() === username.toLowerCase()) || {
        name: username.split('@')[0].toUpperCase(),
        role: selectedRole,
        email: username,
        constituency: 'AC-164 Kolkata South',
        officerId: 'OFFICER-2026-789'
      };

      onLoginSuccess(activeAccount);
      setIsLoading(false);
    }, 600);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const newOfficer: UserSession = {
      name: regName || 'Officer ' + regEmail.split('@')[0],
      email: regEmail,
      role: regRole,
      constituency: regConstituency || 'Assembly Constituency 164',
      officerId: regOfficerId || `OFFICER-${Date.now().toString().slice(-4)}`
    };

    setTimeout(() => {
      const updated = [newOfficer, ...registeredAccounts];
      setRegisteredAccounts(updated);
      localStorage.setItem('sir_registered_officers', JSON.stringify(updated));

      setRegSuccessMsg(`Officer registration complete! Logging in as ${newOfficer.name}...`);
      
      setTimeout(() => {
        onLoginSuccess(newOfficer);
        setIsLoading(false);
      }, 700);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#f3f3f2] flex flex-col justify-between font-sans selection:bg-[#0176d3] selection:text-white">
      {/* Salesforce Lightning Blue Top Accent Banner */}
      <div className="bg-[#0176d3] h-2 w-full"></div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#dddbda] rounded-lg shadow-xl overflow-hidden my-6">
          {/* Salesforce / ECI Header Branding */}
          <div className="bg-[#f8f9fb] border-b border-[#dddbda] p-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#0176d3] text-white flex items-center justify-center mx-auto shadow-md shadow-blue-900/10">
              <Vote className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center justify-center gap-1.5">
                SIRAssist <span className="text-xs px-2 py-0.5 rounded bg-[#0176d3] text-white font-semibold">ECI Platform</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Salesforce Lightning Electoral Revision Portal
              </p>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex border-b border-[#dddbda] bg-slate-50 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveMode('login')}
              className={`flex-1 py-3 text-center border-b-2 transition-all ${
                activeMode === 'login'
                  ? 'border-[#0176d3] text-[#0176d3] bg-white font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Officer Log In
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('register')}
              className={`flex-1 py-3 text-center border-b-2 transition-all ${
                activeMode === 'register'
                  ? 'border-[#0176d3] text-[#0176d3] bg-white font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              + Register New Officer
            </button>
          </div>

          {/* Login Form */}
          {activeMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Electoral Officer Email / User ID
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="officer@eci.gov.in"
                    className="w-full bg-white border border-[#dddbda] rounded-md pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-[#dddbda] rounded-md pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Official Designation / Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserSession['role'])}
                  className="w-full bg-white border border-[#dddbda] rounded-md px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#0176d3]"
                >
                  <option value="Electoral Registration Officer (ERO)">Electoral Registration Officer (ERO)</option>
                  <option value="Booth Level Officer (BLO)">Booth Level Officer (BLO)</option>
                  <option value="District Election Officer (DEO)">District Election Officer (DEO)</option>
                  <option value="System Admin">System Admin</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#dddbda] text-[#0176d3] focus:ring-[#0176d3]"
                  />
                  <span>Remember Session</span>
                </label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[#0176d3] font-semibold hover:underline">
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#0176d3] hover:bg-[#015ba3] text-white font-bold text-xs rounded transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                {isLoading ? 'Authenticating Officer...' : 'Log In to SIR Portal'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3.5">
              {regSuccessMsg && (
                <div className="p-2.5 bg-[#e3f5ed] border border-[#c3ebda] rounded text-xs text-[#027e46] font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{regSuccessMsg}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Full Officer Name *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh K. Varma"
                  className="w-full bg-white border border-[#dddbda] rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0176d3]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="rajesh.varma@eci.gov.in"
                  className="w-full bg-white border border-[#dddbda] rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0176d3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Designation / Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserSession['role'])}
                    className="w-full bg-white border border-[#dddbda] rounded-md px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0176d3]"
                  >
                    <option value="Electoral Registration Officer (ERO)">ERO</option>
                    <option value="Booth Level Officer (BLO)">BLO</option>
                    <option value="District Election Officer (DEO)">DEO</option>
                    <option value="System Admin">System Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Officer Badge ID
                  </label>
                  <input
                    type="text"
                    value={regOfficerId}
                    onChange={(e) => setRegOfficerId(e.target.value)}
                    className="w-full bg-white border border-[#dddbda] rounded-md px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0176d3] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Assigned Constituency / Booth
                </label>
                <input
                  type="text"
                  value={regConstituency}
                  onChange={(e) => setRegConstituency(e.target.value)}
                  placeholder="e.g. AC-164 Kolkata South"
                  className="w-full bg-white border border-[#dddbda] rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0176d3]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Secure Password *
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-white border border-[#dddbda] rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0176d3]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#0176d3] hover:bg-[#015ba3] text-white font-bold text-xs rounded transition-all shadow-sm flex items-center justify-center gap-2 mt-2"
              >
                <Sparkles className="w-4 h-4" />
                {isLoading ? 'Registering Officer...' : 'Register Account & Enter Portal'}
              </button>
            </form>
          )}

          {/* Demo Quick Logins */}
          <div className="bg-[#fafaf9] border-t border-[#dddbda] p-4 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Quick Login Demo Profiles
            </span>
            <div className="space-y-1.5">
              {demoAccounts.map((acc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectDemo(acc)}
                  className={`w-full text-left p-2 rounded border text-xs flex items-center justify-between transition-all ${
                    username === acc.email
                      ? 'bg-blue-50 border-[#0176d3] text-[#0176d3]'
                      : 'bg-white border-[#dddbda] text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <span className="font-bold block">{acc.name}</span>
                    <span className="text-[10px] text-slate-500">{acc.role} • {acc.constituency}</span>
                  </div>
                  {username === acc.email && <CheckCircle2 className="w-4 h-4 text-[#0176d3] shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="bg-white border-t border-[#dddbda] py-3 text-center text-[11px] text-slate-500">
        Election Commission of India • Special Intensive Revision (SIR) • Powered by Salesforce Lightning Platform & Gemini 3.6 Flash
      </footer>
    </div>
  );
};
