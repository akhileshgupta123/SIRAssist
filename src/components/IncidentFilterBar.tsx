import React from 'react';
import { Search, Filter, RefreshCw, Copy, CheckCircle2 } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryFilter: string;
  onCategoryChange: (category: string) => void;
  severityFilter: string;
  onSeverityChange: (severity: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  isDuplicateOnly: boolean;
  onToggleDuplicateOnly: (val: boolean) => void;
  onRefresh: () => void;
  totalCount: number;
}

export const IncidentFilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  severityFilter,
  onSeverityChange,
  statusFilter,
  onStatusChange,
  isDuplicateOnly,
  onToggleDuplicateOnly,
  onRefresh,
  totalCount,
}) => {
  return (
    <div className="bg-white border border-[#dddbda] rounded-lg p-3.5 mb-4 text-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
      {/* Search Input */}
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search EPIC, Voter Name, AC, Address..."
          className="w-full bg-white border border-[#dddbda] rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] transition-colors"
        />
      </div>

      {/* Select Filters */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        {/* Category */}
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="bg-white border border-[#dddbda] rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-[#0176d3] font-medium"
        >
          <option value="All">All Categories</option>
          <option value="Demographic Match">Demographic Match</option>
          <option value="EPIC ID Anomaly">EPIC ID Anomaly</option>
          <option value="Photo Hash Duplicate">Photo Hash Duplicate</option>
          <option value="Bulk Address Cluster">Bulk Address Cluster</option>
          <option value="Age/Relative Mismatch">Age/Relative Mismatch</option>
        </select>

        {/* Anomaly Severity */}
        <select
          value={severityFilter}
          onChange={(e) => onSeverityChange(e.target.value)}
          className="bg-white border border-[#dddbda] rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-[#0176d3] font-medium"
        >
          <option value="All">All Anomaly Levels</option>
          <option value="Critical">Critical Risk</option>
          <option value="High">High Anomaly</option>
          <option value="Medium">Medium Anomaly</option>
          <option value="Low">Low / Valid</option>
        </select>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="bg-white border border-[#dddbda] rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-[#0176d3] font-medium"
        >
          <option value="All">All Statuses</option>
          <option value="Pending ERO Review">Pending ERO Review</option>
          <option value="Field Verification Assigned">Field Verification Assigned</option>
          <option value="Flagged Duplicate">Flagged Duplicate</option>
          <option value="Escalated for Hearing">Escalated for Hearing</option>
          <option value="Marked Valid">Marked Valid</option>
          <option value="Purged / Deleted">Purged / Deleted</option>
        </select>

        {/* Toggle Duplicates Only */}
        <button
          onClick={() => onToggleDuplicateOnly(!isDuplicateOnly)}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all flex items-center gap-1.5 ${
            isDuplicateOnly
              ? 'bg-[#fff0c2] border-[#ffe399] text-[#8c4b00] shadow-2xs'
              : 'bg-white border-[#dddbda] text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Copy className="w-3.5 h-3.5" />
          Duplicates Only
        </button>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          className="p-1.5 bg-white border border-[#dddbda] hover:bg-slate-50 rounded-md text-slate-600 hover:text-slate-900 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        <span className="text-xs text-slate-500 font-mono ml-1">
          Showing {totalCount} records
        </span>
      </div>
    </div>
  );
};
