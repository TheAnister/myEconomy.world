import { DataLoader } from '../core/data-loader.js';

export class CompanyManager {
  constructor() {
    this.companies = new Map();
    this.sectorEmploymentRates = {};
    this.totalInvestment = 0;
    this.stateOwnedEnterpriseProfits = 0;
    this.totalSubsidies = 0;
  }

  async initialize() {
    const companies = await DataLoader.loadCompanies();
    this.companies = new Map(companies.map(c => [c.name, c]));
    this.calculateSectorEmploymentRates();
    this.calculateTotalInvestment();
    this.calculateStateOwnedEnterpriseProfits();
  }

  calculateSectorEmploymentRates() {
    const sectorEmployment = {};
    let totalEmployment = 0;

    this.companies.forEach(company => {
      if (!sectorEmployment[company.sector]) {
        sectorEmployment[company.sector] = 0;
      }
      sectorEmployment[company.sector] += company.employees;
      totalEmployment += company.employees;
    });

    Object.keys(sectorEmployment).forEach(sector => {
      this.sectorEmploymentRates[sector] = sectorEmployment[sector] / totalEmployment;
    });
  }

  calculateTotalInvestment() {
    this.totalInvestment = Array.from(this.companies.values())
      .reduce((sum, company) => sum + company.investment, 0);
  }

  calculateStateOwnedEnterpriseProfits() {
    this.stateOwnedEnterpriseProfits = Array.from(this.companies.values())
      .filter(company => company.stateOwned)
      .reduce((sum, company) => sum + company.profit, 0);
  }

  calculateSectorMetrics() {
    const sectorMetrics = {};

    this.companies.forEach(company => {
      if (!sectorMetrics[company.sector]) {
        sectorMetrics[company.sector] = {
          totalRevenue: 0,
          totalProfit: 0,
          totalInvestment: 0,
          totalEmployees: 0,
          marketShare: 0
        };
      }
      sectorMetrics[company.sector].totalRevenue += company.revenue;
      sectorMetrics[company.sector].totalProfit += company.profit;
      sectorMetrics[company.sector].totalInvestment += company.investment;
      sectorMetrics[company.sector].totalEmployees += company.employees;
    });

    // Calculate market share for each sector
    const totalMarketRevenue = Object.values(sectorMetrics).reduce((sum, sector) => sum + sector.totalRevenue, 0);
    Object.keys(sectorMetrics).forEach(sector => {
      sectorMetrics[sector].marketShare = sectorMetrics[sector].totalRevenue / totalMarketRevenue;
    });

    return sectorMetrics;
  }

  runMarketSimulations({ inflation, interestRate, consumerDemand, sectorSubsidies }) {
    this.companies.forEach(company => {
      // Simulate company performance based on economic conditions
      const demandFactor = 1 + consumerDemand / 100;
      const inflationFactor = 1 + inflation / 100;
      const interestFactor = 1 + interestRate / 100;

      company.revenue = this.#simulateRevenue(company, demandFactor, inflationFactor);
      company.expenses = this.#simulateExpenses(company, inflationFactor);
      company.profit = this.#simulateProfit(company, interestFactor, sectorSubsidies[company.sector]);

      this.#simulateInvestments(company, interestRate);
      this.#simulateEmployment(company, inflation);
      this.#simulateMarketShare(company, consumerDemand);
    });

    this.calculateSectorMetrics();
    this.calculateTotalInvestment();
    this.calculateStateOwnedEnterpriseProfits();
  }

  #simulateRevenue(company, demandFactor, inflationFactor) {
    const baseRevenue = company.baseRevenue * demandFactor;
    const adjustedRevenue = baseRevenue * inflationFactor;

    const sectorGrowthRate = this.#getSectorGrowthRate(company.sector);
    const companyGrowthRate = baseRevenue * sectorGrowthRate;

    return adjustedRevenue + companyGrowthRate;
  }

  #simulateExpenses(company, inflationFactor) {
    const baseExpenses = company.baseExpenses * inflationFactor;
    const laborCosts = company.employees * company.avgSalary * inflationFactor;
    const maintenanceCosts = company.assets * 0.05;

    return baseExpenses + laborCosts + maintenanceCosts;
  }

  #simulateProfit(company, interestFactor, subsidy) {
    const revenue = company.revenue;
    const expenses = company.expenses;
    const investmentCost = company.investment * interestFactor;

    return revenue - (expenses + investmentCost) + subsidy;
  }

  #simulateInvestments(company, interestRate) {
    const investmentGrowthRate = 1 + (interestRate / 100);
    company.investment *= investmentGrowthRate;
  }

  #simulateEmployment(company, inflation) {
    const employmentGrowthRate = 1 + (inflation / 100);
    company.employees *= employmentGrowthRate;
  }

  #simulateMarketShare(company, consumerDemand) {
    const demandImpact = consumerDemand / 100;
    company.marketShare = Math.min(company.marketShare + demandImpact, 1);
  }

  #getSectorGrowthRate(sector) {
    const sectorGrowthRates = {
      technology: 0.05,
      manufacturing: 0.03,
      finance: 0.04,
      pharmaceuticals: 0.06,
      retail: 0.02,
      energy: 0.03,
      aerospace: 0.04,
      telecoms: 0.05,
      agriculture: 0.02,
      services: 0.03
    };

    return sectorGrowthRates[sector] || 0.03;
  }

  snapshot() {
    return Array.from(this.companies.values()).map(company => ({ ...company }));
  }
}
