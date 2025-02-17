import { DataLoader } from '../core/data-loader.js';
import Chart from 'chart.js/auto';

export class StatisticsManager {
  constructor() {
    this.economicIndicators = {};
    this.socialIndicators = {};
    this.healthIndicators = {};
    this.educationIndicators = {};
    this.environmentalIndicators = {};
    this.history = {
      GDP: [],
      unemploymentRate: [],
      inflationRate: [],
      literacyRate: [],
      lifeExpectancy: [],
      povertyRate: [],
      carbonFootprint: []
    };
  }

  async initialize() {
    const stats = await DataLoader.loadStatistics();
    this.economicIndicators = stats.economicIndicators;
    this.socialIndicators = stats.socialIndicators;
    this.healthIndicators = stats.healthIndicators;
    this.educationIndicators = stats.educationIndicators;
    this.environmentalIndicators = stats.environmentalIndicators;
  }

  updateEconomicIndicators(newIndicators) {
    this.economicIndicators = { ...this.economicIndicators, ...newIndicators };
    this.history.GDP.push(this.calculateGDP());
    this.history.unemploymentRate.push(this.calculateUnemploymentRate());
    this.history.inflationRate.push(this.calculateInflationRate());
  }

  updateSocialIndicators(newIndicators) {
    this.socialIndicators = { ...this.socialIndicators, ...newIndicators };
    this.history.povertyRate.push(this.calculatePovertyRate());
  }

  updateHealthIndicators(newIndicators) {
    this.healthIndicators = { ...this.healthIndicators, ...newIndicators };
    this.history.lifeExpectancy.push(this.calculateLifeExpectancy());
  }

  updateEducationIndicators(newIndicators) {
    this.educationIndicators = { ...this.educationIndicators, ...newIndicators };
    this.history.literacyRate.push(this.calculateLiteracyRate());
  }

  updateEnvironmentalIndicators(newIndicators) {
    this.environmentalIndicators = { ...this.environmentalIndicators, ...newIndicators };
    this.history.carbonFootprint.push(this.calculateCarbonFootprint());
  }

  calculateGDP() {
    const { consumption, investment, governmentSpending, netExports } = this.economicIndicators;
    return consumption + investment + governmentSpending + netExports;
  }

  calculateUnemploymentRate() {
    const { unemployed, laborForce } = this.economicIndicators;
    return (unemployed / laborForce) * 100;
  }

  calculateInflationRate() {
    const { consumerPriceIndex, previousConsumerPriceIndex } = this.economicIndicators;
    return ((consumerPriceIndex - previousConsumerPriceIndex) / previousConsumerPriceIndex) * 100;
  }

  calculateLiteracyRate() {
    const { literatePopulation, totalPopulation } = this.educationIndicators;
    return (literatePopulation / totalPopulation) * 100;
  }

  calculateLifeExpectancy() {
    const { lifeExpectancyAtBirth } = this.healthIndicators;
    return lifeExpectancyAtBirth;
  }

  calculatePovertyRate() {
    const { populationBelowPovertyLine, totalPopulation } = this.socialIndicators;
    return (populationBelowPovertyLine / totalPopulation) * 100;
  }

  calculateCarbonFootprint() {
    const { totalEmissions } = this.environmentalIndicators;
    return totalEmissions;
  }

  getSummary() {
    return {
      GDP: this.calculateGDP(),
      unemploymentRate: this.calculateUnemploymentRate(),
      inflationRate: this.calculateInflationRate(),
      literacyRate: this.calculateLiteracyRate(),
      lifeExpectancy: this.calculateLifeExpectancy(),
      povertyRate: this.calculatePovertyRate(),
      carbonFootprint: this.calculateCarbonFootprint()
    };
  }

  getDetailedEconomicIndicators() {
    return {
      ...this.economicIndicators,
      GDP: this.calculateGDP(),
      unemploymentRate: this.calculateUnemploymentRate(),
      inflationRate: this.calculateInflationRate()
    };
  }

  getDetailedSocialIndicators() {
    return {
      ...this.socialIndicators,
      povertyRate: this.calculatePovertyRate()
    };
  }

