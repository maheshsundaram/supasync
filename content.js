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

// Helper function to highlight differences between two YYYY-MM-DDTHH:mm:ss strings
function highlightDiff(baseTimeString, convertedTimeString) {
    // Parse the time strings to Date objects to determine overall delta
    // Assumes YYYY-MM-DDTHH:MM:SS format which Date constructor handles
    const baseDate = new Date(baseTimeString);
    const convertedDate = new Date(convertedTimeString);

    let highlightColorStyle = 'color: #FFFF00;'; // Default to Yellow (e.g., if times are identical)

    if (convertedDate.getTime() > baseDate.getTime()) {
        highlightColorStyle = 'color: #00FF00;'; // Green for positive delta (converted time is later)
    } else if (convertedDate.getTime() < baseDate.getTime()) {
        highlightColorStyle = 'color: #FF0000;'; // Red for negative delta (converted time is earlier)
    }

    const highlightStyle = `${highlightColorStyle} font-weight: bold;`;
    let resultHtml = '';

    const segments = [
        { start: 0, end: 4, separator: '-' },  // YYYY
        { start: 5, end: 7, separator: '-' },  // MM
        { start: 8, end: 10, separator: 'T' }, // DD
        { start: 11, end: 13, separator: ':' },// HH
        { start: 14, end: 16, separator: ':' },// mm
        { start: 17, end: 19, separator: '' }   // ss
    ];

    for (const segment of segments) {
        const baseSegmentValue = baseTimeString.substring(segment.start, segment.end);
        const convertedSegmentValue = convertedTimeString.substring(segment.start, segment.end);

        if (baseSegmentValue !== convertedSegmentValue) {
            resultHtml += `<span style="${highlightStyle}">${convertedSegmentValue}</span>`;
        } else {
            resultHtml += convertedSegmentValue;
        }
        resultHtml += segment.separator;
    }
    return resultHtml;
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

  // Display UTC time formatted as YYYY-MM-DDTHH:mm:ss
  const formattedUtc = data.originalUtc.slice(0, 19);
  let content = `<div style="margin-bottom: 5px;"><strong>UTC:</strong> ${formattedUtc}</div>`;
  content += `<table style="width: 100%; border-collapse: collapse; font-size: 11px;">`; // Slightly smaller font for table
  content += `
    <thead style="text-align: left;">
      <tr>
        <th style="padding: 3px 5px; border-bottom: 1px solid #666;">TZ</th>
        <th style="padding: 3px 5px; border-bottom: 1px solid #666;">Datetime</th>
        <th style="padding: 3px 5px; border-bottom: 1px solid #666;">Delta</th>
      </tr>
    </thead>
    <tbody>
  `;

  data.conversions.forEach((conv, index) => {
    const alternateRowStyle = index % 2 === 0 ? "background-color: #2c2c2c;" : "background-color: #383838;";
    const highlightedTime = highlightDiff(formattedUtc, conv.time);
    content += `
      <tr style="${alternateRowStyle}">
        <td style="padding: 3px 5px; border-bottom: 1px solid #4a4a4a;">${conv.label}</td>
        <td style="padding: 3px 5px; border-bottom: 1px solid #4a4a4a;">${highlightedTime}</td>
        <td style="padding: 3px 5px; border-bottom: 1px solid #4a4a4a;">${conv.delta}</td>
      </tr>
    `;
  });

  content += `</tbody></table>`;
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
