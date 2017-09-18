(function()
{
  'use strict';

  class Popup {
    constructor() {
      this.Storage = chrome.storage.sync;
      this.data = {};
      this.defaults = {
        columnWidth: 200,
        enabled: true,
        updatedEvent: 'better-jira:updated',
      };

      this.setDefaults();
      this.handleFormSubmissions();
    }

    setDefaults() {
      this.Storage.get('columnWidth', (storage) => {
        console.log('storage', storage);
        let value = storage.columnWidth;
        console.log('columnWidth from Storage', value);
        if(!value) {
          value = this.defaults.columnWidth;
          this.Storage.set({columnWidth: value});
        }
        this.data.columnWidth = value;

        document.getElementById('columnWidth').value = this.data.columnWidth;
      });

      this.Storage.get('enabled', (storage) => {
        let value = storage.enabled;
        if(value === undefined) {
          value = this.defaults.enabled;
          this.Storage.set({enabled: value});
        }

        this.data.enabled = value;
        console.log('enabled storage', storage);

        document.getElementById('enabled').checked = !! value;
      });
    }

    handleFormSubmissions() {
      document.getElementById('better-jira').addEventListener('submit', (event) => {
        event.preventDefault();
        console.log('form submission information', arguments);
        this.data.columnWidth = document.getElementById('columnWidth').value;
        this.data.enabled = document.getElementById('enabled').checked;
        this.save();
      });
    }

    save() {
      this.Storage.set({enabled: this.data.enabled}, () => {
        this.Storage.set({columnWidth: this.data.columnWidth}, this.refresh.bind(this));
      });
    }

    refresh() {
      let code = [
        `(function()`,
        `{`,
          `'use strict';`,

          `let updateEvent = new CustomEvent('${this.defaults.updatedEvent}', {`,
            `detail: {`,
              `columnWidth: ${this.data.columnWidth},`,
              `enabled: ${this.data.enabled}`,
            `}`,
          `});`,
          `document.dispatchEvent(updateEvent);`,
        `})();`,
      ];
      chrome.tabs.executeScript({
        code: code.join('')
      });
    }
  }

  window.addEventListener('load', function initiate() {
    window.removeEventListener('load', initiate);

    new Popup();

    console.log('You are here!');
  })
})();
