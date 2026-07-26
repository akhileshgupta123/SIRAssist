import React, { useState } from 'react';
import { Sparkles, Play } from 'lucide-react';

export const PromptLabTab: React.FC = () => {
  const [customPrompt, setCustomPrompt] = useState(
    `Analyse the following voter record for potential Special Intensive Revision (SIR) anomalies:
Voter: Ramesh Chandra Sharma (Age 42, Male)
EPIC: EPIC-WB-2026-90412
Relative: Kailash Nath Sharma (Father)
Address: 42/B Rashbehari Avenue, Flat 3A, Kolkata
Constituency: AC-164 Kolkata South, Part 12

Draft Roll Comparison Match:
Voter: Rajesh K Sharma (Age 42, Male)
EPIC: EPIC-WB-2026-88102
Constituency: AC-165 Jadavpur, Part 48

Evaluate dual enrollment risk, assign SLA hours, and generate BLO door-to-door verification checklist.`
  );
  const [isTesting, setIsTesting] = useState(false);
  const [responseOutput, setResponseOutput] = useState<string | null>(null);

  const handleTestPrompt = async () => {
    setIsTesting(true);
    setResponseOutput(null);

    try {
      const res = await fetch('/api/incidents/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voterName: 'Ramesh Chandra Sharma',
          relativeName: 'Kailash Nath Sharma',
          houseAddress: '42/B Rashbehari Avenue, Flat 3A, Kolkata',
          assemblyConstituency: 'AC-164 Kolkata South, Part 12',
          category: 'Demographic Match',
          age: 42,
          gender: 'M',
          epicNumber: 'EPIC-WB-2026-90412'
        })
      });
      const data = await res.json();
      if (data.success) {
        setResponseOutput(JSON.stringify(data.analysis, null, 2));
      } else {
        setResponseOutput(JSON.stringify({ error: data.error }, null, 2));
      }
    } catch (err: any) {
      setResponseOutput(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-white border border-[#dddbda] rounded-lg p-6 text-slate-800 shadow-sm space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-[#dddbda]">
        <div className="p-2 rounded-md bg-blue-50 border border-blue-200 text-[#0176d3]">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Gemini SIR Prompt & Verification Lab</h2>
          <p className="text-xs text-slate-500">Experiment with Gemini 3.6 Flash structured prompts for electoral roll audits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Prompt Editor */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 block">System Prompt Input Payload</label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            rows={12}
            className="w-full bg-white border border-[#dddbda] rounded-md p-3 font-mono text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] leading-relaxed"
          />
          <button
            onClick={handleTestPrompt}
            disabled={isTesting}
            className="w-full py-2.5 bg-[#0176d3] hover:bg-[#015ba3] text-white font-semibold text-xs rounded transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Play className={`w-4 h-4 fill-current ${isTesting ? 'animate-spin' : ''}`} />
            {isTesting ? 'Executing Gemini AI Analysis...' : 'Execute Prompt with Gemini 3.6 Flash'}
          </button>
        </div>

        {/* Right: Output JSON Response */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 block">Structured Tool Output (JSON Schema)</label>
          <div className="bg-slate-900 border border-slate-800 rounded-md p-3 font-mono text-xs text-emerald-300 min-h-[300px] max-h-[350px] overflow-auto">
            {responseOutput ? (
              <pre className="whitespace-pre-wrap text-emerald-300 font-mono text-[11px]">
                {responseOutput}
              </pre>
            ) : (
              <div className="text-slate-500 italic p-8 text-center">
                Click "Execute Prompt" to trigger Gemini AI tool analysis output.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
