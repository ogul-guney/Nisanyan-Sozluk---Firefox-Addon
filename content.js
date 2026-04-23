browser.runtime.onMessage.addListener((request) => {
  if (request.action === "open_popup") {
    showNisanyanPopup(request.word);
  }
});

async function showNisanyanPopup(word) {
  const existing = document.getElementById("nisanyan-popup-container");
  if (existing) existing.remove();

  // --- Z-INDEX ZORLAMASI (Z-Index Auto-Fix) ---
  const getMaxZIndex = () => {
    return Array.from(document.querySelectorAll('*'))
      .map(el => parseFloat(window.getComputedStyle(el).zIndex))
      .filter(zIndex => !isNaN(zIndex))
      .reduce((max, current) => Math.max(max, current), 2147483647); // Varsayılan en yüksek değer, ama garantiliyoruz
  };
  const safeZIndex = getMaxZIndex();

  const savedStatus = await browser.storage.local.get(["popupPos"]);
  const pos = savedStatus.popupPos || { top: "40px", right: "25px", left: "auto" };

  const query = encodeURIComponent(word);
  const url = `https://www.nisanyansozluk.com/kelime/${query}`;

  const sizes = {
    small: { w: "320px", h: "450px" },
    medium: { w: "480px", h: "650px" }
  };

  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = {
    bg: isDarkMode ? "rgba(26, 26, 26, 0.8)" : "rgba(255, 255, 255, 0.8)",
    toolbar: isDarkMode ? "rgba(45, 45, 45, 0.4)" : "rgba(245, 245, 245, 0.4)",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    text: isDarkMode ? "#ccc" : "#444",
    btnHover: isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.08)",
    progress: "#007AFF"
  };

  const container = document.createElement("div");
  container.id = "nisanyan-popup-container";
  container.style = `
    position: fixed; top: ${pos.top}; left: ${pos.left}; right: ${pos.right};
    width: ${sizes.small.w}; height: ${sizes.small.h};
    z-index: ${safeZIndex}; background: ${theme.bg}; border-radius: 12px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.3); border: 1px solid ${theme.border};
    display: flex; flex-direction: column; overflow: hidden;
    transition: width 0.3s ease, height 0.3s ease;
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;

  const header = document.createElement("div");
  header.style = `
    padding: 8px 12px; background: ${theme.toolbar};
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid ${theme.border}; cursor: grab; user-select: none;
    backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
    z-index: ${safeZIndex + 1};
  `;

  const progressBar = document.createElement("div");
  progressBar.style = `
    position: absolute; top: 39px; left: 0; width: 0%; height: 2px;
    background: ${theme.progress}; transition: width 0.4s ease; z-index: ${safeZIndex + 2};
  `;

  const closePopup = () => {
    container.remove();
    document.removeEventListener("keydown", keyHandler);
  };

  const sizeControls = document.createElement("div");
  sizeControls.style = "display: flex; gap: 6px; align-items: center;";

  const createSizeBtn = (label, size) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.style = `border: 1px solid ${theme.border}; background: transparent; cursor: pointer; width: 26px; height: 26px; border-radius: 4px; font-size: 11px; font-weight: 600; color: ${theme.text}; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center;`;
    btn.onmouseover = () => { btn.style.background = theme.btnHover; btn.style.color = "#fff"; };
    btn.onmouseout = () => { btn.style.background = "transparent"; btn.style.color = theme.text; };
    btn.onclick = (e) => {
      if(e) e.stopPropagation();
      updateAnchorPoint();
      container.style.width = size.w;
      container.style.height = size.h;
    };
    return btn;
  };

  const btnS = createSizeBtn("S", sizes.small);
  const btnM = createSizeBtn("M", sizes.medium);
  sizeControls.appendChild(btnS);
  sizeControls.appendChild(btnM);
  header.appendChild(sizeControls);

  const actionControls = document.createElement("div");
  actionControls.style = "display: flex; gap: 12px; align-items: center;";

  const externalBtn = document.createElement("button");
  externalBtn.style = `border: 1px solid ${theme.border}; background: transparent; cursor: pointer; width: 26px; height: 26px; border-radius: 4px; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; padding: 0;`;
  externalBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${theme.text}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition: all 0.2s ease;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;
  externalBtn.onmouseover = () => {
    externalBtn.style.background = theme.btnHover;
    const svg = externalBtn.querySelector('svg');
    svg.style.stroke = "#fff";
    svg.style.filter = "brightness(1.5)";
  };
  externalBtn.onmouseout = () => {
    externalBtn.style.background = "transparent";
    const svg = externalBtn.querySelector('svg');
    svg.style.stroke = theme.text;
    svg.style.filter = "brightness(1)";
  };
  externalBtn.onclick = () => window.open(url, '_blank');
  actionControls.appendChild(externalBtn);
  
  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "&#x2715;"; 
  closeBtn.style = `border: none; background: transparent; cursor: pointer; font-size: 14px; color: ${theme.text}; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;`;
  closeBtn.onmouseover = () => { closeBtn.style.color = "#fff"; closeBtn.style.filter = "brightness(1.5) drop-shadow(0 0 2px rgba(255,255,255,0.3))"; };
  closeBtn.onmouseout = () => { closeBtn.style.color = theme.text; closeBtn.style.filter = "brightness(1)"; };
  closeBtn.onclick = (e) => { if(e) e.stopPropagation(); closePopup(); };
  actionControls.appendChild(closeBtn);

  header.appendChild(actionControls);
  container.appendChild(header);
  container.appendChild(progressBar);

  const iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.style = "flex-grow: 1; border: none; width: 100%; background: transparent; opacity: 0; transition: opacity 0.3s ease;";
  
  setTimeout(() => { if(progressBar) progressBar.style.width = "70%"; }, 50);
  iframe.onload = () => {
    progressBar.style.width = "100%";
    setTimeout(() => { progressBar.style.opacity = "0"; iframe.style.opacity = "1"; }, 200);
  };

  container.appendChild(iframe);
  document.body.appendChild(container);

  const keyHandler = (e) => {
    const key = e.key.toLowerCase();
    if (!document.getElementById("nisanyan-popup-container")) {
      document.removeEventListener("keydown", keyHandler);
      return;
    }
    if (key === "escape") { e.preventDefault(); closePopup(); }
    else if (key === "s") { btnS.click(); }
    else if (key === "m") { btnM.click(); }
    else if (key === "enter") { externalBtn.click(); }
  };
  document.addEventListener("keydown", keyHandler);

  const updateAnchorPoint = () => {
    const rect = container.getBoundingClientRect();
    if (rect.left + rect.width / 2 > window.innerWidth / 2) {
      container.style.left = "auto";
      container.style.right = (window.innerWidth - rect.right) + "px";
    } else {
      container.style.right = "auto";
      container.style.left = rect.left + "px";
    }
  };

  let isDragging = false;
  let offsetX, offsetY;
  header.onmousedown = (e) => {
    isDragging = true;
    const rect = container.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    container.style.transition = "none";
    iframe.style.pointerEvents = "none";
  };
  document.onmousemove = (e) => {
    if (!isDragging) return;
    container.style.top = (e.clientY - offsetY) + "px";
    container.style.left = (e.clientX - offsetX) + "px";
    container.style.right = "auto";
  };
  document.onmouseup = async () => {
    if (isDragging) {
      isDragging = false;
      iframe.style.pointerEvents = "auto";
      container.style.transition = "width 0.3s, height 0.3s";
      await browser.storage.local.set({
        popupPos: { top: container.style.top, left: container.style.left, right: "auto" }
      });
    }
  };
}