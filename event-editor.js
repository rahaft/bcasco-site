// Event editing functionality for frontend - senior-friendly
// Allows admins to edit event details directly on the events page

const ADMIN_EMAILS = [
  "bcasco.maryland@gmail.com",
  "bwiseman84@hotmail.com",
  "rosiehaft@gmail.com",
  "leahmberlin@gmail.com"
];

function isAdminEmail(email) {
  if (!email) return false;
  const emailLower = email.toLowerCase();
  return ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === emailLower);
}

let isAdminUser = false;
let currentUser = null;

// Initialize event editing
function initEventEditing() {
  if (!auth || !db) {
    return;
  }

  auth.onAuthStateChanged((user) => {
    currentUser = user;
    if (user && user.email && isAdminEmail(user.email)) {
      isAdminUser = true;
      enableEventEditing();
    } else {
      isAdminUser = false;
      disableEventEditing();
    }
  });
}

function enableEventEditing() {
  // Add edit buttons to events after they're loaded
  observeEventsContainer();
  
  // Add quick action panel for updating all events
  addQuickActionsPanel();
}

function disableEventEditing() {
  const panel = document.getElementById("event-quick-actions");
  if (panel) panel.remove();
}

function observeEventsContainer() {
  // Watch for events being added and make them editable
  const observer = new MutationObserver(() => {
    if (isAdminUser) {
      makeEventsEditable();
    }
  });

  const eventsContainer = document.getElementById("events-container");
  const pastEventsContainer = document.getElementById("past-events-container");
  
  if (eventsContainer) {
    observer.observe(eventsContainer, { childList: true, subtree: true });
  }
  if (pastEventsContainer) {
    observer.observe(pastEventsContainer, { childList: true, subtree: true });
  }

  // Also check immediately
  setTimeout(makeEventsEditable, 1000);
}

function makeEventsEditable() {
  const eventCards = document.querySelectorAll("#events-container .card, #past-events-container .card");
  
  eventCards.forEach((card) => {
    if (card.hasAttribute("data-event-editable")) return; // Already processed
    card.setAttribute("data-event-editable", "true");
    
    const title = card.querySelector("h2.card-title");
    const notes = card.querySelector("p:last-of-type");
    
    if (title) {
      title.style.cursor = "pointer";
      title.style.position = "relative";
      title.addEventListener("click", () => editEventField(card, "title", title));
      title.title = "Click to edit event title";
    }
    
    if (notes && !notes.textContent.includes("Sign Up for Updates")) {
      notes.style.cursor = "pointer";
      notes.addEventListener("click", () => editEventField(card, "notes", notes));
      notes.title = "Click to edit event details";
    }
    
    // Add edit icon
    const editIcon = document.createElement("span");
    editIcon.innerHTML = " ✏️";
    editIcon.style.fontSize = "0.9rem";
    editIcon.style.opacity = "0.6";
    if (title) title.appendChild(editIcon);
  });
}

