import { DepartmentBase } from './department-base.js';
import { GameMath, EconomicIndicators } from '../../utils/helpers.js';
import { eventSystem } from '../../core/event-system.js';

export class HealthcareDepartment extends DepartmentBase {
  constructor(config) {
    super({
      name: 'National Health Service',
      description: 'Public healthcare system management',
      ...config
    });

    // Core metrics
    this.metrics = {
      doctors: 150000,      // Total medical staff
      doctorSalary: 45000,  // Average annual salary £
      subsidyPercentage: 1, // 100% = free at point of service
      waitingTimes: 4,      // Average weeks for elective care
      facilities: 1200,     // Hospitals/clinics
      medicalSchools: 33,   // Training institutions
      pharmaceuticalSubsidy: 0.2 // Prescription cost coverage
    };

    // Performance indicators
    this.performance = {
      lifeExpectancy: 81.3,
      patientSatisfaction: 0.76,
      emergencyResponse: 8.2, // Minutes avg
      preventableDeaths: 12.3 // Per 100k
    };

    // Policy configurations
    this.policies = {
      freeAtPointOfUse: true,
      dentalCoverage: 0.3,   // % of dental costs covered
      mentalHealthFunding: 0.15, // % of budget
      privatePracticeAllowed: true
    };

    this.historicalData = [];
  }

  // --- Core Configuration Methods ---
  setDoctorCount(number) {
    this.metrics.doctors = GameMath.clamp(number, 100000, 300000);
    this.#updateWorkforceMetrics();
    eventSystem.queueEvent({
      type: 'healthcare.staffing_change',
      data: { doctors: this.metrics.doctors }
    });
  }

  setSubsidyLevel(percentage) {
    this.metrics.subsidyPercentage = GameMath.clamp(percentage, 0, 1);
    this.policies.freeAtPointOfUse = percentage === 1;
    
    eventSystem.queueEvent({
      type: 'healthcare.funding_change',
      data: { subsidy: this.metrics.subsidyPercentage }
    });
  }

  adjustSalaries(percentageChange) {
    this.metrics.doctorSalary *= 1 + percentageChange;
    this.#updateBudgetRequirements();
  }

  // --- Economic Calculations ---
  calculateBudget() {
    const baseCost = this.metrics.doctors * this.metrics.doctorSalary;
    const facilityCosts = this.metrics.facilities * 2500000; // Annual facility costs
    const researchFunding = this.budget * 0.12;
    
    return (baseCost + facilityCosts + researchFunding) * this.metrics.subsidyPercentage;
  }

  getMonthlyCost() {
    return this.calculateBudget() / 12;
  }

  // --- Policy Implementation ---
  implementReform(policy) {
    switch(policy.type) {
      case 'privatization':
        this.policies.privatePracticeAllowed = true;
        this.metrics.subsidyPercentage = GameMath.clamp(
          this.metrics.subsidyPercentage - 0.2,
          0.6,
          1
        );
        break;
        
      case 'mentalHealthFocus':
        this.policies.mentalHealthFunding += 0.05;
        this.#redistributeBudget();
        break;
    }
  }

  // --- Performance Simulation ---
  simulateMonth() {
    // Update performance metrics based on funding
    this.performance.lifeExpectancy = this.#calculateLifeExpectancy();
    this.performance.patientSatisfaction = this.#calculateSatisfaction();
    this.performance.waitingTimes = this.#calculateWaitingTimes();
    
    // Store historical data
    this.historicalData.push({
      month: Date.now(),
      metrics: {...this.metrics},
      performance: {...this.performance}
    });
  }

  // --- Private Methods ---
  #updateWorkforceMetrics() {
    const doctorsPerCapita = this.metrics.doctors / 67; // 67M population
    this.performance.emergencyResponse = Math.max(
      4,
      10 - (doctorsPerCapita * 0.8)
    );
  }

  #calculateLifeExpectancy() {
    const base = 80;
    const fundingImpact = (this.metrics.subsidyPercentage - 0.8) * 2;
    const doctorImpact = (this.metrics.doctors - 150000) / 50000;
    return base + fundingImpact + doctorImpact;
  }

  #calculateSatisfaction() {
    const waitingTimeFactor = (8 - this.performance.waitingTimes) / 8;
    const costFactor = this.metrics.subsidyPercentage;
    return GameMath.clamp(
      (waitingTimeFactor * 0.6 + costFactor * 0.4) * 0.9,
      0.5,
      0.95
    );
  }

  #calculateWaitingTimes() {
    const demand = 0.8 + (1 - this.metrics.subsidyPercentage) * 0.3;
    const capacity = this.metrics.doctors / 150000;
    return GameMath.clamp(4 * (demand / capacity), 2, 26);
  }

  #redistributeBudget() {
    const total = Object.values(this.policies)
      .filter(v => typeof v === 'number')
      .reduce((sum, v) => sum + v, 0);
    
    // Normalize percentages
    Object.keys(this.policies).forEach(k => {
      if (typeof this.policies[k] === 'number') {
        this.policies[k] /= total;
      }
    });
  }

  // --- Serialization ---
  toJSON() {
    return {
      metrics: this.metrics,
      performance: this.performance,
      policies: this.policies,
      historicalData: this.historicalData
    };
  }

  static fromJSON(json) {
    const department = new HealthcareDepartment();
    Object.assign(department, json);
    return department;
  }
}
