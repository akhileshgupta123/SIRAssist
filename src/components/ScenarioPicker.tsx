import React from 'react';
import { SampleScenario } from '../types';
import { Play, Sparkles } from 'lucide-react';

interface ScenarioPickerProps {
  scenarios: SampleScenario[];
  onSelectScenario: (scenario: SampleScenario) => void;
  isLoading: boolean;
}

export const ScenarioPicker: React.FC<ScenarioPickerProps> = ({
  scenarios,
  onSelectScenario,
  isLoading,
}) => {
  return (
    <div className="bg-white border border-[#dddbda] rounded-lg p-4 mb-6 text-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-md bg-blue-50 border border-blue-200 text-[#0176d3]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">SIR Electoral Roll Simulation Scenarios</h2>
            <p className="text-xs text-slate-500">Click a scenario to trigger automated Gemini AI tool detection & BLO verification workflow</p>
          </div>
        </div>
        <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-slate-600">
          Simulation Test Bed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {scenarios.map((scen) => (
          <div
            key={scen.id}
            onClick={() => onSelectScenario(scen)}
            className="p-3 bg-[#f8f9fb] border border-[#dddbda] hover:border-[#0176d3] hover:bg-blue-50/30 rounded-md transition-all cursor-pointer group flex flex-col justify-between shadow-2xs"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                  scen.severity === 'Critical'
                    ? 'bg-[#fededd] text-[#ba0517] border-[#fcc2c1]'
                    : scen.severity === 'High'
                    ? 'bg-[#fff0c2] text-[#8c4b00] border-[#ffe399]'
                    : 'bg-[#e3f5ed] text-[#027e46] border-[#c3ebda]'
                }`}>
                  {scen.category}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{scen.badgeTag}</span>
              </div>

              <h3 className="text-xs font-bold text-slate-800 group-hover:text-[#0176d3] transition-colors line-clamp-1">
                {scen.title}
              </h3>
              <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                {scen.description}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono truncate">{scen.epicNumber}</span>
              <button
                disabled={isLoading}
                className="text-xs font-semibold text-[#0176d3] group-hover:text-[#015ba3] flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current" />
                Simulate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
