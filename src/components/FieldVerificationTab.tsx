import React from 'react';
import { ElectoralRecord } from '../types';
import { ClipboardList, MapPin } from 'lucide-react';

interface FieldVerificationTabProps {
  records: ElectoralRecord[];
  onSelectRecord: (record: ElectoralRecord) => void;
}

export const FieldVerificationTab: React.FC<FieldVerificationTabProps> = ({
  records,
  onSelectRecord,
}) => {
  const pendingField = records.filter(
    (r) => r.status === 'Field Verification Assigned' || r.status === 'Pending ERO Review' || r.isDuplicate
  );

  return (
    <div className="bg-white border border-[#dddbda] rounded-lg p-6 text-slate-800 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#dddbda]">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-md bg-sky-50 border border-sky-200 text-[#014486]">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Booth Level Officer (BLO) Door-to-Door Queue</h2>
            <p className="text-xs text-slate-500">Manage field inspection tasks, geo-verified documents, and ERO escalation reports</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-sky-50 text-[#014486] border border-sky-200">
          {pendingField.length} Active Field Tasks
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pendingField.map((rec) => (
          <div
            key={rec.id}
            onClick={() => onSelectRecord(rec)}
            className="p-4 bg-white border border-[#dddbda] hover:border-[#0176d3] hover:shadow-md rounded-md transition-all cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#0176d3]">{rec.epicNumber}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                rec.anomalySeverity === 'Critical'
                  ? 'bg-[#fededd] text-[#ba0517] border-[#fcc2c1]'
                  : 'bg-[#fff0c2] text-[#8c4b00] border-[#ffe399]'
              }`}>
                {rec.anomalySeverity}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">{rec.voterName}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{rec.relativeName} ({rec.relationType})</p>
            </div>

            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded border border-[#dddbda]">
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#0176d3] shrink-0" />
                <span className="truncate">{rec.houseAddress}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {rec.assemblyConstituency} • {rec.bloAssigned}
              </div>
            </div>

            <div className="pt-2 border-t border-[#dddbda] flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">SLA: {rec.aiAnalysis?.targetSLAHours || 24}h</span>
              <span className="text-[#0176d3] font-bold text-[11px] flex items-center gap-1">
                Field Audit <span className="text-slate-400">→</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
