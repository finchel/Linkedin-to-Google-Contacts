# Installation Guide - LinkedIn to Google Contacts Sync Extension

This guide will help you install and set up the LinkedIn to Google Contacts Sync Chrome Extension.

## 📋 Prerequisites

Before installing the extension, ensure you have:

- **Chrome Browser**: Version 120 or higher
- **Active Accounts**: 
  - LinkedIn account with active session
  - Google account with access to Google Contacts
- **Permissions**: Admin access to install Chrome extensions
- **Internet Connection**: Stable connection for sync operations

## 🚀 Installation Methods

### Method 1: Load Unpacked Extension (Recommended for Testing)

#### Step 1: Download the Extension
1. Download or clone the extension files to your computer
2. Extract to a folder (e.g., `linkedin-to-contacts-extension`)
3. Ensure all files are present (see structure below)

#### Step 2: Open Chrome Extensions
1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top-right corner

#### Step 3: Load the Extension
1. Click "Load unpacked" button
2. Select the extension folder you downloaded
3. The extension should appear in your extensions list
4. Verify the extension shows "LinkedIn to Google Contacts Sync"

#### Step 4: Pin the Extension (Optional but Recommended)
1. Click the puzzle piece icon (🧩) in Chrome toolbar
2. Find "LinkedIn to Google Contacts Sync" in the list
3. Click the pin icon to keep it visible in your toolbar

### Method 2: Chrome Web Store (Future Release)
The extension will be available on the Chrome Web Store after review and approval.

## 📁 Required File Structure

Ensure your extension folder contains these files:

```
linkedin-to-contacts-extension/
├── manifest.json                           # Extension configuration
├── service-worker.js                       # Background script
├── content-scripts/
│   ├── linkedin-extractor.js              # LinkedIn integration
│   └── google-contacts-updater.js         # Google Contacts integration
├── popup/
│   ├── popup.html                          # Extension popup interface
│   ├── popup.js                            # Popup functionality
│   └── popup.css                           # Popup styling
├── styles/
│   ├── linkedin-ui.css                     # LinkedIn UI styles
│   └── google-contacts-ui.css              # Google Contacts UI styles
├── icons/
│   ├── icon16.png                          # 16x16 icon
│   ├── icon32.png                          # 32x32 icon
│   ├── icon48.png                          # 48x48 icon
│   └── icon128.png                         # 128x128 icon
├── utils/
│   └── error-handler.js                    # Error handling utility
├── README.md                               # Documentation
├── TESTING.md                              # Testing guide
└── INSTALL.md                              # This file
```

## ⚙️ Initial Setup

### Step 1: Verify Installation
1. Check that the extension appears in `chrome://extensions/`
2. Ensure the status shows "Enabled"
3. Verify no error messages are displayed
4. Click the extension icon to open the popup interface

### Step 2: Check Permissions
The extension requires these permissions:
- **Storage**: Save preferences and sync history
- **Active Tab**: Access current tab for sync operations
- **Scripting**: Inject content scripts into web pages
- **Tabs**: Manage tab navigation during sync
- **Host Permissions**: Access LinkedIn and Google Contacts

If any permissions are missing:
1. Go to `chrome://extensions/`
2. Click "Details" on the extension
3. Enable all required permissions

### Step 3: Login to Required Services
Before using the extension:
1. **LinkedIn**: Go to `linkedin.com` and log in
2. **Google Contacts**: Go to `contacts.google.com` and log in
3. Keep both sessions active during use

## 🧪 Verify Installation

### Quick Test
1. Navigate to any LinkedIn profile (not your own)
2. Look for "Add to Contacts" button near other action buttons
3. If the button appears, installation was successful
4. Click the extension icon to view the popup interface

### Full Test
1. Find a LinkedIn profile you want to sync
2. Click "Add to Contacts" button
3. Extension should open Google Contacts automatically
4. Follow the sync process to completion
5. Verify the contact was created or updated

## 🔧 Troubleshooting Installation

### Extension Not Loading
**Problem**: Extension doesn't appear after loading
**Solutions**:
- Refresh the extensions page
- Check for JavaScript errors in console (F12)
- Verify all required files are present
- Try reloading the extension

### Permission Errors
**Problem**: "This extension may have been corrupted" message
**Solutions**:
- Check manifest.json syntax is valid
- Ensure all referenced files exist
- Verify file paths match manifest declarations
- Try loading from a different location

### Button Not Appearing
**Problem**: "Add to Contacts" button doesn't show on LinkedIn
**Solutions**:
- Refresh the LinkedIn page
- Check you're on a profile page (not your own)
- Verify extension is enabled
- Check browser console for errors

### Popup Not Opening
**Problem**: Extension icon doesn't open popup
**Solutions**:
- Check popup.html exists and is valid
- Verify popup files are correctly referenced in manifest
- Look for JavaScript errors in popup
- Try disabling other extensions temporarily

## 🔒 Security Considerations

### Data Privacy
- Extension processes data locally only
- No external server communication
- Uses existing browser sessions
- No credential storage

### Permissions Explanation
- **Storage**: Saves user preferences locally
- **ActiveTab**: Only accesses currently active tab
- **Scripting**: Required for LinkedIn/Contacts integration
- **Host Permissions**: Limited to LinkedIn and Google Contacts only

## 📱 Browser Compatibility

### Supported Browsers
- **Google Chrome**: Version 120+
- **Microsoft Edge**: Chromium-based versions
- **Brave Browser**: Recent versions
- **Other Chromium browsers**: May work but not officially supported

### Unsupported Browsers
- Firefox (different extension architecture)
- Safari (different extension system)
- Internet Explorer (deprecated)
- Mobile browsers (limited extension support)

## 🔄 Updating the Extension

### Manual Updates (Unpacked Extension)
1. Download new version files
2. Replace existing files in installation folder
3. Go to `chrome://extensions/`
4. Click refresh icon (🔄) on the extension
5. Verify new version number in extension details

### Automatic Updates (Web Store Version)
- Chrome automatically updates extensions from Web Store
- Check for updates in `chrome://extensions/`
- Updates typically install on browser restart

## 🗑️ Uninstalling the Extension

### Complete Removal
1. Go to `chrome://extensions/`
2. Find "LinkedIn to Google Contacts Sync"
3. Click "Remove"
4. Confirm removal in the dialog

### Data Cleanup
The extension automatically cleans up:
- Local storage data
- Cached preferences
- Error logs
- Temporary sync data

No manual cleanup required after uninstallation.

## 📞 Getting Help

### Before Seeking Help
1. Check this installation guide
2. Review the troubleshooting section
3. Test with a fresh browser profile
4. Verify you meet all prerequisites

### Support Channels
- **Documentation**: README.md and TESTING.md
- **Issues**: GitHub Issues page
- **Discussions**: GitHub Discussions
- **Email**: Contact information in README.md

### Information to Include
When reporting issues:
- Chrome version
- Operating system
- Extension version
- Steps to reproduce
- Error messages or console logs
- Screenshots if applicable

## 🎯 Next Steps

After successful installation:

1. **Read the User Guide**: Review README.md for detailed usage instructions
2. **Test Basic Functionality**: Try syncing a simple LinkedIn profile
3. **Configure Settings**: Set up preferences in the extension popup
4. **Review Privacy Settings**: Understand data handling and permissions
5. **Provide Feedback**: Share your experience to help improve the extension

---

**Congratulations!** 🎉 You've successfully installed the LinkedIn to Google Contacts Sync extension. Start syncing your professional network to keep your contacts organized and up-to-date.