#!/usr/bin/env node

/**
 * Manual Analysis of LinkedIn and Google Contacts HTML Examples
 * Analyzes the provided HTML to verify selector strategies
 */

const fs = require('fs');
const path = require('path');

class HTMLAnalyzer {
  constructor() {
    this.results = {
      linkedin: {
        basic: {},
        withContacts: {}
      },
      googleContacts: {}
    };
  }

  async analyze() {
    console.log('🔍 ANALYZING HTML EXAMPLES FOR SELECTOR VALIDATION\n');
    
    try {
      await this.analyzeLinkedInHTML();
      await this.analyzeGoogleContactsHTML();
      await this.generateRecommendations();
      
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
    }
  }

  async analyzeLinkedInHTML() {
    console.log('🔗 LINKEDIN PROFILE ANALYSIS');
    console.log('============================\n');

    const linkedinPath = path.join(__dirname, '../LinkedInProfileExamples', 'Daniel Finchelstein LinkedIn html.txt');
    const linkedinContactsPath = path.join(__dirname, '../LinkedInProfileExamples', 'Daniel Finchelstein LinkedIn html_with Contact Info.txt');

    try {
      const basicHTML = fs.readFileSync(linkedinPath, 'utf8');
      const contactsHTML = fs.readFileSync(linkedinContactsPath, 'utf8');

      console.log('📄 Basic LinkedIn Profile:');
      this.analyzeLinkedInContent(basicHTML, 'basic');

      console.log('\n📞 LinkedIn Profile with Contact Info:');
      this.analyzeLinkedInContent(contactsHTML, 'withContacts');

    } catch (error) {
      console.error('❌ Failed to analyze LinkedIn HTML:', error.message);
    }
  }

  analyzeLinkedInContent(html, type) {
    const analysis = {
      hasStructuredData: false,
      hasProfileClasses: false,
      hasDataAttributes: false,
      foundProfileInfo: {},
      recommendedSelectors: []
    };

    // Check for structured data (JSON-LD)
    const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gi);
    if (jsonLdMatch) {
      analysis.hasStructuredData = true;
      console.log('  ✅ JSON-LD structured data found');
      
      jsonLdMatch.forEach((script, index) => {
        try {
          // Extract JSON content
          const jsonContent = script.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
          if (jsonContent.includes('"name"') || jsonContent.includes('Daniel')) {
            console.log(`     📋 Script ${index + 1} contains profile data`);
          }
        } catch (e) {
          // Continue analysis even if JSON parsing fails
        }
      });
      
      analysis.recommendedSelectors.push('script[type="application/ld+json"]');
    } else {
      console.log('  ❌ No JSON-LD structured data found');
    }

    // Check for LinkedIn-specific classes
    const linkedinClasses = [
      'pv-text-details__left-panel',
      'pv-top-card',
      'profile-photo',
      'artdeco-entity-lockup',
      'top-card-layout'
    ];

    linkedinClasses.forEach(className => {
      if (html.includes(className)) {
        analysis.hasProfileClasses = true;
        console.log(`  ✅ Found LinkedIn class: ${className}`);
        
        if (className.includes('text-details') || className.includes('top-card')) {
          analysis.recommendedSelectors.push(`.${className} h1`);
          analysis.recommendedSelectors.push(`.${className} .text-body-medium`);
        }
      }
    });

    if (!analysis.hasProfileClasses) {
      console.log('  ❌ Traditional LinkedIn profile classes not found');
    }

