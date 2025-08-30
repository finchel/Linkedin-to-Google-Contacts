# Development Guidelines

## ⚠️ CRITICAL: Read Before Development
**MUST READ:** See [LESSONS-LEARNED.md](./LESSONS-LEARNED.md) for critical development practices, common pitfalls, and debugging methodology learned from real bug fixes.

## 🚨 CRITICAL: Data Privacy and Security

### Personal Data Handling

**⚠️ NEVER COMMIT PERSONAL DATA TO THE REPOSITORY**

All personal data, profile examples, and vetted data MUST remain in the `LinkedInProfileExamples` folder and NEVER be committed to the Git repository.

### Folder Structure

```
LinkedInToContacts_extention/          # Main extension code (safe to commit)
├── content-scripts/
├── popup/
├── styles/
├── test-extraction-improvements.js    # Safe: contains no personal data
└── .gitignore                        # Updated to exclude examples

LinkedInProfileExamples/               # NEVER COMMIT THIS FOLDER
├── vetted_data/                      # User-approved correct data
├── profile_name_2025-08-28/         # Profile examples
├── profile_name2_2025-08-27/        # Profile examples
└── test-against-vetted-data.js      # Test script using examples
```

### .gitignore Requirements

The following patterns MUST be in `.gitignore`:

```gitignore
# Example files containing personal data - NEVER COMMIT
examples/
**/examples/
../LinkedInProfileExamples/
**/LinkedinProfileExamples/
vetted_data/
**/vetted_data/

# HTML files with personal information
*.html.txt
*LinkedIn html*.txt
*Google contact html*.txt

# Screenshots with personal information
*Screenshot*.jpg
*Screenshot*.png
*.jpg
*.png
```

## 🧪 Testing and Validation

### Test Files Location

- **Extension tests**: Keep in the extension folder (no personal data)
- **Validation tests**: Keep in `LinkedInProfileExamples` folder (contains personal references)

### Extraction Improvements

#### Current Status

1. **✅ Completed**: 
   - Phone number validation (rejects timestamps)
   - Website URL filtering (flags event platforms)  
   - Email validation improvements
   - Confidence scoring system (0-100%)
   - User approval workflow design

2. **🔄 In Progress**:
   - Integration into main extension
   - User approval UI components
   - Service worker message handling

#### Key Files

- `linkedin-extractor-improved.js` - Enhanced extraction with confidence scoring
- `linkedin-extractor.js` - Original extractor (currently active)
- `test-extraction-improvements.js` - Validation test suite

### Vetted Data System

#### Purpose
Store user-approved correct data for validation and improvement testing.

#### Structure
```json
{
  "profileName": "Name",
  "vettedDate": "YYYY-MM-DD",
  "extractedData": {
    "original": { /* what extension extracted */ },
    "issues": { /* problems identified */ }
  },
  "correctedData": { /* user-approved correct values */ },
  "confidenceScores": { /* confidence levels 0-100 */ }
}
```

#### Usage
1. Extract profile data
2. Identify low-confidence fields  
3. Request user approval/correction
4. Save corrected data in `vetted_data/` folder
5. Use for future validation and improvements

## 🔧 Development Workflow

### Before Committing

1. **Check for personal data**: 
   ```bash
   git status
   # Ensure no files from LinkedInProfileExamples appear
   ```

2. **Run tests**:
   ```bash
   npm test
   ```

3. **Validate no personal references**:
   ```bash
   grep -r "personal_name\|@email\|phone_number" content-scripts/ popup/ styles/
   # Should return no results
   ```

### Adding New Profile Examples

1. Save all profile data in `LinkedInProfileExamples/[name]_[date]/`
2. Never reference personal data in committed code
3. Use generic examples in tests and documentation

### Integration Process

1. Develop improvements in separate files (`*-improved.js`)
2. Test thoroughly with vetted data
3. Update main files only after validation
4. Update manifest.json to use new files
5. Test end-to-end functionality

## 📝 Code Standards

### Confidence Scoring

All extraction functions should return:
```javascript
{
  value: "extracted_value",
  confidence: 0-100,
  reason: "explanation_if_low_confidence"
}
```

### Error Handling

- Never log personal data
- Use generic error messages
- Store detailed errors only in local extension storage

### User Approval Flow

1. Extract data with confidence scores
2. Flag fields with confidence < 100%
3. Present to user for approval
4. Save user corrections as vetted data
5. Update extraction algorithms based on patterns

## 🚀 Deployment Checklist

- [ ] No personal data in repository
- [ ] All tests pass
- [ ] .gitignore properly configured
- [ ] Documentation updated
- [ ] Extension validated with `npm test`
- [ ] Manual testing on various profiles
- [ ] User approval workflow tested

## 📞 Support

When reporting issues:
- Never include personal data in issue descriptions
- Use generic examples or create mock data
- Reference vetted data files by name only (stored separately)

---

**Remember**: The safety and privacy of user data is paramount. When in doubt, don't commit it.