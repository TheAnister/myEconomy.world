import { StatisticsManager } from './modules/statistics.js';
import { SaveManager } from './modules/save-manager.js';
import { NotificationSystem } from './modules/notification-system.js';
import { createExampleLineChart } from './utils/charts.js';
import { formatNumber } from './utils/formatters.js';

class App {
  constructor() {
    this.statisticsManager = new StatisticsManager();
    this.saveManager = new SaveManager();
    this.notificationSystem = new NotificationSystem();
    this.chartContext = document.getElementById('chart').getContext('2d');
    this.chart = null;
  }

  async initialize() {
    await this.statisticsManager.initialize();
    await this.saveManager.initialize();
    this.setupEventListeners();
    this.notificationSystem.subscribe(this.handleNotification.bind(this));
    this.chart = createExampleLineChart(this.chartContext);
    this.renderStatistics();
    this.loadSavedGameState();
  }

  setupEventListeners() {
    document.getElementById('saveButton').addEventListener('click', this.saveGameState.bind(this));
    document.getElementById('loadButton').addEventListener('click', this.loadSavedGameState.bind(this));
  }

  handleNotification(notification) {
    const notificationsContainer = document.getElementById('notifications');
    const notificationElement = document.createElement('div');
    notificationElement.className = `notification ${notification.type}`;
    notificationElement.innerHTML = `
      <div class="title">${notification.type.toUpperCase()} Notification</div>
      <div class="timestamp">${new Date(notification.timestamp).toLocaleString()}</div>
      <div class="message">${notification.message}</div>
    `;
    notificationsContainer.appendChild(notificationElement);
    setTimeout(() => {
      notificationElement.classList.add('fade-out');
      notificationElement.addEventListener('transitionend', () => {
        notificationsContainer.removeChild(notificationElement);
      });
    }, 5000);
  }

  renderStatistics() {
    const statistics = this.statisticsManager.getSummary();
    document.getElementById('gdp').textContent = formatNumber(statistics.GDP);
    document.getElementById('unemploymentRate').textContent = `${statistics.unemploymentRate.toFixed(2)}%`;
    document.getElementById('inflationRate').textContent = `${statistics.inflationRate.toFixed(2)}%`;
    document.getElementById('literacyRate').textContent = `${statistics.literacyRate.toFixed(2)}%`;
    document.getElementById('lifeExpectancy').textContent = statistics.lifeExpectancy.toFixed(2);
    document.getElementById('povertyRate').textContent = `${statistics.povertyRate.toFixed(2)}%`;
    document.getElementById('carbonFootprint').textContent = formatNumber(statistics.carbonFootprint);
  }

  saveGameState() {
    this.saveManager.saveGameState();
    this.notificationSystem.addNotification({ type: 'system', message: 'Game state saved successfully!' });
  }

  loadSavedGameState() {
    this.saveManager.loadGameState();
    this.renderStatistics();
    this.notificationSystem.addNotification({ type: 'system', message: 'Game state loaded successfully!' });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.initialize();
});
