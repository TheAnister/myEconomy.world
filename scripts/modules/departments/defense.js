import { DepartmentBase } from './department-base.js';

export class DefenseDepartment extends DepartmentBase {
  constructor(config) {
    super({
      name: 'Department of Defense',
      description: 'Handles national defense and military expenditure',
      ...config
    });

    this.metrics = {
      soldiers: 150000,       // Total military personnel
      soldierSalary: 30000,   // Average annual salary £
      equipmentBudget: 20000000000, // Annual budget for equipment
      researchAndDevelopment: 5000000000, // Annual R&D budget
      bases: 50,              // Number of military bases
      internationalMissions: 5 // Number of international missions
    };

    this.performance = {
      defenseReadiness: 0.8, // Scale from 0 to 1
      internationalInfluence: 0.7, // Scale from 0 to 1
      technologicalAdvancement: 0.6 // Scale from 0 to 1
    };

    this.policies = {
      conscription: false,
      internationalAid: 0.1, // % of budget
      defenseContracts: 0.2  // % of budget
    };

    this.historicalData = [];
  }

  setSoldierCount(number) {
    this.metrics.soldiers = number;
    this.#updateDefenseMetrics();
  }

  setEquipmentBudget(amount) {
    this.metrics.equipmentBudget = amount;
    this.#updateBudgetRequirements();
  }

  adjustSalaries(percentageChange) {
    this.metrics.soldierSalary *= 1 + percentageChange;
    this.#updateBudgetRequirements();
  }

  calculateBudget() {
    const baseCost = this.metrics.soldiers * this.metrics.soldierSalary;
    const equipmentCosts = this.metrics.equipmentBudget;
    const researchFunding = this.metrics.researchAndDevelopment;

    return baseCost + equipmentCosts + researchFunding;
  }

  getMonthlyCost() {
    return this.calculateBudget() / 12;
  }

  implementReform(policy) {
    switch(policy.type) {
      case 'increaseReadiness':
        this.performance.defenseReadiness = Math.min(this.performance.defenseReadiness + 0.1, 1);
        break;
      case 'boostTechAdvancement':
        this.performance.technologicalAdvancement = Math.min(this.performance.technologicalAdvancement + 0.1, 1);
        break;
    }
  }

  simulateMonth() {
    // Update performance metrics based on funding
    this.performance.defenseReadiness -= 0.01 * (1 - this.metrics.soldiers / 200000);
    this.performance.internationalInfluence -= 0.005 * this.metrics.internationalMissions;
    this.performance.technologicalAdvancement -= 0.005 * this.metrics.researchAndDevelopment / 10000000000;

    // Adjust metrics based on policies
    if (this.policies.conscription) {
      this.metrics.soldiers = Math.min(this.metrics.soldiers + 10000, 200000);
    }

    // Update historical data
    this.historicalData.push({ ...this.metrics, ...this.performance });
  }

  #updateDefenseMetrics() {
    this.performance.defenseReadiness = this.metrics.soldiers / 200000;
  }

  #updateBudgetRequirements() {
    // Calculate budget requirements based on metrics
    this.budget = this.calculateBudget();
  }
}
