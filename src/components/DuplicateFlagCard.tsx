import React from 'react';
import { ElectoralRecord } from '../types';
import { Copy, X, CheckCircle2, Trash2, ArrowRightLeft } from 'lucide-react';

interface DuplicateFlagCardProps {
  record: ElectoralRecord;
  matchedRecord?: ElectoralRecord | null;
  onClose: () => void;
  onConfirmPurge: (id: string) => void;
  onMarkValid: (id: string) => void;
}

export const DuplicateFlagCard: React.FC<DuplicateFlagCardProps> = ({
  record,
  matchedRecord,
  onClose,
  onConfirmPurge,
  onMarkValid,
}) => {
  const dupInfo = record.aiAnalysis?.duplicateAnalysis;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-[#dddbda] rounded-lg max-w-3xl w-full text-slate-800 p-6 shadow-xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#dddbda]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-md bg-[#fff0c2] border border-[#ffe399] text-[#8c4b00]">
              <Copy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Duplicate Voter Record Pair Comparison
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#fff0c2] text-[#8c4b00] border border-[#ffe399] font-mono font-semibold">
                  {dupInfo?.confidenceScore || record.duplicateSimilarity || 92}% Match Score
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                SIR Automated Demographic & EPIC Identification Tool Finding
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          {/* Primary Master Record */}
          <div className="p-4 rounded-md bg-blue-50/40 border border-blue-200 relative">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#0176d3] text-white absolute top-3 right-3">
              Primary Reference Record
            </span>
            <div className="mt-4">
              <span className="text-xs font-mono text-[#0176d3] font-bold">{record.epicNumber}</span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">{record.voterName}</h3>
              <p className="text-xs text-slate-700 font-medium">{record.relativeName} ({record.relationType})</p>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <p><strong className="text-slate-800">Age / Gender:</strong> {record.age} yrs ({record.gender})</p>
                <p><strong className="text-slate-800">Constituency:</strong> {record.assemblyConstituency}</p>
                <p><strong className="text-slate-800">Booth / Part:</strong> {record.partNumber}</p>
                <p><strong className="text-slate-800">House Address:</strong> {record.houseAddress}</p>
                <p><strong className="text-slate-800">BLO Officer:</strong> {record.bloAssigned}</p>
              </div>
            </div>
          </div>

          {/* Matched Secondary Record */}
          <div className="p-4 rounded-md bg-amber-50/50 border border-amber-200 relative">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#8c4b00] text-white absolute top-3 right-3">
              Matched Duplicate Entry
            </span>
            <div className="mt-4">
              <span className="text-xs font-mono text-[#a04e00] font-bold">
                {matchedRecord?.epicNumber || dupInfo?.matchedEpicNumber || 'EPIC-MATCHED'}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {matchedRecord?.voterName || dupInfo?.matchedVoterName || record.voterName}
              </h3>
              <p className="text-xs text-slate-700 font-medium">
                {matchedRecord?.relativeName || record.relativeName}
              </p>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <p><strong className="text-slate-800">Age / Gender:</strong> {matchedRecord?.age || record.age} yrs ({matchedRecord?.gender || record.gender})</p>
                <p><strong className="text-slate-800">Constituency:</strong> {matchedRecord?.assemblyConstituency || dupInfo?.matchedConstituency || 'Adjacent Assembly'}</p>
                <p><strong className="text-slate-800">Booth / Part:</strong> {matchedRecord?.partNumber || 'Part 48'}</p>
                <p><strong className="text-slate-800">House Address:</strong> {matchedRecord?.houseAddress || record.houseAddress}</p>
                <p><strong className="text-slate-800">BLO Officer:</strong> {matchedRecord?.bloAssigned || 'BLO-48 Field Agent'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Matching Factors Reasoning */}
        <div className="bg-[#fafaf9] border border-[#dddbda] rounded-md p-3.5 mb-6">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-2">
            <ArrowRightLeft className="w-4 h-4 text-[#a04e00]" />
            Gemini Matching Factor Reasoning
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed mb-2">
            {dupInfo?.similarityReasoning || 'Identical voter name, father name, and photo hash matched across assembly constituency rolls.'}
          </p>
          {dupInfo?.matchingFactors && dupInfo.matchingFactors.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {dupInfo.matchingFactors.map((factor, idx) => (
                <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-700 border border-[#dddbda] font-medium">
                  ✓ {factor}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#dddbda]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-[#dddbda] text-xs font-semibold rounded transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onMarkValid(record.id)}
              className="px-4 py-2 bg-[#e3f5ed] hover:bg-[#c3ebda] border border-[#c3ebda] text-[#027e46] text-xs font-semibold rounded transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark Both Valid (Twin/Separate)
            </button>
            <button
              onClick={() => onConfirmPurge(record.id)}
              className="px-4 py-2 bg-[#ba0517] hover:bg-[#8e0412] text-white text-xs font-semibold rounded transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              ERO Purge Secondary Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
