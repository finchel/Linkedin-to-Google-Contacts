# Product Requirements Document (PRD)
## LinkedIn to Google Contacts Sync Chrome Extension

### Executive Summary
A Chrome extension that enables users to seamlessly sync LinkedIn profile information to their Google Contacts using existing browser sessions, eliminating the need for API keys, OAuth setup, or external servers.

### Problem Statement
When meeting new professional contacts, users typically:
1. Connect on WhatsApp and save phone numbers to Google Contacts
2. Connect on LinkedIn
3. Manually copy LinkedIn information to Google Contacts

This manual process is time-consuming, error-prone, and often neglected, resulting in incomplete contact information.

### Solution Overview
A browser-based Chrome extension that automates the synchronization of LinkedIn profile data to Google Contacts using the user's existing authenticated sessions in both services.

## User Persona

**Primary User**: Professional networker
- Attends conferences, meetings, and networking events
- Values maintaining comprehensive contact information
- Already uses Google Contacts as primary contact management system
- Active LinkedIn user
- Time-conscious, prefers automation but requires control
- Privacy-conscious, avoids third-party services

## User Journey

### Current State (Pain Points)
1. User meets someone at an event
2. Exchanges WhatsApp contact
3. Manually saves name and phone to Google Contacts
4. Receives/sends LinkedIn connection request
5. Has to manually search Google Contacts
6. Copy-pastes LinkedIn URL to notes
7. Manually adds company and title
8. Often forgets or skips this process

### Future State (With Solution)
1. User meets someone at an event
2. Exchanges WhatsApp contact and saves to Google Contacts
3. Receives/sends LinkedIn connection request
4. **NEW**: Clicks "Sync to Google Contacts" button on LinkedIn profile
5. **NEW**: Confirms the matching contact in Google Contacts
6. **NEW**: Adds custom note (e.g., "Met at RSAC 2023")
7. **AUTOMATED**: LinkedIn data synced to contact

## Functional Requirements

### Core Features (MVP)

#### FR1: LinkedIn Profile Data Extraction
- **FR1.1**: Extract from any LinkedIn profile page:
  - Full name
  - Profile URL
  - Current company name
  - Current job title
  - Profile photo URL
  - Location
  - Headline/tagline
- **FR1.2**: Extract from Contact Info (when available):
  - Email address(es)
  - Phone number(s)
  - Websites
  - Birthday (if visible)
- **FR1.3**: Handle profiles with limited visibility gracefully
- **FR1.4**: Support both personal profiles and company employee profiles

#### FR2: LinkedIn UI Integration
- **FR2.1**: Add "Sync to Google Contacts" button on profile pages
  - Location: Near existing action buttons (Connect, Message, More)
  - Visual style: Consistent with LinkedIn's design system
  - State management: Show loading/success/error states
- **FR2.2**: Button visibility rules:
  - Show on all profile pages (not just connections)
  - Hide on own profile
  - Disable during processing
- **FR2.3**: Visual feedback during sync process

#### FR3: Google Contacts Search & Matching
- **FR3.1**: Automated search in Google Contacts using extracted name
- **FR3.2**: Intelligent matching algorithm:
  - Exact name match
  - Partial name match (first + last name variations)
  - Nickname handling
  - Company-based matching as secondary signal
- **FR3.3**: Present potential matches to user for confirmation
- **FR3.4**: Handle multiple matches:
  - Show all potential matches
  - Allow user to select correct one
  - Option to create new if no match
- **FR3.5**: Handle zero matches:
  - Offer to create new contact
  - Pre-fill with LinkedIn data

#### FR4: Contact Update Process
- **FR4.1**: Update existing contact fields:
  - Company (current organization)
  - Job title (current position)
  - Email (if not already present)
  - Phone (if not already present)
- **FR4.2**: Append to Notes field:
  - LinkedIn profile URL
  - Sync timestamp
  - Custom message from user
  - Preserve existing notes
- **FR4.3**: Profile photo handling:
  - Download LinkedIn photo
  - Upload to Google Contact if no photo exists
  - Skip if contact already has photo
- **FR4.4**: Conflict resolution:
  - Don't overwrite existing data
  - Append new information
  - Show user what will be updated

#### FR5: Custom Message Management
- **FR5.1**: Prompt for custom message during sync
- **FR5.2**: Persist last used message
- **FR5.3**: Pre-populate with last message
- **FR5.4**: Allow editing before each sync
- **FR5.5**: Common templates:
  - "Met at [Event Name] [Date]"
  - "Connected via [Person/Company]"
  - "Interview candidate for [Position]"

#### FR6: Extension Popup Interface
- **FR6.1**: Status display:
  - Ready/Processing/Error states
  - Last sync information
  - Statistics (contacts synced today/week/total)
- **FR6.2**: Quick actions:
  - Open LinkedIn
  - Open Google Contacts
  - View sync history
  - Clear stored data
- **FR6.3**: Settings:
  - Enable/disable auto-search
  - Default custom message
  - Photo sync preference

### Phase 2 Features (Post-MVP)

#### FR7: Batch Processing
- **FR7.1**: Process multiple profiles from LinkedIn search results
- **FR7.2**: Process pending connection requests
- **FR7.3**: Sync from "My Network" page

#### FR8: Enhanced Matching
- **FR8.1**: Use phone number for matching (from WhatsApp flow)
- **FR8.2**: Use email for matching
- **FR8.3**: Machine learning-based matching suggestions

