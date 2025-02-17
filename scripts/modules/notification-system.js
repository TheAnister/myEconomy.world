export class NotificationSystem {
  constructor() {
    this.notifications = [];
    this.subscribers = [];
  }

  addNotification(notification) {
    const timestamp = new Date().toISOString();
    const newNotification = { ...notification, timestamp };
    this.notifications.push(newNotification);
    this.notifySubscribers(newNotification);
  }

  notifySubscribers(notification) {
    this.subscribers.forEach(subscriber => subscriber(notification));
  }

  subscribe(subscriber) {
    this.subscribers.push(subscriber);
  }

  unsubscribe(subscriber) {
    this.subscribers = this.subscribers.filter(sub => sub !== subscriber);
  }

  getNotifications() {
    return this.notifications;
  }

  clearNotifications() {
    this.notifications = [];
  }

  // Advanced filtering based on type, date range, etc.
  filterNotifications(criteria) {
    return this.notifications.filter(notification => {
      let matches = true;
      if (criteria.type) {
        matches = matches && notification.type === criteria.type;
      }
      if (criteria.startDate) {
        matches = matches && new Date(notification.timestamp) >= new Date(criteria.startDate);
      }
      if (criteria.endDate) {
        matches = matches && new Date(notification.timestamp) <= new Date(criteria.endDate);
      }
      return matches;
    });
  }

  // Methods for different types of notifications
  addEconomicNotification(message) {
    this.addNotification({ type: 'economic', message });
  }

  addSocialNotification(message) {
    this.addNotification({ type: 'social', message });
  }

  addHealthNotification(message) {
    this.addNotification({ type: 'health', message });
  }

  addEducationNotification(message) {
    this.addNotification({ type: 'education', message });
  }

  addEnvironmentalNotification(message) {
    this.addNotification({ type: 'environmental', message });
  }

  // Example usage of advanced notification system
  notifyEconomicChange(change) {
    const message = `Economic change detected: ${change}`;
    this.addEconomicNotification(message);
  }

  notifySocialChange(change) {
    const message = `Social change detected: ${change}`;
    this.addSocialNotification(message);
  }

  notifyHealthChange(change) {
    const message = `Health change detected: ${change}`;
    this.addHealthNotification(message);
  }

  notifyEducationChange(change) {
    const message = `Education change detected: ${change}`;
    this.addEducationNotification(message);
  }

  notifyEnvironmentalChange(change) {
    const message = `Environmental change detected: ${change}`;
    this.addEnvironmentalNotification(message);
  }
}
