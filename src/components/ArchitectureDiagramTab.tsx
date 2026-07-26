// Implemented with Multi-Agent AI architecture preview
import React, { useState } from 'react';
import { 
  Network, 
  Cpu, 
  Database, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  FileCode, 
  CheckCircle2, 
  Workflow, 
  Zap, 
  Lock,
  Search,
  Bot,
  Maximize2,
  Download,
  MapPin,
  FileCheck,
  X
} from 'lucide-react';

interface AgentDetail {
  id: string;
  name: string;
  role: string;
  icon: React.ReactNode;
  color: string;
  badgeColor: string;
  inputData: string;
  outputData: string;
  description: string;
}

interface ArchitectureNode {
  id: string;
  title: string;
  category: 'Users & Roles' | 'Frontend UI (SLDS)' | 'AI Agent & Core Services' | 'Data & Persistence';
  description: string;
  techStack: string[];
  responsibilities: string[];
  status: 'Active' | 'Integrated' | 'Automated';
}

export const ArchitectureDiagramTab: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string>('agent-engine');
  const [activeViewMode, setActiveViewMode] = useState<'visual' | 'agents' | 'sequence' | 'stack'>('visual');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const agents: AgentDetail[] = [
    {
      id: 'agent-orchestrator',
      name: '1. Master Orchestrator Agent',
      role: 'Workflow Routing & State Management',
      icon: <Bot className="w-5 h-5" />,
      color: 'bg-blue-600',
      badgeColor: 'bg-blue-100 text-[#0176d3]',
      inputData: 'Raw voter list upload / ECI Form-6 & Form-7 entries',
      outputData: 'Parallel sub-agent dispatches & consolidated risk score',
      description: 'Coordinates multi-agent execution pipeline, manages user permissions (ERO vs BLO vs DEO), and maintains overall task execution status.'
    },
    {
      id: 'agent-phonetic',
      name: '2. Duplicate Audit Agent (Phonetic Soundex)',
      role: 'Cross-Booth Name & Transliteration Matching',
      icon: <Sparkles className="w-5 h-5" />,
      color: 'bg-purple-600',
      badgeColor: 'bg-purple-100 text-purple-800',
      inputData: 'Voter Full Name, Relative Name, Assembly Constituency ID',
      outputData: 'Phonetic similarity score & transliteration flags (Bengali/Hindi/English)',
      description: 'Executes Soundex and Metaphone algorithms to find duplicate voters across multiple polling booths, accounting for spelling variations and regional script transliterations.'
    },
    {
      id: 'agent-demographic',
      name: '3. Demographic Anomaly Agent',
      role: 'Age, Address & Family Logic Validation',
      icon: <Cpu className="w-5 h-5" />,
      color: 'bg-amber-600',
      badgeColor: 'bg-amber-100 text-amber-900',
      inputData: 'Age, Gender, House No, EPIC Number format',
      outputData: 'Impossibility flags (e.g. parent-child age gap < 15 yrs, house overcrowding)',
      description: 'Scans electoral rolls for impossible age relationships, invalid EPIC checksums, or unusual clusters of un-related voters sharing a single dwelling.'
    },
    {
      id: 'agent-field',
      name: '4. BLO Field Dispatch Agent',
      role: 'Mobile Tasking & GPS Verification Queue',
      icon: <MapPin className="w-5 h-5" />,
      color: 'bg-indigo-600',
      badgeColor: 'bg-indigo-100 text-indigo-900',
      inputData: 'Flagged duplicate records, Polling Booth Location',
      outputData: 'Mobile survey task order with geo-fenced verification checklist',
      description: 'Translates AI duplicate flags into actionable physical inspection tasks for Booth Level Officers (BLOs), recording GPS tags and door-to-door survey evidence.'
    },
    {
      id: 'agent-purge',
      name: '5. Form-7 Purge & Compliance Agent',
      role: 'Legal Compliance & ERO Deletion Log',
      icon: <FileCheck className="w-5 h-5" />,
      color: 'bg-emerald-600',
      badgeColor: 'bg-emerald-100 text-[#027e46]',
      inputData: 'BLO Field survey report + ERO approval signature',
      outputData: 'Permanent roll deletion audit log + Form-7 objection certificate',
      description: 'Ensures strict compliance with ECI legal revision guidelines before purging duplicate entries, producing immutable audit trails for election oversight.'
    }
  ];

  const nodes: Record<string, ArchitectureNode> = {
    'users': {
      id: 'users',
      title: 'Electoral Officers & Roles',
      category: 'Users & Roles',
      description: 'Role-based access control (RBAC) supporting multi-tier electoral administration workflows.',
      techStack: ['React Context', 'LocalStorage Auth', 'SLDS Security Controls'],
      responsibilities: [
        'Electoral Registration Officer (ERO): Form-7 deletion & final decision authority',
        'Booth Level Officer (BLO): Field verification & physical door-to-door validation',
        'District Election Officer (DEO): Oversight & high-level constituency analytics',
        'System Admin: System prompt tuning & batch dataset ingestion'
      ],
      status: 'Active'
    },
    'frontend-ui': {
      id: 'frontend-ui',
      title: 'Salesforce SLDS Portal Interface',
      category: 'Frontend UI (SLDS)',
      description: 'Enterprise React single-page application built on Salesforce Lightning Design System specifications.',
      techStack: ['React 18', 'TypeScript', 'Tailwind CSS', 'Lucide Icons', 'Vite Engine'],
      responsibilities: [
        'Real-time Dashboard & SIR KPI Stats Cards',
        'Electoral Roll Records Explorer with multi-attribute filters',
        'BLO Field Verification Queue dispatch system',
        'Gemini Prompt Lab for custom AI query execution',
        'Python Inspector for reviewing phonetic audit scripts'
      ],
      status: 'Active'
    },
    'agent-engine': {
      id: 'agent-engine',
      title: 'Antigravity AI Agent & Gemini 3.6 Flash',
      category: 'AI Agent & Core Services',
      description: 'Intelligent multi-modal AI reasoning engine providing automated electoral revision anomaly detection.',
      techStack: ['Gemini 3.6 Flash API', 'Phonetic Soundex/Metaphone', 'NLP Address Normalization'],
      responsibilities: [
        'Cross-booth duplicate voter detection using Soundex & fuzzy matching',
        'Demographic anomaly scoring (age/relative name discrepancy)',
        'Multi-lingual transliteration (Bengali / Hindi / English normalization)',
        'Automated risk categorization (High, Medium, Low severity flags)',
        'Generating natural language justification for BLO field investigation'
      ],
      status: 'Automated'
    },
    'data-layer': {
      id: 'data-layer',
      title: 'SQLite Database & Storage Engine',
      category: 'Data & Persistence',
      description: 'Persistent local database storing electoral roll state, audit trails, and field verification logs.',
      techStack: ['SQLite In-Memory / Local Storage', 'Structured Schema', 'Batch CSV Parser'],
      responsibilities: [
        'High-performance SQL indexing on Voter EPIC, Name, and Relative Name',
        'Pre-populated ECI Special Intensive Revision (SIR) datasets',
        'Audit trail logging for Form-7 deletion actions',
        'BLO field survey report persistence & GPS tag storage'
      ],
      status: 'Integrated'
    }
  };

  const currentNode = nodes[selectedNode] || nodes['agent-engine'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#dddbda] rounded-lg p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-[#0176d3]" />
            <h2 className="text-lg font-bold text-slate-900">System & AI Agent Architecture</h2>
            <span className="text-xs px-2.5 py-0.5 rounded bg-blue-50 text-[#0176d3] font-semibold border border-blue-200">
              SIRAssist v1.2
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end technical blueprint showing the integration between Salesforce Lightning UI, Antigravity AI Agent, Gemini 3.6 Flash, and SQLite Data Services.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-[#dddbda] text-xs font-semibold self-start md:self-auto flex-wrap gap-1">
          <button
            onClick={() => setActiveViewMode('visual')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeViewMode === 'visual'
                ? 'bg-white text-[#0176d3] shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            Visual Blueprint
          </button>
          <button
            onClick={() => setActiveViewMode('agents')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeViewMode === 'agents'
                ? 'bg-white text-[#0176d3] shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-purple-600" />
            5 AI Agents Matrix
          </button>
          <button
            onClick={() => setActiveViewMode('sequence')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeViewMode === 'sequence'
                ? 'bg-white text-[#0176d3] shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowRight className="w-3.5 h-3.5" />
            Data Sequence
          </button>
          <button
            onClick={() => setActiveViewMode('stack')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeViewMode === 'stack'
                ? 'bg-white text-[#0176d3] shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Tech Stack
          </button>
        </div>
      </div>

      {/* Generated Architecture Image Card Banner */}
      <div className="bg-white border border-[#dddbda] rounded-lg p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0176d3]" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Generated System Architecture Diagram Image Artifact
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImageModalOpen(true)}
              className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-[#dddbda] rounded text-xs font-semibold flex items-center gap-1"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#0176d3]" /> Expand Fullscreen
            </button>
            <a
              href="/agent_architecture_diagram.jpg"
              download="agent_architecture_diagram.jpg"
              className="px-2.5 py-1 bg-[#0176d3] hover:bg-[#015ba3] text-white rounded text-xs font-semibold flex items-center gap-1 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Save Image File
            </a>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-md border border-[#dddbda] bg-slate-900 group cursor-pointer" onClick={() => setIsImageModalOpen(true)}>
          <img
            src="/agent_architecture_diagram.jpg"
            alt="Multi-Agent AI System Architecture Diagram"
            className="w-full h-auto max-h-[340px] object-cover object-center group-hover:scale-[1.01] transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2">
            <Maximize2 className="w-5 h-5" /> Click to view full high-resolution diagram
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeViewMode === 'visual' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual Architecture Flow Diagram Column (2 Cols) */}
          <div className="lg:col-span-2 bg-white border border-[#dddbda] rounded-lg p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#dddbda] pb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#0176d3]" />
                Interactive Component Flow (Click node to inspect)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Click any layer for deep technical specification
              </span>
            </div>

            {/* Diagram Flow Containers */}
            <div className="space-y-4 relative">
              {/* Layer 1: User & Roles */}
              <div
                onClick={() => setSelectedNode('users')}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedNode === 'users'
                    ? 'border-[#0176d3] bg-blue-50/60 shadow-md ring-2 ring-blue-200'
                    : 'border-[#dddbda] bg-slate-50 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-indigo-600 text-white flex items-center justify-center font-bold">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">1. User & Officer Access Layer</h3>
                      <p className="text-[11px] text-slate-500">ERO, BLO, DEO, and System Admin roles with session authorization</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                    User Domain
                  </span>
                </div>
              </div>

              {/* Connecting Down Arrow 1 */}
              <div className="flex justify-center my-1">
                <div className="flex flex-col items-center text-[#0176d3]">
                  <div className="w-0.5 h-3 bg-[#0176d3]"></div>
                  <ArrowRight className="w-4 h-4 rotate-90 -mt-1" />
                </div>
              </div>

              {/* Layer 2: Frontend SLDS Portal */}
              <div
                onClick={() => setSelectedNode('frontend-ui')}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedNode === 'frontend-ui'
                    ? 'border-[#0176d3] bg-blue-50/60 shadow-md ring-2 ring-blue-200'
                    : 'border-[#dddbda] bg-slate-50 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-[#0176d3] text-white flex items-center justify-center font-bold">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">2. Salesforce SLDS Frontend Portal</h3>
                      <p className="text-[11px] text-slate-500">React 18 SPA • Dashboard, Records Grid, BLO Dispatch, Prompt Lab</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-[#0176d3] font-bold">
                    Presentation
                  </span>
                </div>
              </div>

              {/* Connecting Down Arrow 2 */}
              <div className="flex justify-center my-1">
                <div className="flex flex-col items-center text-[#0176d3]">
                  <div className="w-0.5 h-3 bg-[#0176d3]"></div>
                  <ArrowRight className="w-4 h-4 rotate-90 -mt-1" />
                </div>
              </div>

              {/* Layer 3: AI Agent Engine */}
              <div
                onClick={() => setSelectedNode('agent-engine')}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedNode === 'agent-engine'
                    ? 'border-[#0176d3] bg-blue-50/60 shadow-md ring-2 ring-blue-200'
                    : 'border-[#dddbda] bg-amber-50/50 hover:bg-amber-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-amber-600 text-white flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">3. Antigravity AI Agent & Gemini 3.6 Flash Engine</h3>
                      <p className="text-[11px] text-slate-500">Soundex Phonetic Matching • Multi-attribute Anomaly Detection • SIR Prompt Rules</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                    AI Intelligence
                  </span>
                </div>
              </div>

              {/* Connecting Down Arrow 3 */}
              <div className="flex justify-center my-1">
                <div className="flex flex-col items-center text-[#0176d3]">
                  <div className="w-0.5 h-3 bg-[#0176d3]"></div>
                  <ArrowRight className="w-4 h-4 rotate-90 -mt-1" />
                </div>
              </div>

              {/* Layer 4: Data & Persistence */}
              <div
                onClick={() => setSelectedNode('data-layer')}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedNode === 'data-layer'
                    ? 'border-[#0176d3] bg-blue-50/60 shadow-md ring-2 ring-blue-200'
                    : 'border-[#dddbda] bg-emerald-50/50 hover:bg-emerald-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">4. SQLite Database & Electoral Roll Persistence</h3>
                      <p className="text-[11px] text-slate-500">EPIC Indexed Electoral Roll Data • Form-7 Audit Trail • BLO Survey Logs</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">
                    Storage
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Node Specification Details Column (1 Col) */}
          <div className="bg-white border border-[#dddbda] rounded-lg p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#dddbda]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    {currentNode.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                    {currentNode.title}
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-[#0176d3] border border-blue-200 font-bold">
                  {currentNode.status}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {currentNode.description}
              </p>

              <div>
                <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                  Technologies & Frameworks
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentNode.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                  Core Subsystem Responsibilities
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {currentNode.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#027e46] shrink-0 mt-0.5" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-blue-50/70 border border-blue-200 rounded-md p-3 text-[11px] text-slate-700 space-y-1">
              <span className="font-bold text-[#0176d3] block flex items-center gap-1">
                <Bot className="w-3.5 h-3.5" /> Antigravity Agent Note
              </span>
              <span>
                All components adhere strictly to Election Commission of India (ECI) Special Intensive Revision guidelines and Salesforce Lightning Design System standards.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sequence Mode View */}
      {activeViewMode === 'sequence' && (
        <div className="bg-white border border-[#dddbda] rounded-lg p-6 shadow-sm space-y-6">
          <div className="border-b border-[#dddbda] pb-3">
            <h3 className="text-sm font-bold text-slate-900">Electoral Revision Processing Pipeline</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Step-by-step lifecycle of how voter data flows from ingestion to AI audit and BLO field validation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            <div className="bg-slate-50 border border-[#dddbda] rounded-lg p-4 space-y-2">
              <span className="w-6 h-6 rounded-full bg-[#0176d3] text-white flex items-center justify-center text-xs font-bold">1</span>
              <h4 className="text-xs font-bold text-slate-900">Data Ingestion</h4>
              <p className="text-[11px] text-slate-500">
                Officer uploads CSV voter list or enters single Form-6/Form-7 record.
              </p>
            </div>

            <div className="bg-slate-50 border border-[#dddbda] rounded-lg p-4 space-y-2">
              <span className="w-6 h-6 rounded-full bg-[#0176d3] text-white flex items-center justify-center text-xs font-bold">2</span>
              <h4 className="text-xs font-bold text-slate-900">SQLite Indexing</h4>
              <p className="text-[11px] text-slate-500">
                Data stored in SQLite DB; indexed by EPIC, EPIC_Hash, and Name Soundex.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">3</span>
              <h4 className="text-xs font-bold text-slate-900">Gemini 3.6 Flash Audit</h4>
              <p className="text-[11px] text-slate-600">
                AI cross-references multi-booth records, phonetic names, and address clusters.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <span className="w-6 h-6 rounded-full bg-[#0176d3] text-white flex items-center justify-center text-xs font-bold">4</span>
              <h4 className="text-xs font-bold text-slate-900">BLO Field Dispatch</h4>
              <p className="text-[11px] text-slate-600">
                High-risk duplicate flags automatically queued to Booth Level Officers for physical audit.
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-2">
              <span className="w-6 h-6 rounded-full bg-[#027e46] text-white flex items-center justify-center text-xs font-bold">5</span>
              <h4 className="text-xs font-bold text-slate-900">Form-7 Deletion</h4>
              <p className="text-[11px] text-slate-600">
                ERO reviews field survey report and executes verified roll purge with audit logging.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5 Autonomous AI Agents Matrix View */}
      {activeViewMode === 'agents' && (
        <div className="bg-white border border-[#dddbda] rounded-lg p-6 shadow-sm space-y-6">
          <div className="border-b border-[#dddbda] pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-600" />
                5 Specialized Autonomous AI Agents
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Breakdown of individual AI agents operating within the SIRAssist Special Intensive Revision platform.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 font-bold border border-purple-200">
              Multi-Agent Mesh Architecture
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="border border-[#dddbda] rounded-lg p-4 bg-slate-50 hover:bg-slate-100/70 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-lg ${agent.color} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                      {agent.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{agent.name}</h4>
                      <span className="text-[10px] font-semibold text-slate-500">{agent.role}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${agent.badgeColor}`}>
                    Active Agent
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {agent.description}
                </p>

                <div className="pt-2 border-t border-[#dddbda] grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[9px] block">Input Stream:</span>
                    <span className="text-slate-800 font-mono text-[10px] leading-tight block mt-0.5">{agent.inputData}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[9px] block">Output Output:</span>
                    <span className="text-slate-800 font-mono text-[10px] leading-tight block mt-0.5">{agent.outputData}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tech Stack Breakdown Table View */}
      {activeViewMode === 'stack' && (
        <div className="bg-white border border-[#dddbda] rounded-lg p-6 shadow-sm space-y-4">
          <div className="border-b border-[#dddbda] pb-3">
            <h3 className="text-sm font-bold text-slate-900">Complete Technology Stack Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed list of technologies, frameworks, and APIs powering the SIRAssist Platform.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#dddbda] text-slate-700">
                  <th className="p-3 font-bold">Layer / Domain</th>
                  <th className="p-3 font-bold">Technology / Library</th>
                  <th className="p-3 font-bold">Version / Provider</th>
                  <th className="p-3 font-bold">Purpose in Application</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dddbda] text-slate-800">
                <tr>
                  <td className="p-3 font-bold text-[#0176d3]">Frontend UI</td>
                  <td className="p-3 font-medium">React + Vite + Tailwind CSS</td>
                  <td className="p-3 font-mono text-[11px]">React 18.3, Vite 5</td>
                  <td className="p-3 text-slate-600">Salesforce Lightning Design System single-page interface</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-amber-600">AI Intelligence</td>
                  <td className="p-3 font-medium">Gemini 3.6 Flash SDK</td>
                  <td className="p-3 font-mono text-[11px]">@google/genai</td>
                  <td className="p-3 text-slate-600">Anomalous duplicate voter reasoning & prompt evaluation</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-emerald-600">Database Engine</td>
                  <td className="p-3 font-medium">SQLite DB Service</td>
                  <td className="p-3 font-mono text-[11px]">In-Memory / LocalStorage</td>
                  <td className="p-3 text-slate-600">Indexed voter demographics, EPIC keys, and audit logs</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-indigo-600">Phonetics Engine</td>
                  <td className="p-3 font-medium">Soundex & Metaphone Python/JS</td>
                  <td className="p-3 font-mono text-[11px]">Custom Inspector Module</td>
                  <td className="p-3 text-slate-600">Matching phonetic variations across English, Bengali, and Hindi names</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-700">Design System</td>
                  <td className="p-3 font-medium">Salesforce SLDS Tokens</td>
                  <td className="p-3 font-mono text-[11px]">SLDS v1.2 Colors & Spacing</td>
                  <td className="p-3 text-slate-600">Enterprise blue styling, badges, cards, and modal dialogs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fullscreen Image Preview Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full p-4 space-y-4 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-[#dddbda]">
              <div className="flex items-center gap-2">
                <Network className="w-5 h-5 text-[#0176d3]" />
                <h3 className="text-sm font-bold text-slate-900">Multi-Agent System Architecture Diagram</h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/agent_architecture_diagram.jpg"
                  download="agent_architecture_diagram.jpg"
                  className="px-3 py-1 bg-[#0176d3] text-white rounded text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download JPG
                </a>
                <button
                  onClick={() => setIsImageModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-auto flex-1 flex items-center justify-center bg-slate-950 p-2 rounded-lg">
              <img
                src="/agent_architecture_diagram.jpg"
                alt="Multi-Agent AI System Architecture High Resolution Diagram"
                className="max-w-full h-auto rounded shadow-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
