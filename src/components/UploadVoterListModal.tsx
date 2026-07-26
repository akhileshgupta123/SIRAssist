import React, { useState } from 'react';
import { X, Upload, FileText, Sparkles, Download } from 'lucide-react';

interface UploadVoterListModalProps {
  onClose: () => void;
  onBatchSuccess: () => void;
}

export const UploadVoterListModal: React.FC<UploadVoterListModalProps> = ({
  onClose,
  onBatchSuccess,
}) => {
  const [fileContent, setFileContent] = useState<string>('');
  const [parsedRecords, setParsedRecords] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Sample CSV template
  const sampleCsvData = `voterName,epicNumber,relativeName,age,gender,assemblyConstituency,houseAddress,category
Subhash Bose,EPIC-WB-2026-99011,Janki Nath Bose,48,M,AC-164 Kolkata South,38/1 Elgin Road Kolkata,Demographic Match
Pratima Sen,EPIC-WB-2026-99022,Anil Sen,34,F,AC-164 Kolkata South,14 Rashbehari Ave,Photo Hash Duplicate
Kushal Mukherjee,EPIC-WB-2026-99033,Manish Mukherjee,52,M,AC-165 Jadavpur,88 SC Mullick Road,Bulk Address Cluster`;

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_electoral_roll_ingest.csv';
    a.click();
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map((h) => h.trim());

    const result = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(',').map((v) => v.trim());
      const row: any = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });
      result.push(row);
    }
    return result;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text);
      if (file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(text);
          setParsedRecords(Array.isArray(parsed) ? parsed : [parsed]);
        } catch (err) {
          setUploadStatus('Invalid JSON format');
        }
      } else {
        const rows = parseCSV(text);
        setParsedRecords(rows);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSampleData = () => {
    setFileContent(sampleCsvData);
    const rows = parseCSV(sampleCsvData);
    setParsedRecords(rows);
  };

  const handleSubmitBatch = async () => {
    if (parsedRecords.length === 0) return;
    setIsProcessing(true);
    setUploadStatus('Ingesting voter list & running Gemini 3.6 Flash duplicate audit...');

    try {
      const res = await fetch('/api/incidents/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: parsedRecords }),
      });
      const data = await res.json();
      if (data.success) {
        setUploadStatus(`Successfully ingested ${data.count} electoral records!`);
        setTimeout(() => {
          onBatchSuccess();
          onClose();
        }, 1200);
      } else {
        setUploadStatus(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setUploadStatus(`Failed to upload: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-[#dddbda] rounded-lg max-w-2xl w-full text-slate-800 p-6 shadow-xl relative space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#dddbda]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-md bg-blue-50 border border-blue-200 text-[#0176d3]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Upload Voter Roll List (CSV / JSON)</h2>
              <p className="text-xs text-slate-500">
                Batch ingest draft electoral rolls for automated Gemini duplicate & anomaly audit
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

        {/* Drag and Drop Zone */}
        <div className="border-2 border-dashed border-[#dddbda] hover:border-[#0176d3] rounded-md p-6 text-center bg-slate-50/60 transition-all space-y-3">
          <FileText className="w-8 h-8 text-[#0176d3] mx-auto" />
          <div>
            <label className="cursor-pointer text-xs font-bold text-[#0176d3] hover:underline">
              Click to select a CSV / JSON File
              <input
                type="file"
                accept=".csv, .json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <p className="text-[11px] text-slate-500 mt-0.5">Supports CSV or JSON electoral roll exports</p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleLoadSampleData}
              className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs rounded border border-[#dddbda] font-semibold transition-colors"
            >
              Load Sample Test CSV
            </button>
            <button
              onClick={handleDownloadSample}
              className="px-3 py-1 text-slate-600 hover:text-slate-900 text-xs flex items-center gap-1 font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV Template
            </button>
          </div>
        </div>

        {/* Parsed Preview Table */}
        {parsedRecords.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-bold text-slate-800">
                Parsed Preview ({parsedRecords.length} records ready for SIR verification)
              </span>
            </div>

            <div className="bg-white border border-[#dddbda] rounded-md p-2 max-h-40 overflow-y-auto text-xs font-mono">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-[#dddbda] text-slate-500 font-sans">
                    <th className="p-1">Name</th>
                    <th className="p-1">EPIC</th>
                    <th className="p-1">Relative</th>
                    <th className="p-1">Age</th>
                    <th className="p-1">Constituency</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRecords.slice(0, 5).map((r, i) => (
                    <tr key={i} className="border-b border-slate-100 text-slate-700">
                      <td className="p-1 font-medium">{r.voterName || r['Voter Name'] || r.name}</td>
                      <td className="p-1 text-[#0176d3] font-bold">{r.epicNumber || r['EPIC Number'] || r.epic}</td>
                      <td className="p-1">{r.relativeName || r['Father/Relative Name'] || r.relative}</td>
                      <td className="p-1">{r.age}</td>
                      <td className="p-1">{r.assemblyConstituency || r['Assembly Constituency'] || r.constituency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Status indicator */}
        {uploadStatus && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-[#0176d3] flex items-center gap-2 font-medium">
            <Sparkles className="w-4 h-4 text-[#0176d3] animate-spin" />
            <span>{uploadStatus}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#dddbda]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-[#dddbda] text-xs font-semibold rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitBatch}
            disabled={parsedRecords.length === 0 || isProcessing}
            className="px-4 py-2 bg-[#0176d3] hover:bg-[#015ba3] text-white text-xs font-semibold rounded transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {isProcessing ? 'Auditing Batch...' : `Ingest ${parsedRecords.length} Records with Gemini AI`}
          </button>
        </div>
      </div>
    </div>
  );
};
