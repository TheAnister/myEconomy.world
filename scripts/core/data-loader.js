export class DataLoader {
  static #CACHE_TTL = 3600000; // 1 hour cache
  static #SCHEMAS = {
    country: {
      type: 'object',
      required: ['name', 'gdp', 'sectors'],
      properties: {
        name: { type: 'string' },
        gdp: { type: 'number' },
        sectors: {
          type: 'object',
          patternProperties: {
            '^.*$': { type: 'number' }
          }
        }
      }
    },
    company: {
      type: 'object',
      required: ['name', 'sector', 'revenue', 'profit', 'employees', 'market_cap', 'subsidies', 'market_share'],
      properties: {
        name: { type: 'string' },
        sector: { type: 'string' },
        revenue: { type: 'number' },
        profit: { type: 'number' },
        employees: { type: 'number' },
        market_cap: { type: 'number' },
        subsidies: { type: 'number' },
        market_share: { type: 'number' }
      }
    },
    statistics: {
      type: 'object',
      required: ['economicIndicators', 'socialIndicators', 'healthIndicators', 'educationIndicators', 'environmentalIndicators'],
      properties: {
        economicIndicators: { type: 'object' },
        socialIndicators: { type: 'object' },
        healthIndicators: { type: 'object' },
        educationIndicators: { type: 'object' },
        environmentalIndicators: { type: 'object' }
      }
    },
    department: {
      type: 'object',
      required: ['name', 'description'],
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        budget: { type: 'number' },
        employees: { type: 'number' },
        taxRates: { type: 'object' },
        thresholds: { type: 'object' }
      }
    }
  };

  static #cache = {
    countries: null,
    companies: null,
    statistics: null,
    departments: null,
    timestamp: 0
  };

  static async loadCountries() {
    if (this.#validateCache('countries')) {
      return this.#cache.countries;
    }

    try {
      const response = await fetch('/data/countries.json');
      const data = await response.json();

      if (!this.#validateData(data.countries, this.#SCHEMAS.country)) {
        throw new Error('Invalid country data structure');
      }

      this.#updateCache('countries', data.countries);
      return data.countries;
    } catch (error) {
      console.error('Failed to load countries:', error);
      return this.#getFallbackData('countries');
    }
  }

  static async loadCompanies() {
    if (this.#validateCache('companies')) {
      return this.#cache.companies;
    }

    try {
      const response = await fetch('/data/companies.json');
      const data = await response.json();

      if (!this.#validateData(data.companies, this.#SCHEMAS.company)) {
        throw new Error('Invalid company data structure');
      }

      this.#updateCache('companies', data.companies);
      return data.companies;
    } catch (error) {
      console.error('Failed to load companies:', error);
      return this.#getFallbackData('companies');
    }
  }

  static async loadStatistics() {
    if (this.#validateCache('statistics')) {
      return this.#cache.statistics;
    }

    try {
      const response = await fetch('/data/statistics.json');
      const data = await response.json();

      if (!this.#validateData(data, this.#SCHEMAS.statistics)) {
        throw new Error('Invalid statistics data structure');
      }

      this.#updateCache('statistics', data);
      return data;
    } catch (error) {
      console.error('Failed to load statistics:', error);
      return this.#getFallbackData('statistics');
    }
  }

  static async loadDepartments() {
    if (this.#validateCache('departments')) {
      return this.#cache.departments;
    }

    try {
      const response = await fetch('/data/departments.json');
      const data = await response.json();

      if (!this.#validateData(data.departments, this.#SCHEMAS.department)) {
        throw new Error('Invalid department data structure');
      }

      this.#updateCache('departments', data.departments);
      return data.departments;
    } catch (error) {
      console.error('Failed to load departments:', error);
      return this.#getFallbackData('departments');
    }
  }

  static async saveGameState(state, userId) {
    try {
      const validated = this.#validateSaveState(state);
      const compressed = this.#compressState(validated);
      const encrypted = await this.#encryptData(compressed, userId);

      // Try server first
      try {
        await this.#sendToServer(encrypted, userId);
        return { status: 'server', timestamp: Date.now() };
      } catch (serverError) {
        console.warn('Server save failed, using localStorage:', serverError);
        this.#saveToLocalStorage(encrypted, userId);
        return { status: 'local', timestamp: Date.now() };
      }
    } catch (error) {
      console.error('Save failed:', error);
      throw new Error('Failed to save game state');
    }
  }

  static async loadGameState(userId) {
    try {
      // Try server first
      try {
        const serverData = await this.#fetchFromServer(userId);
        const decrypted = await this.#decryptData(serverData, userId);
        return this.#decompressState(decrypted);
      } catch (serverError) {
        console.warn('Server load failed, trying localStorage:', serverError);
        const localData = this.#loadFromLocalStorage(userId);
        const decrypted = await this.#decryptData(localData, userId);
        return this.#decompressState(decrypted);
      }
    } catch (error) {
      console.error('Load failed:', error);
      throw new Error('Failed to load game state');
    }
  }

  // -- Private Methods -- //

  static #validateCache(dataType) {
    return this.#cache[dataType] && 
      Date.now() - this.#cache.timestamp < this.#CACHE_TTL;
  }

  static #updateCache(dataType, data) {
    this.#cache[dataType] = data;
    this.#cache.timestamp = Date.now();
  }

  static #validateData(data, schema) {
    // Simple schema validation without Ajv
    if (!Array.isArray(data)) return false;

    for (const item of data) {
      if (typeof item !== schema.type) return false;
      
      for (const key of schema.required) {
        if (!(key in item)) return false;
      }
      
      for (const key in schema.properties) {
        if (item[key] !== undefined && typeof item[key] !== schema.properties[key].type) {
          return false;
        }
      }
    }
    
    return true;
  }

  static #validateSaveState(state) {
    const requiredKeys = ['economy', 'companies', 'policies', 'history'];
    if (!requiredKeys.every(k => state[k])) {
      throw new Error('Invalid save state structure');
    }
    return state;
  }

  static #compressState(state) {
    try {
      return LZString.compressToUTF16(JSON.stringify(state));
    } catch (error) {
      throw new Error('State compression failed');
    }
  }

  static #decompressState(data) {
    try {
      return JSON.parse(LZString.decompressFromUTF16(data));
    } catch (error) {
      throw new Error('State decompression failed');
    }
  }

  static async #encryptData(data, userId) {
    try {
      const encoder = new TextEncoder();
      const key = await this.#deriveKey(userId);
      const iv = crypto.getRandomValues(new Uint8Array(12));

      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoder.encode(data)
      );

      return { iv, data: new Uint8Array(encrypted) };
    } catch (error) {
      throw new Error('Encryption failed');
    }
  }

  static async #decryptData(encryptedData, userId) {
    try {
      const key = await this.#deriveKey(userId);
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: encryptedData.iv },
        key,
        encryptedData.data
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }

  static async #deriveKey(userId) {
    const baseKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(userId),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('myEconomySalt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  static #saveToLocalStorage(data, userId) {
    try {
      localStorage.setItem(`myEconomy_${userId}`, JSON.stringify(data));
    } catch (error) {
      throw new Error('Local storage quota exceeded');
    }
  }

  static #loadFromLocalStorage(userId) {
    const data = localStorage.getItem(`myEconomy_${userId}`);
    if (!data) throw new Error('No local save found');
    return JSON.parse(data);
  }

  static async #sendToServer(data, userId) {
    const response = await fetch('/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Remove Authorization header if not needed
        // 'Authorization': `Bearer ${this.#getAuthToken()}`
      },
      body: JSON.stringify({
        userId,
        data,
        checksum: this.#createChecksum(data)
      })
    });

    if (!response.ok) throw new Error('Server save failed');
  }

  static async #fetchFromServer(userId) {
    const response = await fetch(`/api/load/${userId}`, {
      // Remove Authorization header if not needed
      // headers: { 'Authorization': `Bearer ${this.#getAuthToken()}` }
    });

    if (!response.ok) throw new Error('Server load failed');
    return response.json();
  }

  static #createChecksum(data) {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  static #getAuthToken() {
    // Implementation depends on your auth system
    return localStorage.getItem('authToken');
  }

  static #getFallbackData(type) {
    if (type === 'countries') return this.#cache.countries || [];
    if (type === 'companies') return this.#cache.companies || [];
    if (type === 'statistics') return this.#cache.statistics || [];
    if (type === 'departments') return this.#cache.departments || [];
    return [];
  }
}