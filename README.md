## Patapsco Seniors – Public Website

Static HTML/CSS/JS site for the Patapsco Senior Citizens group, designed with large type and high contrast for accessibility.

### Local Preview

- Open `index.html` directly in your browser, or
- From this folder, run a simple local server (for example, with Python):

```bash
cd path/to/vcl-potapsconursing
python -m http.server 8000
```

Then open `http://localhost:8000/index.html` in your browser.

### Deploying to Firebase Hosting

1. **Create a Firebase project (one-time)**
   - Go to the Firebase Console and create a new project.
   - In the project settings, note the **Project ID** (for example, `patapsco-seniors`).

2. **Install Firebase CLI (one-time)**

```bash
npm install -g firebase-tools
```

3. **Log in to Firebase**

```bash
firebase login
```

4. **Set the project ID**
   - Open `.firebaserc` in this folder.
   - Replace `YOUR_FIREBASE_PROJECT_ID` with your actual project ID from step 1.

5. **Deploy the site**

From this folder run:

```bash
firebase deploy --only hosting
```

Firebase will build and upload the files in this folder and show you a live Hosting URL. You can later connect a custom domain if desired.






