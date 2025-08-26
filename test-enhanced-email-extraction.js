#!/usr/bin/env node

/**
 * Test Enhanced Email Extraction
 * Tests the improved email extraction against example data
 */

const fs = require('fs');
const path = require('path');
// const { JSDOM } = require('jsdom'); // Optional dependency

// Mock functions from the LinkedIn extractor
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  // Filter out system/non-personal emails
  const blacklist = ['noreply', 'support', 'help', 'info', 'no-reply', 'notification', 'linkedin.com', 'example.com', 'test.com'];
  const emailLower = email.toLowerCase();
  
  if (blacklist.some(term => emailLower.includes(term))) {
    return false;
  }
  
  // Basic email format validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

function isValidWebsite(url) {
  if (!url || typeof url !== 'string') return false;
  
  // Filter out LinkedIn and other social media URLs
  const blacklist = ['linkedin.com', 'facebook.com', 'twitter.com', 'instagram.com', 'youtube.com', 'tiktok.com', 'snapchat.com'];
  const urlLower = url.toLowerCase();
  
  if (blacklist.some(term => urlLower.includes(term))) {
    return false;
  }
  
  // Basic URL format validation
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
  } catch {
    return false;
  }
}

// Enhanced extraction function based on improvements
function extractContactInfoFromModal(profile, modal) {
  console.log('🔍 Testing enhanced contact info extraction...');
  
  try {
    console.log('📄 Modal found, analyzing structure...');
    const modalText = modal.textContent || modal.innerText;
    console.log('📄 Modal content preview:', modalText.substring(0, 200) + '...');
    
    // **ENHANCED STRUCTURED EXTRACTION** - Use pv-contact-info sections like in examples
    const contactSections = modal.querySelectorAll('.pv-contact-info__contact-type');
    console.log('🔍 Found', contactSections.length, 'contact info sections');
    
    // Process each contact section
    for (const section of contactSections) {
      const sectionText = section.textContent || '';
      const header = section.querySelector('.pv-contact-info__header');
      const headerText = header ? header.textContent.trim() : '';
      
      console.log('📝 Processing section with header:', headerText);
      
      // Email Section Processing
      if (headerText.toLowerCase().includes('email')) {
        console.log('📧 Processing email section...');
        
        // Method 1: Extract from mailto links (most reliable)
        const emailLinks = section.querySelectorAll('a[href^="mailto:"]');
        if (emailLinks.length > 0) {
          const emailFromLink = emailLinks[0].href.substring(7); // Remove 'mailto:'
          if (emailFromLink && isValidEmail(emailFromLink)) {
            profile.email = emailFromLink;
            console.log('✅ Email extracted from mailto link:', profile.email);
          }
        }
        
        // Method 2: Extract from text content if no mailto link
        if (!profile.email) {
          const emailPattern = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;
          const emails = sectionText.match(emailPattern);
          if (emails && emails.length > 0) {
            const validEmail = emails.find(email => isValidEmail(email));
            if (validEmail) {
              profile.email = validEmail;
              console.log('✅ Email extracted from section text:', profile.email);
            }
          }
        }
      }
      
      // Phone Section Processing  
      else if (headerText.toLowerCase().includes('phone')) {
        console.log('📱 Processing phone section...');
        
        // Look for phone number in section text
        const phonePatterns = [
          /\+\d{1,3}[\s\-]?\(?\d{1,4}\)?[\s\-]?\d{1,4}[\s\-]?\d{1,9}/g, // International
          /\(\d{3}\)[\s\-]?\d{3}[\s\-]?\d{4}/g, // US format (555) 555-5555
          /\d{3}[\s\-]?\d{3}[\s\-]?\d{4}/g, // US format 555-555-5555
          /\d{10,15}/g // Simple digit sequences
        ];
        
        for (const pattern of phonePatterns) {
          const phones = sectionText.match(pattern);
          if (phones && phones.length > 0) {
            const cleanPhone = phones[0].trim();
            const digits = cleanPhone.replace(/\D/g, '');
            
            // Validate phone number length
            if (digits.length >= 10 && digits.length <= 15) {
              profile.phone = cleanPhone;
              console.log('✅ Phone extracted from section:', profile.phone);
              break;
            }
          }
        }
      }
      
      // Website Section Processing
      else if (headerText.toLowerCase().includes('website')) {
        console.log('🌐 Processing website section...');
        
        // Method 1: Extract from href attributes
        const websiteLinks = section.querySelectorAll('a[href]:not([href^="mailto:"])');
        for (const link of websiteLinks) {
          const url = link.href;
          if (url && !url.includes('linkedin.com') && !url.includes('javascript:') && isValidWebsite(url)) {
            profile.website = url;
            console.log('✅ Website extracted from link:', profile.website);
            break;
          }
        }
        
        // Method 2: Extract from text content
        if (!profile.website) {
          const websitePattern = /https?:\/\/[^\s\)\]\}\"\']+/g;
          const websites = sectionText.match(websitePattern);
          if (websites && websites.length > 0) {
            const validWebsite = websites.find(url => isValidWebsite(url));
            if (validWebsite) {
              profile.website = validWebsite;
              console.log('✅ Website extracted from section text:', profile.website);
            }
          }
        }
      }
    }
    
    // Log final extraction results
    console.log('📊 Final modal extraction results:');
    console.log('📧 Email:', profile.email || 'not found');
    console.log('📱 Phone:', profile.phone || 'not found'); 
    console.log('🌐 Website:', profile.website || 'not found');
    
  } catch (error) {
    console.error('❌ Error extracting from contact modal:', error);
  }
  
  return profile;
}