  getDetailedHealthIndicators() {
    return {
      ...this.healthIndicators,
      lifeExpectancy: this.calculateLifeExpectancy()
    };
  }

  getDetailedEducationIndicators() {
    return {
      ...this.educationIndicators,
      literacyRate: this.calculateLiteracyRate()
    };
  }

  getDetailedEnvironmentalIndicators() {
    return {
      ...this.environmentalIndicators,
      carbonFootprint: this.calculateCarbonFootprint()
    };
  }

  simulateEconomicImpact(policy) {
    // Simulate economic impact of a given policy
    switch (policy.type) {
      case 'taxIncrease':
        this.economicIndicators.governmentSpending += policy.amount;
        this.economicIndicators.consumption -= policy.amount * 0.5;
        break;
      case 'taxDecrease':
        this.economicIndicators.governmentSpending -= policy.amount;
        this.economicIndicators.consumption += policy.amount * 0.5;
        break;
      case 'infrastructureSpending':
        this.economicIndicators.governmentSpending += policy.amount;
        this.economicIndicators.investment += policy.amount * 0.3;
        break;
      case 'socialSpending':
        this.economicIndicators.governmentSpending += policy.amount;
        this.socialIndicators.populationBelowPovertyLine -= policy.amount * 1000;
        break;
      default:
        break;
    }

    this.calculateGDP();
    this.calculateUnemploymentRate();
    this.calculateInflationRate();
  }

  simulateSocialImpact(policy) {
    // Simulate social impact of a given policy
    switch (policy.type) {
      case 'educationFunding':
        this.educationIndicators.literatePopulation += policy.amount * 1000;
        break;
      case 'healthcareFunding':
        this.healthIndicators.lifeExpectancyAtBirth += policy.amount * 0.1;
        break;
      case 'housingSubsidies':
        this.socialIndicators.populationBelowPovertyLine -= policy.amount * 500;
        break;
      default:
        break;
    }

    this.calculateLiteracyRate();
    this.calculateLifeExpectancy();
    this.calculatePovertyRate();
  }

  simulateEnvironmentalImpact(policy) {
    // Simulate environmental impact of a given policy
    switch (policy.type) {
      case 'carbonTax':
        this.environmentalIndicators.totalEmissions -= policy.amount * 100000;
        break;
      case 'renewableEnergyFunding':
        this.environmentalIndicators.totalEmissions -= policy.amount * 50000;
        break;
      default:
        break;
    }

    this.calculateCarbonFootprint();
  }

  simulatePolicyImpact(policy) {
    this.simulateEconomicImpact(policy);
    this.simulateSocialImpact(policy);
    this.simulateEnvironmentalImpact(policy);
  }

  generateLineGraphData(indicator) {
    return {
      labels: Array.from({ length: this.history[indicator].length }, (_, i) => i + 1),
      datasets: [{
        label: indicator,
        data: this.history[indicator],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true
      }]
    };
  }

  generatePieChartData() {
    const sectorMetrics = this.getDetailedEconomicIndicators().sectorMetrics;
    const labels = Object.keys(sectorMetrics);
    const data = labels.map(sector => sectorMetrics[sector].totalRevenue);

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: labels.map((_, i) => `rgba(${(i * 30) % 255}, ${(i * 60) % 255}, ${(i * 90) % 255}, 0.2)`),
        borderColor: labels.map((_, i) => `rgba(${(i * 30) % 255}, ${(i * 60) % 255}, ${(i * 90) % 255}, 1)`),
        borderWidth: 1
      }]
    };
  }

  renderLineGraph(ctx, indicator) {
    const data = this.generateLineGraphData(indicator);
    new Chart(ctx, {
      type: 'line',
      data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        }
      }
    });
  }

  renderPieChart(ctx) {
    const data = this.generatePieChartData();
    new Chart(ctx, {
      type: 'pie',
      data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          }
        }
      }
    });
  }

  snapshot() {
    return {
      economicIndicators: { ...this.economicIndicators },
      socialIndicators: { ...this.socialIndicators },
      healthIndicators: { ...this.healthIndicators },
      educationIndicators: { ...this.educationIndicators },
      environmentalIndicators: { ...this.environmentalIndicators }
    };
  }
}
