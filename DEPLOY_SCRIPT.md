# Deploy Google Apps Script - Step by Step Guide

This guide will help you deploy the latest version of the Google Apps Script to ensure you're using the most up-to-date code.

## Prerequisites

- Access to the Google Sheet: https://docs.google.com/spreadsheets/d/1cuUyYihgoLX6cePNYP2MSS0C42psktMKg81006t43pQ/edit
- The script should be owned by the correct Google account (bcasco.maryland@gmail.com for proper email sending)

## Step 1: Open Google Apps Script

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1cuUyYihgoLX6cePNYP2MSS0C42psktMKg81006t43pQ/edit
2. Click **Extensions** → **Apps Script**
3. This will open the Apps Script editor in a new tab

## Step 2: Update the Script Code

1. In the Apps Script editor, you should see the current script code
2. **Copy the entire contents** of `google-apps-script.js` from your project
3. **Select all** the code in the Apps Script editor (Ctrl+A or Cmd+A)
4. **Paste** the new code (this will replace all existing code)
5. Click **Save** (💾 icon) or press Ctrl+S / Cmd+S
6. Give it a name like "BCASCO Form Handler" if prompted

## Step 3: Deploy as Web App

### Option A: Create a New Deployment (Recommended)

1. Click **Deploy** → **New deployment**
2. Click the gear icon (⚙️) next to "Select type"
3. Choose **Web app** from the dropdown
4. Fill in the deployment settings:
   - **Description**: "BCASCO Forms to Sheets v1.0.2" (or current version)
   - **Execute as**: "Me" (your account)
   - **Who has access**: **"Anyone"** (IMPORTANT - this allows your website to send data)
5. Click **Deploy**
6. **IMPORTANT**: Copy the **Web App URL** that appears - you'll need this!
7. Click **Authorize access** if prompted and follow the authorization steps

### Option B: Update Existing Deployment (If you want to keep the same URL)

1. Click **Deploy** → **Manage deployments**
2. Find your existing deployment (look for the one with the URL you're currently using)
3. Click the pencil icon (✏️) to edit
4. Click **New version** to create a new version with the updated code
5. Click **Deploy**
6. The URL will stay the same, so you won't need to update Firestore

## Step 4: Update Firestore (Only if you created a NEW deployment)

If you created a **new deployment** (Option A), you'll have a new URL. You need to update Firestore:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to your project → **Firestore Database**
3. Go to: `settings` collection → `googleSheets` document
4. Update the `webAppUrl` field with your **new Web App URL**
5. Make sure there are no extra spaces
6. Save the document

**If you updated an existing deployment (Option B)**, you can skip this step - the URL stays the same.

## Step 5: Verify the Deployment

1. Open your website
2. Open Developer Tools (F12) → Console tab
3. Run the verification script:
   ```javascript
   db.collection("settings").doc("googleSheets").get().then(doc => {
     if (doc.exists) {
       const url = doc.data().webAppUrl;
       console.log("Current URL in Firestore:", url);
       if (url.includes("AKfycbzE2cdK8Zy6r4Tkym1rywfmF-ZIWrvzFEHcTS-CNnkfd_nv2-ohpNOifQ9SmD29hFPYoQ")) {
         console.log("✓ CORRECT: Using Version 2 (current) script!");
       } else {
         console.warn("⚠️ URL doesn't match expected Version 2 URL");
       }
     }
   });
   ```
4. Submit a test form (question or feedback)
5. Check the console - you should see:
   ```
   ✓ Using CURRENT Google Apps Script URL (Version 2)
   ```
6. Check your Google Sheet to verify data was written

## Step 6: Test the Script Functions

In the Apps Script editor, you can test the script:

1. Select **`testQuestionSubmission`** from the function dropdown (top toolbar)
2. Click **Run** (▶️)
3. Check the **Execution log** (View → Logs) for any errors
4. Check your Google Sheet - a test row should appear in the "Questions" sheet
5. Repeat with **`testFeedbackSubmission`** to test feedback submissions

## Important Notes

- **Script Ownership**: The script should be owned by `bcasco.maryland@gmail.com` to send emails from that address
- **Sheet Access**: Make sure the script has permission to access the Google Sheet
- **Deployment URL**: Each new deployment gets a new URL. If you want to keep the same URL, use "Manage deployments" → "New version"
- **Version Number**: The script version is `1.0.2` - this helps track which version is deployed

## Troubleshooting

- **"Script function not found"**: Make sure you deployed as a Web App (not a library or API executable)
- **Permission errors**: Re-authorize the script in the deployment settings
- **Data not appearing**: Check Apps Script execution logs (View → Logs) for errors
- **Wrong URL in console**: Make sure you updated Firestore with the new deployment URL

## Current Script Information

- **Version**: 1.0.2
- **Sheet ID**: 1cuUyYihgoLX6cePNYP2MSS0C42psktMKg81006t43pQ
- **Notification Email**: bwiseman84@hotmail.com
- **Sender Email**: bcasco.maryland@gmail.com
