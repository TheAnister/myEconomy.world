import { EconomicIndicators } from '/scripts/utils/helpers.js';
import { GameMath } from '/scripts/utils/game-math.js';

export class EconomicRelationsModel {
  constructor() {
    this.baseCompetitiveness = 0.5;
    this.historicalData = new Map();
  }

  // Core tariff calculation using strategic trade theory
  calculateTariffs(aiCountry, economicState, playerActions) {
    const protectionism = aiCountry.aiTraits.aggression * 0.8 + 
                         (1 - aiCountry.aiTraits.innovation) * 0.2;
    
    const sectorVulnerability = this.calculateSectorVulnerability(
      aiCountry, 
      playerActions
    );

    const strategicSectors = this.identifyStrategicSectors(aiCountry);
    const tradeBalanceImpact = 1 - Math.tanh(economicState.tradeBalance / 1e9);

    return strategicSectors.map(sector => ({
      sector,
      rate: GameMath.clamp(
        (protectionism * 0.4 + 
         sectorVulnerability[sector] * 0.3 + 
         tradeBalanceImpact * 0.3) * 0.25,
        0,
        0.4
      )
    }));
  }

  // Based on IMF-style structural adjustment programs
  determinePolicyChanges(aiCountry, economicState) {
    const changes = {
      taxRate: 0,
      interestRate: 0,
      governmentSpending: 0,
      moneySupply: 0
    };

    // Inflation targeting rule (modified Taylor rule)
    const inflationGap = economicState.inflation - aiCountry.inflationTarget;
    const outputGap = (economicState.gdp - economicState.potentialGDP) / economicState.potentialGDP;
    
    changes.interestRate = 1.5 * inflationGap + 0.5 * outputGap + 1.0;
    
    // Fiscal policy response (Keynesian multiplier based)
    if (outputGap < -0.02) {  // Recessionary gap
      changes.governmentSpending = Math.min(
        0.05 * economicState.gdp,
        aiCountry.fiscalSpace * 0.8
      );
      changes.taxRate = -0.02 * aiCountry.aiTraits.riskAppetite;
    } 
    
    if (economicState.debtToGDP > 90) {  // Debt sustainability limit
      changes.governmentSpending *= 0.5;
      changes.taxRate += 0.01 * (economicState.debtToGDP / 90);
    }

    return changes;
  }

  // Needs assessment using IMF Article IV criteria
  analyzeNeeds(aiCountry, globalEconomy) {
    const needs = {
      economic: 0,
      military: 0,
      diplomatic: 0
    };

    // Economic needs calculation
    const growthShortfall = Math.max(
      0, 
      aiCountry.gdpGrowthTarget - globalEconomy.gdpGrowth
    );
    const inflationRisk = Math.abs(globalEconomy.inflation - aiCountry.inflationTarget);
    
    needs.economic = GameMath.lerp(
      growthShortfall * 0.7 + inflationRisk * 0.3,
      0,
      1
    );

    // Military needs (based on neighbors' capabilities)
    const militaryPressure = this.calculateMilitaryPressure(aiCountry);
    needs.military = GameMath.clamp(
      militaryPressure * aiCountry.aiTraits.aggression,
      0,
      1
    );

    // Diplomatic needs (alliance network analysis)
    const allianceDeficit = 1 - this.calculateAllianceStrength(aiCountry);
    needs.diplomatic = allianceDeficit * (1 - aiCountry.aiTraits.aggression);

    return needs;
  }

  // Crisis response based on historical economic crises
  generateCrisisResponse(aiCountry, crisisType) {
    const response = {
      monetary: {},
      fiscal: {},
      structural: []
    };

    switch(crisisType) {
      case 'hyperinflation':
        response.monetary = {
          interestRate: +5.0,
          moneySupply: -0.3
        };
        response.fiscal = {
          spendingCut: 0.15,
          taxIncrease: 0.03
        };
        break;

      case 'debt_default':
        response.structural.push(
          'pension_reform',
          'privatization',
          'labor_market_flexibility'
        );
        response.monetary.interestRate = +3.0;
        break;

      case 'currency_crisis':
        response.monetary = {
          interestRate: +7.0,
          foreignReserves: -0.4
        };
        response.capitalControls = true;
        break;
    }

    return this.applyTraitModifiers(response, aiCountry.aiTraits);
  }

  // Corporate competition strategy
  determineCompetitiveAction(aiCompany, competitors, traits) {
    const marketShare = aiCompany.marketShare / 
      (competitors.reduce((sum, c) => sum + c.marketShare, 0) + aiCompany.marketShare);

    const strategy = {
      priceAdjustment: 0,
      qualityInvestment: 0,
      marketingBoost: 0,
      rdFocus: 0
    };

    if (marketShare > 0.4) {  // Market leader
      strategy.priceAdjustment = -0.02 * traits.aggression;
      strategy.qualityInvestment = 0.1 * traits.innovation;
    } else {  // Challenger
      strategy.priceAdjustment = -0.05 * traits.riskAppetite;
      strategy.marketingBoost = 0.15 * (1 - traits.innovation);
    }

    // R&D focus based on technological edge
    strategy.rdFocus = Math.min(
      traits.innovation * 0.2 + 
      (1 - this.baseCompetitiveness) * 0.1,
      0.3
    );

    return strategy;
  }

  // -- Private Methods -- //
  calculateSectorVulnerability(aiCountry, playerActions) {
    return Object.fromEntries(
      Object.entries(aiCountry.sectors).map(([sector, share]) => [
        sector,
        playerActions.tariffs[sector] * share * 
        this.getSectorElasticity(sector)
      ])
    );
  }

  getSectorElasticity(sector) {
    const elasticities = {
      technology: 1.2,
      manufacturing: 0.8,
      energy: 0.6,
      pharmaceuticals: 1.0
    };
    return elasticities[sector] || 1.0;
  }

  applyTraitModifiers(response, traits) {
    // Modify responses based on AI personality
    if (traits.riskAppetite < 0.3) {
      response.monetary.interestRate *= 1.2;
      response.fiscal.spendingCut *= 0.8;
    }
    
    if (traits.innovation > 0.7) {
      response.structural.push('digital_transformation');
    }
    
    return response;
  }

  calculateMilitaryPressure(aiCountry) {
    const neighbors = this.getGeographicNeighbors(aiCountry);
    return neighbors.reduce((sum, neighbor) => {
      const powerRatio = neighbor.militaryStrength / aiCountry.militaryStrength;
      return sum + (powerRatio > 1 ? powerRatio - 1 : 0);
    }, 0) / neighbors.length;
  }

  calculateAllianceStrength(aiCountry) {
    const alliances = this.getActiveAlliances(aiCountry);
    return alliances.reduce((strength, alliance) => {
      return strength + (alliance.strength * alliance.trustLevel);
    }, 0);
  }

  // Placeholder methods for private fields
  getGeographicNeighbors(aiCountry) {
    // Placeholder implementation
    return [];
  }

  getActiveAlliances(aiCountry) {
    // Placeholder implementation
    return [];
  }
}