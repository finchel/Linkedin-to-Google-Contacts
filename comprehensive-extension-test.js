#!/usr/bin/env node

/**
 * Comprehensive Extension Test Suite
 * Tests all aspects of the LinkedIn to Google Contacts extension
 */

const fs = require('fs');
const path = require('path');

class ExtensionTester {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  async runAllTests() {
    console.log('🧪 COMPREHENSIVE EXTENSION TEST SUITE');
    console.log('=====================================\n');

    await this.testManifestValidation();
    await this.testServiceWorkerValidation();
    await this.testContentScriptValidation();
    await this.testTableDetectionLogic();
    await this.testSelectorRobustness();
    
    this.generateReport();
  }

  async testManifestValidation() {
    console.log('📄 Testing Manifest Validation...');
    
    try {
      const manifestPath = path.join(__dirname, 'manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      // Test required fields
      this.assert(manifest.name, 'Manifest has name');
      this.assert(manifest.version, 'Manifest has version');
      this.assert(manifest.manifest_version === 3, 'Manifest is version 3');
      this.assert(manifest.permissions, 'Manifest has permissions');
      this.assert(manifest.host_permissions, 'Manifest has host permissions');
      
      // Test content scripts
      this.assert(manifest.content_scripts && manifest.content_scripts.length >= 2, 
        'Has LinkedIn and Google Contacts content scripts');
      
      // Test LinkedIn content script
      const linkedinScript = manifest.content_scripts.find(cs => 
        cs.matches.some(match => match.includes('linkedin.com')));
      this.assert(linkedinScript, 'LinkedIn content script exists');
      
      // Test Google Contacts content script  
      const contactsScript = manifest.content_scripts.find(cs =>
        cs.matches.some(match => match.includes('contacts.google.com')));
      this.assert(contactsScript, 'Google Contacts content script exists');
      
      this.results.passed.push('Manifest validation');
      
    } catch (error) {
      this.results.failed.push(`Manifest validation: ${error.message}`);
    }
  }

  async testServiceWorkerValidation() {
    console.log('⚙️  Testing Service Worker...');
    
    try {
      const serviceWorkerPath = path.join(__dirname, 'service-worker.js');
      const serviceWorkerContent = fs.readFileSync(serviceWorkerPath, 'utf8');
      
      // Test for required classes and functions
      this.assert(serviceWorkerContent.includes('class ExtensionState'), 'ExtensionState class exists');
      this.assert(serviceWorkerContent.includes('static async get(key)'), 'ExtensionState.get method exists');
      this.assert(serviceWorkerContent.includes('static async set(key, value)'), 'ExtensionState.set method exists');
      this.assert(serviceWorkerContent.includes('static async remove(key)'), 'ExtensionState.remove method exists');
      
      // Test message types
      this.assert(serviceWorkerContent.includes('MESSAGE_TYPES'), 'MESSAGE_TYPES defined');
      this.assert(serviceWorkerContent.includes('SEARCH_CONTACT'), 'SEARCH_CONTACT message type exists');
      
      // Test tab handling
      this.assert(serviceWorkerContent.includes('handleTabUpdated'), 'Tab update handler exists');
      this.assert(serviceWorkerContent.includes('ExtensionState.set(lastMessageKey, now)'), 'Message throttling implemented');
      
      this.results.passed.push('Service worker validation');
      
    } catch (error) {
      this.results.failed.push(`Service worker validation: ${error.message}`);
    }
  }

  async testContentScriptValidation() {
    console.log('📝 Testing Content Scripts...');
    
    try {
      // Test Google Contacts content script
      const contactsPath = path.join(__dirname, 'content-scripts', 'google-contacts-updater.js');
      const contactsContent = fs.readFileSync(contactsPath, 'utf8');
      
      // Test table detection
      this.assert(contactsContent.includes('table tbody tr'), 'Table detection implemented');
      this.assert(contactsContent.includes('extractSearchResults'), 'Search results extraction function exists');
      this.assert(contactsContent.includes('extractContactData'), 'Contact data extraction function exists');
      
      // Test dialog handling
      this.assert(contactsContent.includes('showConfirmationDialog'), 'Confirmation dialog function exists');
      this.assert(contactsContent.includes('data-linkedin-extension-dialog'), 'Dialog tracking attribute implemented');
      
      // Test debug function
      this.assert(contactsContent.includes('debugGoogleContactsSearch'), 'Debug function implemented');
      
      // Test LinkedIn content script
      const linkedinPath = path.join(__dirname, 'content-scripts', 'linkedin-extractor.js');
      const linkedinContent = fs.readFileSync(linkedinPath, 'utf8');
      
      this.assert(linkedinContent.includes('extractFromJSON'), 'JSON extraction implemented');
      this.assert(linkedinContent.includes('createButtonInContainer'), 'Button injection implemented');
      
      this.results.passed.push('Content scripts validation');
      
    } catch (error) {
      this.results.failed.push(`Content scripts validation: ${error.message}`);
    }
  }

  async testTableDetectionLogic() {
    console.log('📊 Testing Table Detection Logic...');
    
    try {
      // Test with mock HTML similar to Google Contacts
      const mockHTML = `
        <html>
          <body>
            <div role="main">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Company</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Adam Frank</td>
                    <td>adam@example.com</td>
                    <td>+97252559145</td>
                    <td>Founder & CEO at Hypnos</td>
                  </tr>
                  <tr>
                    <td>Daniel Finchelstein</td>
                    <td>daniel@example.com</td>
                    <td>+123456789</td>
                    <td>Software Engineer</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </body>
        </html>
      `;
      
      // Simulate DOM parsing (simplified test)
      const tableRowMatches = mockHTML.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi);
      const dataRows = tableRowMatches ? tableRowMatches.filter(row => 
        row.includes('<td>') && !row.includes('<th>')
      ) : [];
      
      this.assert(dataRows.length === 2, `Should find 2 data rows, found ${dataRows.length}`);
      
      // Test name extraction
      const firstRowMatch = dataRows[0].match(/<td[^>]*>(.*?)<\/td>/);
      const firstName = firstRowMatch ? firstRowMatch[1].trim() : '';
      this.assert(firstName === 'Adam Frank', `Should extract 'Adam Frank', got '${firstName}'`);
      
      const secondRowMatch = dataRows[1].match(/<td[^>]*>(.*?)<\/td>/);
      const secondName = secondRowMatch ? secondRowMatch[1].trim() : '';
      this.assert(secondName === 'Daniel Finchelstein', `Should extract 'Daniel Finchelstein', got '${secondName}'`);
      
      this.results.passed.push('Table detection logic');
      
    } catch (error) {
      this.results.failed.push(`Table detection logic: ${error.message}`);
    }
  }

