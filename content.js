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
  console.log("Supabase table view detected. Listening for clicks on potential datetime cells.");

  document.addEventListener('click', (event) => {
    // Try to find the closest parent cell that is a gridcell and is selected
    const selectedCell = event.target.closest('[role="gridcell"][aria-selected="true"]');

    if (selectedCell && selectedCell.textContent) {
      const textContent = selectedCell.textContent.trim();
      const parsedDate = attemptToParseDate(textContent);

      if (parsedDate) {
        console.log("Selected datetime cell detected. Parsed date (UTC):", parsedDate.toISOString(), "Original text:", textContent);
        console.log("Cell element:", selectedCell);
        // Next step: Show custom UI element near/on this 'selectedCell' for conversion.
      } else {
        // Optional: log if a selected cell was clicked but not a date
        // console.log("Selected cell is not a parsable date:", textContent);
      }
    }
  }, true); // Use capture phase

} else {
  console.log("Not a Supabase table view. Click listener for selected cells not added.");
}
