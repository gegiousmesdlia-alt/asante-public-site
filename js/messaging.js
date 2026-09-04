import { db, auth } from "./firebase-config.js";
import {
  collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getGuestId } from "./guest-id.js";

// Two kinds of thread:
//  - "general"  → threadId "general-<id>"           (visitor <-> admin)
//  - "listing"  → threadId "listing-<listingId>-<id>" (buyer <-> agent, about one property)
// <id> is the signed-in user's uid, or a persistent guest ID if not signed in.
export function currentSenderInfo() {
  const user = auth.currentUser;
  if (user) {
    return { senderType: "user", senderId: user.uid, senderName: user.displayName || "Registered user", senderEmail: user.email || null };
  }
  const guestId = getGuestId();
  return { senderType: "guest", senderId: guestId, senderName: "Guest", senderEmail: null };
}

export function threadIdFor(kind, listingId) {
  const { senderId } = currentSenderInfo();
  return kind === "listing" ? `listing-${listingId}-${senderId}` : `general-${senderId}`;
}

// Local mirror — every time a thread's messages update from Firestore (or
// a message is sent), the full transcript is also written to localStorage
// under its threadId. On load, the local copy renders instantly while the
// live Firestore listener catches up, and if Firestore is briefly
// unreachable the visitor still sees their full history, not a blank
// screen. This is read-instant, not an offline send-queue — sending still
// requires a live connection.
function localKey(threadId) {
  return `asante_msgs_${threadId}`;
}

export function loadLocalThread(threadId) {
  try {
    const raw = localStorage.getItem(localKey(threadId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalThread(threadId, messages) {
  try {
    localStorage.setItem(localKey(threadId), JSON.stringify(messages));
  } catch (err) {
    // localStorage can throw if full/disabled — the Firestore copy is
    // still the source of truth, so this is a soft failure.
    console.error("Local message mirror failed:", err);
  }
}

export async function sendMessage({ kind, listingId = null, listingLabel = null, text }) {
  const sender = currentSenderInfo();
  const threadId = threadIdFor(kind, listingId);
  await addDoc(collection(db, "messages"), {
    threadId,
    kind,
    listingId,
    listingLabel,
    ...sender,
    text,
    createdAt: serverTimestamp(),
    read: false
  });
  return threadId;
}

// Subscribes to one thread in real time. Calls onUpdate(messages) on every
// change, and mirrors the full transcript to localStorage each time.
// Returns an unsubscribe function.
export function subscribeToThread(threadId, onUpdate) {
  const q = query(collection(db, "messages"), where("threadId", "==", threadId), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    saveLocalThread(threadId, messages);
    onUpdate(messages);
  }, (err) => {
    console.error("Thread subscription failed, showing local copy:", err);
    onUpdate(loadLocalThread(threadId));
  });
}
