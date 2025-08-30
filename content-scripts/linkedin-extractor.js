/**
 * SIMPLIFIED LinkedIn Profile Extractor
 * Based on proven working approach from LinkedInToContacts-Secure
 */

console.log('LinkedIn to Contacts: Simple extractor loaded');

// Simple, robust extraction based on what works
function extractProfileSimple() {
  console.log('📋 Extracting profile data...');
  
  const profile = {
    url: window.location.href,
    timestamp: new Date().toISOString(),
    email: '',
    phone: '',
    website: ''
  };
  
  // Get name from main h1 (confirmed working)
  const nameElement = document.querySelector('main h1');
  if (nameElement) {
    profile.fullName = nameElement.textContent.trim();
    const nameParts = profile.fullName.split(' ');
    profile.firstName = nameParts[0] || '';
    profile.lastName = nameParts.slice(1).join(' ') || '';
    console.log('✅ Found name:', profile.fullName);
  } else {
    console.log('❌ Name not found');
  }
  
  // Get headline (confirmed working)
  const headlineElement = document.querySelector('.text-body-medium.break-words') || 
                         document.querySelector('main .text-body-medium');
  if (headlineElement) {
    profile.headline = headlineElement.textContent.trim();
    console.log('✅ Found headline:', profile.headline.substring(0, 50) + '...');
    
    // Extract job title from headline - handle compound titles like "Co-Founder"
    // Only split on separators that indicate multiple roles
    let jobTitle = profile.headline;
    
    // Look for clear role separators (but not hyphens within words)
    const titleMatch = profile.headline.match(/^([^|•]+?)(?:\s*[|•]|$)/);
    if (titleMatch) {
      jobTitle = titleMatch[1].trim();
      
      // If we have "Role at Company", extract just the role
      const atMatch = jobTitle.match(/^(.+?)\s+(?:at|@)\s+/i);
      if (atMatch) {
        jobTitle = atMatch[1].trim();
      }
    }
    
    profile.jobTitle = jobTitle;
    console.log('✅ Extracted job title:', profile.jobTitle);
  } else {
    console.log('❌ Headline not found');
  }
  
  // Get company from the experience section or company element
  const companySelectors = [
    // Look for current company indicator
    '[aria-label*="Current company"]',
    // Look for experience section company names
    'div[data-field="experience"] span[aria-hidden="true"]',
    // Look for company in experience cards
    '.experience__list li:first-child span[aria-hidden="true"]:not(:first-child)',
    // Look for subtitle text that often contains company
    'span.text-body-small:not(.t-black--light) span[aria-hidden="true"]',
    // Generic company field selectors
    '.pv-text-details__right-panel span[aria-hidden="true"]',
    // Look in the experience section
    'section[data-section="experience"] span[aria-hidden="true"]',
    // Try to find company name after headline
    '.text-body-small:not(.inline) span[aria-hidden="true"]',
    // Alternative selectors for company
    'div[class*="experience"] span:not(:first-child)[aria-hidden="true"]',
    '.pvs-list__outer-container span[aria-hidden="true"]'
  ];
  
  let companyFound = false;
  for (const selector of companySelectors) {
    const companyElements = document.querySelectorAll(selector);
    for (const element of companyElements) {
      const text = element.textContent.trim();
      // Filter out common non-company text
      if (text && 
          text.length > 2 && 
          text.length < 100 &&
          !text.includes('·') &&
          !text.includes('yr') &&
          !text.includes('mo') &&
          !text.includes('Present') &&
          !text.includes('Full-time') &&
          !text.includes('Part-time') &&
          !text.includes('Contract') &&
          !text.includes('Freelance') &&
          !text.toLowerCase().includes('location') &&
          !text.toLowerCase().includes('remote') &&
          !text.toLowerCase().includes('hybrid') &&
          text !== profile.fullName &&
          text !== profile.jobTitle &&
          text !== profile.headline) {
        profile.company = text;
        console.log('✅ Found company using selector', selector, ':', profile.company);
        companyFound = true;
        break;
      }
    }
    if (companyFound) break;
  }
  
  // Fallback: Try to extract company from headline if not found elsewhere
  if (!profile.company && profile.headline) {
    // Look for patterns like "at CompanyName" or "@ CompanyName"
    const atMatch = profile.headline.match(/(?:at|@)\s+([^-–—•|,]+)/i);
    if (atMatch) {
      const potentialCompany = atMatch[1].trim();
      // Filter out phrases like "of my organization"
      if (!potentialCompany.toLowerCase().includes('my organization') &&
          !potentialCompany.toLowerCase().includes('organization') &&
          potentialCompany.length > 2) {
        profile.company = potentialCompany;
        console.log('✅ Extracted company from headline:', profile.company);
      }
    }
  }
  
  if (!profile.company) {
    console.log('⚠️ Company not found - will need manual entry');
  }
  
  // Get location (try multiple selectors)
  const locationElement = document.querySelector('.text-body-small.inline.t-black--light.break-words') ||
                         document.querySelector('main .text-body-small');
  if (locationElement) {
    profile.location = locationElement.textContent.trim();
    console.log('✅ Found location:', profile.location);
  } else {
    console.log('❌ Location not found');
  }
  
  // Extract additional contact info from Contact Info section
  console.log('🔍 Looking for Contact Info section...');
  extractContactInfo(profile);
  
  console.log('📊 Final profile data:', profile);
  return profile;
}

