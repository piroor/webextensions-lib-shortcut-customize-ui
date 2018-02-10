# webextensions-lib-shortcut-customize-ui

Generates configuration UI for keyboard shortcuts.

## Basic usage

Load the file `ShortcutCustomizeUI.js` from any document (options page, sidebar panel, or browser action panel), like:

```json
<script type="application/javascript" src="./ShortcutCustomizeUI.js"></script>
```

And, call `ShortcutCustomizeUI.build()`. It returns a DOM element:

```javascript
var list = await ShortcutCustomizeUI.build();
document.getElementById('shortcuts').appendChild(list);
```
