# webextensions-lib-shortcut-customize-ui

Generates configuration UI for keyboard shortcuts, for WebExtensions-based Firefox addons.

## Screenshots

![(Screenshot of generated UI)](screenshot.png)

## Basic usage

Load the file `ShortcutCustomizeUI.js` from any document (options page, sidebar panel, or browser action panel), like:

```json
<script type="application/javascript" src="./ShortcutCustomizeUI.js"></script>
```

And, call `ShortcutCustomizeUI.build()`. It returns a promise resolved with a DOM element:

```javascript
ShortcutCustomizeUI.build.then(list => {
  document.getElementById('shortcuts').appendChild(list);
});
```
