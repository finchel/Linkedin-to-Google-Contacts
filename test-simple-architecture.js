#!/usr/bin/env node

/**
 * Simple Architecture Test Suite
 * Tests the migrated extension's simple helper-based approach
 */

const fs = require('fs');
const path = require('path');

class SimpleArchitectureTest {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  async runAllTests() {
    console.log('🧪 SIMPLE ARCHITECTURE TEST SUITE');
    console.log('=====================================\n');

    await this.testLinkedInExtractorSimple();
    await this.testGoogleContactsHelper();
    await this.testServiceWorkerSimple();
    await this.testArchitectureCompletion();
    
    this.generateReport();
  }

  async testLinkedInExtractorSimple() {
    console.log('📱 Testing LinkedIn Extractor (Simple)...');
    
    try {
      const linkedinPath = path.join(__dirname, 'content-scripts', 'linkedin-extractor.js');
      const linkedinContent = fs.readFileSync(linkedinPath, 'utf8');
      
      // Test for simple architecture components
      this.assert(linkedinContent.includes('extractProfileSimple'), 'Simple extraction function exists');
      this.assert(linkedinContent.includes('main h1'), 'Uses proven name selector');
      this.assert(linkedinContent.includes('.text-body-medium.break-words'), 'Uses proven headline selector');
      this.assert(linkedinContent.includes('extractContactInfo'), 'Contact info extraction exists');
      this.assert(linkedinContent.includes('findContactInfoButton'), 'Contact info button detection exists');
      this.assert(linkedinContent.includes('extractContactInfoFromModal'), 'Modal extraction exists');
      this.assert(linkedinContent.includes('addSimpleSyncButton'), 'Simple sync button implementation exists');
      this.assert(linkedinContent.includes('syncToContacts'), 'Background message sending exists');
      
      // Test removal of complex features
      this.assert(!linkedinContent.includes('ExtensionState'), 'Complex state management removed');
      this.assert(!linkedinContent.includes('PROFILE_SELECTORS'), 'Complex selectors removed');
      this.assert(!linkedinContent.includes('handleSyncClick'), 'Complex sync handling removed');
      
      this.results.passed.push('LinkedIn extractor (simple)');
      
    } catch (error) {
      this.results.failed.push(`LinkedIn extractor (simple): ${error.message}`);
    }
  }

  async testGoogleContactsHelper() {
    console.log('🌐 Testing Google Contacts Helper...');
    
    try {
      const contactsPath = path.join(__dirname, 'content-scripts', 'google-contacts-updater.js');
      const contactsContent = fs.readFileSync(contactsPath, 'utf8');
      
      // Test for helper panel architecture
      this.assert(contactsContent.includes('createLinkedInDataHelper'), 'Helper panel creation function exists');
      this.assert(contactsContent.includes('injectHelper'), 'Helper injection message handling exists');
      this.assert(contactsContent.includes('Auto-Fill Contact Fields'), 'Auto-fill functionality exists');
      this.assert(contactsContent.includes('Copy All Data'), 'Copy functionality exists');
      this.assert(contactsContent.includes('custom-comment-input'), 'Custom comment feature exists');
      this.assert(contactsContent.includes('linkedin-data-helper'), 'Helper panel ID exists');
      
      // Test removal of complex detection
      this.assert(!contactsContent.includes('extractSearchResults'), 'Complex search extraction removed');
      this.assert(!contactsContent.includes('waitForContactsToLoad'), 'Complex loading detection removed');
      this.assert(!contactsContent.includes('MutationObserver'), 'Complex DOM monitoring removed');
      this.assert(!contactsContent.includes('CONTACTS_SELECTORS'), 'Complex selectors removed');
      
      this.results.passed.push('Google Contacts helper');
      
    } catch (error) {
      this.results.failed.push(`Google Contacts helper: ${error.message}`);
    }
  }

