# Implementation Instructions for Senior Developer

## Project Context

You are tasked with implementing a Chrome Extension that synchronizes LinkedIn profile information to Google Contacts. This document provides comprehensive requirements and architecture. You will implement this using **Context7 in Claude Code** to ensure all APIs and patterns are current.

## Your Role

You are a senior developer with 20 years of experience. You are expected to:
1. Make appropriate technical decisions within the architectural constraints
2. Use Context7 MCP to obtain the latest API documentation
3. Implement robust error handling and edge cases
4. Create maintainable, well-documented code
5. Ensure security and privacy requirements are met

## Implementation Approach

### Phase 1: Foundation Setup
1. Create the Chrome Extension structure per the architecture document
2. Implement the Service Worker for message orchestration
3. Set up the storage layer with appropriate schemas
4. Create the basic popup interface

### Phase 2: LinkedIn Integration
1. Implement the LinkedIn content script
2. Add the "Sync to Google Contacts" button to profiles
3. Create robust profile data extraction with fallbacks
4. Handle various LinkedIn UI states and profile types

### Phase 3: Google Contacts Integration
1. Implement the Google Contacts content script
2. Create contact search functionality
3. Build the matching algorithm with user confirmation
4. Implement the update mechanism

### Phase 4: Integration & Polish
1. Connect all components via message passing
2. Add error handling and recovery mechanisms
3. Implement user preferences and settings
4. Create the custom message feature
5. Add success/failure feedback

## Critical Implementation Requirements

### 1. Use Context7 MCP For:
- **Chrome Extension Manifest V3** - Get the latest patterns and requirements
- **LinkedIn DOM Selectors** - Current selectors and fallback strategies
- **Google Contacts Automation** - Latest UI interaction patterns
- **Security Best Practices** - Current CSP and sandboxing requirements
- **Performance Optimizations** - Latest techniques for extension performance

### 2. Do NOT:
- Hardcode DOM selectors - always implement fallback strategies
- Store any credentials or tokens
- Make external API calls
- Use deprecated Chrome Extension APIs
- Implement features beyond the PRD scope

### 3. MUST Include:
- Comprehensive error handling with user-friendly messages
- Visual feedback for all user actions
- Confirmation steps for data modifications
- Graceful degradation when elements aren't found
- Proper cleanup of event listeners and observers

### 4. Architecture Constraints:
- Pure client-side implementation (no server)
- Use existing browser sessions only
- All processing within browser sandbox
- No external dependencies or libraries
- Vanilla JavaScript only (no frameworks)

## Specific Technical Requirements

### LinkedIn Profile Extraction
```
Required Fields:
- Name (with variations handling)
- Current company and title
- Profile URL
- Profile photo URL
- Location
- Email (if accessible)
- Phone (if accessible)

Implementation Notes:
- Use Context7 to get current selectors
- Implement at least 3 fallback strategies per field
- Handle dynamic content loading
- Respect rate limiting
```

### Google Contacts Update Logic
```
Update Rules:
1. Never overwrite existing data
2. Append LinkedIn URL to notes
3. Add timestamp of sync
4. Include custom message from user
5. Only update empty fields
6. Handle conflicts with user confirmation

Implementation Notes:
- Use Context7 for current Google Contacts UI
- Implement proper wait strategies
- Validate all updates before submission
```

### Message Protocol Design
```
Message Types:
- SYNC_INITIATE: Start sync process
- PROFILE_EXTRACTED: LinkedIn data ready
- SEARCH_CONTACT: Find in Google Contacts
- CONFIRM_MATCH: User confirmation required
- UPDATE_CONTACT: Perform update
- SYNC_COMPLETE: Process finished
- ERROR_OCCURRED: Handle failure

Each message must include:
- type: Message type
- data: Payload
- timestamp: ISO timestamp
- tabId: Origin tab
- requestId: Unique identifier
```

### Storage Schema
```
Use chrome.storage.local for:
- User preferences
- Custom message history
- Sync statistics
- Error logs

Use chrome.storage.session for:
- Active sync state
- Temporary data
- Tab references

Never store:
- Passwords or tokens
- Full profile data
- Personal information
```

## User Experience Requirements

### Visual Feedback
1. Button states: idle, loading, success, error
2. Progress indication during sync
3. Clear error messages with recovery actions
4. Success confirmation with summary

