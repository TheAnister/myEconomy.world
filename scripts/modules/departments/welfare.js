import { DepartmentBase } from './department-base.js';

export class WelfareDepartment extends DepartmentBase {
  constructor(config) {
    super({
      name: 'Department of Welfare',
      description: 'Handles social security and welfare programs',
      ...config
    });

    this.metrics = {
      unemploymentBenefits: 10000000000, // Annual budget for unemployment benefits
      disabilityBenefits: 5000000000,    // Annual budget for disability benefits
      pensionFund: 20000000000,          // Annual budget for pensions
      housingAssistance: 8000000000,     // Annual budget for housing assistance
      socialWorkers: 100000              // Total number of social workers
    };

    this.performance = {
      povertyRate: 0.15,               // Scale from 0 to 1
      unemploymentRate: 0.06,          // Scale from 0 to 1
      satisfactionRate: 0.7,           // Scale from 0 to 1
      homelessnessRate: 0.02           // Scale from 0 to 1
    };

    this.policies = {
      universalBasicIncome: false,
      unemploymentInsurance: 0.5,       // % of salary covered
      disabilitySupport: 0.3,           // % of budget
      housingSubsidies: 0.2             // % of budget
    };

    this.historicalData = [];
  }

  setSocialWorkerCount(number) {
    this.metrics.socialWorkers = number;
    this.#updateWelfareMetrics();
  }

  setBenefitBudget(type, amount) {
    this.metrics[type] = amount;
    this.#updateBudgetRequirements();
  }

  adjustSalaries(percentageChange) {
    this.metrics.socialWorkersSalary *= 1 + percentageChange;
    this.#updateBudgetRequirements();
  }

  calculateBudget() {
    const benefitsCost = this.metrics.unemploymentBenefits +
                         this.metrics.disabilityBenefits +
                         this.metrics.pensionFund +
                         this.metrics.housingAssistance;
    const socialWorkerCosts = this.metrics.socialWorkers * 30000; // Average annual salary £

    return benefitsCost + socialWorkerCosts;
  }

  getMonthlyCost() {
    return this.calculateBudget() / 12;
  }

  implementReform(policy) {
    switch(policy.type) {
      case 'increasePovertyReduction':
        this.performance.povertyRate = Math.max(this.performance.povertyRate - 0.02, 0);
        break;
      case 'boostEmploymentSupport':
        this.performance.unemploymentRate = Math.max(this.performance.unemploymentRate - 0.01, 0);
        break;
      case 'expandHousingAssistance':
        this.policies.housingSubsidies = Math.min(this.policies.housingSubsidies + 0.05, 0.5);
        break;
    }
  }

  simulateMonth() {
    // Update performance metrics based on funding
    this.performance.povertyRate += 0.001 * (1 - this.metrics.unemploymentBenefits / 12000000000);
    this.performance.unemploymentRate += 0.002 * (1 - this.metrics.socialWorkers / 120000);
    this.performance.homelessnessRate += 0.003 * (1 - this.metrics.housingAssistance / 10000000000);
    this.performance.satisfactionRate -= 0.002 * (1 - this.performance.povertyRate);

    // Adjust metrics based on policies
    if (this.policies.universalBasicIncome) {
      this.performance.povertyRate = Math.max(this.performance.povertyRate - 0.03, 0);
    }

    // Update historical data
    this.historicalData.push({ ...this.metrics, ...this.performance });
  }

  #updateWelfareMetrics() {
    this.performance.povertyRate = 1 - (this.metrics.socialWorkers / 120000);
  }

  #updateBudgetRequirements() {
    // Calculate budget requirements based on metrics
    this.budget = this.calculateBudget();
  }
}
