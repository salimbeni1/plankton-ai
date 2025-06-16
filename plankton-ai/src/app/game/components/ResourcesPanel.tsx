'use client';

import React from 'react';
import { Package } from 'lucide-react';

interface ResourceInfo {
  id: string;
  resourceType: string;
  amount: number;
  selected: boolean;
}

interface ResourcesPanelProps {
  resources: ResourceInfo[];
  open: boolean;
  onToggle: (panel: 'humans' | 'resources') => void;
  onSelect: (entityId: string, addToSelection?: boolean) => void;
  onDeselect: (entityId: string) => void;
}

export const ResourcesPanel: React.FC<ResourcesPanelProps> = ({ resources, open, onToggle, onSelect, onDeselect }) => {
  const handleResourceClick = (resource: ResourceInfo, event: React.MouseEvent) => {
    const addToSelection = event.ctrlKey || event.metaKey;
    
    if (resource.selected && addToSelection) {
      onDeselect(resource.id);
    } else {
      onSelect(resource.id, addToSelection);
    }
  };

  // Aggregate total amounts per resource type
  const totals = resources.reduce<Record<string, number>>((acc, r) => {
    acc[r.resourceType] = (acc[r.resourceType] || 0) + r.amount;
    return acc;
  }, {});

  return (
    <div className="fixed top-6 right-20 z-50 select-none"> {/* shift left so it doesn't overlap humans panel */}
      <div className="relative">
        <button
          onClick={() => onToggle('resources')}
          className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border border-gray-300/60 shadow-xl hover:scale-105 transition-transform"
          title="Resources list"
        >
          <Package size={22} className="text-gray-700" />
          {resources.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
              {resources.length}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-56 max-h-72 overflow-y-auto bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-300/50">
            <div className="px-4 py-2 border-b border-gray-200 text-sm font-semibold text-gray-700 sticky top-0 bg-white/90">
              Resources ({resources.length})
            </div>
            <ul className="divide-y divide-gray-100 text-sm">
              {resources.map((r) => (
                <li 
                  key={r.id} 
                  className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                    r.selected ? 'bg-green-50 border-l-4 border-green-500' : ''
                  }`}
                  onClick={(e) => handleResourceClick(r, e)}
                  title={`Click to ${r.selected ? 'deselect' : 'select'} • Ctrl+Click to add to selection`}
                >
                  <span className={`font-medium capitalize ${r.selected ? 'text-green-700' : 'text-gray-700'}`}>
                    {r.resourceType}
                  </span>
                  <span className={`ml-2 ${r.selected ? 'text-green-600' : 'text-gray-500'}`}>
                    x{r.amount}
                  </span>
                </li>
              ))}
              {resources.length === 0 && (
                <li className="px-4 py-4 text-center text-gray-400">No resources</li>
              )}
            </ul>
            {/* Totals summary */}
            {Object.keys(totals).length > 0 && (
              <div className="border-t border-gray-200 text-xs text-gray-600 px-4 py-2 bg-white/90 sticky bottom-0">
                {Object.entries(totals).map(([type, total]) => (
                  <div key={type} className="flex justify-between">
                    <span className="capitalize">{type}</span>
                    <span>{total}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 