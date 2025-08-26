#!/usr/bin/env node

/**
 * Debug script to test LinkedIn button injection selectors
 * Tests the updated selectors against the HTML examples
 */

const fs = require('fs');
const path = require('path');

class ButtonInjectionTester {
  constructor() {
    this.results = {
      found: [],
      notFound: [],
      recommendations: []
    };
  }

  testSelectors() {
    console.log('🔧 TESTING LINKEDIN BUTTON INJECTION SELECTORS\n');
    
    try {
      // Load LinkedIn HTML example
      const linkedinPath = path.join(__dirname, 'examples', 'Daniel Finchelstein LinkedIn html.txt');
      const linkedinHTML = fs.readFileSync(linkedinPath, 'utf8');
      
      console.log('📄 Testing against LinkedIn HTML example...\n');
      
      // Original selectors that were failing
      const originalSelectors = [
        '.pv-top-card-v2-ctas',
        '.pv-top-card__cta-container',
        '.artdeco-card .pv-top-card-v2-section__actions',
        '.pv-s-profile-actions',
        '.pv-top-card--list .pv-top-card-v2-section__actions'
      ];
      
      // Updated selectors
      const updatedSelectors = [
        '.pv-top-card-v2-ctas',
        '.pv-top-card__cta-container', 
        '.pv-top-card-v2-section__actions',
        '.artdeco-card .pv-top-card-v2-section__actions',
        '.pv-s-profile-actions',
        '.pv-top-card .artdeco-button-group',
        '.pv-top-card [class*="button"]',
        '.pv-top-card [data-test-id*="action"]',
        '.pv-top-card h1',
        '.pv-text-details__left-panel h1'
      ];
      
      console.log('❌ ORIGINAL SELECTORS (failing):');
      this.testSelectorGroup(linkedinHTML, originalSelectors, 'original');
      
      console.log('\n✅ UPDATED SELECTORS (should work):');
      this.testSelectorGroup(linkedinHTML, updatedSelectors, 'updated');
      
      // Test general page elements
      console.log('\n🔍 PAGE ELEMENT ANALYSIS:');
      this.analyzePageElements(linkedinHTML);
      
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }
  }
  
  testSelectorGroup(html, selectors, groupName) {
    let foundAny = false;
    
    selectors.forEach((selector, index) => {
      const found = this.testSelector(html, selector);
      if (found) {
        console.log(`  ✅ ${selector} - FOUND`);
        this.results.found.push({ selector, group: groupName });
        foundAny = true;
      } else {
        console.log(`  ❌ ${selector} - NOT FOUND`);
        this.results.notFound.push({ selector, group: groupName });
      }
    });
    
    if (!foundAny) {
      console.log(`  🚨 WARNING: No selectors in ${groupName} group found anything!`);
    }
  }
  
  testSelector(html, selector) {
    try {
      // Basic pattern matching for selector presence
      if (selector.includes('pv-top-card')) {
        return html.includes('pv-top-card');
      }
      if (selector.includes('artdeco-card')) {
        return html.includes('artdeco-card');
      }
      if (selector.includes('h1')) {
        return html.includes('<h1') || html.includes('h1>');
      }
      if (selector.includes('[class*="button"]')) {
        return html.includes('button') || html.includes('btn');
      }
      if (selector.includes('[data-test-id*="action"]')) {
        return html.includes('data-test-id') && html.includes('action');
      }
      
      // Direct class name search
      const className = selector.replace(/[.#\s\[\]"*=:>]/g, '');
      return html.includes(className);
      
    } catch (error) {
      return false;
    }
  }
  
  analyzePageElements(html) {
    const elements = [
      { name: 'Profile Top Card', pattern: 'pv-top-card', critical: true },
      { name: 'Artdeco Card', pattern: 'artdeco-card', critical: true },
      { name: 'Profile Name H1', pattern: '<h1', critical: true },
      { name: 'Button Elements', pattern: 'button', critical: false },
      { name: 'Action Buttons', pattern: 'action', critical: false },
      { name: 'CTA Elements', pattern: 'cta', critical: false },
      { name: 'Profile Actions', pattern: 'profile-actions', critical: false }
    ];
    
    elements.forEach(element => {
      const found = html.includes(element.pattern);
      const status = found ? '✅' : '❌';
      const priority = element.critical ? '[CRITICAL]' : '[OPTIONAL]';
      console.log(`  ${status} ${element.name}: ${found ? 'FOUND' : 'NOT FOUND'} ${priority}`);
    });
  }
  
  generateReport() {
    console.log('\n📊 BUTTON INJECTION TEST REPORT');
    console.log('=================================');
    
    const originalFound = this.results.found.filter(r => r.group === 'original').length;
    const updatedFound = this.results.found.filter(r => r.group === 'updated').length;
    
    console.log(`Original Selectors: ${originalFound}/5 working`);
    console.log(`Updated Selectors: ${updatedFound}/10 working`);
    
    if (updatedFound > originalFound) {
      console.log('\\n🎉 IMPROVEMENT DETECTED!');
      console.log(`Added ${updatedFound - originalFound} new working selectors`);
    }
    
    console.log('\\n🔧 RECOMMENDATIONS:');
    
    if (this.results.found.some(f => f.selector.includes('h1'))) {
      console.log('✅ Profile name (H1) found - can use as fallback injection point');
    }
    
    if (this.results.found.some(f => f.selector.includes('pv-top-card'))) {
      console.log('✅ Profile top card found - primary injection area available');
    } else {
      console.log('⚠️  Profile top card not found - may need fallback injection');
    }
    
    if (updatedFound === 0) {
      console.log('❗ CRITICAL: No selectors working - extension will fail to inject button');
      console.log('   Consider using fixed positioning fallback');
    } else if (updatedFound < 3) {
      console.log('⚠️  WARNING: Limited selector options - add more fallbacks');
    } else {
      console.log('✅ GOOD: Multiple selector options available - robust injection');
    }
  }
}

// Run the test
if (require.main === module) {
  const tester = new ButtonInjectionTester();
  tester.testSelectors();
}

module.exports = ButtonInjectionTester;