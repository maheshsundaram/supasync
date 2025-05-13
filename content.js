// Content script for Supabase Timezone Converter

console.log("Supabase Timezone Converter content script loaded.");

function isSupabaseTableView() {
  // Basic check: Supabase table editor URLs typically look like:
  // https://app.supabase.com/project/{project_id}/editor/table/{table_id}
  // or similar for self-hosted instances.
  // This regex looks for '/editor/table/' in the path.
  const supabaseTablePattern = /\/editor\/table\//i;
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
    const clickedElement = event.target;
    if (clickedElement && clickedElement.textContent) {
      const textContent = clickedElement.textContent.trim();
      const parsedDate = attemptToParseDate(textContent);

      if (parsedDate) {
        console.log("Clicked on potential datetime cell. Parsed date (UTC):", parsedDate.toISOString(), "Original text:", textContent);
        // Next step: Trigger UI for conversion (e.g., show a small button or send to background for popup)
      }
    }
  }, true); // Use capture phase to catch clicks early, might be useful for complex UIs

} else {
  console.log("Not a Supabase table view. Click listener not added.");
}
