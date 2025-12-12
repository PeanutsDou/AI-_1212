
import React from 'react';
import { PixelCard, PixelButton } from './PixelCard';
import { GameState, InventoryItem } from '../types';
import { WAREHOUSE_DEFINITIONS, GOODS_DEFINITIONS, REAL_ESTATE_DEFINITIONS } from '../constants';

interface AssetModalProps {
  gameState: GameState;
  onClose: () => void;
}

const AssetModal: React.FC<AssetModalProps> = ({ gameState, onClose }) => {
  
  // Calculate specific values
  const cash = gameState.cash;
  
  let warehouseValue = 0;
  Object.entries(gameState.ownedWarehouses).forEach(([id, count]) => {
    const def = WAREHOUSE_DEFINITIONS.find(w => w.id === id);
    if (def) warehouseValue += def.price * (count as number);
  });

  let realEstateValue = 0;
  let commodityValue = 0;
  
  (Object.values(gameState.inventory) as InventoryItem[]).forEach(item => {
    const currentPrice = gameState.currentPrices[item.goodId] || 0;
    const value = item.quantity * currentPrice;
    
    if (REAL_ESTATE_DEFINITIONS.some(r => r.id === item.goodId)) {
      realEstateValue += value;
    } else {
      commodityValue += value;
    }
  });

  const total = cash + warehouseValue + realEstateValue + commodityValue;

  const getPercent = (val: number) => total > 0 ? (val / total * 100).toFixed(1) : '0';

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <PixelCard className="w-full max-w-lg border-retro-accent animate-bounce-in" title="总资产分布">
        <div className="space-y-6">
          <div className="text-center border-b-2 border-dashed border-gray-700 pb-4">
             <div className="text-gray-400 text-sm mb-1">TOTAL ASSETS</div>
             <div className="text-5xl font-black text-white text-shadow-neon font-pixel">¥{Math.floor(total).toLocaleString()}</div>
          </div>

          <div className="space-y-3 font-pixel">
            {/* Cash */}
            <div className="bg-slate-900 p-3 border-l-4 border-green-500 flex justify-between items-center">
               <div>
                 <div className="text-white font-bold text-lg">现金储备</div>
                 <div className="text-xs text-gray-500">LIQUID CASH</div>
               </div>
               <div className="text-right">
                 <div className="text-green-400 font-bold text-xl">¥{Math.floor(cash).toLocaleString()}</div>
                 <div className="text-xs text-gray-500">{getPercent(cash)}%</div>
               </div>
            </div>

            {/* Real Estate */}
            <div className="bg-slate-900 p-3 border-l-4 border-retro-purple flex justify-between items-center">
               <div>
                 <div className="text-white font-bold text-lg">房产价值</div>
                 <div className="text-xs text-gray-500">REAL ESTATE</div>
               </div>
               <div className="text-right">
                 <div className="text-retro-purple font-bold text-xl">¥{Math.floor(realEstateValue).toLocaleString()}</div>
                 <div className="text-xs text-gray-500">{getPercent(realEstateValue)}%</div>
               </div>
            </div>

            {/* Commodity/Inventory */}
            <div className="bg-slate-900 p-3 border-l-4 border-yellow-500 flex justify-between items-center">
               <div>
                 <div className="text-white font-bold text-lg">货物库存</div>
                 <div className="text-xs text-gray-500">INVENTORY</div>
               </div>
               <div className="text-right">
                 <div className="text-yellow-500 font-bold text-xl">¥{Math.floor(commodityValue).toLocaleString()}</div>
                 <div className="text-xs text-gray-500">{getPercent(commodityValue)}%</div>
               </div>
            </div>

            {/* Warehouses */}
            <div className="bg-slate-900 p-3 border-l-4 border-blue-500 flex justify-between items-center">
               <div>
                 <div className="text-white font-bold text-lg">设施资产</div>
                 <div className="text-xs text-gray-500">FACILITIES</div>
               </div>
               <div className="text-right">
                 <div className="text-blue-500 font-bold text-xl">¥{Math.floor(warehouseValue).toLocaleString()}</div>
                 <div className="text-xs text-gray-500">{getPercent(warehouseValue)}%</div>
               </div>
            </div>
          </div>

          <div className="pt-4 text-center">
            <PixelButton onClick={onClose} className="w-full">关闭</PixelButton>
          </div>
        </div>
      </PixelCard>
    </div>
  );
};

export default AssetModal;
