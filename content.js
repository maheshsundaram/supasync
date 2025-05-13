// Content script for Supabase Timezone Converter

console.log("Supabase Timezone Converter content script loaded.");

function isSupabaseTableView() {
  // Basic check: Supabase table editor URLs typically look like:
  // https://app.supabase.com/project/{project_id}/editor/table/{table_id}
  // or similar for self-hosted instances, e.g., https://supabase.com/dashboard/project/{project_id}/editor/{table_id}
  // This regex looks for '/project/{project_id}/editor/{table_id}' in the path.
  const supabaseTablePattern = /\/project\/[^\/]+\/editor\/[^\/]+/i;
  return supabaseTablePattern.test(window.location.href);
}

function attemptToParseDate(text) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return null;
  }
  try {
    // Attempt to match common ISO-like date formats,
    // Supabase often uses 'YYYY-MM-DD HH:MM:SS.MSSTZ' or similar
    // A simple check for digits, hyphens, colons, spaces should be a good start.
    // This is not a perfect validation but a heuristic.
    if (!/\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}/.test(text)) {
      // console.log("Text does not look like a datetime:", text);
      return null;
    }

    const date = new Date(text);
    if (isNaN(date.getTime())) {
      console.warn("Clicked text looked like a date, but failed to parse:", text);
      return null;
    }
    return date;
  } catch (error) {
    console.warn("Error parsing text as date:", text, error);
    return null;
  }
}

if (isSupabaseTableView()) {
  console.log("Supabase table view detected. Observing for selected datetime cells.");

  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'aria-selected') {
        const cellElement = mutation.target;
        // Ensure it's a gridcell and is now selected
        if (cellElement.getAttribute('role') === 'gridcell' && cellElement.getAttribute('aria-selected') === 'true') {
          if (cellElement.textContent) {
            const textContent = cellElement.textContent.trim();
            const parsedDate = attemptToParseDate(textContent);

            if (parsedDate) {
              const dateISOString = parsedDate.toISOString();
              console.log("Selected datetime cell detected (via MutationObserver). Parsed date (UTC):", dateISOString, "Original text:", textContent);
              console.log("Cell element:", cellElement);

              // Send the parsed date to the background script for conversion
              chrome.runtime.sendMessage({
                type: "convertTime",
                dateString: dateISOString,
                originalText: textContent
              }, (response) => {
                if (chrome.runtime.lastError) {
                  console.error("Error sending message to background:", chrome.runtime.lastError.message);
                } else if (response && response.status === "success") {
                  console.log("Response from background script:", response);
                  displayConversionResults(response, cellElement, textContent);
                } else if (response) {
                  console.error("Received error or unexpected response from background:", response);
                }
              });
            } else {
              // Optional: log if a selected cell was clicked but not a date
              // console.log("Selected cell (via MutationObserver) is not a parsable date:", textContent);
            }
          }
        }
      }
    }
  });

  // Start observing the document element and its descendants for attribute changes.
  // We filter for 'aria-selected' to be more efficient.
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['aria-selected'],
    subtree: true
  });

} else {
  console.log("Not a Supabase table view. MutationObserver for selected cells not started.");
}

const RESULTS_PANEL_ID = 'supabase-tz-converter-results-panel';

function removeResultsPanel() {
  const existingPanel = document.getElementById(RESULTS_PANEL_ID);
  if (existingPanel) {
    existingPanel.remove();
  }
}

function displayConversionResults(data, cellElement, originalText) {
  removeResultsPanel(); // Remove any existing panel

  const panel = document.createElement('div');
  panel.id = RESULTS_PANEL_ID;
  panel.style.position = 'absolute';
  panel.style.border = '1px solid #555'; // Darker border
  panel.style.background = '#333'; // Dark background
  panel.style.color = '#f0f0f0'; // Light text
  panel.style.padding = '10px';
  panel.style.zIndex = '10000'; // Ensure it's on top
  panel.style.fontSize = '12px';
  panel.style.fontFamily = 'sans-serif';
  panel.style.boxShadow = '0 2px 8px rgba(0,0,0,0.5)'; // Adjusted shadow for dark theme
  panel.style.borderRadius = '4px';

  let content = `<strong>Original (${originalText}):</strong> ${data.originalUtc}<br><hr style="margin: 5px 0; border-color: #666;">`; // Darker hr
  content += `<strong>Converted Times:</strong><ul>`;
  data.conversions.forEach(conv => {
    content += `<li style="list-style-type: none; margin-left: 0; padding-left: 0;">${conv.label}: ${conv.time}</li>`;
  });
  content += `</ul>`;
  panel.innerHTML = content;

  // Position the panel near the cell
  const rect = cellElement.getBoundingClientRect();
  panel.style.top = `${window.scrollY + rect.bottom + 5}px`; // 5px below the cell
  panel.style.left = `${window.scrollX + rect.left}px`;

  document.body.appendChild(panel);

  // Add a listener to remove the panel when clicking outside
  // Use a timeout to prevent immediate removal by the same click that triggered it
  setTimeout(() => {
    document.addEventListener('click', handleClickOutsidePanel, { once: true, capture: true });
  }, 0);
}

function handleClickOutsidePanel(event) {
  const panel = document.getElementById(RESULTS_PANEL_ID);
  // If the click is outside the panel, remove it
  if (panel && !panel.contains(event.target)) {
    removeResultsPanel();
  } else if (panel) {
    // If click was inside, re-add listener for next click
    // This handles cases where user interacts with panel content (if we add any later)
    document.addEventListener('click', handleClickOutsidePanel, { once: true, capture: true });
  }
}
