
import { CompanyTypeDefinition, EmployeeDefinition, GoodDefinition, Housing, JobDefinition, RiskLevel, WarehouseDefinition } from './types';

export const STARTING_CASH = 500;
export const STARTING_AGE_YEARS = 20;
export const RETIREMENT_AGE_YEARS = 60;
export const MAX_ENERGY = 100;
export const ENERGY_COST_WORK = 60;
export const ENERGY_COST_TRADE = 1;
export const SALARY_SMALL_COMPANY = 1000;

export const XP_PER_TRAIN = 1;
export const ENERGY_COST_TRAIN = 2;
export const XP_SCALE_FACTOR = 10; 

export const ATTRIBUTE_TITLES: Record<string, string[]> = {
  knowledge: [
    "", "懵懂无知", "略知一二", "学有小成", "博览群书", "才华横溢", 
    "学识渊博", "智慧之光", "学术权威", "一代宗师", "万世师表"
  ],
  physical: [
    "", "弱不禁风", "勉强能动", "身体健康", "体魄强健", "力能扛鼎", 
    "运动健将", "超凡体能", "人类极限", "突破极限", "肉身成圣"
  ],
  art: [
    "", "毫无美感", "初窥门径", "艺术爱好者", "文艺青年", "才华横溢", 
    "艺术家", "艺术大师", "开宗立派", "一代巨匠", "艺术之神"
  ],
  logic: [
    "", "思维混乱", "有条不紊", "逻辑清晰", "思维敏捷", "推理高手", 
    "逻辑大师", "计算天才", "分析专家", "战略家", "神机妙算"
  ],
  business: [
    "", "商业小白", "入门新手", "小本经营", "生意人", "商业精英", 
    "企业家", "商业大亨", "资本巨鳄", "垄断巨头", "商业之神"
  ]
};

export const JOBS: JobDefinition[] = [
  { id: 'base_job', name: '小公司职员', salary: 1000, energyCost: 60, requirements: {}, category: '基础' },
  { id: 'edu_1', name: '初级教师', salary: 2000, energyCost: 60, requirements: { knowledge: 3 }, category: '教育' },
  { id: 'edu_2', name: '中级教师', salary: 4000, energyCost: 60, requirements: { knowledge: 5 }, category: '教育' },
  { id: 'edu_3', name: '高级教师', salary: 8000, energyCost: 60, requirements: { knowledge: 7 }, category: '教育' },
  { id: 'sport_1', name: '初级教练', salary: 2500, energyCost: 60, requirements: { physical: 3 }, category: '体育' },
  { id: 'sport_2', name: '中级教练', salary: 5000, energyCost: 60, requirements: { physical: 5 }, category: '体育' },
  { id: 'sport_3', name: '高级教练', salary: 10000, energyCost: 60, requirements: { physical: 7 }, category: '体育' },
  { id: 'art_1', name: '初级画师', salary: 3000, energyCost: 60, requirements: { art: 3 }, category: '艺术' },
  { id: 'art_2', name: '中级画师', salary: 6000, energyCost: 60, requirements: { art: 5 }, category: '艺术' },
  { id: 'art_3', name: '高级画师', salary: 12000, energyCost: 60, requirements: { art: 7 }, category: '艺术' },
  { id: 'it_1', name: '初级程序员', salary: 3500, energyCost: 60, requirements: { logic: 3 }, category: 'IT' },
  { id: 'it_2', name: '中级程序员', salary: 7000, energyCost: 60, requirements: { logic: 5 }, category: 'IT' },
  { id: 'it_3', name: '高级程序员', salary: 14000, energyCost: 60, requirements: { logic: 7 }, category: 'IT' },
  { id: 'sales_1', name: '初级销售', salary: 4000, energyCost: 60, requirements: { business: 3 }, category: '销售' },
  { id: 'sales_2', name: '中级销售', salary: 8000, energyCost: 60, requirements: { business: 5 }, category: '销售' },
  { id: 'sales_3', name: '高级销售', salary: 16000, energyCost: 60, requirements: { business: 7 }, category: '销售' },
  { id: 'mgr_1', name: '初级经理', salary: 6000, energyCost: 60, requirements: { knowledge: 3, business: 3, logic: 3 }, category: '管理' },
  { id: 'mgr_2', name: '中级经理', salary: 12000, energyCost: 60, requirements: { knowledge: 5, business: 5, logic: 5 }, category: '管理' },
  { id: 'mgr_3', name: '高级经理', salary: 24000, energyCost: 60, requirements: { knowledge: 7, business: 7, logic: 7 }, category: '管理' },
  { id: 'art_agent', name: '艺术经纪人', salary: 10000, energyCost: 60, requirements: { art: 4, business: 4 }, category: '管理' },
  { id: 'nobel', name: '诺贝尔奖得主', salary: 30000, energyCost: 60, requirements: { knowledge: 9, art: 5 }, category: '巅峰' },
  { id: 'olympian', name: '奥运冠军', salary: 40000, energyCost: 60, requirements: { physical: 9 }, category: '巅峰' },
  { id: 'ceo', name: '跨国公司CEO', salary: 50000, energyCost: 60, requirements: { knowledge: 8, business: 8, logic: 8 }, category: '巅峰' },
];

