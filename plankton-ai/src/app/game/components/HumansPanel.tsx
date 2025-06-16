'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { HumanState } from '../types/game.types';

interface HumanInfo {
  id: string;
  state: HumanState;
  selected: boolean;
}

interface HumansPanelProps {
  humans: HumanInfo[];
  open: boolean;
  onToggle: (panel: 'humans' | 'resources') => void;
  onSelect: (entityId: string, addToSelection?: boolean) => void;
  onDeselect: (entityId: string) => void;
}

export const HumansPanel: React.FC<HumansPanelProps> = ({ humans, open, onToggle, onSelect, onDeselect }) => {
  const handleHumanClick = (human: HumanInfo, event: React.MouseEvent) => {
    const addToSelection = event.ctrlKey || event.metaKey;
    
    if (human.selected && addToSelection) {
      onDeselect(human.id);
    } else {
      onSelect(human.id, addToSelection);
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50 select-none">
      <div className="relative">
        {/* Toggle button */}
        <button
          onClick={() => onToggle('humans')}
          className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border border-gray-300/60 shadow-xl hover:scale-105 transition-transform"
          title="Humans list"
        >
          <Users size={22} className="text-gray-700" />
          {/* Count badge */}
          {humans.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
              {humans.length}
            </span>
          )}
        </button>

        {/* Panel */}
        {open && (
          <div className="absolute right-0 mt-2 w-56 max-h-72 overflow-y-auto bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-300/50">
            <div className="px-4 py-2 border-b border-gray-200 text-sm font-semibold text-gray-700 sticky top-0 bg-white/90">
              Humans ({humans.length})
            </div>
            <ul className="divide-y divide-gray-100 text-sm">
              {humans.map((h) => (
                <li 
                  key={h.id} 
                  className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                    h.selected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={(e) => handleHumanClick(h, e)}
                  title={`Click to ${h.selected ? 'deselect' : 'select'} • Ctrl+Click to add to selection`}
                >
                  <span className={`font-medium truncate max-w-[120px] ${h.selected ? 'text-blue-700' : 'text-gray-700'}`} title={h.id}>
                    {h.id}
                  </span>
                  <span className={`ml-2 capitalize ${h.selected ? 'text-blue-600' : 'text-gray-500'}`}>
                    {h.state}
                  </span>
                </li>
              ))}
              {humans.length === 0 && (
                <li className="px-4 py-4 text-center text-gray-400">No humans</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}; 