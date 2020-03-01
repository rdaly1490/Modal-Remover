chrome.browserAction.onClicked.addListener(tab => {
  chrome.tabs.executeScript(tab.ib, {
    file: "remove-modal.js"
  });
});
