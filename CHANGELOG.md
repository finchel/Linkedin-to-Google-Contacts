# Changelog

All notable changes to the LinkedIn to Google Contacts extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-26

### Added
- Initial release of LinkedIn to Google Contacts Chrome Extension
- "Add to Contacts" button on LinkedIn profiles
- Contact Info modal extraction with enhanced accuracy
- Helper panel for Google Contacts with auto-fill functionality
- Strict phone number validation to prevent false matches
- Email extraction from `mailto:` links and text content
- Website extraction with social media filtering
- Comprehensive test suite with real LinkedIn HTML examples
- Privacy protection with .gitignore for personal data
- MIT License

### Technical Features
- Manifest V3 compatible
- Simple helper-based architecture (no complex automation)
- Structured Contact Info extraction using `.pv-contact-info__contact-type`
- MutationObserver for dynamic content detection
- Cross-origin messaging between content scripts

### Security
- Minimal permissions model
- Content Security Policy compliant
- No external API dependencies
- No data storage or transmission

### Known Compatible Versions
- Chrome: 120+ (Manifest V3)
- LinkedIn: Current as of December 2024
- Google Contacts: Current web version

---

## Update Instructions

When updating the extension:

1. Document changes here following the format above
2. Update version in `manifest.json` and `package.json`
3. Run tests: `npm test`
4. Commit with descriptive message
5. Tag release: `git tag -a v1.0.1 -m "Description"`
6. Push to GitHub: `git push && git push --tags`

## Version History Guidelines

- **Major version (1.0.0)**: Breaking changes, complete rewrites
- **Minor version (0.1.0)**: New features, significant improvements  
- **Patch version (0.0.1)**: Bug fixes, selector updates, small improvements

## Common Update Scenarios

### LinkedIn UI Change
```markdown
## [1.0.1] - 2025-XX-XX
### Fixed
- Updated LinkedIn profile selectors for new UI layout
- Fixed Contact Info modal detection after LinkedIn update
```

### Google Contacts Update
```markdown
## [1.0.2] - 2025-XX-XX  
### Fixed
- Updated Google Contacts input field selectors
- Fixed helper panel positioning on new layout
```

### Feature Addition
```markdown
## [1.1.0] - 2025-XX-XX
### Added
- Bulk contact export feature
- CSV download option
### Changed
- Improved email validation logic
```