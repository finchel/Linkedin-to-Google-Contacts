#!/usr/bin/env node

/**
 * Test table-based contact detection specifically
 */

const fs = require('fs');
const path = require('path');

// Test HTML simulating Google Contacts table format as seen in screenshot
const testHTML = `
<html>
<body>
  <div role="main">
    <h2>Search results</h2>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone number</th>
          <th>Job title & company</th>
          <th>Labels</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Adam Frank</td>
          <td></td>
          <td>+97252559145</td>
          <td>Founder & CEO at Hypnos (by Wisio) | Entrepreneur | Ad</td>
          <td></td>
        </tr>
        <tr>
          <td>Daniel Finchelstein</td>
          <td>daniel@example.com</td>
          <td>+123456789</td>
          <td>Software Engineer</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  </div>
</body>
</html>
`;

console.log('🔍 TESTING TABLE-BASED CONTACT DETECTION\n');

// Test 1: Basic table row detection
const tableRows = testHTML.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi);
const dataRows = tableRows ? tableRows.filter(row => 
  row.includes('<td>') && 
  !row.toLowerCase().includes('<th>') &&
  !row.toLowerCase().includes('name</th>') &&
  !row.toLowerCase().includes('email</th>')
) : [];

console.log('✅ Test 1: Table Row Detection');
console.log(`   Found ${dataRows.length} data rows (expected: 2)`);

// Test 2: Name extraction from first cell
console.log('\n✅ Test 2: Name Extraction');
dataRows.forEach((row, index) => {
  const firstCellMatch = row.match(/<td[^>]*>(.*?)<\/td>/);
  const name = firstCellMatch ? firstCellMatch[1].trim() : '';
  console.log(`   Row ${index + 1}: "${name}"`);
});

// Test 3: Filter logic simulation
console.log('\n✅ Test 3: Filter Logic');
const validRows = dataRows.filter(row => {
  const firstCellMatch = row.match(/<td[^>]*>(.*?)<\/td>/);
  const firstCellText = firstCellMatch ? firstCellMatch[1].trim() : '';
  const fullText = row.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  const isValid = firstCellText &&
         !fullText.toLowerCase().includes('name') && 
         !fullText.toLowerCase().includes('email') && 
         !fullText.toLowerCase().includes('phone') &&
         !fullText.toLowerCase().includes('job title') &&
         !fullText.toLowerCase().includes('labels') &&
         fullText.length > 10 &&
         firstCellText.split(' ').length >= 2 &&
         firstCellText.length > 3 &&
         firstCellText.length < 100 &&
         !firstCellText.toLowerCase().includes('search') &&
         !firstCellText.toLowerCase().includes('create') &&
         !firstCellText.toLowerCase().includes('contact');
         
  console.log(`   "${firstCellText}": ${isValid ? 'VALID' : 'FILTERED'}`);
  return isValid;
});

console.log(`\n📊 RESULTS:`);
console.log(`   Total table rows: ${tableRows ? tableRows.length : 0}`);
console.log(`   Data rows: ${dataRows.length}`);
console.log(`   Valid contact rows: ${validRows.length}`);

if (validRows.length === 2) {
  console.log('\n🎉 SUCCESS: Table detection logic works correctly!');
} else {
  console.log('\n❌ ISSUE: Expected 2 valid rows, got', validRows.length);
}