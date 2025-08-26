'use strict';

// Popup interface controller
class PopupController {
  constructor() {
    this.currentState = null;
    this.updateInterval = null;
    this.elements = {};
    
    this.initialize();
  }

  async initialize() {
    console.log('[Popup] Initializing popup interface...');
    
    // Cache DOM elements
    this.cacheElements();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Load initial state
    await this.loadState();
    
    // Start periodic updates
    this.startPeriodicUpdates();
    
    console.log('[Popup] Popup initialized successfully');
  }

  cacheElements() {
    // Status elements
    this.elements.statusIndicator = document.getElementById('statusIndicator');
    this.elements.statusText = document.getElementById('statusText');
    this.elements.syncStatus = document.getElementById('syncStatus');
    this.elements.progressFill = document.getElementById('progressFill');
    this.elements.syncMessage = document.getElementById('syncMessage');
    
    // Statistics elements
    this.elements.totalSynced = document.getElementById('totalSynced');
    this.elements.successRate = document.getElementById('successRate');
    this.elements.lastSync = document.getElementById('lastSync');
    
    // Action buttons
    this.elements.openLinkedIn = document.getElementById('openLinkedIn');
    this.elements.openContacts = document.getElementById('openContacts');
    
    // Settings elements
    this.elements.settingsToggle = document.getElementById('settingsToggle');
    this.elements.settingsContent = document.getElementById('settingsContent');
    this.elements.autoSearchEnabled = document.getElementById('autoSearchEnabled');
    this.elements.syncPhotosEnabled = document.getElementById('syncPhotosEnabled');
    this.elements.defaultMessage = document.getElementById('defaultMessage');
    this.elements.confirmationMode = document.getElementById('confirmationMode');
    
    // Activity elements
    this.elements.activityList = document.getElementById('activityList');
    this.elements.clearHistory = document.getElementById('clearHistory');
    
    // Message elements
    this.elements.errorMessage = document.getElementById('errorMessage');
    this.elements.errorText = document.getElementById('errorText');
    this.elements.errorClose = document.getElementById('errorClose');
    this.elements.successMessage = document.getElementById('successMessage');
    this.elements.successText = document.getElementById('successText');
    this.elements.successClose = document.getElementById('successClose');
    
    // Footer elements
    this.elements.versionText = document.getElementById('versionText');
    this.elements.helpLink = document.getElementById('helpLink');
    this.elements.feedbackLink = document.getElementById('feedbackLink');
    this.elements.privacyLink = document.getElementById('privacyLink');
  }