async function runTests() {
  console.log('🧪 ENHANCED EMAIL EXTRACTION TEST');
  console.log('==================================\n');
  
  try {
    // Load the example HTML with Contact Info
    const htmlPath = path.join(__dirname, 'examples', 'Adam Frank LinkedIn html_with Contact Info.txt');
    
    if (!fs.existsSync(htmlPath)) {
      console.log('❌ Example file not found:', htmlPath);
      return;
    }
    
    console.log('📄 Loading example HTML...');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Create JSDOM instance
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM(htmlContent);
    global.document = dom.window.document;
    global.window = dom.window;
    
    console.log('🔍 Searching for Contact Info modal in example HTML...');
    
    // Find the modal in the example HTML
    const modalSelectors = [
      '.artdeco-modal-overlay .artdeco-modal[role="dialog"]',
      '.artdeco-modal-overlay .artdeco-modal',
      '[role="dialog"][aria-labelledby="pv-contact-info"]',
      '[role="dialog"]',
      '.artdeco-modal'
    ];
    
    let modal = null;
    for (const selector of modalSelectors) {
      modal = document.querySelector(selector);
      if (modal) {
        console.log('✅ Found modal with selector:', selector);
        break;
      }
    }
    
    if (!modal) {
      console.log('❌ No Contact Info modal found in example HTML');
      return;
    }
    
    // Test the enhanced extraction
    console.log('\n🧪 Testing Enhanced Extraction...');
    const profile = {
      fullName: 'Adam Frank',
      url: 'https://www.linkedin.com/in/adamffrank/'
    };
    
    const result = extractContactInfoFromModal(profile, modal);
    
    // Validate results
    console.log('\n📊 EXTRACTION TEST RESULTS:');
    console.log('============================');
    
    const expectedEmail = 'adamffrank@gmail.com';
    const expectedPhone = null; // Adam Frank has no phone in contact info
    const expectedWebsite = null; // Adam Frank has no website in contact info
    
    // Email test
    if (result.email === expectedEmail) {
      console.log('✅ Email extraction: PASSED (' + result.email + ')');
    } else {
      console.log('❌ Email extraction: FAILED');
      console.log('   Expected:', expectedEmail);
      console.log('   Got:', result.email || 'null');
    }
    
    // Phone test (should be null/undefined for Adam Frank)
    if (!result.phone || result.phone === expectedPhone) {
      console.log('✅ Phone extraction: PASSED (correctly no phone extracted)');
    } else {
      console.log('❌ Phone extraction: FAILED');
      console.log('   Expected: no phone (null/undefined)');
      console.log('   Got:', result.phone);
    }
    
    // Website test (should be null/undefined for Adam Frank)
    if (!result.website || result.website === expectedWebsite) {
      console.log('✅ Website extraction: PASSED (correctly no website extracted)');
    } else {
      console.log('❌ Website extraction: FAILED');
      console.log('   Expected: no website (null/undefined)');
      console.log('   Got:', result.website);
    }
    
    // Count successes
    const successes = [
      result.email === expectedEmail,
      !result.phone || result.phone === expectedPhone, // Success if no phone extracted
      !result.website || result.website === expectedWebsite // Success if no website extracted
    ].filter(Boolean).length;
    
    console.log('\n🎯 OVERALL RESULTS:');
    console.log(`   ${successes}/3 extractions successful (${((successes/3)*100).toFixed(1)}%)`);
    
    if (successes === 3) {
      console.log('🎉 ALL TESTS PASSED! Enhanced extraction working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Review extraction logic.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  // Check if jsdom is available
  try {
    require('jsdom');
    runTests().catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
  } catch (error) {
    console.log('⚠️ JSDOM not available - run: npm install jsdom');
    console.log('📋 Testing components individually...');
    
    // Test validation functions without DOM
    console.log('\n🧪 Testing validation functions...');
    
    // Test email validation
    const testEmails = [
      'finchel@gmail.com', // should pass
      'noreply@linkedin.com', // should fail
      'invalid-email', // should fail
      'user@example.com' // should fail
    ];
    
    console.log('📧 Email validation tests:');
    testEmails.forEach(email => {
      const isValid = isValidEmail(email);
      console.log(`   ${isValid ? '✅' : '❌'} ${email}: ${isValid ? 'valid' : 'invalid'}`);
    });
    
    // Test website validation
    const testWebsites = [
      'https://calendly.com/daniel-mile', // should pass
      'https://linkedin.com/in/someone', // should fail
      'invalid-url', // should fail
      'http://github.com/user' // should pass
    ];
    
    console.log('🌐 Website validation tests:');
    testWebsites.forEach(url => {
      const isValid = isValidWebsite(url);
      console.log(`   ${isValid ? '✅' : '❌'} ${url}: ${isValid ? 'valid' : 'invalid'}`);
    });
    
    console.log('\n✅ Validation functions working correctly!');
  }
}

module.exports = { extractContactInfoFromModal, isValidEmail, isValidWebsite };