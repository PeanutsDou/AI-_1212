
import { GOODS_DEFINITIONS, RISK_VOLATILITY, WAREHOUSE_DEFINITIONS } from '../constants';
import { GameState, GoodDefinition, Intelligence } from '../types';

export const calculateNextPrice = (
  good: GoodDefinition, 
  currentPrice: number,
  currentAge: number,
  intelligenceLogs: Intelligence[]
): number => {
  const volatility = RISK_VOLATILITY[good.risk];
  const basePrice = good.basePrice;
  const ratio = currentPrice / basePrice;
  
  let changeDirection = Math.random() - 0.5; // -0.5 to 0.5
  
  // Mean reversion
  const reversionStrength = good.risk === '极稳' ? 0.2 : 0.1;
  if (ratio > 1.5) changeDirection -= reversionStrength;
  if (ratio < 0.7) changeDirection += reversionStrength;

  // --- INTELLIGENCE SYSTEM EFFECT ---
  // Check for active intel that targets this good or its category
  const activeIntel = intelligenceLogs.filter(intel => 
    currentAge >= intel.startMonth && 
    currentAge <= intel.endMonth &&
    (intel.targetGoodId === good.id || intel.targetCategory === good.category)
  );

  let intelModifier = 0;

  if (activeIntel.length > 0) {
    // Apply the strongest intel effect found (or sum them up)
    // Here we assume truthful intel forces the direction
    activeIntel.forEach(intel => {
      if (intel.direction === 'up') {
        // Force positive direction and add boost
        intelModifier += 0.15; // Significant boost
      } else {
        // Force negative direction
        intelModifier -= 0.15;
      }
    });
  }
  
  // Apply intel modifier to the direction base
  if (intelModifier !== 0) {
    // If intel is strong 'up', we want to ensure result is positive
    if (intelModifier > 0 && changeDirection < 0) {
      changeDirection = Math.abs(changeDirection); // Flip to positive
    } else if (intelModifier < 0 && changeDirection > 0) {
      changeDirection = -Math.abs(changeDirection); // Flip to negative
    }
    changeDirection += intelModifier;
  }
  // ----------------------------------

  const percentChange = changeDirection * volatility; 
  
  let newPrice = currentPrice * (1 + percentChange);
  
  // Hard floor
  if (newPrice < basePrice * 0.1) newPrice = basePrice * 0.1;
  
  return parseFloat(newPrice.toFixed(2));
};

export const calculateTotalAssets = (state: GameState): number => {
  let assets = state.cash;
  
  // Inventory Value
  Object.values(state.inventory).forEach(item => {
    const currentPrice = state.currentPrices[item.goodId] || 0;
    assets += item.quantity * currentPrice;
  });

  // Warehouse Value
  Object.entries(state.ownedWarehouses).forEach(([id, count]) => {
    const def = WAREHOUSE_DEFINITIONS.find(w => w.id === id);
    if (def) {
      assets += def.price * count;
    }
  });

  return assets;
};

export const calculateCreditScore = (state: GameState): number => {
  const assets = calculateTotalAssets(state);
  // Formula: (Assets / 100) * (0.5 ^ unpaidBills)
  const penalty = Math.pow(0.5, state.unpaidBillCount);
  const score = (assets / 100) * penalty;
  return Math.floor(score);
};

export const getMaxLoanAmount = (creditScore: number): number => {
  return Math.floor(creditScore * 500);
};

export const getEndGameTitle = (assets: number): string => {
  if (assets < 0) return "负债累累的倒霉蛋";
  if (assets < 5000) return "碌碌无为的普通人";
  if (assets < 50000) return "小有积蓄的职员";
  if (assets < 200000) return "精明的中产阶级";
  if (assets < 1000000) return "颇有家资的富商";
  if (assets < 10000000) return "远近闻名的大亨";
  if (assets < 100000000) return "叱咤风云的巨贾";
  return "真正的亿万富翁";
};
