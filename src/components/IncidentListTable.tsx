import React from 'react';
import { ElectoralRecord } from '../types';
import { Sparkles, Eye, Copy, ShieldCheck } from 'lucide-react';

interface IncidentListTableProps {
  records: ElectoralRecord[];
  onSelectRecord: (record: ElectoralRecord) => void;
  onOpenDuplicateModal: (record: ElectoralRecord) => void;
  isLoading: boolean;
}

export const IncidentListTable: React.FC<IncidentListTableProps> = ({
  records,
  onSelectRecord,
  onOpenDuplicateModal,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-[#dddbda] rounded-lg p-12 text-center text-slate-500 shadow-sm">
        <Sparkles className="w-8 h-8 text-[#0176d3] animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold">Loading Electoral Roll Database & Gemini Analysis...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-white border border-[#dddbda] rounded-lg p-12 text-center text-slate-500 shadow-sm">
        <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800">No Electoral Records Found</h3>
        <p className="text-xs text-slate-500 mt-1">Try clearing filters or ingestion search query.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#dddbda] rounded-lg overflow-hidden text-slate-800 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#dddbda] bg-[#fafaf9] text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <th className="py-3 px-4">EPIC / Voter</th>
              <th className="py-3 px-4">Relative / Age / Gender</th>
              <th className="py-3 px-4">Constituency & Booth</th>
              <th className="py-3 px-4">Category / Anomaly</th>
              <th className="py-3 px-4">Risk Score</th>
              <th className="py-3 px-4">SIR Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {records.map((rec) => {
              const isDuplicate = rec.isDuplicate || rec.status === 'Flagged Duplicate';

              return (
                <tr
                  key={rec.id}
                  className="hover:bg-[#f3f5f8] transition-colors group cursor-pointer"
                  onClick={() => onSelectRecord(rec)}
                >
                  {/* EPIC / Voter Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div>
                        <div className="font-mono text-[#0176d3] font-bold flex items-center gap-1.5">
                          {rec.epicNumber}
                          {isDuplicate && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-[#fff0c2] text-[#8c4b00] border border-[#ffe399]">
                              DUP
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-slate-900 text-sm mt-0.5">{rec.voterName}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{rec.houseAddress}</div>
                      </div>
                    </div>
                  </td>

                  {/* Relative / Age / Gender */}
                  <td className="py-3 px-4">
                    <div className="text-slate-800 font-semibold">{rec.relativeName} ({rec.relationType})</div>
                    <div className="text-slate-500 text-[11px]">Age: {rec.age} yrs | Gender: {rec.gender}</div>
                  </td>

                  {/* Constituency & Booth */}
                  <td className="py-3 px-4">
                    <div className="text-slate-800 font-semibold">{rec.assemblyConstituency}</div>
                    <div className="text-slate-500 text-[11px] font-mono">{rec.partNumber} • {rec.bloAssigned}</div>
                  </td>

                  {/* Category / Anomaly */}
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded font-semibold text-[11px] border ${
                      rec.anomalySeverity === 'Critical'
                        ? 'bg-[#fededd] text-[#ba0517] border-[#fcc2c1]'
                        : rec.anomalySeverity === 'High'
                        ? 'bg-[#fff0c2] text-[#8c4b00] border-[#ffe399]'
                        : rec.anomalySeverity === 'Medium'
                        ? 'bg-sky-50 text-[#014486] border-sky-200'
                        : 'bg-[#e3f5ed] text-[#027e46] border-[#c3ebda]'
                    }`}>
                      {rec.category}
                    </span>
                  </td>

                  {/* Risk Score */}
                  <td className="py-3 px-4 font-mono font-bold">
                    <div className="flex items-center space-x-2">
                      <div className="w-12 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                        <div
                          className={`h-full ${
                            rec.riskScore > 80
                              ? 'bg-[#ba0517]'
                              : rec.riskScore > 60
                              ? 'bg-[#a04e00]'
                              : 'bg-[#027e46]'
                          }`}
                          style={{ width: `${rec.riskScore}%` }}
                        ></div>
                      </div>
                      <span className={rec.riskScore > 80 ? 'text-[#ba0517]' : 'text-slate-700'}>
                        {rec.riskScore}/100
                      </span>
                    </div>
                  </td>

                  {/* SIR Status */}
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                      rec.status === 'Marked Valid'
                        ? 'bg-[#e3f5ed] text-[#027e46] border-[#c3ebda]'
                        : rec.status === 'Flagged Duplicate'
                        ? 'bg-[#fff0c2] text-[#8c4b00] border-[#ffe399]'
                        : rec.status === 'Field Verification Assigned'
                        ? 'bg-blue-50 text-[#0176d3] border-blue-200'
                        : rec.status === 'Escalated for Hearing'
                        ? 'bg-[#fededd] text-[#ba0517] border-[#fcc2c1]'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        rec.status === 'Marked Valid' ? 'bg-[#027e46]' : rec.status === 'Flagged Duplicate' ? 'bg-[#a04e00]' : 'bg-[#0176d3]'
                      }`}></span>
                      {rec.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5" onClick={(e) => e.stopPropagation()}>
                      {isDuplicate && (
                        <button
                          onClick={() => onOpenDuplicateModal(rec)}
                          className="px-2.5 py-1 bg-[#fff0c2] hover:bg-[#ffe399] border border-[#ffe399] text-[#8c4b00] text-[11px] font-semibold rounded transition-colors flex items-center gap-1"
                          title="View Duplicate Pair Comparison"
                        >
                          <Copy className="w-3 h-3" />
                          Compare
                        </button>
                      )}

                      <button
                        onClick={() => onSelectRecord(rec)}
                        className="px-2.5 py-1 bg-[#0176d3] hover:bg-[#015ba3] text-white text-[11px] font-semibold rounded transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <Eye className="w-3 h-3" />
                        Inspect AI Analysis
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
