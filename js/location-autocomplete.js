// Attaches a suggestion dropdown to a text input. Debounced fetch to
// /api/location-suggest, click or Enter/arrow-key to pick. Tracks whether
// the current input value came from an actual pick — attachLocationAutocomplete's
// caller can check that via getSelected() before running a search, so a
// half-typed address that only "almost" matches doesn't silently search on
// raw text instead of the resolved place.
export function attachLocationAutocomplete(input, { getType, onSelect } = {}) {
  const wrap = document.createElement("div");
  wrap.className = "autocomplete-wrap";
  input.parentNode.insertBefore(wrap, input);
  wrap.appendChild(input);

  const list = document.createElement("div");
  list.className = "autocomplete-list";
  wrap.appendChild(list);

  let debounceId = null;
  let activeIndex = -1;
  let currentSuggestions = [];
  let selected = null; // the picked suggestion object, or null if the user hasn't picked one yet

  function close() {
    list.innerHTML = "";
    list.style.display = "none";
    activeIndex = -1;
  }

  function render(suggestions) {
    currentSuggestions = suggestions;
    activeIndex = -1;
    if (!suggestions.length) { close(); return; }
    list.innerHTML = suggestions.map((s, i) =>
      `<div class="autocomplete-item" data-index="${i}">${s.label}</div>`
    ).join("");
    list.style.display = "block";
    list.querySelectorAll(".autocomplete-item").forEach((el, i) => {
      el.addEventListener("mousedown", (e) => { e.preventDefault(); pick(suggestions[i]); });
    });
  }

  function pick(suggestion) {
    selected = suggestion;
    input.value = suggestion.label;
    close();
    if (onSelect) onSelect(suggestion);
  }

  input.addEventListener("input", () => {
    selected = null; // typing again invalidates any earlier pick
    clearTimeout(debounceId);
    const q = input.value.trim();
    if (q.length < 2) { close(); return; }
    debounceId = setTimeout(async () => {
      try {
        const type = getType ? getType() : "sale";
        const res = await fetch(`/api/location-suggest?q=${encodeURIComponent(q)}&type=${type}`);
        if (!res.ok) throw new Error("suggest_failed");
        const data = await res.json();
        render(data.suggestions || []);
      } catch (e) {
        console.error("Location suggest failed:", e);
        close();
      }
    }, 250);
  });

  input.addEventListener("keydown", (e) => {
    if (!currentSuggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, currentSuggestions.length - 1);
      updateActive();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      updateActive();
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      pick(currentSuggestions[activeIndex]);
    } else if (e.key === "Escape") {
      close();
    }
  });

  function updateActive() {
    list.querySelectorAll(".autocomplete-item").forEach((el, i) => {
      el.classList.toggle("active", i === activeIndex);
    });
  }

  input.addEventListener("blur", () => setTimeout(close, 150));

  return {
    getSelected: () => selected,
    clear: () => { selected = null; input.value = ""; close(); }
  };
}
