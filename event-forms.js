// Event Forms - Survey and Questions functionality

// Test: Verify script is loaded
console.log("event-forms.js loaded successfully");

// Function to send data to Google Sheets
function sendToGoogleSheets(data) {
  console.log("Google Sheets: Function called with data:", data);
  
  // Get Google Sheets URL from Firebase config or settings
  if (typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) {
    console.log("Google Sheets: Firebase not initialized, skipping");
    return Promise.resolve(); // Firebase not initialized, skip
  }
  
  // Check if db is available
  if (typeof db === 'undefined' || !db) {
    console.error("Google Sheets: db (Firestore) is not defined, skipping");
    return Promise.resolve();
  }
  
  // Prepare data for Google Sheets - convert Firestore timestamp to format expected by script
  const sheetsData = { ...data };
  
  // Handle submittedAt timestamp - convert Firestore timestamp to seconds format
  if (sheetsData.submittedAt) {
    // If it's a Firestore FieldValue, we can't serialize it, so use current time
    if (sheetsData.submittedAt.constructor && sheetsData.submittedAt.constructor.name === 'FieldValue') {
      sheetsData.submittedAt = { seconds: Math.floor(Date.now() / 1000) };
    } 
    // If it's already a Timestamp object, convert it
    else if (sheetsData.submittedAt.seconds !== undefined) {
      // Already in correct format
    } 
    // If it's a Date object, convert it
    else if (sheetsData.submittedAt instanceof Date) {
      sheetsData.submittedAt = { seconds: Math.floor(sheetsData.submittedAt.getTime() / 1000) };
    }
    // Otherwise, use current time
    else {
      sheetsData.submittedAt = { seconds: Math.floor(Date.now() / 1000) };
    }
  } else {
    // No timestamp provided, use current time
    sheetsData.submittedAt = { seconds: Math.floor(Date.now() / 1000) };
  }
  
  console.log("Google Sheets: Preparing to send data:", sheetsData);
  
  // Try to get the Google Sheets URL from Firestore settings
  return db.collection("settings")
    .doc("googleSheets")
    .get()
    .then((doc) => {
      if (!doc.exists || !doc.data().webAppUrl) {
        console.log("Google Sheets: No URL configured in Firestore, skipping");
        // No Google Sheets URL configured, skip silently
        return Promise.resolve();
      }
      
      const webAppUrl = doc.data().webAppUrl.trim(); // Remove any whitespace
      
      // Check which script version is being used
      const deprecatedUrl = "AKfycbxbpgDUecJ5KTgRYAvlioIMH0aUx4gLeZ1bkbAo3xm282efrPOQsZgoffBOd7Gs0D0vTw"; // Version 1
      const version2Url = "AKfycbzE2cdK8Zy6r4Tkym1rywfmF-ZIWrvzFEHcTS-CNnkfd_nv2-ohpNOifQ9SmD29hFPYoQ"; // Version 2
      const version3Url = "AKfycbxZsr5c2APyqIpeEw2ijnh-8-bFeBdnQDvzysFu5NrLbUJMivrIMXBEXp_Ds9Vft6YvUQ"; // Version 3
      const latestUrl = "AKfycbxKsSFtiS4PVhGWmtzl-NDQDU5WcQp0Hu_WFxEYFHryKK_Y36bx2yw_co8BIPhigCIM"; // Latest (v1.0.2)
      
      if (webAppUrl.includes(deprecatedUrl)) {
        console.warn("⚠️ WARNING: Using DEPRECATED Google Apps Script URL (Version 1)!");
        console.warn("Current URL in Firestore:", webAppUrl);
        console.warn("Please update Firestore settings/googleSheets/webAppUrl to use the latest version.");
        console.warn("Latest URL:", "https://script.google.com/macros/s/" + latestUrl + "/exec");
      } else if (webAppUrl.includes(version3Url)) {
        console.warn("⚠️ WARNING: Using Version 3 script which may not be properly configured!");
        console.warn("Current URL in Firestore:", webAppUrl);
        console.warn("Please update Firestore settings/googleSheets/webAppUrl to use the latest version.");
        console.warn("Latest URL:", "https://script.google.com/macros/s/" + latestUrl + "/exec");
      } else if (webAppUrl.includes(latestUrl)) {
        console.log("✓ Using LATEST Google Apps Script URL (v1.0.2)");
      } else if (webAppUrl.includes(version2Url)) {
        console.log("✓ Using Google Apps Script URL (Version 2) - Consider updating to latest version");
      } else {
        console.warn("⚠️ Unknown script version detected. Verify the URL is correct.");
        console.log("Current URL in Firestore:", webAppUrl);
      }
      
      console.log("Google Sheets: Sending to URL:", webAppUrl);
      console.log("Google Sheets: Data being sent:", JSON.stringify(sheetsData));
      
      // Send data to Google Apps Script
      return fetch(webAppUrl, {
        method: 'POST',
        mode: 'no-cors', // Google Apps Script doesn't support CORS, so we use no-cors
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sheetsData)
      }).then(() => {
        console.log("Google Sheets: Request sent successfully (no-cors mode, can't verify response)");
        return Promise.resolve();
      }).catch((error) => {
        // Silently fail - Firestore is the primary storage
        console.error("Google Sheets submission failed:", error);
        return Promise.resolve();
      });
    })
    .catch((error) => {
      // Settings not found or error - skip silently
      console.error("Could not load Google Sheets config:", error);
      return Promise.resolve();
    });
}

