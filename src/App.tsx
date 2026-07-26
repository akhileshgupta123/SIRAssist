import React, { useState, useEffect } from 'react';
import { ElectoralRecord, ReviewAction, DashboardStats, SampleScenario, SIRStatus, SIRCategory } from './types';
import { Header } from './components/Header';
import { LoginScreen, UserSession } from './components/LoginScreen';
import { OfficerProfileBanner } from './components/OfficerProfileBanner';
import { DashboardStatsCards } from './components/DashboardStatsCards';
import { ScenarioPicker } from './components/ScenarioPicker';
import { IncidentFilterBar } from './components/IncidentFilterBar';
import { IncidentListTable } from './components/IncidentListTable';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { DuplicateFlagCard } from './components/DuplicateFlagCard';
import { IncidentFormModal } from './components/IncidentFormModal';
import { UploadVoterListModal } from './components/UploadVoterListModal';
import { PythonInspectorModal } from './components/PythonInspectorModal';
import { PromptLabTab } from './components/PromptLabTab';
import { FieldVerificationTab } from './components/FieldVerificationTab';
import { Sparkles, Layers, Database, ShieldCheck, Cpu, Code, Vote, CheckCircle2, AlertTriangle } from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('sir_officer_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default logged in officer session for instant accessibility, or null if requested login flow
    return {
      name: 'A. K. Sharma, IAS',
      role: 'Electoral Registration Officer (ERO)',
      email: 'ero.kolkata@eci.gov.in',
      constituency: 'AC-164 Kolkata South',
      officerId: 'ERO-WB-2026-01'
    };
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'records' | 'field-verification' | 'prompt-lab' | 'python-inspector'>('dashboard');
  
  const [records, setRecords] = useState<ElectoralRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalIncidents: 0,
    pendingReviews: 0,
    flaggedDuplicates: 0,
    criticalRisks: 0,
    approvedResolved: 0,
    aiAvgConfidence: 96,
  });
  const [scenarios, setScenarios] = useState<SampleScenario[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isDuplicateOnly, setIsDuplicateOnly] = useState(false);

  // Modals
  const [selectedRecord, setSelectedRecord] = useState<ElectoralRecord | null>(null);
  const [reviewActions, setReviewActions] = useState<ReviewAction[]>([]);
  const [duplicateModalRecord, setDuplicateModalRecord] = useState<ElectoralRecord | null>(null);
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isAuditing, setIsAuditing] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Build query string
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('search', searchQuery);
      if (severityFilter !== 'All') queryParams.append('severity', severityFilter);
      if (statusFilter !== 'All') queryParams.append('status', statusFilter);
      if (categoryFilter !== 'All') queryParams.append('category', categoryFilter);
      if (isDuplicateOnly) queryParams.append('isDuplicateOnly', 'true');

      const [recRes, statsRes, scenRes] = await Promise.all([
        fetch(`/api/incidents?${queryParams.toString()}`),
        fetch('/api/stats'),
        fetch('/api/scenarios')
      ]);

      const recData = await recRes.json();
      const statsData = await statsRes.json();
      const scenData = await scenRes.json();

      if (recData.success) setRecords(recData.incidents || []);
      if (statsData.success) setStats(statsData.stats);
      if (scenData.success) setScenarios(scenData.scenarios || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, categoryFilter, severityFilter, statusFilter, isDuplicateOnly]);

  // Fetch record detail with audit history
  const handleSelectRecord = async (record: ElectoralRecord) => {
    try {
      const res = await fetch(`/api/incidents/${record.id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedRecord(data.record || record);
        setReviewActions(data.reviewActions || []);
      } else {
        setSelectedRecord(record);
        setReviewActions([]);
      }
    } catch (e) {
      setSelectedRecord(record);
      setReviewActions([]);
    }
  };

  // Run Batch Audit
  const handleRunBatchAudit = async () => {
    setIsAuditing(true);
    setTimeout(() => {
      fetchData();
      setIsAuditing(false);
    }, 1200);
  };

  // Handle Scenario Select Simulation
  const handleSelectScenario = async (scen: SampleScenario) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/incidents/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voterName: scen.voterName,
          relativeName: 'Kailash Sharma',
          epicNumber: scen.epicNumber,
          assemblyConstituency: scen.constituency,
          category: scen.category,
          houseAddress: '18/1 SC Mullick Road, Jadavpur',
          age: 42,
          gender: 'M',
        })
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
        if (data.record) {
          handleSelectRecord(data.record);
        }
      }
    } catch (e) {
      console.error('Scenario simulation failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Ingest New Voter Record
  const handleCreateRecord = async (newVoter: {
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
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/incidents/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVoter)
      });
      const data = await res.json();
      if (data.success) {
        setIsNewRecordModalOpen(false);
        await fetchData();
        if (data.record) {
          handleSelectRecord(data.record);
        }
      }
    } catch (e) {
      console.error('Record creation failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Review Action Submit
  const handleSubmitReview = async (
    actionType: ReviewAction['actionType'],
    newStatus: SIRStatus,
    notes: string
  ) => {
    if (!selectedRecord) return;
    try {
      const res = await fetch(`/api/incidents/${selectedRecord.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType,
          newStatus,
          notes,
          reviewerName: 'Electoral Registration Officer (ERO)',
          reviewerRole: 'Electoral Registration Officer (ERO)'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedRecord(null);
        await fetchData();
      }
    } catch (e) {
      console.error('Review submission failed:', e);
    }
  };

  // Purge / Mark Valid from Duplicate Modal
  const handleConfirmPurge = async (id: string) => {
    try {
      await fetch(`/api/incidents/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'Purged',
          newStatus: 'Purged / Deleted',
          notes: 'ERO confirmed duplicate record and ordered deletion under Section 22.',
          reviewerName: 'ERO Officer',
          reviewerRole: 'Electoral Registration Officer (ERO)'
        })
      });
      setDuplicateModalRecord(null);
      await fetchData();
    } catch (e) {
      console.error('Purge failed:', e);
    }
  };

  const handleMarkValid = async (id: string) => {
    try {
      await fetch(`/api/incidents/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'Marked Valid',
          newStatus: 'Marked Valid',
          notes: 'ERO confirmed valid separate registration after BLO door-to-door audit.',
          reviewerName: 'ERO Officer',
          reviewerRole: 'Electoral Registration Officer (ERO)'
        })
      });
      setDuplicateModalRecord(null);
      await fetchData();
    } catch (e) {
      console.error('Mark valid failed:', e);
    }
  };

  const handleLoginSuccess = (user: UserSession) => {
    setCurrentUser(user);
    localStorage.setItem('sir_officer_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sir_officer_session');
  };

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#f3f3f2] text-slate-800 font-sans selection:bg-[#0176d3] selection:text-white">
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewRecordModal={() => setIsNewRecordModalOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onRunBatchAudit={handleRunBatchAudit}
        isAuditing={isAuditing}
        dbStatus={true}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Logged In Officer User Details Banner */}
        <OfficerProfileBanner currentUser={currentUser} onLogout={handleLogout} />

        {/* Top Stats Cards */}
        <DashboardStatsCards
          stats={stats}
          activeFilter={statusFilter}
          onFilterChange={(f) => setStatusFilter(f)}
        />

        {/* Tab View Switcher */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Simulation Scenario Picker */}
            <ScenarioPicker
              scenarios={scenarios}
              onSelectScenario={handleSelectScenario}
              isLoading={isLoading}
            />

            {/* Main Viewport & Sidebar Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Sidebar: Gemini SIR Verification Flow */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white border border-[#dddbda] rounded-lg p-4 text-slate-800 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#0176d3]" />
                    Gemini SIR Verification Flow
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-start space-x-2.5">
                      <div className="w-5 h-5 rounded-full bg-blue-50 text-[#0176d3] border border-blue-200 flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">
                        1
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">Roll Batch Parsing</p>
                        <p className="text-[11px] text-slate-500">Draft roll CSV/database ingestion & EPIC ID validation</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2.5">
                      <div className="w-5 h-5 rounded-full bg-blue-50 text-[#0176d3] border border-blue-200 flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">
                        2
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">Demographic & Photo Match</p>
                        <p className="text-[11px] text-slate-500">Gemini tool checks for cross-constituency duplicate voters</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2.5">
                      <div className="w-5 h-5 rounded-full bg-blue-50 text-[#0176d3] border border-blue-200 flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">
                        3
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">BLO Field Verification</p>
                        <p className="text-[11px] text-slate-500">Door-to-door physical audit dispatched to Booth Officer</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2.5">
                      <div className="w-5 h-5 rounded-full bg-blue-50 text-[#0176d3] border border-blue-200 flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">
                        4
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">ERO Decisioning</p>
                        <p className="text-[11px] text-slate-500">Electoral Registration Officer marks valid or purges duplicate</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#dddbda] rounded-lg p-4 text-slate-800 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#027e46]" />
                    ECI Guidelines Enforced
                  </h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Compliant with Electoral Roll Rules, Section 17 (Prohibition of Dual Registration) and Section 22 (Revision Hearings).
                  </p>
                </div>
              </div>

              {/* Right Main Table Viewport */}
              <div className="lg:col-span-3">
                <IncidentFilterBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  categoryFilter={categoryFilter}
                  onCategoryChange={setCategoryFilter}
                  severityFilter={severityFilter}
                  onSeverityChange={setSeverityFilter}
                  statusFilter={statusFilter}
                  onStatusChange={setStatusFilter}
                  isDuplicateOnly={isDuplicateOnly}
                  onToggleDuplicateOnly={setIsDuplicateOnly}
                  onRefresh={fetchData}
                  totalCount={records.length}
                />

                <IncidentListTable
                  records={records}
                  onSelectRecord={handleSelectRecord}
                  onOpenDuplicateModal={(rec) => setDuplicateModalRecord(rec)}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab View: Electoral Records Table Only */}
        {activeTab === 'records' && (
          <div>
            <IncidentFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              severityFilter={severityFilter}
              onSeverityChange={setSeverityFilter}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              isDuplicateOnly={isDuplicateOnly}
              onToggleDuplicateOnly={setIsDuplicateOnly}
              onRefresh={fetchData}
              totalCount={records.length}
            />

            <IncidentListTable
              records={records}
              onSelectRecord={handleSelectRecord}
              onOpenDuplicateModal={(rec) => setDuplicateModalRecord(rec)}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Tab View: BLO Field Queue */}
        {activeTab === 'field-verification' && (
          <FieldVerificationTab
            records={records}
            onSelectRecord={handleSelectRecord}
          />
        )}

        {/* Tab View: Gemini Prompt Lab */}
        {activeTab === 'prompt-lab' && <PromptLabTab />}

        {/* Tab View: Python Code Inspector */}
        {activeTab === 'python-inspector' && <PythonInspectorModal isStandaloneTab={true} />}
      </main>

      {/* Modals */}
      {selectedRecord && (
        <IncidentDetailModal
          record={selectedRecord}
          reviewActions={reviewActions}
          onClose={() => setSelectedRecord(null)}
          onSubmitReview={handleSubmitReview}
        />
      )}

      {duplicateModalRecord && (
        <DuplicateFlagCard
          record={duplicateModalRecord}
          onClose={() => setDuplicateModalRecord(null)}
          onConfirmPurge={handleConfirmPurge}
          onMarkValid={handleMarkValid}
        />
      )}

      {isNewRecordModalOpen && (
        <IncidentFormModal
          onClose={() => setIsNewRecordModalOpen(false)}
          onSubmit={handleCreateRecord}
          isLoading={isLoading}
        />
      )}

      {isUploadModalOpen && (
        <UploadVoterListModal
          onClose={() => setIsUploadModalOpen(false)}
          onBatchSuccess={fetchData}
        />
      )}
    </div>
  );
}

export default App;
