import { DataLoader } from './data-loader.js';
import { AIManager } from './ai-manager.js';
import { CompanyManager } from '../modules/companies.js';
import { DepartmentManager } from '../modules/departments/department-base.js';

export class EconomyEngine {
  constructor(aiManager, companyManager, departmentManager) {
    this.month = 0;
    this.history = [];
    this.countries = new Map();
    this.playerCountry = null;
    this.aiManager = aiManager;
    this.companyManager = companyManager;
    this.departmentManager = departmentManager;

    // Core economic indicators
    this.indicators = {
      gdp: 0,
      gdpGrowth: 0,
      inflation: 0,
      unemployment: 0,
      debtToGDP: 0,
      budgetDeficit: 0,
      tradeBalance: 0,
      currencyValue: 1.0, // Relative to USD
      productivity: 100,
      consumerConfidence: 50,
      businessConfidence: 50
    };

    // Initialize economic relationships
    this.economicMultipliers = {
      consumption: 0.6,
      investment: 0.3,
      government: 0.2,
      export: 0.4,
      import: -0.3
    };

    this.loadInitialData();
  }

  async loadInitialData() {
    const [countries, companies] = await Promise.all([
      DataLoader.loadCountries(),
      DataLoader.loadCompanies()
    ]);
    
    this.countries = new Map(countries.map(c => [c.name, c]));
    this.playerCountry = this.countries.get('United Kingdom');
    this.companyManager.initialize(companies);
    this.aiManager.initialize(countries.filter(c => c.name !== 'United Kingdom'));
  }

  simulateMonth() {
    const previousState = this.snapshotCurrentState();
    
    // Phase 1: Pre-calculation
    this.calculatePolicyImpacts();
    this.updateConsumerBehavior();
    
    // Phase 2: Core economic simulation
    this.calculateDomesticEconomy();
    this.processInternationalTrade();
    this.runMarketSimulations();
    
    // Phase 3: Post-processing
    this.processGovernmentFinances();
    this.updateHistoricalData(previousState);
    this.checkEconomicEvents();
    
    this.month++;
    this.emitSimulationComplete();
  }

  calculateDomesticEconomy() {
    // GDP Calculation (Expenditure Approach)
    const C = this.calculateConsumption();
    const I = this.calculateInvestment();
    const G = this.departmentManager.totalGovernmentSpending;
    const X = this.calculateExports();
    const M = this.calculateImports();

    this.indicators.gdp = C + I + G + (X - M);
    
    // Inflation model (Phillips Curve influenced)
    this.indicators.inflation = this.calculateInflation(
      this.indicators.unemployment,
      this.departmentManager.monetaryPolicy.inflationTarget
    );

    // Unemployment model (Okun's Law influenced)
    this.indicators.unemployment = this.calculateUnemployment(
      this.indicators.gdpGrowth,
      this.departmentManager.laborPolicy.minWage,
      this.companyManager.sectorEmploymentRates
    );
  }

  calculateConsumption() {
    const disposableIncome = this.departmentManager.taxation.disposableIncome;
    const confidenceFactor = this.indicators.consumerConfidence / 100;
    const creditAvailability = this.departmentManager.financePolicy.creditAvailability;
    
    return disposableIncome * confidenceFactor * creditAvailability * 
      this.economicMultipliers.consumption;
  }

  calculateInvestment() {
    const interestRate = this.departmentManager.monetaryPolicy.interestRate;
    const corpTaxRate = this.departmentManager.taxation.corporateTax;
    const confidence = this.indicators.businessConfidence / 100;
    
    return (this.companyManager.totalInvestment * confidence) / 
      (1 + interestRate + corpTaxRate) * this.economicMultipliers.investment;
  }

  processInternationalTrade() {
    const tariffs = this.departmentManager.foreignPolicy.tariffs;
    const exchangeRates = this.calculateExchangeRates();
    
    this.indicators.tradeBalance = this.aiManager.calculateGlobalTrade(
      this.playerCountry,
      tariffs,
      exchangeRates,
      this.companyManager.sectorCompetitiveness
    );
    
    // Update currency value based on trade balance
    this.indicators.currencyValue *= 1 + (
      this.indicators.tradeBalance * 0.0001 - 
      this.indicators.inflation * 0.01
    );
  }

  runMarketSimulations() {
    // Update company states
    this.companyManager.runMarketSimulations({
      inflation: this.indicators.inflation,
      interestRate: this.departmentManager.monetaryPolicy.interestRate,
      consumerDemand: this.indicators.consumerConfidence,
      sectorSubsidies: this.departmentManager.industrySubsidies
    });

    // Update sector market shares
    this.playerCountry.sectors = this.companyManager.calculateSectorMetrics();
  }

  processGovernmentFinances() {
    const revenue = this.calculateGovernmentRevenue();
    const expenses = this.calculateGovernmentExpenses();
    
    this.indicators.budgetDeficit = expenses - revenue;
    this.playerCountry.government_debt += this.indicators.budgetDeficit;
    
    // Update debt-to-GDP ratio
    this.indicators.debtToGDP = (this.playerCountry.government_debt / this.indicators.gdp) * 100;
    
    // Check for sovereign debt crisis
    if (this.indicators.debtToGDP > 100 && this.indicators.budgetDeficit > 0) {
      this.triggerEvent('debt_crisis_warning');
    }
  }

  calculateGovernmentRevenue() {
    return this.departmentManager.taxation.totalTaxRevenue + 
      this.companyManager.stateOwnedEnterpriseProfits +
      this.departmentManager.tariffRevenue;
  }

  calculateGovernmentExpenses() {
    return this.departmentManager.totalSpending +
      this.companyManager.totalSubsidies +
      this.departmentManager.debtInterestPayments;
  }

  // ... Additional core methods (200+ lines)

  // Helper methods
  snapshotCurrentState() {
    return {
      month: this.month,
      indicators: {...this.indicators},
      countryState: {...this.playerCountry},
      companies: this.companyManager.snapshot()
    };
  }

  updateHistoricalData(previousState) {
    this.history.push(previousState);
    
    // Maintain 5-year history
    if (this.history.length > 60) {
      this.history.shift();
    }
  }

  checkEconomicEvents() {
    if (this.indicators.gdpGrowth < -0.02) {
      this.triggerEvent('recession_start');
    }
    
    if (this.indicators.inflation > 0.05) {
      this.triggerEvent('high_inflation');
    }
  }

  triggerEvent(eventType) {
    const event = new CustomEvent('economy-event', {
      detail: {
        type: eventType,
        month: this.month,
        data: this.getEventData(eventType)
      }
    });
    document.dispatchEvent(event);
  }

  // External integration points
  getEconomicState() {
    return {
      indicators: {...this.indicators},
      sectors: this.playerCountry.sectors,
      tradePartners: this.aiManager.getTradeStates()
    };
  }

  applyPolicyImpact(policyType, impactValues) {
    switch(policyType) {
      case 'taxation':
        this.economicMultipliers.consumption *= impactValues.consumerImpact;
        this.economicMultipliers.investment *= impactValues.investmentImpact;
        break;
      case 'trade':
        this.economicMultipliers.export = impactValues.exportImpact;
        this.economicMultipliers.import = impactValues.importImpact;
        break;
      // Additional policy types
    }
  }

  // Debugging and diagnostics
  setSimulationParameters(params) {
    if (params.debugMode) {
      this.enableDebugLogging();
    }
    // Additional parameter handling
  }

  enableDebugLogging() {
    this.logger = {
      preSimulation: this.snapshotCurrentState(),
      postSimulation: null
    };
  }
}