// main.js – Homepage: beliebte Filme laden (FR009) und als Karten anzeigen (FR011)
// TMDB_API_KEY und escapeHTML() kommen aus header.js (wird vorher geladen)

const movieGrid = document.getElementById("movie-grid");
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w342";
const NO_IMAGE_URL = "https://placehold.co/342x513/334155/ffffff?text=No+Image";

// FR009: Beliebte Filme von der TMDB-API holen
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
    renderMovies(data.results);
  } catch (error) {
    movieGrid.innerHTML = `<p class="text-red-400 col-span-full">Movies could not be loaded. Please try again.</p>`;
    console.error(error);
  }
}

// FR011: Filmkarten in das Raster schreiben
function renderMovies(movies) {
  movieGrid.innerHTML = movies.map(createMovieCard).join("");
}

// Eine Karte mit Bild, Titel und Infos
function createMovieCard(movie) {
  const poster = movie.poster_path
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : NO_IMAGE_URL;
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "Unknown";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "–";
  const overview = escapeHTML(
    movie.overview || "No description available.",
  ).slice(0, 150);

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

        <!-- Platz für den Button "Add to favourites" (FR012) -->
      </div>
    </article>
  `;
}

loadPopularMovies();
