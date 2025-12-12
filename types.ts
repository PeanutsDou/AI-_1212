
export enum RiskLevel {
  MINIMAL = '极稳', // For Real Estate
  STABLE = '稳定',
  LOW = '低风险',
  MEDIUM = '中风险',
  HIGH = '高风险',
  EXTREME = '强高风险'
}

export interface GoodDefinition {
  id: string;
  name: string;
  basePrice: number;
  risk: RiskLevel;
  description: string;
  type: 'commodity' | 'real_estate' | 'product'; // Added product
  category: string; 
  // Real estate props
  maxEnergyBonus?: number;
  recoveryRate?: number; 
  passiveIncomeRate?: number;
}

export interface InventoryItem {
  goodId: string;
  quantity: number;
  averageCost: number;
}

export interface WarehouseDefinition {
  id: string; 
  name: string;
  capacity: number;
  price: number;
}

export interface Housing {
  id: string;
  name: string;
  monthlyRent: number;
  description: string;
  recoveryRate: number; 
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  monthGenerated: number;
}

export interface Loan {
  id: string;
  principal: number;
  remainingAmount: number;
  monthlyPayment: number;
  monthsRemaining: number;
  interestRate: number;
  name?: string; 
}

export type AttributeType = 'knowledge' | 'physical' | 'art' | 'logic' | 'business';

export interface AttributeLevel {
  level: number;
  xp: number;
  title: string;
}

export interface PlayerAttributes {
  knowledge: AttributeLevel;
  physical: AttributeLevel;
  art: AttributeLevel;
  logic: AttributeLevel;
  business: AttributeLevel;
}

export interface JobDefinition {
  id: string;
  name: string;
  salary: number;
  energyCost: number;
  requirements: Partial<Record<AttributeType, number>>; 
  category: string; 
}

// --- NEW BUSINESS TYPES ---

export interface EmployeeDefinition {
  id: string;
  name: string;
  salary: number;
  buffType: 'efficiency' | 'sales';
  buffValue: number;
  minCompanyLevel: number;
}

export interface CompanyTypeDefinition {
  id: string;
  name: string;
  description: string;
  reqAttribute: { type: AttributeType; level: number };
  reqRealEstateType: string; // matches 'category' in GoodDefinition or specific ID logic
  startupCost: number;
  baseMonthlyCost: number;
  rawMaterial: { goodId: string; amount: number }[]; // Input
  product: string; // Output Good ID
  baseProduction: number;
}

export interface ActiveCompany {
  id: string;
  typeId: string;
  name: string;
  level: number;
  employees: string[]; // List of Employee IDs
  accumulatedProfit: number;
}

export interface FinancialReport {
  month: number;
  income: {
    trade: number;
    salary: number;
    rent: number; // Passive income from real estate
    business: number; // Company profit
  };
  expense: {
    trade: number; // Cost of buying goods
    bills: number; // Loan/Rent payments
    business: number; // Company loss/costs
    other: number;
  };
}

// --- INTELLIGENCE SYSTEM TYPES ---

export interface Intelligence {
  id: string;
  dateGenerated: string; // Display string e.g. "25岁3月"
  source: string; // e.g. "码头传闻", "员工透露"
  content: string; // The text description
  
  // Targeting
  targetGoodId?: string; // Specific good
  targetCategory?: string; // Fuzzy category
  
  direction: 'up' | 'down';
  
  // Timing (Game Age in months)
  startMonth: number;
  endMonth: number;
  
  isRead: boolean;
}

export interface GameState {
  age: number;
  cash: number;
  energy: number;
  maxEnergy: number;
  
  attributes: PlayerAttributes;
  inventory: Record<string, InventoryItem>;
  ownedWarehouses: Record<string, number>; 
  accommodationId: string | null;

  currentPrices: Record<string, number>;
  priceHistory: Record<string, number[]>;
  
  loans: Loan[];
  bills: Bill[];
  unpaidBillCount: number;
  creditScore: number;
  
  // Business & Reporting
  companies: ActiveCompany[];
  currentMonthReport: FinancialReport; 
  lastMonthReport: FinancialReport; 

  // Intelligence
  intelligenceLogs: Intelligence[];

  logs: string[];
  isGameOver: boolean;
  gameEndReason?: string;
}

export interface MarketHistoryPoint {
  month: number;
  price: number;
}
