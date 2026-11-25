// main.js – Homepage: beliebte Filme (FR009), Karten (FR011), Favoriten (FR012)
// TMDB_API_KEY und escapeHTML() kommen aus header.js (wird vorher geladen)

const movieGrid = document.getElementById("movie-grid");
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w342";
const NO_IMAGE_URL = "https://placehold.co/342x513/334155/ffffff?text=No+Image";

// Hier merken wir uns die geladenen Filme
let popularMovies = [];

// --------------------------------
// FR012: Favoriten im localStorage
// --------------------------------

// Alle Favoriten als Array holen (leeres Array, falls noch keine da sind)
function getFavourites() {
  return JSON.parse(localStorage.getItem("favourites")) || [];
}

function saveFavourites(favourites) {
  localStorage.setItem("favourites", JSON.stringify(favourites));
}

function isFavourite(movieId) {
  return getFavourites().some((movie) => movie.id === movieId);
}

// --------------------------------
// FR009: Beliebte Filme laden
// --------------------------------
async function loadPopularMovies() {
  movieGrid.innerHTML = `<p class="text-gray-300 col-span-full">Loading popular movies...</p>`;

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`,
    );

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();
    popularMovies = data.results;
    renderMovies(popularMovies);
  } catch (error) {
    movieGrid.innerHTML = `<p class="text-red-400 col-span-full">Movies could not be loaded. Please try again.</p>`;
    console.error(error);
  }
}

// --------------------------------
// FR011: Filmkarten
// --------------------------------
function renderMovies(movies) {
  movieGrid.innerHTML = movies.map(createMovieCard).join("");
}

function createMovieCard(movie) {
  const poster = movie.poster_path
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : NO_IMAGE_URL;
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "Unknown";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "–";
  const overview = escapeHTML(
    movie.overview || "No description available.",
  ).slice(0, 150);
  const alreadyAdded = isFavourite(movie.id);

  return `
    <article class="movie-card bg-slate-800 text-white rounded-2xl
                    overflow-hidden shadow-lg flex flex-col"
             data-movie-id="${movie.id}">

      <img src="${poster}"
           alt="${escapeHTML(movie.title)}"
           class="w-full h-96 object-cover">

      <div class="p-4 flex flex-col gap-2 flex-1">
        <h3 class="font-bold text-yellow-400 text-lg">
          ${escapeHTML(movie.title)}
        </h3>
        <p class="text-sm text-gray-400">${year} · ⭐ ${rating}</p>
        <p class="text-sm text-gray-300">${overview}</p>

        <!-- FR012: Button "Add to favourites" -->
        <button
          class="add-favourite-btn mt-auto bg-yellow-400
                 hover:bg-yellow-500 text-slate-900 font-bold
                 rounded-full px-4 py-2 transition
                 disabled:opacity-60 disabled:cursor-not-allowed"
          data-movie-id="${movie.id}"
          ${alreadyAdded ? "disabled" : ""}>
          ${alreadyAdded ? "In favourites ✓" : "Add to favourites"}
        </button>
      </div>
    </article>
  `;
}

// --------------------------------
// FR012: Klick auf "Add to favourites"
// --------------------------------
movieGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".add-favourite-btn");

  if (!button) {
    return;
  }

  const movieId = Number(button.dataset.movieId);
  const movie = popularMovies.find((item) => item.id === movieId);

  if (!movie || isFavourite(movieId)) {
    return;
  }

  // Film als Objekt speichern, "note" ist für FR014 (Notizen) vorbereitet
  const favourites = getFavourites();
  favourites.push({
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    release_date: movie.release_date,
    vote_average: movie.vote_average,
    overview: movie.overview,
    note: "",
  });
  saveFavourites(favourites);

  button.textContent = "In favourites ✓";
  button.disabled = true;
});

loadPopularMovies();
