// Background script for Supabase Timezone Converter
// This script will handle context menu creation and event handling.

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "convertToTimezone",
    title: "Convert Supabase DateTime",
    contexts: ["selection", "page"] // Show for selected text and on the page
  });
  console.log("Context menu created.");
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "convertToTimezone") {
    // Placeholder for conversion logic
    console.log("Context menu item clicked!");
    console.log("Selected text:", info.selectionText);
    console.log("Page URL:", info.pageUrl);
    // In a real scenario, we'd send a message to a content script
    // or open a popup with the selected text.
  }
});

console.log("Background script loaded and listeners set up.");
