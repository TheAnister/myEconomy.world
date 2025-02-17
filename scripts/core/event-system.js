import { GameMath, EconomicIndicators } from '../utils/helpers.js';

class EventSystem {
  constructor() {
    this.events = [];
  }

  initialize() {
    this.registerCoreEvents();
    // Other initialization logic...
  }

  registerCoreEvents() {
    this.events.forEach(event => {
      event.handler = event.handler.bind(this);
    });
  }

  addEvent(event) {
    this.events.push(event);
  }
}

export default EventSystem;

export class EventSystem {
  constructor() {
    this.eventQueue = new Map();
    this.subscriptions = new Map();
    this.historicalEvents = [];
    this.eventPhases = {
      preSimulation: [],
      mainPhase: [],
      postSimulation: []
    };
    
    this.coreEventTypes = new Set([
      'economic', 'military', 'diplomatic', 
      'policy', 'company', 'environmental'
    ]);
  }

  initialize() {
    this.registerCoreEvents();
    return this;
  }

  subscribe(eventType, handler, priority = 0) {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }
    
    this.subscriptions.get(eventType).push({
      handler,
      priority,
      enabled: true
    });
    
    // Sort by priority descending
    this.subscriptions.get(eventType).sort((a, b) => b.priority - a.priority);
  }

  unsubscribe(eventType, handler) {
    if (!this.subscriptions.has(eventType)) return;

    const handlers = this.subscriptions.get(eventType)
      .filter(h => h.handler !== handler);
    
    this.subscriptions.set(eventType, handlers);
  }

  queueEvent(event, phase = 'mainPhase') {
    if (!this.eventPhases[phase]) {
      throw new Error(`Invalid event phase: ${phase}`);
    }

    const eventObject = this.createEventObject(event);
    this.eventPhases[phase].push(eventObject);
    
    return eventObject.id;
  }

  processPhase(phase) {
    if (!this.eventPhases[phase]) return;

    const events = this.eventPhases[phase];
    while (events.length > 0) {
      const event = events.shift();
      this.processSingleEvent(event);
    }
  }

  // -- Core Event Processing -- //
  processSingleEvent(event) {
    try {
      if (!this.validateEventStructure(event)) return;

      // Store in history before processing
      this.historicalEvents.push(event);
      
      // Direct dispatch for system-critical events
      if (event.type === 'system') {
        return this.handleSystemEvent(event);
      }

      // Get all handlers for event type hierarchy
      const handlers = this.getHandlersForType(event.type);
      
      handlers.forEach(({ handler, enabled }) => {
        if (enabled) {
          handler(event);
        }
      });

      // Post-processing hooks
      this.runPostProcessing(event);
    } catch (error) {
      console.error(`Event processing failed: ${event.type}`, error);
    }
  }

  // -- Event Type Hierarchy Handling -- //
  getHandlersForType(eventType) {
    const typeComponents = eventType.split('.');
    const handlers = [];
    
    while (typeComponents.length > 0) {
      const currentType = typeComponents.join('.');
      if (this.subscriptions.has(currentType)) {
        handlers.push(...this.subscriptions.get(currentType));
      }
      typeComponents.pop();
    }
    
    return handlers;
  }

  // -- Core Event Types -- //
  registerCoreEvents() {
    this.coreEventTypes.forEach(type => {
      this.subscribe(`${type}.*`, this.logCoreEvent.bind(this));
    });

    // System events
    this.subscribe('system.error', this.handleErrorEvent.bind(this), 100);
    this.subscribe('system.debug', this.handleDebugEvent.bind(this), 100);
  }

  // -- Event Validation -- //
  validateEventStructure(event) {
    const requiredFields = ['id', 'type', 'timestamp', 'data'];
    return requiredFields.every(field => field in event);
  }

  createEventObject(baseEvent) {
    return {
      id: GameMath.generateUUID(),
      timestamp: Date.now(),
      source: 'system',
      data: {},
      ...baseEvent,
      metadata: {
        processed: false,
        retries: 0,
        ...baseEvent.metadata
      }
    };
  }

  // -- History Management -- //
  getEventHistory(filter) {
    return this.historicalEvents.filter(event => {
      return Object.entries(filter).every(([key, value]) => {
        return event[key] === value;
      });
    });
  }

  // -- Specialized Handlers -- //
  handleSystemEvent(event) {
    switch(event.subtype) {
      case 'save':
        this.triggerAutosave(event.data);
        break;
      case 'load':
        this.handleGameLoad(event.data);
        break;
      case 'reset':
        this.resetSystemState();
        break;
    }
  }

  handleErrorEvent(event) {
    console.error(`[SYSTEM ERROR] ${event.data.message}`, event.data.error);
    
    if (event.data.critical) {
      this.queueEvent({
        type: 'system.shutdown',
        data: { reason: event.data.message }
      }, 'preSimulation');
    }
  }

  logCoreEvent(event) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[EVENT] ${event.type}`, event.data);
    }
  }

  // -- Integration Points -- //
  integrateWithEconomy(economyEngine) {
    this.subscribe('economy.*', event => {
      economyEngine.handleEconomicEvent(event);
    });
  }

  integrateWithAI(aiManager) {
    this.subscribe('ai.*', event => {
      aiManager.handleAIEvent(event);
    });
  }

  // -- Phase Management -- //
  clearPhase(phase) {
    if (this.eventPhases[phase]) {
      this.eventPhases[phase] = [];
    }
  }

  // -- Debug Utilities -- //
  enableDebugLogging() {
    this.subscribe('*', event => {
      console.debug(`[DEBUG] ${event.type}`, event);
    });
  }

  // -- Serialization -- //
  serializeState() {
    return {
      subscriptions: Array.from(this.subscriptions.entries()),
      historicalEvents: this.historicalEvents,
      queuedEvents: {
        preSimulation: this.eventPhases.preSimulation,
        mainPhase: this.eventPhases.mainPhase,
        postSimulation: this.eventPhases.postSimulation
      }
    };
  }

  loadState(state) {
    this.subscriptions = new Map(state.subscriptions);
    this.historicalEvents = state.historicalEvents;
    this.eventPhases = {
      preSimulation: state.queuedEvents.preSimulation,
      mainPhase: state.queuedEvents.mainPhase,
      postSimulation: state.queuedEvents.postSimulation
    };
  }

  // Placeholder methods for private fields
  runPostProcessing(event) {
    // Placeholder implementation
  }

  triggerAutosave(data) {
    // Placeholder implementation
  }

  handleGameLoad(data) {
    // Placeholder implementation
  }

  resetSystemState() {
    // Placeholder implementation
  }
}

// Singleton instance for global access
export const eventSystem = new EventSystem().initialize();