// Extract email and other contact details from Contact Info
function extractContactInfo(profile) {
  console.log('🔍 Starting enhanced contact info extraction...');
  
  try {
    // First, try to find contact info that's already visible on the page
    extractVisibleContactInfo(profile);
    
    // Then try to find and click the Contact info button to get more details
    const contactInfoButton = findContactInfoButton();
    if (contactInfoButton) {
      console.log('🔍 Found Contact info button, clicking to reveal more details...');
      
      // Create a promise to handle the modal appearing with enhanced detection
      const modalPromise = new Promise((resolve) => {
        // Set up a mutation observer to watch for modal
        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.type === 'childList') {
              // Enhanced modal detection based on examples analysis
              const modalSelectors = [
                // Specific artdeco modal structure from examples
                '.artdeco-modal-overlay .artdeco-modal[role="dialog"]',
                '.artdeco-modal-overlay .artdeco-modal',
                // Alternative selectors
                '[role="dialog"][aria-labelledby="pv-contact-info"]',
                '[role="dialog"]:has(#pv-contact-info)',
                // Generic fallbacks
                '[role="dialog"]',
                '.artdeco-modal',
                '.contact-info-modal'
              ];
              
              for (const selector of modalSelectors) {
                const modal = document.querySelector(selector);
                if (modal) {
                  // Enhanced validation - check if it's actually the contact info modal
                  const modalText = modal.textContent || modal.innerText || '';
                  const hasContactInfoHeader = modalText.includes('Contact Info') || 
                                             modalText.includes('Contact info') ||
                                             modal.querySelector('#pv-contact-info') ||
                                             modal.getAttribute('aria-labelledby') === 'pv-contact-info';
                  
                  // Check if modal contains contact data indicators
                  const hasContactData = modalText.includes('@') || 
                                       modalText.includes('Email') || 
                                       modalText.includes('Phone') ||
                                       modal.querySelector('.pv-contact-info__contact-type');
                  
                  if (hasContactInfoHeader && hasContactData) {
                    observer.disconnect();
                    console.log('✅ Contact info modal detected with selector:', selector);
                    console.log('Modal element:', modal);
                    console.log('Has contact info header:', hasContactInfoHeader);
                    console.log('Has contact data:', hasContactData);
                    resolve(modal);
                    return;
                  }
                }
              }
            }
          }
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Enhanced timeout with longer wait time
        setTimeout(() => {
          observer.disconnect();
          console.log('⚠️ Modal detection timeout - trying manual search');
          
          // Manual search as fallback
          const modalSelectors = [
            '.artdeco-modal-overlay .artdeco-modal[role="dialog"]',
            '.artdeco-modal-overlay .artdeco-modal',
            '[role="dialog"][aria-labelledby="pv-contact-info"]',
            '[role="dialog"]',
            '.artdeco-modal'
          ];
          
          for (const selector of modalSelectors) {
            const modal = document.querySelector(selector);
            if (modal && (modal.textContent.includes('Contact Info') || modal.querySelector('.pv-contact-info__contact-type'))) {
              console.log('✅ Found modal via manual fallback search:', selector);
              resolve(modal);
              return;
            }
          }
          
          resolve(null);
        }, 5000); // Increased to 5 seconds
      });
      
      // Click the button
      contactInfoButton.click();
      
      // Wait for modal and extract data
      modalPromise.then(modal => {
        if (modal) {
          extractContactInfoFromModal(profile, modal);
          // Close the modal after extracting data
          setTimeout(() => {
            closeContactInfoModal();
          }, 1000); // Wait 1 second after extraction
        } else {
          console.log('⚠️ Contact info modal did not appear or timed out');
        }
      });
      
    } else {
      console.log('ℹ️ No Contact info button found - using visible data only');
    }
    
  } catch (error) {
    console.error('❌ Error in contact info extraction:', error);
  }
}

