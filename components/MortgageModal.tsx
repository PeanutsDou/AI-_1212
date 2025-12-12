
import React, { useState } from 'react';
import { PixelCard, PixelButton } from './PixelCard';
import { ENERGY_COST_TRADE } from '../constants';

interface MortgageModalProps {
  goodName: string;
  price: number;
  creditScore: number;
  cash: number;
  currentEnergy: number;
  onConfirm: (downPayment: number, loanAmount: number, months: number) => void;
  onClose: () => void;
}

const MortgageModal: React.FC<MortgageModalProps> = ({
  goodName,
  price,
  creditScore,
  cash,
  currentEnergy,
  onConfirm,
  onClose
}) => {
  const minDownPayment = price * 0.2;
  const [months, setMonths] = useState(120); // Default 10 years

  const maxTerm = Math.min(360, Math.max(60, Math.floor(creditScore * 0.5)));

  const loanAmount = price - minDownPayment;
  const annualRate = 0.05;
  const totalInterest = loanAmount * annualRate * (months / 12);
  const totalRepayment = loanAmount + totalInterest;
  const monthlyPayment = totalRepayment / months;

  const canAffordDownPayment = cash >= minDownPayment;
  const hasEnoughEnergy = currentEnergy >= ENERGY_COST_TRADE;

  const remainingCash = cash - minDownPayment;
  const remainingEnergy = currentEnergy - ENERGY_COST_TRADE;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <PixelCard className="w-full max-w-lg border-retro-dark" title="房产购置 / 按揭">
        <div className="space-y-6 text-retro-dark font-pixel">
          
          <div className="text-center border-b-2 border-retro-dark pb-4">
             <h3 className="text-3xl font-bold mb-1 text-white">{goodName}</h3>
             <p className="text-xl">总价: ¥{price.toLocaleString()}</p>
          </div>

          <div className="space-y-4">
            <div className="p-2 border-2 border-dashed border-retro-dark">
              <div className="flex justify-between mb-2">
                <span>分期期数 (基于信用分)</span>
                <span className="font-bold">{months} 个月 ({Math.floor(months/12)}年)</span>
              </div>
              <input 
                type="range" 
                min="12" 
                max={maxTerm} 
                step="12"
                value={months}
                onChange={(e) => setMonths(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="bg-retro-bg text-retro-dark p-4 border-2 border-retro-dark">
              <div className="flex justify-between mb-1">
                <span>月供 (含5%年息)</span>
                <span className="font-bold text-xl text-white">¥{monthlyPayment.toFixed(0)}</span>
              </div>
              <div className="text-xs opacity-70 text-right">
                总利息: ¥{totalInterest.toFixed(0)}
              </div>
            </div>
            
            {/* Real-time Impact Analysis */}
            <div className="bg-black border-2 border-dashed border-gray-600 p-3 space-y-3">
               <div className="text-center text-xs text-gray-500 uppercase tracking-widest mb-1">— 签约后状态预览 —</div>
               
               {/* Cash Flow */}
               <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <div className="text-gray-400 text-sm">首付 Down Payment</div>
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
          </div>

          {!canAffordDownPayment && (
             <div className="text-center border border-dashed border-red-500 text-red-500 p-2 font-bold">
               现金不足以支付首付!
             </div>
          )}
          
          {!hasEnoughEnergy && (
             <div className="text-center border border-dashed border-yellow-500 text-yellow-500 p-2 font-bold">
               精力不足!
             </div>
          )}

          <div className="flex gap-4 mt-6">
            <PixelButton 
              className="flex-1" 
              variant="secondary" 
              onClick={onClose}
            >
              取消
            </PixelButton>
            <PixelButton 
              className="flex-1" 
              variant="success"
              onClick={() => onConfirm(minDownPayment, loanAmount, months)}
              disabled={!canAffordDownPayment || !hasEnoughEnergy}
            >
              签署合同
            </PixelButton>
          </div>
        </div>
      </PixelCard>
    </div>
  );
};

export default MortgageModal;
