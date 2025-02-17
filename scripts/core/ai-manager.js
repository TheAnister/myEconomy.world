import { EconomicRelationsModel } from './ai-models/economic-relations.js';
import { DiplomaticAI } from './ai-models/diplomacy.js';
import { MilitaryStrategyEngine } from './ai-models/military.js';
import { CompanyManager } from '../modules/companies.js';

export class AIManager {
  constructor(economyEngine, companyManager) {
    this.aiCountries = new Map();
    this.playerCountry = null;
    this.economyEngine = economyEngine;
    this.companyManager = companyManager;
    
    // AI subsystems
    this.economicModel = new EconomicRelationsModel();
    this.diplomaticAI = new DiplomaticAI();
    this.militaryAI = new MilitaryStrategyEngine();
    
    // State tracking
    this.globalRelations = new Map();
    this.tradeHistory = [];
    this.crisisStates = new Set();
  }

  async initialize(countries) {
    this.playerCountry = this.economyEngine.playerCountry;
    this.aiCountries = new Map(countries.map(c => [c.name, this.#createAICountry(c)]));
    this.#initializeRelationsMatrix();
    this.#generateInitialAlliances();
  }

  #createAICountry(countryData) {
    return {
      ...countryData,
      aiTraits: {
        aggression: Math.random(),
        economicFocus: Math.random(),
        diplomaticBias: Math.random() * 2 - 1, // -1 to 1
        riskAppetite: Math.random(),
        innovation: Math.random()
      },
      relationships: new Map(),
      strategicGoals: [],
      memory: {
        pastConflicts: [],
        tradeHistory: [],
        agreements: []
      }
    };
  }

  #initializeRelationsMatrix() {
    for (const [name, country] of this.aiCountries) {
      country.relationships = new Map(
        Array.from(this.aiCountries.keys())
          .filter(n => n !== name)
          .map(n => [n, this.#calculateInitialRelation(country, this.aiCountries.get(n))])
      );
      country.relationships.set(this.playerCountry.name, 0.5); // Neutral initial
    }
  }

  #calculateInitialRelation(countryA, countryB) {
    const economicSimilarity = 1 - Math.abs(
      countryA.sectors.technology - countryB.sectors.technology
    );
    const politicalAlignment = 1 - Math.abs(
      countryA.aiTraits.diplomaticBias - countryB.aiTraits.diplomaticBias
    );
    return (economicSimilarity * 0.6 + politicalAlignment * 0.4) * 0.8 + 0.1;
  }

  simulateAICountries() {
    const globalEconomy = this.economyEngine.getEconomicState();
    
    for (const [name, country] of this.aiCountries) {
      // Update strategic goals
      this.#updateStrategicGoals(country, globalEconomy);
      
      // Make economic decisions
      this.#makeEconomicDecisions(country);
      
      // Handle diplomacy
      this.#processDiplomacy(country);
      
      // Military actions
      if (country.aiTraits.aggression > 0.7) {
        this.#considerMilitaryActions(country);
      }
      
      // Update relationships
      this.#updateRelationships(country);
    }
    
    this.#balanceGlobalPower();
    this.#handleCrisisSituations();
  }

  #updateStrategicGoals(country, economy) {
    // Analyze economic position
    const needs = this.economicModel.analyzeNeeds(country, economy);
    
    // Update goals based on needs and traits
    country.strategicGoals = this.#prioritizeGoals({
      economic: needs.economic,
      military: needs.military,
      diplomatic: needs.diplomatic
    }, country.aiTraits);
  }

  #prioritizeGoals(needs, traits) {
    const weightedGoals = [
      { type: 'economic', weight: traits.economicFocus * needs.economic },
      { type: 'military', weight: traits.aggression * needs.military },
      { type: 'diplomatic', weight: (1 - traits.aggression) * needs.diplomatic }
    ].sort((a, b) => b.weight - a.weight);
    
    return weightedGoals.slice(0, 2).map(g => g.type);
  }

  #makeEconomicDecisions(country) {
    const economicState = this.economyEngine.getCountryState(country.name);
    const playerActions = this.economyEngine.getPlayerActions();
    
    // Tariff strategy
    const tariffStrategy = this.economicModel.calculateTariffs(
      country,
      economicState,
      playerActions
    );
    this.#applyTariffs(country, tariffStrategy);
    
    // Trade agreements
    this.#negotiateTradeAgreements(country);
    
    // Domestic policy
    const policyChanges = this.economicModel.determinePolicyChanges(
      country,
      economicState
    );
    this.#implementPolicyChanges(country, policyChanges);
    
    // Corporate competition
    this.#competeWithPlayerCompanies(country);
  }

  #competeWithPlayerCompanies(country) {
    const competitionSectors = this.#identifyCompetitionSectors(country);
    
    competitionSectors.forEach(sector => {
      const aiCompanies = this.companyManager.getSectorCompanies(sector, country.name);
      const playerCompanies = this.companyManager.getSectorCompanies(sector, this.playerCountry.name);
      
      aiCompanies.forEach(company => {
        const competitiveAction = this.economicModel.determineCompetitiveAction(
          company,
          playerCompanies,
          country.aiTraits
        );
        this.companyManager.applyCompanyStrategy(company.id, competitiveAction);
      });
    });
  }

  #negotiateTradeAgreements(country) {
    const potentialPartners = this.#findTradePartners(country);
    
    potentialPartners.forEach(partner => {
      if (this.diplomaticAI.shouldProposeAgreement(country, partner)) {
        const agreement = this.diplomaticAI.generateTradeAgreement(
          country,
          partner,
          this.globalRelations.get(country.name).get(partner.name)
        );
        
        if (this.#simulateAgreementResponse(partner, agreement)) {
          this.#implementTradeAgreement(country, partner, agreement);
        }
      }
    });
  }

  #considerMilitaryActions(country) {
    const potentialTargets = this.#evaluateMilitaryTargets(country);
    
    potentialTargets.forEach(target => {
      if (this.militaryAI.shouldConsiderAttack(country, target)) {
        const plan = this.militaryAI.generatePlan(country, target);
        
        if (this.#simulateBattleOutcome(plan)) {
          this.#executeMilitaryAction(country, target, plan);
        }
      }
    });
  }

  #balanceGlobalPower() {
    const powerBalance = this.#calculateGlobalPower();
    
    if (powerBalance.dominance > 0.7) {
      this.#formCounterAlliances(powerBalance.dominantPower);
    }
  }

  #handleCrisisSituations() {
    this.aiCountries.forEach(country => {
      if (this.#isInEconomicCrisis(country)) {
        const response = this.economicModel.generateCrisisResponse(
          country,
          this.crisisStates
        );
        this.#implementCrisisMeasures(country, response);
      }
    });
  }

  // ... Additional complex methods (150+ lines)

  // External interface for game engine
  getCountryState(countryName) {
    const country = this.aiCountries.get(countryName);
    return {
      economy: this.economyEngine.getCountryEconomy(countryName),
      military: this.militaryAI.getMilitaryStatus(countryName),
      relations: this.globalRelations.get(countryName)
    };
  }

  calculateGlobalTrade(playerCountry) {
    return this.economicModel.calculateGlobalTradeImpacts(
      playerCountry,
      Array.from(this.aiCountries.values()),
      this.companyManager.getGlobalMarketShares()
    );
  }

  getDiplomaticStatus(countryName) {
    return {
      alliances: this.diplomaticAI.getAlliances(countryName),
      tensions: this.diplomaticAI.getCurrentTensions(countryName),
      ongoingNegotiations: this.diplomaticAI.getActiveNegotiations(countryName)
    };
  }

  // Event handling
  handlePlayerAction(action) {
    switch(action.type) {
      case 'tariff_change':
        this.#reactToTariffs(action.target, action.sector, action.rate);
        break;
      case 'trade_agreement':
        this.#respondToTradeProposal(action);
        break;
      case 'military_move':
        this.#counterMilitaryAction(action);
        break;
      // Additional action types
    }
  }

  #reactToTariffs(target, sector, rate) {
    this.aiCountries.forEach(country => {
      if (country.relationships.get(target) < 0.4) {
        this.economicModel.generateRetaliatoryMeasures(
          country,
          target,
          sector,
          rate
        ).forEach(measure => {
          this.#implementEconomicMeasure(country, measure);
        });
      }
    });
  }

  // Debug and analysis
  getAIDecisionLog(countryName) {
    return {
      goals: this.aiCountries.get(countryName).strategicGoals,
      recentActions: this.aiCountries.get(countryName).memory.actions.slice(-10),
      relationshipMap: Array.from(this.globalRelations.get(countryName).entries())
    };
  }
}