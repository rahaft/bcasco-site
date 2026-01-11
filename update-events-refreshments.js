// Script to update all events in Firestore to remove "and Refreshments" from notes
// Run this in the browser console while logged into the admin page (admin.html)
// Or paste into the browser console on any page after Firebase is initialized

async function updateEventsRefreshments() {
  if (!db || !firebase) {
    console.error("Firebase not initialized. Make sure you're on a page with Firebase loaded.");
    return;
  }

  console.log("Updating events to remove 'and Refreshments'...");
  let updated = 0;
  let errors = 0;

  try {
    // Get all events
    const snapshot = await db.collection("events").get();
    
    if (snapshot.empty) {
      console.log("No events found in the database.");
      return;
    }

    // Process events in batches
    const updates = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const notes = data.notes || "";
      
      // Check if notes contains "Networking and Refreshments" and update it
      if (notes.includes("Networking and Refreshments")) {
        const updatedNotes = notes.replace(/Networking and Refreshments/gi, "Networking");
        
        updates.push({
          ref: doc.ref,
          oldNotes: notes,
          newNotes: updatedNotes,
          title: data.title || doc.id
        });
      }
    });

    // Process updates in batches of 500 (Firestore limit)
    const BATCH_SIZE = 500;
    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const batchUpdates = updates.slice(i, i + BATCH_SIZE);
      
      batchUpdates.forEach((update) => {
        batch.update(update.ref, {
          notes: update.newNotes,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Will update: "${update.title}"`);
        console.log(`  Old: ${update.oldNotes}`);
        console.log(`  New: ${update.newNotes}`);
      });
      
      await batch.commit();
      updated += batchUpdates.length;
    }

    console.log(`\n✓ Complete! Updated ${updated} events.`);
    
    if (updated === 0) {
      console.log("No events needed updating (they may already be correct).");
    }
  } catch (error) {
    console.error("Error updating events:", error);
    errors++;
  }

  if (errors > 0) {
    console.log(`\n✗ ${errors} errors occurred.`);
  }
}

// Run the function
updateEventsRefreshments();