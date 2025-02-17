import { StatisticsManager } from './modules/statistics.js';
import { SaveManager } from './modules/save-manager.js';
import { NotificationSystem } from './modules/notification-system.js';
import { createExampleLineChart } from './utils/charts.js';
import { formatNumber } from './utils/helpers.js';

class App {
  constructor() {
    this.statisticsManager = new StatisticsManager();
    this.saveManager = new SaveManager();
    this.notificationSystem = new NotificationSystem();
    this.chartContext = document.getElementById('chart')?.getContext('2d');
    this.chart = null;
    this.currentSpeed = 1;
  }

  async initialize() {
    await this.statisticsManager.initialize();
    await this.saveManager.initialize();
    this.setupEventListeners();
    this.notificationSystem.subscribe(this.handleNotification.bind(this));
    if (this.chartContext) {
      this.chart = createExampleLineChart(this.chartContext);
    }
    this.renderStatistics();
    this.loadSavedGameState();
  }

  setupEventListeners() {
    document.getElementById('saveButton')?.addEventListener('click', this.saveGameState.bind(this));
    document.getElementById('loadButton')?.addEventListener('click', this.loadSavedGameState.bind(this));
    
    document.querySelectorAll('.nav-btn').forEach(button => {
      button.addEventListener('click', this.handleNavigation.bind(this));
    });
    
    document.querySelectorAll('.speed-btn').forEach(button => {
      button.addEventListener('click', this.changeSpeed.bind(this));
    });
    
    document.getElementById('pause-btn')?.addEventListener('click', this.pauseGame.bind(this));
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

  handleNavigation(event) {
    const targetPanel = event.currentTarget.getAttribute('data-panel');
    document.querySelectorAll('.content-panel').forEach(panel => {
      panel.classList.add('hidden');
    });
    document.getElementById(`${targetPanel}-panel`).classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(button => {
      button.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
  }

  changeSpeed(event) {
    document.querySelectorAll('.speed-btn').forEach(button => {
      button.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    this.currentSpeed = parseInt(event.currentTarget.textContent.replace('x', ''), 10);
    document.getElementById('game-speed').textContent = `Speed: ${this.currentSpeed}x`;
  }

  pauseGame() {
    this.currentSpeed = 0;
    document.getElementById('game-speed').textContent = 'Speed: Paused';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.initialize();
});