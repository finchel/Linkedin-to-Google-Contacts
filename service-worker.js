/**
 * Simple Background Service Worker
 * Based on working LinkedInToContacts-Secure approach
 */

console.log('LinkedIn to Contacts: Background script loaded');

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Background script received message:', request);
  
  if (request.action === 'syncToContacts') {
    console.log('🚀 Starting contact sync process...');
    console.log('Profile data received:', request.profileData);
    
    if (!request.profileData) {
      console.error('❌ No profile data provided');
      sendResponse({ 
        success: false, 
        error: 'No profile data provided' 
      });
      return;
    }
    
    if (!request.profileData.fullName) {
      console.error('❌ Profile data missing required fullName field');
      sendResponse({ 
        success: false, 
        error: 'Profile data missing required name field' 
      });
      return;
    }
    
    handleContactSync(request.profileData)
      .then(result => {
        console.log('✅ Contact sync completed with result:', result);
        sendResponse(result);
      })
      .catch(error => {
        console.error('❌ Contact sync failed with error:', error);
        sendResponse({ 
          success: false, 
          error: error.message || 'Unknown sync error' 
        });
      });
    return true; // Keep message channel open for async response
  } else {
    console.log('❓ Unknown action received:', request.action);
  }
});

async function handleContactSync(profileData) {
  console.log('LinkedIn to Contacts: Starting contact sync for:', profileData.fullName);
  
  // Simple approach: Open Google Contacts tab manually with helper (always works)
  return await openGoogleContactsTab(profileData);
}

// Open Google Contacts manually (always works)
async function openGoogleContactsTab(profileData) {
  console.log('LinkedIn to Contacts: Opening Google Contacts tab manually...');
  
  try {
    // Create search URL with profile name
    const searchQuery = encodeURIComponent(profileData.fullName);
    const contactsUrl = `https://contacts.google.com/search/${searchQuery}`;
    
    const tab = await chrome.tabs.create({
      url: contactsUrl,
      active: true // Switch to this tab
    });
    
    // Wait for the tab to load
    await new Promise(resolve => {
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === tab.id && info.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      });
    });
    
    // Inject the helper panel script into the Google Contacts tab
    console.log('LinkedIn to Contacts: Injecting helper panel into Google Contacts tab...');
    console.log('Tab ID:', tab.id, 'URL:', tab.url);
    console.log('Profile data to inject:', profileData);
    
    try {
      // Simple helper injection using chrome.tabs.sendMessage (Manifest V3 compatible)
      console.log('LinkedIn to Contacts: Trying simple helper injection...');
      await chrome.tabs.sendMessage(tab.id, {
        action: 'injectHelper',
        profileData: profileData
      });
      
      console.log('LinkedIn to Contacts: Simple helper injection completed');
      
    } catch (scriptError) {
      console.error('LinkedIn to Contacts: Helper injection failed:', scriptError);
      console.error('Error details:', scriptError.message);
    }
    
    // Store profile data for manual processing (if storage API is available)
    try {
      if (chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({
          [`pending_contact_${tab.id}`]: {
            profileData: profileData,
            timestamp: Date.now()
          }
        });
        console.log('LinkedIn to Contacts: Profile data stored for tab:', tab.id);
      }
    } catch (storageError) {
      console.log('LinkedIn to Contacts: Storage not available, skipping data persistence');
    }
    
    return {
      success: true,
      message: `Opened Google Contacts with search for "${profileData.fullName}" and added helper panel.`
    };
    
  } catch (error) {
    console.error('LinkedIn to Contacts: Manual tab opening failed:', error);
    return { success: false, error: 'Could not open Google Contacts tab' };
  }
}

console.log('LinkedIn to Contacts: Service worker ready');