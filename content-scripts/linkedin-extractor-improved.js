// LinkedIn Profile Extractor with Confidence Scoring
// This improved version includes confidence scoring for extracted data

// Confidence levels
const CONFIDENCE = {
  HIGH: 100,
  MEDIUM: 75,
  LOW: 50,
  VERY_LOW: 25
};

// Event platforms to exclude from website extraction
const EVENT_PLATFORMS = [
  'lu.ma', 'calendly.com', 'eventbrite.com', 'meetup.com', 
  'zoom.us', 'teams.microsoft.com', 'whereby.com', 'meet.google.com',
  'crowdcast.io', 'hopin.com', 'airmeet.com', 'bizzabo.com',
  'cvent.com', 'whova.com', 'accelevents.com', 'hubilo.com'
];

// Social media platforms to exclude
const SOCIAL_PLATFORMS = [
  'linkedin.com', 'facebook.com', 'twitter.com', 'instagram.com', 
  'youtube.com', 'tiktok.com', 'snapchat.com', 'pinterest.com',
  'reddit.com', 'medium.com', 'dev.to', 'github.com'
];

// Enhanced data structure with confidence scores
class ExtractedProfile {
  constructor() {
    this.data = {
      name: { value: '', confidence: 0 },
      title: { value: '', confidence: 0 },
      currentEmployer: { value: '', confidence: 0 },
      location: { value: '', confidence: 0 },
      email: { value: '', confidence: 0 },
      phone: { value: '', confidence: 0 },
      website: { value: '', confidence: 0 },
      profileUrl: { value: '', confidence: 0 },
      about: { value: '', confidence: 0 },
      experience: { value: [], confidence: 0 },
      education: { value: [], confidence: 0 }
    };
  }

  setField(field, value, confidence) {
    if (this.data[field]) {
      // Only update if new confidence is higher or field is empty
      if (!this.data[field].value || confidence > this.data[field].confidence) {
        this.data[field].value = value;
        this.data[field].confidence = confidence;
      }
    }
  }

  getField(field) {
    return this.data[field] ? this.data[field].value : '';
  }

  getConfidence(field) {
    return this.data[field] ? this.data[field].confidence : 0;
  }

  // Get fields that need user approval (confidence < 100)
  getFieldsNeedingApproval() {
    const fields = [];
    for (const [key, data] of Object.entries(this.data)) {
      if (data.value && data.confidence < CONFIDENCE.HIGH) {
        fields.push({
          field: key,
          value: data.value,
          confidence: data.confidence,
          reason: this.getConfidenceReason(key, data.confidence)
        });
      }
    }
    return fields;
  }

  getConfidenceReason(field, confidence) {
    if (field === 'phone') {
      if (confidence <= CONFIDENCE.LOW) {
        return 'Unusual phone number format or length';
      } else if (confidence <= CONFIDENCE.MEDIUM) {
        return 'Phone number format needs verification';
      }
    } else if (field === 'website') {
      if (confidence <= CONFIDENCE.LOW) {
        return 'URL appears to be an event or temporary link';
      } else if (confidence <= CONFIDENCE.MEDIUM) {
        return 'Website URL needs verification';
      }
    } else if (field === 'email') {
      if (confidence <= CONFIDENCE.MEDIUM) {
        return 'Email format needs verification';
      }
    }
    return 'Data extraction confidence is below 100%';
  }

  // Convert to simple object for compatibility
  toSimpleObject() {
    const simple = {};
    for (const [key, data] of Object.entries(this.data)) {
      simple[key] = data.value;
    }
    return simple;
  }

  // Get detailed extraction report
  getExtractionReport() {
    const report = {
      timestamp: new Date().toISOString(),
      extractedData: {},
      confidenceScores: {},
      needsApproval: []
    };

    for (const [key, data] of Object.entries(this.data)) {
      if (data.value) {
        report.extractedData[key] = data.value;
        report.confidenceScores[key] = data.confidence;
        if (data.confidence < CONFIDENCE.HIGH) {
          report.needsApproval.push(key);
        }
      }
    }

    return report;
  }
}