### User Interactions
1. Single click to initiate sync
2. Confirmation dialog for matches
3. Custom message input with history
4. Settings accessible from popup

### Error Messages
- Be specific about what failed
- Provide actionable recovery steps
- Never expose technical details
- Always maintain positive tone

## Testing Requirements

### Test Scenarios
1. **Happy Path**: Standard profile to existing contact
2. **New Contact**: Profile with no match
3. **Multiple Matches**: Ambiguous contact search
4. **Limited Profile**: Restricted LinkedIn visibility
5. **UI Changes**: Selectors not found
6. **Network Issues**: Slow loading, timeouts
7. **Session Expired**: User logged out
8. **Concurrent Syncs**: Multiple tabs

### Test Data Requirements
- Various LinkedIn profile types
- Different Google Contacts states
- Edge cases (special characters, long names)
- International profiles (non-ASCII)

## Performance Requirements

### Metrics to Achieve
- Profile extraction: < 2 seconds
- Contact search: < 3 seconds
- Complete sync: < 10 seconds
- Extension startup: < 100ms
- Memory usage: < 50MB

### Optimization Strategies
- Lazy load content scripts
- Debounce user inputs
- Cache DOM queries
- Minimize reflows
- Clean up observers

## Security Implementation

### Required Security Measures
1. Input sanitization for all user data
2. Content Security Policy compliance
3. Origin validation for messages
4. No eval() or dynamic code execution
5. Proper iframe sandboxing

### Privacy Protection
1. No external data transmission
2. Minimal data retention
3. Clear data on logout
4. No tracking or analytics
5. Transparent data handling

## Delivery Checklist

### Code Deliverables
- [ ] Complete extension source code
- [ ] Manifest.json with proper permissions
- [ ] All content scripts implemented
- [ ] Service worker with message handling
- [ ] Popup interface with controls
- [ ] Icons and visual assets

### Documentation
- [ ] Installation instructions
- [ ] User guide with screenshots
- [ ] Troubleshooting guide
- [ ] Code comments and JSDoc
- [ ] Architecture decision record

### Quality Assurance
- [ ] All test scenarios passing
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Cross-browser testing done
- [ ] Error handling verified

## Implementation Notes

### Start Here
1. Set up Context7 in Claude Code
2. Query for latest Chrome Extension Manifest V3 structure
3. Create the basic extension skeleton
4. Implement and test each component incrementally
5. Use Context7 for each new API or pattern needed

### Key Context7 Queries
- "Chrome Extension Manifest V3 content script patterns 2024"
- "LinkedIn profile DOM selectors current"
- "Google Contacts web UI automation 2024"
- "Chrome extension message passing best practices"
- "Chrome storage API patterns and limits"

### Development Workflow
1. Implement feature
2. Test in unpacked extension
3. Verify with real LinkedIn/Google Contacts
4. Handle edge cases
5. Document implementation decisions

## Engineering Standards and Operating Rules

### Core Development Principles

1. **Keep it simple**: Prefer boring, proven patterns over cleverness. Use vanilla JavaScript, standard DOM APIs, and Chrome Extension established patterns.

2. **Split by responsibility**: 
   - Small modules: Each file handles one concern
   - Small files: No file > 300 lines
   - Small functions: Each function does one thing well
   - Separate extraction logic from UI updates from message handling

3. **Minimize dependencies**: 
   - Use browser APIs first (fetch, DOM, chrome.*)
   - No external libraries or frameworks
   - If absolutely needed, wrap any third-party code behind thin adapters
   - Justify any deviation from vanilla JavaScript

4. **Validate all inputs at boundaries**:
   - Validate all messages between content scripts and service worker
   - Sanitize all data from LinkedIn DOM
   - Validate all inputs before Google Contacts updates
   - Use consistent error shapes across the extension

5. **Security first**:
   - Least privilege: Only request necessary permissions
   - Never store credentials or tokens
   - Deny by default: Whitelist allowed origins and actions
   - Never log sensitive data (emails, phones, personal info)
   - Sanitize all user inputs before DOM insertion

6. **Reliability**:
   - Implement timeouts for all async operations (5s default)
   - Retry with exponential backoff and jitter
   - Make all operations idempotent
   - Handle tab closure and navigation gracefully
   - Implement proper cleanup in all error paths

