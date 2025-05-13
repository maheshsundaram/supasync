# Core Functionality

Right-click context menu on datetime cells in Supabase table view that converts UTC times to user-selected timezones

# Extension Structure

Background script to handle the context menu creation
Content script to identify and process datetime cells
Options page to manage saved timezones
Popup for quick timezone conversions

# Implementation Steps

Create a context menu that appears when right-clicking on datetime cells
Add ability to detect if the user is on a Supabase table view
Parse the UTC datetime from the selected cell
Convert to selected timezone(s)
Display results in a submenu or popup
Store user's preferred timezones in extension storage