  setupEventListeners() {
    // Action buttons
    this.elements.openLinkedIn.addEventListener('click', () => {
      this.openTab('https://linkedin.com');
    });
    
    this.elements.openContacts.addEventListener('click', () => {
      this.openTab('https://contacts.google.com');
    });
    
    // Settings toggle
    this.elements.settingsToggle.addEventListener('click', () => {
      this.toggleSettings();
    });
    
    // Settings changes
    this.elements.autoSearchEnabled.addEventListener('change', () => {
      this.savePreferences();
    });
    
    this.elements.syncPhotosEnabled.addEventListener('change', () => {
      this.savePreferences();
    });
    
    this.elements.defaultMessage.addEventListener('input', 
      this.debounce(() => this.savePreferences(), 500)
    );
    
    this.elements.confirmationMode.addEventListener('change', () => {
      this.savePreferences();
    });
    
    // Clear history
    this.elements.clearHistory.addEventListener('click', () => {
      this.clearActivity();
    });
    
    // Message close buttons
    this.elements.errorClose.addEventListener('click', () => {
      this.hideMessage('error');
    });
    
    this.elements.successClose.addEventListener('click', () => {
      this.hideMessage('success');
    });
    
    // Footer links
    this.elements.helpLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.openTab('https://github.com/your-repo/help');
    });
    
    this.elements.feedbackLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.openTab('https://github.com/your-repo/issues');
    });
    
    this.elements.privacyLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.showPrivacyInfo();
    });
  }

  async loadState() {
    try {
      const response = await this.sendMessage({
        type: 'GET_STATE'
      });
      
      if (response.success) {
        this.currentState = response.data;
        this.updateUI();
      } else {
        console.error('[Popup] Failed to load state:', response.error);
        this.showError('Failed to load extension state');
      }
      
    } catch (error) {
      console.error('[Popup] Error loading state:', error);
      this.showError('Connection error');
    }
  }

  updateUI() {
    if (!this.currentState) return;
    
    // Update sync status
    this.updateSyncStatus();
    
    // Update statistics
    this.updateStatistics();
    
    // Update preferences
    this.updatePreferences();
    
    // Update activity
    this.updateActivity();
    
    // Update version
    this.updateVersion();
  }

  updateSyncStatus() {
    const { currentSync } = this.currentState;
    
    if (currentSync && currentSync.active) {
      // Show sync in progress
      this.elements.syncStatus.style.display = 'block';
      this.elements.statusText.textContent = 'Syncing...';
      this.elements.statusText.className = 'status-text';
      
      const statusDot = this.elements.statusIndicator.querySelector('.status-dot');
      statusDot.className = 'status-dot';
      
      // Update progress
      const progress = this.calculateProgress(currentSync.stage);
      this.elements.progressFill.style.width = `${progress}%`;
      
      // Update message
      const stageMessages = {
        extracting: 'Extracting LinkedIn profile...',
        searching: 'Searching Google Contacts...',
        confirming: 'Waiting for confirmation...',
        updating: 'Updating contact...',
        completed: 'Sync completed!',
        failed: 'Sync failed'
      };
      
      this.elements.syncMessage.textContent = stageMessages[currentSync.stage] || 'Processing...';
      
    } else {
      // Hide sync status
      this.elements.syncStatus.style.display = 'none';
      this.elements.statusText.textContent = 'Ready';
      this.elements.statusText.className = 'status-text';
      
      const statusDot = this.elements.statusIndicator.querySelector('.status-dot');
      statusDot.className = 'status-dot';
    }
  }

  calculateProgress(stage) {
    const stages = {
      idle: 0,
      extracting: 25,
      searching: 50,
      confirming: 75,
      updating: 90,
      completed: 100,
      failed: 0
    };
    
    return stages[stage] || 0;
  }

  updateStatistics() {
    const { statistics } = this.currentState;
    
    if (statistics) {
      this.elements.totalSynced.textContent = statistics.totalSynced || 0;
      
      const successRate = statistics.successRate ? 
        Math.round(statistics.successRate * 100) : 0;
      this.elements.successRate.textContent = `${successRate}%`;
      
      const lastSync = statistics.lastSyncTime ? 
        this.formatRelativeTime(statistics.lastSyncTime) : 'Never';
      this.elements.lastSync.textContent = lastSync;
    }
  }

  updatePreferences() {
    const { preferences } = this.currentState;
    
    if (preferences) {
      this.elements.autoSearchEnabled.checked = preferences.autoSearch || false;
      this.elements.syncPhotosEnabled.checked = preferences.syncPhotos || false;
      this.elements.defaultMessage.value = preferences.defaultMessage || '';
      this.elements.confirmationMode.value = preferences.confirmationMode || 'always';
    }
  }

  updateActivity() {
    const { statistics } = this.currentState;
    const activityList = this.elements.activityList;
    
    // Clear existing activity
    activityList.innerHTML = '';
    
    if (statistics && statistics.syncHistory && statistics.syncHistory.length > 0) {
      statistics.syncHistory.slice(0, 10).forEach(item => {
        const activityItem = this.createActivityItem(item);
        activityList.appendChild(activityItem);
      });
    } else {
      activityList.innerHTML = '<div class="activity-empty"><p>No recent activity</p></div>';
    }
  }

  createActivityItem(item) {
    const div = document.createElement('div');
    div.className = 'activity-item';
    
    const icon = document.createElement('div');
    icon.className = `activity-icon ${item.success ? 'success' : 'error'}`;
    icon.textContent = item.success ? '✅' : '❌';
    
    const content = document.createElement('div');
    content.className = 'activity-content';
    
    const title = document.createElement('div');
    title.className = 'activity-title';
    title.textContent = item.success ? 'Contact synced' : 'Sync failed';
    
    const time = document.createElement('div');
    time.className = 'activity-time';
    time.textContent = this.formatRelativeTime(item.timestamp);
    
    content.appendChild(title);
    content.appendChild(time);
    
    div.appendChild(icon);
    div.appendChild(content);
    
    return div;
  }

  updateVersion() {
    const manifest = chrome.runtime.getManifest();
    this.elements.versionText.textContent = `v${manifest.version}`;
  }

  async savePreferences() {
    try {
      const preferences = {
        autoSearch: this.elements.autoSearchEnabled.checked,
        syncPhotos: this.elements.syncPhotosEnabled.checked,
        defaultMessage: this.elements.defaultMessage.value.trim(),
        confirmationMode: this.elements.confirmationMode.value
      };
      
      const response = await this.sendMessage({
        type: 'UPDATE_PREFERENCES',
        data: { preferences }
      });
      
      if (response.success) {
        this.showSuccess('Preferences saved');
        
        // Update local state
        if (this.currentState) {
          this.currentState.preferences = response.data;
        }
      } else {
        this.showError('Failed to save preferences');
      }
      
    } catch (error) {
      console.error('[Popup] Error saving preferences:', error);
      this.showError('Failed to save preferences');
    }
  }

  toggleSettings() {
    const isExpanded = this.elements.settingsContent.style.display !== 'none';
    
    if (isExpanded) {
      this.elements.settingsContent.style.display = 'none';
      this.elements.settingsToggle.classList.remove('expanded');
    } else {
      this.elements.settingsContent.style.display = 'block';
      this.elements.settingsToggle.classList.add('expanded');
    }
  }

  async clearActivity() {
    try {
      // Clear sync history from storage
      await chrome.storage.local.set({
        statistics: {
          ...this.currentState.statistics,
          syncHistory: []
        }
      });
      
      // Update UI
      this.elements.activityList.innerHTML = '<div class="activity-empty"><p>No recent activity</p></div>';
      
      this.showSuccess('Activity cleared');
      
    } catch (error) {
      console.error('[Popup] Error clearing activity:', error);
      this.showError('Failed to clear activity');
    }
  }

  async openTab(url) {
    try {
      await chrome.tabs.create({ url });
      window.close();
    } catch (error) {
      console.error('[Popup] Error opening tab:', error);
      this.showError('Failed to open tab');
    }
  }

  showError(message) {
    this.elements.errorText.textContent = message;
    this.elements.errorMessage.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideMessage('error');
    }, 5000);
  }

  showSuccess(message) {
    this.elements.successText.textContent = message;
    this.elements.successMessage.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.hideMessage('success');
    }, 3000);
  }

  hideMessage(type) {
    if (type === 'error') {
      this.elements.errorMessage.style.display = 'none';
    } else if (type === 'success') {
      this.elements.successMessage.style.display = 'none';
    }
  }

  showPrivacyInfo() {
    const message = `
      Privacy Information:
      
      • All data processing happens locally in your browser
      • No information is sent to external servers
      • Only your existing LinkedIn and Google sessions are used
      • Contact data is only stored temporarily during sync
      • You can clear all data at any time
    `;
    
    alert(message);
  }

  formatRelativeTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    
    if (diff < minute) {
      return 'Just now';
    } else if (diff < hour) {
      const minutes = Math.floor(diff / minute);
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else if (diff < day) {
      const hours = Math.floor(diff / hour);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else {
      const days = Math.floor(diff / day);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    }
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  startPeriodicUpdates() {
    // Update state every 2 seconds when popup is open
    this.updateInterval = setInterval(async () => {
      await this.loadState();
    }, 2000);
  }

  stopPeriodicUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.popupController = new PopupController();
});

// Clean up when popup is closed
window.addEventListener('beforeunload', () => {
  if (window.popupController) {
    window.popupController.stopPeriodicUpdates();
  }
});