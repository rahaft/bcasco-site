// Helper script to add BCASCO Calendar 2025-2026 events to Firestore
// Run this in the browser console while logged into the admin page (admin.html)
// Or paste into the browser console on any page after Firebase is initialized

const bcascoEvents = [
  {
    title: "Let's Get Started Improving the Lives of Seniors",
    date: "2025-09-12",
    time: "10:00 AM - 12:00 Noon",
    location: "Randallstown Community Center, 3505 Resource Drive, Randallstown, 21133",
    notes: "Networking at 9:30 AM",
    flyerUrl: ""
  },
  {
    title: "The Unmet Needs of Senior Veterans",
    date: "2025-11-21",
    time: "10:00 AM - 12:00 Noon",
    location: "Randallstown Community Center, 3505 Resource Drive, Randallstown, 21133",
    notes: "Networking at 9:30 AM",
    flyerUrl: ""
  },
  {
    title: "Medicaid Waiver Home and Community Based Services, The Good and the Bad",
    date: "2026-01-09",
    time: "10:00 AM - 12:00 Noon",
    location: "Randallstown Community Center, 3505 Resource Drive, Randallstown, 21133",
    notes: "Networking at 9:30 AM",
    flyerUrl: ""
  },
  {
    title: "Annual Senior Educational Resource Event",
    date: "2026-03-13",
    time: "10:00 AM - 12:00 Noon",
    location: "Randallstown Community Center, 3505 Resource Drive, Randallstown, 21133",
    notes: "Networking at 9:30 AM",
    flyerUrl: ""
  },
  {
    title: "Senior State Legislative Roundup",
    date: "2026-05-08",
    time: "10:00 AM - 12:00 Noon",
    location: "Randallstown Community Center, 3505 Resource Drive, Randallstown, 21133",
    notes: "Networking at 9:30 AM",
    flyerUrl: ""
  },
  {
    title: "Annual Luncheon",
    date: "2026-06-12",
    time: "Time/Location TBA",
    location: "TBA",
    notes: "Annual Luncheon – Time/Location TBA",
    flyerUrl: ""
  }
];

// Function to add all events
async function addBCASCOEvents() {
  if (!db || !firebase) {
    console.error("Firebase not initialized. Make sure you're on a page with Firebase loaded.");
    return;
  }

  console.log("Adding BCASCO events...");
  let added = 0;
  let errors = 0;

  for (const event of bcascoEvents) {
    try {
      const payload = {
        ...event,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      await db.collection("events").add(payload);
      console.log(`✓ Added: ${event.title}`);
      added++;
    } catch (error) {
      console.error(`✗ Error adding "${event.title}":`, error);
      errors++;
    }
  }

  console.log(`\nComplete! Added ${added} events, ${errors} errors.`);
}

// Run the function
addBCASCOEvents();