// Enhanced phone validation with confidence scoring
function validatePhoneWithConfidence(phone) {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, confidence: 0 };
  }

  const cleaned = phone.replace(/\D/g, '');
  
  // Check for timestamp patterns (13+ digits, starts with 1 and looks like Unix timestamp)
  if (cleaned.length >= 13) {
    const asNumber = parseInt(cleaned);
    // Check if it could be a Unix timestamp (milliseconds since 1970)
    const currentTimestamp = Date.now();
    const yearInMs = 365 * 24 * 60 * 60 * 1000;
    
    // If the number is between 2000 and 2030 as a timestamp, it's likely not a phone
    if (asNumber > 946684800000 && asNumber < currentTimestamp + (10 * yearInMs)) {
      console.log('⚠️ Detected timestamp pattern:', cleaned);
      return { isValid: false, confidence: 0, reason: 'Timestamp detected' };
    }
  }

  // Length validation
  if (cleaned.length < 7) {
    return { isValid: false, confidence: 0, reason: 'Too short' };
  }
  
  if (cleaned.length > 15) {
    return { isValid: false, confidence: 0, reason: 'Too long' };
  }

  // Check for obviously invalid patterns
  const invalidPatterns = [
    /^0+$/,           // All zeros
    /^1+$/,           // All ones  
    /^(.)\1{6,}$/,    // Same digit repeated too many times
    /^1234567890$/,   // Sequential numbers
    /^0987654321$/,   // Reverse sequential
  ];
  
  for (const pattern of invalidPatterns) {
    if (pattern.test(cleaned)) {
      return { isValid: false, confidence: 0, reason: 'Invalid pattern' };
    }
  }

  // Confidence scoring based on format
  let confidence = CONFIDENCE.LOW;
  
  // Check for international format with country code
  if (/^\+\d{1,3}/.test(phone)) {
    confidence = CONFIDENCE.HIGH;
  }
  // US/Canada format with parentheses
  else if (/^\(\d{3}\)\s?\d{3}-?\d{4}$/.test(phone)) {
    confidence = CONFIDENCE.HIGH;
  }
  // Standard 10-digit formats
  else if (cleaned.length === 10) {
    confidence = CONFIDENCE.MEDIUM;
  }
  // 11 digits (likely with country code)
  else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    confidence = CONFIDENCE.MEDIUM;
  }
  // International numbers (7-15 digits)
  else if (cleaned.length >= 7 && cleaned.length <= 15) {
    confidence = CONFIDENCE.LOW;
  }

  // Additional validation for Israeli numbers (since examples are from Israel)
  if (cleaned.startsWith('972') && cleaned.length === 12) {
    confidence = CONFIDENCE.HIGH; // Israeli international format
  } else if (cleaned.startsWith('05') && cleaned.length === 10) {
    confidence = CONFIDENCE.HIGH; // Israeli mobile format
  }

  return { 
    isValid: true, 
    confidence: confidence,
    cleaned: cleaned,
    formatted: phone
  };
}

// Enhanced website validation with confidence scoring
function validateWebsiteWithConfidence(url) {
  if (!url || typeof url !== 'string') {
    return { isValid: false, confidence: 0 };
  }

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname.toLowerCase();
    
    // Check if it's a social platform
    for (const platform of SOCIAL_PLATFORMS) {
      if (hostname.includes(platform)) {
        return { isValid: false, confidence: 0, reason: 'Social media platform' };
      }
    }

    // Check if it's an event platform with lower confidence
    for (const platform of EVENT_PLATFORMS) {
      if (hostname.includes(platform)) {
        // Event links get low confidence but are still valid
        return { 
          isValid: true, 
          confidence: CONFIDENCE.LOW, 
          reason: 'Event/meeting platform - may be temporary',
          url: url
        };
      }
    }

    // Check for event URL patterns
    const eventPatterns = [
      /\/event\//,
      /\/meeting\//,
      /\/webinar\//,
      /\/register/,
      /\/invite\//,
      /\/join\//,
      /\/[a-z0-9]{8,12}$/  // Short random IDs often used for events
    ];

    for (const pattern of eventPatterns) {
      if (pattern.test(pathname)) {
        return { 
          isValid: true, 
          confidence: CONFIDENCE.LOW, 
          reason: 'Appears to be an event/meeting link',
          url: url
        };
      }
    }

    // High confidence for personal/company domains
    const personalDomainPatterns = [
      /^(www\.)?[a-z0-9-]+\.(com|org|net|io|co|me|dev|tech|ai)$/i,
      /portfolio/i,
      /personal/i,
      /blog/i
    ];

    let confidence = CONFIDENCE.MEDIUM;
    
    for (const pattern of personalDomainPatterns) {
      if (pattern.test(hostname) || pattern.test(pathname)) {
        confidence = CONFIDENCE.HIGH;
        break;
      }
    }

    return { 
      isValid: true, 
      confidence: confidence,
      url: url
    };

  } catch (error) {
    return { isValid: false, confidence: 0, reason: 'Invalid URL format' };
  }
}