// Extract contact info that's visible on the page without clicking
function extractVisibleContactInfo(profile) {
  console.log('🔍 Extracting visible contact information...');
  
  // Look for email addresses anywhere on the page
  const pageText = document.body.textContent || document.body.innerText;
  const emailPattern = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;
  const emails = pageText.match(emailPattern);
  
  console.log('📧 Found potential emails:', emails);
  
  if (emails && emails.length > 0) {
    // Filter out obvious non-personal emails
    const personalEmails = emails.filter(email => 
      !email.includes('noreply') && 
      !email.includes('support') && 
      !email.includes('help') &&
      !email.includes('info') &&
      !email.includes('no-reply') &&
      !email.includes('notification') &&
      !email.includes('linkedin.com') &&
      !email.includes('example.com') &&
      !email.includes('test.com')
    );
    
    console.log('📧 Filtered personal emails:', personalEmails);
    
    if (personalEmails.length > 0) {
      profile.email = personalEmails[0];
      console.log('✅ Found visible email:', profile.email);
    } else {
      console.log('⚠️ No personal emails found in visible content');
    }
  } else {
    console.log('⚠️ No emails found in page content');
  }
  
  // Also try to find emails in specific LinkedIn elements
  const contactInfoSelectors = [
    '[data-test-id*="contact"] a[href^="mailto:"]',
    'a[href^="mailto:"]',
    '.contact-info a[href^="mailto:"]'
  ];
  
  for (const selector of contactInfoSelectors) {
    const emailLinks = document.querySelectorAll(selector);
    if (emailLinks.length > 0) {
      const emailHref = emailLinks[0].href;
      if (emailHref.startsWith('mailto:')) {
        const extractedEmail = emailHref.substring(7); // Remove 'mailto:'
        if (extractedEmail && !profile.email) {
          profile.email = extractedEmail;
          console.log('✅ Found email in contact links:', profile.email);
        }
      }
    }
  }
  
  // **DISABLED**: Don't search entire page text for phone numbers
  // This was causing extraction of random IDs, timestamps, and garbage data
  // Only extract phones from structured contact sections (Contact Info modal)
  console.log('⚠️ Skipping page-wide phone search to avoid extracting garbage data');
  console.log('📱 Phone numbers will only be extracted from Contact Info sections');
  
  // Look for website links in visible content
  const websitePattern = /https?:\/\/[^\s\)]+/g;
  const websites = pageText.match(websitePattern);
  if (websites && websites.length > 0) {
    // Filter out LinkedIn URLs, social media, shortlinks, and event platforms
    const personalSites = websites.filter(url => {
      const urlLower = url.toLowerCase();
      // Exclude social media, shortlinks, and event platforms
      return !urlLower.includes('linkedin.com') &&
             !urlLower.includes('lnkd.in') && // LinkedIn shortlinks
             !urlLower.includes('facebook.com') &&
             !urlLower.includes('twitter.com') &&
             !urlLower.includes('instagram.com') &&
             !urlLower.includes('youtube.com') &&
             !urlLower.includes('bit.ly') && // URL shorteners
             !urlLower.includes('tinyurl.com') &&
             !urlLower.includes('calendly.com') && // Event platforms
             !urlLower.includes('lu.ma') &&
             !urlLower.includes('eventbrite.com') &&
             !urlLower.includes('meetup.com') &&
             !urlLower.includes('zoom.us');
    });
    
    if (personalSites.length > 0) {
      profile.website = personalSites[0];
      console.log('✅ Found visible website:', profile.website);
    }
  }
}