// Check if an event has started (event date has passed or event is currently happening)
function hasEventStarted(eventData) {
  if (!eventData.date) return false;
  
  const eventDate = new Date(eventData.date + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // If event date is today or in the past, event has started
  return eventDate <= today;
}

// Check if an event is upcoming (event date is in the future)
function isEventUpcoming(eventData) {
  if (!eventData.date) return false;
  
  const eventDate = new Date(eventData.date + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return eventDate > today;
}

// Open survey modal (for past events)
function openSurveyModal(eventId, eventDate, eventTitle) {
  // Remove existing modal if any
  const existingModal = document.getElementById("survey-modal");
  if (existingModal) {
    existingModal.remove();
  }
  
  // Create modal overlay
  const modal = document.createElement("div");
  modal.id = "survey-modal";
  modal.className = "modal";
  modal.style.cssText = "display: block; position: fixed; z-index: 10000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.5);";
  
  // Create modal content
  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";
  modalContent.style.cssText = "background-color: #ffffff; margin: 5% auto; padding: 2rem; border-radius: 1rem; max-width: 600px; width: 90%; box-shadow: 0 18px 40px rgba(15, 70, 70, 0.2); position: relative;";
  
  // Close button
  const closeBtn = document.createElement("span");
  closeBtn.className = "modal-close";
  closeBtn.innerHTML = "&times;";
  closeBtn.style.cssText = "color: #aaa; float: right; font-size: 2rem; font-weight: bold; cursor: pointer; position: absolute; right: 1rem; top: 1rem; line-height: 1;";
  closeBtn.addEventListener("click", function() {
    modal.style.display = "none";
    modal.remove();
  });
  modalContent.appendChild(closeBtn);
  
  // Title
  const modalTitle = document.createElement("h2");
  modalTitle.textContent = "Provide Feedback";
  modalTitle.style.cssText = "margin: 0 0 0.5rem 0; font-size: 1.5rem; font-weight: 600; color: #184c7d; padding-right: 2rem;";
  modalContent.appendChild(modalTitle);
  
  // Description
  const modalDesc = document.createElement("p");
  modalDesc.textContent = "Share your feedback about this event.";
  modalDesc.style.cssText = "margin: 0 0 1.5rem 0; font-size: 1rem; color: #666;";
  modalContent.appendChild(modalDesc);
  
  // Form
  const form = document.createElement("form");
  form.className = "event-survey-form";
  form.setAttribute("data-event-id", eventId);
  
  // Name field (required, at top)
  const nameContainer = document.createElement("div");
  nameContainer.className = "form-row";
  nameContainer.style.marginBottom = "1rem";
  
  const nameLabel = document.createElement("label");
  nameLabel.textContent = "Name *";
  nameLabel.style.cssText = "display: block; margin-bottom: 0.5rem; font-weight: 600;";
  nameContainer.appendChild(nameLabel);
  
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.name = "name";
  nameInput.required = true;
  nameInput.placeholder = "Your name";
  nameInput.style.cssText = "width: 100%; padding: 0.75rem; font-size: 1rem; border-radius: 0.5rem; border: 2px solid #c3d4c6; font-family: inherit; box-sizing: border-box;";
  nameContainer.appendChild(nameInput);
  form.appendChild(nameContainer);
  
  // Email field (required, at top)
  const emailContainer = document.createElement("div");
  emailContainer.className = "form-row";
  emailContainer.style.marginBottom = "1rem";
  
  const emailLabel = document.createElement("label");
  emailLabel.textContent = "Email *";
  emailLabel.style.cssText = "display: block; margin-bottom: 0.5rem; font-weight: 600;";
  emailContainer.appendChild(emailLabel);
  
  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailInput.name = "email";
  emailInput.required = true;
  emailInput.placeholder = "your.email@example.com";
  emailInput.style.cssText = "width: 100%; padding: 0.75rem; font-size: 1rem; border-radius: 0.5rem; border: 2px solid #c3d4c6; font-family: inherit; box-sizing: border-box;";
  emailContainer.appendChild(emailInput);
  form.appendChild(emailContainer);
  
  // Event dropdown (will be populated with past events)
  const eventContainer = document.createElement("div");
  eventContainer.className = "form-row";
  eventContainer.style.marginBottom = "1.5rem";
  
  const eventLabel = document.createElement("label");
  eventLabel.textContent = "Event *";
  eventLabel.style.cssText = "display: block; margin-bottom: 0.5rem; font-weight: 600;";
  eventContainer.appendChild(eventLabel);
  
  const eventSelect = document.createElement("select");
  eventSelect.name = "eventId";
  eventSelect.required = true;
  eventSelect.style.cssText = "width: 100%; padding: 0.75rem; font-size: 1rem; border-radius: 0.5rem; border: 2px solid #c3d4c6; font-family: inherit; box-sizing: border-box; background-color: white;";
  
  // Helper function to format date for dropdown
  function formatEventDateForDropdown(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString + "T00:00:00");
    if (isNaN(date.getTime())) return dateString;
    const options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  }
  
  // Load past events and populate dropdown
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  // Add current event as default (will be pre-selected)
  const defaultOption = document.createElement("option");
  defaultOption.value = eventId;
  const formattedDate = formatEventDateForDropdown(eventDate);
  defaultOption.textContent = `${formattedDate} - ${eventTitle || "Event"}`;
  defaultOption.selected = true;
  eventSelect.appendChild(defaultOption);
  
  db.collection("events")
    .orderBy("date", "desc")
    .where("date", "<", todayStr)
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        const eventData = doc.data();
        if (eventData.date && eventData.title && doc.id !== eventId) {
          const option = document.createElement("option");
          option.value = doc.id;
          const formattedDate = formatEventDateForDropdown(eventData.date);
          option.textContent = `${formattedDate} - ${eventData.title}`;
          eventSelect.appendChild(option);
        }
      });
    })
    .catch((error) => {
      console.error("Error loading events for dropdown:", error);
    });
  
  eventContainer.appendChild(eventSelect);
  form.appendChild(eventContainer);
  
  // Star rating
  const ratingContainer = document.createElement("div");
  ratingContainer.className = "form-row";
  ratingContainer.style.marginBottom = "1rem";
  
  const ratingLabel = document.createElement("label");
  ratingLabel.textContent = "Rating *";
  ratingLabel.style.cssText = "display: block; margin-bottom: 0.5rem; font-weight: 600;";
  ratingContainer.appendChild(ratingLabel);
  
  const starsContainer = document.createElement("div");
  starsContainer.className = "star-rating";
  starsContainer.style.cssText = "display: flex; gap: 0.5rem; font-size: 1.8rem; cursor: pointer;";
  
  let selectedRating = 0;
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.textContent = "☆";
    star.className = "star";
    star.setAttribute("data-rating", i);
    star.style.cssText = "color: #ffb703; transition: transform 0.2s; user-select: none;";
    
    star.addEventListener("mouseenter", function() {
      const rating = parseInt(this.getAttribute("data-rating"));
      updateStarDisplay(starsContainer, rating);
    });
    
    star.addEventListener("mouseleave", function() {
      updateStarDisplay(starsContainer, selectedRating);
    });
    
    star.addEventListener("click", function() {
      selectedRating = parseInt(this.getAttribute("data-rating"));
      updateStarDisplay(starsContainer, selectedRating);
    });
    
    starsContainer.appendChild(star);
  }
  
  function updateStarDisplay(container, rating) {
    const stars = container.querySelectorAll(".star");
    stars.forEach((star, index) => {
      if (index < rating) {
        star.textContent = "★";
      } else {
        star.textContent = "☆";
      }
    });
  }
  
  ratingContainer.appendChild(starsContainer);
  form.appendChild(ratingContainer);
  
  // Comments
  const notesContainer = document.createElement("div");
  notesContainer.className = "form-row";
  notesContainer.style.marginBottom = "1.5rem";
  
  const notesLabel = document.createElement("label");
  notesLabel.textContent = "Comments";
  notesLabel.style.cssText = "display: block; margin-bottom: 0.5rem; font-weight: 600;";
  notesContainer.appendChild(notesLabel);
  
  const notesTextarea = document.createElement("textarea");
  notesTextarea.name = "notes";
  notesTextarea.rows = "4";
  notesTextarea.placeholder = "Share your thoughts about this event...";
  notesTextarea.style.cssText = "width: 100%; padding: 0.75rem; font-size: 1rem; border-radius: 0.5rem; border: 2px solid #c3d4c6; font-family: inherit; resize: vertical; box-sizing: border-box;";
  notesContainer.appendChild(notesTextarea);
  form.appendChild(notesContainer);
  
  // Submit button
  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Submit Feedback";
  submitBtn.className = "primary-btn";
  submitBtn.style.cssText = "font-size: 1rem; padding: 0.75rem 1.5rem; border-radius: 999px; border: none; background-color: #1f6fb2; color: #ffffff; font-weight: 700; cursor: pointer; width: 100%;";
  form.appendChild(submitBtn);
  
  // Status message
  const statusMsg = document.createElement("p");
  statusMsg.className = "survey-status";
  statusMsg.style.cssText = "margin-top: 0.75rem; font-size: 0.95rem; display: none; text-align: center;";
  form.appendChild(statusMsg);
  
  // Form submission
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    
    if (selectedRating === 0) {
      statusMsg.textContent = "Please select a rating.";
      statusMsg.style.color = "red";
      statusMsg.style.display = "block";
      return;
    }
    
    const selectedEventId = eventSelect.value;
    const selectedEventText = eventSelect.options[eventSelect.selectedIndex].textContent;
    
    // Get event title from selected option
    const parts = selectedEventText.split(" - ");
    const selectedEventTitle = parts.length > 1 ? parts.slice(1).join(" - ") : selectedEventText;
    
    const formData = {
      eventId: selectedEventId,
      eventTitle: selectedEventTitle,
      rating: selectedRating,
      notes: notesTextarea.value.trim(),
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      submittedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
    statusMsg.style.display = "none";
    
    // Save to Firestore
    const firestorePromise = db.collection("eventSurveys")
      .add(formData)
      .then(() => {
        statusMsg.textContent = "Thank you for your feedback!";
        statusMsg.style.color = "green";
        statusMsg.style.display = "block";
        
        // Reset form
        nameInput.value = "";
        emailInput.value = "";
        notesTextarea.value = "";
        selectedRating = 0;
        updateStarDisplay(starsContainer, 0);
        
        // Close modal after 2 seconds
        setTimeout(() => {
          modal.style.display = "none";
          modal.remove();
        }, 2000);
      })
      .catch((error) => {
        console.error("Error submitting survey:", error);
        statusMsg.textContent = "Error submitting feedback. Please try again.";
        statusMsg.style.color = "red";
        statusMsg.style.display = "block";
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Feedback";
      });
    
    // Also send to Google Sheets if configured
    console.log("About to call sendToGoogleSheets for feedback with formData:", formData);
    sendToGoogleSheets({
      type: 'feedback',
      ...formData
    }).catch((error) => {
      console.error("Error sending to Google Sheets:", error);
      // Don't show error to user - Firestore save is the primary storage
    });
    
    // Wait for Firestore to complete (Google Sheets is fire-and-forget)
    firestorePromise;
  });
  
  modalContent.appendChild(form);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Close modal when clicking outside
  modal.addEventListener("click", function(e) {
    if (e.target === modal) {
      modal.style.display = "none";
      modal.remove();
    }
  });
}