// Enhanced email validation with confidence scoring
function validateEmailWithConfidence(email) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, confidence: 0 };
  }

  const emailLower = email.toLowerCase();
  
  // Filter out system/non-personal emails
  const blacklist = ['noreply', 'no-reply', 'donotreply', 'support', 'help', 'info', 'admin', 'notification', 'system'];
  
  for (const term of blacklist) {
    if (emailLower.includes(term)) {
      return { isValid: false, confidence: 0, reason: 'System/non-personal email' };
    }
  }

  // Basic email format validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, confidence: 0, reason: 'Invalid email format' };
  }

  // Check for corporate email domains (higher confidence)
  const corporateDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'];
  const domain = email.split('@')[1].toLowerCase();
  
  let confidence = CONFIDENCE.HIGH;
  
  // Personal email domains get high confidence
  if (corporateDomains.includes(domain)) {
    confidence = CONFIDENCE.HIGH;
  }
  // Company domains also get high confidence
  else if (!domain.includes('example') && !domain.includes('test')) {
    confidence = CONFIDENCE.HIGH;
  }

  return { 
    isValid: true, 
    confidence: confidence,
    email: email
  };
}

// Main extraction function with confidence scoring
function extractProfileDataWithConfidence() {
  console.log('🚀 Starting enhanced LinkedIn profile extraction with confidence scoring...');
  
  const profile = new ExtractedProfile();
  
  // Extract basic profile information
  extractBasicInfoWithConfidence(profile);
  
  // Extract contact information with confidence
  extractContactInfoWithConfidence(profile);
  
  // Generate extraction report
  const report = profile.getExtractionReport();
  console.log('📊 Extraction Report:', report);
  
  // Check if any fields need approval
  const needsApproval = profile.getFieldsNeedingApproval();
  if (needsApproval.length > 0) {
    console.log('⚠️ Fields needing user approval:', needsApproval);
    // This would trigger the user approval flow
    requestUserApproval(needsApproval, profile);
  }
  
  return profile;
}

// Extract basic profile info with confidence scoring
function extractBasicInfoWithConfidence(profile) {
  // Name extraction (usually high confidence)
  const nameSelectors = [
    'h1.text-heading-xlarge',
    '[data-anonymize="person-name"]',
    '.pv-top-card--list li:first-child'
  ];
  
  for (const selector of nameSelectors) {
    const nameElement = document.querySelector(selector);
    if (nameElement) {
      const name = nameElement.textContent.trim();
      if (name) {
        profile.setField('name', name, CONFIDENCE.HIGH);
        break;
      }
    }
  }
  
  // Title/Headline extraction
  const headlineSelectors = [
    '[data-generated-suggestion-target="urn:li:fsu_profileActionDelegate"]',
    '.text-body-medium.break-words',
    'div.text-body-medium'
  ];
  
  for (const selector of headlineSelectors) {
    const headlineElement = document.querySelector(selector);
    if (headlineElement) {
      const headline = headlineElement.textContent.trim();
      if (headline) {
        // Parse headline to extract title and company
        parseHeadlineWithConfidence(headline, profile);
        break;
      }
    }
  }
  
  // Location extraction
  const locationSelectors = [
    'span.text-body-small.inline.t-black--light.break-words',
    '.pv-top-card--list-bullet li:nth-child(2)',
    '[data-anonymize="location"]'
  ];
  
  for (const selector of locationSelectors) {
    const locationElement = document.querySelector(selector);
    if (locationElement) {
      const location = locationElement.textContent.trim();
      if (location && !location.includes('Connection') && !location.includes('follower')) {
        profile.setField('location', location, CONFIDENCE.HIGH);
        break;
      }
    }
  }
}

