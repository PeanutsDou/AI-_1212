
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  GameState, 
  Bill, 
  Loan, 
  InventoryItem,
  GoodDefinition,
  AttributeType,
  JobDefinition,
  CompanyTypeDefinition,
  FinancialReport,
  Intelligence
} from './types';
import { 
  GOODS_DEFINITIONS,
  COMMODITY_DEFINITIONS,
  REAL_ESTATE_DEFINITIONS,
  WAREHOUSE_DEFINITIONS, 
  HOUSING_OPTIONS, 
  STARTING_CASH, 
  STARTING_AGE_YEARS, 
  RETIREMENT_AGE_YEARS, 
  MAX_ENERGY, 
  ENERGY_COST_WORK, 
  ENERGY_COST_TRADE,
  ATTRIBUTE_TITLES,
  XP_SCALE_FACTOR,
  ENERGY_COST_TRAIN,
  XP_PER_TRAIN,
  JOBS,
  COMPANY_DEFINITIONS,
  EMPLOYEE_POOL,
  NEW_PRODUCTS
} from './constants';
import { 
  calculateNextPrice, 
  calculateCreditScore, 
  getMaxLoanAmount, 
  getEndGameTitle,
  calculateTotalAssets
} from './services/gameLogic';

import { PixelCard, PixelButton } from './components/PixelCard';
import MarketChart from './components/MarketChart';
import BillModal from './components/BillModal';
import TradeModal from './components/TradeModal';
import MortgageModal from './components/MortgageModal';
import BlockerModal from './components/BlockerModal';
import AssetModal from './components/AssetModal';
import ReportModal from './components/ReportModal';
import IntelligenceModal from './components/IntelligenceModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { playSound } from './services/audio';