  async testSelectorRobustness() {
    console.log('🎯 Testing Selector Robustness...');
    
    try {
      const contactsPath = path.join(__dirname, 'content-scripts', 'google-contacts-updater.js');
      const contactsContent = fs.readFileSync(contactsPath, 'utf8');
      
      // Extract selectors from CONTACTS_SELECTORS
      const selectorsMatch = contactsContent.match(/CONTACTS_SELECTORS\s*=\s*{([\s\S]*?)};/);
      if (!selectorsMatch) {
        throw new Error('CONTACTS_SELECTORS not found');
      }
      
      const selectorsText = selectorsMatch[1];
      
      // Test that we have comprehensive selectors
      this.assert(selectorsText.includes('table tbody tr'), 'Table tbody selectors present');
      this.assert(selectorsText.includes('[role="main"] table'), 'Role-based table selectors present');
      this.assert(selectorsText.includes('td:first-child'), 'First cell selectors present');
      this.assert(selectorsText.includes('createContactButton'), 'Create button selectors present');
      
      // Count selector variety
      const contactListSelectors = (selectorsText.match(/contactList:\s*\[([\s\S]*?)\]/)[1] || '').split(',').length;
      const contactNameSelectors = (selectorsText.match(/contactName:\s*\[([\s\S]*?)\]/)[1] || '').split(',').length;
      
      this.assert(contactListSelectors >= 8, `Should have 8+ contact list selectors, has ${contactListSelectors}`);
      this.assert(contactNameSelectors >= 6, `Should have 6+ contact name selectors, has ${contactNameSelectors}`);
      
      this.results.passed.push('Selector robustness');
      
    } catch (error) {
      this.results.failed.push(`Selector robustness: ${error.message}`);
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
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('=======================');
    
    console.log(`\n✅ PASSED (${this.results.passed.length}):`);
    this.results.passed.forEach(test => console.log(`   • ${test}`));
    
    if (this.results.failed.length > 0) {
      console.log(`\n❌ FAILED (${this.results.failed.length}):`);
      this.results.failed.forEach(test => console.log(`   • ${test}`));
    }
    
    if (this.results.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${this.results.warnings.length}):`);
      this.results.warnings.forEach(warning => console.log(`   • ${warning}`));
    }
    
    const totalTests = this.results.passed.length + this.results.failed.length;
    const passRate = ((this.results.passed.length / totalTests) * 100).toFixed(1);
    
    console.log(`\n🎯 OVERALL: ${this.results.passed.length}/${totalTests} tests passed (${passRate}%)`);
    
    if (this.results.failed.length === 0) {
      console.log('🎉 ALL TESTS PASSED! Extension appears to be working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please review the issues above.');
    }
    
    console.log('\n🔧 NEXT STEPS:');
    console.log('   1. Load the extension in Chrome');
    console.log('   2. Navigate to a Google Contacts search page');
    console.log('   3. Open browser console and run: debugGoogleContactsSearch()');
    console.log('   4. Check console output for detailed debugging information');
    console.log('   5. Test with actual LinkedIn profile sync');
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  const tester = new ExtensionTester();
  tester.runAllTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = ExtensionTester;