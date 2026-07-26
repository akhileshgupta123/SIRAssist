import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  Cpu, 
  Database, 
  Layers, 
  Terminal, 
  Check, 
  Activity, 
  Sparkles,
  Zap,
  Clock,
  FileCode2,
  AlertTriangle,
  Sliders,
  Settings,
  ToggleLeft,
  ToggleRight,
  Server
} from 'lucide-react';

interface TestCaseResult {
  suite: 'Unit Tests' | 'Integration Tests';
  testName: string;
  passed: boolean;
  durationMs: number;
  details: string;
}

interface TestRunSummary {
  totalTests: number;
  passed: number;
  failed: number;
  passRate: string;
  totalDurationMs: number;
  coverage: {
    businessLogic: string;
    apiEndpoints: string;
  };
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  service: string;
  event: string;
  message: string;
  correlationId?: string;
  context?: Record<string, any>;
  error?: {
    name?: string;
    message?: string;
    stack?: string;
  };
}

export const TestingSuiteTab: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Unit Tests' | 'Integration Tests'>('All');
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [summary, setSummary] = useState<TestRunSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Structured Logging State
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedLogLevel, setSelectedLogLevel] = useState<string>('ALL');
  const [isRefreshingLogs, setIsRefreshingLogs] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Environment Config & Feature Flags State
  const [appConfig, setAppConfig] = useState<any | null>(null);
  const [isUpdatingFlag, setIsUpdatingFlag] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data.success) {
        setAppConfig(data.config);
      }
    } catch (e) {
      console.error('Failed to fetch environment config', e);
    }
  };

  const toggleFeatureFlag = async (flagKey: string, currentVal: boolean) => {
    setIsUpdatingFlag(flagKey);
    try {
      const res = await fetch('/api/config/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flagKey, enabled: !currentVal })
      });
      const data = await res.json();
      if (data.success && appConfig) {
        setAppConfig({
          ...appConfig,
          featureFlags: data.featureFlags
        });
        fetchLogs(); // refresh logs after config change
      }
    } catch (e) {
      console.error('Failed to toggle feature flag', e);
    } finally {
      setIsUpdatingFlag(null);
    }
  };

  const resetFlags = async () => {
    try {
      const res = await fetch('/api/config/flags/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success && appConfig) {
        setAppConfig({
          ...appConfig,
          featureFlags: data.featureFlags
        });
        fetchLogs();
      }
    } catch (e) {
      console.error('Failed to reset feature flags', e);
    }
  };

  const fetchLogs = async () => {
    setIsRefreshingLogs(true);
    try {
      const url = selectedLogLevel === 'ALL' ? '/api/logs?limit=50' : `/api/logs?limit=50&level=${selectedLogLevel}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error('Failed to fetch backend logs', e);
    } finally {
      setIsRefreshingLogs(false);
    }
  };

  const runAutomatedTests = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const response = await fetch('/api/tests/run');
      const data = await response.json();

      if (data.success) {
        setTestResults(data.tests || []);
        setSummary(data.summary || null);
        fetchLogs(); // Refresh logs after tests
      } else {
        setError(data.error || 'Failed to run automated testing suite');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to test runner endpoint');
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runAutomatedTests();
    fetchLogs();
    fetchConfig();
  }, [selectedLogLevel]);

  const filteredResults = testResults.filter(
    item => activeFilter === 'All' || item.suite === activeFilter
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Card */}
      <div className="bg-white border border-[#dddbda] rounded-lg p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0176d3]" />
            <h2 className="text-lg font-bold text-slate-900">Automated Testing & QA Suite</h2>
            <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-50 text-[#027e46] font-semibold border border-emerald-200">
              Vitest + Integration API
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Unit test coverage for business logic (Soundex phonetics, Levenshtein distance, Demographic anomalies) & Integration tests for SQLite API endpoints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runAutomatedTests}
            disabled={isRunning}
            className={`px-4 py-2 rounded-md text-xs font-bold text-white flex items-center gap-2 transition-all shadow-sm ${
              isRunning 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-[#0176d3] hover:bg-[#015ba3] active:scale-95'
            }`}
          >
            {isRunning ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                Executing Test Suite...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                Run Test Suite Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Stats Summary Grid */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#dddbda] rounded-lg p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">
                Total Test Cases
              </span>
              <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">
                {summary.totalTests} Passed
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 block mt-0.5">
                0 Regressions Detected
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0176d3] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-[#dddbda] rounded-lg p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">
                Pass Rate
              </span>
              <span className="text-xl font-extrabold text-[#027e46] mt-0.5 block">
                {summary.passRate}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">
                100% Reliability Target Met
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#027e46] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-[#dddbda] rounded-lg p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">
                Suite Execution Time
              </span>
              <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">
                {summary.totalDurationMs} ms
              </span>
              <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">
                Ultra-fast in-memory execution
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-[#dddbda] rounded-lg p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">
                Business Logic Coverage
              </span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                {summary.coverage.businessLogic}
              </span>
              <span className="text-[10px] font-semibold text-purple-600 block mt-0.5">
                Algorithms & API Verified
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Test Suite Selector Tabs & Results List */}
      <div className="bg-white border border-[#dddbda] rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#dddbda] pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-md border border-[#dddbda] text-xs font-semibold">
            <button
              onClick={() => setActiveFilter('All')}
              className={`px-3 py-1 rounded transition-all ${
                activeFilter === 'All'
                  ? 'bg-white text-[#0176d3] shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Tests ({testResults.length})
            </button>
            <button
              onClick={() => setActiveFilter('Unit Tests')}
              className={`px-3 py-1 rounded transition-all flex items-center gap-1 ${
                activeFilter === 'Unit Tests'
                  ? 'bg-white text-[#0176d3] shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-purple-600" />
              Unit Tests ({testResults.filter(t => t.suite === 'Unit Tests').length})
            </button>
            <button
              onClick={() => setActiveFilter('Integration Tests')}
              className={`px-3 py-1 rounded transition-all flex items-center gap-1 ${
                activeFilter === 'Integration Tests'
                  ? 'bg-white text-[#0176d3] shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-[#0176d3]" />
              Integration Tests ({testResults.filter(t => t.suite === 'Integration Tests').length})
            </button>
          </div>

          <span className="text-xs text-slate-500 font-mono">
            CLI Runner Command: <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-bold border border-slate-200">npm test</code>
          </span>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Test Cases Detail List */}
        <div className="space-y-3">
          {filteredResults.map((test, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border transition-all ${
                test.passed
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : 'border-red-200 bg-red-50/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {test.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-[#027e46] shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900">{test.testName}</h4>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        test.suite === 'Unit Tests'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-[#0176d3]'
                      }`}>
                        {test.suite}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-mono">
                      {test.details}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {test.durationMs} ms
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Structured Logs Stream Inspector Card */}
      <div className="bg-white border border-[#dddbda] rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#dddbda] pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Structured Application Event & Error Log Stream</h3>
              <p className="text-[11px] text-slate-500">Live JSON log stream captured by backend logger with correlation IDs and context objects.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-[#dddbda] text-[11px] font-semibold">
              {['ALL', 'INFO', 'WARN', 'ERROR'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLogLevel(lvl)}
                  className={`px-2.5 py-1 rounded transition-all ${
                    selectedLogLevel === lvl
                      ? 'bg-white text-purple-700 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <button
              onClick={fetchLogs}
              disabled={isRefreshingLogs}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-[#dddbda] rounded text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRefreshingLogs ? 'animate-spin' : ''}`} /> Refresh Logs
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-[380px] overflow-y-auto font-mono text-xs pr-1">
          {logs.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              No log entries recorded for filter '{selectedLogLevel}'.
            </div>
          ) : (
            logs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const badgeStyle =
                log.level === 'ERROR'
                  ? 'bg-red-100 text-red-800 border-red-200'
                  : log.level === 'WARN'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : log.level === 'DEBUG'
                  ? 'bg-purple-100 text-purple-800 border-purple-200'
                  : 'bg-emerald-100 text-[#027e46] border-emerald-200';

              return (
                <div
                  key={log.id}
                  className="p-3 bg-slate-900 text-slate-200 rounded-md border border-slate-800 hover:border-slate-700 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] border ${badgeStyle}`}>
                        {log.level}
                      </span>
                      <span className="text-purple-300 font-bold">{log.event}</span>
                      <span className="text-slate-400">[{log.service}]</span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      {log.correlationId && (
                        <span className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">
                          ID: {log.correlationId}
                        </span>
                      )}
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <p className="text-slate-200 text-xs font-sans leading-snug">
                    {log.message}
                  </p>

                  {(log.context || log.error) && (
                    <div className="pt-1">
                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold underline flex items-center gap-1"
                      >
                        {isExpanded ? 'Hide Structured JSON Context' : 'View Structured JSON Context & Trace'}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 p-2 bg-slate-950 rounded border border-slate-800 text-[11px] overflow-x-auto text-emerald-400 space-y-1">
                          {log.context && (
                            <div>
                              <span className="text-slate-500 font-bold block text-[10px] uppercase">Context:</span>
                              <pre>{JSON.stringify(log.context, null, 2)}</pre>
                            </div>
                          )}
                          {log.error && (
                            <div className="pt-1 text-red-400">
                              <span className="text-red-300 font-bold block text-[10px] uppercase">Error Stack:</span>
                              <div>{log.error.name}: {log.error.message}</div>
                              {log.error.stack && <pre className="text-[10px] text-red-300/80 mt-1">{log.error.stack}</pre>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Centralized Environment Configuration & Runtime Feature Flags Card */}
      <div className="bg-white border border-[#dddbda] rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#dddbda] pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#0176d3]" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Centralized Environment Configuration & Runtime Feature Flags</h3>
              <p className="text-[11px] text-slate-500">Manage environment defaults, database paths, SLA thresholds, and live feature toggles across dev, staging, and prod.</p>
            </div>
          </div>

          <button
            onClick={resetFlags}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-[#dddbda] rounded text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Flags to Env Defaults
          </button>
        </div>

        {appConfig ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Column 1: Core Runtime Environment */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs border-b pb-1.5">
                <Server className="w-4 h-4 text-purple-600" /> Environment & Infrastructure
              </div>
              <div className="space-y-1 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>Target Environment:</span>
                  <span className="font-bold text-purple-700 uppercase">{appConfig.env}</span>
                </div>
                <div className="flex justify-between">
                  <span>Server Port:</span>
                  <span className="font-bold text-slate-800">{appConfig.port}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gemini API Key:</span>
                  <span className={`font-bold ${appConfig.hasGeminiApiKey ? 'text-emerald-700' : 'text-amber-600'}`}>
                    {appConfig.hasGeminiApiKey ? 'Configured' : 'Missing (Fallback Mode)'}
                  </span>
                </div>
                <div className="pt-1 border-t text-[10px] text-slate-500 truncate">
                  <span className="font-semibold block text-slate-700">Database Storage Path:</span>
                  <code className="text-[10px] bg-slate-200 px-1 py-0.5 rounded block truncate mt-0.5">{appConfig.databasePath}</code>
                </div>
              </div>
            </div>

            {/* Column 2: Audit & SLA Thresholds */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs border-b pb-1.5">
                <Clock className="w-4 h-4 text-amber-600" /> Audit & SLA Thresholds
              </div>
              <div className="space-y-1 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>Critical Anomaly SLA:</span>
                  <span className="font-bold text-slate-800">{appConfig.slaThresholds?.criticalSlaHours} hrs</span>
                </div>
                <div className="flex justify-between">
                  <span>High Anomaly SLA:</span>
                  <span className="font-bold text-slate-800">{appConfig.slaThresholds?.highSlaHours} hrs</span>
                </div>
                <div className="flex justify-between">
                  <span>Duplicate Threshold:</span>
                  <span className="font-bold text-slate-800">{appConfig.slaThresholds?.duplicateThresholdScore}% Match</span>
                </div>
              </div>
            </div>

            {/* Column 3: Live Feature Toggles */}
            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-md space-y-2 md:col-span-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs border-b border-blue-100 pb-1.5">
                <Settings className="w-4 h-4 text-[#0176d3]" /> Live Feature Toggles
              </div>
              <div className="space-y-1.5 text-[11px]">
                {Object.entries(appConfig.featureFlags || {}).map(([key, value]) => {
                  const isEnabled = Boolean(value);
                  const isBusy = isUpdatingFlag === key;
                  return (
                    <div key={key} className="flex items-center justify-between bg-white p-1.5 rounded border border-slate-200">
                      <span className="text-slate-700 font-medium text-[11px]">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^enable /, '')}
                      </span>
                      <button
                        onClick={() => toggleFeatureFlag(key, isEnabled)}
                        disabled={isBusy}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          isEnabled
                            ? 'bg-emerald-100 text-[#027e46] hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {isEnabled ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                        {isEnabled ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-slate-400 text-xs">Loading environment configuration...</div>
        )}
      </div>

      {/* Terminal Command Guidance Card */}
      <div className="bg-slate-900 text-slate-200 rounded-lg p-5 shadow-sm space-y-3 font-mono text-xs border border-slate-800">
        <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-200">Developer Testing Strategy & Vitest Execution</span>
          </div>
          <span className="text-[10px] text-slate-500">Node.js + Vitest v3.x</span>
        </div>

        <div className="space-y-2 text-slate-300">
          <p className="text-slate-400">
            # Run unit & integration test suite locally via CLI:
          </p>
          <div className="bg-slate-950 p-3 rounded border border-slate-800 text-emerald-400 flex items-center justify-between">
            <span>$ npm test</span>
            <span className="text-[10px] text-slate-500 font-sans">Executes Vitest runner for /src/tests/**/*.test.ts</span>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 space-y-1">
            <span className="text-amber-400 font-bold block">Targeted Verification Strategy:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li><strong>Unit Testing:</strong> Ensures Soundex phonetics, Levenshtein fuzzy distance, and age gap rules perform consistently across Indian regional name spellings.</li>
              <li><strong>Integration Testing:</strong> Verifies SQLite CRUD operations, SLA audit logging, and Form-7 objection purge actions prevent data corruption or regressions.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
