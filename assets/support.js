// "Support Torrio": a floating button on every page that opens the Ko-fi panel over the page
// (Ko-fi is only loaded when it's opened, so pages stay fast). The support page has the same
// panel inline and no floating button.
(function () {
  var KOFI = "https://ko-fi.com/razorrsd/?hidefeed=true&widget=true&embed=true&preview=true";
  var css = "\
.kofi-fab{position:fixed;right:20px;bottom:20px;z-index:50;display:inline-flex;align-items:center;gap:9px;padding:11px 18px 11px 14px;border:0;border-radius:999px;cursor:pointer;color:#fff;font:700 14.5px 'Segoe UI Variable Text','Segoe UI',system-ui,sans-serif;background:linear-gradient(100deg,#ff4fd8,#8b3dff 45%,#2f5bff 78%,#19d9ff);box-shadow:0 12px 32px rgba(139,61,255,.45),inset 0 1px 0 rgba(255,255,255,.25)}\
.kofi-fab:hover{filter:brightness(1.08)}\
.kofi-fab svg{width:20px;height:20px}\
.kofi-dlg{font:15px/1.5 'Segoe UI Variable Text','Segoe UI',system-ui,sans-serif;border:0;padding:0;border-radius:18px;background:#171236;color:#f1eefc;width:min(440px,calc(100vw - 32px));max-height:calc(100vh - 40px);box-shadow:0 30px 90px rgba(0,0,0,.6)}\
.kofi-dlg::backdrop{background:rgba(6,4,20,.7);backdrop-filter:blur(4px)}\
.kofi-head{display:flex;align-items:center;gap:12px;padding:16px 18px 12px}\
.kofi-head b{font:700 17px 'Segoe UI Variable Display','Segoe UI',system-ui,sans-serif;flex:1}\
.kofi-head p{margin:2px 0 0;color:#a49fc6;font-size:13px;font-weight:400}\
.kofi-x{border:0;background:rgba(255,255,255,.08);color:#f1eefc;width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:18px;line-height:1}\
.kofi-x:hover{background:rgba(255,255,255,.16)}\
.kofi-body{padding:0 14px 14px}\
.kofi-alt{margin:0;padding:0 18px 16px;text-align:center;color:#a49fc6;font-size:13px}.kofi-alt a{color:#19d9ff}\n.kofi-body iframe{display:block;border:none;width:100%;height:min(640px,calc(100vh - 150px));border-radius:12px;background:#f9f9f9}\
@media (max-width:520px){.kofi-fab span{display:none}.kofi-fab{padding:12px}}\
@media (prefers-reduced-motion:reduce){.kofi-fab{transition:none}}";
  var cup = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 2.5c-.6.8-.6 1.7 0 2.5M12 2.5c-.6.8-.6 1.7 0 2.5"/></svg>';

  function ready(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  ready(function () {
    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);
    // the support page shows the panel itself: no floating button there
    if (document.body.getAttribute("data-page") === "support") return;

    var dlg = document.createElement("dialog");
    dlg.className = "kofi-dlg";
    dlg.setAttribute("aria-label", "Support Torrio");
    dlg.innerHTML = '<div class="kofi-head"><div style="flex:1"><b>Support Torrio</b><p>Torrio is free and ad-free. A coffee helps keep it that way.</p></div><button class="kofi-x" type="button" aria-label="Close">×</button></div><div class="kofi-body"></div><p class="kofi-alt">Panel not showing? <a href="https://ko-fi.com/razorrsd" target="_blank" rel="noopener">Open in Ko-fi</a></p>';
    document.body.appendChild(dlg);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "kofi-fab";
    btn.innerHTML = cup + "<span>Support Torrio</span>";
    btn.setAttribute("aria-label", "Support Torrio");
    document.body.appendChild(btn);

    function open() {
      var body = dlg.querySelector(".kofi-body");
      if (!body.firstChild) {
        var f = document.createElement("iframe");
        f.src = KOFI;
        f.title = "Support Torrio on Ko-fi";
        body.appendChild(f);
      }
      if (dlg.showModal) dlg.showModal(); else location.href = btn.getAttribute("data-href") || "/support/";
    }
    btn.addEventListener("click", open);
    dlg.querySelector(".kofi-x").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    // any link marked data-support opens the panel too
    document.querySelectorAll("[data-support]").forEach(function (a) {
      a.addEventListener("click", function (e) { e.preventDefault(); open(); });
    });
  });
})();
