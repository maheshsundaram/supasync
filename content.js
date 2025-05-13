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

if (isSupabaseTableView()) {
  console.log("Supabase table view detected.");
  // Future logic to interact with datetime cells will go here.
} else {
  console.log("Not a Supabase table view.");
}
