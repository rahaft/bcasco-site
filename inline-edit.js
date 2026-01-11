// Inline editing functionality for admin users
// Checks if user is logged in as admin and enables inline editing on frontend

const ADMIN_EMAILS = [
  "bcasco.maryland@gmail.com",
  "bwiseman84@hotmail.com",
  "rosiehaft@gmail.com",
  "leahmberlin@gmail.com"
];

let isAdminUser = false;
let editingElements = new Map(); // Track which elements are being edited

// Check if email is in admin list
function isAdminEmail(email) {
  if (!email) return false;
  const emailLower = email.toLowerCase();
  return ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === emailLower);
}

// Initialize inline editing
function initInlineEditing() {
  if (!auth || !db) {
    console.log("Firebase not available for inline editing");
    return;
  }

  // Check if user is logged in as admin
  auth.onAuthStateChanged((user) => {
    if (user && user.email && isAdminEmail(user.email)) {
      isAdminUser = true;
      enableInlineEditing();
    } else {
      isAdminUser = false;
      disableInlineEditing();
    }
  });
}

// Enable inline editing for editable elements
function enableInlineEditing() {
  // Add admin indicator - senior-friendly with larger text
  if (!document.getElementById("admin-edit-indicator")) {
    const indicator = document.createElement("div");
    indicator.id = "admin-edit-indicator";
    indicator.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 0.75rem;">
        <span style="font-size: 1.5rem;">✏️</span>
        <div>
          <div style="font-size: 1.2rem; font-weight: 700;">Edit Mode Active</div>
          <div style="font-size: 1rem; margin-top: 0.25rem;">Click on any text below to edit it. Changes save automatically when you click away.</div>
        </div>
        <button id="exit-edit-mode" style="background: #1f6fb2; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-size: 1rem; margin-left: 1rem;">Exit Edit Mode</button>
      </div>
    `;
    indicator.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #ffb703;
      color: #000;
      padding: 1rem;
      text-align: center;
      font-weight: 600;
      z-index: 10000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    document.body.insertBefore(indicator, document.body.firstChild);
    
    // Add exit button functionality
    document.getElementById("exit-edit-mode").addEventListener("click", () => {
      auth.signOut().then(() => {
        window.location.reload();
      });
    });
  }

  // Find all editable elements and make them editable
  const editableElements = document.querySelectorAll("[data-editable]");
  editableElements.forEach((element) => {
    makeEditable(element);
  });
}

// Disable inline editing
function disableInlineEditing() {
  const indicator = document.getElementById("admin-edit-indicator");
  if (indicator) {
    indicator.remove();
  }

  const editableElements = document.querySelectorAll("[data-editable]");
  editableElements.forEach((element) => {
    element.contentEditable = false;
    element.classList.remove("editable-active");
    element.style.outline = "";
    element.style.cursor = "";
  });
}

// Make an element editable
function makeEditable(element) {
  element.contentEditable = true;
  element.classList.add("editable-active");
  element.setAttribute("data-content-id", element.getAttribute("data-editable"));

  // Add edit icon on hover
  element.style.position = "relative";
  element.style.cursor = "text";
  element.style.outline = "none";

  // Store original content
  if (!element.getAttribute("data-original-content")) {
    element.setAttribute("data-original-content", element.innerHTML);
  }

  // Allow links and buttons to work normally
  element.addEventListener("mousedown", function(e) {
    // If clicking on a link or button, temporarily disable contentEditable
    if (e.target.tagName === "A" || e.target.tagName === "BUTTON" || e.target.closest("a") || e.target.closest("button")) {
      element.contentEditable = false;
      setTimeout(() => {
        element.contentEditable = true;
      }, 100);
    }
  });

  element.addEventListener("focus", function() {
    this.style.outline = "3px solid #ffb703";
    this.style.outlineOffset = "3px";
    this.style.backgroundColor = "rgba(255, 183, 3, 0.15)";
    // Show helpful hint
    if (!this.getAttribute("data-hint-shown")) {
      const hint = document.createElement("div");
      hint.id = "edit-hint";
      hint.textContent = "Tip: Press Escape to cancel, or click away to save";
      hint.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #1f6fb2;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-size: 1rem;
        z-index: 10001;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        max-width: 300px;
      `;
      document.body.appendChild(hint);
      setTimeout(() => {
        if (hint.parentNode) hint.remove();
      }, 4000);
      this.setAttribute("data-hint-shown", "true");
    }
  });

  element.addEventListener("blur", function() {
    this.style.outline = "";
    this.style.backgroundColor = "";
    saveContent(this);
  });

  element.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && !e.shiftKey && this.tagName !== "TEXTAREA" && this.tagName !== "P") {
      e.preventDefault();
      this.blur();
    }
    if (e.key === "Escape") {
      // Restore original content on escape
      const original = this.getAttribute("data-original-content");
      if (original) {
        this.innerHTML = original;
      }
      this.blur();
    }
  });
}

// Save content to Firestore
function saveContent(element) {
  const contentId = element.getAttribute("data-content-id");
  if (!contentId) return;

  const page = getCurrentPage();
  const newContent = element.innerHTML;

  // Get current content to compare
  const currentContent = element.getAttribute("data-original-content") || newContent;

  // Only save if content changed
  if (newContent === currentContent) {
    return;
  }

  // Show saving indicator - more visible for seniors
  element.setAttribute("data-saving", "true");
  const savingIndicator = document.createElement("span");
  savingIndicator.textContent = " 💾 Saving...";
  savingIndicator.style.cssText = "color: #1f6fb2; font-size: 1rem; margin-left: 0.75rem; font-weight: 600;";
  element.appendChild(savingIndicator);

  // Save to Firestore
  const docRef = db.collection("pageContent").doc(`${page}_${contentId}`);

  docRef
    .set(
      {
        content: newContent,
        page: page,
        contentId: contentId,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedBy: auth.currentUser.email,
      },
      { merge: true }
    )
    .then(() => {
      savingIndicator.textContent = " ✓ Saved Successfully!";
      savingIndicator.style.color = "green";
      savingIndicator.style.fontSize = "1rem";
      element.setAttribute("data-original-content", newContent);
      setTimeout(() => {
        savingIndicator.remove();
        element.removeAttribute("data-saving");
      }, 3000);
    })
    .catch((error) => {
      console.error("Error saving content:", error);
      savingIndicator.textContent = " ✗ Error";
      savingIndicator.style.color = "red";
      setTimeout(() => {
        savingIndicator.remove();
        element.removeAttribute("data-saving");
      }, 3000);
    });
}

// Load content from Firestore
function loadContentFromFirestore() {
  if (!db) return;

  const page = getCurrentPage();
  const editableElements = document.querySelectorAll("[data-editable]");

  editableElements.forEach((element) => {
    const contentId = element.getAttribute("data-editable");
    const docRef = db.collection("pageContent").doc(`${page}_${contentId}`);

    docRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          element.innerHTML = data.content;
          element.setAttribute("data-original-content", data.content);
        } else {
          // Store original content as fallback
          element.setAttribute("data-original-content", element.innerHTML);
        }
      })
      .catch((error) => {
        console.error("Error loading content:", error);
        element.setAttribute("data-original-content", element.innerHTML);
      });
  });
}

// Get current page identifier
function getCurrentPage() {
  const path = window.location.pathname;
  const filename = path.split("/").pop() || "index.html";
  return filename.replace(".html", "") || "index";
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    loadContentFromFirestore();
    initInlineEditing();
  });
} else {
  loadContentFromFirestore();
  initInlineEditing();
}