// Find the Contact info button
function findContactInfoButton() {
  console.log('🔍 Searching for Contact info button...');
  
  // Enhanced selectors based on examples analysis
  const buttonSelectors = [
    // Specific selector from examples
    '#top-card-text-details-contact-info',
    // Href pattern based selectors
    'a[href*="/overlay/contact-info/"]',
    'a[href*="contact-info"]',
    // Generic selectors as fallback
    'button[aria-label*="Contact info"]',
    'button[aria-label*="contact info"]',
    'a[aria-label*="Contact info"]',
    'a[aria-label*="contact info"]',
    // Class-based selectors
    '.pv-top-card-v2-ctas a[href*="contact"]',
    '.pv-s-profile-actions a[href*="contact"]'
  ];
  
  // Try specific selectors first
  for (const selector of buttonSelectors) {
    const button = document.querySelector(selector);
    if (button) {
      console.log('✅ Found Contact info button with selector:', selector);
      console.log('Button element:', button);
      console.log('Button href:', button.href || 'no href');
      console.log('Button text:', button.textContent?.trim());
      return button;
    }
  }
  
  // Enhanced text-based search
  console.log('🔍 Trying text-based search for Contact info button...');
  const allClickableElements = document.querySelectorAll('button, a, [role="button"], [onclick]');
  for (const element of allClickableElements) {
    const text = element.textContent?.toLowerCase() || '';
    const ariaLabel = element.getAttribute('aria-label')?.toLowerCase() || '';
    const href = element.getAttribute('href')?.toLowerCase() || '';
    
    if ((text.includes('contact info') || ariaLabel.includes('contact info') || href.includes('contact-info')) &&
        !text.includes('edit contact info') && // Exclude edit buttons
        !href.includes('edit')) { // Exclude edit links
      console.log('✅ Found Contact info button by content search:', text || ariaLabel || href);
      console.log('Element:', element);
      return element;
    }
  }
  
  // Final fallback - look in specific container areas
  console.log('🔍 Trying container-based search...');
  const containers = [
    '.pv-top-card',
    '.pv-text-details__left-panel',
    '.pv-top-card-v2-section',
    'main section'
  ];
  
  for (const containerSelector of containers) {
    const container = document.querySelector(containerSelector);
    if (container) {
      const contactLinks = container.querySelectorAll('a');
      for (const link of contactLinks) {
        if ((link.textContent?.toLowerCase().includes('contact info') || 
             link.getAttribute('href')?.includes('contact-info')) &&
             !link.getAttribute('href')?.includes('edit')) {
          console.log('✅ Found Contact info button in container:', containerSelector);
          console.log('Link:', link);
          return link;
        }
      }
    }
  }
  
  console.log('❌ Contact info button not found after exhaustive search');
  return null;
}