// Create survey form HTML (for events that have started) - DEPRECATED, use openSurveyModal instead
function createSurveyForm(eventId, eventTitle) {
  const formContainer = document.createElement("div");
  formContainer.className = "event-survey-container";
  formContainer.style.cssText = "margin-top: 1.5rem; padding: 1.5rem; background-color: #f8f9fa; border-radius: 0.5rem; border: 1px solid #dee2e6;";
  
  const formTitle = document.createElement("h3");
  formTitle.textContent = "Event Survey";
  formTitle.style.cssText = "margin: 0 0 1rem 0; font-size: 1.2rem; font-weight: 600; color: #184c7d;";
  formContainer.appendChild(formTitle);
  
  const form = document.createElement("form");
  form.className = "event-survey-form";
  form.setAttribute("data-event-id", eventId);
  
  // Star rating
  const ratingContainer = document.createElement("div");
  ratingContainer.className = "form-row";
  ratingContainer.style.marginBottom = "1rem";
  
  const ratingLabel = document.createElement("label");
  ratingLabel.textContent = "Rating *";
  ratingLabel.style.cssText = "display: block; margin-bottom: 0.5rem; font-weight: 600;";
  ratingContainer.appendChild(ratingLabel);
  
  const starsContainer = document.createElement("div");
  starsContainer.className = "star-rating";
  starsContainer.style.cssText = "display: flex; gap: 0.5rem; font-size: 1.8rem; cursor: pointer;";
  
  let selectedRating = 0;
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.textContent = "☆";
    star.className = "star";
    star.setAttribute("data-rating", i);
    star.style.cssText = "color: #ffb703; transition: transform 0.2s; user-select: none;";
    
    star.addEventListener("mouseenter", function() {
      const rating = parseInt(this.getAttribute("data-rating"));
      updateStarDisplay(starsContainer, rating);
    });
    
    star.addEventListener("mouseleave", function() {
      updateStarDisplay(starsContainer, selectedRating);
    });
    
    star.addEventListener("click", function() {
      selectedRating = parseInt(this.getAttribute("data-rating"));
      updateStarDisplay(starsContainer, selectedRating);
      const hiddenInput = form.querySelector('input[name="rating"]');
      if (hiddenInput) hiddenInput.value = selectedRating;
    });
    
    starsContainer.appendChild(star);
  }
  
  const ratingInput = document.createElement("input");
  ratingInput.type = "hidden";
  ratingInput.name = "rating";
  ratingInput.required = true;
  
  function updateStarDisplay(container, rating) {
    const stars = container.querySelectorAll(".star");
    stars.forEach((star, index) => {
      if (index < rating) {
        star.textContent = "★";
      } else {
        star.textContent = "☆";
      }
    });
  }
  
  ratingContainer.appendChild(starsContainer);
  ratingContainer.appendChild(ratingInput);
  form.appendChild(ratingContainer);
  
  // Notes/comments
  const notesContainer = document.createElement("div");
  notesContainer.className = "form-row";
  notesContainer.style.marginBottom = "1rem";
  
  const notesLabel = document.createElement("label");
  notesLabel.textContent = "Comments";
  notesLabel.setAttribute("for", `survey-notes-${eventId}`);
  notesLabel.style.cssText = "display: block; margin-bottom: 0.5rem; font-weight: 600;";
  notesContainer.appendChild(notesLabel);
  
  const notesTextarea = document.createElement("textarea");
  notesTextarea.id = `survey-notes-${eventId}`;
  notesTextarea.name = "notes";
  notesTextarea.rows = "4";
  notesTextarea.placeholder = "Share your thoughts about this event...";
  notesTextarea.style.cssText = "width: 100%; padding: 0.6rem; font-size: 1rem; border-radius: 0.5rem; border: 2px solid #c3d4c6; font-family: inherit; resize: vertical;";
  notesContainer.appendChild(notesTextarea);
  form.appendChild(notesContainer);
  
  // Optional contact fields
  const contactLabel = document.createElement("p");
  contactLabel.textContent = "Contact Information (optional)";
  contactLabel.style.cssText = "margin: 1rem 0 0.5rem 0; font-weight: 600; font-size: 0.95rem;";
  form.appendChild(contactLabel);
  
  // Name
  const nameContainer = document.createElement("div");
  nameContainer.className = "form-row";
  nameContainer.style.marginBottom = "0.75rem";
  
  const nameLabel = document.createElement("label");
  nameLabel.textContent = "Name";
  nameLabel.setAttribute("for", `survey-name-${eventId}`);
  nameLabel.style.cssText = "display: block; margin-bottom: 0.35rem; font-weight: 600; font-size: 0.9rem;";
  nameContainer.appendChild(nameLabel);
  
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.id = `survey-name-${eventId}`;
  nameInput.name = "name";
  nameInput.placeholder = "Your name";
  nameInput.style.cssText = "width: 100%; padding: 0.5rem; font-size: 0.95rem; border-radius: 0.5rem; border: 2px solid #c3d4c6;";
  nameContainer.appendChild(nameInput);
  form.appendChild(nameContainer);
  
  // Email
  const emailContainer = document.createElement("div");
  emailContainer.className = "form-row";
  emailContainer.style.marginBottom = "0.75rem";
  
  const emailLabel = document.createElement("label");
  emailLabel.textContent = "Email";
  emailLabel.setAttribute("for", `survey-email-${eventId}`);
  emailLabel.style.cssText = "display: block; margin-bottom: 0.35rem; font-weight: 600; font-size: 0.9rem;";
  emailContainer.appendChild(emailLabel);
  
  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailInput.id = `survey-email-${eventId}`;
  emailInput.name = "email";
  emailInput.placeholder = "your.email@example.com";
  emailInput.style.cssText = "width: 100%; padding: 0.5rem; font-size: 0.95rem; border-radius: 0.5rem; border: 2px solid #c3d4c6;";
  emailContainer.appendChild(emailInput);
  form.appendChild(emailContainer);
  
  // Phone
  const phoneContainer = document.createElement("div");
  phoneContainer.className = "form-row";
  phoneContainer.style.marginBottom = "1rem";
  
  const phoneLabel = document.createElement("label");
  phoneLabel.textContent = "Phone";
  phoneLabel.setAttribute("for", `survey-phone-${eventId}`);
  phoneLabel.style.cssText = "display: block; margin-bottom: 0.35rem; font-weight: 600; font-size: 0.9rem;";
  phoneContainer.appendChild(phoneLabel);
  
  const phoneInput = document.createElement("input");
  phoneInput.type = "tel";
  phoneInput.id = `survey-phone-${eventId}`;
  phoneInput.name = "phone";
  phoneInput.placeholder = "(410) 555-1234";
  phoneInput.style.cssText = "width: 100%; padding: 0.5rem; font-size: 0.95rem; border-radius: 0.5rem; border: 2px solid #c3d4c6;";
  phoneContainer.appendChild(phoneInput);
  form.appendChild(phoneContainer);
  
  // Submit button
  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Submit Survey";
  submitBtn.className = "primary-btn";
  submitBtn.style.cssText = "font-size: 1rem; padding: 0.7rem 1.6rem; border-radius: 999px; border: none; background-color: #1f6fb2; color: #ffffff; font-weight: 700; cursor: pointer; width: 100%;";
  form.appendChild(submitBtn);
  
  // Status message
  const statusMsg = document.createElement("p");
  statusMsg.className = "survey-status";
  statusMsg.style.cssText = "margin-top: 0.75rem; font-size: 0.95rem; display: none;";
  form.appendChild(statusMsg);
  
  // Form submission
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    
    if (selectedRating === 0) {
      statusMsg.textContent = "Please select a rating.";
      statusMsg.style.color = "red";
      statusMsg.style.display = "block";
      return;
    }
    
    const formData = {
      eventId: eventId,
      eventTitle: eventTitle || "Untitled Event",
      rating: selectedRating,
      notes: notesTextarea.value.trim(),
      name: nameInput.value.trim() || null,
      email: emailInput.value.trim() || null,
      phone: phoneInput.value.trim() || null,
      submittedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
    statusMsg.style.display = "none";
    
    db.collection("eventSurveys")
      .add(formData)
      .then(() => {
        statusMsg.textContent = "Thank you for your feedback!";
        statusMsg.style.color = "green";
        statusMsg.style.display = "block";
        form.reset();
        selectedRating = 0;
        updateStarDisplay(starsContainer, 0);
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Survey";
      })
      .catch((error) => {
        console.error("Error submitting survey:", error);
        statusMsg.textContent = "Error submitting survey. Please try again.";
        statusMsg.style.color = "red";
        statusMsg.style.display = "block";
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Survey";
      });
  });
  
  formContainer.appendChild(form);
  return formContainer;
}

