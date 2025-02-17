import { DepartmentBase } from './department-base.js';

export class EducationDepartment extends DepartmentBase {
  constructor(config) {
    super({
      name: 'Department of Education',
      description: 'Handles national education policies and expenditure',
      ...config
    });

    this.metrics = {
      teachers: 500000,          // Total number of teachers
      teacherSalary: 35000,      // Average annual salary £
      schoolBudget: 30000000000, // Annual budget for schools
      researchFunding: 5000000000, // Annual R&D budget
      schools: 20000,            // Number of schools
      universities: 150          // Number of universities
    };

    this.performance = {
      literacyRate: 0.99,           // Scale from 0 to 1
      graduationRate: 0.85,         // Scale from 0 to 1
      internationalRanking: 0.8,    // Scale from 0 to 1
      researchOutput: 0.7           // Scale from 0 to 1
    };

    this.policies = {
      freeEducation: true,
      scholarshipPrograms: 0.15, // % of budget
      vocationalTraining: 0.2    // % of budget
    };

    this.historicalData = [];
  }

  setTeacherCount(number) {
    this.metrics.teachers = number;
    this.#updateEducationMetrics();
  }

  setSchoolBudget(amount) {
    this.metrics.schoolBudget = amount;
    this.#updateBudgetRequirements();
  }

  adjustSalaries(percentageChange) {
    this.metrics.teacherSalary *= 1 + percentageChange;
    this.#updateBudgetRequirements();
  }

  calculateBudget() {
    const baseCost = this.metrics.teachers * this.metrics.teacherSalary;
    const schoolCosts = this.metrics.schoolBudget;
    const researchFunding = this.metrics.researchFunding;

    return baseCost + schoolCosts + researchFunding;
  }

  getMonthlyCost() {
    return this.calculateBudget() / 12;
  }

  implementReform(policy) {
    switch(policy.type) {
      case 'increaseLiteracy':
        this.performance.literacyRate = Math.min(this.performance.literacyRate + 0.05, 1);
        break;
      case 'boostResearchOutput':
        this.performance.researchOutput = Math.min(this.performance.researchOutput + 0.1, 1);
        break;
      case 'expandVocationalTraining':
        this.policies.vocationalTraining = Math.min(this.policies.vocationalTraining + 0.05, 0.5);
        break;
    }
  }

  simulateMonth() {
    // Update performance metrics based on funding
    this.performance.literacyRate -= 0.001 * (1 - this.metrics.teachers / 600000);
    this.performance.graduationRate -= 0.002 * (1 - this.metrics.schools / 25000);
    this.performance.internationalRanking -= 0.003 * (1 - this.metrics.universities / 200);
    this.performance.researchOutput -= 0.005 * this.metrics.researchFunding / 10000000000;

    // Adjust metrics based on policies
    if (this.policies.freeEducation) {
      this.performance.literacyRate = Math.min(this.performance.literacyRate + 0.01, 1);
    }

    // Update historical data
    this.historicalData.push({ ...this.metrics, ...this.performance });
  }

  #updateEducationMetrics() {
    this.performance.literacyRate = this.metrics.teachers / 600000;
  }

  #updateBudgetRequirements() {
    // Calculate budget requirements based on metrics
    this.budget = this.calculateBudget();
  }
}
