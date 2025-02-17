import { DepartmentBase } from './department-base.js';

export class TaxationDepartment extends DepartmentBase {
  constructor(config) {
    super({
      name: 'Department of Taxation',
      description: 'Handles all tax-related policies and revenue generation',
      ...config
    });

    this.taxRates = {
      incomeTax: [],
      corporateTax: 20,
      salesTax: 5,
      propertyTax: 1,
      capitalGainsTax: 15
    };
    this.thresholds = {
      incomeTax: []
    };
  }

  setIncomeTaxRates(rates) {
    this.taxRates.incomeTax = rates;
  }

  setIncomeTaxThresholds(thresholds) {
    this.thresholds.incomeTax = thresholds;
  }

  setCorporateTaxRate(rate) {
    this.taxRates.corporateTax = rate;
  }

  setSalesTaxRate(rate) {
    this.taxRates.salesTax = rate;
  }

  setPropertyTaxRate(rate) {
    this.taxRates.propertyTax = rate;
  }

  setCapitalGainsTaxRate(rate) {
    this.taxRates.capitalGainsTax = rate;
  }

  calculateIncomeTax(income) {
    let tax = 0;
    for (let i = 0; i < this.taxRates.incomeTax.length; i++) {
      if (income > this.thresholds.incomeTax[i]) {
        tax += (income - this.thresholds.incomeTax[i]) * (this.taxRates.incomeTax[i] / 100);
        income = this.thresholds.incomeTax[i];
      }
    }
    return tax;
  }

  calculateCorporateTax(profit) {
    return profit * (this.taxRates.corporateTax / 100);
  }

  calculateSalesTax(amount) {
    return amount * (this.taxRates.salesTax / 100);
  }

  calculatePropertyTax(propertyValue) {
    return propertyValue * (this.taxRates.propertyTax / 100);
  }

  calculateCapitalGainsTax(gain) {
    return gain * (this.taxRates.capitalGainsTax / 100);
  }

  getTotalTaxRevenue(incomes, profits, sales, properties, capitalGains) {
    let totalRevenue = 0;
    incomes.forEach(income => {
      totalRevenue += this.calculateIncomeTax(income);
    });
    profits.forEach(profit => {
      totalRevenue += this.calculateCorporateTax(profit);
    });
    sales.forEach(sale => {
      totalRevenue += this.calculateSalesTax(sale);
    });
    properties.forEach(property => {
      totalRevenue += this.calculatePropertyTax(property);
    });
    capitalGains.forEach(gain => {
      totalRevenue += this.calculateCapitalGainsTax(gain);
    });
    return totalRevenue;
  }

  simulateMonth() {
    // Implement monthly simulation logic for the Taxation Department
  }
}
