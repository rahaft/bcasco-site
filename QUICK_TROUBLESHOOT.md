# Quick Troubleshooting Guide - Form Submission Not Working

## Step 1: Test the Google Apps Script Properly

**Don't run `doPost` directly** - it will always error because it needs a web request.

Instead, use the test functions:

1. In Google Apps Script editor, select **`testQuestionSubmission`** from the function dropdown
2. Click **Run** (▶️)
3. Check the **Execution log** - it should show success
4. Check your Google Sheet - a test row should appear in the "Questions" sheet

If this works, your script is fine. If it errors, check:
- Does your Google Sheet have a tab named exactly "Questions"?
- Are the headers set up correctly?

## Step 2: Verify Firestore Configuration

1. Go to Firebase Console → Firestore Database
2. Navigate to: `settings` → `googleSheets` document
3. Verify the `webAppUrl` field contains **exactly**:
   ```
   https://script.google.com/macros/s/AKfycbzE2cdK8Zy6r4Tkym1rywfmF-ZIWrvzFEHcTS-CNnkfd_nv2-ohpNOifQ9SmD29hFPYoQ/exec
   ```
4. Make sure there are no extra spaces or characters
5. **Warning**: If you see a URL with `/a/macros/pathomap.co/`, that's the OLD deprecated script - you need to update it!

## Step 3: Check Browser Console

1. Open your website
2. Press **F12** to open Developer Tools
3. Go to the **Console** tab
4. Submit a test form (question or feedback)
5. Look for any red error messages, especially:
   - "Google Sheets submission failed"
   - "Could not load Google Sheets config"
   - Any network errors

## Step 4: Check Apps Script Execution Logs (Real Submissions)

1. In Google Apps Script editor, go to **Executions** (left sidebar, clock icon)
2. Submit a test form on your website
3. Wait a few seconds, then refresh the Executions page
4. Look for new executions - click on them to see:
   - Did the script run?
   - What errors occurred?
   - What data was received?

## Step 5: Verify Google Sheet Structure

Your Google Sheet must have:

1. **Two tabs** with these exact names (case-sensitive):
   - `Questions`
   - `Feedback`

2. **Questions sheet headers** (Row 1):
   - A1: `Timestamp`
   - B1: `Event ID`
   - C1: `Event Title`
   - D1: `Name`
   - E1: `Email`
   - F1: `Question`
   - G1: `Comments`

3. **Feedback sheet headers** (Row 1):
   - A1: `Timestamp`
   - B1: `Event ID`
   - C1: `Event Title`
   - D1: `Name`
   - E1: `Email`
   - F1: `Rating`
   - G1: `Comments`

## Step 6: Test the Connection Manually

You can test if the web app URL is accessible:

1. Open a new browser tab
2. Go to your web app URL:
   ```
   https://script.google.com/a/macros/pathomap.co/s/AKfycbzE2cdK8Zy6r4Tkym1rywfmF-ZIWrvzFEHcTS-CNnkfd_nv2-ohpNOifQ9SmD29hFPYoQ/exec
   ```
3. You should see a message (might say "Script function not found" or similar - that's OK for GET requests)
4. If you get a 404 or access denied, the deployment might have an issue

## Common Issues:

### Issue: Test functions work but real submissions don't
- **Solution**: Check Firestore URL matches exactly
- Check browser console for errors
- Check Apps Script Executions for real submission attempts

### Issue: "Questions sheet not found" error
- **Solution**: Make sure sheet tab is named exactly "Questions" (case-sensitive, no extra spaces)

### Issue: No errors but data doesn't appear
- **Solution**: 
  - Check Apps Script Executions to see if requests are being received
  - Verify the SPREADSHEET_ID in your script matches your actual sheet
  - Check that "Who has access" is set to "Anyone" in deployment settings

### Issue: Browser console shows "Google Sheets submission failed"
- **Solution**: 
  - Check the exact error message
  - Verify Firestore URL is correct
  - Check Apps Script Executions for more details
