const Detail = {
  init: async (movieId) => {
    const container = document.getElementById('detail-page');
    const API_KEY = 'your_tmdb_api_key';
    
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&language=ko-KR`
      );
      const movie = await response.json();
      
      container.innerHTML = `
        <div class="max-w-4xl mx-auto p-4">
          <div class="flex flex-col md:flex-row gap-8">
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
                 alt="${movie.title}"
                 class="w-full md:w-1/3 rounded-lg">
            <div class="flex-1">
              <h1 class="text-3xl font-bold mb-4">${movie.title}</h1>
              <p class="text-gray-600 mb-4">${movie.overview}</p>
              <div class="flex gap-2">
                <button onclick="Detail.handleFavorite(${movie.id})"
                        class="px-4 py-2 bg-blue-500 text-white rounded-lg"
                        aria-label="즐겨찾기에 추가"
                        tabindex="0">
                  즐겨찾기 추가
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  },

  handleFavorite: (movieId) => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (!favorites.includes(movieId)) {
      favorites.push(movieId);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      alert('즐겨찾기에 추가되었습니다!');
    }
  }
};
