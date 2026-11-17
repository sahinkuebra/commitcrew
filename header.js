const headerContainer = document.getElementById("site-header");

headerContainer.innerHTML = `
  <header class="w-full bg-[#1e293b] shadow-lg">
    <div class="max-w-6xl mx-auto px-5 py-4
                flex items-center justify-between
                flex-wrap gap-5">

      <!-- Logo -->
      <a href="index.html"
         class="flex-shrink-0 border-4 border-yellow-400
                rounded-xl px-2 py-2 text-yellow-400
                font-extrabold text-xl leading-5
                hover:scale-105 transition">
        TM<br>DB
      </a>

      <!-- Navigation und Suche -->
      <div class="flex items-center justify-end
                  flex-wrap gap-4">

        <!-- Navigation -->
        <nav class="flex items-center gap-6 text-white
                    font-medium">

          <a href="index.html"
             class="hover:text-yellow-400 transition">
            Homepage
          </a>

          <a href="index2.html"
             class="hover:text-yellow-400 transition">
            My Favorites
          </a>

        </nav>

        <!-- Suchfunktion -->
        <form id="search-form"
              class="flex items-center gap-2">

          <input
            id="search-input"
            type="search"
            placeholder="Search a film..."
            class="bg-slate-700 text-white
                   placeholder-gray-400 rounded-full
                   px-5 py-3 w-48 md:w-64
                   border-2 border-transparent
                   focus:border-yellow-400
                   outline-none transition"
          >

          <button
            type="submit"
            class="bg-yellow-400 hover:bg-yellow-500
                   text-slate-900 font-bold
                   rounded-full px-6 py-3
                   transition hover:scale-105">
            Search
          </button>

        </form>

      </div>
    </div>
  </header>

  <!-- Suchdialog -->
  <dialog id="search-dialog"
          class="bg-slate-800 text-white rounded-2xl
                 p-6 w-[90%] max-w-2xl
                 backdrop:bg-black/70">

    <div class="flex justify-between items-center mb-5">

      <h2 class="text-xl font-bold">
        Search Results
      </h2>

      <button id="close-dialog"
              class="text-2xl hover:text-yellow-400">
        &times;
      </button>

    </div>

    <div id="search-results" class="space-y-4">
    </div>

  </dialog>
`;

// --------------------------------
// Suchfunktion
// --------------------------------

// Deinen TMDB API-Key hier eintragen
const TMDB_API_KEY = "9f8d69b0593201775178535c9353f558";

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchDialog = document.getElementById("search-dialog");
const searchResults = document.getElementById("search-results");
const closeDialog = document.getElementById("close-dialog");

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = searchInput.value.trim();

  if (!query) {
    searchResults.innerHTML = `<p class="text-yellow-400">Please enter a movie title.</p>`;

    searchDialog.showModal();
    return;
  }

  searchResults.innerHTML = `<p class="text-gray-300">Searching for movies...</p>`;

  searchDialog.showModal();

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`,
    );

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();

    if (data.results.length === 0) {
      searchResults.innerHTML = `<p class="text-gray-300">No movies found.</p>`;
      return;
    }

    searchResults.innerHTML = data.results
      .slice(0, 10)
      .map(
        (movie) => `
      <div class="flex gap-4 border-b border-slate-600 pb-4">

        <img
          src="${
            movie.poster_path
              ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
              : "https://placehold.co/92x138/334155/ffffff?text=No+Image"
          }"
          alt="${escapeHTML(movie.title)}"
          class="w-16 h-24 object-cover rounded"
        >

        <div>
          <h3 class="font-bold text-yellow-400">
            ${escapeHTML(movie.title)}
          </h3>

          <p class="text-sm text-gray-400">
            ${movie.release_date || "Release date unknown"}
          </p>

          <p class="text-sm text-gray-300 mt-2">
            ${escapeHTML(movie.overview || "No description available.").slice(0, 160)}
          </p>
        </div>

      </div>
    `,
      )
      .join("");
  } catch (error) {
    searchResults.innerHTML = `<p class="text-red-400">
        Something went wrong. Please try again.
      </p>`;

    console.error(error);
  }
});

// HTML-Ausgabe gegen unerwünschte HTML-Inhalte absichern
function escapeHTML(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[char],
  );
}

// Dialog schließen
closeDialog.addEventListener("click", () => {
  searchDialog.close();
});

// Klick außerhalb des Dialogs schließt ihn
searchDialog.addEventListener("click", (event) => {
  if (event.target === searchDialog) {
    searchDialog.close();
  }
});
