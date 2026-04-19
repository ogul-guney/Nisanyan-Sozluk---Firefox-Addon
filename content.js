browser.runtime.onMessage.addListener((request) => {
  if (request.action === "open_popup") {
    showNisanyanPopup(request.word);
  }
});

function showNisanyanPopup(word) {
  const existing = document.getElementById("nisanyan-popup-container");
  if (existing) existing.remove();

  const query = encodeURIComponent(word);
  const url = `https://www.nisanyansozluk.com/kelime/${query}`;

  const sizes = {
    small: { w: "300px", h: "400px" },
    medium: { w: "450px", h: "600px" }
  };

  const container = document.createElement("div");
  container.id = "nisanyan-popup-container";
  container.style = `
    position: fixed; top: 40px; right: 25px; 
    width: ${sizes.small.w}; height: ${sizes.small.h};
    z-index: 2147483647; background: #ffffff; border-radius: 10px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.2); border: 1px solid #d0d0d0;
    display: flex; flex-direction: column; overflow: hidden;
    transition: width 0.2s, height 0.2s;
  `;

  const header = document.createElement("div");
  header.style = "padding: 6px 10px; background: #ececec; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ccc; cursor: move; user-select: none;";
  
  const sizeControls = document.createElement("div");
  sizeControls.style = "display: flex; gap: 6px;";

  const createSizeBtn = (label, size) => {
    const btn = document.createElement("button");
    btn.textContent = label; // innerHTML yerine textContent
    btn.style = "border: 1px solid #bbb; background: #fff; cursor: pointer; padding: 1px 5px; border-radius: 3px; font-size: 10px; color: #333;";
    btn.onclick = (e) => {
      e.stopPropagation();
      container.style.width = size.w;
      container.style.height = size.h;
    };
    return btn;
  };

  sizeControls.appendChild(createSizeBtn("S", sizes.small));
  sizeControls.appendChild(createSizeBtn("M", sizes.medium));
  header.appendChild(sizeControls);
  
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "✕"; // Güvenli karakter kullanımı
  closeBtn.style = "border: none; background: transparent; cursor: pointer; font-size: 16px; color: #666; line-height: 1;";
  closeBtn.onclick = (e) => {
    e.stopPropagation();
    container.remove();
  };
  header.appendChild(closeBtn);

  container.appendChild(header);

  const iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.style = "flex-grow: 1; border: none; width: 100%; pointer-events: auto;";
  container.appendChild(iframe);

  document.body.appendChild(container);

  // Sürükleme Mantığı
  let isDragging = false;
  let offsetX, offsetY;

  header.onmousedown = (e) => {
    isDragging = true;
    offsetX = e.clientX - container.getBoundingClientRect().left;
    offsetY = e.clientY - container.getBoundingClientRect().top;
    container.style.transition = "none";
    iframe.style.pointerEvents = "none";
  };

  document.onmousemove = (e) => {
    if (!isDragging) return;
    container.style.left = (e.clientX - offsetX) + "px";
    container.style.top = (e.clientY - offsetY) + "px";
    container.style.right = "auto";
  };

  document.onmouseup = () => {
    isDragging = false;
    iframe.style.pointerEvents = "auto";
    container.style.transition = "width 0.2s, height 0.2s";
  };
}