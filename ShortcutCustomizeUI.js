/*
 license: The MIT License, Copyright (c) 2018 YUKI "Piro" Hiroshi
 original:
   http://github.com/piroor/webextensions-lib-shortcut-customize-ui
*/

var ShortcutCustomizeUI = {
  available: (
    typeof browser.commands.update == 'function' &&
    typeof browser.commands.reset == 'function'
  ),
  uniqueKey: parseInt(Math.random() * Math.pow(2, 16)),
  get commonClass() {
    delete this.commonClass;
    return this.commonClass = `shortcut-customize-ui-${this.uniqueKey}`;
  },

  build: async function() {
    const isMac    = /^Mac/i.test(navigator.platform);
    const commands = await browser.commands.getAll();
    const list     = document.createElement('ul');
    list.classList.add(this.commonClass);
    list.classList.add('shortcuts');
    const items    = [];
    for (let command of commands) {
      const update = () => {
        const key = this.normalizeKey(keyField.value);
        if (!key)
          return;
        let shortcut = [];
        if (altLabel.checkbox.checked)
          shortcut.push('Alt');
        if (ctrlLabel.checkbox.checked)
          shortcut.push(isMac ? 'MacCtrl' : 'Ctrl');
        if (metaLabel.checkbox.checked)
          shortcut.push('Command');
        if (shiftLabel.checkbox.checked)
          shortcut.push('Shift');
        shortcut.push(key);
        try {
          browser.commands.update({
            name:     command.name,
            shortcut: shortcut.join('+')
          });
          item.classList.remove('error');
        }
        catch(aError) {
          item.classList.add('error');
        }
      };

      const reset = () => {
        browser.commands.reset(command.name);
        browser.commands.getAll().then(aCommands => {
          for (let defaultCommand of aCommands) {
            if (defaultCommand.name != command.name)
              continue;
            command = defaultCommand;
            item.classList.remove('error');
            apply();
            break;
          }
        });
      };

      const apply = () => {
        let key = command.shortcut || '';
        altLabel.checkbox.checked   = /Alt/i.test(key);
        ctrlLabel.checkbox.checked  = /Ctrl|MacCtrl/i.test(key);
        metaLabel.checkbox.checked  = /Command/i.test(key) || (isMac && /Ctrl/i.test(key));
        shiftLabel.checkbox.checked = /Shift/i.test(key);
        key = key.replace(/(Alt|Control|Ctrl|Command|Meta|Shift)\+/gi, '').trim();
        keyField.value = this.getLocalizedKey(key) || key;
      };

      const item = document.createElement('li');
      item.classList.add(this.commonClass);
      item.classList.add('shortcut');

      const name = `${command.description || command.name}: `
        .replace(/__MSG_(.+?)__/g, aMatched => browser.i18n.getMessage(aMatched.slice(6, -2)));
      const nameLabel = item.appendChild(document.createElement('label'));
      nameLabel.classList.add(this.commonClass);
      nameLabel.textContent = name;

      const keyCombination = item.appendChild(document.createElement('span'));
      keyCombination.classList.add(this.commonClass);
      keyCombination.classList.add('key-combination');

      const ctrlLabel  = this.buildCheckBoxWithLabel(this.getLocalizedKey(isMac ? 'MacCtrl' : 'Ctrl') || isMac ? 'Control' : 'Ctrl');
      const metaLabel  = this.buildCheckBoxWithLabel(this.getLocalizedKey('Command') || isMac ? '⌘' : 'Meta');
      const altLabel   = this.buildCheckBoxWithLabel(this.getLocalizedKey('Alt') || 'Alt');
      const shiftLabel = this.buildCheckBoxWithLabel(this.getLocalizedKey('Shift') || 'Shift');
      const checkboxes = isMac ? [metaLabel, ctrlLabel, altLabel, shiftLabel] : [ctrlLabel, altLabel, shiftLabel /* , metaLabel */] ;
      for (let checkbox of checkboxes) {
        keyCombination.appendChild(checkbox);
        keyCombination.appendChild(document.createTextNode('+'));
        checkbox.addEventListener('change', update);
      }

      const keyField = keyCombination.appendChild(document.createElement('input'));
      keyField.setAttribute('type', 'text');
      keyField.setAttribute('size', 8);
      keyField.addEventListener('input', update);
      if (!this.available)
        keyField.setAttribute('disabled', true);

      if (this.available) {
        const resetButton = keyCombination.appendChild(document.createElement('button'));
        resetButton.style.minWidth = 0;
        resetButton.textContent = '🔄';
        resetButton.setAttribute('title', 'Reset');
        resetButton.addEventListener('keypress', aEvent => {
          switch (aEvent.keyCode) {
            case aEvent.DOM_VK_ENTER:
            case aEvent.DOM_VK_RETURN:
            case aEvent.DOM_VK_SPACE:
              reset();
              break;
          }
        });
        resetButton.addEventListener('click', aEvent => {
          switch (aEvent.button) {
            case 0:
              reset();
              break;
          }
        });
      }

      item.appendChild(keyCombination);

      apply();

      items.push(item);
      list.appendChild(item);
    }

    this.installStyleSheet();

    return list;
  },

  buildCheckBoxWithLabel(aLabel) {
    const label = document.createElement('label');
    label.textContent = aLabel;
    label.checkbox = label.insertBefore(document.createElement('input'), label.firstChild);
    label.checkbox.setAttribute('type', 'checkbox');
    if (!this.available)
      label.checkbox.setAttribute('disabled', true);
    return label;
  },

  normalizeKey(aKey) {
    aKey = aKey.trim().replace(/\s+/g, '').toLowerCase();
    if (/^[a-z0-9]$/i.test(aKey) ||
        /^F([1-9]|1[0-2])$/i.test(aKey))
      return aKey.toUpperCase();

    switch (aKey) {
      case ',':
      case 'comma':
        return 'Comma';
      case '.':
      case 'period':
        return 'Period';
      case 'home':
        return 'Home';
      case 'end':
        return 'End';
      case 'pageup':
        return 'PageUp';
      case 'pagedown':
        return 'PageDown';
      case ' ':
      case 'space':
        return 'Space';
      case 'del':
      case 'delete':
        return 'Delete';
      case '↑':
      case 'up':
        return 'Up';
      case '↓':
      case 'down':
        return 'Down';
      case '←':
      case '<-':
      case '<=':
      case 'left':
        return 'Left';
      case '→':
      case '->':
      case '=>':
      case 'right':
        return 'right';
      case 'next':
      case 'medianexttrack':
        return 'MediaNextTrack';
      case 'play':
      case 'pause':
      case 'mediaplaypause':
        return 'MediaPlayPause';
      case 'prev':
      case 'previous':
      case 'mediaprevtrack':
        return 'MediaPrevTrack';
      case 'stop':
      case 'mediastop':
        return 'MediaStop';

      default:
        for (let key of Object.keys(this.keyNameMap)) {
          if (!(key in this.keyNameMap))
            return;
          if (Array.isArray(this.keyNameMap[key])) {
            if (this.keyNameMap[key].indexOf(aKey) > -1)
              return key;
          }
          else {
            if (this.keyNameMap[key] == aKey)
              return key;
          }
        }
        break;
    }
    return '';
  },
  getLocalizedKey(aKey) {
    if (aKey in this.keyNameMap)
      return Array.isArray(this.keyNameMap[aKey]) ? this.keyNameMap[aKey][0] : this.keyNameMap[aKey];
    return '';
  },

  installStyleSheet() {
    if (this.style)
      return;
    this.style = document.createElement('style');
    this.style.setAttribute('type', 'text/css');
    this.style.textContent = `
      li.shortcut.${this.commonClass} {
        border-top: 1px solid ThreeDShadow;
        display: grid;
        grid-template-columns: 1fr max-content;
        margin: 0 0 0.25em;
        padding: 0.25em 0 0;
      }
      li.shortcut.${this.commonClass}:first-child {
        border-top: none;
        margin-top: 0;
        padding-top: 0;
      }
      li.error.${this.commonClass} .key-combination::before {
        background: #ff6060;
        border: solid thin white;
        border-radius: 100%;
        box-shadow: 0.1em 0.1em 0.2em rgba(0, 0, 0, 0.35);
        content: "!";
        color: white;
        display: inline-block;
        font-weight: bold;
        min-width: 1em;
        text-align: center;
      }
    `;
    document.head.appendChild(this.style);
  },

  keyNameMapLocales: {
    // define tables with https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/i18n/LanguageCode
    ja: {
      // key: valid key name listed at https://developer.mozilla.org/en-US/Add-ons/WebExtensions/manifest.json/commands#Shortcut_values
      // value: array of localized key names
      Up:    ['上'],
      Down:  ['下'],
      Left:  ['左'],
      Right: ['右'],
      // you can localize modifier keys also.
      // Alt:     ['オルト'],
      // Ctrl:    ['コントロール'],
      // MacCtrl: ['コントロール'], // for macOS
      // Command: ['コマンド`], // for macOS
      // Shift:   ['シフト`],
    },
    // de: {...},
    // fr: {...},
  },
  get keyNameMap() {
    delete this.keyNameMap;
    return this.keyNameMap = (
      this.keyNameMapLocales[browser.i18n.getUILanguage()] ||
      this.keyNameMapLocales[browser.i18n.getUILanguage().replace(/[-_].+$/, '')] ||
      {}
    );
  }
};