// Extract contact info from modal/popup - enhanced version based on examples
function extractContactInfoFromModal(profile, modal = null) {
  console.log('🔍 Extracting contact info from modal using structured approach...');
  
  try {
    // If modal not provided, try to find it with enhanced selectors
    if (!modal) {
      const modalSelectors = [
        '.artdeco-modal-overlay .artdeco-modal[role="dialog"]',
        '.artdeco-modal-overlay .artdeco-modal',
        '[role="dialog"][aria-labelledby="pv-contact-info"]',
        '[role="dialog"]',
        '.artdeco-modal',
        '.contact-info-modal'
      ];
      
      for (const selector of modalSelectors) {
        const foundModal = document.querySelector(selector);
        if (foundModal && (foundModal.textContent.includes('Contact Info') || foundModal.querySelector('.pv-contact-info__contact-type'))) {
          modal = foundModal;
          console.log('✅ Found contact info modal with selector:', selector);
          break;
        }
      }
    }
    
    if (!modal) {
      console.log('❌ No contact info modal found');
      return;
    }
    
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
        console.log('📝 Section text:', sectionText);
        
        // Method 1: Look for phone links (tel:)
        const phoneLinks = section.querySelectorAll('a[href^="tel:"]');
        if (phoneLinks.length > 0) {
          const phoneFromLink = phoneLinks[0].textContent.trim();
          console.log('📞 Found phone link:', phoneFromLink);
          if (phoneFromLink && isValidPhone(phoneFromLink)) {
            profile.phone = phoneFromLink;
            console.log('✅ Phone extracted from tel link:', profile.phone);
          }
        }
        
        // Method 2: Look for phone number patterns in text
        if (!profile.phone) {
          // Enhanced patterns - prioritize numbers starting with +
          const phonePatterns = [
            /\+\d{1,4}[\s\-]?\d{6,12}/g, // International with + (like +972 526164030)
            /\+\d{1,3}[\s\-]?\(?\d{1,4}\)?[\s\-]?\d{1,4}[\s\-]?\d{1,9}/g, // International flexible
            /\(\d{3}\)[\s\-]?\d{3}[\s\-]?\d{4}/g, // US format (555) 555-5555
            /\b\d{3}[\s\-]?\d{3}[\s\-]?\d{4}\b/g, // US format 555-555-5555
            /\b05\d{1}[\s\-]?\d{3}[\s\-]?\d{4}\b/g // Israeli mobile
          ];
          
          for (const pattern of phonePatterns) {
            const phones = sectionText.match(pattern);
            if (phones && phones.length > 0) {
              // Prioritize numbers starting with + as they're more likely real
              const sortedPhones = phones.sort((a, b) => {
                if (a.startsWith('+') && !b.startsWith('+')) return -1;
                if (!a.startsWith('+') && b.startsWith('+')) return 1;
                return 0;
              });
              
              for (const phone of sortedPhones) {
                const cleanPhone = phone.trim();
                const digits = cleanPhone.replace(/\D/g, '');
                
                console.log('🔍 Checking phone candidate:', cleanPhone, 'digits:', digits.length);
                
                // More lenient for international numbers with +
                if (cleanPhone.startsWith('+')) {
                  // International numbers can be 7-15 digits
                  if (digits.length >= 7 && digits.length <= 15) {
                    profile.phone = cleanPhone;
                    console.log('✅ International phone extracted:', profile.phone);
                    break;
                  }
                } else if (digits.length >= 10 && digits.length <= 12 && isValidPhone(cleanPhone)) {
                  profile.phone = cleanPhone;
                  console.log('✅ Phone extracted from section:', profile.phone);
                  break;
                } else {
                  console.log('⚠️ Rejected phone candidate:', cleanPhone, 'digits:', digits.length);
                }
              }
              if (profile.phone) break;
            }
          }
        }
      }
      
      // Website Section Processing
      else if (headerText.toLowerCase().includes('website')) {
        console.log('🌐 Processing website section...');
        console.log('📝 Section text:', sectionText);
        
        // Method 1: Extract from href attributes
        const websiteLinks = section.querySelectorAll('a[href]:not([href^="mailto:"])');
        for (const link of websiteLinks) {
          const url = link.href;
          if (url && !url.includes('linkedin.com') && !url.includes('lnkd.in') && !url.includes('javascript:') && isValidWebsite(url)) {
            profile.website = url;
            console.log('✅ Website extracted from link:', profile.website);
            break;
          }
        }
        
        // Method 2: Look for any link text that might be a website
        if (!profile.website) {
          const allLinks = section.querySelectorAll('a');
          for (const link of allLinks) {
            const linkText = link.textContent.trim();
            // Check if the link text looks like a domain
            if (linkText && linkText.includes('.') && !linkText.includes('@')) {
              // Add https:// if not present
              const url = linkText.startsWith('http') ? linkText : 'https://' + linkText;
              if (isValidWebsite(url)) {
                profile.website = url;
                console.log('✅ Website extracted from link text:', profile.website);
                break;
              }
            }
          }
        }
        
        // Method 3: Extract from text content with flexible patterns
        if (!profile.website) {
          // Look for URLs with or without protocol
          const websitePatterns = [
            /https?:\/\/[^\s\)\]\}\"\']+/g,  // With protocol
            /(?:^|\s)([a-zA-Z0-9][a-zA-Z0-9-_]*\.)*[a-zA-Z0-9][a-zA-Z0-9-_]*\.[a-zA-Z]{2,11}(?:\/[^\s]*)?/g  // Domain patterns
          ];
          
          for (const pattern of websitePatterns) {
            const websites = sectionText.match(pattern);
            if (websites && websites.length > 0) {
              for (let website of websites) {
                website = website.trim();
                // Skip if it's an email
                if (website.includes('@')) continue;
                // Skip common non-website text
                if (website === 'Aug 26' || website === 'Sep 16' || website.includes('..')) continue;
                
                // Add https:// if not present
                if (!website.startsWith('http')) {
                  website = 'https://' + website;
                }
                
                if (isValidWebsite(website)) {
                  profile.website = website;
                  console.log('✅ Website extracted from section text:', profile.website);
                  break;
                }
              }
              if (profile.website) break;
            }
          }
        }
      }
      
      // LinkedIn Profile Section (for reference)
      else if (headerText.toLowerCase().includes('profile') || headerText.toLowerCase().includes('linkedin')) {
        console.log('🔗 Processing LinkedIn profile section...');
        const linkedinLinks = section.querySelectorAll('a[href*="linkedin.com"]');
        if (linkedinLinks.length > 0) {
          console.log('🔗 LinkedIn profile link confirmed:', linkedinLinks[0].href);
        }
      }
    }
    
    // **FALLBACK: Generic text extraction** if structured approach didn't work
    if (!profile.email && !profile.phone && !profile.website) {
      console.log('⚠️ Structured extraction failed, trying generic text extraction...');
      
      // Generic email extraction
      const emailPattern = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;
      const emails = modalText.match(emailPattern);
      if (emails) {
        const validEmail = emails.find(email => isValidEmail(email));
        if (validEmail) {
          profile.email = validEmail;
          console.log('✅ Email from fallback extraction:', profile.email);
        }
      }
      
      // Generic mailto link extraction
      const modalEmailLinks = modal.querySelectorAll('a[href^="mailto:"]');
      if (modalEmailLinks.length > 0 && !profile.email) {
        const emailFromLink = modalEmailLinks[0].href.substring(7);
        if (emailFromLink && isValidEmail(emailFromLink)) {
          profile.email = emailFromLink;
          console.log('✅ Email from fallback mailto link:', profile.email);
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
}

// Helper function to validate email addresses
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

// Helper function to validate website URLs
function isValidWebsite(url) {
  if (!url || typeof url !== 'string') return false;
  
  // Filter out LinkedIn, social media, URL shorteners, and event platforms
  const blacklist = [
    'linkedin.com', 'lnkd.in', // LinkedIn and its shortlinks
    'facebook.com', 'twitter.com', 'instagram.com', 'youtube.com', 'tiktok.com', 'snapchat.com',
    'bit.ly', 'tinyurl.com', 'ow.ly', 'buff.ly', // URL shorteners
    'calendly.com', 'lu.ma', 'eventbrite.com', 'meetup.com', 'zoom.us', // Event platforms
    'teams.microsoft.com', 'whereby.com', 'meet.google.com' // Meeting platforms
  ];
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

// Helper function to validate US area codes
function isValidUSAreaCode(areaCode) {
  const code = parseInt(areaCode);
  // Valid US area codes: 201-999, but exclude N11 patterns
  if (code < 201 || code > 999) return false;
  if (areaCode.endsWith('11')) return false; // Exclude 211, 311, 411, etc.
  
  // Common invalid/test area codes
  const invalidCodes = ['555', '000', '001', '999'];
  return !invalidCodes.includes(areaCode);
}

// Helper function to validate phone numbers - very strict to avoid false matches
function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  
  const cleaned = phone.replace(/\D/g, '');
  
  // **SPECIAL HANDLING FOR + PREFIX**: Numbers starting with + are likely real
  if (phone.trim().startsWith('+')) {
    // International numbers with + are usually legitimate
    // Accept 7-15 digits for international
    if (cleaned.length >= 7 && cleaned.length <= 15) {
      console.log('✅ Valid international phone with +:', phone);
      return true;
    }
    console.log('⚠️ Rejecting + number with invalid length:', cleaned.length);
    return false;
  }
  
  // **STRICT VALIDATION FOR NON-+ NUMBERS**: Reject obviously invalid numbers
  
  // Must be 7-15 digits (international phone range)
  if (cleaned.length < 7 || cleaned.length > 15) {
    console.log('⚠️ Rejecting phone - invalid length:', cleaned.length);
    return false;
  }
  
  // Reject timestamps (13+ digits that look like Unix timestamps)
  if (cleaned.length >= 13) {
    const asNumber = parseInt(cleaned);
    const currentTimestamp = Date.now();
    const yearInMs = 365 * 24 * 60 * 60 * 1000;
    
    if (asNumber > 946684800000 && asNumber < currentTimestamp + (10 * yearInMs)) {
      console.log('⚠️ Rejecting phone - detected as timestamp:', cleaned);
      return false;
    }
  }
  
  // US phone number validation (1 + area code + 7 digits)
  if (cleaned.length === 10 && cleaned.startsWith('1')) {
    // This is actually 9 digits with leading 1 - invalid US format
    console.log('⚠️ Rejecting phone - invalid US format (10 digits starting with 1):', cleaned);
    return false;
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    const areaCode = cleaned.substring(1, 4);
    if (!isValidUSAreaCode(areaCode)) {
      console.log('⚠️ Rejecting phone - invalid US area code:', areaCode);
      return false;
    }
  }
  
  // Reject numbers that are clearly not phones (like Ohad's 1852884267)
  // Check US numbers more carefully
  if (cleaned.length === 10) {
    // 10-digit number could be US without country code
    const firstThree = cleaned.substring(0, 3);
    // US area codes start with 2-9, not 0 or 1
    if (cleaned.startsWith('1') || cleaned.startsWith('0')) {
      console.log('⚠️ Rejecting 10-digit number starting with 0 or 1:', cleaned);
      return false;
    }
    // Check if it's a valid US area code
    if (!isValidUSAreaCode(firstThree)) {
      console.log('⚠️ Rejecting phone - invalid US area code:', firstThree);
      return false;
    }
  }
  
  // Reject numbers that are clearly not phone numbers
  const invalidPatterns = [
    /^0+$/, // All zeros
    /^1+$/, // All ones  
    /^(.)\1{9,}$/, // Same digit repeated too many times
    /^1234567890$/, // Sequential numbers
    /^0987654321$/, // Reverse sequential
    /^[0-9]{13,}$/, // Too long (over 12 digits)
    /^[0-9]{1,9}$/, // Too short (under 10 digits)
  ];
  
  if (invalidPatterns.some(pattern => pattern.test(cleaned))) {
    return false;
  }
  
  // Additional checks for suspicious long numbers (like 1756214583859)
  if (cleaned.length > 12) {
    console.log('⚠️ Rejecting phone number too long:', cleaned, 'length:', cleaned.length);
    return false;
  }
  
  // If it looks like a timestamp or ID (very large number), reject it
  if (cleaned.length > 11 && parseInt(cleaned) > 99999999999) {
    console.log('⚠️ Rejecting phone number - looks like timestamp/ID:', cleaned);
    return false;
  }
  
  return true;
}

// Function to close the Contact Info modal - enhanced for artdeco modals
function closeContactInfoModal() {
  console.log('🔍 Attempting to close Contact Info modal...');
  
  // Enhanced close button selectors based on examples analysis
  const closeSelectors = [
    // Specific artdeco modal dismiss button from examples
    '.artdeco-modal__dismiss[data-test-modal-close-btn]',
    '.artdeco-modal__dismiss',
    'button[aria-label="Dismiss"]',
    // Alternative selectors
    '[data-test-modal-close-btn]',
    '.artdeco-modal-overlay button[aria-label*="Dismiss"]',
    '.artdeco-modal button[aria-label*="Close"]',
    // Generic fallbacks
    '[aria-label*="Dismiss"]', 
    '[aria-label*="Close"]',
    'button[aria-label*="Dismiss"]', 
    'button[aria-label*="Close"]',
    'button:has(svg[data-test-icon="close-medium"])',
    'button:has(svg[data-test-icon="close-small"])',
    '[role="dialog"] button:first-child',
    '.modal-header button'
  ];
  
  for (const selector of closeSelectors) {
    const closeBtn = document.querySelector(selector);
    if (closeBtn) {
      console.log('✅ Found close button with selector:', selector);
      console.log('Close button element:', closeBtn);
      
      // Try clicking the button
      try {
        closeBtn.click();
        console.log('✅ Contact Info modal close button clicked');
        
        // Wait a moment and verify modal is closed
        setTimeout(() => {
          const modal = document.querySelector('.artdeco-modal-overlay, [role="dialog"]');
          if (!modal) {
            console.log('✅ Modal successfully closed');
          } else {
            console.log('⚠️ Modal still visible after close attempt');
          }
        }, 500);
        
        return true;
      } catch (error) {
        console.warn('⚠️ Error clicking close button:', error);
        continue;
      }
    }
  }
  
  // Enhanced fallback - try clicking on overlay to close
  console.log('⚠️ No close button found, trying overlay click...');
  const overlay = document.querySelector('.artdeco-modal-overlay');
  if (overlay) {
    try {
      overlay.click();
      console.log('✅ Clicked modal overlay to close');
      return true;
    } catch (error) {
      console.warn('⚠️ Error clicking overlay:', error);
    }
  }
  
  // Try pressing Escape key as final fallback
  console.log('⚠️ Trying Escape key as final fallback...');
  try {
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      bubbles: true
    }));
    
    // Also try dispatching to the modal specifically
    const modal = document.querySelector('.artdeco-modal, [role="dialog"]');
    if (modal) {
      modal.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape', 
        keyCode: 27,
        bubbles: true
      }));
    }
    
    console.log('✅ Sent Escape key to close modal');
    return true;
  } catch (error) {
    console.error('❌ Error sending escape key:', error);
  }
  
  console.log('❌ Failed to close modal with all methods');
  return false;
}

