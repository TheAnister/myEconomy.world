export class DiplomaticAI {
  constructor() {
    this.relationshipDecayRate = 0.98;
    this.crisisThreshold = 0.7;
    this.allianceHistory = new Map();
  }

  initializeDiplomacy(countries) {
    this.countries = new Map(countries.map(c => [c.name, c]));
    this.relationships = this.createRelationshipMatrix(countries);
    this.activeTreaties = new Map();
    this.ongoingNegotiations = new Set();
  }

  createRelationshipMatrix(countries) {
    const matrix = new Map();
    for (const country of countries) {
      const relations = new Map();
      for (const other of countries) {
        if (country.name !== other.name) {
          relations.set(other.name, {
            trust: this.calculateInitialTrust(country, other),
            tension: 0,
            cooperation: 0,
            lastInteraction: null
          });
        }
      }
      matrix.set(country.name, relations);
    }
    return matrix;
  }

  calculateInitialTrust(a, b) {
    const politicalAlignment = 1 - Math.abs(a.govType - b.govType);
    const economicAlignment = this.calculateEconomicAlignment(a, b);
    const historicalModifier = this.getHistoricalModifier(a, b);
    
    return GameMath.clamp(
      (politicalAlignment * 0.4 + 
       economicAlignment * 0.3 + 
       historicalModifier * 0.3) * 0.8 + 0.1,
      0,
      1
    );
  }

  calculateEconomicAlignment(a, b) {
    const tradeComplementarity = a.imports.filter(x => 
      b.exports.includes(x)).length / a.imports.length;
    const investmentOverlap = Math.min(
      a.foreignInvestment / b.gdp, 
      b.foreignInvestment / a.gdp
    );
    return (tradeComplementarity * 0.6 + investmentOverlap * 0.4);
  }

  updateRelationships() {
    for (const [country, relations] of this.relationships) {
      for (const [other, rel] of relations) {
        // Apply relationship decay
        rel.trust *= this.relationshipDecayRate;
        rel.tension *= this.relationshipDecayRate;
        
        // Update based on recent interactions
        if (rel.lastInteraction) {
          this.processInteractionEffects(rel);
        }
      }
    }
  }

  processInteractionEffects(relationship) {
    const { type, outcome } = relationship.lastInteraction;
    const modifiers = {
      'trade_deal': { trust: 0.1, tension: -0.05 },
      'sanction': { trust: -0.3, tension: 0.2 },
      'alliance': { trust: 0.2, tension: -0.1 },
      'border_dispute': { trust: -0.4, tension: 0.3 }
    };

    relationship.trust += modifiers[type].trust * outcome;
    relationship.tension += modifiers[type].tension * outcome;
    relationship.lastInteraction = null;
  }

  generateTradeAgreement(proposer, target, economicData) {
    const complexity = this.calculateDealComplexity(proposer, target);
    const rounds = Math.floor(3 + complexity * 2);
    const baseTerms = this.createBaseTerms(proposer, target, economicData);
    
    return {
      type: 'trade',
      proposer,
      target,
      roundsRemaining: rounds,
      currentTerms: baseTerms,
      history: [],
      redLines: this.identifyRedLines(proposer, target)
    };
  }

  calculateDealComplexity(a, b) {
    const sectorOverlap = Object.keys(a.sectors)
      .filter(s => b.sectors[s]).length;
    const existingIssues = this.countConflictingPolicies(a, b);
    return (sectorOverlap * 0.4 + existingIssues * 0.6);
  }

  simulateNegotiationRound(agreement) {
    const { proposer, target } = agreement;
    const newTerms = this.adjustTerms(
      agreement.currentTerms, 
      agreement.roundsRemaining,
      agreement.redLines
    );
    
    const targetUtility = this.calculateDealUtility(newTerms, target);
    const acceptanceThreshold = this.getAcceptanceThreshold(target);
    
    if (targetUtility > acceptanceThreshold) {
      return this.finalizeAgreement(agreement, newTerms);
    } else {
      return this.generateCounterProposal(agreement, newTerms);
    }
  }

  calculateDealUtility(terms, country) {
    let utility = 0;
    utility += terms.tariffReduction * country.tradePriority;
    utility -= terms.marketAccess * country.protectionism;
    utility += terms.intellectualProperty * country.innovationFocus;
    return GameMath.clamp(utility, -1, 1);
  }

  handleCrisis(crisis) {
    switch(crisis.type) {
      case 'border_conflict':
        return this.resolveBorderConflict(crisis);
      case 'trade_war':
        return this.deescalateTradeWar(crisis);
      case 'alliance_breakdown':
        return this.repairAlliance(crisis);
    }
  }

  resolveBorderConflict(crisis) {
    const { parties, disputedZone } = crisis;
    const militaryBalance = this.calculateMilitaryBalance(parties);
    const economicCost = this.calculateConflictCost(parties);
    
    const resolution = {
      mediator: this.findMediator(parties),
      pressureApplied: [],
      proposedSettlement: this.createSettlementPlan(disputedZone, militaryBalance)
    };

    parties.forEach(country => {
      if (this.willAcceptSettlement(country, resolution.proposedSettlement)) {
        resolution.pressureApplied.push(
          this.applyDiplomaticPressure(country, resolution.mediator)
        );
      }
    });

    return resolution;
  }

  formAlliance(initiator, target) {
    const existingAlliances = this.getAlliancesFor(initiator);
    const compatibility = this.calculateAllianceCompatibility(initiator, target);
    
    if (compatibility > 0.6 && !existingAlliances.some(a => a === target)) {
      const alliance = {
        members: [initiator, target],
        type: 'defensive',
        strength: compatibility,
        cohesion: 0.8
      };
      
      this.activeTreaties.set(
        `alliance_${Date.now()}`, 
        alliance
      );
      
      this.updateAllianceRelations(initiator, target, 0.2);
    }
  }

  breakAlliance(allianceId, instigator) {
    const alliance = this.activeTreaties.get(allianceId);
    alliance.members.forEach(member => {
      if (member !== instigator) {
        this.updateRelations(
          instigator, 
          member, 
          { trust: -0.4, tension: 0.3 }
        );
      }
    });
    this.activeTreaties.delete(allianceId);
  }

  // -- Helper Methods -- //
  updateRelations(a, b, modifiers) {
    const relAB = this.relationships.get(a).get(b);
    const relBA = this.relationships.get(b).get(a);
    
    Object.entries(modifiers).forEach(([key, value]) => {
      relAB[key] = GameMath.clamp(relAB[key] + value, 0, 1);
      relBA[key] = GameMath.clamp(relBA[key] + value * 0.8, 0, 1);
    });
  }

  getAcceptanceThreshold(country) {
    return (1 - country.aiTraits.riskAppetite) * 0.3 + 
      country.economicNeed * 0.7;
  }

  calculateMilitaryBalance(parties) {
    return parties.reduce((balance, country) => ({
      total: balance.total + country.militaryStrength,
      breakdown: {
        naval: balance.breakdown.naval + country.navalPower,
        air: balance.breakdown.air + country.airPower,
        ground: balance.breakdown.ground + country.groundForces
      }
    }), { total: 0, breakdown: { naval: 0, air: 0, ground: 0 }});
  }

  // -- Historical Tracking -- //
  recordHistoricalEvent(countries, event) {
    countries.forEach(c => {
      if (!this.allianceHistory.has(c)) {
        this.allianceHistory.set(c, []);
      }
      this.allianceHistory.get(c).push({
        event,
        timestamp: Date.now(),
        participants: countries.filter(x => x !== c)
      });
    });
  }
}