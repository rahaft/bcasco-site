# Fix: Forms Executing Wrong Google Apps Script

## Problem
Forms are executing the first (deprecated) script instead of the second (current) script, even after updating the URL in Firebase.

## Solution Steps

### Step 1: Verify Current URL in Firestore

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to your project → **Firestore Database**
3. Go to: `settings` collection → `googleSheets` document
4. Check the `webAppUrl` field value

**Current (LATEST) URL should be (Version 6 - v1.0.2):**
```
https://script.google.com/macros/s/AKfycbxKsSFtiS4PVhGWmtzl-NDQDU5WcQp0Hu_WFxEYFHryKK_Y36bx2yw_co8BIPhigCIM/exec
```

**Previous working URL (Version 2 - still works but older):**
```
https://script.google.com/macros/s/AKfycbzE2cdK8Zy6r4Tkym1rywfmF-ZIWrvzFEHcTS-CNnkfd_nv2-ohpNOifQ9SmD29hFPYoQ/exec
```

**URLs to AVOID:**
- **Version 1 (DEPRECATED):** `https://script.google.com/a/macros/pathomap.co/s/AKfycbxbpgDUecJ5KTgRYAvlioIMH0aUx4gLeZ1bkbAo3xm282efrPOQsZgoffBOd7Gs0D0vTw/exec`
- **Version 3 (May have issues):** `https://script.google.com/macros/s/AKfycbxZsr5c2APyqIpeEw2ijnh-8-bFeBdnQDvzysFu5NrLbUJMivrIMXBEXp_Ds9Vft6YvUQ/exec` - This version returns "Script function not found" errors

### Step 2: Update Firestore if Needed

If the URL is wrong:

1. Click on the `webAppUrl` field
2. Delete the entire old URL
3. Paste the **LATEST** URL exactly (Version 6 - v1.0.2):
   ```
   https://script.google.com/macros/s/AKfycbxKsSFtiS4PVhGWmtzl-NDQDU5WcQp0Hu_WFxEYFHryKK_Y36bx2yw_co8BIPhigCIM/exec
   ```
4. **Important**: Make sure there are NO extra spaces before or after
5. Click **Update** or **Save**

### Step 3: Clear Browser Cache

The browser may be caching the old URL. Clear cache:

1. **Chrome/Edge**: Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
2. Select "Cached images and files"
3. Click "Clear data"
4. **OR** Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

### Step 4: Test and Verify

1. Open your website
2. Open **Developer Tools** (F12)
3. Go to the **Console** tab
4. Submit a test form (question or feedback)
5. Look for these console messages:

   **If using LATEST script (Version 6):**
   ```
   ✓ Using LATEST Google Apps Script URL (v1.0.2)
   Google Sheets: Sending to URL: https://script.google.com/macros/s/AKfycbxKsSFtiS4PVhGWmtzl-NDQDU5WcQp0Hu_WFxEYFHryKK_Y36bx2yw_co8BIPhigCIM/exec
   ```

   **If using WRONG script (WARNING):**
   ```
   ⚠️ WARNING: Using Version 3 script which may not be properly configured!
   Current URL in Firestore: [version 3 URL]
   Please update Firestore settings/googleSheets/webAppUrl to use Version 2 (CURRENT).
   Correct URL: https://script.google.com/macros/s/AKfycbzE2cdK8Zy6r4Tkym1rywfmF-ZIWrvzFEHcTS-CNnkfd_nv2-ohpNOifQ9SmD29hFPYoQ/exec
   ```

### Step 5: Verify in Google Apps Script

1. Go to [Google Apps Script](https://script.google.com)
2. Open the **CURRENT** script (the one you want to use)
3. Go to **Deploy** → **Manage deployments**
4. Verify the deployment URL matches the one in Firestore
5. If it doesn't match, copy the correct URL from the deployment and update Firestore

## Quick Verification Script

You can also verify the URL in the browser console:

1. Open your website
2. Press F12 to open Developer Tools
3. Go to **Console** tab
4. Paste and run this code:

```javascript
db.collection("settings").doc("googleSheets").get().then(doc => {
  if (doc.exists) {
    const url = doc.data().webAppUrl;
    console.log("Current URL in Firestore:", url);
    if (url.includes("AKfycbxbpgDUecJ5KTgRYAvlioIMH0aUx4gLeZ1bkbAo3xm282efrPOQsZgoffBOd7Gs0D0vTw")) {
      console.error("❌ WRONG: Using deprecated Version 1 script!");
    } else if (url.includes("AKfycbxZsr5c2APyqIpeEw2ijnh-8-bFeBdnQDvzysFu5NrLbUJMivrIMXBEXp_Ds9Vft6YvUQ")) {
      console.error("❌ WRONG: Using Version 3 script (may have configuration issues)!");
      console.log("Update to Version 2 URL:", "https://script.google.com/macros/s/AKfycbzE2cdK8Zy6r4Tkym1rywfmF-ZIWrvzFEHcTS-CNnkfd_nv2-ohpNOifQ9SmD29hFPYoQ/exec");
    } else if (url.includes("AKfycbxKsSFtiS4PVhGWmtzl-NDQDU5WcQp0Hu_WFxEYFHryKK_Y36bx2yw_co8BIPhigCIM")) {
      console.log("✓ CORRECT: Using LATEST script (Version 6 - v1.0.2)!");
    } else if (url.includes("AKfycbzE2cdK8Zy6r4Tkym1rywfmF-ZIWrvzFEHcTS-CNnkfd_nv2-ohpNOifQ9SmD29hFPYoQ")) {
      console.log("✓ OK: Using Version 2 script (works, but consider updating to latest)");
    } else {
      console.warn("⚠️ Unknown URL - verify manually");
    }
  } else {
    console.error("No googleSheets document found in settings!");
  }
});
```

## Still Not Working?

If you've done all the above and it's still using the old script:

1. **Check for multiple Firestore databases**: Make sure you're updating the correct database (production vs. development)
2. **Check browser console errors**: Look for any errors that might prevent the URL from being read
3. **Try incognito/private mode**: This bypasses all cache
4. **Verify script ownership**: Make sure the current script is owned by the correct Google account

## Notes

- The code reads the URL from Firestore **every time** a form is submitted (no caching in code)
- If the console shows the wrong URL, it means Firestore still has the old value
- The warning message will appear in the console if the deprecated URL is detected