// --- NEW BUSINESS CONSTANTS ---

export const NEW_PRODUCTS: GoodDefinition[] = [
  { id: 'processed_food', name: '品牌食品', basePrice: 5, risk: RiskLevel.LOW, description: '深加工的品牌食品。', type: 'product', category: '消费品' },
  { id: 'consumer_electronics', name: '消费电子', basePrice: 800, risk: RiskLevel.MEDIUM, description: '智能穿戴设备。', type: 'product', category: '科技' },
  { id: 'design_blueprint', name: '设计图纸', basePrice: 5000, risk: RiskLevel.HIGH, description: '高端建筑设计方案。', type: 'product', category: '服务' },
  { id: 'software_suite', name: '企业软件', basePrice: 1000, risk: RiskLevel.MEDIUM, description: 'SaaS服务订阅。', type: 'product', category: '科技' },
];

export const COMPANY_DEFINITIONS: CompanyTypeDefinition[] = [
  {
    id: 'food_factory',
    name: '食品加工厂',
    description: '将农产品加工为品牌食品。',
    reqAttribute: { type: 'business', level: 3 },
    reqRealEstateType: '入门级', // Any entry level or warehouse logic
    startupCost: 10000,
    baseMonthlyCost: 1000,
    rawMaterial: [{ goodId: 'wheat', amount: 20 }, { goodId: 'tap_water', amount: 50 }],
    product: 'processed_food',
    baseProduction: 200
  },
  {
    id: 'tech_studio',
    name: '软件工作室',
    description: '开发企业级软件产品。',
    reqAttribute: { type: 'logic', level: 4 },
    reqRealEstateType: '改善级',
    startupCost: 50000,
    baseMonthlyCost: 5000,
    rawMaterial: [{ goodId: 'coffee', amount: 10 }], // Programmers need coffee!
    product: 'software_suite',
    baseProduction: 20
  },
  {
    id: 'design_firm',
    name: '设计事务所',
    description: '承接高端建筑与艺术设计。',
    reqAttribute: { type: 'art', level: 5 },
    reqRealEstateType: '改善级',
    startupCost: 80000,
    baseMonthlyCost: 8000,
    rawMaterial: [{ goodId: 'paper', amount: 50 }],
    product: 'design_blueprint',
    baseProduction: 5
  },
  {
    id: 'electronics_plant',
    name: '电子装配厂',
    description: '组装高科技消费电子产品。',
    reqAttribute: { type: 'business', level: 6 },
    reqRealEstateType: '投资级',
    startupCost: 500000,
    baseMonthlyCost: 20000,
    rawMaterial: [{ goodId: 'mobile_chip', amount: 10 }, { goodId: 'glass', amount: 20 }],
    product: 'consumer_electronics',
    baseProduction: 50
  }
];

export const EMPLOYEE_POOL: EmployeeDefinition[] = [
  { id: 'e1', name: '实习生小李', salary: 3000, buffType: 'efficiency', buffValue: 0.1, minCompanyLevel: 1 },
  { id: 'e2', name: '熟练工老张', salary: 5000, buffType: 'efficiency', buffValue: 0.2, minCompanyLevel: 1 },
  { id: 'e3', name: '销售专员Amy', salary: 6000, buffType: 'sales', buffValue: 0.1, minCompanyLevel: 1 },
  { id: 'e4', name: '工程师Mike', salary: 12000, buffType: 'efficiency', buffValue: 0.4, minCompanyLevel: 2 },
  { id: 'e5', name: '资深经理David', salary: 20000, buffType: 'sales', buffValue: 0.3, minCompanyLevel: 3 },
  { id: 'e6', name: '行业专家Dr.Wang', salary: 50000, buffType: 'efficiency', buffValue: 0.8, minCompanyLevel: 4 },
];