function editEventField(card, field, element) {
  if (!currentUser || !isAdminUser) return;
  
  const eventId = card.getAttribute("data-event-id");
  if (!eventId) {
    alert("Cannot edit: Event ID not found. Please refresh the page.");
    return;
  }
  
  const currentValue = element.textContent.trim();
  const newValue = prompt(`Edit ${field === "title" ? "Event Title" : "Event Details"}:`, currentValue);
  
  if (newValue === null || newValue === currentValue) return;
  
  // Show saving indicator
  const originalText = element.textContent;
  element.textContent = newValue + " 💾 Saving...";
  element.style.color = "#666";
  
  // Update in Firestore
  db.collection("events").doc(eventId).update({
    [field]: newValue.trim(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedBy: currentUser.email
  })
  .then(() => {
    element.textContent = newValue;
    element.style.color = "";
    // Show success message
    const success = document.createElement("span");
    success.textContent = " ✓ Saved!";
    success.style.color = "green";
    success.style.fontWeight = "600";
    element.appendChild(success);
    setTimeout(() => success.remove(), 3000);
  })
  .catch((error) => {
    console.error("Error updating event:", error);
    element.textContent = originalText;
    element.style.color = "";
    alert("Error saving changes. Please try again.");
  });
}

function addQuickActionsPanel() {
  if (document.getElementById("event-quick-actions")) return;
  
  const panel = document.createElement("div");
  panel.id = "event-quick-actions";
  panel.innerHTML = `
    <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin: 2rem 0; border: 2px solid #ffb703;">
      <h3 style="margin: 0 0 1rem 0; color: #1f6fb2; font-size: 1.3rem;">⚙️ Quick Event Actions</h3>
      <p style="margin: 0 0 1rem 0; font-size: 1rem; color: #555;">Use these tools to manage events:</p>
      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <button id="remove-refreshments-btn" style="background: #1f6fb2; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; font-size: 1rem; font-weight: 600;">
          Remove "and Refreshments" from All Events
        </button>
        <button id="refresh-events-btn" style="background: #4a7c2a; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; font-size: 1rem; font-weight: 600;">
          Refresh Events List
        </button>
      </div>
      <div id="action-status" style="margin-top: 1rem; font-size: 1rem;"></div>
    </div>
  `;
  
  const eventsSection = document.querySelector("#section-announcements") || document.querySelector(".page-section");
  if (eventsSection) {
    eventsSection.insertBefore(panel, eventsSection.firstChild);
  }
  
  // Add button handlers
  document.getElementById("remove-refreshments-btn").addEventListener("click", removeRefreshmentsFromAllEvents);
  document.getElementById("refresh-events-btn").addEventListener("click", () => window.location.reload());
}

async function removeRefreshmentsFromAllEvents() {
  if (!db || !currentUser) {
    alert("Please log in first.");
    return;
  }
  
  const btn = document.getElementById("remove-refreshments-btn");
  const status = document.getElementById("action-status");
  
  btn.disabled = true;
  btn.textContent = "Updating...";
  status.innerHTML = '<span style="color: #1f6fb2;">🔄 Updating events...</span>';
  
  try {
    const snapshot = await db.collection("events").get();
    const updates = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const notes = data.notes || "";
      
      if (notes.includes("Networking and Refreshments") || notes.includes("Networking and refreshments")) {
        const updatedNotes = notes.replace(/Networking and [Rr]efreshments/gi, "Networking");
        updates.push({
          ref: doc.ref,
          title: data.title || doc.id,
          newNotes: updatedNotes
        });
      }
    });
    
    if (updates.length === 0) {
      status.innerHTML = '<span style="color: green;">✓ All events are already updated. No changes needed.</span>';
      btn.disabled = false;
      btn.textContent = "Remove \"and Refreshments\" from All Events";
      return;
    }
    
    // Update in batches
    const BATCH_SIZE = 500;
    let updated = 0;
    
    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const batchUpdates = updates.slice(i, i + BATCH_SIZE);
      
      batchUpdates.forEach((update) => {
        batch.update(update.ref, {
          notes: update.newNotes,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedBy: currentUser.email
        });
      });
      
      await batch.commit();
      updated += batchUpdates.length;
      status.innerHTML = `<span style="color: #1f6fb2;">🔄 Updated ${updated} of ${updates.length} events...</span>`;
    }
    
    status.innerHTML = `<span style="color: green; font-weight: 600;">✓ Success! Updated ${updated} event(s). Refreshing page...</span>`;
    setTimeout(() => window.location.reload(), 2000);
    
  } catch (error) {
    console.error("Error updating events:", error);
    status.innerHTML = `<span style="color: red;">✗ Error: ${error.message}</span>`;
    btn.disabled = false;
    btn.textContent = "Remove \"and Refreshments\" from All Events";
  }
}

// Store event IDs when events are created
const originalCreateEventCard = window.createEventCard;
if (typeof originalCreateEventCard === 'undefined') {
  // Hook into the createEventCard function if it exists
  setTimeout(() => {
    const eventCards = document.querySelectorAll("#events-container .card, #past-events-container .card");
    eventCards.forEach((card, index) => {
      // We'll need to get the event ID from the data when events are loaded
    });
  }, 2000);
}

// Need to modify how events are created to include IDs
// This will be handled by modifying the events.html loadEvents function

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initEventEditing();
  });
} else {
  initEventEditing();
}