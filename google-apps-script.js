/**
 * Google Apps Script for BCASCO Forms
 * This script receives form submissions and writes them to Google Sheets
 * and sends email notifications
 */

// Script version - increment this when making changes
const SCRIPT_VERSION = '1.0.2';
const SCRIPT_SHEET_ID = '1cuUyYihgoLX6cePNYP2MSS0C42psktMKg81006t43pQ'; // New Sheet ID

// Replace 'YOUR_SPREADSHEET_ID' with your actual Google Sheet ID
// You can find this in the URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
const SPREADSHEET_ID = SCRIPT_SHEET_ID;

// Email notification settings
// Replace with the email address(es) that should receive notifications
// For multiple emails, use: ['email1@example.com', 'email2@example.com']
const NOTIFICATION_EMAIL = 'bwiseman84@hotmail.com'; // Change this to your email address

// Email sender settings
// IMPORTANT: To send FROM bcasco.maryland@gmail.com, the script must be owned by that Gmail account
// The script will send from whatever Gmail account owns/runs it
const SENDER_EMAIL = 'bcasco.maryland@gmail.com'; // Desired sender email (must own script with this account)

function doPost(e) {
  try {
    // Get the spreadsheet
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    const formType = data.type; // 'question' or 'feedback'
    
    if (formType === 'question') {
      // Write to Questions sheet
      const questionsSheet = ss.getSheetByName('Questions');
      if (!questionsSheet) {
        throw new Error('Questions sheet not found. Please create a sheet named "Questions"');
      }
      
      // Format timestamp
      const timestamp = data.submittedAt ? new Date(data.submittedAt.seconds * 1000) : new Date();
      
      // Append row
      questionsSheet.appendRow([
        timestamp,
        data.eventId || '',
        data.eventTitle || '',
        data.name || '',
        data.email || '',
        data.question || '',
        data.comments || ''
      ]);
      
      // Send email notification
      sendQuestionNotification(data, timestamp);
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Question saved to Google Sheets',
        version: SCRIPT_VERSION,
        sheetId: SPREADSHEET_ID
      })).setMimeType(ContentService.MimeType.JSON);
      
    } else if (formType === 'feedback') {
      // Write to Feedback sheet
      const feedbackSheet = ss.getSheetByName('Feedback');
      if (!feedbackSheet) {
        throw new Error('Feedback sheet not found. Please create a sheet named "Feedback"');
      }
      
      // Format timestamp
      const timestamp = data.submittedAt ? new Date(data.submittedAt.seconds * 1000) : new Date();
      
      // Append row
      feedbackSheet.appendRow([
        timestamp,
        data.eventId || '',
        data.eventTitle || '',
        data.name || '',
        data.email || '',
        data.rating || '',
        data.notes || ''
      ]);
      
      // Send email notification
      sendFeedbackNotification(data, timestamp);
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Feedback saved to Google Sheets',
        version: SCRIPT_VERSION,
        sheetId: SPREADSHEET_ID
      })).setMimeType(ContentService.MimeType.JSON);
      
    } else {
      throw new Error('Invalid form type. Must be "question" or "feedback"');
    }
    
  } catch (error) {
    // Log error for debugging
    console.error('Error processing form submission:', error);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString(),
      version: SCRIPT_VERSION,
      sheetId: SPREADSHEET_ID
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function (optional - for testing in Apps Script editor)
function testQuestionSubmission() {
  const testData = {
    type: 'question',
    eventId: 'test123',
    eventTitle: 'Test Event',
    name: 'Test User',
    email: 'test@example.com',
    question: 'This is a test question',
    comments: 'Test comments',
    submittedAt: { seconds: Math.floor(Date.now() / 1000) }
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}

function testFeedbackSubmission() {
  const testData = {
    type: 'feedback',
    eventId: 'test123',
    eventTitle: 'Test Event',
    name: 'Test User',
    email: 'test@example.com',
    rating: 5,
    notes: 'Great event!',
    submittedAt: { seconds: Math.floor(Date.now() / 1000) }
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}

// Function to send email notification for questions
function sendQuestionNotification(data, timestamp) {
  if (!NOTIFICATION_EMAIL) {
    return; // No email configured, skip
  }
  
  // Safety check: ensure data exists
  if (!data) {
    console.error('sendQuestionNotification: data is undefined');
    return;
  }
  
  try {
    const subject = `New Question Submitted: ${(data && data.eventTitle) ? data.eventTitle : 'Event'}`;
    
    let body = `A new question has been submitted through the BCASCO website.\n\n`;
    body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    body += `EVENT INFORMATION\n`;
    body += `Event: ${(data && data.eventTitle) ? data.eventTitle : 'N/A'}\n`;
    body += `Event ID: ${(data && data.eventId) ? data.eventId : 'N/A'}\n\n`;
    body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    body += `SUBMITTER INFORMATION\n`;
    body += `Name: ${(data && data.name) ? data.name : 'N/A'}\n`;
    body += `Email: ${(data && data.email) ? data.email : 'N/A'}\n\n`;
    body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    body += `QUESTION\n`;
    body += `${(data && data.question) ? data.question : 'N/A'}\n\n`;
    
    if (data && data.comments && data.comments.trim()) {
      body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      body += `ADDITIONAL COMMENTS\n`;
      body += `${data.comments}\n\n`;
    }
    
    body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    const formattedTimestamp = (timestamp && timestamp.toLocaleString) ? timestamp.toLocaleString() : (timestamp ? timestamp.toString() : new Date().toLocaleString());
    body += `Submitted: ${formattedTimestamp}\n`;
    body += `\nThis is an automated notification from the BCASCO website.`;
    
    // Send email using GmailApp to send from a specific Gmail address
    // Note: To send from bcasco.maryland@gmail.com, the script must be owned by or run as that Gmail account
    const recipients = Array.isArray(NOTIFICATION_EMAIL) ? NOTIFICATION_EMAIL : [NOTIFICATION_EMAIL];
    recipients.forEach(email => {
      if (SENDER_EMAIL && SENDER_EMAIL.includes('@gmail.com')) {
        // Use GmailApp to send from the Gmail account that owns this script
        GmailApp.sendEmail(email, subject, body);
      } else {
        // Fallback to MailApp if not using Gmail
        MailApp.sendEmail({
          to: email,
          subject: subject,
          body: body
        });
      }
    });
  } catch (error) {
    console.error('Error sending question notification email:', error);
    // Don't fail the whole request if email fails
  }
}

// Function to send email notification for feedback
function sendFeedbackNotification(data, timestamp) {
  if (!NOTIFICATION_EMAIL) {
    return; // No email configured, skip
  }
  
  // Safety check: ensure data exists
  if (!data) {
    console.error('sendFeedbackNotification: data is undefined');
    return;
  }
  
  try {
    const subject = `New Feedback Submitted: ${(data && data.eventTitle) ? data.eventTitle : 'Event'}`;
    
    let body = `New feedback has been submitted through the BCASCO website.\n\n`;
    body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    body += `EVENT INFORMATION\n`;
    body += `Event: ${(data && data.eventTitle) ? data.eventTitle : 'N/A'}\n`;
    body += `Event ID: ${(data && data.eventId) ? data.eventId : 'N/A'}\n\n`;
    body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    body += `SUBMITTER INFORMATION\n`;
    body += `Name: ${(data && data.name) ? data.name : 'N/A'}\n`;
    body += `Email: ${(data && data.email) ? data.email : 'N/A'}\n\n`;
    body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    body += `RATING\n`;
    body += `${(data && data.rating) ? '⭐'.repeat(data.rating) + ` (${data.rating}/5)` : 'N/A'}\n\n`;
    
    if (data && data.notes && data.notes.trim()) {
      body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      body += `FEEDBACK\n`;
      body += `${data.notes}\n\n`;
    }
    
    body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    const formattedTimestamp = (timestamp && timestamp.toLocaleString) ? timestamp.toLocaleString() : (timestamp ? timestamp.toString() : new Date().toLocaleString());
    body += `Submitted: ${formattedTimestamp}\n`;
    body += `\nThis is an automated notification from the BCASCO website.`;
    
    // Send email using GmailApp to send from a specific Gmail address
    // Note: To send from bcasco.maryland@gmail.com, the script must be owned by or run as that Gmail account
    const recipients = Array.isArray(NOTIFICATION_EMAIL) ? NOTIFICATION_EMAIL : [NOTIFICATION_EMAIL];
    recipients.forEach(email => {
      if (SENDER_EMAIL && SENDER_EMAIL.includes('@gmail.com')) {
        // Use GmailApp to send from the Gmail account that owns this script
        GmailApp.sendEmail(email, subject, body);
      } else {
        // Fallback to MailApp if not using Gmail
        MailApp.sendEmail({
          to: email,
          subject: subject,
          body: body
        });
      }
    });
  } catch (error) {
    console.error('Error sending feedback notification email:', error);
    // Don't fail the whole request if email fails
  }
}
