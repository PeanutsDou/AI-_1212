
import React, { useState, useEffect } from 'react';
import { PixelCard, PixelButton } from './PixelCard';
import { ENERGY_COST_TRADE } from '../constants';

interface TradeModalProps {
  isOpen: boolean;
  type: 'buy' | 'sell';
  goodName: string;
  price: number;
  maxQuantity: number;
  currentEnergy: number;
  cash: number;
  onConfirm: (quantity: number) => void;
  onClose: () => void;
}

const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  type,
  goodName,
  price,
  maxQuantity,
  currentEnergy,
  cash,
  onConfirm,
  onClose
}) => {
  const [quantity, setQuantity] = useState(1);

  // Reset quantity when modal opens
  useEffect(() => {
    if (isOpen) setQuantity(1);
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate limits based on Energy as well (1 item = 1 energy)
  const maxByEnergy = Math.floor(currentEnergy / ENERGY_COST_TRADE);
  
  // The actual max the user can select is the lowest of all constraints
  const effectiveMax = Math.min(maxQuantity, maxByEnergy);

  const totalCost = quantity * price;
  const totalEnergyCost = quantity * ENERGY_COST_TRADE;

  // Real-time calculations
  const remainingCash = type === 'buy' ? cash - totalCost : cash + totalCost;
  const remainingEnergy = currentEnergy - totalEnergyCost;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <PixelCard className="w-full max-w-lg border-neon-blue animate-bounce-in" title={type === 'buy' ? '批量买入' : '批量卖出'} variant={type === 'buy' ? 'success' : 'danger'}>
        <div className="space-y-4 font-pixel">
          
          <div className="text-center">
             <h3 className="text-3xl text-white mb-1 font-bold">{goodName}</h3>
             <p className="text-slate-400 text-lg">当前单价: <span className="text-yellow-400 font-bold">¥{price}</span></p>
          </div>

          <div className="bg-slate-900 p-4 border border-slate-700">
             <div className="flex justify-between text-sm text-slate-400 mb-2">
               <span>交易数量</span>
               <span>最大可操作: {effectiveMax}</span>
             </div>
             
             <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="1" 
                  max={Math.max(1, effectiveMax)} 
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-neon-blue"
                  disabled={effectiveMax === 0}
                />
                <input 
                  type="number"
                  min="1"
                  max={effectiveMax}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) setQuantity(Math.min(Math.max(1, val), effectiveMax));
                  }}
                  className="w-20 bg-slate-800 border border-slate-600 text-white text-center p-1 font-bold"
                  disabled={effectiveMax === 0}
                />
             </div>
             
             <div className="text-xs text-slate-500 mt-2 text-right">
               (受限于: {effectiveMax === maxQuantity ? (type === 'buy' ? '资金/库容' : '库存') : '精力'})
             </div>
          </div>

          {/* Real-time Impact Analysis */}
          <div className="bg-black border-2 border-dashed border-gray-600 p-3 space-y-3">
             <div className="text-center text-xs text-gray-500 uppercase tracking-widest mb-1">— 交易后状态预览 —</div>
             
             {/* Cash Flow */}
             <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <div className="text-gray-400 text-sm">现金 Cash</div>
                <div className="text-right">
                   <div className="text-sm text-gray-500">当前: ¥{Math.floor(cash).toLocaleString()}</div>
                   <div className={`text-2xl font-black ${remainingCash < 0 ? 'text-red-600' : 'text-white'}`}>
                      → ¥{Math.floor(remainingCash).toLocaleString()}
                   </div>
                </div>
             </div>

             {/* Energy Flow */}
             <div className="flex justify-between items-center">
                <div className="text-gray-400 text-sm">精力 Energy</div>
                <div className="text-right">
                   <div className="text-sm text-gray-500">当前: {currentEnergy}</div>
                   <div className={`text-2xl font-black ${remainingEnergy < 0 ? 'text-red-600' : 'text-yellow-400'}`}>
                      → {remainingEnergy}
                   </div>
                </div>
             </div>
          </div>

          {effectiveMax === 0 && (
             <div className="text-red-500 text-center text-sm bg-red-900/20 p-2 border border-red-900">
               {maxByEnergy === 0 ? "精力不足！" : (type === 'buy' ? "资金或仓库空间不足！" : "没有库存！")}
             </div>
          )}

          <div className="flex gap-3 mt-4">
            <PixelButton 
              className="flex-1" 
              variant="secondary" 
              onClick={onClose}
            >
              取消
            </PixelButton>
            <PixelButton 
              className="flex-1" 
              variant={type === 'buy' ? 'success' : 'danger'}
              onClick={() => onConfirm(quantity)}
              disabled={effectiveMax === 0}
            >
              确认{type === 'buy' ? '买入' : '卖出'}
            </PixelButton>
          </div>
        </div>
      </PixelCard>
    </div>
  );
};

export default TradeModal;
