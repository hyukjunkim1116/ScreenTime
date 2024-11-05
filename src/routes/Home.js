const Home = {
  init: async () => {
    const container = document.getElementById("home-page");
    const API_KEY = "your_tmdb_api_key";

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=ko-KR`
      );
      const data = await response.json();

      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          ${data.results
            .map(
              (movie) => `
            <div class="movie-card cursor-pointer rounded-lg overflow-hidden shadow-lg"
                 onclick="location.href='/${movie.id}'"
                 role="button"
                 tabindex="0">
              <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
                   alt="${movie.title}"
                   class="w-full h-auto">
              <div class="p-4">
                <h2 class="text-xl font-bold">${movie.title}</h2>
                <p class="text-gray-600">${movie.release_date}</p>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      `;
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  },
};
