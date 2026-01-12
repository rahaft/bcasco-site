# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets integration for the "Ask Questions" and "Provide Feedback" forms.

## Step 1: Create Google Sheets

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet (or use an existing one)
3. Create two sheets within the spreadsheet:
   - Name one sheet: **"Questions"**
   - Name another sheet: **"Feedback"**

## Step 2: Set Up Headers

### For the "Questions" sheet:
In row 1, add these column headers:
- A1: `Timestamp`
- B1: `Event ID`
- C1: `Event Title`
- D1: `Name`
- E1: `Email`
- F1: `Question`
- G1: `Comments`

### For the "Feedback" sheet:
In row 1, add these column headers:
- A1: `Timestamp`
- B1: `Event ID`
- C1: `Event Title`
- D1: `Name`
- E1: `Email`
- F1: `Rating`
- G1: `Comments`

## Step 3: Create Google Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any default code
3. Copy and paste the code from `google-apps-script.js` (see below)
4. Click **Save** (floppy disk icon) and give your project a name like "BCASCO Form Handler"

## Step 4: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon (⚙️) next to "Select type" and choose **Web app**
3. Set the following:
   - **Description**: "BCASCO Forms to Sheets"
   - **Execute as**: "Me"
   - **Who has access**: "Anyone" (this allows your website to send data)
4. Click **Deploy**
5. **IMPORTANT**: Copy the **Web App URL** that appears - you'll need this in the next step
6. Click **Authorize access** and follow the prompts to grant permissions

## Step 5: Configure Your Website

1. Go to your Firebase Console → Firestore Database
2. Create or navigate to the `settings` collection
3. Create a document with ID `googleSheets`
4. Add a field `webAppUrl` (type: string) with your Web App URL from Step 4
5. Save the document
6. The code will automatically send form submissions to both Firestore AND Google Sheets

**Note:** If you don't configure this, forms will still work - they'll just save to Firestore only (which is fine!).

## Security Note

The Web App URL will be visible in your website's code. This is okay because:
- The script only accepts POST requests with specific data
- It only writes to your specific Google Sheet
- You can revoke access anytime by deleting the deployment

## Testing

After setup, test by:
1. Submitting a question through the website
2. Submitting feedback through the website
3. Checking your Google Sheet to see if the data appears

## Troubleshooting

- If data doesn't appear: Check the Apps Script execution logs (View → Logs)
- If you get permission errors: Make sure you authorized the script
- If the URL doesn't work: Make sure "Who has access" is set to "Anyone"
