import { threadIdFor, subscribeToThread, sendMessage, loadLocalThread, currentSenderInfo } from "./messaging.js";

function formatTime(ts) {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function bubbleHTML(m) {
  const mine = m.senderType !== "admin";
  return `
    <div class="chat-bubble ${mine ? "mine" : "theirs"}">
      ${!mine ? `<span class="chat-sender">Asante & Grove</span>` : ""}
      <p>${m.text}</p>
      <span class="chat-time">${formatTime(m.createdAt)}</span>
    </div>`;
}

export function injectChatWidget() {
  if (document.getElementById("chat-widget-root")) return; // don't double-inject

  const root = document.createElement("div");
  root.id = "chat-widget-root";
  root.innerHTML = `
    <button id="chat-toggle" aria-label="Open chat">💬</button>
    <div id="chat-panel" class="chat-panel" style="display:none;">
      <div class="chat-panel-header">
        <span>Chat with us</span>
        <button id="chat-close" aria-label="Close chat">✕</button>
      </div>
      <div id="chat-messages" class="chat-messages"></div>
      <form id="chat-form" class="chat-form">
        <input id="chat-input" type="text" placeholder="Type a message…" autocomplete="off">
        <button type="submit">Send</button>
      </form>
    </div>`;
  document.body.appendChild(root);

  const toggle = document.getElementById("chat-toggle");
  const panel = document.getElementById("chat-panel");
  const messagesEl = document.getElementById("chat-messages");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");

  const threadId = threadIdFor("general");
  let unsubscribe = null;

  function render(messages) {
    messagesEl.innerHTML = messages.length
      ? messages.map(bubbleHTML).join("")
      : `<p class="chat-empty">Ask us anything — an admin will reply here. ${currentSenderInfo().senderType === "guest" ? "You don't need an account; this conversation is saved to this device." : ""}</p>`;
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // Show the local mirror instantly, then let the live subscription take over.
  render(loadLocalThread(threadId));

  toggle.addEventListener("click", () => {
    const opening = panel.style.display === "none";
    panel.style.display = opening ? "flex" : "none";
    if (opening && !unsubscribe) {
      unsubscribe = subscribeToThread(threadId, render);
    }
  });
  document.getElementById("chat-close").addEventListener("click", () => { panel.style.display = "none"; });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    try {
      await sendMessage({ kind: "general", text });
    } catch (err) {
      console.error("Send failed:", err);
    }
  });
}
