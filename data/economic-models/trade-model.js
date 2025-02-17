export class TradeModel {
  constructor() {
    this.exports = 0;
    this.imports = 0;
    this.tradeBalance = 0;
  }

  updateExports(value) {
    this.exports = value;
    this.calculateTradeBalance();
  }

  updateImports(value) {
    this.imports = value;
    this.calculateTradeBalance();
  }

  calculateTradeBalance() {
    this.tradeBalance = this.exports - this.imports;
  }

  simulateTrade(exportChange, importChange) {
    const newExports = this.exports * (1 + exportChange / 100);
    const newImports = this.imports * (1 + importChange / 100);
    this.updateExports(newExports);
    this.updateImports(newImports);
  }

  getTradeBalance() {
    return this.tradeBalance;
  }

  getExports() {
    return this.exports;
  }

  getImports() {
    return this.imports;
  }
}
