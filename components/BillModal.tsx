
import React, { useState } from 'react';
import { Bill, FinancialReport } from '../types';
import { PixelButton, PixelCard } from './PixelCard';

interface BillModalProps {
  bills: Bill[];
  cash: number;
  report: FinancialReport; // Add report prop
  onConfirm: (paidBillIds: string[]) => void;
}

const BillModal: React.FC<BillModalProps> = ({ bills, cash, report, onConfirm }) => {
  const [selectedBillIds, setSelectedBillIds] = useState<string[]>(
    bills.map(b => b.id) // Default all selected
  );

  const totalSelected = bills
    .filter(b => selectedBillIds.includes(b.id))
    .reduce((sum, b) => sum + b.amount, 0);

  const toggleBill = (id: string) => {
    setSelectedBillIds(prev => 
      prev.includes(id) 
        ? prev.filter(bid => bid !== id) 
        : [...prev, id]
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedBillIds);
  };

  const isAffordable = totalSelected <= cash;
  const remainingCash = cash - totalSelected;

  const totalIncome = report.income.trade + report.income.salary + report.income.rent + report.income.business;
  const totalExpense = report.expense.trade + report.expense.business + report.expense.other; // Bills are future, not past
  const netIncome = totalIncome - totalExpense;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl flex flex-col md:flex-row gap-4">
        
        {/* LEFT: Financial Summary */}
        <PixelCard className="flex-1 bg-retro-bg border-retro-accent animate-bounce-in" title="上月收支报表">
           <div className="space-y-4">
              <div className="text-center p-2 border-b border-gray-700">
                 <div className="text-gray-400 text-sm">净利润 NET PROFIT</div>
                 <div className={`text-3xl font-black ${netIncome >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                   {netIncome >= 0 ? '+' : ''}¥{netIncome.toLocaleString()}
                 </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-green-400">
                  <span>总收入 INCOME</span>
                  <span>+¥{totalIncome.toLocaleString()}</span>
                </div>
                <div className="pl-4 space-y-1 text-gray-400 text-xs">
                  {report.income.trade > 0 && <div className="flex justify-between"><span>交易获利</span><span>{report.income.trade}</span></div>}
                  {report.income.salary > 0 && <div className="flex justify-between"><span>工资收入</span><span>{report.income.salary}</span></div>}
                  {report.income.rent > 0 && <div className="flex justify-between"><span>房产租金</span><span>{report.income.rent}</span></div>}
                  {report.income.business > 0 && <div className="flex justify-between"><span>公司分红</span><span>{report.income.business}</span></div>}
                </div>

                <div className="flex justify-between text-red-400 mt-2">
                  <span>总支出 EXPENSE</span>
                  <span>-¥{totalExpense.toLocaleString()}</span>
                </div>
                <div className="pl-4 space-y-1 text-gray-400 text-xs">
                  {report.expense.trade > 0 && <div className="flex justify-between"><span>进货成本</span><span>{report.expense.trade}</span></div>}
                  {report.expense.business > 0 && <div className="flex justify-between"><span>公司运营</span><span>{report.expense.business}</span></div>}
                  {report.expense.other > 0 && <div className="flex justify-between"><span>杂项支出</span><span>{report.expense.other}</span></div>}
                </div>
              </div>
           </div>
        </PixelCard>

        {/* RIGHT: Bills */}
        <PixelCard className="flex-1 bg-game-card animate-bounce-in border-red-500" title="本月待付账单" variant="danger">
          <div className="mb-4">
            <p className="text-sm mb-2 text-slate-300">请勾选本月要支付的账单。未支付将影响信用。</p>
            <div className="bg-gray-900 border-2 border-slate-700 p-2 max-h-40 overflow-y-auto">
              {bills.length === 0 ? (
                <p className="text-gray-500 text-center">本月没有账单</p>
              ) : (
                bills.map(bill => (
                  <div 
                    key={bill.id} 
                    className="flex items-center justify-between p-2 mb-2 border-b border-gray-800 last:border-0 hover:bg-gray-800 cursor-pointer"
                    onClick={() => toggleBill(bill.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-5 h-5 border-2 flex items-center justify-center transition-all
                        ${selectedBillIds.includes(bill.id) ? 'border-retro-accent bg-black' : 'border-slate-500 bg-transparent'}
                      `}>
                        {selectedBillIds.includes(bill.id) && <span className="text-retro-accent font-black text-lg">✓</span>}
                      </div>
                      <div>
                        <span className="block font-bold text-md text-slate-200">{bill.name}</span>
                        <span className="text-xs text-red-400">拖欠: {Math.max(0, bill.monthGenerated)}个月</span>
                      </div>
                    </div>
                    <span className="font-mono text-lg text-yellow-400">¥{bill.amount}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Real-time Impact Analysis */}
          <div className="bg-black border-2 border-dashed border-gray-600 p-3 space-y-3 mb-4">
             <div className="text-center text-xs text-gray-500 uppercase tracking-widest mb-1">— 支付预览 —</div>
             
             <div className="flex justify-between items-center">
                <div className="text-gray-400 text-sm">现金 Cash</div>
                <div className="text-right">
                   <div className="text-sm text-gray-500">当前: ¥{Math.floor(cash).toLocaleString()}</div>
                   <div className={`text-2xl font-black ${remainingCash < 0 ? 'text-red-600' : 'text-white'}`}>
                      → ¥{Math.floor(remainingCash).toLocaleString()}
                   </div>
                </div>
             </div>
          </div>

          <div className="flex justify-between items-center border-t-2 border-slate-600 pt-4">
            <div>
              <p className={`text-xl font-bold ${!isAffordable ? 'text-red-500' : 'text-slate-100'}`}>
                总计: ¥{totalSelected.toLocaleString()}
              </p>
            </div>
            <PixelButton 
              onClick={handleConfirm}
              disabled={!isAffordable}
              variant={!isAffordable ? 'secondary' : 'success'}
              className="px-4 py-1 text-base"
            >
              {isAffordable ? '确认支付' : '余额不足'}
            </PixelButton>
          </div>
        </PixelCard>
      </div>
    </div>
  );
};

export default BillModal;
