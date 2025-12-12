
import React from 'react';
import { PixelCard, PixelButton } from './PixelCard';
import { Intelligence } from '../types';
import { GOODS_DEFINITIONS } from '../constants';

interface IntelligenceModalProps {
  logs: Intelligence[];
  currentAge: number;
  onClose: () => void;
}

const IntelligenceModal: React.FC<IntelligenceModalProps> = ({ logs, currentAge, onClose }) => {
  // Sort logs: Active first, then pending, then expired. Within groups, newest first.
  const sortedLogs = [...logs].sort((a, b) => {
    // Helper to determine state: 0=Active, 1=Pending, 2=Expired
    const getState = (intel: Intelligence) => {
      if (currentAge >= intel.startMonth && currentAge <= intel.endMonth) return 0;
      if (currentAge < intel.startMonth) return 1;
      return 2;
    };
    
    const stateA = getState(a);
    const stateB = getState(b);
    
    if (stateA !== stateB) return stateA - stateB;
    return parseInt(b.id) - parseInt(a.id); // Newest ID first
  });

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <PixelCard className="w-full max-w-2xl border-retro-accent h-[80vh] flex flex-col" title="商业情报网">
        <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar p-2">
          {sortedLogs.length === 0 ? (
            <div className="text-center text-gray-500 py-20 font-pixel">
              <p className="text-xl">暂无情报</p>
              <p className="text-sm mt-2">多进行交易、招聘或学习，可能意外获得市场风声。</p>
            </div>
          ) : (
            sortedLogs.map(intel => {
              const isExpired = currentAge > intel.endMonth;
              const isActive = currentAge >= intel.startMonth && currentAge <= intel.endMonth;
              const isPending = currentAge < intel.startMonth;
              
              let statusColor = "border-gray-700 opacity-60";
              let statusText = "已过期";
              let statusTextColor = "text-gray-500";
              
              if (isActive) {
                statusColor = "border-retro-accent shadow-[0_0_10px_rgba(204,255,0,0.2)]";
                statusText = "生效中";
                statusTextColor = "text-retro-accent animate-pulse";
              } else if (isPending) {
                statusColor = "border-blue-500";
                statusText = "等待中";
                statusTextColor = "text-blue-400";
              }

              // Resolve target name
              let targetName = "未知";
              if (intel.targetGoodId) {
                targetName = GOODS_DEFINITIONS.find(g => g.id === intel.targetGoodId)?.name || intel.targetGoodId;
              } else if (intel.targetCategory) {
                targetName = `${intel.targetCategory}类`;
              }

              return (
                <div key={intel.id} className={`bg-retro-bg border-2 p-4 relative ${statusColor}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs text-gray-400 font-mono block">[{intel.dateGenerated} 获取]</span>
                      <span className="font-bold text-retro-purple text-sm">来源: {intel.source}</span>
                    </div>
                    <div className={`font-black text-lg font-pixel ${statusTextColor} border border-current px-2`}>
                      {statusText}
                    </div>
                  </div>
                  
                  <p className="text-white text-lg font-pixel mb-3 border-l-2 border-gray-600 pl-3 italic">
                    “{intel.content}”
                  </p>
                  
                  <div className="bg-black/40 p-2 flex justify-between items-center text-sm font-mono text-gray-300">
                    <div className="flex gap-4">
                      <span>目标: <span className="text-white font-bold">{targetName}</span></span>
                      <span>预测: <span className={intel.direction === 'up' ? 'text-red-500' : 'text-green-500'}>{intel.direction === 'up' ? '上涨 ↑' : '下跌 ↓'}</span></span>
                    </div>
                    <div>
                      {isPending ? (
                         <span>预计 {intel.startMonth - currentAge} 个月后生效</span>
                      ) : isActive ? (
                         <span>剩余有效期: {intel.endMonth - currentAge} 个月</span>
                      ) : (
                         <span>失效</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <div className="mt-4 text-center">
          <PixelButton onClick={onClose} className="w-full">关闭情报网</PixelButton>
        </div>
      </PixelCard>
    </div>
  );
};

export default IntelligenceModal;
