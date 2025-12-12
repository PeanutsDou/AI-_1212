import React from 'react';
import { PixelCard, PixelButton } from './PixelCard';

interface BlockerModalProps {
  missing: ('warehouse' | 'housing')[];
  onRedirect: (tab: 'warehouse' | 'housing') => void;
  onClose: () => void;
}

const BlockerModal: React.FC<BlockerModalProps> = ({ missing, onRedirect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
      <div className="w-full max-w-md border-4 border-retro-accent bg-retro-bg p-1 relative shadow-[0_0_50px_rgba(204,255,0,0.2)]">
        {/* Animated Borders */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-retro-accent -mt-1 -ml-1"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-retro-accent -mt-1 -mr-1"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-retro-accent -mb-1 -ml-1"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-retro-accent -mb-1 -mr-1"></div>

        <div className="p-6 text-center space-y-6">
          <h2 className="text-5xl font-black text-retro-accent tracking-widest animate-pulse">
            ACCESS DENIED
          </h2>
          <div className="h-px w-full bg-retro-accent/50"></div>
          
          <div className="space-y-2">
            <p className="text-xl text-white font-bold">无法执行操作！</p>
            <p className="text-retro-purple text-lg">您必须先完成以下基础设施配置：</p>
          </div>

          <div className="space-y-3">
            {missing.includes('warehouse') && (
              <div className="p-3 border-2 border-dashed border-white bg-retro-card text-white flex justify-between items-center">
                <span className="font-bold text-xl">[!] 未租赁仓库</span>
                <PixelButton variant="primary" onClick={() => onRedirect('warehouse')} className="text-sm py-1">
                  去租赁
                </PixelButton>
              </div>
            )}
            {missing.includes('housing') && (
              <div className="p-3 border-2 border-dashed border-white bg-retro-card text-white flex justify-between items-center">
                <span className="font-bold text-xl">[!] 未解决住房</span>
                <PixelButton variant="primary" onClick={() => onRedirect('housing')} className="text-sm py-1">
                  去租房
                </PixelButton>
              </div>
            )}
          </div>

          <div className="pt-4">
             <button onClick={onClose} className="text-gray-500 hover:text-white underline text-sm">
               暂不操作
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockerModal;