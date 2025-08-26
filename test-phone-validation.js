#!/usr/bin/env node

// Test phone validation function directly
function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  
  const cleaned = phone.replace(/\D/g, '');
  
  // Must be 10-12 digits
  if (cleaned.length < 10 || cleaned.length > 12) {
    console.log('❌ Phone rejected - length:', cleaned.length);
    return false;
  }
  
  // If it looks like a timestamp or ID (very large number), reject it
  if (cleaned.length > 11 && parseInt(cleaned) > 99999999999) {
    console.log('❌ Phone rejected - looks like timestamp/ID:', cleaned);
    return false;
  }
  
  return true;
}

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

console.log('🧪 Testing specific problematic phone number...');
console.log('1756214583859 valid?', isValidPhone('1756214583859'));
console.log('0524797107 valid?', isValidPhone('0524797107'));
console.log('555-123-4567 valid?', isValidPhone('555-123-4567'));

console.log('\n🧪 Testing email validation...');
console.log('adamffrank@gmail.com valid?', isValidEmail('adamffrank@gmail.com'));
console.log('noreply@linkedin.com valid?', isValidEmail('noreply@linkedin.com'));