#### FR9: Automation Features
- **FR9.1**: Auto-sync when accepting connection requests
- **FR9.2**: Periodic re-sync of existing contacts
- **FR9.3**: Detect and sync profile updates

## Non-Functional Requirements

### NFR1: Performance
- **NFR1.1**: Profile extraction < 2 seconds
- **NFR1.2**: Contact search < 3 seconds
- **NFR1.3**: Complete sync process < 10 seconds
- **NFR1.4**: Extension load time < 100ms
- **NFR1.5**: Memory usage < 50MB

### NFR2: Reliability
- **NFR2.1**: Handle network failures gracefully
- **NFR2.2**: Retry failed operations with exponential backoff
- **NFR2.3**: Preserve data during browser crashes
- **NFR2.4**: Work across LinkedIn UI updates
- **NFR2.5**: 99% success rate for profile extraction

### NFR3: Security & Privacy
- **NFR3.1**: No external server communication
- **NFR3.2**: All processing in browser sandbox
- **NFR3.3**: No storage of credentials
- **NFR3.4**: Use existing browser sessions only
- **NFR3.5**: No data persistence beyond necessary
- **NFR3.6**: Clear sensitive data on logout

### NFR4: Usability
- **NFR4.1**: Single-click initiation
- **NFR4.2**: Maximum 3 user interactions per sync
- **NFR4.3**: Clear error messages
- **NFR4.4**: Undo capability for updates
- **NFR4.5**: Keyboard shortcuts support

### NFR5: Compatibility
- **NFR5.1**: Chrome version 120+
- **NFR5.2**: Edge Chromium support
- **NFR5.3**: LinkedIn (both old and new UI)
- **NFR5.4**: Google Contacts (current version)
- **NFR5.5**: Handle UI changes gracefully

## User Stories

### US1: Basic Sync Flow
**As a** professional networker  
**I want to** sync a LinkedIn profile to Google Contacts  
**So that** I have complete contact information in one place  

**Acceptance Criteria:**
- Button appears on LinkedIn profiles
- Clicking initiates sync process
- Google Contacts opens and searches
- I can confirm the match
- Contact is updated with LinkedIn data
- Success message confirms completion

### US2: Custom Note Addition
**As a** user who meets people at events  
**I want to** add context about where I met someone  
**So that** I remember the connection context  

**Acceptance Criteria:**
- Prompted for custom message during sync
- Last message is remembered and pre-filled
- Can edit message before saving
- Message appears in contact notes
- Timestamp included automatically

### US3: Duplicate Prevention
**As a** user with existing contacts  
**I want to** avoid creating duplicate entries  
**So that** my contacts remain organized  

**Acceptance Criteria:**
- Search finds existing contacts
- Shows me potential matches
- I can confirm the right match
- Prevents duplicate creation
- Merges information intelligently

### US4: Connection Request Workflow
**As a** user with pending LinkedIn invitations  
**I want to** easily identify and sync new connections  
**So that** I can process contacts efficiently  

**Acceptance Criteria:**
- Can sync from invitation page
- Matches invitation to contact
- Adds connection date to notes
- Processes accepted connections

## Success Metrics

### Adoption Metrics
- Extension installations
- Daily active users
- Sync button click rate on profiles

### Usage Metrics
- Contacts synced per user per week
- Success rate of syncs
- Average time to complete sync
- Custom message usage rate

### Quality Metrics
- Error rate < 1%
- User intervention required < 20%
- Correct match rate > 95%
- Performance SLA adherence

### User Satisfaction
- Task completion rate > 90%
- User-reported time savings
- Feature request patterns
- Support ticket volume

## Technical Constraints

1. **Browser Limitations**
   - Must work within Chrome extension sandbox
   - Cannot access cross-origin resources directly
   - Limited to browser storage APIs

2. **Platform Dependencies**
   - LinkedIn DOM structure changes
   - Google Contacts UI updates
   - Chrome extension manifest v3 requirements

3. **No External Services**
   - No server infrastructure
   - No API keys or OAuth
   - No third-party services

## Release Criteria

### MVP Release
- [ ] Core sync functionality working
- [ ] LinkedIn button integration complete
- [ ] Google Contacts update working
- [ ] Custom message feature complete
- [ ] Error handling implemented
- [ ] 100 successful test syncs
- [ ] Documentation complete

### Production Release
- [ ] Performance metrics met
- [ ] Security review passed
- [ ] User testing completed (10+ users)
- [ ] Edge cases handled
- [ ] Monitoring in place
- [ ] Rollback plan prepared

## Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| LinkedIn UI changes | High | High | Implement flexible selectors, monitoring, quick update process |
| Google Contacts changes | High | Medium | Abstract UI interaction layer, version detection |
| Rate limiting | Medium | Medium | Add delays, respect limits, user notification |
| Privacy concerns | High | Low | Clear privacy policy, local-only processing |
| Browser compatibility | Medium | Low | Feature detection, graceful degradation |

## Dependencies

- User must be logged into LinkedIn
- User must be logged into Google account
- Chrome browser version 120+
- Active internet connection
- Access to both services not blocked by corporate policy

## Out of Scope (Explicitly Not Included)

- Mobile app support
- Firefox/Safari support
- Bulk import from CSV
- Two-way synchronization
- CRM integration
- Team/enterprise features
- API-based implementation
- Server-side processing
- Contact export features
- LinkedIn Sales Navigator support