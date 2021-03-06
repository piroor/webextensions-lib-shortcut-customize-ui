# webextensions-lib-shortcut-customize-ui

![Build Status](https://github.com/piroor/webextensions-lib-shortcut-customize-ui/actions/workflows/main.yml/badge.svg?branch=trunk)

*Important Note: Firefox 66 and later natively support changing of keyboard shortcuts via about:addons. This library is no longer required.*


Generates configuration UI for keyboard shortcuts, for WebExtensions-based Firefox addons. Note that this library will become obsolete after [the bug 1303384](https://bugzilla.mozilla.org/show_bug.cgi?id=1303384 "1303384 - UI for re-assigning an extension's command shortcut") fixed.

 * Due to [the bug 1325692](https://bugzilla.mozilla.org/show_bug.cgi?id=1325692 "1325692 - [commands] Explicit support for overriding built-in keyboard shortcuts by WebExtensions") you cannot use some printable key shortcuts reserved for Firefox's built-in commands (like "Ctrl-A"). On the other hand, you can override non-printable key shortcuts (like "Ctrl-Shift-Left").
 * Due to [the bug 1475043](https://bugzilla.mozilla.org/show_bug.cgi?id=1475043 "1475043 - Allow commands.update() to un-set a shortcut, disabling the command"), addons cannot unassign default shortcuts defined by `suggested_key` in its `manifest.json`. This library provides a workaround for the problem: it detects default shortcuts defined in the `description` field and provides ability to assign them as the initial user-defined shortcuts.

## Screenshots

![(Screenshot of generated UI)](screenshot.png)

## Basic usage (initialization)

Move definitions of the default shortcut in your `manifest.json`, from `suggested_key` to `description`. For exmaple:

```json
  "commands": {
    "_execute_browser_action": {
      "suggested_key": { "default": "F1" },
      "description": "__MSG_sidebarToggleDescription__"
    },
```

It should become:

```json
  "commands": {
    "_execute_browser_action": {
      "description": "__MSG_sidebarToggleDescription__ (F1)"
    },
```

You must put default shortcut in the format `(shortcut)` at the end of the description. Please note that you cannot define platform specific default shortcut.

Then load the file `ShortcutCustomizeUI.js` from a background page, like:

```json
<script type="application/javascript" src="./ShortcutCustomizeUI.js"></script>
```

And, call `ShortcutCustomizeUI.setDefaultShortcuts()` just once.

```javascript
(async () => {
  // logic to run initialization only once
  const SHORTCUTS_VERSION = 1;
  const configs = await browser.storage.local.get({ shortcutsVersion: 0 });
  switch (configs.shortcutsVersion) {
    case 0:
      ShortcutCustomizeUI.setDefaultShortcuts();
  }
  browser.storage.local.set({ shortcutsVersion: SHORTCUTS_VERSION });
})();
```

It assigns default shortcuts defined in the `description` field as the initial user-defined shortcut. Please note that you should not call the method multiple times - it will reassign default shortcuts even if they are unassigned by the user. You should keep the "already initialized" status by something way.

If you add extra shortcuts added after the initial release, you need to add command definitions to the `manifest.json` like:

```json
"commands": {
    "_execute_browser_action": {
      "description": "__MSG_sidebarToggleDescription__ (F1)"
    },
    "newCommand": {
      "description": "__MSG_newCommand__ (Ctrl+Alt+PageUp)"
    },
    "extraCommand": {
      "description": "__MSG_newCommand__ (Ctrl+Alt+Home)"
    },
```

and call `ShortcutCustomizeUI.setDefaultShortcut()` for each command on the startup, like:

```javascript
(async () => {
  // logic to run initialization and migration only once
  const SHORTCUTS_VERSION = 2;
  const configs = await browser.storage.local.get({ shortcutsVersion: 0 });
  switch (configs.shortcutsVersion) {
    case 0: // on initial startup
      ShortcutCustomizeUI.setDefaultShortcuts();
    case 1: // on updated
      ShortcutCustomizeUI.setDefaultShortcut('newCommand');
      ShortcutCustomizeUI.setDefaultShortcut('extraCommand');
  }
  browser.storage.local.set({ shortcutsVersion: SHORTCUTS_VERSION });
})();
```

## Basic usage (configuration UI)

Load the file `ShortcutCustomizeUI.js` from any document (options page, sidebar panel, or browser action panel), like:

```json
<script type="application/javascript" src="./ShortcutCustomizeUI.js"></script>
```

And, call `ShortcutCustomizeUI.build()`. It returns a promise resolved with a DOM element:

```javascript
ShortcutCustomizeUI.build().then(list => {
  document.getElementById('shortcuts').appendChild(list);
});
```

Hitting the Escape key in the input field will clear the user defined shortcut.


## Options

The method `ShortcutCustomizeUI.build()` accepts some options to control the UI, like:

```javascript
ShortcutCustomizeUI.build({
  showDescriptions: false
}).then(...);
```

Available options:

 * `showDescriptions`: shows the description or the name of each command (default=`true`)

## Need contribution for internalitonalization

By default, shortcut keys and modifier keys are shown with [their general name listed at the API document](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/manifest.json/commands#Shortcut_values), but such raw key names may confuse people in some locales. Thus this project needs more help for internationalization/localization. Please pull requests to update [the built-in definitions for localized key names](https://github.com/piroor/webextensions-lib-shortcut-customize-ui/blob/master/ShortcutCustomizeUI.js#L269).
