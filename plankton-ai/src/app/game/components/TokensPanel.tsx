'use client';

import React from 'react';
import { Coins } from 'lucide-react';

interface Transaction {
  id: string;
  description: string;
  cost: number;
  timestamp: Date;
}

interface TokensPanelProps {
  availableTokens: number;
  spentTokens: number;
  transactions: Transaction[];
  open: boolean;
  onToggle: (panel: 'humans' | 'resources' | 'tokens') => void;
}

export const TokensPanel: React.FC<TokensPanelProps> = ({ 
  availableTokens, 
  spentTokens, 
  transactions, 
  open, 
  onToggle 
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const totalTokens = availableTokens + spentTokens;

  // Format badge display for large numbers
  const formatBadgeNumber = (num: number) => {
    if (num > 999) return '999+';
    if (num > 99) return '99+';
    return num.toString();
  };

  // Determine badge size based on number
  const getBadgeClasses = (num: number) => {
    if (num > 99) {
      return "absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-semibold rounded-full w-7 h-5 flex items-center justify-center";
    }
    return "absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center";
  };

  return (
    <div className="fixed top-6 right-36 z-50 select-none">
      <div className="relative">
        <button
          onClick={() => onToggle('tokens')}
          className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border border-gray-300/60 shadow-xl hover:scale-105 transition-transform"
          title="Token balance and transactions"
        >
          <Coins size={22} className="text-gray-700" />
          {/* Available tokens badge */}
          <span className={getBadgeClasses(availableTokens)}>
            {formatBadgeNumber(availableTokens)}
          </span>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-300/50">
            {/* Header with token summary */}
            <div className="px-4 py-3 border-b border-gray-200 bg-white/90">
              <div className="text-sm font-semibold text-gray-700 mb-2">Token Balance</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Available:</span>
                  <span className="font-medium text-green-600">{availableTokens}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Spent:</span>
                  <span className="font-medium text-red-600">{spentTokens}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-1">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium text-gray-900">{totalTokens}</span>
                </div>
              </div>
            </div>

            {/* Transaction history */}
            <div className="px-4 py-2 border-b border-gray-200 text-sm font-semibold text-gray-700 bg-white/90">
              Transaction History ({transactions.length})
            </div>
            
            {/* Transaction list with single scroll */}
            <div className="max-h-48 overflow-y-auto">
              {transactions.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-700 truncate text-sm">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTime(transaction.timestamp)}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          <span className="text-red-600 font-medium text-sm">
                            -{transaction.cost}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-gray-400">
                  No transactions yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 