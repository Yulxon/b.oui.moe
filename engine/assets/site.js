const root = document.documentElement;
const buttons = [...document.querySelectorAll("[data-theme-value]")];
const allowed = new Set(["blue", "pink", "white"]);
function applyTheme(theme) {
  const value = allowed.has(theme) ? theme : "white";
  root.dataset.theme = value;
  localStorage.setItem("site-theme", value);
  for (const button of buttons) button.setAttribute("aria-pressed", String(button.dataset.themeValue === value));
}
applyTheme(localStorage.getItem("site-theme") || root.dataset.theme || "white");
for (const button of buttons) button.addEventListener("click", () => applyTheme(button.dataset.themeValue));
