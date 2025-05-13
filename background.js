// Background script for Supabase Timezone Converter
// This script will handle context menu creation and event handling.

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "convertToTimezone",
    title: "Convert Supabase DateTime",
    contexts: ["selection"], // Show only when text is selected
    documentUrlPatterns: ["*://*.supabase.com/*", "*://*.supabase.co/*"] // Only on Supabase pages
  });
  console.log("Context menu created for selection on Supabase pages.");
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "convertToTimezone") {
    console.log("Context menu item 'convertToTimezone' clicked.");
    const selectedText = info.selectionText;
    if (selectedText) {
      console.log("Selected text:", selectedText);
      try {
        const date = new Date(selectedText);
        if (isNaN(date.getTime())) {
          console.error("Failed to parse selected text as a valid date:", selectedText);
        } else {
          console.log("Successfully parsed date:", date.toISOString());
          // Next step will be to convert this date to a selected timezone.
        }
      } catch (error) {
        console.error("Error parsing date from selected text:", selectedText, error);
      }
    } else {
      console.log("No text selected.");
    }
    // console.log("Page URL:", info.pageUrl); // Still available if needed
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "convertTime" && request.dateString) {
    console.log("Background: Received date to convert:", request.dateString);
    const originalDate = new Date(request.dateString);

    if (isNaN(originalDate.getTime())) {
      console.error("Background: Invalid date string received:", request.dateString);
      sendResponse({ error: "Invalid date string" });
      return true; // Indicates asynchronous response
    }

    // Example timezones - these will later come from user preferences
    const targetTimezones = [
      { tz: "Pacific/Honolulu", label: "Honolulu" },
      { tz: "America/Los_Angeles", label: "San Francisco" },
      { tz: "America/Cancun", label: "Cancun" },
      { tz: "America/Chicago", label: "Chicago" },
      { tz: "America/New_York", label: "New York" },
      { tz: "Asia/Karachi", label: "Lahore" }
    ];

    const conversions = targetTimezones.map(tzInfo => {
      try {
        const options = {
          timeZone: tzInfo.tz,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        };
        // 'sv-SE' locale typically formats as YYYY-MM-DD HH:MM:SS
        const formattedTime = new Intl.DateTimeFormat('sv-SE', options).format(originalDate);
        return {
          label: tzInfo.label,
          time: formattedTime.replace(' ', 'T') // Replace space with T for desired format
        };
      } catch (e) {
        console.error(`Background: Error converting to timezone ${tzInfo.tz}:`, e);
        return { label: tzInfo.label, time: "Error" };
      }
    });

    console.log("Background: Original UTC:", originalDate.toISOString());
    console.log("Background: Conversions:", conversions);

    sendResponse({ status: "success", originalUtc: originalDate.toISOString(), conversions: conversions });
    return true; // Indicates asynchronous response
  }
  return true; // Keep channel open for other message types if any
});

console.log("Background script loaded and listeners set up, including message listener.");
