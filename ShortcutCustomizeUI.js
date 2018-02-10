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
        if (!keyField.value.trim())
          return;
        let shortcut = [];
        if (altLabel.checkbox.checked)
          shortcut.push('Alt');
        if (ctrlLabel.checkbox.checked)
          shortcut.push('Ctrl');
        if (metaLabel.checkbox.checked)
          shortcut.push('Meta');
        if (shiftLabel.checkbox.checked)
          shortcut.push('Shift');
        shortcut.push(keyField.value);
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
        let key = command.shortcut;
        altLabel.checkbox.checked   = /Alt/i.test(key);
        ctrlLabel.checkbox.checked  = /Control|Ctrl/i.test(key);
        metaLabel.checkbox.checked  = /Command|Meta/i.test(key);
        shiftLabel.checkbox.checked = /Shift/i.test(key);
        key = key.replace(/(Alt|Control|Ctrl|Command|Meta|Shift)\+/gi, '');
        keyField.value = key.trim();
      };

      const item = document.createElement('li');
      item.textContent = `${command.description || command.name}: `;

      const ctrlLabel  = this.buildCheckBoxWithLabel(isMac ? 'Control' : 'Ctrl', 'Ctrl');
      const metaLabel  = this.buildCheckBoxWithLabel(isMac ? '⌘' : 'Meta', 'Meta');
      const altLabel   = this.buildCheckBoxWithLabel('Alt');
      const shiftLabel = this.buildCheckBoxWithLabel('Shift');
      const checkboxes = isMac ? [metaLabel, ctrlLabel, altLabel, shiftLabel] : [ctrlLabel, altLabel, shiftLabel, metaLabel] ;
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

  buildCheckBoxWithLabel(aLabel, aKey) {
    const label = document.createElement('label');
    label.textContent = aLabel;
    label.checkbox = label.insertBefore(document.createElement('input'), label.firstChild);
    label.checkbox.setAttribute('type', 'checkbox');
    if (!this.available)
      label.checkbox.setAttribute('disabled', true);
    return label;
  }
};