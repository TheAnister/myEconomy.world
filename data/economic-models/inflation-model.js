export class InflationModel {
  constructor(initialCPI = 100) {
    this.currentCPI = initialCPI;
    this.previousCPI = initialCPI;
    this.inflationRate = 0;
  }

  updateCPI(newCPI) {
    this.previousCPI = this.currentCPI;
    this.currentCPI = newCPI;
    this.calculateInflationRate();
  }

  calculateInflationRate() {
    if (this.previousCPI === 0) {
      this.inflationRate = 0;
    } else {
      this.inflationRate = ((this.currentCPI - this.previousCPI) / this.previousCPI) * 100;
    }
  }

  simulateInflation(priceIncreasePercentage) {
    const newCPI = this.currentCPI * (1 + priceIncreasePercentage / 100);
    this.updateCPI(newCPI);
  }

  getInflationRate() {
    return this.inflationRate;
  }

  getCPI() {
    return this.currentCPI;
  }
}
