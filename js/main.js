// Language handling for the bilingual single page.
// Priority: ?lang= in the URL > saved choice > browser language > French.
(function () {
  var SUPPORTED = ["fr", "en"];
  var TITLES = {
    fr: "Guillaume Lamontagne Morin — Programmeur de jeux vidéo",
    en: "Guillaume Lamontagne Morin — Game Programmer"
  };

  function saved() {
    try { return localStorage.getItem("lang"); } catch (e) { return null; }
  }
  function save(lang) {
    try { localStorage.setItem("lang", lang); } catch (e) { /* storage unavailable */ }
  }

  function initialLang() {
    var fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (SUPPORTED.indexOf(fromUrl) !== -1) return fromUrl;
    var stored = saved();
    if (SUPPORTED.indexOf(stored) !== -1) return stored;
    var nav = (navigator.language || "fr").slice(0, 2).toLowerCase();
    return nav === "en" ? "en" : "fr";
  }

  function apply(lang) {
    document.documentElement.lang = lang;
    document.title = TITLES[lang];
    var toggle = document.getElementById("lang-toggle");
    if (toggle) {
      toggle.innerHTML = lang === "fr" ? "<b>FR</b> / EN" : "FR / <b>EN</b>";
      toggle.setAttribute("aria-label", lang === "fr" ? "Switch to English" : "Passer au français");
    }
  }

  var lang = initialLang();
  apply(lang);

  document.addEventListener("DOMContentLoaded", function () {
    apply(lang);
    var toggle = document.getElementById("lang-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", function () {
      lang = lang === "fr" ? "en" : "fr";
      apply(lang);
      save(lang);
      var url = new URL(window.location.href);
      url.searchParams.set("lang", lang);
      history.replaceState(null, "", url);
    });
  });
})();