// Parse headline to extract title and company with confidence
function parseHeadlineWithConfidence(headline, profile) {
  if (!headline) return;
  
  // Common patterns for job titles
  const patterns = [
    /^(.+?)\s+@\s+(.+)$/,           // "CEO @ Company"
    /^(.+?)\s+at\s+(.+)$/i,         // "CEO at Company"
    /^(.+?)\s*\|\s*(.+)$/,          // "CEO | Company"
    /^(.+?)\s*-\s*(.+)$/,           // "CEO - Company"
  ];
  
  for (const pattern of patterns) {
    const match = headline.match(pattern);
    if (match) {
      const title = match[1].trim();
      const company = match[2].trim();
      
      profile.setField('title', title, CONFIDENCE.HIGH);
      profile.setField('currentEmployer', company, CONFIDENCE.HIGH);
      return;
    }
  }
  
  // If no pattern matches, use the full headline as title with medium confidence
  profile.setField('title', headline, CONFIDENCE.MEDIUM);
}

// Extract contact info with confidence scoring
function extractContactInfoWithConfidence(profile) {
  // Try to find and click Contact Info button
  const contactInfoButton = findContactInfoButton();
  
  if (contactInfoButton) {
    console.log('📋 Found Contact Info button, attempting to extract...');
    
    // Click and wait for modal
    contactInfoButton.click();
    
    // Wait for modal to appear and extract
    setTimeout(() => {
      extractFromContactModalWithConfidence(profile);
    }, 1500);
  } else {
    console.log('⚠️ Contact Info button not found, using fallback extraction...');
    extractVisibleContactWithConfidence(profile);
  }
}

// Extract from Contact Info modal with confidence scoring
function extractFromContactModalWithConfidence(profile) {
  const modal = document.querySelector('.artdeco-modal[role="dialog"]');
  
  if (!modal) {
    console.log('❌ Contact modal not found');
    return;
  }
  
  // Look for structured sections in the modal
  const sections = modal.querySelectorAll('section, div[class*="pv-contact-info"]');
  
  for (const section of sections) {
    const headerElement = section.querySelector('h3, h2, [class*="header"]');
    if (!headerElement) continue;
    
    const headerText = headerElement.textContent.toLowerCase().trim();
    const sectionText = section.textContent || '';
    
    // Phone extraction
    if (headerText.includes('phone')) {
      extractPhoneFromSection(section, sectionText, profile);
    }
    
    // Email extraction
    else if (headerText.includes('email')) {
      extractEmailFromSection(section, sectionText, profile);
    }
    
    // Website extraction
    else if (headerText.includes('website')) {
      extractWebsiteFromSection(section, sectionText, profile);
    }
  }
  
  // Close modal after extraction
  closeContactModal();
}

// Extract phone from section with confidence
function extractPhoneFromSection(section, text, profile) {
  // Look for phone links first
  const phoneLinks = section.querySelectorAll('a[href^="tel:"]');
  if (phoneLinks.length > 0) {
    const phone = phoneLinks[0].textContent.trim();
    const validation = validatePhoneWithConfidence(phone);
    if (validation.isValid) {
      profile.setField('phone', phone, validation.confidence);
      return;
    }
  }
  
  // Look for phone patterns in text
  const phonePatterns = [
    /\+\d{1,3}[\s\-]?\(?\d{1,4}\)?[\s\-]?\d{1,4}[\s\-]?\d{1,9}/g,
    /\(\d{3}\)[\s\-]?\d{3}[\s\-]?\d{4}/g,
    /\d{3}[\s\-]?\d{3}[\s\-]?\d{4}/g
  ];
  
  for (const pattern of phonePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        const validation = validatePhoneWithConfidence(match);
        if (validation.isValid) {
          profile.setField('phone', match, validation.confidence);
          return;
        }
      }
    }
  }
}

// Extract email from section with confidence
function extractEmailFromSection(section, text, profile) {
  // Look for mailto links first
  const emailLinks = section.querySelectorAll('a[href^="mailto:"]');
  if (emailLinks.length > 0) {
    const email = emailLinks[0].href.substring(7);
    const validation = validateEmailWithConfidence(email);
    if (validation.isValid) {
      profile.setField('email', email, validation.confidence);
      return;
    }
  }
  
  // Look for email patterns in text
  const emailPattern = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;
  const matches = text.match(emailPattern);
  
  if (matches) {
    for (const match of matches) {
      const validation = validateEmailWithConfidence(match);
      if (validation.isValid) {
        profile.setField('email', match, validation.confidence);
        return;
      }
    }
  }
}

