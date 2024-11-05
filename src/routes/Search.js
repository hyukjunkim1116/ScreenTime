const Search = {
  init: () => {
    const container = document.getElementById('search-page');
    
    container.innerHTML = `
      <div class="p-4">
        <div class="max-w-xl mx-auto">
          <input type="text"
                 id="search-input"
                 placeholder="영화 검색..."
                 class="w-full p-2 border rounded-lg"
                 aria-label="영화 검색">
          <div id="search-results" class="mt-4 grid grid-cols-1 gap-4">
          </div>
        </div>
      </div>
    `;

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', Search.handleSearch);
  },

  handleSearch: async (event) => {
    const query = event.target.value;
    const API_KEY = 'your_tmdb_api_key';
    
    if (query.length < 2) return;

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}&language=ko-KR`
      );
      const data = await response.json();
      
      const resultsContainer = document.getElementById('search-results');
      resultsContainer.innerHTML = data.results.map(movie => `
        <div class="movie-item p-4 border rounded-lg cursor-pointer"
             onclick="location.href='/${movie.id}'"
             role="button"
             tabindex="0">
          <h3 class="text-lg font-bold">${movie.title}</h3>
          <p class="text-gray-600">${movie.release_date}</p>
        </div>
      `).join('');
    } catch (error) {
      console.error('Error searching movies:', error);
    }
  }
}; 