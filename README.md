# LinkedIn to Google Contacts Sync Chrome Extension

A Chrome extension that seamlessly synchronizes LinkedIn profile information to your Google Contacts using existing browser sessions, eliminating the need for API keys, OAuth setup, or external servers.

## 🌟 Features

### Core Functionality
- **One-Click Sync**: Add LinkedIn profile information to Google Contacts with a single click
- **Intelligent Matching**: Automatically finds matching contacts or creates new ones
- **Custom Notes**: Add personalized messages to remember connection context
- **Profile Data Extraction**: Captures name, company, title, location, profile photo, and more
- **Safe Updates**: Never overwrites existing data, only adds new information

### User Experience
- **Browser Session Based**: Uses your existing LinkedIn and Google Contacts logins
- **Real-time Feedback**: Visual progress indicators and status updates
- **Error Recovery**: Robust error handling with user-friendly messages
- **Responsive Design**: Works seamlessly on different screen sizes
- **Privacy Focused**: All processing happens locally in your browser

### Technical Features
- **Chrome Extension Manifest V3**: Latest extension architecture
- **Shadow DOM Isolation**: UI elements don't interfere with LinkedIn's design
- **Fallback Selectors**: Multiple strategies to handle LinkedIn UI changes
- **Performance Optimized**: Efficient DOM operations and memory management
- **Security First**: Input sanitization and origin validation

## 🚀 Installation

### Method 1: Load Unpacked Extension (Development)

1. **Download the Extension**
   ```bash
   git clone https://github.com/your-repo/linkedin-to-contacts-extension
   cd linkedin-to-contacts-extension
   ```

2. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)

3. **Load Extension**
   - Click "Load unpacked"
   - Select the extension directory
   - The extension should appear in your extensions list

4. **Pin Extension** (Optional)
   - Click the puzzle piece icon in Chrome toolbar
   - Pin the "LinkedIn to Contacts Sync" extension for easy access

### Method 2: Chrome Web Store (Coming Soon)
The extension will be available on the Chrome Web Store after review and approval.

## 📝 Usage Guide

### First Time Setup

1. **Ensure You're Logged In**
   - Log in to LinkedIn in one tab
   - Log in to Google Contacts in another tab
   - Both sessions must be active for the extension to work

2. **Navigate to a LinkedIn Profile**
   - Go to any LinkedIn profile page (not your own)
   - The "Add to Contacts" button will appear near other action buttons

3. **Click to Sync**
   - Click the "Add to Contacts" button
   - The extension will extract profile information
   - Google Contacts will open automatically for matching

### Sync Process

1. **Profile Extraction**
   - Extension reads public profile information
   - Collects name, company, title, location, photo URL, etc.

2. **Contact Search**
   - Automatically searches your Google Contacts
   - Uses intelligent matching to find existing contacts

3. **User Confirmation**
   - Shows potential matches for your approval
   - Allows you to create new contact if no match found
   - Prompts for custom message/note

4. **Contact Update**
   - Adds LinkedIn information to contact notes
   - Updates empty fields with LinkedIn data
   - Preserves all existing contact information

### Using the Extension Popup

Access the extension popup by clicking the extension icon in your toolbar:

- **Statistics**: View sync count, success rate, and recent activity
- **Quick Actions**: Direct links to LinkedIn and Google Contacts
- **Settings**: Configure auto-search, photo sync, default messages
- **Activity Log**: Review recent sync operations and errors

## ⚙️ Settings and Configuration

### Auto-Search Contacts
- **Enabled** (Default): Automatically searches for matching contacts
- **Disabled**: Prompts you to manually search each time

### Sync Profile Photos
- **Enabled** (Default): Downloads and adds LinkedIn profile photos
- **Disabled**: Skips profile photo sync

### Default Message
- Set a default note to add to all synced contacts
- Examples: "Connected on LinkedIn", "Met at [Event Name]"
- Can be customized per sync

### Confirmation Mode
- **Always Confirm** (Default): Shows confirmation for every sync
- **Multiple Matches Only**: Only confirms when multiple contacts found
- **Never Confirm**: Auto-updates without confirmation (use carefully)

## 🔒 Privacy and Security

### Data Processing
- **Local Only**: All processing happens in your browser
- **No External Servers**: No data is sent to third-party services
- **Session Based**: Uses your existing browser sessions
- **No Storage of Credentials**: Never stores passwords or tokens

### Data Collection
- **Profile Information**: Only collects publicly visible LinkedIn data
- **Contact Data**: Only accesses contacts you choose to update
- **Usage Statistics**: Tracks sync counts and success rates locally
- **Error Logs**: Stores error information locally for debugging

### Permissions Explained
- **LinkedIn Access**: Read profile information from LinkedIn pages
- **Google Contacts Access**: Search and update your contacts
- **Storage**: Save preferences and sync history locally
- **Active Tab**: Interact with current tab for sync operations

## 🛠️ Troubleshooting

