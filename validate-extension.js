#!/usr/bin/env node

/**
 * Extension Validation Script
 * Validates the Chrome Extension structure and implementation
 */

const fs = require('fs');
const path = require('path');

class ExtensionValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.validationResults = {};
    this.basePath = process.cwd();
  }

  async validate() {
    console.log('🔍 Starting extension validation...\n');

    // Run all validation checks
    this.validateManifest();
    this.validateFileStructure();
    this.validateServiceWorker();
    this.validateContentScripts();
    this.validatePopupInterface();
    this.validateStyles();
    this.validateIcons();
    this.validateDocumentation();

    // Generate report
    this.generateReport();
  }

  validateManifest() {
    console.log('📋 Validating manifest.json...');
    
    const manifestPath = path.join(this.basePath, 'manifest.json');
    
    if (!fs.existsSync(manifestPath)) {
      this.errors.push('manifest.json not found');
      return;
    }

    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      // Required fields
      const requiredFields = ['manifest_version', 'name', 'version', 'description'];
      requiredFields.forEach(field => {
        if (!manifest[field]) {
          this.errors.push(`Missing required field: ${field}`);
        }
      });

      // Manifest version check
      if (manifest.manifest_version !== 3) {
        this.errors.push('Extension must use Manifest V3');
      }

      // Chrome version check
      if (!manifest.minimum_chrome_version || parseInt(manifest.minimum_chrome_version) < 120) {
        this.warnings.push('Minimum Chrome version should be 120 or higher');
      }

      // Permissions check
      const requiredPermissions = ['storage', 'activeTab', 'scripting', 'tabs'];
      requiredPermissions.forEach(permission => {
        if (!manifest.permissions?.includes(permission)) {
          this.warnings.push(`Missing recommended permission: ${permission}`);
        }
      });

      // Host permissions check
      const expectedHosts = ['https://*.linkedin.com/*', 'https://contacts.google.com/*'];
      expectedHosts.forEach(host => {
        if (!manifest.host_permissions?.includes(host)) {
          this.errors.push(`Missing host permission: ${host}`);
        }
      });

      // Content scripts validation
      if (!manifest.content_scripts || manifest.content_scripts.length < 2) {
        this.errors.push('Missing content scripts for LinkedIn and Google Contacts');
      }

      // Service worker validation
      if (!manifest.background?.service_worker) {
        this.errors.push('Missing service worker configuration');
      }

      console.log('✅ Manifest validation complete\n');
      
    } catch (error) {
      this.errors.push(`Invalid manifest.json: ${error.message}`);
    }
  }

  validateFileStructure() {
    console.log('📁 Validating file structure...');

    const requiredFiles = [
      'service-worker.js',
      'popup/popup.html',
      'popup/popup.js',
      'popup/popup.css',
      'content-scripts/linkedin-extractor.js',
      'content-scripts/google-contacts-updater.js',
      'styles/linkedin-ui.css',
      'styles/google-contacts-ui.css',
      'utils/error-handler.js'
    ];

    requiredFiles.forEach(file => {
      const filePath = path.join(this.basePath, file);
      if (!fs.existsSync(filePath)) {
        this.errors.push(`Missing required file: ${file}`);
      }
    });

    const requiredDirectories = [
      'content-scripts',
      'popup',
      'styles',
      'icons',
      'utils'
    ];

    requiredDirectories.forEach(dir => {
      const dirPath = path.join(this.basePath, dir);
      if (!fs.existsSync(dirPath)) {
        this.errors.push(`Missing required directory: ${dir}`);
      }
    });

    console.log('✅ File structure validation complete\n');
  }

  validateServiceWorker() {
    console.log('⚙️ Validating service worker...');

    const swPath = path.join(this.basePath, 'service-worker.js');
    
    if (!fs.existsSync(swPath)) {
      this.errors.push('service-worker.js not found');
      return;
    }

    const swContent = fs.readFileSync(swPath, 'utf8');

    // Check for required event listeners
    const requiredListeners = [
      'chrome.runtime.onInstalled.addListener',
      'chrome.runtime.onMessage.addListener',
      'chrome.tabs.onRemoved.addListener',
      'chrome.tabs.onUpdated.addListener'
    ];

    requiredListeners.forEach(listener => {
      if (!swContent.includes(listener)) {
        this.warnings.push(`Service worker missing: ${listener}`);
      }
    });

    // Check for message types
    const requiredMessageTypes = [
      'SYNC_INITIATE',
      'PROFILE_EXTRACTED',
      'SEARCH_CONTACT',
      'SYNC_COMPLETE',
      'ERROR_OCCURRED'
    ];

    requiredMessageTypes.forEach(msgType => {
      if (!swContent.includes(msgType)) {
        this.warnings.push(`Service worker missing message type: ${msgType}`);
      }
    });

    // Check for async/await usage
    if (!swContent.includes('async function') && !swContent.includes('await ')) {
      this.warnings.push('Service worker should use async/await for better error handling');
    }

    console.log('✅ Service worker validation complete\n');
  }

  validateContentScripts() {
    console.log('🔗 Validating content scripts...');

    // Validate LinkedIn content script
    const linkedinPath = path.join(this.basePath, 'content-scripts/linkedin-extractor.js');
    if (fs.existsSync(linkedinPath)) {
      const linkedinContent = fs.readFileSync(linkedinPath, 'utf8');
      
      if (!linkedinContent.includes('attachShadow')) {
        this.warnings.push('LinkedIn script should use Shadow DOM for UI isolation');
      }
      
      if (!linkedinContent.includes('MutationObserver')) {
        this.warnings.push('LinkedIn script should use MutationObserver for dynamic content');
      }

      if (!linkedinContent.includes('fallback') && !linkedinContent.includes('FALLBACK')) {
        this.warnings.push('LinkedIn script should implement fallback selector strategies');
      }
    }

    // Validate Google Contacts content script
    const contactsPath = path.join(this.basePath, 'content-scripts/google-contacts-updater.js');
    if (fs.existsSync(contactsPath)) {
      const contactsContent = fs.readFileSync(contactsPath, 'utf8');
      
      if (!contactsContent.includes('waitForElement')) {
        this.warnings.push('Google Contacts script should implement wait strategies');
      }
      
      if (!contactsContent.includes('sanitize')) {
        this.warnings.push('Google Contacts script should sanitize input data');
      }
    }

    console.log('✅ Content scripts validation complete\n');
  }

  validatePopupInterface() {
    console.log('🪟 Validating popup interface...');

    const popupFiles = ['popup.html', 'popup.js', 'popup.css'];
    
    popupFiles.forEach(file => {
      const filePath = path.join(this.basePath, 'popup', file);
      if (!fs.existsSync(filePath)) {
        this.errors.push(`Missing popup file: ${file}`);
        return;
      }

      if (file === 'popup.html') {
        const htmlContent = fs.readFileSync(filePath, 'utf8');
        
        if (!htmlContent.includes('<!DOCTYPE html>')) {
          this.warnings.push('popup.html should include DOCTYPE declaration');
        }
        
        if (!htmlContent.includes('CSP')) {
          this.warnings.push('popup.html should be compatible with CSP');
        }
      }

      if (file === 'popup.js') {
        const jsContent = fs.readFileSync(filePath, 'utf8');
        
        if (!jsContent.includes('chrome.runtime.sendMessage')) {
          this.warnings.push('popup.js should communicate with service worker');
        }
        
        if (!jsContent.includes('addEventListener')) {
          this.warnings.push('popup.js should set up event listeners');
        }
      }
    });

    console.log('✅ Popup interface validation complete\n');
  }

  validateStyles() {
    console.log('🎨 Validating styles...');

    const styleFiles = [
      'styles/linkedin-ui.css',
      'styles/google-contacts-ui.css',
      'popup/popup.css'
    ];

    styleFiles.forEach(file => {
      const filePath = path.join(this.basePath, file);
      if (!fs.existsSync(filePath)) {
        this.errors.push(`Missing style file: ${file}`);
        return;
      }

      const cssContent = fs.readFileSync(filePath, 'utf8');
      
      if (!cssContent.includes('!important') && file.includes('linkedin')) {
        this.warnings.push(`${file} should use !important for site isolation`);
      }
      
      if (!cssContent.includes('@media')) {
        this.warnings.push(`${file} should include responsive media queries`);
      }

      if (!cssContent.includes('prefers-color-scheme')) {
        this.warnings.push(`${file} should support dark mode`);
      }
    });

    console.log('✅ Styles validation complete\n');
  }

  validateIcons() {
    console.log('🖼️ Validating icons...');

    const requiredIcons = ['icon16.png', 'icon32.png', 'icon48.png', 'icon128.png'];
    
    requiredIcons.forEach(icon => {
      const iconPath = path.join(this.basePath, 'icons', icon);
      if (!fs.existsSync(iconPath)) {
        this.warnings.push(`Missing icon: ${icon}`);
      }
    });

    console.log('✅ Icons validation complete\n');
  }

  validateDocumentation() {
    console.log('📚 Validating documentation...');

    const requiredDocs = ['README.md', 'TESTING.md'];
    
    requiredDocs.forEach(doc => {
      const docPath = path.join(this.basePath, doc);
      if (!fs.existsSync(docPath)) {
        this.warnings.push(`Missing documentation: ${doc}`);
        return;
      }

      const content = fs.readFileSync(docPath, 'utf8');
      if (content.length < 1000) {
        this.warnings.push(`${doc} seems incomplete (< 1000 characters)`);
      }
    });

    console.log('✅ Documentation validation complete\n');
  }

  generateReport() {
    console.log('📊 VALIDATION REPORT');
    console.log('==================\n');

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('🎉 VALIDATION PASSED! Extension is ready for testing.\n');
    } else {
      if (this.errors.length > 0) {
        console.log('❌ ERRORS (Must Fix):');
        this.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
        console.log();
      }

      if (this.warnings.length > 0) {
        console.log('⚠️ WARNINGS (Recommended):');
        this.warnings.forEach((warning, index) => {
          console.log(`   ${index + 1}. ${warning}`);
        });
        console.log();
      }
    }

    // Summary
    console.log('SUMMARY:');
    console.log(`✅ Errors: ${this.errors.length}`);
    console.log(`⚠️ Warnings: ${this.warnings.length}`);
    console.log(`📁 Files checked: ${this.getFileCount()}`);
    
    if (this.errors.length === 0) {
      console.log('\n🚀 Extension is ready for installation and testing!');
      console.log('\nNext steps:');
      console.log('1. Load unpacked extension in Chrome');
      console.log('2. Test on various LinkedIn profiles');
      console.log('3. Verify Google Contacts integration');
      console.log('4. Run comprehensive testing suite');
    } else {
      console.log('\n🔧 Please fix all errors before proceeding.');
    }
  }

  getFileCount() {
    const extensions = ['.js', '.json', '.html', '.css', '.md'];
    let count = 0;
    
    const countFiles = (dir) => {
      const entries = fs.readdirSync(dir);
      entries.forEach(entry => {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !entry.startsWith('.')) {
          countFiles(fullPath);
        } else if (stat.isFile() && extensions.some(ext => entry.endsWith(ext))) {
          count++;
        }
      });
    };
    
    countFiles(this.basePath);
    return count;
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new ExtensionValidator();
  validator.validate().catch(console.error);
}

module.exports = ExtensionValidator;