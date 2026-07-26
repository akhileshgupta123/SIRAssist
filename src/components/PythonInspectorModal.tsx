import React, { useEffect, useState } from 'react';
import { Code, Copy, Check, X } from 'lucide-react';

interface PythonInspectorModalProps {
  onClose?: () => void;
  isStandaloneTab?: boolean;
}

export const PythonInspectorModal: React.FC<PythonInspectorModalProps> = ({
  onClose,
  isStandaloneTab = false,
}) => {
  const [pythonCode, setPythonCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/python-code')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPythonCode(data.code);
        } else {
          setPythonCode('# Failed to load python backend script');
        }
      })
      .catch((err) => {
        setPythonCode(`# Error loading backend script: ${err.message}`);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const containerClasses = isStandaloneTab
    ? 'bg-white border border-[#dddbda] rounded-lg p-6 text-slate-800 shadow-sm'
    : 'bg-white border border-[#dddbda] rounded-lg max-w-4xl w-full text-slate-800 p-6 shadow-xl relative my-8 max-h-[85vh] flex flex-col';

  return (
    <div className={isStandaloneTab ? '' : 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4'}>
      <div className={containerClasses}>
        {/* Top Title Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#dddbda] mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-md bg-[#e3f5ed] border border-[#c3ebda] text-[#027e46]">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Python Backend & Gemini SIR Tool Analysis Code
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-[#027e46] border border-[#c3ebda] font-semibold">
                  sir_assist_api.py
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect Gemini 3.6 Flash tool calls, duplicate voter search algorithm, & SQLite SIR database pipeline
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-[#dddbda] text-xs font-semibold rounded transition-all flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#027e46]" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              {copied ? 'Copied Python Script' : 'Copy Python Script'}
            </button>
            {!isStandaloneTab && onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="p-3 bg-slate-50/80 border border-[#dddbda] rounded-md">
            <span className="text-[10px] font-mono text-[#027e46] uppercase font-bold">Tool 1: Duplicate Matcher</span>
            <p className="text-xs text-slate-700 mt-1">
              Cross-references EPIC IDs, voter names, father names, and addresses in SQLite.
            </p>
          </div>
          <div className="p-3 bg-slate-50/80 border border-[#dddbda] rounded-md">
            <span className="text-[10px] font-mono text-[#0176d3] uppercase font-bold">Tool 2: Gemini Flash Agent</span>
            <p className="text-xs text-slate-700 mt-1">
              Uses @google/genai SDK with gemini-3.6-flash for structured JSON risk scoring & BLO checklists.
            </p>
          </div>
          <div className="p-3 bg-slate-50/80 border border-[#dddbda] rounded-md">
            <span className="text-[10px] font-mono text-[#8c4b00] uppercase font-bold">Tool 3: ERO Action Pipeline</span>
            <p className="text-xs text-slate-700 mt-1">
              Logs human/AI verification actions in SQLite audit tables for electoral roll certification.
            </p>
          </div>
        </div>

        {/* Code Viewport */}
        <div className="bg-slate-900 border border-slate-800 rounded-md p-4 font-mono text-xs text-emerald-400 overflow-auto max-h-[500px]">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading Python script...</div>
          ) : (
            <pre className="whitespace-pre-wrap leading-relaxed text-[11px] text-emerald-300 font-mono">
              {pythonCode}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
