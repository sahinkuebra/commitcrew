// journal.js – FR13: Journal Page Display, FR14: Personal Notes
// Hinweis: escapeHTML() steht global aus header.js bereit

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w342";
const NO_IMAGE_URL = "https://placehold.co/342x513/334155/ffffff?text=No+Image";

const favContainer = document.getElementById("favorites-container");

// --------------------------------
// LocalStorage Helpers
// --------------------------------

function getFavourites() {
  return JSON.parse(localStorage.getItem("favourites")) || [];
}

function saveFavourites(favourites) {
  localStorage.setItem("favourites", JSON.stringify(favourites));
}

// --------------------------------
// FR13: Filmkarten rendern
// --------------------------------

function renderFavourites() {
  const favourites = getFavourites();

  if (favourites.length === 0) {
    favContainer.innerHTML = `
      <p class="text-gray-400 col-span-full text-center py-16 text-lg">
        No favourite movies yet. Visit the
        <a href="index.html" class="text-yellow-400 hover:underline">
          Homepage
        </a>
        to add some!
      </p>
    `;
    return;
  }

  favContainer.innerHTML = favourites.map(createCard).join("");
}

function createCard(movie) {
  const poster = movie.poster_path
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : NO_IMAGE_URL;

  const rating = movie.vote_average
    ? Number(movie.vote_average).toFixed(1)
    : "–";

  const overview = escapeHTML(
    movie.overview || "No description available.",
  ).slice(0, 150);

  const hasNote = !!(movie.note && movie.note.trim());

  return `
    <article
      class="bg-slate-800 text-white rounded-2xl overflow-hidden
             shadow-lg flex flex-col"
      data-movie-id="${movie.id}"
    >
      <img
        src="${poster}"
        alt="${escapeHTML(movie.title)}"
        class="w-full h-96 object-cover"
      >

      <div class="p-4 flex flex-col gap-2 flex-1">

        <h3 class="font-bold text-yellow-400 text-lg">
          ${escapeHTML(movie.title)}
        </h3>

        <div class="flex items-center gap-2 flex-wrap">
          <p class="text-sm text-gray-400">
            ${escapeHTML(movie.release_date || "Unknown")}
          </p>
          <span class="bg-yellow-400 text-slate-900 font-bold
                       text-xs px-2 py-0.5 rounded-full">
            ⭐ ${rating}
          </span>
        </div>

        <p class="text-sm text-gray-300">${overview}</p>

        <!-- FR14: Gespeicherte Notiz anzeigen -->
        <div class="note-display${hasNote ? "" : " hidden"}
                    bg-slate-700 rounded-xl px-4 py-3 text-sm">
          <p class="text-yellow-400 font-semibold mb-1">My Note:</p>
          <p class="text-gray-300 note-text">
            ${escapeHTML(movie.note || "")}
          </p>
        </div>

        <!-- FR14: Notiz-Editor (zunächst versteckt) -->
        <div class="note-editor hidden flex-col gap-3">
          <textarea
            class="note-textarea bg-slate-700 text-white
                   placeholder-gray-400 rounded-2xl px-4 py-3
                   w-full resize-y min-h-[80px] outline-none
                   focus:ring-2 focus:ring-yellow-400"
            placeholder="Enter your notice"
          >${hasNote ? escapeHTML(movie.note) : ""}</textarea>
          <div class="flex justify-between">
            <button
              class="cancel-note-btn bg-red-500 hover:bg-red-600
                     text-white font-bold rounded-full
                     px-5 py-2 transition"
            >
              Cancel
            </button>
            <button
              class="save-note-btn bg-green-500 hover:bg-green-600
                     text-white font-bold rounded-full
                     px-5 py-2 transition"
            >
              Save
            </button>
          </div>
        </div>

        <!-- Aktions-Buttons -->
        <div class="action-buttons mt-auto flex flex-col gap-2 pt-2">
          <button
            class="remove-btn bg-red-500 hover:bg-red-600
                   text-white font-bold rounded-full
                   px-4 py-2 transition"
          >
            Remove from favorites
          </button>
          <button
            class="note-btn bg-green-500 hover:bg-green-600
                   text-white font-bold rounded-full
                   px-4 py-2 transition"
          >
            ${hasNote ? "Edit notice" : "Add notice to favorites"}
          </button>
        </div>

      </div>
    </article>
  `;
}

// --------------------------------
// Event-Delegation für alle Card-Aktionen
// --------------------------------

favContainer.addEventListener("click", (event) => {
  const article = event.target.closest("article[data-movie-id]");
  if (!article) return;

  const movieId = Number(article.dataset.movieId);

  // ---- Film aus Favoriten entfernen ----
  if (event.target.closest(".remove-btn")) {
    let favs = getFavourites();
    favs = favs.filter((m) => m.id !== movieId);
    saveFavourites(favs);
    renderFavourites();
    return;
  }

  // ---- Notiz-Editor öffnen ----
  if (event.target.closest(".note-btn")) {
    const editor = article.querySelector(".note-editor");
    const actions = article.querySelector(".action-buttons");
    const display = article.querySelector(".note-display");
    const textarea = editor.querySelector(".note-textarea");

    // Aktuelle Notiz aus localStorage in Textarea laden
    const favs = getFavourites();
    const movie = favs.find((m) => m.id === movieId);
    textarea.value = movie?.note || "";

    editor.classList.remove("hidden");
    editor.classList.add("flex");
    actions.classList.add("hidden");
    display.classList.add("hidden");
    textarea.focus();
    return;
  }

  // ---- Notiz-Editor abbrechen ----
  if (event.target.closest(".cancel-note-btn")) {
    const editor = article.querySelector(".note-editor");
    const actions = article.querySelector(".action-buttons");
    const display = article.querySelector(".note-display");

    editor.classList.add("hidden");
    editor.classList.remove("flex");
    actions.classList.remove("hidden");

    // Notiz-Anzeige nur wieder einblenden, wenn Notiz vorhanden
    const favs = getFavourites();
    const movie = favs.find((m) => m.id === movieId);
    if (movie?.note && movie.note.trim()) {
      display.classList.remove("hidden");
    }
    return;
  }

  // ---- Notiz speichern (FR14) ----
  if (event.target.closest(".save-note-btn")) {
    const textarea = article.querySelector(".note-textarea");
    const noteText = textarea.value.trim();

    let favs = getFavourites();
    const idx = favs.findIndex((m) => m.id === movieId);

    if (idx !== -1) {
      favs[idx].note = noteText; // Note im selben Objekt aktualisieren
      saveFavourites(favs); // gesamte Liste unter "favourites" speichern
    }

    renderFavourites();
    return;
  }
});

// --------------------------------
// Initial rendern
// --------------------------------

renderFavourites();
