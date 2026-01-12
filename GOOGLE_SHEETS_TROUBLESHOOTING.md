# Google Sheets Integration Troubleshooting Guide

## Quick Connection Test

### Step 1: Verify Firestore Configuration
1. Go to Firebase Console → Firestore Database
2. Navigate to: `settings` collection → `googleSheets` document
3. Verify the `webAppUrl` field contains exactly:
   ```
   https://script.google.com/macros/s/AKfycbzE2cdK8Zy6r4Tkym1rywfmF-ZIWrvzFEHcTS-CNnkfd_nv2-ohpNOifQ9SmD29hFPYoQ/exec
   ```
4. **Important**: Make sure there are no extra spaces or line breaks
5. **Note**: 
   - If you see a URL with `/a/macros/pathomap.co/`, that's Version 1 (deprecated) - update it!
   - If you see `AKfycbxZsr5c2APyqIpeEw2ijnh-8-bFeBdnQ...`, that's Version 3 which has configuration issues - update to Version 2!

### Step 2: Check Browser Console for Errors
1. Open your website in a browser
2. Open Developer Tools (F12 or Right-click → Inspect)
3. Go to the **Console** tab
4. Submit a test question or feedback form
5. Look for any error messages, especially:
   - "Google Sheets submission failed"
   - "Could not load Google Sheets config"
   - Any CORS or network errors

### Step 3: Verify Google Apps Script Configuration
1. Go to [Google Apps Script](https://script.google.com)
2. Open your "BCASCO Form Handler" project
3. **CRITICAL**: Check line 8 in the script:
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
   ```
   - This MUST be replaced with your actual Google Sheet ID
   - Find your Sheet ID in the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Example: If your URL is `https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit`
     Then `SPREADSHEET_ID = '1a2b3c4d5e6f7g8h9i0j'`
4. After updating, click **Save** and **Deploy** → **Manage deployments** → **Edit** → **New version** → **Deploy**

### Step 4: Verify Google Sheet Structure
1. Open your Google Sheet
2. Make sure you have TWO sheets (tabs) with these exact names:
   - **"Questions"** (case-sensitive)
   - **"Feedback"** (case-sensitive)
3. Verify the headers are set up correctly:

   **Questions sheet (Row 1):**
   - A1: `Timestamp`
   - B1: `Event ID`
   - C1: `Event Title`
   - D1: `Name`
   - E1: `Email`
   - F1: `Question`
   - G1: `Comments`

   **Feedback sheet (Row 1):**
   - A1: `Timestamp`
   - B1: `Event ID`
   - C1: `Event Title`
   - D1: `Name`
   - E1: `Email`
   - F1: `Rating`
   - G1: `Comments`

### Step 5: Check Google Apps Script Execution Logs
1. In Google Apps Script editor, go to **View** → **Logs** (or click the clock icon)
2. Submit a test form on your website
3. Check the logs for:
   - Success messages
   - Error messages (like "Questions sheet not found" or "SPREADSHEET_ID" errors)
4. Also check **Executions** tab to see if the script is being called

### Step 6: Test the Connection Manually
1. In Google Apps Script editor, select the `testQuestionSubmission` function
2. Click **Run** (play button)
3. Check the **Execution log** for any errors
4. Check your Google Sheet to see if a test row was added

### Step 7: Verify Web App Deployment Settings
1. In Google Apps Script, go to **Deploy** → **Manage deployments**
2. Click the gear icon (⚙️) next to your deployment
3. Verify:
   - **Execute as**: "Me"
   - **Who has access**: "Anyone" (this is critical!)
4. If "Who has access" is not "Anyone", update it and redeploy

## Common Issues and Solutions

### Issue: Data appears in Firestore but not in Google Sheets
**Solution**: 
- Check browser console for errors
- Verify SPREADSHEET_ID is set correctly in Apps Script
- Check Apps Script execution logs

### Issue: "Questions sheet not found" error
**Solution**: 
- Make sure your Google Sheet has a sheet named exactly "Questions" (case-sensitive)
- Make sure the SPREADSHEET_ID points to the correct spreadsheet

### Issue: "SPREADSHEET_ID" error or script fails
**Solution**: 
- Replace `'YOUR_SPREADSHEET_ID'` with your actual Sheet ID
- Redeploy the script after making changes

### Issue: No errors but data doesn't appear
**Solution**: 
- Check that the web app deployment has "Who has access" set to "Anyone"
- Verify the URL in Firestore matches the deployment URL exactly
- Check Apps Script execution logs to see if requests are being received

### Issue: CORS errors in browser console
**Solution**: 
- This is expected with `no-cors` mode - the code handles this silently
- Check Apps Script logs instead to verify data is being received

## Testing Checklist

- [ ] Firestore `settings/googleSheets/webAppUrl` is set correctly
- [ ] Google Apps Script `SPREADSHEET_ID` is replaced with actual Sheet ID
- [ ] Google Sheet has "Questions" and "Feedback" sheets with correct headers
- [ ] Web app deployment has "Who has access" set to "Anyone"
- [ ] Submitted a test form and checked browser console (no critical errors)
- [ ] Checked Apps Script execution logs
- [ ] Verified data appears in Google Sheet

## Still Not Working?

If you've checked all the above:
1. Share the error messages from browser console
2. Share the error messages from Apps Script execution logs
3. Verify the exact URL in Firestore matches the deployment URL
4. Try creating a new deployment and updating the URL in Firestore
