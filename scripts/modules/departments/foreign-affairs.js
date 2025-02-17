import { DepartmentBase } from './department-base.js';

export class ForeignAffairsDepartment extends DepartmentBase {
  constructor(config) {
    super({
      name: 'Department of Foreign Affairs',
      description: 'Handles international relations and foreign policy',
      ...config
    });

    this.metrics = {
      diplomats: 3000,                // Total number of diplomats
      embassies: 100,                 // Number of embassies
      foreignAidBudget: 10000000000,  // Annual budget for foreign aid
      tradeAgreements: 5,             // Number of trade agreements
      internationalProjects: 20       // Number of international projects
    };

    this.performance = {
      diplomaticRelations: 0.8,       // Scale from 0 to 1
      internationalInfluence: 0.75,   // Scale from 0 to 1
      tradeBalance: 0.6,              // Scale from 0 to 1
      conflictResolution: 0.7         // Scale from 0 to 1
    };

    this.policies = {
      foreignAid: 0.1,                // % of budget
      tradePolicy: 0.2,               // % of budget
      culturalExchange: 0.15          // % of budget
    };

    this.historicalData = [];
  }

  setDiplomatCount(number) {
    this.metrics.diplomats = number;
    this.#updateForeignAffairsMetrics();
  }

  setForeignAidBudget(amount) {
    this.metrics.foreignAidBudget = amount;
    this.#updateBudgetRequirements();
  }

  adjustSalaries(percentageChange) {
    this.metrics.diplomatSalary *= 1 + percentageChange;
    this.#updateBudgetRequirements();
  }

  calculateBudget() {
    const aidCost = this.metrics.foreignAidBudget;
    const embassyCosts = this.metrics.embassies * 5000000; // Annual embassy costs
    const diplomatCosts = this.metrics.diplomats * 80000;  // Average annual salary £

    return aidCost + embassyCosts + diplomatCosts;
  }

  getMonthlyCost() {
    return this.calculateBudget() / 12;
  }

  implementReform(policy) {
    switch(policy.type) {
      case 'increaseDiplomaticRelations':
        this.performance.diplomaticRelations = Math.min(this.performance.diplomaticRelations + 0.05, 1);
        break;
      case 'boostTradeAgreements':
        this.metrics.tradeAgreements = Math.min(this.metrics.tradeAgreements + 1, 10);
        break;
      case 'expandCulturalExchange':
        this.policies.culturalExchange = Math.min(this.policies.culturalExchange + 0.05, 0.5);
        break;
    }
  }

  simulateMonth() {
    // Update performance metrics based on funding
    this.performance.diplomaticRelations -= 0.002 * (1 - this.metrics.diplomats / 4000);
    this.performance.internationalInfluence -= 0.003 * (1 - this.metrics.embassies / 120);
    this.performance.tradeBalance -= 0.005 * (1 - this.metrics.tradeAgreements / 10);
    this.performance.conflictResolution -= 0.004 * (1 - this.metrics.internationalProjects / 30);

    // Adjust metrics based on policies
    if (this.policies.foreignAid > 0.1) {
      this.performance.internationalInfluence = Math.min(this.performance.internationalInfluence + 0.02, 1);
    }

    // Update historical data
    this.historicalData.push({ ...this.metrics, ...this.performance });
  }

  #updateForeignAffairsMetrics() {
    this.performance.diplomaticRelations = this.metrics.diplomats / 4000;
  }

  #updateBudgetRequirements() {
    // Calculate budget requirements based on metrics
    this.budget = this.calculateBudget();
  }
}
