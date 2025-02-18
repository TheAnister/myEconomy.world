import { DataLoader } from '../core/data-loader.js';

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
}