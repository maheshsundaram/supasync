// Background script for Supabase Timezone Converter
// This script will handle context menu creation and event handling.

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "convertToTimezone",
    title: "Convert Supabase DateTime",
    contexts: ["selection"] // Show only when text is selected
  });
  console.log("Context menu created for selection.");
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

console.log("Background script loaded and listeners set up.");
