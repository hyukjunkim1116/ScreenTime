const API_KEY = "827e6f1415680e5dc26d5df1cab5252b";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const FAVORITES_KEY = "movie_favorites";

// 상수 추가
const MOVIE_DETAIL_URL = `${BASE_URL}/movie`;

// DOM 요소 참조
const moviesList = document.getElementById("moviesList");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

// 페이지 상태 관리를 위한 변수 추가
let currentPage = 1;

// 영화 데이터 가져오기
const fetchMovies = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.status_message || "영화 데이터를 가져오는데 실패했습니다."
      );
    }
    return await response.json();
  } catch (error) {
    showError(error.message);
    return null;
  }
};

// Intersection Observer 설정
const setupLazyLoading = () => {
  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove("lazy");
          observer.unobserve(img);
        }
      });
    },
    {
      rootMargin: "50px 0px",
      threshold: 0.1,
    }
  );

  return imageObserver;
};

// 이미지 lazy loading 적용
const lazyLoadImage = (img, observer) => {
  if (img.dataset.src) {
    observer.observe(img);
  }
};

// 영화 카드 HTML 생성
const createMovieCard = (movie) => {
  const imageObserver = setupLazyLoading();
  const card = document.createElement("div");
  card.className = "movie-card";
  card.innerHTML = `
    <div class="movie-card-inner">
      <a href="#/movie/${movie.id}" class="movie-link" aria-label="${
    movie.title
  }">
        <div class="image-container">
          <img 
            class="lazy movie-poster"
            data-src="${
              movie.poster_path
                ? IMAGE_BASE_URL + movie.poster_path
                : "placeholder.jpg"
            }"
            src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
            alt="${movie.title}"
          />
        </div>
        <div class="movie-info">
          <h3 class="movie-title">${movie.title}</h3>
          <p class="movie-date">개봉일: ${movie.release_date || "미정"}</p>
          <span class="movie-rating">⭐ ${movie.vote_average.toFixed(1)}</span>
        </div>
      </a>
      <button 
        class="favorite-button ${isFavorite(movie.id) ? "active" : ""}"
        aria-label="${movie.title} 즐겨찾기 ${
    isFavorite(movie.id) ? "제거" : "추가"
  }"
        data-movie-id="${movie.id}"
      >
        <span class="favorite-icon">★</span>
      </button>
    </div>
  `;

  const img = card.querySelector("img");
  lazyLoadImage(img, imageObserver);

  // 즐겨찾기 버튼 이벤트 리스너
  const favoriteButton = card.querySelector(".favorite-button");
  favoriteButton.addEventListener("click", (e) =>
    handleFavoriteClick(e, movie)
  );

  return card;
};

// 영화 목록 렌더링
const renderMovies = (movies) => {
  const movieGrid = document.querySelector(".movie-grid");
  movieGrid.innerHTML = "";
  movies.forEach((movie) => {
    const card = createMovieCard(movie);
    movieGrid.appendChild(card);
  });
};

