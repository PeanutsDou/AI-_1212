
import React from 'react';
import { PixelCard, PixelButton } from './PixelCard';
import { FinancialReport } from '../types';

interface ReportModalProps {
  report: FinancialReport;
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ report, onClose }) => {
  
  const totalIncome = report.income.trade + report.income.salary + report.income.rent + report.income.business;
  const totalExpense = report.expense.trade + report.expense.business + report.expense.other + report.expense.bills;
  const netIncome = totalIncome - totalExpense;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <PixelCard className="w-full max-w-lg border-retro-accent animate-bounce-in" title="上月收支明细">
        <div className="space-y-6 font-pixel">
          <div className="text-center border-b-2 border-gray-700 pb-4">
             <div className="text-gray-400 text-sm mb-1">NET PROFIT / LOSS</div>
             <div className={`text-5xl font-black ${netIncome >= 0 ? 'text-green-500' : 'text-red-500'} text-shadow-neon`}>
               {netIncome >= 0 ? '+' : ''}¥{Math.floor(netIncome).toLocaleString()}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Income */}
            <div className="bg-black/40 p-3 border border-green-900">
               <div className="text-green-500 font-bold border-b border-green-900 mb-2 pb-1">收入 INCOME</div>
               <div className="space-y-2 text-sm">
                 <div className="flex justify-between">
                   <span className="text-gray-400">交易获利</span>
                   <span className="text-white">¥{Math.floor(report.income.trade).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-400">工资收入</span>
                   <span className="text-white">¥{Math.floor(report.income.salary).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-400">房产租金</span>
                   <span className="text-white">¥{Math.floor(report.income.rent).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-400">企业分红</span>
                   <span className="text-white">¥{Math.floor(report.income.business).toLocaleString()}</span>
                 </div>
                 <div className="border-t border-gray-800 pt-1 flex justify-between font-bold text-green-400 mt-2">
                   <span>总计</span>
                   <span>¥{Math.floor(totalIncome).toLocaleString()}</span>
                 </div>
               </div>
            </div>

            {/* Expense */}
            <div className="bg-black/40 p-3 border border-red-900">
               <div className="text-red-500 font-bold border-b border-red-900 mb-2 pb-1">支出 EXPENSE</div>
               <div className="space-y-2 text-sm">
                 <div className="flex justify-between">
                   <span className="text-gray-400">进货成本</span>
                   <span className="text-white">¥{Math.floor(report.expense.trade).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-400">账单/租金</span>
                   <span className="text-white">¥{Math.floor(report.expense.bills).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-400">企业运营</span>
                   <span className="text-white">¥{Math.floor(report.expense.business).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-400">杂项支出</span>
                   <span className="text-white">¥{Math.floor(report.expense.other).toLocaleString()}</span>
                 </div>
                 <div className="border-t border-gray-800 pt-1 flex justify-between font-bold text-red-400 mt-2">
                   <span>总计</span>
                   <span>¥{Math.floor(totalExpense).toLocaleString()}</span>
                 </div>
               </div>
            </div>
          </div>

          <div className="pt-2 text-center">
            <PixelButton onClick={onClose} className="w-full">确定</PixelButton>
          </div>
        </div>
      </PixelCard>
    </div>
  );
};

export default ReportModal;