// Add simple sync button
function addSimpleSyncButton() {
  // Remove old button if exists
  const existingButton = document.getElementById('linkedin-simple-button');
  if (existingButton) {
    existingButton.remove();
  }
  
  const button = document.createElement('button');
  button.id = 'linkedin-simple-button';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10000;
    background: #0077b5;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0, 119, 181, 0.4);
  `;
  button.innerHTML = '📇 Add to Contacts';
  
  button.addEventListener('click', async () => {
    console.log('🚀 Sync button clicked');
    button.disabled = true;
    button.innerHTML = '⏳ Extracting...';
    
    try {
      console.log('🔍 Starting profile extraction...');
      const profileData = extractProfileSimple();
      console.log('📊 Extracted profile data:', profileData);
      
      if (!profileData || !profileData.fullName) {
        console.error('❌ Profile extraction failed - no name found');
        throw new Error('Could not extract profile name - make sure you are on a LinkedIn profile page');
      }
      
      console.log('✅ Profile extraction successful, sending to background...');
      button.innerHTML = '🔍 Searching contacts...';
      
      // Send to background for processing
      console.log('📤 Sending message to background script...');
      const response = await chrome.runtime.sendMessage({
        action: 'syncToContacts',
        profileData: profileData
      });
      
      console.log('📨 Response from background:', response);
      
      if (response && response.success) {
        console.log('✅ Background processing successful');
        button.innerHTML = '✅ Success!';
        button.style.background = '#059669';
        // Don't show alert - let the helper panel handle user feedback
        console.log(`Success! ${response.message}`);
      } else {
        console.error('❌ Background processing failed:', response);
        throw new Error(response?.error || 'Sync failed - no response from background script');
      }
      
    } catch (error) {
      console.error('❌ Sync error:', error);
      button.innerHTML = '❌ Failed';
      button.style.background = '#dc2626';
      alert(`Error: ${error.message}`);
    } finally {
      setTimeout(() => {
        button.innerHTML = '📇 Add to Contacts';
        button.style.background = '#0077b5';
        button.disabled = false;
      }, 3000);
    }
  });
  
  document.body.appendChild(button);
  console.log('✅ Simple sync button added');
}

// Initialize
setTimeout(() => {
  addSimpleSyncButton();
  // Also run extraction to test
  extractProfileSimple();
}, 2000);

console.log('✅ Simple extractor ready - look for floating button in bottom-right');