// 에러 메시지 표시 함수 수정
const showError = (message) => {
  const movieGrid = document.querySelector(".movie-grid");
  if (movieGrid) {
    movieGrid.innerHTML = `
      <div class="error-message">
        ${message}
      </div>
    `;
  }
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

// 최신 영화 로드 함수 수정
const loadLatestMovies = async () => {
  // 페이지 범위 검증 추가
  if (currentPage < 1) currentPage = 1;
  if (currentPage > 500) currentPage = 500;

  const url = `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=ko-KR&page=${currentPage}`;
  const data = await fetchMovies(url);

  if (data) {
    renderMovies(data.results);
    updatePagination(data.total_pages);
  }
};

// 즐겨찾기 영화 로드 함수 수정
const loadFavoriteMovies = async () => {
  const favorites = getFavorites();
  const movieGrid = document.querySelector(".movie-grid");

  if (!favorites || favorites.length === 0) {
    showError("즐겨찾기한 영화가 없습니다.");
    return;
  }

  try {
    const movies = await Promise.all(
      favorites.map(async (id) => {
        const url = `${MOVIE_DETAIL_URL}/${id}?api_key=${API_KEY}&language=ko-KR`;
        return await fetchMovies(url);
      })
    );

    const validMovies = movies.filter((movie) => movie !== null);

    if (validMovies.length === 0) {
      showError("즐겨찾기 영화를 불러오는데 실패했습니다.");
      return;
    }

    renderMovies(validMovies);
  } catch (error) {
    console.error("즐겨찾기 영화 로드 중 오류:", error);
    showError("즐겨찾기 영화를 불러오는 중 오류가 발생했습니다.");
  }
};

// 페이지네이션 처리
const updatePagination = (totalPages) => {
  const prevButton = document.getElementById("prevPage");
  const nextButton = document.getElementById("nextPage");
  const currentPageSpan = document.getElementById("currentPage");

  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages;
  currentPageSpan.textContent = currentPage;
};

// 페이지네이션 이벤트 리스너
document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    loadLatestMovies();
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  currentPage++;
  loadLatestMovies();
});

// 라우팅 처리 수정
const handleRoute = () => {
  const hash = window.location.hash;
  const sectionTitle = document.querySelector(".section-title");
  const movieGrid = document.querySelector(".movie-grid-container");
  const movieDetail = document.querySelector(".movie-detail-container");
  const paginationContainer = document.getElementById("paginationContainer");

  // 모든 컨테이너 숨기기
  movieGrid.style.display = "none";
  movieDetail.style.display = "none";
  paginationContainer.style.display = "none"; // 기본적으로 페이지네이션 숨기기

  if (hash.startsWith("#/movie/")) {
    const movieId = hash.split("/")[2];
    sectionTitle.textContent = "영화 상세";
    movieDetail.style.display = "block";
    loadMovieDetail(movieId);
  } else if (hash === "#/favorite") {
    sectionTitle.textContent = "즐겨찾기";
    movieGrid.style.display = "block";
    loadFavoriteMovies();
  } else {
    sectionTitle.textContent = "최신 영화";
    movieGrid.style.display = "block";
    paginationContainer.style.display = "flex"; // 메인 페이지에서만 페이지네이션 표시
    loadLatestMovies();
  }
};

// 라우팅 이벤트 리스너
window.addEventListener("hashchange", handleRoute);
window.addEventListener("DOMContentLoaded", handleRoute);

// 즐겨찾기 관련 함수들
const getFavorites = () => {
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    if (!favorites) {
      // 초기 빈 배열 저장
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(favorites);
  } catch (error) {
    console.error("즐겨찾기 목록을 불러오는데 실패했습니다:", error);
    return [];
  }
};

