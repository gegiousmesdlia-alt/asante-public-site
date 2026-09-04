// Shared UI behavior across every page.
import { fetchSiteInfo, applyBrandInfo } from "./site-info.js";
import { injectChatWidget } from "./chat-widget.js";

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => links.classList.toggle("open"));
    links.querySelectorAll("a").forEach(a =>
      a.addEventListener("click", () => links.classList.remove("open"))
    );
  }

  // mark active nav link
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a[href]").forEach(a => {
    if (a.getAttribute("href") === path) a.classList.add("active");
  });

  document.querySelectorAll("[data-year]").forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // Applies the admin-editable business name/tagline to the header on
  // every page automatically — no per-page wiring needed.
  fetchSiteInfo().then(applyBrandInfo);

  // Floating "chat with us" widget on every public page. The admin panel
  // (a separate app) is not part of this — it gets its own Messages tab.
  injectChatWidget();
});

export function showToast(message, ms = 3200) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  requestAnimationFrame(() => el.classList.add("show"));
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove("show"), ms);
}

export function formatUSD(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function plotCode(id) {
  return "PLT-" + String(id).slice(-4).toUpperCase().padStart(4, "0");
}