export const COMMODITY_DEFINITIONS: GoodDefinition[] = [
  // 稳定类 (STABLE) - ±5%
  { id: 'wheat', name: '小麦', basePrice: 1.2, risk: RiskLevel.STABLE, description: '基础主食，需求恒定。', type: 'commodity', category: '稳定' },
  { id: 'tap_water', name: '自来水', basePrice: 0.1, risk: RiskLevel.STABLE, description: '生活必需品，价格受管控。', type: 'commodity', category: '稳定' },
  { id: 'salt', name: '食盐', basePrice: 2, risk: RiskLevel.STABLE, description: '基础调味品，战略储备物资。', type: 'commodity', category: '稳定' },
  { id: 'rice', name: '大米', basePrice: 2.5, risk: RiskLevel.STABLE, description: '亚洲主食，价格极度稳定。', type: 'commodity', category: '稳定' },

  // 低风险类 (LOW) - ±15%
  { id: 'coal', name: '煤炭', basePrice: 50, risk: RiskLevel.LOW, description: '基础能源，价格随工业需求波动。', type: 'commodity', category: '低风险' },
  { id: 'steel', name: '钢材', basePrice: 80, risk: RiskLevel.LOW, description: '基础建材，反映建筑业景气度。', type: 'commodity', category: '低风险' },
  { id: 'fertilizer', name: '化肥', basePrice: 30, risk: RiskLevel.LOW, description: '农业生产资料，受季节影响。', type: 'commodity', category: '低风险' },
  { id: 'paper', name: '工业造纸', basePrice: 20, risk: RiskLevel.LOW, description: '办公与包装需求，波动平缓。', type: 'commodity', category: '低风险' },
  { id: 'glass', name: '玻璃', basePrice: 40, risk: RiskLevel.LOW, description: '建筑与汽车行业需求。', type: 'commodity', category: '低风险' },

  // 中风险类 (MEDIUM) - ±30%
  { id: 'coffee', name: '咖啡豆', basePrice: 40, risk: RiskLevel.MEDIUM, description: '经济作物，受气候影响大。', type: 'commodity', category: '中风险' },
  { id: 'mobile_chip', name: '手机芯片', basePrice: 300, risk: RiskLevel.MEDIUM, description: '科技核心，受供应链影响。', type: 'commodity', category: '中风险' },
  { id: 'timber', name: '高级木材', basePrice: 150, risk: RiskLevel.MEDIUM, description: '家具装饰材料，受房地产影响。', type: 'commodity', category: '中风险' },
  { id: 'copper', name: '铜', basePrice: 60, risk: RiskLevel.MEDIUM, description: '宏观经济晴雨表。', type: 'commodity', category: '中风险' },
  { id: 'crude_oil', name: '原油', basePrice: 70, risk: RiskLevel.MEDIUM, description: '工业血液，受地缘政治影响。', type: 'commodity', category: '中风险' },

  // 高风险类 (HIGH) - ±50%
  { id: 'palladium', name: '稀有金属', basePrice: 2000, risk: RiskLevel.HIGH, description: '工业催化剂，极度稀缺。', type: 'commodity', category: '高风险' },
  { id: 'drug_patent', name: '新药专利', basePrice: 10000, risk: RiskLevel.HIGH, description: '成败取决于临床试验。', type: 'commodity', category: '高风险' },
  { id: 'tech_equity', name: '科技股权', basePrice: 5000, risk: RiskLevel.HIGH, description: '未上市公司的原始股。', type: 'commodity', category: '高风险' },
  { id: 'gold', name: '黄金', basePrice: 400, risk: RiskLevel.HIGH, description: '避险资产，但短期波动剧烈。', type: 'commodity', category: '高风险' },

  // 强高风险类 (EXTREME) - ±80%+
  { id: 'nft_art', name: '数字NFT', basePrice: 1000, risk: RiskLevel.EXTREME, description: '纯粹的炒作与共识。', type: 'commodity', category: '强高风险' },
  { id: 'comet_mining', name: '彗星采矿权', basePrice: 50000, risk: RiskLevel.EXTREME, description: '赌未来的太空技术。', type: 'commodity', category: '强高风险' },
  { id: 'virtual_land', name: '虚拟地皮', basePrice: 8000, risk: RiskLevel.EXTREME, description: '元宇宙概念地产。', type: 'commodity', category: '强高风险' },
  { id: 'crypto', name: '虚拟货币', basePrice: 500, risk: RiskLevel.EXTREME, description: '暴涨暴跌的数字代币。', type: 'commodity', category: '强高风险' }
];