7. **Observability**:
   - Structured console logs with component prefix
   - Track key metrics: sync time, success rate, error frequency
   - Log user journey steps for debugging
   - Never log PII or sensitive data

8. **Testing approach**:
   - Manual testing > automated for DOM interaction
   - Test each fallback selector strategy
   - Verify behavior with different profile types
   - Test error scenarios and recovery

9. **Performance standards**:
   - Measure first: Use Performance API
   - Avoid premature optimization
   - Debounce user inputs (300ms)
   - Throttle API calls (1 per second)
   - Lazy load non-critical resources

10. **Documentation**:
    - Short, clear README with installation steps
    - Document selector strategies and fallbacks
    - Include Architecture Decision Records (ADRs) for key choices
    - Delete dead code immediately

### Development Workflow Requirements

#### Before Starting Any Feature
Ask for approval when:
- Adding any external dependency (should be none)
- Changing the message protocol structure
- Modifying storage schemas
- Introducing new user-facing features
- Adding new permission requirements

#### Code Structure Standards

```
Maximum file sizes:
- Content scripts: 300 lines
- Service worker: 400 lines  
- Individual functions: 50 lines
- Nested depth: 3 levels max
```

#### Error Handling Pattern
```javascript
// Consistent error shape
{
  error: true,
  code: 'PROFILE_EXTRACTION_FAILED',
  message: 'User-friendly message',
  details: { /* debugging info */ },
  recoverable: true,
  userAction: 'Please refresh and try again'
}
```

### Pull Request Checklist

Before considering the implementation complete, ensure:

- [ ] **Clear purpose and scope**: Each component has single responsibility
- [ ] **Size limits**: No file > 300 lines, functions < 50 lines
- [ ] **Error handling**: All async operations have timeout, retry, and error recovery
- [ ] **Input validation**: All boundaries validate and sanitize inputs
- [ ] **Security review**: 
  - No credential storage
  - Origin validation on all messages
  - No dynamic code execution
  - CSP compliant
- [ ] **Logging standards**:
  - Structured logs with component prefix
  - No PII in logs
  - User journey tracked
- [ ] **Performance verified**:
  - Profile extraction < 2s
  - Search operation < 3s
  - Memory usage < 50MB
- [ ] **Documentation updated**:
  - README with clear instructions
  - Selector strategies documented
  - ADR for significant decisions
- [ ] **Rollback plan**:
  - Version can be reverted
  - No destructive operations
  - State recovery possible

### Specific Implementation Guards

#### LinkedIn Extraction
- Implement minimum 3 fallback strategies per field
- Test with both free and premium accounts
- Handle connection-only visibility
- Verify with different language settings

#### Google Contacts Updates
- Never overwrite existing data
- Always show preview before update
- Implement undo capability
- Test with contacts in different states

#### Message Passing
- Validate origin on every message
- Include request ID for correlation
- Implement timeout (5s default)
- Handle tab closure mid-operation

### Decision Points Requiring Consultation

Stop and ask before:
1. Adding any npm package or external library
2. Changing the storage schema after initial implementation
3. Adding new Chrome permissions
4. Implementing features not in the PRD
5. Using eval() or dynamic code execution (never allowed)
6. Storing any user data beyond preferences
7. Making any external network calls

### Quality Gates

The implementation must pass these gates:

1. **Simplicity Gate**: Can a junior developer understand the code?
2. **Security Gate**: Does it follow least privilege and handle all inputs safely?
3. **Reliability Gate**: Does it handle all failure modes gracefully?
4. **Performance Gate**: Does it meet the performance benchmarks?
5. **Maintainability Gate**: Can selectors be easily updated when sites change?

## Final Notes

**Remember**: You are building a tool that will be used daily by professionals to maintain their contact network. Focus on reliability, user experience, and data integrity. Use Context7 MCP throughout development to ensure you're using the most current APIs and patterns.

**Success Criteria**: The extension should feel like a natural extension of both LinkedIn and Google Contacts, requiring minimal user effort while maintaining complete user control over the data synchronization process.

**Important**: Do not include example code in your implementation that might be outdated. Always query Context7 for the current patterns and APIs. The architecture and requirements are fixed, but the implementation details should use the latest available techniques.

**Engineering Excellence**: Follow the operating rules strictly. When in doubt, choose the simpler, more maintainable approach. This is a production tool that needs to work reliably every day.