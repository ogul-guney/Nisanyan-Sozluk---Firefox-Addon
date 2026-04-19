// Nişanyan Sözlük stiline uygun küçük bir kitap ikonu (Base64)
const nisanyanIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAABXUlEQVQ4y82TsS8EURTGv/fN7Eaym0VCIpGoVCp0SreLRicS0SgcSjWdf4Beo9GIdEp9pZNoRCIh2Y3Zidm9Z96YvY29mU38SjO/e7/vne+ee+8I/pjEP7mE9S7AtIAsXmYNoIuUEnSAtAB7Z6iqEKh96SNoAnYEmAFpA60is7v9LpAtYAtYAnYAs6Atf9YF0p096SNoA0uAnVvSAmZAnvS7QL6AnSNoA6uAmXvSAmZAnfS7QMaAnSNoAnOAnXvSAmZAnPS7QMaAnSPoAmOAnXvSAmZAnPS7QI6AnSPoAmuAnXvSAmZAnPS7QI6AnSPoA+uAnXvSAmZAnPS7QI6AnSPoA6uAnXvSAmZAnPS7QI6AnSPoA6uAnXvSAmZAnPS7QI6AnSPoA6uAnXvSAmZAnPS7QI6AnSPoA6uAnXvSAmZAnPS7QI6AnSPoA+uAnXvSAmZAnPS7QI6AnSPoA+uAnXvSAmZAnPS7QI6AnSPoAnOAnXvSAmZAnPTv/ADm3Wf9S6Dk9AAAAABJRU5ErkJggg==";

browser.contextMenus.create({
  id: "search-nisanyan-popup",
  title: "Nişanyan'da ara: '%s'",
  contexts: ["selection"],
  icons: {
    "16": nisanyanIcon
  }
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "search-nisanyan-popup") {
    browser.tabs.sendMessage(tab.id, {
      action: "open_popup",
      word: info.selectionText.trim()
    });
  }
});