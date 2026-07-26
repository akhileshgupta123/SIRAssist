import React, { useState } from 'react';
import { SIRCategory } from '../types';
import { X, Sparkles, Vote } from 'lucide-react';

interface IncidentFormModalProps {
  onClose: () => void;
  onSubmit: (data: {
    voterName: string;
    relativeName: string;
    relationType: string;
    age: number;
    gender: string;
    epicNumber: string;
    assemblyConstituency: string;
    partNumber: string;
    houseAddress: string;
    bloAssigned: string;
    category: SIRCategory;
  }) => void;
  isLoading: boolean;
}

export const IncidentFormModal: React.FC<IncidentFormModalProps> = ({
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [voterName, setVoterName] = useState('');
  const [relativeName, setRelativeName] = useState('');
  const [relationType, setRelationType] = useState('Father');
  const [age, setAge] = useState<number>(32);
  const [gender, setGender] = useState('M');
  const [epicNumber, setEpicNumber] = useState(`EPIC-WB-2026-${Math.floor(10000 + Math.random() * 90000)}`);
  const [assemblyConstituency, setAssemblyConstituency] = useState('AC-164 Kolkata South, Part 12');
  const [partNumber, setPartNumber] = useState('Part 12 (Booth 14-A)');
  const [houseAddress, setHouseAddress] = useState('12/A Sarat Bose Road, Kolkata');
  const [bloAssigned, setBloAssigned] = useState('BLO-12 (A. Banerjee)');
  const [category, setCategory] = useState<SIRCategory>('Demographic Match');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterName || !epicNumber) return;
    onSubmit({
      voterName,
      relativeName,
      relationType,
      age: Number(age),
      gender,
      epicNumber,
      assemblyConstituency,
      partNumber,
      houseAddress,
      bloAssigned,
      category,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-[#dddbda] rounded-lg max-w-xl w-full text-slate-800 p-6 shadow-xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-[#dddbda]">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-md bg-blue-50 border border-blue-200 text-[#0176d3]">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Ingest Voter Record into SIR Draft Roll</h2>
              <p className="text-xs text-slate-500">Triggers Gemini AI Tool Analysis & SQLite duplicate detection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 my-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Voter Full Name *</label>
              <input
                type="text"
                required
                value={voterName}
                onChange={(e) => setVoterName(e.target.value)}
                placeholder="e.g. Ramesh Chandra Sharma"
                className="w-full bg-white border border-[#dddbda] rounded-md p-2 text-xs text-slate-800 focus:outline-none focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">EPIC Registration ID *</label>
              <input
                type="text"
                required
                value={epicNumber}
                onChange={(e) => setEpicNumber(e.target.value)}
                className="w-full bg-white border border-[#dddbda] rounded-md p-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Father / Relative Name</label>
              <input
                type="text"
                value={relativeName}
                onChange={(e) => setRelativeName(e.target.value)}
                placeholder="Relative name"
                className="w-full bg-white border border-[#dddbda] rounded-md p-2 text-xs text-slate-800 focus:outline-none focus:border-[#0176d3]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-white border border-[#dddbda] rounded-md p-2 text-xs text-slate-800 focus:outline-none focus:border-[#0176d3]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-white border border-[#dddbda] rounded-md p-2 text-xs text-slate-800 focus:outline-none focus:border-[#0176d3]"
              >
                <option value="M">Male (M)</option>
                <option value="F">Female (F)</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Assembly Constituency</label>
              <input
                type="text"
                value={assemblyConstituency}
                onChange={(e) => setAssemblyConstituency(e.target.value)}
                className="w-full bg-white border border-[#dddbda] rounded-md p-2 text-xs text-slate-800 focus:outline-none focus:border-[#0176d3]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Anomaly Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SIRCategory)}
                className="w-full bg-white border border-[#dddbda] rounded-md p-2 text-xs text-slate-800 focus:outline-none focus:border-[#0176d3]"
              >
                <option value="Demographic Match">Demographic Match</option>
                <option value="EPIC ID Anomaly">EPIC ID Anomaly</option>
                <option value="Photo Hash Duplicate">Photo Hash Duplicate</option>
                <option value="Bulk Address Cluster">Bulk Address Cluster</option>
                <option value="Age/Relative Mismatch">Age/Relative Mismatch</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">House Address</label>
            <textarea
              value={houseAddress}
              onChange={(e) => setHouseAddress(e.target.value)}
              rows={2}
              className="w-full bg-white border border-[#dddbda] rounded-md p-2 text-xs text-slate-800 focus:outline-none focus:border-[#0176d3]"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#dddbda]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-[#dddbda] text-xs font-semibold rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-[#0176d3] hover:bg-[#015ba3] text-white text-xs font-semibold rounded transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isLoading ? 'Running Gemini AI Audit...' : 'Run SIR Verification & Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
