#!/usr/bin/env node

/**
 * Selector Testing Script for LinkedIn to Contacts Extension
 * Tests our extraction selectors against real LinkedIn and Google Contacts HTML
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

class SelectorTester {
  constructor() {
    this.testResults = [];
    this.linkedinHtml = '';
    this.linkedinWithContactsHtml = '';
    this.googleContactsHtml = '';
  }

  async initialize() {
    console.log('🔍 Initializing Selector Testing...\n');
    
    try {
      // Load HTML examples
      await this.loadHTMLExamples();
      
      // Test LinkedIn selectors
      await this.testLinkedInSelectors();
      
      // Test Google Contacts selectors
      await this.testGoogleContactsSelectors();
      
      // Generate report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Testing failed:', error.message);
    }
  }

  async loadHTMLExamples() {
    const examplesPath = path.join(__dirname, 'examples');
    
    try {
      this.linkedinHtml = fs.readFileSync(
        path.join(examplesPath, 'Daniel Finchelstein LinkedIn html.txt'), 
        'utf8'
      );
      
      this.linkedinWithContactsHtml = fs.readFileSync(
        path.join(examplesPath, 'Daniel Finchelstein LinkedIn html_with Contact Info.txt'), 
        'utf8'
      );
      
      this.googleContactsHtml = fs.readFileSync(
        path.join(examplesPath, 'Daniel Finchelstein Google contact html.txt'), 
        'utf8'
      );
      
      console.log('✅ HTML examples loaded successfully');
      
    } catch (error) {
      throw new Error(`Failed to load HTML examples: ${error.message}`);
    }
  }

  async testLinkedInSelectors() {
    console.log('🔗 Testing LinkedIn Profile Selectors...\n');

    // Our current selectors from linkedin-extractor.js
    const PROFILE_SELECTORS = {
      name: [
        'h1[data-anonymize="person-name"]',
        '.pv-text-details__left-panel h1',
        '.artdeco-entity-lockup__title',
        '.pv-top-card--list h1',
        '.top-card-layout__title'
      ],
      headline: [
        '.pv-text-details__left-panel .text-body-medium:first-child',
        '.top-card-layout__headline',
        '.pv-top-card--list-bullet .text-body-medium',
        '[data-field="headline"]'
      ],
      location: [
        '.pv-text-details__left-panel .pb2 .text-body-small.color-text-low-emphasis',
        '.top-card-layout__first-subline',
        '.pv-top-card--list-bullet .text-body-small',
        '[data-field="location"]'
      ],
      avatar: [
        '.pv-top-card__photo img',
        '.profile-photo-edit__preview img',
        '.top-card-layout__entity-image img',
        '.presence-entity__image img'
      ],
      company: [
        '.pv-text-details__left-panel .text-body-medium:last-of-type',
        '.top-card-layout__headline .text-body-medium',
        '[data-field="company"]'
      ],
      profileUrl: [
        'link[rel="canonical"]'
      ]
    };

    // Test against both LinkedIn HTML samples
    await this.testSelectorsAgainstHTML('LinkedIn (Basic)', this.linkedinHtml, PROFILE_SELECTORS);
    await this.testSelectorsAgainstHTML('LinkedIn (With Contacts)', this.linkedinWithContactsHtml, PROFILE_SELECTORS);
  }

  async testGoogleContactsSelectors() {
    console.log('👥 Testing Google Contacts Selectors...\n');

    // Our current selectors from google-contacts-updater.js
    const CONTACTS_SELECTORS = {
      searchBox: [
        'input[placeholder*="Search"]',
        'input[aria-label*="Search"]',
        '.gb_hf input[type="text"]',
        '#searchbox input'
      ],
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
      ],
      editButton: [
        'button[aria-label*="Edit"]',
        '.edit-contact-button',
        '[data-testid="edit-button"]',
        'button[title*="Edit"]'
      ],
      notesField: [
        'textarea[aria-label*="Notes"]',
        'textarea[placeholder*="Notes"]',
        '[data-field="notes"] textarea',
        'textarea.notes'
      ]
    };

    await this.testSelectorsAgainstHTML('Google Contacts', this.googleContactsHtml, CONTACTS_SELECTORS);
  }

  async testSelectorsAgainstHTML(title, htmlContent, selectors) {
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    console.log(`📋 Testing ${title} Selectors:`);

    Object.entries(selectors).forEach(([fieldName, selectorArray]) => {
      let foundElement = null;
      let usedSelector = null;

      // Test each selector in the fallback chain
      for (const selector of selectorArray) {
        try {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            foundElement = elements[0];
            usedSelector = selector;
            break;
          }
        } catch (error) {
          // Invalid selector, skip
          continue;
        }
      }

      const result = {
        platform: title,
        field: fieldName,
        found: !!foundElement,
        selector: usedSelector,
        content: foundElement ? this.extractContent(foundElement, fieldName) : null,
        fallbacksTestedCount: selectorArray.length
      };

      this.testResults.push(result);

      // Console output
      if (result.found) {
        console.log(`  ✅ ${fieldName}: Found with "${usedSelector}"`);
        if (result.content) {
          console.log(`      Content: "${result.content.substring(0, 50)}${result.content.length > 50 ? '...' : ''}"`);
        }
      } else {
        console.log(`  ❌ ${fieldName}: Not found (tested ${result.fallbacksTestedCount} selectors)`);
      }
    });

    console.log('');
  }

  extractContent(element, fieldName) {
    switch (fieldName) {
      case 'avatar':
      case 'profileUrl':
        return element.src || element.href || 'URL found';
      case 'searchBox':
      case 'editButton':
      case 'notesField':
        return element.placeholder || element.getAttribute('aria-label') || 'Element found';
      default:
        return element.textContent ? element.textContent.trim() : 'Element found';
    }
  }

  generateReport() {
    console.log('📊 SELECTOR TESTING REPORT');
    console.log('==========================\n');

    const platforms = [...new Set(this.testResults.map(r => r.platform))];
    
    platforms.forEach(platform => {
      const platformResults = this.testResults.filter(r => r.platform === platform);
      const successCount = platformResults.filter(r => r.found).length;
      const totalCount = platformResults.length;
      const successRate = ((successCount / totalCount) * 100).toFixed(1);

      console.log(`${platform}:`);
      console.log(`  Success Rate: ${successCount}/${totalCount} (${successRate}%)`);
      
      const failures = platformResults.filter(r => !r.found);
      if (failures.length > 0) {
        console.log(`  Failed Fields: ${failures.map(f => f.field).join(', ')}`);
      }
      console.log('');
    });

    // Overall statistics
    const totalSuccess = this.testResults.filter(r => r.found).length;
    const totalTests = this.testResults.length;
    const overallRate = ((totalSuccess / totalTests) * 100).toFixed(1);

    console.log('OVERALL SUMMARY:');
    console.log(`✅ Successful extractions: ${totalSuccess}/${totalTests} (${overallRate}%)`);
    
    // Recommendations
    console.log('\n🔧 RECOMMENDATIONS:');
    
    const criticalFailures = this.testResults.filter(r => 
      !r.found && ['name', 'searchBox', 'contactName'].includes(r.field)
    );
    
    if (criticalFailures.length > 0) {
      console.log('❗ CRITICAL: The following essential selectors failed:');
      criticalFailures.forEach(failure => {
        console.log(`   - ${failure.platform}: ${failure.field}`);
      });
      console.log('   These selectors must be updated before deployment.');
    }

    const moderateFailures = this.testResults.filter(r => 
      !r.found && !['name', 'searchBox', 'contactName'].includes(r.field)
    );
    
    if (moderateFailures.length > 0) {
      console.log('\n⚠️ NON-CRITICAL: The following optional selectors failed:');
      moderateFailures.forEach(failure => {
        console.log(`   - ${failure.platform}: ${failure.field}`);
      });
      console.log('   These can be improved but won\'t break core functionality.');
    }

    // Success cases with extracted data
    console.log('\n📍 SUCCESSFUL EXTRACTIONS:');
    const successfulExtractions = this.testResults.filter(r => r.found && r.content && r.content !== 'Element found');
    successfulExtractions.forEach(success => {
      console.log(`   ${success.platform} - ${success.field}: "${success.content.substring(0, 40)}..."`);
    });

    // Final assessment
    if (overallRate >= 80) {
      console.log('\n🎉 ASSESSMENT: Selectors are ready for production use!');
    } else if (overallRate >= 60) {
      console.log('\n⚠️  ASSESSMENT: Selectors need improvement before deployment.');
    } else {
      console.log('\n❌ ASSESSMENT: Selectors require significant updates.');
    }
  }

  // Additional method to analyze the HTML structure for better selectors
  async analyzeHTMLStructure() {
    console.log('\n🔍 ANALYZING HTML STRUCTURE FOR BETTER SELECTORS...\n');

    // Analyze LinkedIn HTML for potential profile data
    const linkedinDom = new JSDOM(this.linkedinHtml);
    const linkedinDoc = linkedinDom.window.document;

    console.log('LinkedIn Profile Analysis:');
    
    // Look for JSON-LD structured data
    const jsonLdScripts = linkedinDoc.querySelectorAll('script[type="application/ld+json"]');
    console.log(`  📄 Found ${jsonLdScripts.length} JSON-LD structured data scripts`);
    
    // Look for data attributes
    const dataAttributes = [...linkedinDoc.querySelectorAll('[data-*]')]
      .map(el => [...el.attributes])
      .flat()
      .filter(attr => attr.name.startsWith('data-'))
      .map(attr => attr.name)
      .filter((name, index, arr) => arr.indexOf(name) === index)
      .slice(0, 10);
    
    console.log(`  🏷️  Common data attributes: ${dataAttributes.join(', ')}`);

    // Check for specific profile-related content
    const profileWords = ['Daniel', 'Finchelstein', 'Chicago', 'CEO', 'Founder'];
    profileWords.forEach(word => {
      const elements = linkedinDoc.body.innerHTML.includes(word);
      console.log(`  🔍 "${word}" found in content: ${elements ? '✅' : '❌'}`);
    });
  }
}

// Mock JSDOM if not available
if (typeof require !== 'undefined') {
  try {
    require('jsdom');
  } catch (error) {
    console.log('⚠️  JSDOM not available. Install with: npm install jsdom');
    console.log('   Running basic validation only...\n');
    
    // Basic validation without DOM parsing
    const tester = {
      testResults: [],
      async initialize() {
        console.log('🔍 Basic Selector Validation (without DOM parsing)...\n');
        
        // Test selector syntax
        const selectors = [
          'h1[data-anonymize="person-name"]',
          '.pv-text-details__left-panel h1',
          'input[placeholder*="Search"]',
          'textarea[aria-label*="Notes"]'
        ];
        
        selectors.forEach(selector => {
          try {
            // Basic CSS selector validation
            if (selector.match(/^[a-zA-Z0-9\[\]"'=*:.-_\s#]+$/)) {
              console.log(`  ✅ "${selector}" - Valid CSS selector syntax`);
            } else {
              console.log(`  ❌ "${selector}" - Invalid CSS selector syntax`);
            }
          } catch (error) {
            console.log(`  ❌ "${selector}" - Error: ${error.message}`);
          }
        });
        
        console.log('\n📋 Install jsdom for full testing: npm install jsdom');
      }
    };
    
    tester.initialize().catch(console.error);
    return;
  }
}

// Run the test if called directly
if (require.main === module) {
  const tester = new SelectorTester();
  tester.initialize()
    .then(() => tester.analyzeHTMLStructure())
    .catch(console.error);
}

module.exports = SelectorTester;