// Extract website from section with confidence
function extractWebsiteFromSection(section, text, profile) {
  // Look for links first
  const links = section.querySelectorAll('a[href]');
  for (const link of links) {
    const url = link.href;
    const validation = validateWebsiteWithConfidence(url);
    if (validation.isValid) {
      profile.setField('website', url, validation.confidence);
      if (validation.confidence >= CONFIDENCE.MEDIUM) {
        return; // Stop if we found a good website
      }
    }
  }
  
  // Look for URL patterns in text
  const urlPattern = /https?:\/\/[^\s\)\]\}\"\']+/g;
  const matches = text.match(urlPattern);
  
  if (matches) {
    for (const match of matches) {
      const validation = validateWebsiteWithConfidence(match);
      if (validation.isValid) {
        // Only update if confidence is higher than current
        const currentConfidence = profile.getConfidence('website');
        if (validation.confidence > currentConfidence) {
          profile.setField('website', match, validation.confidence);
        }
      }
    }
  }
}

// Fallback extraction from visible content with confidence
function extractVisibleContactWithConfidence(profile) {
  const pageText = document.body.textContent || '';
  
  // Try to extract email
  const emailPattern = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;
  const emails = pageText.match(emailPattern);
  
  if (emails) {
    for (const email of emails) {
      const validation = validateEmailWithConfidence(email);
      if (validation.isValid) {
        profile.setField('email', email, validation.confidence);
        break;
      }
    }
  }
  
  // Try to extract phone - with strict validation
  const phonePatterns = [
    /\+\d{1,3}[\s\-]?\(?\d{1,4}\)?[\s\-]?\d{1,4}[\s\-]?\d{1,9}/g,
    /\(\d{3}\)[\s\-]?\d{3}[\s\-]?\d{4}/g,
    /\d{3}[\s\-]?\d{3}[\s\-]?\d{4}/g
  ];
  
  for (const pattern of phonePatterns) {
    const phones = pageText.match(pattern);
    if (phones) {
      for (const phone of phones) {
        const validation = validatePhoneWithConfidence(phone);
        if (validation.isValid) {
          profile.setField('phone', phone, validation.confidence);
          break;
        }
      }
    }
  }
  
  // Try to extract website
  const urlPattern = /https?:\/\/[^\s\)\]\}\"\']+/g;
  const urls = pageText.match(urlPattern);
  
  if (urls) {
    let bestWebsite = null;
    let bestConfidence = 0;
    
    for (const url of urls) {
      const validation = validateWebsiteWithConfidence(url);
      if (validation.isValid && validation.confidence > bestConfidence) {
        bestWebsite = url;
        bestConfidence = validation.confidence;
      }
    }
    
    if (bestWebsite) {
      profile.setField('website', bestWebsite, bestConfidence);
    }
  }
}

// Helper function to find Contact Info button
function findContactInfoButton() {
  const selectors = [
    '#top-card-text-details-contact-info',
    'a[data-control-name="contact_see_more"]',
    'button[aria-label*="Contact info"]',
    'button:has-text("Contact info")',
    'a:has-text("Contact info")'
  ];
  
  for (const selector of selectors) {
    const button = document.querySelector(selector);
    if (button) return button;
  }
  
  return null;
}

// Close contact modal
function closeContactModal() {
  const closeButton = document.querySelector('.artdeco-modal__dismiss');
  if (closeButton) {
    closeButton.click();
  }
}

// Request user approval for low confidence fields
function requestUserApproval(fieldsNeedingApproval, profile) {
  // This function would integrate with the extension's UI
  // to show fields that need approval
  console.log('🔍 Requesting user approval for:', fieldsNeedingApproval);
  
  // Send message to service worker with fields needing approval
  chrome.runtime.sendMessage({
    action: 'REQUEST_APPROVAL',
    data: {
      profile: profile.toSimpleObject(),
      confidenceScores: profile.data,
      needsApproval: fieldsNeedingApproval
    }
  });
}

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    extractProfileDataWithConfidence,
    ExtractedProfile,
    validatePhoneWithConfidence,
    validateWebsiteWithConfidence,
    validateEmailWithConfidence
  };
}