const saveFavorites = (favorites) => {
  try {
    if (!Array.isArray(favorites)) {
      console.error("유효하지 않은 즐겨찾기 데이터입니다.");
      return false;
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error("즐겨찾기 목록을 저장하는데 실패했습니다:", error);
    return false;
  }
};

const isFavorite = (movieId) => {
  const favorites = getFavorites();
  return favorites.includes(Number(movieId));
};

// 즐겨찾기 토글 함수 수정
const toggleFavorite = (movieId, button) => {
  if (!movieId) return false;

  const favorites = getFavorites();
  const numericId = Number(movieId);

  try {
    if (isFavorite(numericId)) {
      // 즐겨찾기 제거
      const newFavorites = favorites.filter((id) => id !== numericId);
      const success = saveFavorites(newFavorites);

      // 즐겨찾기 페이지에서 제거된 경우 카드 제거
      if (success && window.location.hash === "#/favorite") {
        const movieCard = button.closest(".movie-card");
        if (movieCard) {
          movieCard.remove();
          // 즐겨찾기가 모두 제거된 경우 메시지 표시
          const movieGrid = document.querySelector(".movie-grid");
          if (movieGrid && movieGrid.children.length === 0) {
            showError("즐겨찾기한 영화가 없습니다.");
          }
        }
      }
      return false;
    } else {
      // 즐겨찾기 추가
      if (!favorites.includes(numericId)) {
        favorites.push(numericId);
        return saveFavorites(favorites);
      }
    }
  } catch (error) {
    console.error("즐겨찾기 토글 중 오류 발생:", error);
    return false;
  }
  return false;
};

// 즐겨찾기 버튼 이벤트 핸들러 수정
const handleFavoriteClick = (e, movie) => {
  e.preventDefault();
  e.stopPropagation();

  const button = e.target.closest(".favorite-button");
  if (!button || !movie) return;

  const movieId = Number(button.dataset.movieId);
  const isNowFavorite = toggleFavorite(movieId, button);

  // 버튼 상태 업데이트
  button.classList.toggle("active", isNowFavorite);
  button.setAttribute(
    "aria-label",
    `${movie.title} 즐겨찾기 ${isNowFavorite ? "제거" : "추가"}`
  );
};

// 영화 세 정보 가져오기
const loadMovieDetail = async (movieId) => {
  const url = `${MOVIE_DETAIL_URL}/${movieId}?api_key=${API_KEY}&language=ko-KR`;
  const movie = await fetchMovies(url);
  if (movie) {
    renderMovieDetail(movie);
  }
};

// 영화 상세 페이지 렌더링 수정
const renderMovieDetail = (movie) => {
  const detailContainer = document.querySelector(".movie-detail-container");
  detailContainer.innerHTML = `
    <div class="movie-detail">
      <div class="movie-detail-header">
        <img 
          src="${movie.backdrop_path ? IMAGE_BASE_URL + movie.backdrop_path : "placeholder.jpg"}"
          alt="${movie.title}"
          class="movie-backdrop"
          loading="lazy"
        />
        <button 
          class="favorite-button detail-favorite ${isFavorite(movie.id) ? "active" : ""}"
          aria-label="${movie.title} 즐겨찾기 ${isFavorite(movie.id) ? "제거" : "추가"}"
          data-movie-id="${movie.id}"
        >
          <span class="favorite-icon">★</span>
        </button>
      </div>
      <div class="movie-detail-content">
        <h1>${movie.title}</h1>
        <div class="movie-info">
          <p class="release-date">개봉일: ${movie.release_date}</p>
          <p class="rating">평점: ${movie.vote_average.toFixed(1)}</p>
        </div>
        <p class="overview">${movie.overview || "줄거리 정보가 없습니다."}</p>
        <div class="button-container">
          <button 
            class="back-button"
            onclick="window.history.back()"
          >
            뒤로가기
          </button>
        </div>
      </div>
    </div>
  `;

  // CSS 스타일 추가
  const style = document.createElement('style');
  style.textContent = `
    .button-container {
      display: flex;
      justify-content: center;
      margin-top: 2rem;
    }
    
    .back-button {
      padding: 0.5rem 1rem;
      border-radius: 4px;
      background-color: #333;
      color: white;
      border: none;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .back-button:hover {
      background-color: #555;
    }
  `;
  document.head.appendChild(style);

  // 상세 페이지 즐겨찾기 버튼 이벤트 리스너
  const favoriteButton = detailContainer.querySelector(".favorite-button");
  favoriteButton.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    // 버튼 요소 찾기
    const button = e.target.closest(".favorite-button");
    if (!button) return;

    const movieId = Number(button.dataset.movieId);
    const isNowFavorite = toggleFavorite(movieId);

    button.classList.toggle("active", isNowFavorite);
    button.setAttribute(
      "aria-label",
      `${movie.title} 즐겨찾기 ${isNowFavorite ? "제거" : "추가"}`
    );
  });
};

