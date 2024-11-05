const API_KEY = "827e6f1415680e5dc26d5df1cab5252b";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

// DOM 요소 참조
const moviesList = document.getElementById("moviesList");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

// 영화 데이터 가져오기
const fetchMovies = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("영화 데이터를 가져오는데 실패했습니다.");
    return await response.json();
  } catch (error) {
    showError(error.message);
    return null;
  }
};

// 영화 카드 HTML 생성
const createMovieCard = (movie) => {
  const card = document.createElement("article");
  card.className = "movie-card";
  card.tabIndex = 0;

  card.innerHTML = `
        <img 
            src="${
              movie.poster_path
                ? IMAGE_BASE_URL + movie.poster_path
                : "assets/images/placeholder.jpg"
            }"
            alt="${movie.title} 포스터"
            class="movie-poster"
            loading="lazy"
        />
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <p class="movie-date">개봉일: ${movie.release_date || "미정"}</p>
            <span class="movie-rating">⭐ ${movie.vote_average.toFixed(
              1
            )}</span>
        </div>
    `;

  return card;
};

// 영화 목록 렌더링
const renderMovies = (movies) => {
  moviesList.innerHTML = "";
  if (!movies || movies.length === 0) {
    showError("검색 결과가 없습니다.");
    return;
  }

  movies.forEach((movie) => {
    moviesList.appendChild(createMovieCard(movie));
  });
};

// 에러 메시지 표시
const showError = (message) => {
  moviesList.innerHTML = `
        <div class="error-message">
            ${message}
        </div>
    `;
};

// 검색 기능
const handleSearch = async () => {
  const searchTerm = searchInput.value.trim();
  if (!searchTerm) return;

  const searchUrl = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
    searchTerm
  )}&language=ko-KR`;
  const data = await fetchMovies(searchUrl);

  if (data) {
    renderMovies(data.results);
  }
};

// 최신 영화 로드
const loadLatestMovies = async () => {
  const url = `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=ko-KR&page=1`;
  const data = await fetchMovies(url);

  if (data) {
    renderMovies(data.results);
  }
};

// 이벤트 리스너
searchButton.addEventListener("click", handleSearch);
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});

// 초기 로딩
document.addEventListener("DOMContentLoaded", loadLatestMovies);
