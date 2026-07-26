import React, { useState } from 'react';
import { ElectoralRecord, ReviewAction, SIRStatus } from '../types';
import { X, Sparkles, ClipboardList, Clock, ShieldAlert, CheckCircle2, AlertTriangle, Send, UserCheck, Trash2, ArrowUpRight } from 'lucide-react';

interface IncidentDetailModalProps {
  record: ElectoralRecord | null;
  reviewActions: ReviewAction[];
  onClose: () => void;
  onSubmitReview: (actionType: ReviewAction['actionType'], newStatus: SIRStatus, notes: string) => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  record,
  reviewActions,
  onClose,
  onSubmitReview,
}) => {
  const [notes, setNotes] = useState('');

  if (!record) return null;

  const ai = record.aiAnalysis;

  const handleAction = (status: SIRStatus, actionType: ReviewAction['actionType']) => {
    onSubmitReview(actionType, status, notes || `Action ${actionType} recorded by ERO officer.`);
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#dddbda] rounded-lg max-w-4xl w-full text-slate-800 p-6 shadow-xl relative my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#dddbda]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-[#0176d3] px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                {record.epicNumber}
              </span>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                record.anomalySeverity === 'Critical'
                  ? 'bg-[#fededd] text-[#ba0517] border-[#fcc2c1]'
                  : record.anomalySeverity === 'High'
                  ? 'bg-[#fff0c2] text-[#8c4b00] border-[#ffe399]'
                  : 'bg-sky-50 text-[#014486] border-sky-200'
              }`}>
                {record.category} ({record.anomalySeverity} Anomaly)
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Risk Score: {record.riskScore}/100
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-2">{record.voterName}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Relative: <strong className="text-slate-800">{record.relativeName} ({record.relationType})</strong> | Age: {record.age} yrs | Gender: {record.gender} | {record.assemblyConstituency}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6">
          {/* Left 2 Cols: AI Findings & Checklists */}
          <div className="lg:col-span-2 space-y-4">
            {/* Executive Summary Card */}
            <div className="p-4 rounded-md bg-blue-50/50 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2 text-xs font-bold text-[#0176d3]">
                <Sparkles className="w-4 h-4 text-[#0176d3]" />
                Gemini 3.6 Flash SIR Verification Findings
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {ai?.executiveSummary || 'Voter record ingested into draft electoral roll. Automated duplicate and demographic integrity audit active.'}
              </p>
            </div>

            {/* ECI Regulatory Guideline & Root Causes */}
            <div className="p-4 rounded-md bg-white border border-[#dddbda] space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                ECI Guideline & Risk Assessment
              </h3>
              <p className="text-xs text-[#8c4b00] font-mono bg-[#fff0c2]/50 p-2 rounded border border-[#ffe399]">
                {ai?.regulatoryGuideline || 'ECI SIR Manual Section 18 - Standard Compliance'}
              </p>

              <div>
                <h4 className="text-[11px] font-bold text-slate-600 mb-1">Identified Anomaly Factors:</h4>
                <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                  {ai?.rootCauseFactors?.map((f, i) => (
                    <li key={i}>{f}</li>
                  )) || <li>No severe anomalies detected.</li>}
                </ul>
              </div>
            </div>

            {/* BLO Field Verification Checklist */}
            <div className="p-4 rounded-md bg-white border border-[#dddbda]">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#027e46]" />
                BLO Door-to-Door Verification Checklist
              </h3>
              <div className="space-y-2">
                {ai?.bloVerificationChecklist?.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700 bg-slate-50 p-2 rounded border border-[#dddbda]">
                    <span className="text-[#027e46] font-bold mt-0.5">✓</span>
                    <span>{item}</span>
                  </div>
                )) || <p className="text-xs text-slate-500">Standard field verification checklist assigned.</p>}
              </div>
            </div>
          </div>

          {/* Right Col: Timeline & ERO Action Form */}
          <div className="space-y-4">
            {/* Record Status Panel */}
            <div className="p-4 rounded-md bg-white border border-[#dddbda]">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Current SIR Status</span>
              <div className="text-sm font-bold text-[#0176d3] mt-1">{record.status}</div>
              <p className="text-[11px] text-slate-500 mt-1">Assigned: {record.bloAssigned}</p>
            </div>

            {/* Timeline Log */}
            <div className="p-4 rounded-md bg-white border border-[#dddbda] max-h-56 overflow-y-auto">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                SIR Audit History Trail
              </h3>
              <div className="space-y-3">
                {reviewActions.map((act) => (
                  <div key={act.id} className="text-xs border-l-2 border-[#0176d3] pl-3 py-0.5">
                    <div className="font-semibold text-slate-800">{act.actionType}</div>
                    <p className="text-slate-600 text-[11px]">{act.notes}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{act.createdAt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ERO Decision Form */}
            <div className="p-4 rounded-md bg-white border border-[#dddbda] space-y-3">
              <h3 className="text-xs font-bold text-slate-800">ERO Decision & Action Log</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter ERO verification notes / hearing remarks..."
                rows={2}
                className="w-full bg-white border border-[#dddbda] rounded-md p-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3]"
              />

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleAction('Marked Valid', 'Marked Valid')}
                  className="px-2.5 py-1.5 bg-[#027e46] hover:bg-[#025e34] text-white text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1 shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark Valid
                </button>
                <button
                  onClick={() => handleAction('Flagged Duplicate', 'Flagged Duplicate')}
                  className="px-2.5 py-1.5 bg-[#dd7a01] hover:bg-[#a04e00] text-white text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1 shadow-2xs"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Flag Dup
                </button>
                <button
                  onClick={() => handleAction('Escalated for Hearing', 'Escalated Hearing')}
                  className="px-2.5 py-1.5 bg-[#ba0517] hover:bg-[#8e0412] text-white text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1 col-span-2 shadow-2xs"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Escalate ERO Hearing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
