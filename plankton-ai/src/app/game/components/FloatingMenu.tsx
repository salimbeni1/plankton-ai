'use client';

import React from 'react';
import { Move, MousePointer, Plus, RotateCcw } from 'lucide-react';

interface FloatingMenuProps {
  onAddHuman: () => void;
  onReset: () => void;
  selectedCount: number;
  zoom: number;
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
}

type Tool = 'select' | 'drag' | 'add';

export const FloatingMenu: React.FC<FloatingMenuProps> = ({ 
  onAddHuman, 
  onReset, 
  selectedCount, 
  zoom,
  activeTool,
  onToolChange
}) => {
  const tools = [
    {
      id: 'select' as Tool,
      icon: MousePointer,
      label: 'Select',
      tooltip: 'Select humans (Left click/drag)',
    },
    {
      id: 'drag' as Tool,
      icon: Move,
      label: 'Pan',
      tooltip: 'Pan view (Left click/drag)',
    },
    {
      id: 'add' as Tool,
      icon: Plus,
      label: 'Add Human',
      tooltip: 'Add new human',
      action: onAddHuman,
    },
  ];

  const handleToolClick = (tool: Tool) => {
    if (tool === 'add') {
      onAddHuman();
    } else {
      onToolChange(tool);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 border border-gray-300/50 shadow-2xl">
        <div className="flex items-center gap-6">
          {/* Tool buttons */}
          <div className="flex items-center gap-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              
              return (
                <button
                  key={tool.id}
                  onClick={() => handleToolClick(tool.id)}
                  className={`
                    group relative flex items-center justify-center w-12 h-12 rounded-xl
                    transition-all duration-200 hover:scale-105
                    ${isActive 
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                    }
                  `}
                  title={tool.tooltip}
                >
                  <Icon size={20} />
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="bg-gray-800 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">
                      {tool.tooltip}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-300/50"></div>

          {/* Game info */}
          <div className="flex items-center gap-4 text-sm">
            <div className="text-gray-700">
              <span className="text-gray-500">Selected:</span>
              <span className="ml-1 text-gray-900 font-medium">{selectedCount}</span>
            </div>
            <div className="text-gray-700">
              <span className="text-gray-500">Zoom:</span>
              <span className="ml-1 text-gray-900 font-medium">{Math.round(zoom * 100)}%</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-300/50"></div>

          {/* Reset button */}
          <button
            onClick={onReset}
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-600 transition-all duration-200 hover:scale-105"
            title="Reset game (R key)"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {/* Controls hint */}
        <div className="mt-3 pt-3 border-t border-gray-300/50">
          <p className="text-xs text-gray-500 text-center">
            <span className="text-gray-700">Left click:</span> Select • 
            <span className="text-gray-700 ml-2">Right click:</span> Move • 
            <span className="text-gray-700 ml-2">Wheel:</span> Zoom • 
            <span className="text-gray-700 ml-2">R:</span> Reset
          </p>
        </div>
      </div>
    </div>
  );
}; 