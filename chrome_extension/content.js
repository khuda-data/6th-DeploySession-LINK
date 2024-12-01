chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getURL") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      sendResponse({ url: activeTab.url });
    });
    return true; // Indicates to Chrome that we will respond asynchronously.
  }
});