const CoinIcon = () => <span className="text-retro-accent text-xl mr-2">$</span>;
const WarehouseIcon = () => <span className="text-retro-purple text-xl mr-2">[#]</span>;
const EnergyIcon = () => <span className="text-yellow-400 text-xl mr-2">⚡</span>;
const CalendarIcon = () => <span className="text-blue-400 text-xl mr-2">D</span>;
const TrendIcon = () => <span className="text-green-400 text-xl mr-2">📈</span>;

const initialReport: FinancialReport = {
  month: 0,
  income: { trade: 0, salary: 0, rent: 0, business: 0 },
  expense: { trade: 0, bills: 0, business: 0, other: 0 }
};

const DEFAULT_GAME_STATE: GameState = {
  age: STARTING_AGE_YEARS * 12,
  cash: STARTING_CASH,
  energy: MAX_ENERGY,
  maxEnergy: MAX_ENERGY,
  inventory: {},
  ownedWarehouses: {}, 
  accommodationId: null, 
  currentPrices: GOODS_DEFINITIONS.reduce((acc, good) => ({...acc, [good.id]: good.basePrice}), {}),
  priceHistory: GOODS_DEFINITIONS.reduce((acc, good) => ({...acc, [good.id]: [good.basePrice]}), {}),
  loans: [],
  bills: [],
  unpaidBillCount: 0,
  creditScore: 0,
  attributes: {
    knowledge: { level: 1, xp: 0, title: ATTRIBUTE_TITLES.knowledge[1] },
    physical:  { level: 1, xp: 0, title: ATTRIBUTE_TITLES.physical[1] },
    art:       { level: 1, xp: 0, title: ATTRIBUTE_TITLES.art[1] },
    logic:     { level: 1, xp: 0, title: ATTRIBUTE_TITLES.logic[1] },
    business:  { level: 1, xp: 0, title: ATTRIBUTE_TITLES.business[1] },
  },
  companies: [],
  currentMonthReport: { ...initialReport },
  lastMonthReport: { ...initialReport },
  intelligenceLogs: [],
  logs: ["欢迎来到亿万富翁挑战!", "请先去[仓储中心]和[生活居所]完成租赁。"],
  isGameOver: false
};

const App: React.FC = () => {
  // --- NO PERSISTENCE, DEFAULT STATE ON RELOAD ---
  const [gameState, setGameState] = useState<GameState>(DEFAULT_GAME_STATE);

  const [activeTab, setActiveTab] = useState<'market' | 'real_estate' | 'warehouse' | 'housing' | 'job' | 'bank' | 'self_improvement' | 'business'>('market');
  const [selectedCommodityId, setSelectedCommodityId] = useState<string>(COMMODITY_DEFINITIONS[0].id);
  const [selectedRealEstateId, setSelectedRealEstateId] = useState<string>(REAL_ESTATE_DEFINITIONS[0].id);
  
  // Modals
  const [showBillModal, setShowBillModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showIntelModal, setShowIntelModal] = useState(false);

  const [pendingBills, setPendingBills] = useState<Bill[]>([]);
  
  // Gatekeeper State
  const [blockerState, setBlockerState] = useState<{
    isOpen: boolean;
    missing: ('warehouse' | 'housing')[];
  }>({ isOpen: false, missing: [] });

  const [tradeModal, setTradeModal] = useState<{
    isOpen: boolean;
    type: 'buy' | 'sell';
    goodId: string;
  }>({ isOpen: false, type: 'buy', goodId: '' });

  const [mortgageModal, setMortgageModal] = useState<{
    isOpen: boolean;
    goodId: string;
  }>({ isOpen: false, goodId: '' });

  // Job Market Categories State
  const [expandedJobCategories, setExpandedJobCategories] = useState<Record<string, boolean>>({
    '基础': true
  });

  // Commodity Categories State
  const [expandedMarketCategories, setExpandedMarketCategories] = useState<Record<string, boolean>>({
    '稳定': true, '低风险': true, '中风险': true, '高风险': true, '强高风险': true,
    '入门级': true, '改善级': true, '投资级': true, '奢侈级': true, '消费品': true, '科技': true, '服务': true
  });
  
  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    if (type === 'error') playSound('error');
    if (type === 'success') playSound('success');
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleResetGame = () => {
    if (window.confirm("确定要重新开始吗？所有当前进度将丢失。")) {
      setGameState(DEFAULT_GAME_STATE);
      addLog("游戏已重置。");
      playSound('success');
    }
  };

  const totalAssets = useMemo(() => calculateTotalAssets(gameState), [gameState]);
  const currentCreditScore = useMemo(() => calculateCreditScore(gameState), [gameState]);
  const lastMonthProfit = 
    (gameState.lastMonthReport.income.trade + gameState.lastMonthReport.income.salary + gameState.lastMonthReport.income.rent + gameState.lastMonthReport.income.business) -
    (gameState.lastMonthReport.expense.trade + gameState.lastMonthReport.expense.bills + gameState.lastMonthReport.expense.business + gameState.lastMonthReport.expense.other);

  // --- Change Detection & Notifications ---
  const isFirstRender = useRef(true);
  const prevValues = useRef({
    cash: gameState.cash,
    energy: gameState.energy,
    assets: totalAssets,
    profit: lastMonthProfit,
    age: gameState.age
  });

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const prev = prevValues.current;
    
    // CASH
    const cashDiff = gameState.cash - prev.cash;
    if (Math.abs(cashDiff) >= 1) {
       const sign = cashDiff > 0 ? '+' : '';
       showToast(`现金: ${sign}¥${Math.floor(cashDiff).toLocaleString()} (当前: ¥${Math.floor(gameState.cash).toLocaleString()})`, cashDiff > 0 ? 'success' : 'error');
    }

    // ENERGY
    const energyDiff = gameState.energy - prev.energy;
    if (energyDiff !== 0) {
       const sign = energyDiff > 0 ? '+' : '';
       // Use 'info' style for energy
       showToast(`精力: ${sign}${energyDiff} (当前: ${gameState.energy}/${gameState.maxEnergy})`, 'info');
    }

    // ASSETS
    const assetsDiff = totalAssets - prev.assets;
    // Only show significant asset changes that aren't just cash swaps
    // E.g. Profit from trade, property appreciation, etc.
    if (Math.abs(assetsDiff) >= 1 && Math.abs(assetsDiff - cashDiff) > 1) { 
        const sign = assetsDiff > 0 ? '+' : '';
        showToast(`总资产: ${sign}¥${Math.floor(assetsDiff).toLocaleString()}`, assetsDiff > 0 ? 'success' : 'error');
    }

    // Update Refs
    prevValues.current = {
      cash: gameState.cash,
      energy: gameState.energy,
      assets: totalAssets,
      profit: lastMonthProfit,
      age: gameState.age
    };

  }, [gameState.cash, gameState.energy, gameState.age, totalAssets, lastMonthProfit]);

  
  const totalWarehouseCapacity = useMemo(() => {
    let cap = 0;
    Object.entries(gameState.ownedWarehouses).forEach(([id, count]) => {
      const def = WAREHOUSE_DEFINITIONS.find(w => w.id === id);
      if (def) cap += def.capacity * (count as number);
    });
    return cap;
  }, [gameState.ownedWarehouses]);

  const usedCapacity = useMemo(() => {
    return (Object.values(gameState.inventory) as InventoryItem[]).reduce((sum, item) => {
      const isCommodity = COMMODITY_DEFINITIONS.some(c => c.id === item.goodId);
      const isProduct = NEW_PRODUCTS.some(p => p.id === item.goodId);
      return (isCommodity || isProduct) ? sum + item.quantity : sum;
    }, 0);
  }, [gameState.inventory]);

  const currentAccommodation = useMemo(() => {
    if (!gameState.accommodationId) return null;
    const rental = HOUSING_OPTIONS.find(h => h.id === gameState.accommodationId);
    if (rental) return { ...rental, type: 'rent' };
    const owned = REAL_ESTATE_DEFINITIONS.find(r => r.id === gameState.accommodationId);
    if (owned) return { 
      id: owned.id, 
      name: owned.name, 
      monthlyRent: 0, 
      recoveryRate: owned.recoveryRate || 0.8,
      type: 'owned'
    };
    return null;
  }, [gameState.accommodationId]);

  // Derived state for job categories
  const jobCategories = useMemo(() => {
    const categories = Array.from(new Set(JOBS.map(j => j.category)));
    const grouped: Record<string, JobDefinition[]> = {};
    JOBS.forEach(j => {
      if (!grouped[j.category]) grouped[j.category] = [];
      grouped[j.category].push(j);
    });
    return { categories, grouped };
  }, []);

  const toggleJobCategory = (category: string) => {
    setExpandedJobCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleMarketCategory = (category: string) => {
    setExpandedMarketCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const addLog = (msg: string) => {
    setGameState(prev => ({
      ...prev,
      logs: [msg, ...prev.logs].slice(0, 50)
    }));
  };

  const addIntelligence = (intel: Intelligence) => {
    setGameState(prev => ({
      ...prev,
      intelligenceLogs: [intel, ...prev.intelligenceLogs],
      logs: [`★ 获得情报: 关于${intel.targetGoodId ? GOODS_DEFINITIONS.find(g=>g.id===intel.targetGoodId)?.name : intel.targetCategory}的消息`, ...prev.logs].slice(0, 50)
    }));
    playSound('notification');
    showToast("获得新的市场情报！", "info");
  };

  // --- INTELLIGENCE GENERATOR ---
  const generatePassiveIntelligence = (
    triggerType: 'trade' | 'hr' | 'train' | 'monthly', 
    relatedIdOrCategory?: string,
    overrideProb?: number
  ) => {
    // 1. Check Probability
    let prob = 0;
    if (triggerType === 'trade') prob = 0.05;
    if (triggerType === 'hr') prob = 0.10;
    if (triggerType === 'train') prob = 0.08;
    if (triggerType === 'monthly') prob = 0.075; // 7.5% for info event
    
    if (Math.random() > (overrideProb || prob)) return;

    // 2. Determine Target
    let targetGood: GoodDefinition | undefined;
    let targetCategory: string | undefined;
    
    if (triggerType === 'trade' && relatedIdOrCategory) {
      targetGood = GOODS_DEFINITIONS.find(g => g.id === relatedIdOrCategory);
    } else if (triggerType === 'hr' || triggerType === 'train') {
      // Map attribute/type to good category randomly
      const categories = ['科技', '消费品', '稳定', '高风险', '低风险', '投资级'];
      targetCategory = categories[Math.floor(Math.random() * categories.length)];
      // 70% chance to be specific good in that category
      if (Math.random() < 0.7) {
        const goodsInCat = GOODS_DEFINITIONS.filter(g => g.category === targetCategory);
        if (goodsInCat.length > 0) targetGood = goodsInCat[Math.floor(Math.random() * goodsInCat.length)];
        targetCategory = undefined;
      }
    } else {
      // Random
      targetGood = GOODS_DEFINITIONS[Math.floor(Math.random() * GOODS_DEFINITIONS.length)];
    }

    // 3. Determine Direction & Timeframe
    const direction = Math.random() > 0.5 ? 'up' : 'down';
    const startDelay = Math.floor(Math.random() * 2) + 1; // 1 or 2 months later
    const duration = Math.floor(Math.random() * 2) + 1; // lasts 1 or 2 months

    const currentAge = gameState.age;
    const startMonth = currentAge + startDelay;
    const endMonth = startMonth + duration - 1;

    // 4. Generate Flavor Text
    const name = targetGood ? targetGood.name : `${targetCategory}类商品`;
    let source = "神秘渠道";
    let content = "";

    if (triggerType === 'trade') {
      source = "交易市场";
      content = direction === 'up' 
        ? `听闻大户正在悄悄吸筹${name}，预计近期会有大动作。`
        : `交易员私下透露，${name}的库存积压严重，恐有抛压。`;
    } else if (triggerType === 'hr') {
      source = "员工闲聊";
      content = direction === 'up' 
        ? `新员工提到行业内部正在签订一份关于${name}的重磅协议。`
        : `据员工前公司的消息，${name}的供应链出现了严重过剩。`;
    } else if (triggerType === 'train') {
      source = "专业分析";
      content = direction === 'up' 
        ? `根据你在书中学到的周期理论，${name}即将进入上升通道。`
        : `数据分析显示，${name}的泡沫指标已达峰值，回调风险极大。`;
    } else {
      source = "路边传闻";
      content = direction === 'up' 
        ? `捡到的报纸角落里写着：${name}产区遭遇不可抗力，产量将大减。`
        : `咖啡馆里有人大声谈论${name}的新替代技术即将商用。`;
    }

    const intel: Intelligence = {
      id: Date.now().toString(),
      dateGenerated: `${Math.floor(currentAge/12)}岁${(currentAge%12)+1}月`,
      source,
      content,
      targetGoodId: targetGood?.id,
      targetCategory: targetCategory,
      direction,
      startMonth,
      endMonth,
      isRead: false
    };

    addIntelligence(intel);
  };

  useEffect(() => {
    setGameState(prev => ({ ...prev, creditScore: calculateCreditScore(prev) }));
  }, [gameState.cash, gameState.inventory, gameState.ownedWarehouses, gameState.unpaidBillCount]);

  useEffect(() => {
    let bonus = 0;
    (Object.values(gameState.inventory) as InventoryItem[]).forEach(item => {
      const def = REAL_ESTATE_DEFINITIONS.find(r => r.id === item.goodId);
      if (def && def.maxEnergyBonus) {
        bonus += def.maxEnergyBonus * item.quantity;
      }
    });
    
    setGameState(prev => {
      const newMax = MAX_ENERGY + bonus;
      if (newMax !== prev.maxEnergy) {
        return { ...prev, maxEnergy: newMax };
      }
      return prev;
    });
  }, [gameState.inventory]);

  // --- BUSINESS LOGIC HELPERS ---

  const createCompany = (def: CompanyTypeDefinition) => {
    if (gameState.cash < def.startupCost) {
      showToast("启动资金不足！", "error");
      return;
    }
    // Check Real Estate Requirement
    const ownsReqEstate = (Object.values(gameState.inventory) as InventoryItem[]).some(item => {
       if (item.quantity <= 0) return false;
       const estateDef = REAL_ESTATE_DEFINITIONS.find(r => r.id === item.goodId);
       return estateDef && estateDef.category === def.reqRealEstateType;
    });

    if (!ownsReqEstate) {
      showToast(`缺少经营场所！需要[${def.reqRealEstateType}]`, "error");
      return;
    }

    setGameState(prev => ({
      ...prev,
      cash: prev.cash - def.startupCost,
      currentMonthReport: {
        ...prev.currentMonthReport,
        expense: { ...prev.currentMonthReport.expense, other: prev.currentMonthReport.expense.other + def.startupCost }
      },
      companies: [
        ...prev.companies,
        {
          id: `comp_${Date.now()}`,
          typeId: def.id,
          name: `${def.name} #${prev.companies.length + 1}`,
          level: 1,
          employees: [],
          accumulatedProfit: 0
        }
      ]
    }));
    addLog(`商业帝国: 成立了 ${def.name}`);
    showToast("公司创立成功！", "success");
  };

  const hireEmployee = (companyId: string, employeeId: string) => {
    const company = gameState.companies.find(c => c.id === companyId);
    const empDef = EMPLOYEE_POOL.find(e => e.id === employeeId);
    if (!company || !empDef) return;

    if (company.level < empDef.minCompanyLevel) {
      showToast(`公司等级不足！需要 Lv.${empDef.minCompanyLevel}`, "error");
      return;
    }

    setGameState(prev => ({
      ...prev,
      companies: prev.companies.map(c => 
        c.id === companyId ? { ...c, employees: [...c.employees, employeeId] } : c
      )
    }));
    addLog(`招聘: ${empDef.name} 加入了 ${company.name}`);
    showToast(`成功录用 ${empDef.name}`, "success");
    
    // Trigger Intelligence
    generatePassiveIntelligence('hr');
  };

  // --- GATEKEEPER CHECK ---
  const checkPrerequisites = (): boolean => {
    const missing: ('warehouse' | 'housing')[] = [];
    if (totalWarehouseCapacity === 0) missing.push('warehouse');
    if (!gameState.accommodationId) missing.push('housing');

    if (missing.length > 0) {
      setBlockerState({ isOpen: true, missing });
      return false;
    }
    return true;
  };

  const handleNextMonthClick = () => {
    if (gameState.isGameOver) return;
    
    // 1. Process Business Operations (Simulate last month's production)
    let businessProfit = 0;
    let businessCost = 0;
    let businessLog: string[] = [];

    const nextInventory: Record<string, InventoryItem> = { ...gameState.inventory };
    const tempCompanies = [ ...gameState.companies ];

    tempCompanies.forEach(comp => {
      const def = COMPANY_DEFINITIONS.find(d => d.id === comp.typeId);
      if (!def) return;

      // Production Calculation
      let efficiencyMultiplier = 1;
      comp.employees.forEach(empId => {
        const emp = EMPLOYEE_POOL.find(e => e.id === empId);
        if (emp && emp.buffType === 'efficiency') efficiencyMultiplier += emp.buffValue;
      });

      // Consumption
      let canProduce = true;

      for (const mat of def.rawMaterial) {
        const invItem: InventoryItem | undefined = nextInventory[mat.goodId];
        const needed = Math.floor(mat.amount * comp.level);
        if (!invItem || invItem.quantity < needed) {
          canProduce = false;
          businessLog.push(`${comp.name}: 原料不足 (${GOODS_DEFINITIONS.find(g=>g.id===mat.goodId)?.name})，停产。`);
          break;
        }
      }

      // Costs
      let monthlyOpCost = def.baseMonthlyCost * comp.level;
      let salaries = 0;
      comp.employees.forEach(empId => {
        const emp = EMPLOYEE_POOL.find(e => e.id === empId);
        if (emp) salaries += emp.salary;
      });
      
      const totalCompCost = monthlyOpCost + salaries;
      businessCost += totalCompCost;

      if (canProduce) {
        // Consume
        def.rawMaterial.forEach(mat => {
          const needed = Math.floor(mat.amount * comp.level);
          nextInventory[mat.goodId].quantity -= needed;
        });

        // Produce
        const production = Math.floor(def.baseProduction * comp.level * efficiencyMultiplier);
        
        // Sell immediately to market at current price
        const productPrice = gameState.currentPrices[def.product] || 1;
        const revenue = production * productPrice;
        
        businessProfit += revenue;
        businessLog.push(`${comp.name}: 产出 ${production}，营收 ¥${revenue.toFixed(0)}`);
      }
    });

    // Update Report with Business Data
    const updatedReport: FinancialReport = {
      ...gameState.currentMonthReport,
      income: {
        ...gameState.currentMonthReport.income,
        business: businessProfit
      },
      expense: {
        ...gameState.currentMonthReport.expense,
        business: businessCost
      }
    };
    
    // Calculate Passive Income for Report
    let passiveIncome = 0;
    (Object.values(gameState.inventory) as InventoryItem[]).forEach(item => {
      const def = GOODS_DEFINITIONS.find(g => g.id === item.goodId);
      if (def && def.passiveIncomeRate) {
         passiveIncome += def.basePrice * def.passiveIncomeRate * item.quantity;
      }
    });
    updatedReport.income.rent = passiveIncome;

    setGameState(prev => ({
      ...prev,
      currentMonthReport: updatedReport
    }));

    // Generate Bills
    const newBills: Bill[] = [];
    if (currentAccommodation && currentAccommodation.type === 'rent') {
      newBills.push({
        id: `house_${gameState.age}`,
        name: `${currentAccommodation.name}租金`,
        amount: currentAccommodation.monthlyRent,
        monthGenerated: 0
      });
    }
    gameState.loans.forEach(loan => {
      newBills.push({
        id: `loan_${loan.id}_${gameState.age}`,
        name: loan.name ? `${loan.name}还款` : `贷款还款 (${loan.id.slice(0,4)})`,
        amount: loan.monthlyPayment,
        monthGenerated: 0
      });
    });
    
    const allBillsToPay = [...gameState.bills.map(b => ({...b, monthGenerated: b.monthGenerated + 1})), ...newBills];
    
    setPendingBills(allBillsToPay);
    setShowBillModal(true);
  };

  const proceedToNextMonth = (unpaidBills: Bill[]) => {
    const nextAge = gameState.age + 1;
    if (nextAge >= RETIREMENT_AGE_YEARS * 12) {
      setGameState(prev => ({ ...prev, age: nextAge, isGameOver: true, bills: unpaidBills }));
      return;
    }

    // Trigger Monthly Random Event / Intelligence
    generatePassiveIntelligence('monthly');

    // --- EXECUTE BUSINESS LOGIC (Actual) ---
    // Re-run the logic to apply changes.
    let businessCashDelta = 0;
    let nextInventory = JSON.parse(JSON.stringify(gameState.inventory)) as Record<string, InventoryItem>; // Deep copy with type cast
    const businessLogs: string[] = [];

    const nextCompanies = gameState.companies.map(comp => {
      const def = COMPANY_DEFINITIONS.find(d => d.id === comp.typeId);
      if (!def) return comp;

      let efficiencyMultiplier = 1;
      comp.employees.forEach(empId => {
        const emp = EMPLOYEE_POOL.find(e => e.id === empId);
        if (emp && emp.buffType === 'efficiency') efficiencyMultiplier += emp.buffValue;
      });

      let canProduce = true;
      for (const mat of def.rawMaterial) {
        const invItem = nextInventory[mat.goodId];
        const needed = Math.floor(mat.amount * comp.level);
        if (!invItem || invItem.quantity < needed) {
          canProduce = false;
          businessLogs.push(`[${comp.name}] 原料不足停产`);
          break;
        }
      }

      let monthlyOpCost = def.baseMonthlyCost * comp.level;
      let salaries = 0;
      comp.employees.forEach(empId => {
        const emp = EMPLOYEE_POOL.find(e => e.id === empId);
        if (emp) salaries += emp.salary;
      });
      
      businessCashDelta -= (monthlyOpCost + salaries);

      let revenue = 0;
      if (canProduce) {
        def.rawMaterial.forEach(mat => {
          const needed = Math.floor(mat.amount * comp.level);
          if (nextInventory[mat.goodId]) nextInventory[mat.goodId].quantity -= needed;
        });

        const production = Math.floor(def.baseProduction * comp.level * efficiencyMultiplier);
        const productPrice = gameState.currentPrices[def.product] || 1;
        revenue = production * productPrice;
        businessCashDelta += revenue;
      }
      
      return {
        ...comp,
        accumulatedProfit: comp.accumulatedProfit + (revenue - monthlyOpCost - salaries)
      };
    });
    // --- END BUSINESS LOGIC ---


    // Loan Logic
    const nextLoans = gameState.loans.map(l => ({
      ...l,
      remainingAmount: Math.max(0, l.remainingAmount - (l.monthlyPayment - (l.remainingAmount * l.interestRate / 12))), 
      monthsRemaining: l.monthsRemaining - 1
    })).filter(l => l.monthsRemaining > 0);

    // Price Logic (Updated to use intelligenceLogs)
    const nextPrices: Record<string, number> = {};
    const nextHistory: Record<string, number[]> = { ...gameState.priceHistory };
    GOODS_DEFINITIONS.forEach(good => {
      const currentPrice = gameState.currentPrices[good.id];
      // Pass the *next* age because these prices are for the next month
      const nextPrice = calculateNextPrice(good, currentPrice, nextAge, gameState.intelligenceLogs);
      nextPrices[good.id] = nextPrice;
      const history = [...(gameState.priceHistory[good.id] || [])];
      history.push(nextPrice);
      if (history.length > 20) history.shift();
      nextHistory[good.id] = history;
    });

    // Passive Income (Real Estate)
    let passiveIncome = 0;
    (Object.values(gameState.inventory) as InventoryItem[]).forEach(item => {
      const def = GOODS_DEFINITIONS.find(g => g.id === item.goodId);
      if (def && def.passiveIncomeRate) {
         passiveIncome += def.basePrice * def.passiveIncomeRate * item.quantity;
      }
    });

    setGameState(prev => {
      let recoveryRate = 0;
      if (currentAccommodation) {
        recoveryRate = currentAccommodation.recoveryRate;
      }
      const recoveredAmount = Math.floor(prev.maxEnergy * recoveryRate);
      const nextEnergy = Math.min(prev.maxEnergy, prev.energy + recoveredAmount);
      
      const combinedLogs = [...businessLogs, ...prev.logs].slice(0, 50);

      // Save report for next month display
      const lastMonth = { ...prev.currentMonthReport };

      // Reset Report for next month
      return {
        ...prev,
        age: nextAge,
        energy: nextEnergy, 
        cash: prev.cash + businessCashDelta + passiveIncome,
        inventory: nextInventory,
        companies: nextCompanies,
        currentPrices: nextPrices,
        priceHistory: nextHistory,
        loans: nextLoans,
        bills: unpaidBills,
        unpaidBillCount: unpaidBills.length,
        logs: combinedLogs,
        currentMonthReport: { ...initialReport },
        lastMonthReport: lastMonth
      };
    });
    setShowBillModal(false);
  };

  const handleBillConfirmation = (paidBillIds: string[]) => {
    const totalToPay = pendingBills.filter(b => paidBillIds.includes(b.id)).reduce((sum, b) => sum + b.amount, 0);
    setGameState(prev => ({ 
      ...prev, 
      cash: prev.cash - totalToPay,
      currentMonthReport: {
        ...prev.currentMonthReport,
        expense: { ...prev.currentMonthReport.expense, bills: totalToPay }
      }
    }));
    if (totalToPay > 0) addLog(`支付账单: -¥${totalToPay}`);
    const unpaid = pendingBills.filter(b => !paidBillIds.includes(b.id));
    if (unpaid.length > 0) addLog(`警告: ${unpaid.length}笔账单未支付`);
    proceedToNextMonth(unpaid);
  };

  const initiateTrade = (type: 'buy' | 'sell', goodId: string) => {
    if (!checkPrerequisites()) return;

    const isRealEstate = REAL_ESTATE_DEFINITIONS.some(r => r.id === goodId);
    if (type === 'buy' && isRealEstate) {
      setMortgageModal({ isOpen: true, goodId });
      return;
    }
    if (type === 'buy' && !isRealEstate) {
      if (totalWarehouseCapacity === 0) {
        showToast("你需要先购买一个仓库才能进货！", "error"); // Should be caught by checkPrerequisites, but double safety
        return;
      }
      if (usedCapacity >= totalWarehouseCapacity) {
        showToast("仓库已满！请先购买更多仓库。", "error");
        return;
      }
    }
    if (gameState.energy < ENERGY_COST_TRADE) {
      showToast("精力不足！", "error");
      return;
    }
    setTradeModal({ isOpen: true, type, goodId });
  };

  const handleMortgageConfirm = (downPayment: number, loanAmount: number, months: number) => {
    // Real estate check is handled by initiateTrade, but confirm logic needs safety
    const { goodId } = mortgageModal;
    const def = GOODS_DEFINITIONS.find(g => g.id === goodId);
    if (gameState.energy < ENERGY_COST_TRADE) {
      showToast("精力不足！", "error");
      return;
    }
    setGameState(prev => {
      const currentInv = prev.inventory[goodId] || { goodId, quantity: 0, averageCost: 0 };
      const newQuantity = currentInv.quantity + 1;
      const totalCostBase = prev.currentPrices[goodId];
      const newAvgCost = ((currentInv.averageCost * currentInv.quantity) + totalCostBase) / newQuantity;
      const interestRate = 0.05;
      const totalRepayment = loanAmount * (1 + interestRate * (months / 12));
      const monthlyPayment = parseFloat((totalRepayment / months).toFixed(2));
      const newLoan: Loan = {
        id: Date.now().toString(),
        name: `${def?.name}按揭`,
        principal: loanAmount,
        remainingAmount: totalRepayment,
        monthlyPayment: monthlyPayment,
        monthsRemaining: months,
        interestRate: interestRate
      };
      // Update Report (Expenses)
      const reportUpdate = { ...prev.currentMonthReport };
      reportUpdate.expense.trade += downPayment;

      return {
        ...prev,
        cash: prev.cash - downPayment,
        energy: prev.energy - ENERGY_COST_TRADE,
        inventory: {
          ...prev.inventory,
          [goodId]: { goodId, quantity: newQuantity, averageCost: newAvgCost }
        },
        loans: [...prev.loans, newLoan],
        currentMonthReport: reportUpdate
      };
    });
    addLog(`购入房产: ${def?.name}`);
    showToast("房产按揭办理成功！", "success");
    setMortgageModal({ isOpen: false, goodId: '' });
  };

  const handleTradeConfirm = (quantity: number) => {
    const { type, goodId } = tradeModal;
    const price = gameState.currentPrices[goodId];
    const energyCost = quantity * ENERGY_COST_TRADE;
    const def = GOODS_DEFINITIONS.find(g => g.id === goodId);

    if (type === 'buy') {
      const cost = price * quantity;
      setGameState(prev => {
        const currentInv = prev.inventory[goodId] || { goodId, quantity: 0, averageCost: 0 };
        const newQuantity = currentInv.quantity + quantity;
        const newAvgCost = ((currentInv.averageCost * currentInv.quantity) + cost) / newQuantity;
        
        // Report Update
        const report = { ...prev.currentMonthReport };
        report.expense.trade += cost;

        return {
          ...prev,
          cash: parseFloat((prev.cash - cost).toFixed(2)),
          energy: prev.energy - energyCost,
          inventory: {
            ...prev.inventory,
            [goodId]: { goodId, quantity: newQuantity, averageCost: newAvgCost }
          },
          currentMonthReport: report
        };
      });
      addLog(`买入: ${def?.name} x${quantity}`);
      showToast(`成功买入 ${quantity}个 ${def?.name}`, "success");
    } else {
      const revenue = price * quantity;
      setGameState(prev => {
        const currentInv = prev.inventory[goodId];
        const newQuantity = currentInv.quantity - quantity;
        const newInventory = { ...prev.inventory };

        // Report Update
        const report = { ...prev.currentMonthReport };
        report.income.trade += revenue;

        if (newQuantity === 0) {
          delete newInventory[goodId];
          if (prev.accommodationId === goodId) {
             return {
               ...prev,
               cash: parseFloat((prev.cash + revenue).toFixed(2)),
               energy: prev.energy - energyCost,
               inventory: newInventory,
               accommodationId: null,
               currentMonthReport: report
             }
          }
        } else {
          newInventory[goodId] = { ...currentInv, quantity: newQuantity };
        }
        return {
          ...prev,
          cash: parseFloat((prev.cash + revenue).toFixed(2)),
          energy: prev.energy - energyCost,
          inventory: newInventory,
          currentMonthReport: report
        };
      });
      addLog(`卖出: ${def?.name} x${quantity}`);
      showToast(`成功卖出 ${quantity}个 ${def?.name}`, "success");
    }
    
    // Trigger Trade Intelligence
    // Threshold: > 50 quantity OR > 2000 value
    if (quantity >= 50 || (quantity * price) >= 2000) {
      generatePassiveIntelligence('trade', goodId);
    }

    setTradeModal({ ...tradeModal, isOpen: false });
  };

  const workJob = (job: JobDefinition) => {
    if (!checkPrerequisites()) return;

    if (gameState.energy < job.energyCost) {
      showToast("精力不足！", "error");
      return;
    }
    setGameState(prev => ({
      ...prev,
      cash: prev.cash + job.salary,
      energy: prev.energy - job.energyCost,
      currentMonthReport: {
        ...prev.currentMonthReport,
        income: { ...prev.currentMonthReport.income, salary: prev.currentMonthReport.income.salary + job.salary }
      }
    }));
    addLog(`职业收入: +¥${job.salary} (${job.name})`);
    showToast(`完成工作: ${job.name} +¥${job.salary}`, "success");
  };

  const trainAttribute = (type: AttributeType) => {
    if (gameState.energy < ENERGY_COST_TRAIN) {
      showToast("精力不足！", "error");
      return;
    }

    setGameState(prev => {
      const attr = prev.attributes[type];
      if (attr.level >= 10) return prev; // Max level

      const nextXp = attr.xp + XP_PER_TRAIN;
      const xpNeeded = attr.level * XP_SCALE_FACTOR;
      
      let newLevel = attr.level;
      let newXp = nextXp;
      let leveledUp = false;

      if (newXp >= xpNeeded && newLevel < 10) {
        newLevel++;
        newXp = 0; // Reset XP for next level
        leveledUp = true;
      }

      const newAttributes = {
        ...prev.attributes,
        [type]: {
          level: newLevel,
          xp: newXp,
          title: ATTRIBUTE_TITLES[type][newLevel]
        }
      };

      if (leveledUp) {
         showToast(`属性升级！${type} Lv.${newLevel}`, "success");
         return {
            ...prev,
            energy: prev.energy - ENERGY_COST_TRAIN,
            attributes: newAttributes,
            logs: [`提升: [${type === 'knowledge' ? '知识' : type === 'physical' ? '体能' : type === 'art' ? '艺术' : type === 'logic' ? '逻辑' : '商业'}] 达到 Lv.${newLevel} ${ATTRIBUTE_TITLES[type][newLevel]}`, ...prev.logs].slice(0, 50)
         };
      }

      return {
        ...prev,
        energy: prev.energy - ENERGY_COST_TRAIN,
        attributes: newAttributes
      };
    });

    // Trigger Training Intelligence
    generatePassiveIntelligence('train');
  };

  const buyWarehouse = (whId: string) => {
    // Warehouse doesn't require checkPrerequisites :)
    const def = WAREHOUSE_DEFINITIONS.find(w => w.id === whId);
    if (!def) return;
    if (gameState.cash < def.price) {
      showToast("现金不足！", "error");
      return;
    }
    setGameState(prev => ({
      ...prev,
      cash: prev.cash - def.price,
      ownedWarehouses: {
        ...prev.ownedWarehouses,
        [whId]: (prev.ownedWarehouses[whId] || 0) + 1
      },
      currentMonthReport: {
        ...prev.currentMonthReport,
        expense: { ...prev.currentMonthReport.expense, other: prev.currentMonthReport.expense.other + def.price }
      }
    }));
    addLog(`扩建仓库: ${def.name}`);
    showToast("仓库扩容成功！", "success");
  };

  const setAccommodation = (id: string) => {
    // Housing doesn't require checkPrerequisites :)
    setGameState(prev => ({ ...prev, accommodationId: id }));
    addLog(`搬家: 入住 ${id.startsWith('house') ? HOUSING_OPTIONS.find(h=>h.id===id)?.name : REAL_ESTATE_DEFINITIONS.find(r=>r.id===id)?.name}`);
    showToast("搬家成功！", "success");
  };

  const takeLoan = (amount: number, months: number) => {
    if (!checkPrerequisites()) return;

    const maxLoan = getMaxLoanAmount(currentCreditScore);
    if (amount > maxLoan) {
      showToast("信用额度不足！", "error");
      return;
    }
    const interestRate = 0.05;
    const totalRepayment = amount * (1 + interestRate * (months / 12));
    const monthlyPayment = parseFloat((totalRepayment / months).toFixed(2));
    const newLoan: Loan = {
      id: Date.now().toString(),
      principal: amount,
      remainingAmount: totalRepayment,
      monthlyPayment: monthlyPayment,
      monthsRemaining: months,
      interestRate: interestRate
    };
    setGameState(prev => ({
      ...prev,
      cash: prev.cash + amount,
      loans: [...prev.loans, newLoan]
    }));
    addLog(`贷款: +¥${amount}`);
    showToast(`成功贷款 ¥${amount}`, "success");
  };

  const repayLoanEarly = (loan: Loan) => {
    // Validate existence of loan in current state to avoid race conditions
    if (!gameState.loans.find(l => l.id === loan.id)) {
      showToast("该笔贷款已结清", "error");
      return;
    }

    if (gameState.cash < loan.remainingAmount) {
      showToast(`现金不足！需要 ¥${loan.remainingAmount.toFixed(0)}`, "error");
      return;
    }

    if (window.confirm(`确定要花费 ¥${loan.remainingAmount.toFixed(0)} 提前还清这笔贷款吗？`)) {
      setGameState(prev => ({
        ...prev,
        cash: prev.cash - loan.remainingAmount,
        loans: prev.loans.filter(l => l.id !== loan.id),
        currentMonthReport: {
          ...prev.currentMonthReport,
          expense: { ...prev.currentMonthReport.expense, bills: prev.currentMonthReport.expense.bills + loan.remainingAmount }
        }
      }));
      addLog(`提前还款: -¥${loan.remainingAmount.toFixed(0)}`);
      showToast("贷款已还清！", "success");
    }
  };

  const getModalMaxQuantity = () => {
    const { type, goodId } = tradeModal;
    if (!goodId) return 0;
    const price = gameState.currentPrices[goodId];
    // Allow buying products as commodities
    const isCommodity = COMMODITY_DEFINITIONS.some(c => c.id === goodId) || NEW_PRODUCTS.some(p => p.id === goodId);
    if (type === 'buy') {
      const maxByCash = Math.floor(gameState.cash / price);
      if (isCommodity) {
        const availableSpace = Math.max(0, totalWarehouseCapacity - usedCapacity);
        return Math.min(maxByCash, availableSpace);
      } else {
        return maxByCash;
      }
    } else {
      return gameState.inventory[goodId]?.quantity || 0;
    }
  };
  
  // Navigation helper for inventory click
  const handleInventoryClick = (goodId: string) => {
    // Check if it's a commodity/product (marketable)
    if (COMMODITY_DEFINITIONS.some(c => c.id === goodId) || NEW_PRODUCTS.some(p => p.id === goodId)) {
      setSelectedCommodityId(goodId);
      setActiveTab('market');
      // Scroll to top
      window.scrollTo(0,0);
    } else if (REAL_ESTATE_DEFINITIONS.some(r => r.id === goodId)) {
      setSelectedRealEstateId(goodId);
      setActiveTab('real_estate');
      window.scrollTo(0,0);
    }
    setShowAssetModal(false);
  };

  const renderTabButton = (id: string, label: string) => (
    <button 
      key={id}
      onClick={() => { setActiveTab(id as any); playSound('click'); }}
      className={`
        flex-1 min-w-[80px] py-2 px-1 border-2 font-black text-lg transition-all uppercase tracking-tighter font-pixel
        ${activeTab === id 
          ? 'bg-retro-accent text-black border-white shadow-[0_0_10px_rgba(204,255,0,0.5)] transform -translate-y-0.5' 
          : 'bg-retro-bg text-gray-500 border-retro-border hover:bg-gray-800 hover:text-white'}
      `}
    >
      {label}
    </button>
  );
  
  if (gameState.isGameOver) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-retro-bg text-retro-accent font-pixel p-4">
        <div className="max-w-3xl w-full text-center space-y-8 border-4 border-retro-accent p-8 bg-retro-card shadow-pixel animate-pulse">
          <h1 className="text-8xl font-black font-pixel tracking-widest text-white">GAME OVER</h1>
          <div className="text-3xl space-y-6 font-pixel">
            <p className="text-retro-purple">享年: {Math.floor(gameState.age / 12)} 岁</p>
            <p>总资产: ¥{totalAssets.toFixed(0)}</p>
            <div className="mt-12 pt-12 border-t-4 border-dashed border-white">
              <span className="text-6xl block text-retro-accent font-pixel">{getEndGameTitle(totalAssets)}</span>
            </div>
          </div>
          <button 
            onClick={handleResetGame}
            className="mt-16 px-12 py-6 bg-retro-accent text-black font-black text-3xl hover:bg-white hover:text-black font-pixel"
          >
            RESTART
          </button>
        </div>
      </div>
    );
  }

  // Refactored Market View with Collapsible Categories
  const renderMarketView = (
    definitions: GoodDefinition[], 
    selectedId: string, 
    setSelectedId: (id: string) => void,
    title: string
  ) => {
    
    // Group definitions by Category
    const grouped: Record<string, GoodDefinition[]> = {};
    const categories: string[] = [];
    
    definitions.forEach(d => {
      if (!grouped[d.category]) {
        grouped[d.category] = [];
        categories.push(d.category);
      }
      grouped[d.category].push(d);
    });

    return (
      <div className="flex flex-col lg:flex-row gap-4 h-[600px]">
        {/* Chart Area (Left/Top) */}
        <div className="flex-grow lg:w-3/4 flex flex-col h-full">
          <PixelCard title={`${title}走势`} className="flex-grow flex flex-col h-full">
            {selectedId && (
              <>
                <div className="flex flex-wrap justify-between items-end mb-4 pb-4 border-b-2 border-retro-border">
                  <div>
                    <h2 className="text-5xl font-black mb-1 text-white uppercase tracking-widest text-shadow-neon font-pixel">
                      {definitions.find(g => g.id === selectedId)?.name}
                    </h2>
                    <p className="text-retro-purple font-bold text-lg font-pixel">{definitions.find(g => g.id === selectedId)?.description}</p>
                    {definitions.find(g => g.id === selectedId)?.maxEnergyBonus && (
                      <span className="text-sm bg-retro-purple text-white px-2 mt-1 inline-block font-bold mr-2">
                        精力上限 +{definitions.find(g => g.id === selectedId)?.maxEnergyBonus}
                      </span>
                    )}
                    {definitions.find(g => g.id === selectedId)?.passiveIncomeRate && (
                      <span className="text-sm bg-green-600 text-white px-2 mt-1 inline-block font-bold">
                        月租收益 {(definitions.find(g => g.id === selectedId)?.passiveIncomeRate! * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-6xl font-black text-retro-accent drop-shadow-[0_0_10px_rgba(204,255,0,0.5)] font-pixel">
                      ¥{gameState.currentPrices[selectedId].toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex-grow p-2 border-2 border-retro-border mb-4 overflow-hidden relative bg-black/30">
                   <MarketChart 
                      data={(gameState.priceHistory[selectedId] || []).map((p, i) => ({ month: i, price: p }))}
                      goodName={definitions.find(g => g.id === selectedId)?.name || ''}
                      averageCost={gameState.inventory[selectedId]?.averageCost}
                   />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 bg-retro-card p-2 border-2 border-retro-border flex items-center justify-between px-4">
                     <span className="text-lg text-gray-400 font-pixel">持有量</span>
                     <span className="font-bold text-2xl text-white font-pixel">{gameState.inventory[selectedId]?.quantity || 0}</span>
                  </div>
                  <PixelButton onClick={() => initiateTrade('buy', selectedId)} variant="success" className="w-32">
                    {definitions[0].type === 'real_estate' ? '购买' : '买入'}
                  </PixelButton>
                  <PixelButton onClick={() => initiateTrade('sell', selectedId)} variant="danger" className="w-32">
                    卖出
                  </PixelButton>
                </div>
              </>
            )}
          </PixelCard>
        </div>

        {/* List Area (Right/Bottom) */}
        <div className="lg:w-1/4 h-full flex flex-col">
          <PixelCard className="h-full flex flex-col p-2 bg-retro-card">
            <h4 className="text-xl font-black border-b-2 border-retro-accent mb-2 pb-1 text-center text-retro-accent uppercase tracking-widest font-pixel">{title}列表</h4>
            <div className="flex-grow overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              {categories.map(category => (
                <div key={category} className="border border-retro-border bg-black/20">
                   <button 
                     onClick={() => { toggleMarketCategory(category); playSound('click'); }}
                     className={`w-full p-2 flex justify-between items-center transition-all ${expandedMarketCategories[category] ? 'bg-retro-card text-white' : 'bg-transparent text-gray-400 hover:text-white'}`}
                   >
                     <span className="font-bold text-sm font-pixel uppercase">{category}</span>
                     <span className="font-bold font-pixel text-xs">{expandedMarketCategories[category] ? '[-]' : '[+]'}</span>
                   </button>
                   
                   {expandedMarketCategories[category] && (
                     <div className="animate-fadeIn">
                       {grouped[category].map(g => {
                         const currentPrice = gameState.currentPrices[g.id];
                         const history = gameState.priceHistory[g.id];
                         const prevPrice = history[history.length - 2] || g.basePrice;
                         const isUp = currentPrice >= prevPrice;
                         const isSelected = selectedId === g.id;
                         return (
                           <button 
                             key={g.id} 
                             onClick={() => { setSelectedId(g.id); playSound('click'); }}
                             className={`
                               w-full p-2 border-b border-gray-800 text-left transition-all relative group last:border-0
                               ${isSelected ? 'bg-retro-accent/20 text-white' : 'text-gray-300 hover:bg-white/5'}
                             `}
                           >
                              <div className="flex justify-between items-center">
                                 <span className={`font-bold text-md font-pixel ${isSelected ? 'text-retro-accent' : ''}`}>{g.name}</span>
                                 <div className="text-right">
                                   <div className={`font-pixel font-bold ${isUp ? 'text-red-500' : 'text-green-500'}`}>¥{currentPrice.toLocaleString()}</div>
                                 </div>
                              </div>
                              {gameState.inventory[g.id]?.quantity > 0 && (
                                <div className="text-[10px] text-retro-purple font-bold mt-1 text-right">已持仓</div>
                              )}
                           </button>
                         )
                       })}
                     </div>
                   )}
                </div>
              ))}
            </div>
          </PixelCard>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen max-w-[1600px] mx-auto p-4 pb-32 font-pixel text-lg text-white">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <div className="mb-6 text-center pt-4">
         <h1 className="text-7xl font-black tracking-[0.1em] uppercase text-retro-accent text-shadow-neon italic transform -skew-x-6 inline-block border-b-4 border-retro-purple pb-2 font-pixel">
            BILLIONAIRE
         </h1>
         <div className="text-xl tracking-[0.5em] mt-2 text-retro-purple font-bold font-pixel">PIXEL TYCOON SIMULATOR</div>
      </div>

      <header className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* GROUP 1: FINANCES (Cash & Assets) */}
        <PixelCard 
          onClick={() => setShowAssetModal(true)} 
          className="flex flex-col justify-center cursor-pointer relative group"
        >
          <div className="absolute top-2 right-2 text-xs text-gray-500 group-hover:text-retro-accent">[详情]</div>
          <div className="flex items-center gap-4 mb-2 border-b border-gray-800 pb-2">
            <div className="p-3 border-2 border-retro-accent bg-retro-bg"><CoinIcon /></div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-pixel">现金储备 Cash</div>
              <div className="font-black text-3xl text-white font-pixel">¥{gameState.cash.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 border-2 border-retro-purple bg-retro-bg"><WarehouseIcon /></div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-pixel">总资产 Assets</div>
              <div className="font-black text-3xl text-retro-purple font-pixel">¥{Math.floor(totalAssets).toLocaleString()}</div>
            </div>
          </div>
        </PixelCard>

        {/* GROUP 2: STATUS (Age & Energy) */}
        <PixelCard className="flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-2 border-b border-gray-800 pb-2">
            <div className="p-3 border-2 border-blue-400 bg-retro-bg"><CalendarIcon /></div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-pixel">年龄 Age</div>
              <div className="font-black text-3xl text-white font-pixel">{Math.floor(gameState.age / 12)}岁 <span className="text-xl text-gray-400">{(gameState.age % 12) + 1}月</span></div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 border-2 border-yellow-400 bg-retro-bg"><EnergyIcon /></div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-pixel">精力 Energy</div>
              <div className="font-black text-3xl text-retro-accent font-pixel">{gameState.energy}<span className="text-xl text-gray-500">/{gameState.maxEnergy}</span></div>
            </div>
          </div>
        </PixelCard>

        {/* GROUP 3: LAST MONTH REPORT */}
        <PixelCard 
          onClick={() => setShowReportModal(true)} 
          className="flex flex-col justify-center items-center cursor-pointer relative group"
        >
          <div className="absolute top-2 right-2 text-xs text-gray-500 group-hover:text-retro-accent">[报表]</div>
          <div className="flex items-center mb-4">
             <TrendIcon />
             <span className="text-lg text-gray-400 font-pixel uppercase tracking-widest">上月盈亏 Last Month</span>
          </div>
          <div className={`text-6xl font-black font-pixel ${lastMonthProfit >= 0 ? 'text-green-400' : 'text-red-500'} text-shadow-neon`}>
             {lastMonthProfit >= 0 ? '+' : ''}¥{Math.floor(lastMonthProfit).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-2 font-pixel">点击查看详细收支明细</div>
        </PixelCard>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT: ASSETS - INCREASED FONT SIZE */}
        <div className="xl:col-span-3 xl:sticky xl:top-4 space-y-6">
          <PixelCard title="我的资产" className="h-full flex flex-col min-h-[500px]">
            <div className="mb-4 p-2 border-2 border-white bg-retro-bg">
              <div className="flex justify-between text-base font-bold mb-2 font-pixel">
                 <span>仓库容量 CAPACITY</span>
                 <span className="text-retro-accent">{usedCapacity} / {totalWarehouseCapacity}</span>
              </div>
              <div className="w-full border-2 border-white h-4 relative bg-gray-900">
                 <div 
                   className="h-full bg-retro-accent" 
                   style={{ width: `${Math.min(100, totalWarehouseCapacity > 0 ? (usedCapacity / totalWarehouseCapacity) * 100 : 0)}%` }}
                 />
              </div>
            </div>

            <div className="space-y-3 flex-grow overflow-y-auto max-h-[600px] pr-1 scrollbar-thin">
              <h4 className="text-lg font-black uppercase tracking-widest border-b-2 border-retro-purple pb-1 mb-2 text-retro-purple font-pixel">库存 INVENTORY</h4>
              {(Object.values(gameState.inventory) as InventoryItem[])
                .filter(item => COMMODITY_DEFINITIONS.some(c => c.id === item.goodId) || NEW_PRODUCTS.some(p => p.id === item.goodId))
                .map(item => {
                const def = GOODS_DEFINITIONS.find(g => g.id === item.goodId);
                const currPrice = gameState.currentPrices[item.goodId];
                const profit = (currPrice - item.averageCost) * item.quantity;
                return (
                  <div 
                    key={item.goodId} 
                    className="p-3 border border-gray-600 bg-retro-bg cursor-pointer hover:border-retro-accent hover:bg-gray-800 transition-colors group"
                    onClick={() => handleInventoryClick(item.goodId)}
                    title="点击跳转到市场交易"
                  >
                    <div className="flex justify-between items-center font-pixel text-lg">
                      <span className="font-bold text-white group-hover:text-retro-accent">{def?.name} x{item.quantity}</span>
                      <span className={`font-black ${profit >= 0 ? 'text-retro-accent' : 'text-red-500'}`}>{profit >= 0 ? '+' : ''}{profit.toFixed(0)}</span>
                    </div>
                  </div>
                );
              })}
              
              <h4 className="text-lg font-black uppercase tracking-widest border-b-2 border-retro-purple pb-1 mb-2 mt-6 text-retro-purple font-pixel">不动产 ESTATE</h4>
              {(Object.values(gameState.inventory) as InventoryItem[])
                 .filter(item => REAL_ESTATE_DEFINITIONS.some(c => c.id === item.goodId))
                 .map(item => {
                 const def = GOODS_DEFINITIONS.find(g => g.id === item.goodId);
                 return (
                   <div 
                     key={item.goodId} 
                     className="p-3 border border-retro-purple bg-retro-purple/20 text-white cursor-pointer hover:border-white transition-colors"
                     onClick={() => handleInventoryClick(item.goodId)}
                     title="点击查看详情"
                    >
                     <div className="flex justify-between font-pixel text-lg">
                        <span className="font-bold">{def?.name}</span>
                        <span className="font-mono">x{item.quantity}</span>
                     </div>
                   </div>
                 );
              })}
            </div>
          </PixelCard>
        </div>

        {/* CENTER: TABS */}
        <div className="xl:col-span-6 space-y-6">
          <div className="flex flex-col gap-3 p-3 bg-retro-card border-2 border-retro-border">
            
            {/* Group 1: Basics & Trade */}
            <div>
              <div className="text-xs text-retro-purple mb-1 font-bold uppercase tracking-widest pl-1 font-pixel">基础 & 交易</div>
              <div className="flex gap-2">
                {renderTabButton('housing', '生活居所')}
                {renderTabButton('warehouse', '仓储中心')}
                {renderTabButton('market', '交易市场')}
              </div>
            </div>

            {/* Group 2: Work & Skills */}
            <div>
              <div className="text-xs text-retro-purple mb-1 font-bold uppercase tracking-widest pl-1 font-pixel">成长 & 工作</div>
              <div className="flex gap-2">
                {renderTabButton('self_improvement', '自我提升')}
                {renderTabButton('job', '人才市场')}
              </div>
            </div>

            {/* Group 3: Investment & Finance */}
            <div>
              <div className="text-xs text-retro-purple mb-1 font-bold uppercase tracking-widest pl-1 font-pixel">资产 & 资本</div>
              <div className="flex gap-2">
                {renderTabButton('real_estate', '房产投资')}
                {renderTabButton('business', '商业帝国')}
                {renderTabButton('bank', '中央银行')}
              </div>
            </div>

          </div>

          <div className="min-h-[600px]">
            {activeTab === 'market' && (
               <div className="space-y-4">
                 {renderMarketView([...COMMODITY_DEFINITIONS, ...NEW_PRODUCTS], selectedCommodityId, setSelectedCommodityId, 'COMMODITIES')}
               </div>
            )}
            
            {activeTab === 'real_estate' && (
              <div className="space-y-4">
                {renderMarketView(REAL_ESTATE_DEFINITIONS, selectedRealEstateId, setSelectedRealEstateId, 'REAL ESTATE')}
              </div>
            )}

            {/* NEW: BUSINESS EMPIRE TAB */}
            {activeTab === 'business' && (
              <div className="space-y-6">
                 {/* Create New Company Section */}
                 <PixelCard title="创立公司" className="border-retro-accent">
                    <div className="grid grid-cols-1 gap-4">
                      {COMPANY_DEFINITIONS.map(def => {
                        const attributeReq = gameState.attributes[def.reqAttribute.type];
                        const meetsAttr = attributeReq.level >= def.reqAttribute.level;
                        const meetsMoney = gameState.cash >= def.startupCost;

                        return (
                          <div key={def.id} className="p-4 border-2 border-gray-700 bg-retro-bg relative">
                            <div className="flex justify-between items-start mb-2">
                               <div>
                                 <h4 className="text-2xl font-black text-white">{def.name}</h4>
                                 <p className="text-gray-400 text-sm">{def.description}</p>
                               </div>
                               <div className="text-right">
                                 <div className="text-retro-accent font-black text-xl">¥{def.startupCost.toLocaleString()}</div>
                                 <div className="text-xs text-gray-500">启动资金</div>
                               </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-xs text-gray-300 my-3">
                               <div>
                                 <span className="block text-gray-500">经营场所要求</span>
                                 <span className="font-bold text-white">{def.reqRealEstateType}</span>
                               </div>
                               <div>
                                 <span className="block text-gray-500">能力要求</span>
                                 <span className={meetsAttr ? 'text-green-500' : 'text-red-500'}>
                                   {def.reqAttribute.type} Lv.{def.reqAttribute.level}
                                 </span>
                               </div>
                            </div>

                            <PixelButton 
                              onClick={() => createCompany(def)}
                              disabled={!meetsAttr || !meetsMoney}
                              className="w-full py-2 text-sm"
                              variant={meetsAttr && meetsMoney ? 'success' : 'secondary'}
                            >
                              创立企业
                            </PixelButton>
                          </div>
                        );
                      })}
                    </div>
                 </PixelCard>

                 {/* My Companies Section */}
                 <PixelCard title="我的企业" className="border-white">
                    {gameState.companies.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">暂无公司，请先积累资本和能力。</div>
                    ) : (
                      <div className="space-y-6">
                        {gameState.companies.map(comp => {
                           const def = COMPANY_DEFINITIONS.find(d => d.id === comp.typeId)!;
                           const productDef = NEW_PRODUCTS.find(p => p.id === def.product);
                           
                           return (
                             <div key={comp.id} className="border-2 border-retro-accent bg-black/50 p-4">
                                <div className="flex justify-between items-end border-b border-gray-700 pb-2 mb-4">
                                   <div>
                                     <h3 className="text-2xl font-black text-white">{comp.name} <span className="text-sm bg-retro-purple px-2 py-0.5 ml-2">Lv.{comp.level}</span></h3>
                                     <div className="text-xs text-green-400 mt-1">累计利润: ¥{comp.accumulatedProfit.toLocaleString()}</div>
                                   </div>
                                   <div className="text-right text-xs text-gray-400">
                                      员工数: {comp.employees.length}
                                   </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   {/* Production Info */}
                                   <div className="bg-retro-bg p-3 border border-gray-700">
                                      <h4 className="text-sm font-bold text-retro-purple mb-2">生产概况 (月度)</h4>
                                      <div className="text-xs space-y-1">
                                         <div className="flex justify-between">
                                           <span>消耗原料:</span>
                                           <span>
                                             {def.rawMaterial.map(m => {
                                               const g = GOODS_DEFINITIONS.find(x => x.id === m.goodId);
                                               return `${g?.name} x${m.amount * comp.level} `;
                                             })}
                                           </span>
                                         </div>
                                         <div className="flex justify-between">
                                           <span>预计产出:</span>
                                           <span className="text-white font-bold">{productDef?.name} x{def.baseProduction * comp.level}</span>
                                         </div>
                                         <div className="flex justify-between text-gray-500 pt-1 border-t border-gray-800 mt-1">
                                            <span>运营成本:</span>
                                            <span>¥{def.baseMonthlyCost * comp.level} + 工资</span>
                                         </div>
                                      </div>
                                   </div>

                                   {/* Employee Management */}
                                   <div className="bg-retro-bg p-3 border border-gray-700">
                                      <h4 className="text-sm font-bold text-retro-purple mb-2">人力资源</h4>
                                      <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                                         {comp.employees.map(empId => {
                                            const e = EMPLOYEE_POOL.find(x => x.id === empId);
                                            return e ? (
                                              <div key={empId} className="flex justify-between text-xs text-gray-300 border-b border-gray-800 pb-1">
                                                <span>{e.name}</span>
                                                <span>效果: {e.buffType === 'efficiency' ? '效率' : '销售'}+{e.buffValue*100}%</span>
                                              </div>
                                            ) : null
                                         })}
                                         {comp.employees.length === 0 && <div className="text-xs text-gray-600">暂无员工</div>}
                                      </div>
                                      
                                      <div className="flex gap-2 overflow-x-auto pb-1">
                                         {EMPLOYEE_POOL.filter(e => !comp.employees.includes(e.id)).map(emp => (
                                           <button 
                                             key={emp.id}
                                             onClick={() => hireEmployee(comp.id, emp.id)}
                                             className="flex-shrink-0 border border-gray-600 px-2 py-1 text-xs hover:bg-retro-accent hover:text-black hover:border-retro-accent transition-colors"
                                           >
                                             + {emp.name} (¥{emp.salary})
                                           </button>
                                         ))}
                                      </div>
                                   </div>
                                </div>
                             </div>
                           );
                        })}
                      </div>
                    )}
                 </PixelCard>
              </div>
            )}

            {/* SEPARATED WAREHOUSE TAB */}
            {activeTab === 'warehouse' && (
               <div className="space-y-6">
                 <PixelCard title="WAREHOUSE CENTER" className="border-retro-accent">
                   <div className="text-center mb-6">
                      <p className="text-xl text-white font-pixel">当前库容: <span className="text-retro-accent font-bold text-3xl">{totalWarehouseCapacity}</span></p>
                      <p className="text-gray-400 font-pixel">购买仓库以增加商品存储上限</p>
                   </div>
                   <div className="grid grid-cols-1 gap-4">
                     {WAREHOUSE_DEFINITIONS.map(wh => (
                       <div key={wh.id} className="p-6 border-2 border-white bg-retro-bg flex justify-between items-center hover:border-retro-accent transition-colors group">
                         <div>
                            <div className="font-black text-2xl text-white group-hover:text-retro-accent font-pixel">{wh.name}</div>
                            <div className="text-lg text-gray-400 font-pixel">容量: {wh.capacity}</div>
                            <div className="text-sm mt-2 bg-retro-purple text-white px-2 inline-block font-bold font-pixel">
                              已拥有: {gameState.ownedWarehouses[wh.id] || 0}
                            </div>
                         </div>
                         <div className="text-right">
                           <div className="font-black text-3xl mb-2 text-retro-accent font-pixel">¥{wh.price}</div>
                           <PixelButton 
                             className="text-lg py-2 px-6"
                             onClick={() => buyWarehouse(wh.id)}
                           >
                             购买扩容
                           </PixelButton>
                         </div>
                       </div>
                     ))}
                   </div>
                </PixelCard>
               </div>
            )}

            {/* SEPARATED HOUSING TAB */}
            {activeTab === 'housing' && (
              <div className="space-y-6">
                <PixelCard title="LIVING QUARTERS" className="border-retro-accent">
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-2xl font-black border-b-4 border-retro-purple pb-2 mb-4 text-white font-pixel">租赁房源 <span className="text-sm font-normal text-gray-400 ml-2">支付月租恢复精力</span></h4>
                      <div className="grid grid-cols-1 gap-4">
                        {HOUSING_OPTIONS.map(house => (
                          <div key={house.id} className={`p-6 border-4 ${gameState.accommodationId === house.id ? 'bg-retro-bg border-retro-accent shadow-[inset_0_0_20px_rgba(204,255,0,0.2)]' : 'bg-retro-card border-gray-700'} relative transition-all`}>
                            <div className="flex justify-between items-center">
                              <div>
                                <div className={`font-black text-2xl font-pixel ${gameState.accommodationId === house.id ? 'text-retro-accent' : 'text-white'}`}>{house.name}</div>
                                <div className="text-lg text-gray-300 mt-1 font-pixel">精力恢复率: <span className="text-retro-accent font-bold">{house.recoveryRate * 100}%</span></div>
                                <div className="font-mono mt-2 text-xl text-retro-purple font-bold font-pixel">¥{house.monthlyRent}/月</div>
                              </div>
                              <PixelButton 
                                variant={gameState.accommodationId === house.id ? 'success' : 'secondary'}
                                disabled={gameState.accommodationId === house.id}
                                onClick={() => setAccommodation(house.id)}
                              >
                                {gameState.accommodationId === house.id ? '居住中' : '签订租约'}
                              </PixelButton>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-2xl font-black border-b-4 border-retro-purple pb-2 mb-4 mt-8 text-white font-pixel">名下房产 <span className="text-sm font-normal text-gray-400 ml-2">免租金入住</span></h4>
                      {REAL_ESTATE_DEFINITIONS.filter(r => gameState.inventory[r.id]?.quantity > 0).length === 0 && (
                        <div className="p-8 border-2 border-dashed border-gray-700 text-center text-gray-500 text-xl font-bold font-pixel">
                           您尚未购买任何房产，请前往[房产投资]板块
                        </div>
                      )}
                      <div className="grid grid-cols-1 gap-4">
                        {REAL_ESTATE_DEFINITIONS.filter(r => gameState.inventory[r.id]?.quantity > 0).map(house => (
                          <div key={house.id} className={`p-6 border-4 ${gameState.accommodationId === house.id ? 'bg-retro-bg border-retro-accent' : 'bg-retro-card border-gray-700'} relative`}>
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-black text-2xl text-white font-pixel">{house.name}</div>
                                <div className="text-lg text-gray-300 mt-1 font-pixel">精力恢复: <span className="text-retro-accent font-bold">{(house.recoveryRate || 0.8) * 100}%</span> | 上限: +{house.maxEnergyBonus}</div>
                                <div className="font-mono mt-2 text-sm bg-retro-purple text-white px-2 inline-block font-bold font-pixel">自有物业 (免租金)</div>
                              </div>
                              <PixelButton 
                                variant={gameState.accommodationId === house.id ? 'success' : 'secondary'}
                                disabled={gameState.accommodationId === house.id}
                                onClick={() => setAccommodation(house.id)}
                              >
                                {gameState.accommodationId === house.id ? '居住中' : '入住'}
                              </PixelButton>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </PixelCard>
              </div>
            )}

            {/* NEW: SELF IMPROVEMENT TAB */}
            {activeTab === 'self_improvement' && (
              <PixelCard title="SELF IMPROVEMENT" className="border-retro-accent">
                <div className="space-y-6">
                   <div className="p-4 bg-retro-bg border-2 border-retro-dark mb-4">
                     <p className="text-gray-300 font-pixel">通过学习和锻炼提升五维属性，解锁更高薪的职业。</p>
                     <p className="text-retro-purple text-sm font-pixel mt-1">每次训练消耗 {ENERGY_COST_TRAIN} 点精力。</p>
                   </div>
                   
                   <div className="grid grid-cols-1 gap-6">
                     {(Object.keys(gameState.attributes) as AttributeType[]).map(attrType => {
                       const attr = gameState.attributes[attrType];
                       const xpNeeded = attr.level * XP_SCALE_FACTOR;
                       const progress = (attr.xp / xpNeeded) * 100;
                       
                       const labelMap: Record<string, string> = {
                         knowledge: '知识 KNOWLEDGE',
                         physical: '体能 PHYSICAL',
                         art: '艺术 ART',
                         logic: '逻辑 LOGIC',
                         business: '商业 BUSINESS'
                       };

                       const colorMap: Record<string, string> = {
                         knowledge: 'bg-blue-500',
                         physical: 'bg-red-500',
                         art: 'bg-purple-500',
                         logic: 'bg-green-500',
                         business: 'bg-yellow-500'
                       };

                       return (
                         <div key={attrType} className="p-4 border-2 border-white bg-retro-card relative overflow-hidden group">
                            <div className="flex justify-between items-end mb-2 relative z-10">
                               <div>
                                 <h4 className="text-2xl font-black text-white font-pixel">{labelMap[attrType]}</h4>
                                 <div className="text-retro-accent font-bold text-lg mt-1 font-pixel">
                                   Lv.{attr.level} <span className="text-white ml-2 text-xl">[{attr.title}]</span>
                                 </div>
                               </div>
                               <div className="text-right">
                                  <PixelButton 
                                    onClick={() => trainAttribute(attrType)}
                                    disabled={gameState.energy < ENERGY_COST_TRAIN || attr.level >= 10}
                                    className="text-sm py-2 px-6"
                                  >
                                    训练 (+1 XP)
                                  </PixelButton>
                               </div>
                            </div>
                            
                            {/* Progress Bar Container */}
                            <div className="w-full h-6 bg-gray-900 border-2 border-gray-600 relative z-10">
                               <div 
                                 className={`h-full ${colorMap[attrType]} transition-all duration-300`}
                                 style={{ width: `${Math.min(100, progress)}%` }}
                               ></div>
                               <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md font-pixel">
                                 {attr.level >= 10 ? 'MAX LEVEL' : `${attr.xp} / ${xpNeeded} XP`}
                               </div>
                            </div>
                         </div>
                       );
                     })}
                   </div>
                </div>
              </PixelCard>
            )}

            {/* UPDATED: JOB MARKET TAB WITH COLLAPSIBLE CATEGORIES */}
            {activeTab === 'job' && (
              <PixelCard title="WORK CENTER">
                <div className="space-y-6">
                   <div className="p-4 bg-retro-bg border-2 border-retro-dark flex justify-between items-center">
                     <div>
                       <p className="text-gray-300 font-pixel">寻找一份合适的工作来赚取稳定收入。</p>
                       <p className="text-retro-purple text-sm font-pixel mt-1">每次工作消耗 {ENERGY_COST_WORK} 点精力。</p>
                     </div>
                     <div className="text-right">
                        <div className="text-xs text-gray-500 font-pixel">当前精力</div>
                        <div className={`text-2xl font-black font-pixel ${gameState.energy < ENERGY_COST_WORK ? 'text-red-500' : 'text-retro-accent'}`}>
                          {gameState.energy} ⚡
                        </div>
                     </div>
                   </div>

                   <div className="space-y-4">
                     {jobCategories.categories.map(category => (
                       <div key={category} className="border-2 border-retro-dark">
                         <button 
                           onClick={() => toggleJobCategory(category)}
                           className={`w-full p-4 flex justify-between items-center transition-all ${expandedJobCategories[category] ? 'bg-retro-accent text-black border-b-2 border-retro-dark' : 'bg-retro-card text-white hover:bg-gray-800'}`}
                         >
                           <span className="font-black text-2xl font-pixel uppercase">{category}类职业</span>
                           <span className="font-bold font-pixel text-xl">{expandedJobCategories[category] ? '收起 [-]' : '展开 [+]'}</span>
                         </button>
                         
                         {expandedJobCategories[category] && (
                           <div className="p-4 bg-black/30 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                             {jobCategories.grouped[category].map(job => {
                                // Check requirements
                                const requirementsMet = Object.entries(job.requirements).every(([key, reqLvl]) => {
                                   return gameState.attributes[key as AttributeType].level >= (reqLvl as number);
                                });
                                
                                return (
                                  <div key={job.id} className={`p-4 border-2 ${requirementsMet ? 'border-white bg-retro-card' : 'border-gray-800 bg-black/50'} relative`}>
                                    <div className="flex justify-between items-start mb-4">
                                      <div>
                                        <h4 className={`text-xl font-black font-pixel ${requirementsMet ? 'text-white' : 'text-gray-600'}`}>{job.name}</h4>
                                      </div>
                                      <div className={`text-2xl font-black font-pixel ${requirementsMet ? 'text-retro-accent' : 'text-gray-700'}`}>
                                        ¥{job.salary}
                                      </div>
                                    </div>
                                    
                                    <div className="mb-4 text-sm">
                                      <p className="text-gray-500 mb-1 font-pixel">任职要求:</p>
                                      {Object.keys(job.requirements).length === 0 ? (
                                        <span className="text-green-500 font-pixel">无门槛</span>
                                      ) : (
                                        <div className="flex flex-wrap gap-2">
                                          {Object.entries(job.requirements).map(([key, lvl]) => {
                                            const userLvl = gameState.attributes[key as AttributeType].level;
                                            const met = userLvl >= (lvl as number);
                                            const labelMap: Record<string, string> = {
                                               knowledge: '知识', physical: '体能', art: '艺术', logic: '逻辑', business: '商业'
                                            };
                                            return (
                                              <span key={key} className={`px-2 py-0.5 text-xs font-bold font-pixel border ${met ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}`}>
                                                {labelMap[key]} Lv.{lvl} {met ? '✓' : `(当前.${userLvl})`}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>

                                    <PixelButton 
                                      onClick={() => workJob(job)}
                                      disabled={!requirementsMet || gameState.energy < job.energyCost}
                                      className={`w-full py-2 text-lg ${!requirementsMet ? 'opacity-20' : ''}`}
                                      variant={requirementsMet ? 'primary' : 'secondary'}
                                    >
                                      {requirementsMet ? '开始工作' : '能力不足'}
                                    </PixelButton>
                                  </div>
                                );
                             })}
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                </div>
              </PixelCard>
            )}

            {activeTab === 'bank' && (
              <PixelCard title="CENTRAL BANK">
                <div className="grid grid-cols-1 gap-8">
                  <div className="p-8 border-4 border-retro-purple bg-retro-bg text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 bg-retro-purple text-white text-xs font-bold font-pixel">CREDIT SYSTEM</div>
                    <h3 className="font-bold text-2xl uppercase tracking-widest mb-4 text-gray-400 font-pixel">信用评分 CREDIT SCORE</h3>
                    <div className="text-8xl font-mono font-black mb-4 text-retro-purple text-shadow-neon font-pixel">{currentCreditScore}</div>
                    <div className="flex justify-center gap-12 text-lg">
                      <div className="border-r-2 border-gray-700 pr-12">
                        <span className="block text-gray-500 text-sm font-pixel">最大额度 LIMIT</span>
                        <span className="font-bold text-2xl text-white font-pixel">¥{getMaxLoanAmount(currentCreditScore).toLocaleString()}</span>
                      </div>
                       <div>
                        <span className="block text-gray-500 text-sm font-pixel">违约记录 DEFAULT</span>
                        <span className="font-bold text-2xl text-red-500 font-pixel">{gameState.unpaidBillCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                       <h3 className="text-2xl font-black mb-4 border-l-8 border-retro-accent pl-4 text-white uppercase font-pixel">贷款服务 LOANS</h3>
                       <div className="space-y-4">
                         <button 
                           className="w-full p-6 border-2 border-white bg-retro-card hover:bg-retro-bg hover:border-retro-accent transition-all text-left flex justify-between items-center group"
                           onClick={() => takeLoan(1000, 12)} 
                           disabled={1000 > getMaxLoanAmount(currentCreditScore)}
                         >
                           <div>
                              <div className="font-black text-xl text-white group-hover:text-retro-accent font-pixel">微额周转贷</div>
                              <div className="text-sm text-gray-400 mt-1 font-pixel">12期 | 年化5%</div>
                           </div>
                           <div className="text-3xl font-mono text-white font-pixel">¥1,000</div>
                         </button>
                          <button 
                           className="w-full p-6 border-2 border-white bg-retro-card hover:bg-retro-bg hover:border-retro-accent transition-all text-left flex justify-between items-center group"
                           onClick={() => takeLoan(5000, 24)} 
                           disabled={5000 > getMaxLoanAmount(currentCreditScore)}
                         >
                            <div>
                              <div className="font-black text-xl text-white group-hover:text-retro-accent font-pixel">商业经营贷</div>
                              <div className="text-sm text-gray-400 mt-1 font-pixel">24期 | 年化5%</div>
                           </div>
                            <div className="text-3xl font-mono text-white font-pixel">¥5,000</div>
                         </button>
                       </div>
                    </div>

                    <div>
                       <h3 className="text-2xl font-black mb-4 border-l-8 border-red-500 pl-4 text-white uppercase font-pixel">当前债务 DEBTS</h3>
                       <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                         {gameState.loans.map(loan => (
                           <div key={loan.id} className="text-sm bg-black p-4 border-2 border-red-900">
                             <div className="flex justify-between items-start mb-3">
                               <div>
                                 <div className="font-black text-xl text-red-500 font-pixel">{loan.name || '普通贷款'}</div>
                                 <div className="text-sm text-gray-400 font-pixel">本金: ¥{loan.principal.toLocaleString()}</div>
                               </div>
                               <div className="text-right">
                                 <div className="font-bold text-white text-lg font-pixel">{loan.monthsRemaining}期</div>
                                 <div className="text-xs text-gray-500 font-pixel">月供: {loan.monthlyPayment.toFixed(0)}</div>
                               </div>
                             </div>
                             <PixelButton 
                               variant="danger" 
                               className="w-full text-sm py-2"
                               onClick={() => repayLoanEarly(loan)}
                             >
                               提前还款 (¥{loan.remainingAmount.toFixed(0)})
                             </PixelButton>
                           </div>
                         ))}
                         {gameState.loans.length === 0 && (
                            <div className="text-gray-600 text-center py-8 font-bold text-xl border-2 border-dashed border-gray-800 font-pixel">
                              无负债 NO DEBT
                            </div>
                         )}
                       </div>
                    </div>
                  </div>
                </div>
              </PixelCard>
            )}

          </div>
        </div>

        {/* RIGHT: SYSTEM LOGS - INCREASED FONT SIZE */}
        <div className="xl:col-span-3 xl:sticky xl:top-4">
          <PixelCard className="h-[600px] flex flex-col border-2 border-white/10" title="系统消息 SYSTEM LOG">
            {/* Intel Button overlay or integrated */}
            <div className="absolute top-2 right-2 z-20">
              <button 
                onClick={() => { setShowIntelModal(true); playSound('click'); }}
                className="bg-slate-800 hover:bg-retro-accent hover:text-black border border-white text-xs px-2 py-1 font-bold transition-colors font-pixel"
              >
                [情报网] {gameState.intelligenceLogs.some(i => !i.isRead) ? '(!)' : ''}
              </button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-2 pr-2 font-mono text-sm scrollbar-thin mt-2">
              {gameState.logs.map((log, i) => {
                let colorClass = "text-gray-300";
                if (log.includes("警告") || log.includes("无住所") || log.includes("不足")) colorClass = "text-red-500 font-bold animate-pulse";
                else if (log.includes("入住") || log.includes("租") || log.includes("提升")) colorClass = "text-retro-accent font-bold";
                else if (log.includes("收入") || log.includes("卖出") || log.includes("收益") || log.includes("帝国") || log.includes("营收")) colorClass = "text-green-400";
                else if (log.includes("支付") || log.includes("买入") || log.includes("成本")) colorClass = "text-yellow-400";
                else if (log.includes("情报")) colorClass = "text-blue-300 font-bold";

                return (
                  <div key={i} className={`p-2 border-l-2 border-gray-700 bg-black/50 ${colorClass}`}>
                    <span className="opacity-50 text-xs block mb-1 font-pixel">{new Date().toLocaleTimeString()}</span>
                    <span className="font-pixel">{log}</span>
                  </div>
                )
              })}
            </div>
          </PixelCard>
        </div>

      </div>

      <div className="fixed bottom-8 right-8 z-30 flex gap-4">
         {/* Reset Button */}
         <button
            onClick={() => { handleResetGame(); playSound('click'); }}
            className="
              bg-red-900/80 text-white border-2 border-red-600
              font-bold py-4 px-6 text-xl tracking-wider
              hover:bg-red-700 hover:border-white hover:scale-105
              transition-all shadow-[4px_4px_0px_#000]
              font-pixel
            "
            title="重新开始游戏"
         >
           重置
         </button>

         <button 
           onClick={() => { handleNextMonthClick(); playSound('click'); }}
           className="
             group
             bg-retro-accent 
             text-black 
             border-4 border-white
             outline outline-4 outline-black
             font-black 
             py-6 px-12 
             text-3xl
             tracking-widest
             shadow-[8px_8px_0px_0px_#000] 
             hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[16px_16px_0px_0px_#000] hover:bg-white
             active:translate-x-[4px] active:translate-y-[4px] active:shadow-[2px_2px_0px_0px_#000] 
             transition-all
             flex items-center gap-4
             font-pixel
           "
         >
           <span>下个月</span>
           <span className="group-hover:translate-x-2 transition-transform text-4xl">»</span>
         </button>
      </div>

      {blockerState.isOpen && (
        <BlockerModal 
          missing={blockerState.missing}
          onRedirect={(tab) => {
            setActiveTab(tab);
            setBlockerState({ isOpen: false, missing: [] });
            playSound('click');
          }}
          onClose={() => setBlockerState({ isOpen: false, missing: [] })}
        />
      )}

      {tradeModal.isOpen && (
        <TradeModal 
          isOpen={tradeModal.isOpen}
          type={tradeModal.type}
          goodName={GOODS_DEFINITIONS.find(g => g.id === tradeModal.goodId)?.name || ''}
          price={gameState.currentPrices[tradeModal.goodId]}
          maxQuantity={getModalMaxQuantity()}
          currentEnergy={gameState.energy}
          cash={gameState.cash} 
          onConfirm={handleTradeConfirm}
          onClose={() => setTradeModal({ ...tradeModal, isOpen: false })}
        />
      )}

      {mortgageModal.isOpen && (
        <MortgageModal
          goodName={GOODS_DEFINITIONS.find(g => g.id === mortgageModal.goodId)?.name || ''}
          price={gameState.currentPrices[mortgageModal.goodId]}
          creditScore={currentCreditScore}
          cash={gameState.cash}
          currentEnergy={gameState.energy}
          onConfirm={handleMortgageConfirm}
          onClose={() => setMortgageModal({ isOpen: false, goodId: '' })}
        />
      )}

      {showBillModal && (
        <BillModal 
          bills={pendingBills} 
          cash={gameState.cash} 
          report={gameState.currentMonthReport}
          onConfirm={handleBillConfirmation} 
        />
      )}

      {showAssetModal && (
        <AssetModal 
          gameState={gameState} 
          onClose={() => setShowAssetModal(false)} 
        />
      )}

      {showReportModal && (
        <ReportModal 
          report={gameState.lastMonthReport} 
          onClose={() => setShowReportModal(false)} 
        />
      )}

      {showIntelModal && (
        <IntelligenceModal 
          logs={gameState.intelligenceLogs} 
          currentAge={gameState.age}
          onClose={() => setShowIntelModal(false)} 
        />
      )}
    </div>
  );
};

export default App;