    // Check for data attributes
    const dataAttributeRegex = /data-[a-zA-Z-]+="[^"]*"/g;
    const dataAttributes = html.match(dataAttributeRegex) || [];
    
    if (dataAttributes.length > 0) {
      analysis.hasDataAttributes = true;
      console.log(`  ✅ Found ${dataAttributes.length} data attributes`);
      
      // Look for profile-specific data attributes
      const profileDataAttrs = dataAttributes.filter(attr => 
        attr.includes('person') || 
        attr.includes('profile') || 
        attr.includes('member') ||
        attr.includes('name')
      ).slice(0, 5); // Show first 5

      profileDataAttrs.forEach(attr => {
        console.log(`     🏷️  ${attr}`);
        const attrName = attr.split('=')[0];
        analysis.recommendedSelectors.push(`[${attrName}]`);
      });
    }

    // Check for specific profile information
    const profileSearchTerms = {
      name: ['Daniel Finchelstein', 'Daniel', 'Finchelstein'],
      location: ['Chicago', 'Illinois', 'United States'],
      title: ['CEO', 'Founder', 'President', 'Executive'],
      company: ['Company', 'Inc', 'LLC', 'Corp']
    };

    Object.entries(profileSearchTerms).forEach(([field, terms]) => {
      const found = terms.some(term => html.includes(term));
      if (found) {
        analysis.foundProfileInfo[field] = true;
        console.log(`  ✅ ${field} information detected`);
      } else {
        console.log(`  ❌ ${field} information not clearly detected`);
      }
    });

    // Check for contact info (email, phone)
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRegex = /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/;
    
    if (emailRegex.test(html)) {
      analysis.foundProfileInfo.email = true;
      console.log('  ✅ Email information detected');
    }
    
    if (phoneRegex.test(html)) {
      analysis.foundProfileInfo.phone = true;
      console.log('  ✅ Phone information detected');
    }

    // Store results
    this.results.linkedin[type] = analysis;
  }

  async analyzeGoogleContactsHTML() {
    console.log('\n👥 GOOGLE CONTACTS ANALYSIS');
    console.log('===========================\n');

    const contactsPath = path.join(__dirname, '../LinkedInProfileExamples', 'Daniel Finchelstein Google contact html.txt');

    try {
      const contactsHTML = fs.readFileSync(contactsPath, 'utf8');
      
      const analysis = {
        hasFormElements: false,
        hasMaterialDesign: false,
        hasDataAttributes: false,
        foundElements: {},
        recommendedSelectors: []
      };

      // Check for form elements
      const formElements = ['input', 'textarea', 'select', 'button'];
      formElements.forEach(element => {
        const regex = new RegExp(`<${element}[^>]*>`, 'gi');
        const matches = contactsHTML.match(regex) || [];
        if (matches.length > 0) {
          analysis.hasFormElements = true;
          console.log(`  ✅ Found ${matches.length} ${element} elements`);
          
          // Analyze specific form elements
          matches.slice(0, 3).forEach((match, index) => {
            console.log(`     📋 ${element} ${index + 1}: ${match.substring(0, 60)}...`);
            
            // Extract useful attributes
            if (match.includes('aria-label')) {
              const ariaMatch = match.match(/aria-label="([^"]*)"/);
              if (ariaMatch) {
                analysis.recommendedSelectors.push(`${element}[aria-label*="${ariaMatch[1]}"]`);
              }
            }
            
            if (match.includes('placeholder')) {
              const placeholderMatch = match.match(/placeholder="([^"]*)"/);
              if (placeholderMatch) {
                analysis.recommendedSelectors.push(`${element}[placeholder*="${placeholderMatch[1]}"]`);
              }
            }
          });
        }
      });

      // Check for Material Design classes
      const materialClasses = [
        'VfPpkd-',
        'mdc-',
        'material-icons',
        'mat-'
      ];

      materialClasses.forEach(classPrefix => {
        const regex = new RegExp(`class="[^"]*${classPrefix}[^"]*"`, 'gi');
        const matches = contactsHTML.match(regex) || [];
        if (matches.length > 0) {
          analysis.hasMaterialDesign = true;
          console.log(`  ✅ Found ${matches.length} Material Design classes (${classPrefix})`);
        }
      });

      // Check for contact-specific terms
      const contactTerms = {
        name: ['name', 'Name', 'contact-name', 'full-name'],
        email: ['email', 'Email', 'mail'],
        phone: ['phone', 'Phone', 'telephone', 'mobile'],
        notes: ['notes', 'Notes', 'note', 'Note'],
        save: ['save', 'Save', 'submit', 'Submit']
      };

      Object.entries(contactTerms).forEach(([field, terms]) => {
        const found = terms.some(term => contactsHTML.includes(term));
        if (found) {
          analysis.foundElements[field] = true;
          console.log(`  ✅ ${field} related elements detected`);
        } else {
          console.log(`  ❌ ${field} related elements not clearly detected`);
        }
      });

      // Check for search functionality
      if (contactsHTML.includes('search') || contactsHTML.includes('Search')) {
        analysis.foundElements.search = true;
        console.log('  ✅ Search functionality detected');
        analysis.recommendedSelectors.push('input[placeholder*="Search"]');
        analysis.recommendedSelectors.push('input[aria-label*="Search"]');
      }

      this.results.googleContacts = analysis;

    } catch (error) {
      console.error('❌ Failed to analyze Google Contacts HTML:', error.message);
    }
  }

  async generateRecommendations() {
    console.log('\n🔧 RECOMMENDATIONS FOR EXTENSION SELECTORS');
    console.log('==========================================\n');

    // LinkedIn Recommendations
    console.log('🔗 LinkedIn Profile Extraction:');
    
    const linkedinBasic = this.results.linkedin.basic;
    const linkedinContacts = this.results.linkedin.withContacts;

    if (linkedinBasic.hasStructuredData || linkedinContacts.hasStructuredData) {
      console.log('  ✅ PRIORITY 1: Use JSON-LD structured data extraction');
      console.log('     - Most reliable method for profile information');
      console.log('     - Resistant to UI changes');
      console.log('     - Selector: script[type="application/ld+json"]');
      console.log('     - Parse JSON content to extract name, title, location');
    }

    if (linkedinBasic.hasDataAttributes || linkedinContacts.hasDataAttributes) {
      console.log('  ✅ PRIORITY 2: Use data attributes as fallback');
      console.log('     - More stable than class-based selectors');
      console.log('     - Examples: [data-anonymize="person-name"], [data-field="*"]');
    }

    if (linkedinBasic.hasProfileClasses || linkedinContacts.hasProfileClasses) {
      console.log('  ⚠️ PRIORITY 3: Use traditional class selectors as last resort');
      console.log('     - May break with UI updates');
      console.log('     - Implement multiple fallbacks');
    } else {
      console.log('  ❌ WARNING: Traditional LinkedIn classes not found in examples');
      console.log('     - Current selectors may not work with modern LinkedIn');
      console.log('     - CRITICAL: Update selectors to use structured data');
    }

    // Google Contacts Recommendations  
    console.log('\n👥 Google Contacts Integration:');
    
    const googleContacts = this.results.googleContacts;
    
    if (googleContacts.hasFormElements) {
      console.log('  ✅ Form elements detected - integration should work');
      console.log('     - Use aria-label attributes for accessibility');
      console.log('     - Use placeholder text as fallback');
      console.log('     - Wait for dynamic content loading');
    }

    if (googleContacts.hasMaterialDesign) {
      console.log('  ✅ Material Design UI detected');
      console.log('     - Use Material Design class patterns');
      console.log('     - Expect dynamic class names');
      console.log('     - Implement wait strategies for animations');
    }

    // Overall Assessment
    console.log('\n📊 OVERALL ASSESSMENT:');
    
    const linkedinDataAvailable = 
      (linkedinBasic.hasStructuredData || linkedinContacts.hasStructuredData) ||
      (linkedinBasic.hasDataAttributes || linkedinContacts.hasDataAttributes) ||
      (linkedinBasic.hasProfileClasses || linkedinContacts.hasProfileClasses);

    const contactsDataAvailable = 
      googleContacts.hasFormElements && 
      (googleContacts.foundElements.name || googleContacts.foundElements.email);

    if (linkedinDataAvailable && contactsDataAvailable) {
      console.log('  🎉 GOOD: Both LinkedIn and Google Contacts data can be extracted');
      console.log('      - Extension should work with current selectors');
      console.log('      - Recommend implementing structured data extraction for reliability');
    } else if (linkedinDataAvailable) {
      console.log('  ⚠️ PARTIAL: LinkedIn data available, Google Contacts needs work');
      console.log('      - Review Google Contacts selectors');
      console.log('      - Test with actual Google Contacts interface');
    } else if (contactsDataAvailable) {
      console.log('  ⚠️ PARTIAL: Google Contacts available, LinkedIn needs major updates');
      console.log('      - CRITICAL: LinkedIn selectors likely outdated');
      console.log('      - Implement JSON-LD parsing immediately');
    } else {
      console.log('  ❌ CRITICAL: Both platforms need selector updates');
      console.log('      - Extension may not work as expected');
      console.log('      - Requires significant selector revision');
    }

    // Specific Action Items
    console.log('\n📋 ACTION ITEMS:');
    console.log('1. Implement JSON-LD structured data parsing for LinkedIn');
    console.log('2. Add data-attribute based selectors as primary fallbacks');
    console.log('3. Test selectors with live LinkedIn and Google Contacts pages');
    console.log('4. Implement robust wait strategies for dynamic content');
    console.log('5. Add error handling for selector failures');
    console.log('6. Consider using MutationObserver for dynamic content detection');
  }
}

// Run analysis
if (require.main === module) {
  const analyzer = new HTMLAnalyzer();
  analyzer.analyze().catch(console.error);
}

module.exports = HTMLAnalyzer;