browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: "search-nisanyan-popup",
    title: "Nişanyan'da ara: '%s'",
    contexts: ["selection"]
  });
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "search-nisanyan-popup") {
    browser.tabs.sendMessage(tab.id, {
      action: "open_popup",
      word: info.selectionText.trim()
    });
  }
});