export const REAL_ESTATE_DEFINITIONS: GoodDefinition[] = [
  {
    id: 'village_room',
    name: '城中村单间',
    basePrice: 200000, 
    risk: RiskLevel.MINIMAL,
    description: '首付20%。刚需容身之所，无增值潜力。',
    type: 'real_estate',
    category: '入门级',
    maxEnergyBonus: 10,
    recoveryRate: 0.8
  },
  {
    id: 'old_1bed',
    name: '老旧一居室',
    basePrice: 400000, 
    risk: RiskLevel.MINIMAL,
    description: '首付25%。位置便利的老破小。',
    type: 'real_estate',
    category: '入门级',
    maxEnergyBonus: 15,
    recoveryRate: 0.85
  },
  {
    id: 'boutique_apt',
    name: '精品公寓',
    basePrice: 1200000, 
    risk: RiskLevel.STABLE,
    description: '首付30%。装修精美，适合中产。',
    type: 'real_estate',
    category: '改善级',
    maxEnergyBonus: 25,
    recoveryRate: 0.95
  },
  {
    id: 'school_house',
    name: '学区房',
    basePrice: 2500000, 
    risk: RiskLevel.STABLE,
    description: '首付40%。硬通货，不仅保值还有微薄租金。',
    type: 'real_estate',
    category: '改善级',
    maxEnergyBonus: 20,
    recoveryRate: 1.0,
    passiveIncomeRate: 0.001 
  },
  {
    id: 'street_shop',
    name: '临街商铺',
    basePrice: 5000000, 
    risk: RiskLevel.LOW,
    description: '首付50%。提供稳定的租金现金流。',
    type: 'real_estate',
    category: '投资级',
    maxEnergyBonus: 0,
    recoveryRate: 0.5, 
    passiveIncomeRate: 0.003 
  },
  {
    id: 'office_bldg',
    name: '小型写字楼',
    basePrice: 15000000, 
    risk: RiskLevel.LOW,
    description: '首付50%。企业办公地，租金回报可观。',
    type: 'real_estate',
    category: '投资级',
    maxEnergyBonus: 0,
    recoveryRate: 0.5,
    passiveIncomeRate: 0.0025 
  },
  {
    id: 'island_villa',
    name: '海岛别墅',
    basePrice: 50000000,
    risk: RiskLevel.MEDIUM,
    description: '首付60%。顶级富豪的象征，维护费极高。',
    type: 'real_estate',
    category: '奢侈级',
    maxEnergyBonus: 50,
    recoveryRate: 1.5,
  },
  {
    id: 'historic_mansion',
    name: '历史公馆',
    basePrice: 100000000,
    risk: RiskLevel.HIGH,
    description: '首付70%。不可复制的文化遗产，拥有极高的收藏价值。',
    type: 'real_estate',
    category: '奢侈级',
    maxEnergyBonus: 10,
    recoveryRate: 1.0,
  }
];

export const GOODS_DEFINITIONS = [...COMMODITY_DEFINITIONS, ...REAL_ESTATE_DEFINITIONS, ...NEW_PRODUCTS];

export const WAREHOUSE_DEFINITIONS: WarehouseDefinition[] = [
  { id: 'wh_small', name: '小型储物间', capacity: 100, price: 200 },
  { id: 'wh_medium', name: '标准仓库', capacity: 500, price: 1000 },
  { id: 'wh_large', name: '大型物流中心', capacity: 2000, price: 4000 },
];

export const HOUSING_OPTIONS: Housing[] = [
  { id: 'youth_apartment', name: '青年公寓', monthlyRent: 300, description: '拥挤的合租房。', recoveryRate: 0.5 },
  { id: 'comfort_condo', name: '舒适公馆', monthlyRent: 1500, description: '独立的私人空间。', recoveryRate: 0.8 },
  { id: 'luxury_flat', name: '江景豪宅', monthlyRent: 5000, description: '顶级的居住体验。', recoveryRate: 1.0 }
];

export const RISK_VOLATILITY: Record<RiskLevel, number> = {
  [RiskLevel.MINIMAL]: 0.02, 
  [RiskLevel.STABLE]: 0.05, 
  [RiskLevel.LOW]: 0.15,     
  [RiskLevel.MEDIUM]: 0.3,  
  [RiskLevel.HIGH]: 0.5,    
  [RiskLevel.EXTREME]: 1.0  
};
