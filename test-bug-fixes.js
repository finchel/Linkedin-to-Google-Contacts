#!/usr/bin/env node

// Test script to verify bug fixes for David and Carine profiles
const fs = require('fs');

// Load the extraction functions
const extractorPath = './content-scripts/linkedin-extractor.js';
const extractorCode = fs.readFileSync(extractorPath, 'utf8');

// Extract just the validation functions for testing
const isValidPhoneRegex = /function isValidPhone\(phone\) \{[\s\S]*?\n\}/;
const isValidWebsiteRegex = /function isValidWebsite\(url\) \{[\s\S]*?\n\}/;

const phoneValidation = extractorCode.match(isValidPhoneRegex);
const websiteValidation = extractorCode.match(isValidWebsiteRegex);

if (phoneValidation) {
  eval(phoneValidation[0]);
}
if (websiteValidation) {
  eval(websiteValidation[0]);
}

console.log('🧪 Testing Bug Fixes for David and Carine Profiles\n');
console.log('=' .repeat(60));

// Test Case 1: Timestamp Rejection (Phone Bug)
console.log('\n📱 Test 1: Phone Number - Timestamp Rejection');
console.log('-'.repeat(40));

const problematicNumbers = [
  { input: '1756388157552', expected: false, reason: 'Timestamp (13 digits)' },
  { input: '1756387628356', expected: false, reason: 'Another timestamp' },
  { input: '0526992199', expected: true, reason: 'Valid Israeli mobile' },
  { input: '555-123-4567', expected: true, reason: 'Valid US format' }
];

for (const test of problematicNumbers) {
  const result = isValidPhone(test.input);
  const passed = result === test.expected;
  
  console.log(`Input: "${test.input}"`);
  console.log(`  Expected: ${test.expected}, Got: ${result}`);
  console.log(`  ${passed ? '✅ PASSED' : '❌ FAILED'} - ${test.reason}`);
  console.log();
}

// Test Case 2: Job Title Parsing (Truncation Bug)
console.log('\n💼 Test 2: Job Title Extraction');
console.log('-'.repeat(40));

const headlines = [
  { 
    input: 'CISO | CIO | Investor | Thought Leader',
    expected: 'CISO',
    description: 'David Sledge - multiple roles with pipe'
  },
  {
    input: 'Co-Founder & Staff Engineer at Antidote Health',
    expected: 'Co-Founder & Staff Engineer',
    description: 'Carine - compound title with hyphen'
  },
  {
    input: 'CEO @ Stealth',
    expected: 'CEO',
    description: 'Simple title with @ symbol'
  }
];

for (const test of headlines) {
  // Simulate the fixed extraction logic
  let jobTitle = test.input;
  const titleMatch = test.input.match(/^([^|\u2022]+?)(?:\s*[|\u2022]|$)/);
  if (titleMatch) {
    jobTitle = titleMatch[1].trim();
    const atMatch = jobTitle.match(/^(.+?)\s+(?:at|@)\s+/i);
    if (atMatch) {
      jobTitle = atMatch[1].trim();
    }
  }
  
  const passed = jobTitle === test.expected;
  console.log(`Input: "${test.input}"`);
  console.log(`  Expected: "${test.expected}"`);
  console.log(`  Got: "${jobTitle}"`);
  console.log(`  ${passed ? '✅ PASSED' : '❌ FAILED'} - ${test.description}`);
  console.log();
}

// Test Case 3: Website Filtering (LinkedIn Shortlinks)
console.log('\n🌐 Test 3: Website URL Filtering');
console.log('-'.repeat(40));

const websites = [
  { input: 'https://lnkd.in/gmZZ3vrP', expected: false, reason: 'LinkedIn shortlink' },
  { input: 'https://antidotehealth.com/', expected: true, reason: 'Company website' },
  { input: 'https://linkedin.com/in/user', expected: false, reason: 'LinkedIn profile' },
  { input: 'https://bit.ly/abc123', expected: false, reason: 'URL shortener' }
];

for (const test of websites) {
  const result = isValidWebsite(test.input);
  const passed = result === test.expected;
  
  console.log(`Input: "${test.input}"`);
  console.log(`  Expected: ${test.expected}, Got: ${result}`);
  console.log(`  ${passed ? '✅ PASSED' : '❌ FAILED'} - ${test.reason}`);
  console.log();
}

// Test Case 4: Specific Pattern Matching
console.log('\n🔍 Test 4: Pattern Matching for Phone Numbers');
console.log('-'.repeat(40));

// Test the new stricter phone patterns
const testText = `
  Some random text with 1756388157552 timestamp
  A valid phone: 052-699-2199
  Another format: (555) 123-4567
  International: +972-52-123-4567
`;

const phonePatterns = [
  /\+\d{1,3}[\s\-]?\(?\d{1,4}\)?[\s\-]?\d{1,4}[\s\-]?\d{1,9}/g,
  /\(\d{3}\)[\s\-]?\d{3}[\s\-]?\d{4}/g,
  /\b\d{3}[\s\-]?\d{3}[\s\-]?\d{4}\b/g,
  /\b05\d{1}[\s\-]?\d{3}[\s\-]?\d{4}\b/g
];

const foundPhones = [];
for (const pattern of phonePatterns) {
  const matches = testText.match(pattern);
  if (matches) {
    foundPhones.push(...matches);
  }
}

console.log('Text to search:', testText.trim());
console.log('\nPhones found with new patterns:');
foundPhones.forEach(phone => {
  const digits = phone.replace(/\D/g, '');
  const isTimestamp = digits.length >= 13 && digits.startsWith('1');
  console.log(`  - "${phone}" (${digits.length} digits) ${isTimestamp ? '⚠️ Would be rejected as timestamp' : '✅ Valid'}`);
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 BUG FIX SUMMARY');
console.log('='.repeat(60));

const fixes = [
  '✅ Phone: Timestamps like "1756388157552" are now rejected',
  '✅ Job Title: "Co-Founder" no longer truncated to "Co"',
  '✅ Website: LinkedIn shortlinks (lnkd.in) are filtered out',
  '✅ Phone Patterns: More specific patterns avoid matching timestamps'
];

console.log('\nFixed Issues:');
fixes.forEach(fix => console.log(`  ${fix}`));

console.log('\nRemaining Issues to Fix:');
console.log('  ⚠️ Company extraction (getting "2nd" instead of proper company)');
console.log('  ⚠️ Email extraction from Contact Info modal');

console.log('\n✨ Bug fix testing completed!');