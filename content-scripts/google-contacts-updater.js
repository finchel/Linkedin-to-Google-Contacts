'use strict';

// Simple Google Contacts Helper - Based on working LinkedInToContacts-Secure approach
console.log('[GoogleContacts] Simple helper script loaded');

// Listen for messages from service worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[GoogleContacts] Received message:', request);
  
  if (sender.id !== chrome.runtime.id) {
    return;
  }

  // Handle profile data injection
  if (request.action === 'injectHelper' && request.profileData) {
    console.log('[GoogleContacts] Creating helper panel with profile data:', request.profileData);
    createLinkedInDataHelper(request.profileData);
    sendResponse({ success: true, message: 'Helper panel created' });
  }
});

// Create LinkedIn data helper panel (based on working extension)
function createLinkedInDataHelper(profileData) {
  console.log('[GoogleContacts] Creating LinkedIn data helper panel...');
  
  // Remove any existing helper
  const existing = document.getElementById('linkedin-data-helper');
  if (existing) existing.remove();
  
  // Create helper using DOM methods to avoid syntax errors
  const helper = document.createElement('div');
  helper.id = 'linkedin-data-helper';
  helper.style.cssText = 'position: fixed !important; top: 20px !important; right: 20px !important; width: 350px !important; max-height: 80vh !important; overflow-y: auto !important; background: white !important; border: 3px solid #0077b5 !important; border-radius: 8px !important; padding: 16px !important; box-shadow: 0 8px 24px rgba(0,0,0,0.3) !important; z-index: 999999 !important; font-family: Arial, sans-serif !important; font-size: 13px !important;';
  
  // Create header
  const header = document.createElement('h3');
  header.style.cssText = 'color: #0077b5; margin: 0 0 12px 0; font-size: 16px; font-weight: 500;';
  header.innerHTML = '🔗 LinkedIn Data';
  helper.appendChild(header);
  
  // Create data section
  const dataSection = document.createElement('div');
  dataSection.style.cssText = 'background: #f8f9fa; padding: 12px; border-radius: 4px; margin-bottom: 12px;';
  
  // Add data fields
  if (profileData.fullName) {
    const nameDiv = document.createElement('div');
    nameDiv.innerHTML = '<strong>Name:</strong> ' + profileData.fullName;
    nameDiv.style.cssText = 'margin-bottom: 4px;';
    dataSection.appendChild(nameDiv);
  }
  
  if (profileData.jobTitle || profileData.headline) {
    const jobDiv = document.createElement('div');
    jobDiv.innerHTML = '<strong>Job Title:</strong> ' + (profileData.jobTitle || profileData.headline);
    jobDiv.style.cssText = 'margin-bottom: 4px;';
    dataSection.appendChild(jobDiv);
  }
  
  if (profileData.company) {
    const companyDiv = document.createElement('div');
    companyDiv.innerHTML = '<strong>Company:</strong> ' + profileData.company;
    companyDiv.style.cssText = 'margin-bottom: 4px;';
    dataSection.appendChild(companyDiv);
  }
  
  if (profileData.location) {
    const locationDiv = document.createElement('div');
    locationDiv.innerHTML = '<strong>Location:</strong> ' + profileData.location;
    locationDiv.style.cssText = 'margin-bottom: 4px;';
    dataSection.appendChild(locationDiv);
  }
  
  if (profileData.email) {
    const emailDiv = document.createElement('div');
    emailDiv.innerHTML = '<strong>Email:</strong> ' + profileData.email;
    emailDiv.style.cssText = 'margin-bottom: 4px;';
    dataSection.appendChild(emailDiv);
  }
  
  if (profileData.phone) {
    const phoneDiv = document.createElement('div');
    phoneDiv.innerHTML = '<strong>Phone:</strong> ' + profileData.phone;
    phoneDiv.style.cssText = 'margin-bottom: 4px;';
    dataSection.appendChild(phoneDiv);
  }
  
  if (profileData.website) {
    const websiteDiv = document.createElement('div');
    websiteDiv.innerHTML = '<strong>Website:</strong> ' + profileData.website;
    websiteDiv.style.cssText = 'margin-bottom: 4px;';
    dataSection.appendChild(websiteDiv);
  }
  
  const linkedinDiv = document.createElement('div');
  linkedinDiv.innerHTML = '<strong>LinkedIn:</strong> ' + profileData.url;
  linkedinDiv.style.cssText = 'margin-bottom: 4px;';
  dataSection.appendChild(linkedinDiv);
  
  helper.appendChild(dataSection);
  
  // Create comment section
  const commentSection = document.createElement('div');
  commentSection.style.cssText = 'background: #fff3cd; padding: 12px; border-radius: 4px; margin-bottom: 12px;';
  
  const commentLabel = document.createElement('label');
  commentLabel.textContent = '💬 Add Custom Comment:';
  commentLabel.style.cssText = 'display: block; margin-bottom: 6px; font-weight: 600; color: #856404;';
  commentSection.appendChild(commentLabel);
  
  const commentInput = document.createElement('textarea');
  commentInput.id = 'custom-comment-input';
  commentInput.placeholder = 'Add a personal note about this contact (optional)...';
  commentInput.style.cssText = 'width: 100%; height: 60px; padding: 8px; border: 1px solid #ffc107; border-radius: 4px; resize: vertical; font-family: inherit; font-size: 12px; box-sizing: border-box;';
  commentSection.appendChild(commentInput);
  
  // Load saved comment from storage
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['customComment'], (result) => {
      if (result.customComment) {
        commentInput.value = result.customComment;
      }
    });
  }
  
  // Save comment on change
  commentInput.addEventListener('input', () => {
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ customComment: commentInput.value });
    }
  });
  
  helper.appendChild(commentSection);
  
  // Create button section
  const buttonSection = document.createElement('div');
  buttonSection.style.cssText = 'background: #e3f2fd; padding: 12px; border-radius: 4px; margin-bottom: 12px;';
  
  // Auto-fill button
  const autoFillBtn = document.createElement('button');
  autoFillBtn.id = 'auto-fill-btn';
  autoFillBtn.textContent = '🤖 Auto-Fill Contact Fields';
  autoFillBtn.style.cssText = 'width: 100%; padding: 10px; background: #059669; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; margin-bottom: 8px;';
  buttonSection.appendChild(autoFillBtn);
  
  // Copy button
  const copyBtn = document.createElement('button');
  copyBtn.id = 'copy-all-btn';
  copyBtn.textContent = '📋 Copy All Data';
  copyBtn.style.cssText = 'width: 100%; padding: 8px; background: #0077b5; color: white; border: none; border-radius: 4px; cursor: pointer;';
  buttonSection.appendChild(copyBtn);
  
  helper.appendChild(buttonSection);
  
  // Create status section
  const statusSection = document.createElement('div');
  statusSection.id = 'status-section';
  statusSection.style.cssText = 'background: #fff3cd; padding: 8px; border-radius: 4px; margin-bottom: 12px; font-size: 12px; display: none;';
  statusSection.textContent = 'Status updates will appear here...';
  helper.appendChild(statusSection);
  
  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✖️ Close Helper';
  closeBtn.style.cssText = 'width: 100%; padding: 8px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;';
  closeBtn.onclick = () => helper.remove();
  helper.appendChild(closeBtn);
  
  document.body.appendChild(helper);
  
  // Add event listeners
  autoFillBtn.onclick = () => {
    statusSection.style.display = 'block';
    statusSection.textContent = '🔍 Searching for contact form fields...';
    statusSection.style.background = '#d1ecf1';
    
    setTimeout(() => {
      let filledCount = 0;
      
      // Fill first name
      if (profileData.firstName) {
        const firstNameFields = document.querySelectorAll('input[aria-label*="First name"], input[placeholder*="First name"]');
        if (firstNameFields.length > 0) {
          firstNameFields[0].value = profileData.firstName;
          firstNameFields[0].dispatchEvent(new Event('input', { bubbles: true }));
          filledCount++;
        }
      }
      
      // Fill last name
      if (profileData.lastName) {
        const lastNameFields = document.querySelectorAll('input[aria-label*="Last name"], input[placeholder*="Last name"]');
        if (lastNameFields.length > 0) {
          lastNameFields[0].value = profileData.lastName;
          lastNameFields[0].dispatchEvent(new Event('input', { bubbles: true }));
          filledCount++;
        }
      }
      
      // Fill job title - use jobTitle if available, otherwise use headline
      const jobTitleToUse = profileData.jobTitle || profileData.headline;
      if (jobTitleToUse) {
        const jobFields = document.querySelectorAll('input[aria-label*="Job title"], input[placeholder*="Job title"]');
        if (jobFields.length > 0) {
          jobFields[0].value = jobTitleToUse;
          jobFields[0].dispatchEvent(new Event('input', { bubbles: true }));
          filledCount++;
        }
      }
      
      // Fill company
      if (profileData.company) {
        const companyFields = document.querySelectorAll('input[aria-label*="Company"], input[placeholder*="Company"]');
        if (companyFields.length > 0) {
          companyFields[0].value = profileData.company;
          companyFields[0].dispatchEvent(new Event('input', { bubbles: true }));
          filledCount++;
        }
      }
      
      // Fill email - try multiple selectors for Google Contacts
      if (profileData.email) {
        console.log('🔍 Attempting to fill email field with:', profileData.email);
        const emailSelectors = [
          'input[type="email"]',
          'input[aria-label*="Email"]',
          'input[placeholder*="Email"]',
          'input[aria-label*="email"]',
          'input[placeholder*="email"]',
          'input[name*="email"]',
          'input[id*="email"]'
        ];
        
        let emailFilled = false;
        for (const selector of emailSelectors) {
          const emailFields = document.querySelectorAll(selector);
          if (emailFields.length > 0) {
            // Try to fill the first empty field, or the first field if none are empty
            for (const field of emailFields) {
              if (!field.value || field.value.trim() === '') {
                field.value = profileData.email;
                field.dispatchEvent(new Event('input', { bubbles: true }));
                field.dispatchEvent(new Event('change', { bubbles: true }));
                console.log('✅ Email filled using selector:', selector);
                filledCount++;
                emailFilled = true;
                break;
              }
            }
            if (emailFilled) break;
          }
        }
      }
      
      // Fill phone
      if (profileData.phone) {
        const phoneFields = document.querySelectorAll('input[type="tel"], input[aria-label*="Phone"], input[placeholder*="Phone"]');
        if (phoneFields.length > 0) {
          phoneFields[0].value = profileData.phone;
          phoneFields[0].dispatchEvent(new Event('input', { bubbles: true }));
          filledCount++;
        }
      }
      
      // Fill website URL
      if (profileData.website) {
        const urlFields = document.querySelectorAll('input[type="url"], input[aria-label*="Website"]');
        if (urlFields.length > 0) {
          urlFields[0].value = profileData.website;
          urlFields[0].dispatchEvent(new Event('input', { bubbles: true }));
          filledCount++;
        }
      }
      
      // Fill Notes field with LinkedIn URL, custom comment, and other relevant info
      const notesFields = document.querySelectorAll('textarea[aria-label*="Notes"], textarea[placeholder*="Notes"], textarea[aria-label*="notes"]');
      if (notesFields.length > 0) {
        let notesContent = [];
        notesContent.push('LinkedIn Profile: ' + profileData.url);
        
        // Add custom comment if available
        const customCommentInput = document.getElementById('custom-comment-input');
        if (customCommentInput && customCommentInput.value.trim()) {
          notesContent.push('Note: ' + customCommentInput.value.trim());
        }
        
        if (profileData.headline) {
          notesContent.push('Full headline: ' + profileData.headline);
        }
        if (profileData.timestamp) {
          notesContent.push('Last synced: ' + new Date(profileData.timestamp).toLocaleDateString());
        }
        notesFields[0].value = notesContent.join('\n');
        notesFields[0].dispatchEvent(new Event('input', { bubbles: true }));
        notesFields[0].dispatchEvent(new Event('change', { bubbles: true }));
        filledCount++;
      }
      
      // Update status
      if (filledCount > 0) {
        statusSection.textContent = 'Auto-filled ' + filledCount + ' field(s)! Check the form and save.';
        statusSection.style.background = '#d4edda';
        autoFillBtn.textContent = '✅ Fields Filled!';
        autoFillBtn.style.background = '#28a745';
      } else {
        statusSection.textContent = 'No form fields found. Make sure you are on the contact edit page.';
        statusSection.style.background = '#fff3cd';
      }
      
    }, 500);
  };
  
  // Copy functionality
  copyBtn.onclick = () => {
    let copyText = [];
    if (profileData.fullName) copyText.push('Name: ' + profileData.fullName);
    if (profileData.jobTitle || profileData.headline) copyText.push('Job Title: ' + (profileData.jobTitle || profileData.headline));
    if (profileData.company) copyText.push('Company: ' + profileData.company);
    if (profileData.location) copyText.push('Location: ' + profileData.location);
    if (profileData.email) copyText.push('Email: ' + profileData.email);
    if (profileData.phone) copyText.push('Phone: ' + profileData.phone);
    if (profileData.website) copyText.push('Website: ' + profileData.website);
    copyText.push('LinkedIn: ' + profileData.url);
    
    // Add custom comment if available
    const customCommentInput = document.getElementById('custom-comment-input');
    if (customCommentInput && customCommentInput.value.trim()) {
      copyText.push('Note: ' + customCommentInput.value.trim());
    }
    
    navigator.clipboard.writeText(copyText.join('\n')).then(() => {
      copyBtn.textContent = '✅ Copied!';
      setTimeout(() => {
        copyBtn.textContent = '📋 Copy All Data';
      }, 2000);
    });
  };
  
  console.log('[GoogleContacts] LinkedIn data helper panel created successfully');
}

console.log('[GoogleContacts] Simple helper content script loaded');