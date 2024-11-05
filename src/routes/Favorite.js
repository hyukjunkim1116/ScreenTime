const Favorite = {
  init: async () => {
    const container = document.getElementById('favorite-page');
    const API_KEY = 'your_tmdb_api_key';
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (favorites.length === 0) {
      container.innerHTML = `
        <div class="p-4 text-center">
          <p class="text-gray-600">즐겨찾기한 영화가 없습니다.</p>
        </div>
      `;
      return;
    }

    try {
      const movies = await Promise.all(
        favorites.map(async (movieId) => {
          const response = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&language=ko-KR`
          );
          return response.json();
        })
      );

      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          ${movies.map(movie => `
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
                <button onclick="Favorite.handleRemove(event, ${movie.id})"
                        class="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg"
                        aria-label="즐겨찾기에서 제거"
                        tabindex="0">
                  제거
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (error) {
      console.error('Error fetching favorite movies:', error);
    }
  },

  handleRemove: (event, movieId) => {
    event.stopPropagation();
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const updatedFavorites = favorites.filter(id => id !== movieId);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    Favorite.init();
  }
}; 