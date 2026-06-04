Please make the following calendar UI adjustments:

### 1. Fix Year Picker Width

The year selection logic is already working correctly. Do not change any existing functionality or behavior.

Update the year picker UI in both:

* Personal Calendar
* Group Calendar

Requirements:

* The year selector width should automatically fit the content being displayed.
* Ensure the dropdown/popover and trigger control are wide enough to display the selected year without being cramped or truncated.
* Match the sizing, spacing, and visual consistency of the month selector.
* Maintain a clean and consistent appearance across Personal Calendar and Group Calendar.
* Reuse existing calendar components/styles where possible.

### 2. Remove Personal Calendar Demo Error Section

In the Personal Calendar, there is a demo/error showcase section that was added for testing purposes.

Requirements:

* Remove the demo error display completely.
* Remove any related mock/demo UI elements, messages, or test components associated with that error showcase.
* Ensure no broken references remain after removal.
* Verify that the Personal Calendar continues to function normally after cleanup.

### Validation

After making the changes:

* Confirm that year selection still works correctly.
* Confirm that the year picker width is appropriate in both Personal Calendar and Group Calendar.
* Confirm that all demo error content has been removed from Personal Calendar.
* Run TypeScript, ESLint, and build checks to ensure there are no regressions.

