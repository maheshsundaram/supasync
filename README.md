# Supasync - Supabase Timezone Converter

![Extension Icon](icon128.png)

**Quickly convert UTC datetimes in your Supabase tables to multiple timezones, with visual highlighting of differences.**

Supasync is a browser extension designed to make working with timezones in Supabase a breeze. When you select a datetime cell in the Supabase table editor, Supasync displays a handy popup with that time converted to a list of common timezones, along with the offset from UTC.

## Demo

![Supasync Demo](demo.png)

## Features

*   **Instant Conversions:** Click on any datetime cell in a Supabase table view to see conversions.
*   **Multiple Timezones:** View times converted to a pre-set list of useful timezones:
    *   Honolulu
    *   San Francisco
    *   Cancun
    *   Chicago
    *   New York
    *   Lahore
*   **UTC Reference:** The original UTC time is always clearly displayed.
*   **Visual Difference Highlighting:**
    *   Segments of the converted datetime (year, month, day, hour, minute, second) that differ from the UTC time are highlighted.
    *   Highlights are color-coded: green if the converted time is later than UTC, red if earlier.
*   **Delta Column:** Shows the time difference from UTC (e.g., "-7 hrs", "+5.5 hrs") for each timezone.
*   **Dark Theme UI:** A clean, dark-themed panel appears near the selected cell for easy readability.
*   **Automatic Detection:** Works on Supabase project table editor pages.

## How to Use

1.  Install the extension.
2.  Navigate to your Supabase project and open a table in the editor view.
3.  Single-click on any cell containing a datetime string (e.g., `2023-10-26T14:30:00Z` or `2023-10-26 14:30:00+00`).
4.  A small panel will appear below the selected cell showing the UTC time and its conversions to the configured timezones, along with the delta and highlighted differences.
5.  Click anywhere outside the panel to dismiss it.

## Installation

### From Chrome Web Store (Recommended)

*Once published, you will be able to install Supasync directly from the Chrome Web Store.* (Link will be added here)

### Manual Installation (for development or testing)

1.  Download the extension files (or clone the repository).
2.  Open Chrome and navigate to `chrome://extensions`.
3.  Enable "Developer mode" using the toggle in the top right corner.
4.  Click the "Load unpacked" button.
5.  Select the directory where you downloaded/cloned the extension files (the directory containing `manifest.json`).

## Author

Mahesh Sundaram

---

We've now covered all the items from your `spec.md` and prepared the necessary files and information for a Chrome Web Store submission.

You can now run the zip command we discussed earlier:
```bash
zip -r supabase_timezone_converter.zip . -x "*.git*" "*.DS_Store" "spec.md" "demo.png"
```
This will create `supabase_timezone_converter.zip` in your project's root directory, ready for upload to the Chrome Web Store Developer Dashboard. Remember to create your icon files (`icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`) and place them in the root folder before zipping if you haven't already.