### Common Issues

**"Add to Contacts" Button Not Appearing**
- Refresh the LinkedIn page
- Make sure you're on a profile page (not your own)
- Check that the extension is enabled
- Try disabling other LinkedIn extensions temporarily

**Sync Button Shows "Failed" State**
- Check internet connection
- Ensure you're logged in to both LinkedIn and Google Contacts
- Try refreshing both tabs
- Check Chrome extension permissions

**Contact Search Not Working**
- Verify you're logged in to Google Contacts
- Make sure Google Contacts page loads properly
- Try manually searching for the contact first
- Clear browser cache and cookies for Google Contacts

**Profile Information Not Extracted**
- Some LinkedIn profiles have limited visibility
- Try viewing the profile while logged in
- Check if you're connected to the person on LinkedIn
- Some fields may not be publicly available

### Error Recovery

The extension includes automatic error recovery:
- **Network Issues**: Automatically retries with exponential backoff
- **Rate Limiting**: Waits appropriate time before retrying
- **Page Loading**: Waits for dynamic content to load
- **Permission Errors**: Provides clear instructions for resolution

### Getting Help

1. **Check Extension Popup**: View recent activity and error messages
2. **Browser Console**: Press F12 → Console tab for detailed logs
3. **Export Error Logs**: Use popup settings to export error information
4. **GitHub Issues**: Report problems with detailed information

## 🔧 Technical Architecture

### Component Overview
- **Service Worker**: Central coordination and message routing
- **LinkedIn Content Script**: Profile data extraction and UI injection
- **Google Contacts Content Script**: Contact search and updating
- **Popup Interface**: Settings, statistics, and user controls
- **Error Handler**: Centralized error handling and recovery

### Message Flow
```
LinkedIn Profile → Extract Data → Service Worker → Google Contacts → Update Contact → Success Feedback
```

### Selector Strategies
Each data extraction uses multiple fallback selectors:
1. **Primary**: Semantic/data attributes
2. **Secondary**: ARIA labels and roles
3. **Fallback**: Class-based selectors
4. **Last Resort**: Text content matching

### Performance Features
- **Lazy Loading**: Components load on demand
- **Debounced Operations**: Prevents excessive API calls
- **Memory Management**: Proper cleanup of observers and listeners
- **Shadow DOM**: Prevents style conflicts

## 📊 Supported Data Fields

### LinkedIn Profile Data
- **Name**: Full name with variations handling
- **Headline**: Current job title/tagline
- **Company**: Current organization
- **Location**: Geographic location
- **Profile Photo**: High-resolution image URL
- **Profile URL**: Canonical LinkedIn profile link
- **Email**: If publicly available
- **Phone**: If publicly available

### Google Contacts Updates
- **Notes**: LinkedIn URL, sync timestamp, custom message
- **Company**: Added if field is empty
- **Job Title**: Added if field is empty
- **Email**: Added if not already present
- **Profile Photo**: Downloaded and attached

## 🚧 Limitations and Known Issues

### Current Limitations
- **LinkedIn Only**: Works only with LinkedIn profiles
- **Chrome Browser**: Requires Chrome or Chromium-based browser
- **Public Data**: Can only extract publicly visible information
- **Session Dependent**: Requires active login sessions
- **Rate Limits**: Respects LinkedIn and Google's rate limiting

### Known Issues
- Some LinkedIn profiles with heavy restrictions may not sync completely
- Google Contacts UI changes may require extension updates
- Large profile photos may take time to download
- Mobile view compatibility is limited

## 🛣️ Roadmap

### Upcoming Features
- **Batch Processing**: Sync multiple profiles from search results
- **Auto-Sync**: Automatic sync for new connection requests
- **Enhanced Matching**: Better duplicate detection algorithms
- **Profile Updates**: Detect and sync profile changes
- **Export Features**: Export sync history and statistics

### Future Integrations
- Microsoft Outlook contacts
- Apple Contacts (via iCloud)
- CRM systems integration
- Bulk import/export tools

## 🤝 Contributing

We welcome contributions! Please see our [Development Guidelines](DEVELOPMENT.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (see DEVELOPMENT.md)
5. Submit a pull request

### ⚠️ CRITICAL: Data Privacy
**NEVER commit personal data, profile examples, or screenshots to the repository.**
All profile examples and vetted data must remain in the separate `LinkedInProfileExamples` folder.

### Code Standards
- Follow existing code style
- Add comprehensive error handling
- Include user-friendly error messages
- Test on different LinkedIn profile types (using separate examples folder)
- Ensure accessibility compliance
- Never log or store personal information in committed code

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chrome Extension documentation and examples
- LinkedIn and Google Contacts for their platforms
- The open-source community for tools and libraries
- Beta testers for their valuable feedback

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Email**: support@your-domain.com

---

**Note**: This extension is not affiliated with or endorsed by LinkedIn or Google. It's an independent tool designed to improve productivity and contact management.