// 검색 관련 이벤트 리스너 추가
document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.querySelector(".search-container");
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");

  // 검색 실행 함수
  const handleSearch = async (event) => {
    if (event) {
      event.preventDefault();
    }

    const searchTerm = searchInput.value.trim();
    if (!searchTerm) return;

    const sectionTitle = document.querySelector(".section-title");
    sectionTitle.textContent = `"${searchTerm}" 검색 결과`;

    // 컨테이너 표시 설정
    const movieGrid = document.querySelector(".movie-grid-container");
    const movieDetail = document.querySelector(".movie-detail-container");
    movieGrid.style.display = "block";
    movieDetail.style.display = "none";

    const searchUrl = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
      searchTerm
    )}&language=ko-KR&page=1`;
    const data = await fetchMovies(searchUrl);

    if (data && data.results) {
      if (data.results.length === 0) {
        showError("검색 결과가 없습니다.");
      } else {
        renderMovies(data.results);
      }
    }
  };

  // 검색 버튼 클릭 이벤트
  searchButton.addEventListener("click", handleSearch);

  // 엔터 키 입력 이벤트
  searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      handleSearch(event);
    }
  });

  // 검색어 입력 필드 포커스 아웃 시 검색어가 있다면 검색 실행
  searchInput.addEventListener("blur", () => {
    if (searchInput.value.trim()) {
      handleSearch();
    }
  });
});

// CSS 스타일 추가
const style = document.createElement("style");
style.textContent = `
  .error-message {
    text-align: center;
    padding: 2rem;
    color: #666;
    font-size: 1.2rem;
    background: #f8f9fa;
    border-radius: 8px;
    margin: 4rem auto;
    max-width: 600px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .movie-grid {
    position: relative;
    min-height: 50vh;
  }
`;
document.head.appendChild(style);

const showMovieDetail = (movieId) => {
  const paginationContainer = document.getElementById('paginationContainer');
  paginationContainer.style.display = 'none';
  // ... 나머지 상세 페이지 로직 ...
}

const showMovieList = () => {
  const paginationContainer = document.getElementById('paginationContainer');
  paginationContainer.style.display = 'flex';
  // ... 나머지 목록 페이지 로직 ...
}

// 다크모드 관련 상수
const DARK_MODE_KEY = 'dark_mode_enabled';
const DARK_MODE_CLASS = 'dark-mode';

// 다크모드 상태 관리 함수
const isDarkMode = () => {
  return localStorage.getItem(DARK_MODE_KEY) === 'true';
};

// 다크모드 토글 함수
const toggleDarkMode = () => {
  const darkModeEnabled = isDarkMode();
  localStorage.setItem(DARK_MODE_KEY, !darkModeEnabled);
  document.documentElement.classList.toggle(DARK_MODE_CLASS, !darkModeEnabled);
  
  // 버튼 아이콘 업데이트
  const darkModeButton = document.getElementById('darkModeToggle');
  darkModeButton.innerHTML = !darkModeEnabled ? '☀️' : '🌙';
  darkModeButton.setAttribute('aria-label', 
    !darkModeEnabled ? '라이트모드로 전환' : '다크모드로 전환'
  );
};

// 초기 다크모드 상태 설정
const initDarkMode = () => {
  const darkModeEnabled = isDarkMode();
  document.documentElement.classList.toggle(DARK_MODE_CLASS, darkModeEnabled);
  
  const darkModeButton = document.getElementById('darkModeToggle');
  if (darkModeButton) {
    darkModeButton.innerHTML = darkModeEnabled ? '☀️' : '🌙';
    darkModeButton.setAttribute('aria-label', 
      darkModeEnabled ? '라이트모드로 전환' : '다크모드로 전환'
    );
  }
};

// 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', () => {
  // 기존 코드...

  // 다크모드 토글 버튼 이벤트 리스너
  const darkModeButton = document.getElementById('darkModeToggle');
  if (darkModeButton) {
    darkModeButton.addEventListener('click', toggleDarkMode);
    darkModeButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDarkMode();
      }
    });
  }

  // 다크모드 초기화
  initDarkMode();
});

// CSS 스타일 추가
const darkModeStyles = document.createElement('style');
darkModeStyles.textContent = `
  /* 네비게이션 레이아웃 */
  .header {
    border-bottom: 1px solid var(--border-color);
  }

  .nav {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    margin: 0;
  }

  .nav-links {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  /* 다크모드 변수 */
  :root {
    --light-bg: #ffffff;
    --light-text: #333333;
    --light-border: #e0e0e0;
  }

  .dark-mode {
    --bg-color: #1a1a1a;
    --text-color: #ffffff;
    --card-bg: #2d2d2d;
    --header-bg: #2d2d2d;
    --border-color: #404040;
    --input-bg: #3d3d3d;
    --button-bg: #4a4a4a;
    --button-hover: #5a5a5a;
    --link-color: #9ecaed;
    --secondary-text: #cccccc;
    --detail-text: #333333;  /* 상세 페이지 텍스트 색상 추가 */
  }

  /* 다크모드 스타일 */
  .dark-mode body {
    background-color: var(--bg-color);
    color: var(--text-color);
  }

  .dark-mode .header {
    background-color: var(--header-bg);
  }

  .dark-mode .nav a,
  .dark-mode .logo a {
    color: var(--text-color);
  }

  .dark-mode .section-title,
  .dark-mode .movie-title,
  .dark-mode .movie-date,
  .dark-mode .movie-rating,
  .dark-mode .overview,
  .dark-mode .release-date,
  .dark-mode .rating,
  .dark-mode .footer p {
    color: var(--text-color);
  }

  .dark-mode .movie-card {
    background-color: var(--card-bg);
    border-color: var(--border-color);
  }

  .dark-mode .search-container input {
    background-color: var(--input-bg);
    color: var(--text-color);
    border: 1px solid var(--border-color);
  }

  .dark-mode .search-container button,
  .dark-mode .pagination-button,
  .dark-mode .back-button {
    background-color: var(--button-bg);
    color: var(--text-color);
    border: 1px solid var(--border-color);
  }

  .dark-mode .search-container button:hover,
  .dark-mode .pagination-button:hover,
  .dark-mode .back-button:hover {
    background-color: var(--button-hover);
  }

  .dark-mode .current-page {
    color: var(--text-color);
  }

  /* 다크모드 토글 버튼 스타일 */
  .dark-mode-toggle {
    background: transparent;
    border: 2px solid #666;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    transition: all 0.3s ease;
    padding: 0;
  }

  .dark-mode-toggle:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: scale(1.1);
  }

  .dark-mode .dark-mode-toggle {
    border-color: var(--text-color);
    color: var(--text-color);
  }

  /* 영화 상세 페이지 다크모드 */
  .dark-mode .movie-detail {
    background-color: #ffffff;  /* 배경색을 흰색으로 변경 */
    color: var(--detail-text);
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  }

  .dark-mode .movie-detail h1 {
    color: var(--detail-text);
    margin-bottom: 1rem;
  }

  .dark-mode .movie-detail .movie-info {
    color: #666666;  /* 부가 정보 텍스트 색상 */
    margin-bottom: 1.5rem;
  }

  .dark-mode .movie-detail .overview {
    color: var(--detail-text);
    line-height: 1.6;
  }

  .dark-mode .movie-detail .release-date,
  .dark-mode .movie-detail .rating {
    color: #666666;
  }

  /* 뒤로가기 버튼 스타일 */
  .dark-mode .back-button {
    background-color: var(--button-bg);
    color: #ffffff;  /* 버튼 텍스트는 흰색으로 유지 */
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .dark-mode .back-button:hover {
    background-color: var(--button-hover);
  }
`;
document.head.appendChild(darkModeStyles);
