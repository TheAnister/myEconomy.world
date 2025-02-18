import { DataLoader } from '../core/data-loader.js';
import { StatisticsManager } from './statistics.js';
import { CompanyManager } from './companies.js';
import { DepartmentBase } from './departments/department-base.js';

export class SaveManager {
  constructor() {
    this.statisticsManager = new StatisticsManager();
    this.companyManager = new CompanyManager();
    this.departments = new Map();
  }

  async initialize() {
    await this.statisticsManager.initialize();
    await this.companyManager.initialize();
    await this.loadDepartments();
  }

  async loadDepartments() {
    const departmentsData = await DataLoader.loadDepartments();
    departmentsData.forEach(departmentData => {
      const department = new DepartmentBase(departmentData);
      this.departments.set(department.name, department);
    });
  }

  saveGameState() {
    const gameState = {
      statistics: this.statisticsManager.snapshot(),
      companies: this.companyManager.snapshot(),
      departments: this.getDepartmentsSnapshot()
    };
    localStorage.setItem('gameState', JSON.stringify(gameState));
  }

  loadGameState() {
    const gameState = JSON.parse(localStorage.getItem('gameState'));
    if (gameState) {
      this.loadStatistics(gameState.statistics);
      this.loadCompanies(gameState.companies);
      this.loadDepartmentsFromSnapshot(gameState.departments);
    }
  }

  loadStatistics(statistics) {
    this.statisticsManager.updateEconomicIndicators(statistics.economicIndicators);
    this.statisticsManager.updateSocialIndicators(statistics.socialIndicators);
    this.statisticsManager.updateHealthIndicators(statistics.healthIndicators);
    this.statisticsManager.updateEducationIndicators(statistics.educationIndicators);
    this.statisticsManager.updateEnvironmentalIndicators(statistics.environmentalIndicators);
  }

  loadCompanies(companies) {
    companies.forEach(companyData => {
      const company = this.companyManager.companies.get(companyData.name);
      if (company) {
        Object.assign(company, companyData);
      } else {
        this.companyManager.companies.set(companyData.name, companyData);
      }
    });
  }

  loadDepartmentsFromSnapshot(departmentsSnapshot) {
    departmentsSnapshot.forEach(departmentData => {
      const department = this.departments.get(departmentData.name);
      if (department) {
        Object.assign(department, departmentData);
      } else {
        const newDepartment = new DepartmentBase(departmentData);
        this.departments.set(newDepartment.name, newDepartment);
      }
    });
  }

  getDepartmentsSnapshot() {
    return Array.from(this.departments.values()).map(department => department.toJSON());
  }
}