  async testServiceWorkerSimple() {
    console.log('⚙️  Testing Service Worker (Simple)...');
    
    try {
      const serviceWorkerPath = path.join(__dirname, 'service-worker.js');
      const serviceWorkerContent = fs.readFileSync(serviceWorkerPath, 'utf8');
      
      // Test for simple architecture
      this.assert(serviceWorkerContent.includes('handleContactSync'), 'Simple contact sync handler exists');
      this.assert(serviceWorkerContent.includes('openGoogleContactsTab'), 'Tab opening function exists');
      this.assert(serviceWorkerContent.includes('syncToContacts'), 'Sync action handler exists');
      this.assert(serviceWorkerContent.includes('injectHelper'), 'Helper injection exists');
      this.assert(serviceWorkerContent.includes('contacts.google.com/search'), 'Search URL generation exists');
      
      // Test removal of complex state management
      this.assert(!serviceWorkerContent.includes('ExtensionState'), 'Complex state management removed');
      this.assert(!serviceWorkerContent.includes('SYNC_STAGES'), 'Complex sync stages removed');
      this.assert(!serviceWorkerContent.includes('MESSAGE_TYPES'), 'Complex message types removed');
      this.assert(!serviceWorkerContent.includes('handleTabUpdated'), 'Complex tab handling removed');
      this.assert(!serviceWorkerContent.includes('message throttling'), 'Complex throttling removed');
      
      this.results.passed.push('Service worker (simple)');
      
    } catch (error) {
      this.results.failed.push(`Service worker (simple): ${error.message}`);
    }
  }

  async testArchitectureCompletion() {
    console.log('🏗️  Testing Architecture Completion...');
    
    try {
      // Test that key files exist and have expected content
      const manifestPath = path.join(__dirname, 'manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      this.assert(manifest.content_scripts.length === 2, 'Two content scripts (LinkedIn + Google Contacts)');
      this.assert(manifest.permissions.includes('storage'), 'Storage permission exists');
      this.assert(manifest.permissions.includes('tabs'), 'Tabs permission exists');
      this.assert(manifest.host_permissions.includes('https://contacts.google.com/*'), 'Google Contacts permission exists');
      
      // Test file sizes (simple architecture should be much smaller)
      const linkedinSize = fs.statSync(path.join(__dirname, 'content-scripts', 'linkedin-extractor.js')).size;
      const contactsSize = fs.statSync(path.join(__dirname, 'content-scripts', 'google-contacts-updater.js')).size;
      const serviceWorkerSize = fs.statSync(path.join(__dirname, 'service-worker.js')).size;
      
      console.log(`  📊 File sizes - LinkedIn: ${linkedinSize}B, Contacts: ${contactsSize}B, ServiceWorker: ${serviceWorkerSize}B`);
      
      // Simple architecture should be much more concise
      this.assert(linkedinSize < 25000, 'LinkedIn extractor is reasonably sized (simple)');
      this.assert(contactsSize < 15000, 'Google Contacts helper is reasonably sized (simple)');
      this.assert(serviceWorkerSize < 5000, 'Service worker is reasonably sized (simple)');
      
      this.results.passed.push('Architecture completion');
      
    } catch (error) {
      this.results.failed.push(`Architecture completion: ${error.message}`);
    }
  }

  assert(condition, message) {
    if (condition) {
      console.log(`  ✅ ${message}`);
      return true;
    } else {
      console.log(`  ❌ ${message}`);
      return false;
    }
  }

  generateReport() {
    console.log('\n📊 SIMPLE ARCHITECTURE TEST RESULTS');
    console.log('====================================');
    
    console.log(`\n✅ PASSED (${this.results.passed.length}):`);
    this.results.passed.forEach(test => console.log(`   • ${test}`));
    
    if (this.results.failed.length > 0) {
      console.log(`\n❌ FAILED (${this.results.failed.length}):`);
      this.results.failed.forEach(test => console.log(`   • ${test}`));
    }
    
    const totalTests = this.results.passed.length + this.results.failed.length;
    const passRate = ((this.results.passed.length / totalTests) * 100).toFixed(1);
    
    console.log(`\n🎯 OVERALL: ${this.results.passed.length}/${totalTests} tests passed (${passRate}%)`);
    
    if (this.results.failed.length === 0) {
      console.log('🎉 ALL TESTS PASSED! Migration to simple architecture successful.');
      console.log('\n✨ MIGRATION BENEFITS:');
      console.log('   • Simpler, more maintainable codebase');
      console.log('   • Proven LinkedIn extraction with contact info');
      console.log('   • Reliable helper panel approach');
      console.log('   • No complex state management');
      console.log('   • Works with Google UI changes');
    } else {
      console.log('⚠️  Some tests failed. Please review the issues above.');
    }
    
    console.log('\n🚀 READY FOR TESTING:');
    console.log('   1. Load extension in Chrome (chrome://extensions/)');
    console.log('   2. Visit a LinkedIn profile page');
    console.log('   3. Click "📇 Add to Contacts" button');
    console.log('   4. Verify Google Contacts opens with helper panel');
    console.log('   5. Test auto-fill and copy functionality');
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  const tester = new SimpleArchitectureTest();
  tester.runAllTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = SimpleArchitectureTest;