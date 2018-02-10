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

  build: async function() {
    const isMac    = /^Mac/i.test(navigator.platform);
    const commands = await browser.commands.getAll();
    const list     = document.createElement('ul');
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
        browser.commands.update({
          name:     command.name,
          shortcut: shortcut.join('+')
        });
      };

      const reset = () => {
        browser.commands.reset(command.name);
        browser.commands.getAll().then(aCommands => {
          for (let defaultCommand of aCommands) {
            if (defaultCommand.name != command.name)
              return;
            command = defaultCommand;
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
        key = key.replace(/(Alt|Control|Ctrl|Command|Meta|Shift)\+/gi, '');
        keyField.value = key.trim();
      };

      const item = document.createElement('li');
      item.textContent = `${command.description || command.name}: `;

      const ctrlLabel  = this.buildCheckBoxWithLabel(isMac ? 'Control' : 'Ctrl');
      const metaLabel  = this.buildCheckBoxWithLabel(isMac ? '⌘' : 'Meta');
      const altLabel   = this.buildCheckBoxWithLabel('Alt');
      const shiftLabel = this.buildCheckBoxWithLabel('Shift');
      const checkboxes = isMac ? [metaLabel, ctrlLabel, altLabel, shiftLabel] : [ctrlLabel, altLabel, shiftLabel /* , metaLabel */] ;
      for (let checkbox of checkboxes) {
        item.appendChild(checkbox);
        item.appendChild(document.createTextNode('+'));
        checkbox.addEventListener('change', update);
      }

      const keyField = item.appendChild(document.createElement('input'));
      keyField.setAttribute('type', 'text');
      keyField.setAttribute('size', 8);
      keyField.addEventListener('input', update);
      if (!this.available)
        keyField.setAttribute('disabled', true);

      if (this.available) {
        const resetButton = item.appendChild(document.createElement('button'));
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

      apply();

      items.push(item);
      list.appendChild(item);
    }

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
      case 'Comma':
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
    }
    return '';
  }
};