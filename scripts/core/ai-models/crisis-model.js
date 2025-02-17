import { EconomicRelationsModel } from './economic-relations.js';
import { MilitaryStrategyEngine } from './military.js';
import { GameMath, EconomicIndicators } from '../utils/helpers.js';

export class CrisisModel {
  constructor() {
    this.crisisHistory = new Map();
    this.activeCrises = new Set();
    this.crisisThresholds = {
      economic: 0.7,
      political: 0.6,
      military: 0.8,
      environmental: 0.65
    };
  }

  initializeCrisisSystem(countries) {
    countries.forEach(country => {
      this.crisisHistory.set(country.name, {
        economic: [],
        political: [],
        military: [],
        environmental: []
      });
    });
  }

  detectCrises(country, economicState, relations) {
    const crises = [];
    
    // Economic Crisis Detection
    if (this.#detectEconomicCrisis(country, economicState)) {
      crises.push({
        type: 'economic',
        severity: this.#calculateEconomicCrisisSeverity(country, economicState)
      });
    }

    // Political Crisis Detection
    const politicalStability = country.political_stability_index / 100;
    if (politicalStability < this.crisisThresholds.political) {
      crises.push({
        type: 'political',
        severity: 1 - politicalStability
      });
    }

    // Military Crisis Detection
    if (relations.militaryThreatLevel > this.crisisThresholds.military) {
      crises.push({
        type: 'military',
        severity: relations.militaryThreatLevel
      });
    }

    // Environmental Crisis Detection
    if (country.environmental_index < 40) {
      crises.push({
        type: 'environmental',
        severity: (40 - country.environmental_index) / 40
      });
    }

    return crises.sort((a, b) => b.severity - a.severity);
  }

  generateCrisisResponse(country, crisis, economicModel, militaryModel) {
    const response = {
      immediate: [],
      shortTerm: [],
      longTerm: [],
      economicImpact: 0,
      politicalCost: 0
    };

    switch(crisis.type) {
      case 'economic':
        return this.#handleEconomicCrisis(country, crisis, economicModel);
      case 'military':
        return this.#handleMilitaryCrisis(country, crisis, militaryModel);
      case 'political':
        return this.#handlePoliticalCrisis(country, crisis);
      case 'environmental':
        return this.#handleEnvironmentalCrisis(country, crisis);
    }
    return response;
  }

  simulateCrisisOutcome(response, country, originalState) {
    const effectiveness = this.#calculateResponseEffectiveness(response, country);
    const resolutionStatus = {
      contained: false,
      severityReduction: 0,
      newProblems: []
    };

    // Calculate base resolution
    resolutionStatus.severityReduction = GameMath.clamp(
      effectiveness * response.effectivenessCoefficient,
      0,
      0.95
    );

    // Check for containment
    resolutionStatus.contained = resolutionStatus.severityReduction > 0.7;

    // Calculate economic spillover effects
    const economicImpact = response.economicImpact * 
      (1 - country.aiTraits.economicFocus);
    if (economicImpact > 0.3) {
      resolutionStatus.newProblems.push('secondary_recession');
    }

    // Update country state
    this.#updateCountryState(country, resolutionStatus, originalState);

    return resolutionStatus;
  }

  // -- Economic Crisis Handlers -- //
  #handleEconomicCrisis(country, crisis, economicModel) {
    const response = {
      type: 'economic',
      measures: [],
      effectivenessCoefficient: 0.8,
      economicImpact: 0
    };

    const crisisType = this.#identifyEconomicCrisisType(country);
    
    switch(crisisType) {
      case 'hyperinflation':
        response.measures = [
          'monetary_stabilization',
          'fiscal_austerity',
          'currency_peg'
        ];
        response.effectivenessCoefficient = 0.65;
        response.economicImpact = -0.15;
        break;
        
      case 'debt_crisis':
        response.measures = [
          'debt_restructuring',
          'imf_bailout',
          'privatization'
        ];
        response.effectivenessCoefficient = 0.55;
        response.economicImpact = -0.25;
        break;
        
      case 'banking_crisis':
        response.measures = [
          'bank_recapitalization',
          'deposit_insurance',
          'liquidity_injection'
        ];
        response.effectivenessCoefficient = 0.75;
        response.economicImpact = -0.1;
        break;
    }

    // Add AI-trait based modifications
    if (country.aiTraits.riskAppetite < 0.4) {
      response.measures.push('foreign_aid_request');
      response.economicImpact *= 0.8;
    }

    return response;
  }

  // -- Military Crisis Handlers -- //
  #handleMilitaryCrisis(country, crisis, militaryModel) {
    const response = {
      type: 'military',
      measures: [],
      effectivenessCoefficient: 0.9,
      economicImpact: -0.3
    };

    const threatAssessment = militaryModel.assessThreatLevel(country);
    
    if (threatAssessment > 0.8) {
      response.measures = [
        'mobilization',
        'alliance_activation',
        'strategic_defense_preparation'
      ];
      if (country.nuclearCapability) {
        response.measures.push('deterrence_posturing');
      }
    } else {
      response.measures = [
        'diplomatic_engagement',
        'border_fortification',
        'intelligence_surge'
      ];
    }

    // Add AI-trait based response
    if (country.aiTraits.aggression > 0.6) {
      response.measures.push('preemptive_strike');
      response.effectivenessCoefficient *= 1.2;
      response.economicImpact *= 1.5;
    }

    return response;
  }

  // -- Helper Methods -- //
  #detectEconomicCrisis(country, economicState) {
    const recession = economicState.gdpGrowth < -0.02;
    const inflationCrisis = economicState.inflation > 0.25;
    const debtCrisis = economicState.debtToGDP > 120;
    const bankingCrisis = economicState.bankHealthIndex < 0.3;

    return recession || inflationCrisis || debtCrisis || bankingCrisis;
  }

  #calculateResponseEffectiveness(response, country) {
    let effectiveness = 1.0;
    
    // Economic policy effectiveness
    if (response.type === 'economic') {
      effectiveness *= country.aiTraits.economicFocus * 1.2;
    }
    
    // Military response effectiveness
    if (response.type === 'military') {
      effectiveness *= country.aiTraits.aggression * 0.9;
    }
    
    // Political capability modifier
    effectiveness *= country.political_stability_index / 100;

    return GameMath.clamp(effectiveness, 0.1, 1.0);
  }

  #updateCountryState(country, resolution, originalState) {
    if (resolution.contained) {
      country.economicStability = Math.min(
        originalState.economicStability * 1.1,
        1.0
      );
    } else {
      country.economicStability *= 0.8;
    }

    // Apply secondary impacts
    if (resolution.newProblems.includes('secondary_recession')) {
      country.gdpGrowth -= 0.03;
      country.unemployment += 0.05;
    }
  }

  #identifyEconomicCrisisType(country) {
    const indicators = {
      inflation: country.inflationRate,
      debt: country.government_debt / country.gdp,
      banking: 1 - (country.bankHealthIndex || 0.5)
    };

    const maxIndicator = Object.entries(indicators).reduce(
      (a, b) => a[1] > b[1] ? a : b
    );

    return {
      inflation: 'hyperinflation',
      debt: 'debt_crisis',
      banking: 'banking_crisis'
    }[maxIndicator[0]];
  }
}