// Create questions form link (opens modal)
function createQuestionsLink(eventId, eventTitle) {
  const linkContainer = document.createElement("div");
  linkContainer.style.cssText = "margin-top: 1rem; text-align: center;";
  
  const questionsLink = document.createElement("a");
  questionsLink.href = "#";
  questionsLink.textContent = "Add Questions";
  questionsLink.className = "questions-link";
  questionsLink.style.cssText = "color: #1f6fb2; text-decoration: none; font-weight: 600; font-size: 1rem; cursor: pointer; border-bottom: 2px solid #1f6fb2;";
  questionsLink.addEventListener("mouseenter", function() {
    this.style.textDecoration = "underline";
  });
  questionsLink.addEventListener("mouseleave", function() {
    this.style.textDecoration = "none";
  });
  
  questionsLink.addEventListener("click", function(e) {
    e.preventDefault();
    openQuestionsModal(eventId, eventTitle);
  });
  
  linkContainer.appendChild(questionsLink);
  return linkContainer;
}

// Open questions modal
function openQuestionsModal(eventId, eventTitle) {
  // Remove existing modal if any
  const existingModal = document.getElementById("questions-modal");
  if (existingModal) {
    existingModal.remove();
  }
  
  // Create modal overlay
  const modal = document.createElement("div");
  modal.id = "questions-modal";
  modal.className = "modal";
  modal.style.cssText = "display: block; position: fixed; z-index: 10000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.5);";
  
  // Create modal content
  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";
  modalContent.style.cssText = "background-color: #ffffff; margin: 5% auto; padding: 2rem; border-radius: 1rem; max-width: 600px; width: 90%; box-shadow: 0 18px 40px rgba(15, 70, 70, 0.2); position: relative;";
  
  // Close button
  const closeBtn = document.createElement("span");
  closeBtn.className = "modal-close";
  closeBtn.innerHTML = "&times;";
  closeBtn.style.cssText = "color: #aaa; float: right; font-size: 2rem; font-weight: bold; cursor: pointer; position: absolute; right: 1rem; top: 1rem; line-height: 1;";
  closeBtn.addEventListener("click", function() {
    modal.style.display = "none";
    modal.remove();
  });
  modalContent.appendChild(closeBtn);
  
  // Title
  const modalTitle = document.createElement("h2");
  modalTitle.textContent = "Ask Questions";
  modalTitle.style.cssText = "margin: 0 0 0.5rem 0; font-size: 1.5rem; font-weight: 600; color: #184c7d; padding-right: 2rem;";
  modalContent.appendChild(modalTitle);

  // Description
  const modalDesc = document.createElement("p");
  modalDesc.textContent = "Submit questions you'd like addressed at this event.";
  modalDesc.style.cssText = "margin: 0 0 1.5rem 0; font-size: 1rem; color: #666;";
  modalContent.appendChild(modalDesc);
  
  // Form
  const form = document.createElement("form");
  form.className = "event-questions-form";
  form.setAttribute("data-event-id", eventId);
  
  // Name field
  const nameContainer = document.createElement("div");
  nameContainer.className = "form-row";
  nameContainer.style.marginBottom = "1rem";
  
  const nameLabel = document.createElement("label");
  nameLabel.textContent = "Your Name *";
  nameLabel.setAttribute("for", `question-name-${eventId}`);
  nameLabel.style.cssText = "display: block; margin-bottom: 0.5rem; font-weight: 600;";
  nameContainer.appendChild(nameLabel);
  
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.id = `question-name-${eventId}`;
  nameInput.name = "name";
  nameInput.required = true;
  nameInput.placeholder = "Enter your name";
  nameInput.style.cssText = "width: 100%; padding: 0.6rem; font-size: 1rem; border-radius: 0.5rem; border: 2px solid #c3d4c6; font-family: inherit; box-sizing: border-box;";
  nameContainer.appendChild(nameInput);
  form.appendChild(nameContainer);
  
  // Email field
  const emailContainer = document.createElement("div");
  emailContainer.className = "form-row";
  emailContainer.style.marginBottom = "1rem";
  
  const emailLabel = document.createElement("label");
  emailLabel.textContent = "Your Email *";
  emailLabel.setAttribute("for", `question-email-${eventId}`);
  emailLabel.style.cssText = "display: block; margin-bottom: 0.5rem; font-weight: 600;";
  emailContainer.appendChild(emailLabel);
  
  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailInput.id = `question-email-${eventId}`;
  emailInput.name = "email";
  emailInput.required = true;
  emailInput.placeholder = "your.email@example.com";
  emailInput.style.cssText = "width: 100%; padding: 0.6rem; font-size: 1rem; border-radius: 0.5rem; border: 2px solid #c3d4c6; font-family: inherit; box-sizing: border-box;";
  emailContainer.appendChild(emailInput);
  form.appendChild(emailContainer);
  
  // Question textarea
  const questionContainer = document.createElement("div");
  questionContainer.className = "form-row";
  questionContainer.style.marginBottom = "1rem";
  
  const questionLabel = document.createElement("label");
  questionLabel.textContent = "Your Question *";
  questionLabel.setAttribute("for", `question-text-${eventId}`);
  questionLabel.style.cssText = "display: block; margin-bottom: 0.5rem; font-weight: 600;";
  questionContainer.appendChild(questionLabel);
  
  const questionTextarea = document.createElement("textarea");
  questionTextarea.id = `question-text-${eventId}`;
  questionTextarea.name = "question";
  questionTextarea.rows = "4";
  questionTextarea.required = true;
  questionTextarea.placeholder = "Enter your question here...";
  questionTextarea.style.cssText = "width: 100%; padding: 0.6rem; font-size: 1rem; border-radius: 0.5rem; border: 2px solid #c3d4c6; font-family: inherit; resize: vertical; box-sizing: border-box;";
  questionContainer.appendChild(questionTextarea);
  form.appendChild(questionContainer);
  
  // Comments/Notes field (same as feedback form)
  const commentsContainer = document.createElement("div");
  commentsContainer.className = "form-row";
  commentsContainer.style.marginBottom = "1.5rem";
  
  const commentsLabel = document.createElement("label");
  commentsLabel.textContent = "Comments";
  commentsLabel.setAttribute("for", `question-comments-${eventId}`);
  commentsLabel.style.cssText = "display: block; margin-bottom: 0.5rem; font-weight: 600;";
  commentsContainer.appendChild(commentsLabel);
  
  const commentsTextarea = document.createElement("textarea");
  commentsTextarea.id = `question-comments-${eventId}`;
  commentsTextarea.name = "comments";
  commentsTextarea.rows = "4";
  commentsTextarea.placeholder = "Additional comments or context (optional)...";
  commentsTextarea.style.cssText = "width: 100%; padding: 0.75rem; font-size: 1rem; border-radius: 0.5rem; border: 2px solid #c3d4c6; font-family: inherit; resize: vertical; box-sizing: border-box;";
  commentsContainer.appendChild(commentsTextarea);
  form.appendChild(commentsContainer);
  
  // Submit button
  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Submit Question";
  submitBtn.className = "primary-btn";
  submitBtn.style.cssText = "font-size: 1rem; padding: 0.7rem 1.6rem; border-radius: 999px; border: none; background-color: #1f6fb2; color: #ffffff; font-weight: 700; cursor: pointer; width: 100%;";
  form.appendChild(submitBtn);
  
  // Status message
  const statusMsg = document.createElement("p");
  statusMsg.className = "questions-status";
  statusMsg.style.cssText = "margin-top: 0.75rem; font-size: 0.95rem; display: none;";
  form.appendChild(statusMsg);
  
  // Form submission
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    
    const questionText = questionTextarea.value.trim();
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    
    if (!questionText) {
      statusMsg.textContent = "Please enter a question.";
      statusMsg.style.color = "red";
      statusMsg.style.display = "block";
      return;
    }
    
    if (!name) {
      statusMsg.textContent = "Please enter your name.";
      statusMsg.style.color = "red";
      statusMsg.style.display = "block";
      return;
    }
    
    if (!email) {
      statusMsg.textContent = "Please enter your email.";
      statusMsg.style.color = "red";
      statusMsg.style.display = "block";
      return;
    }
    
    const comments = commentsTextarea ? commentsTextarea.value.trim() : "";
    
    const formData = {
      eventId: eventId,
      eventTitle: eventTitle || "Untitled Event",
      name: name,
      email: email,
      question: questionText,
      comments: comments,
      submittedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
    statusMsg.style.display = "none";
    
    // Save to Firestore
    db.collection("eventQuestions")
      .add(formData)
      .then(() => {
        statusMsg.textContent = "Thank you! Your question has been submitted.";
        statusMsg.style.color = "green";
        statusMsg.style.display = "block";
        form.reset();
        setTimeout(() => {
          modal.style.display = "none";
          modal.remove();
        }, 2000);
      })
      .catch((error) => {
        console.error("Error submitting question:", error);
        statusMsg.textContent = "Error submitting question. Please try again.";
        statusMsg.style.color = "red";
        statusMsg.style.display = "block";
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Question";
      });
    
    // Also send to Google Sheets if configured
    console.log("About to call sendToGoogleSheets for question with formData:", formData);
    sendToGoogleSheets({
      type: 'question',
      ...formData
    }).catch((error) => {
      console.error("Error sending to Google Sheets:", error);
      // Don't show error to user - Firestore save is the primary storage
    });
  });
  
  // Close modal when clicking outside
  modal.addEventListener("click", function(e) {
    if (e.target === modal) {
      modal.style.display = "none";
      modal.remove();
    }
  });
  
  modalContent.appendChild(form);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}
