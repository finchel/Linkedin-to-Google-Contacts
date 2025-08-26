'use strict';

/**
 * Centralized error handling utility for the LinkedIn to Contacts extension
 * Provides consistent error categorization, logging, and user feedback
 */

// Error categories for different types of failures
const ERROR_CATEGORIES = {
  NETWORK: 'network',
  PERMISSION: 'permission',
  PARSING: 'parsing',
  USER_INPUT: 'user_input',
  RATE_LIMIT: 'rate_limit',
  SERVICE_UNAVAILABLE: 'service_unavailable',
  EXTENSION_ERROR: 'extension_error',
  BROWSER_ERROR: 'browser_error'
};

// Error severity levels
const ERROR_SEVERITY = {
  LOW: 'low',        // Minor issues, extension can continue
  MEDIUM: 'medium',   // Significant issues, may require user action
  HIGH: 'high',       // Critical issues, sync cannot continue
  CRITICAL: 'critical' // Extension-breaking issues
};

// Recovery strategies for different error types
const RECOVERY_STRATEGIES = {
  RETRY: 'retry',
  USER_ACTION: 'user_action',
  FALLBACK: 'fallback',
  ABORT: 'abort'
};

class ErrorHandler {
  static errors = new Map();
  static errorCounts = new Map();
  static maxRetries = 3;
  static retryDelay = 1000; // Base delay in ms

  /**
   * Create a standardized error object
   */
  static createError(type, message, details = {}) {
    const error = {
      id: this.generateErrorId(),
      type: type,
      message: message,
      details: details,
      timestamp: Date.now(),
      category: this.categorizeError(type, message),
      severity: this.determineSeverity(type, message),
      recoveryStrategy: this.determineRecoveryStrategy(type),
      retryCount: 0,
      maxRetries: this.maxRetries,
      userMessage: this.getUserFriendlyMessage(type, message),
      actionable: this.isActionable(type),
      technicalDetails: this.getTechnicalDetails(details)
    };

    // Store error for tracking
    this.errors.set(error.id, error);
    
    // Update error counts
    const count = this.errorCounts.get(type) || 0;
    this.errorCounts.set(type, count + 1);

    return error;
  }

  /**
   * Handle an error with appropriate strategy
   */
  static async handleError(error, context = {}) {
    try {
      console.error('[ErrorHandler] Handling error:', {
        type: error.type,
        message: error.message,
        context: context,
        severity: error.severity
      });

      // Log error details
      await this.logError(error, context);

      // Determine and execute recovery strategy
      switch (error.recoveryStrategy) {
        case RECOVERY_STRATEGIES.RETRY:
          return await this.handleRetryableError(error, context);
          
        case RECOVERY_STRATEGIES.USER_ACTION:
          return await this.handleUserActionError(error, context);
          
        case RECOVERY_STRATEGIES.FALLBACK:
          return await this.handleFallbackError(error, context);
          
        case RECOVERY_STRATEGIES.ABORT:
          return await this.handleAbortError(error, context);
          
        default:
          return this.createErrorResponse(error, 'Unknown recovery strategy');
      }
      
    } catch (handlingError) {
      console.error('[ErrorHandler] Error in error handling:', handlingError);
      return this.createErrorResponse(error, 'Error handling failed');
    }
  }

  /**
   * Handle retryable errors with exponential backoff
   */
  static async handleRetryableError(error, context) {
    error.retryCount++;

    if (error.retryCount > error.maxRetries) {
      console.error('[ErrorHandler] Max retries exceeded for:', error.type);
      return this.createErrorResponse(error, 'Maximum retry attempts exceeded', false);
    }

    // Calculate delay with exponential backoff and jitter
    const delay = this.retryDelay * Math.pow(2, error.retryCount - 1);
    const jitter = Math.random() * 0.1 * delay;
    const totalDelay = delay + jitter;

    console.log(`[ErrorHandler] Retrying in ${totalDelay}ms (attempt ${error.retryCount}/${error.maxRetries})`);

    // Wait before retry
    await this.delay(totalDelay);

    return this.createErrorResponse(error, `Retrying (attempt ${error.retryCount})`, true);
  }

  /**
   * Handle errors requiring user action
   */
  static async handleUserActionError(error, context) {
    const actionInstructions = this.getActionInstructions(error.type);
    
    return this.createErrorResponse(error, actionInstructions, false, {
      requiresUserAction: true,
      actionInstructions: actionInstructions
    });
  }

  /**
   * Handle errors with fallback strategies
   */
  static async handleFallbackError(error, context) {
    const fallbackAction = this.getFallbackAction(error.type);
    
    console.log('[ErrorHandler] Applying fallback strategy:', fallbackAction);
    
    return this.createErrorResponse(error, `Using fallback: ${fallbackAction}`, true, {
      fallbackApplied: true,
      fallbackAction: fallbackAction
    });
  }

  /**
   * Handle abort errors
   */
  static async handleAbortError(error, context) {
    console.error('[ErrorHandler] Aborting operation due to:', error.type);
    
    return this.createErrorResponse(error, 'Operation aborted due to critical error', false, {
      aborted: true
    });
  }

