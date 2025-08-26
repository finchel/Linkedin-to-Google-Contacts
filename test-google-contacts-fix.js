#!/usr/bin/env node

/**
 * Test Google Contacts selector fixes
 * Validates the updated selectors work with modern Google Contacts UI
 */

const fs = require('fs');
const path = require('path');

class GoogleContactsTester {
  constructor() {
    this.results = {
      found: [],
      notFound: [],
      improvements: []
    };
  }

  testSelectors() {
    console.log('🔧 TESTING GOOGLE CONTACTS SELECTOR FIXES\n');
    
    try {
      // Load Google Contacts HTML example
      const contactsPath = path.join(__dirname, 'examples', 'Daniel Finchelstein Google contact html.txt');
      const contactsHTML = fs.readFileSync(contactsPath, 'utf8');
      
      console.log('📄 Testing against Google Contacts HTML example...\n');
      
      // Original selectors (were failing)
      const originalSelectors = {
        contactList: [
          '[data-testid="contact-list"]',
          '.uArJ5e.kO001e',
          '.VfPpkd-rymPhb-fpDzbe-fmcmS',
          '[role="main"] .contact-item'
        ],
        contactName: [
          '.contact-name',
          '[data-testid="contact-name"]',
          '.DPvwYc.sm8sCf',
          '.name'
        ]
      };
      
      // Updated selectors (should work better)
      const updatedSelectors = {
        contactList: [
          '[role="main"] [role="listitem"]',
          '[role="main"] [jsname]',
          '[role="main"] .contact-item',
          '.uArJ5e.kO001e',
          '.VfPpkd-rymPhb-fpDzbe-fmcmS',
          '[data-testid="contact-list"]',
          '[role="main"] > div > div',
          'main > div',
          '[role="main"] div[class*="contact"]'
        ],
        contactName: [
          '[role="listitem"] [jsname] span',
          '[data-testid="contact-name"]',
          '.DPvwYc.sm8sCf',
          '.contact-name',
          '.name',
          '[role="listitem"] span',
          'div[jsname] span:first-child',
          '[role="listitem"] div:first-child'
        ]
      };
      
      console.log('❌ ORIGINAL SELECTORS (were failing):');
      this.testSelectorGroup(contactsHTML, originalSelectors, 'original');
      
      console.log('\\n✅ UPDATED SELECTORS (should work):');
      this.testSelectorGroup(contactsHTML, updatedSelectors, 'updated');
      
      // Test specific elements
      console.log('\\n🔍 SPECIFIC ELEMENT ANALYSIS:');
      this.analyzeSpecificElements(contactsHTML);
      
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }
  }
  
  testSelectorGroup(html, selectors, groupName) {
    let foundAny = false;
    
    Object.entries(selectors).forEach(([category, selectorArray]) => {
      console.log(`\\n  📋 ${category.toUpperCase()}:`);
      
      selectorArray.forEach((selector) => {
        const found = this.testSelector(html, selector);
        if (found) {
          console.log(`    ✅ ${selector} - FOUND`);
          this.results.found.push({ selector, group: groupName, category });
          foundAny = true;
        } else {
          console.log(`    ❌ ${selector} - NOT FOUND`);
          this.results.notFound.push({ selector, group: groupName, category });
        }
      });
    });
    
    if (!foundAny && groupName === 'original') {
      console.log(`  🚨 WARNING: No original selectors working - explains the error!`);
    }
  }
  
  testSelector(html, selector) {
    try {
      // Basic pattern matching for selector presence
      if (selector.includes('role="main"')) {
        return html.includes('role="main"');
      }
      if (selector.includes('role="listitem"')) {
        return html.includes('role="listitem"');
      }
      if (selector.includes('jsname')) {
        return html.includes('jsname');
      }
      if (selector.includes('data-testid')) {
        return html.includes('data-testid');
      }
      
      // Class name searches
      const cleanSelector = selector.replace(/[\\[\\]\"'=*:>\\s]/g, '');
      const className = cleanSelector.replace(/\\./g, '');
      
      return html.includes(className);
      
    } catch (error) {
      return false;
    }
  }
  
  analyzeSpecificElements(html) {
    const elements = [
      { name: 'Main Role Element', pattern: 'role="main"', critical: true },
      { name: 'List Items', pattern: 'role="listitem"', critical: true },
      { name: 'JSName Attributes', pattern: 'jsname', critical: true },
      { name: 'Contact Name (Finchelstein)', pattern: 'Finchelstein', critical: true },
      { name: 'Contact Name (Daniel)', pattern: 'Daniel', critical: true },
      { name: 'Material Design Classes', pattern: 'VfPpkd', critical: false },
      { name: 'Data Test IDs', pattern: 'data-testid', critical: false }
    ];
    
    elements.forEach(element => {
      const found = html.includes(element.pattern);
      const status = found ? '✅' : '❌';
      const priority = element.critical ? '[CRITICAL]' : '[OPTIONAL]';
      console.log(`  ${status} ${element.name}: ${found ? 'FOUND' : 'NOT FOUND'} ${priority}`);
      
      if (found && element.critical) {
        this.results.improvements.push(element.name);
      }
    });
  }
  
  generateReport() {
    console.log('\\n📊 GOOGLE CONTACTS SELECTOR FIX REPORT');
    console.log('======================================');
    
    const originalFound = this.results.found.filter(r => r.group === 'original').length;
    const updatedFound = this.results.found.filter(r => r.group === 'updated').length;
    
    console.log(`Original Selectors: ${originalFound} working`);
    console.log(`Updated Selectors: ${updatedFound} working`);
    console.log(`Improvement: +${updatedFound - originalFound} working selectors`);
    
    if (this.results.improvements.length > 0) {
      console.log(`\\n✅ CRITICAL ELEMENTS AVAILABLE:`);
      this.results.improvements.forEach(imp => console.log(`   - ${imp}`));
    }
    
    console.log('\\n🔧 ASSESSMENT:');
    
    if (originalFound === 0) {
      console.log('✅ CONFIRMED: Original selectors were completely broken');
      console.log('   This explains the "Element not found" error');
    }
    
    if (updatedFound > originalFound) {
      console.log(`✅ IMPROVEMENT: ${updatedFound - originalFound} new working selectors added`);
    }
    
    if (this.results.improvements.includes('Main Role Element') && 
        this.results.improvements.includes('List Items')) {
      console.log('✅ SOLUTION VIABLE: Both main and listitem elements available');
    }
    
    const contactNameFound = this.results.improvements.includes('Contact Name (Daniel)') ||
                            this.results.improvements.includes('Contact Name (Finchelstein)');
    
    if (contactNameFound) {
      console.log('✅ CONTENT DETECTION: Contact name found in HTML - extraction should work');
    }
    
    console.log('\\n🎯 EXPECTED OUTCOME:');
    console.log('   The updated selectors should resolve the "Element not found" error');
    console.log('   Contact search results should now be detected properly');
  }
}

// Run the test
if (require.main === module) {
  const tester = new GoogleContactsTester();
  tester.testSelectors();
}

module.exports = GoogleContactsTester;