  /**
   * Create standardized error response
   */
  static createErrorResponse(error, message, recoverable = false, additionalData = {}) {
    return {
      success: false,
      error: {
        id: error.id,
        type: error.type,
        message: message,
        userMessage: error.userMessage,
        severity: error.severity,
        recoverable: recoverable,
        timestamp: error.timestamp,
        retryCount: error.retryCount,
        ...additionalData
      }
    };
  }

  /**
   * Log error to appropriate destination
   */
  static async logError(error, context) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      errorId: error.id,
      type: error.type,
      message: error.message,
      category: error.category,
      severity: error.severity,
      context: context,
      userAgent: navigator.userAgent,
      url: window.location?.href,
      stackTrace: error.details?.stack
    };

    // Console logging with appropriate level
    switch (error.severity) {
      case ERROR_SEVERITY.CRITICAL:
        console.error('[ErrorHandler] CRITICAL:', logEntry);
        break;
      case ERROR_SEVERITY.HIGH:
        console.error('[ErrorHandler] HIGH:', logEntry);
        break;
      case ERROR_SEVERITY.MEDIUM:
        console.warn('[ErrorHandler] MEDIUM:', logEntry);
        break;
      default:
        console.log('[ErrorHandler] LOW:', logEntry);
    }

    // Store in local storage for debugging (limit to last 100 errors)
    try {
      const storedErrors = await chrome.storage.local.get(['errorLogs']) || { errorLogs: [] };
      const errorLogs = storedErrors.errorLogs || [];
      
      errorLogs.unshift(logEntry);
      
      // Keep only the most recent 100 errors
      const trimmedLogs = errorLogs.slice(0, 100);
      
      await chrome.storage.local.set({ errorLogs: trimmedLogs });
      
    } catch (storageError) {
      console.warn('[ErrorHandler] Failed to store error log:', storageError);
    }
  }

  /**
   * Categorize errors for better handling
   */
  static categorizeError(type, message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('timeout')) {
      return ERROR_CATEGORIES.NETWORK;
    }
    
    if (lowerMessage.includes('permission') || lowerMessage.includes('unauthorized')) {
      return ERROR_CATEGORIES.PERMISSION;
    }
    
    if (lowerMessage.includes('parse') || lowerMessage.includes('json') || lowerMessage.includes('syntax')) {
      return ERROR_CATEGORIES.PARSING;
    }
    
    if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests')) {
      return ERROR_CATEGORIES.RATE_LIMIT;
    }
    
    if (lowerMessage.includes('service unavailable') || lowerMessage.includes('server error')) {
      return ERROR_CATEGORIES.SERVICE_UNAVAILABLE;
    }
    
    if (type.includes('EXTENSION') || type.includes('CHROME')) {
      return ERROR_CATEGORIES.EXTENSION_ERROR;
    }
    
    return ERROR_CATEGORIES.EXTENSION_ERROR; // Default category
  }

  /**
   * Determine error severity
   */
  static determineSeverity(type, message) {
    const criticalErrors = ['EXTENSION_DISABLED', 'PERMISSION_DENIED', 'CHROME_ERROR'];
    const highErrors = ['SYNC_FAILED', 'PROFILE_EXTRACTION_FAILED', 'CONTACT_UPDATE_FAILED'];
    const mediumErrors = ['SEARCH_FAILED', 'NETWORK_ERROR', 'TIMEOUT'];

    if (criticalErrors.some(error => type.includes(error))) {
      return ERROR_SEVERITY.CRITICAL;
    }
    
    if (highErrors.some(error => type.includes(error))) {
      return ERROR_SEVERITY.HIGH;
    }
    
    if (mediumErrors.some(error => type.includes(error))) {
      return ERROR_SEVERITY.MEDIUM;
    }
    
    return ERROR_SEVERITY.LOW;
  }

  /**
   * Determine recovery strategy
   */
  static determineRecoveryStrategy(type) {
    const retryableErrors = ['NETWORK_ERROR', 'TIMEOUT', 'RATE_LIMITED', 'SERVICE_UNAVAILABLE'];
    const userActionErrors = ['PERMISSION_DENIED', 'LOGIN_REQUIRED', 'MULTIPLE_MATCHES'];
    const abortErrors = ['EXTENSION_DISABLED', 'CRITICAL_ERROR', 'BROWSER_INCOMPATIBLE'];

    if (retryableErrors.some(error => type.includes(error))) {
      return RECOVERY_STRATEGIES.RETRY;
    }
    
    if (userActionErrors.some(error => type.includes(error))) {
      return RECOVERY_STRATEGIES.USER_ACTION;
    }
    
    if (abortErrors.some(error => type.includes(error))) {
      return RECOVERY_STRATEGIES.ABORT;
    }
    
    return RECOVERY_STRATEGIES.FALLBACK;
  }

  /**
   * Get user-friendly error messages
   */
  static getUserFriendlyMessage(type, message) {
    const messageMap = {
      'NETWORK_ERROR': 'Connection issue. Please check your internet connection and try again.',
      'TIMEOUT': 'The operation timed out. Please try again.',
      'PERMISSION_DENIED': 'Permission required. Please check your browser settings.',
      'LOGIN_REQUIRED': 'Please log in to LinkedIn and Google Contacts.',
      'PROFILE_EXTRACTION_FAILED': 'Unable to read LinkedIn profile information.',
      'CONTACT_SEARCH_FAILED': 'Unable to search Google Contacts.',
      'CONTACT_UPDATE_FAILED': 'Failed to update contact information.',
      'MULTIPLE_MATCHES': 'Multiple contacts found. Please select the correct one.',
      'RATE_LIMITED': 'Too many requests. Please wait a moment and try again.',
      'SERVICE_UNAVAILABLE': 'Service temporarily unavailable. Please try again later.',
      'EXTENSION_ERROR': 'Extension error occurred. Please restart your browser.',
      'SYNC_FAILED': 'Sync operation failed. Please try again.'
    };

    // Find the most specific match
    for (const [key, value] of Object.entries(messageMap)) {
      if (type.includes(key)) {
        return value;
      }
    }

    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Check if error is actionable by user
   */
  static isActionable(type) {
    const actionableErrors = [
      'LOGIN_REQUIRED', 
      'PERMISSION_DENIED', 
      'MULTIPLE_MATCHES',
      'NETWORK_ERROR',
      'RATE_LIMITED'
    ];

    return actionableErrors.some(error => type.includes(error));
  }

  /**
   * Get action instructions for user
   */
  static getActionInstructions(type) {
    const instructionsMap = {
      'LOGIN_REQUIRED': 'Please log in to both LinkedIn and Google Contacts in separate tabs.',
      'PERMISSION_DENIED': 'Please enable extension permissions in Chrome settings.',
      'MULTIPLE_MATCHES': 'Please select the correct contact from the list.',
      'NETWORK_ERROR': 'Please check your internet connection and refresh the page.',
      'RATE_LIMITED': 'Please wait a few moments before trying again.',
      'PROFILE_EXTRACTION_FAILED': 'Please refresh the LinkedIn page and try again.',
      'CONTACT_UPDATE_FAILED': 'Please check that you have edit permissions for this contact.'
    };

    for (const [key, value] of Object.entries(instructionsMap)) {
      if (type.includes(key)) {
        return value;
      }
    }

    return 'Please try refreshing the page or restarting the browser.';
  }

  /**
   * Get fallback action description
   */
  static getFallbackAction(type) {
    const fallbackMap = {
      'PROFILE_EXTRACTION_FAILED': 'Using basic profile information',
      'CONTACT_SEARCH_FAILED': 'Manual contact selection required',
      'PHOTO_SYNC_FAILED': 'Skipping profile photo sync',
      'NOTES_UPDATE_FAILED': 'Adding LinkedIn URL only'
    };

    for (const [key, value] of Object.entries(fallbackMap)) {
      if (type.includes(key)) {
        return value;
      }
    }

    return 'Using simplified sync process';
  }

  /**
   * Get technical details for debugging
   */
  static getTechnicalDetails(details) {
    return {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location?.href,
      extensionVersion: chrome.runtime?.getManifest?.()?.version,
      ...details
    };
  }

  /**
   * Generate unique error ID
   */
  static generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Utility delay function
   */
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get error statistics
   */
  static getErrorStatistics() {
    return {
      totalErrors: this.errors.size,
      errorCounts: Object.fromEntries(this.errorCounts),
      recentErrors: Array.from(this.errors.values())
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10)
    };
  }

  /**
   * Clear error history
   */
  static clearErrorHistory() {
    this.errors.clear();
    this.errorCounts.clear();
    
    // Also clear stored error logs
    chrome.storage.local.set({ errorLogs: [] }).catch(error => {
      console.warn('[ErrorHandler] Failed to clear stored error logs:', error);
    });
  }

  /**
   * Export error logs for debugging
   */
  static async exportErrorLogs() {
    try {
      const storedErrors = await chrome.storage.local.get(['errorLogs']);
      const errorLogs = storedErrors.errorLogs || [];
      
      const exportData = {
        exportTimestamp: new Date().toISOString(),
        extensionVersion: chrome.runtime.getManifest().version,
        totalErrors: errorLogs.length,
        errors: errorLogs
      };
      
      return JSON.stringify(exportData, null, 2);
      
    } catch (error) {
      console.error('[ErrorHandler] Failed to export error logs:', error);
      throw error;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ErrorHandler,
    ERROR_CATEGORIES,
    ERROR_SEVERITY,
    RECOVERY_STRATEGIES
  };
}

// Make available globally in extension context
if (typeof window !== 'undefined') {
  window.ErrorHandler = ErrorHandler;
  window.ERROR_CATEGORIES = ERROR_CATEGORIES;
  window.ERROR_SEVERITY = ERROR_SEVERITY;
  window.RECOVERY_STRATEGIES = RECOVERY_STRATEGIES;
}

console.log('[ErrorHandler] Error handling utility loaded');