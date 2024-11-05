// 간단한 라우터 구현
const router = {
  init: () => {
    window.addEventListener('popstate', router.handleRoute);
    router.handleRoute();
  },

  handleRoute: () => {
    const path = window.location.pathname;
    
    // 모든 페이지 컨테이너를 숨김
    document.querySelectorAll('.page-container').forEach(page => {
      page.style.display = 'none';
    });

    // 현재 경로에 따라 해당 페이지 표시
    if (path === '/') {
      document.getElementById('home-page').style.display = 'block';
      Home.init();
    } else if (path === '/search') {
      document.getElementById('search-page').style.display = 'block';
      Search.init();
    } else if (path === '/favorite') {
      document.getElementById('favorite-page').style.display = 'block';
      Favorite.init();
    } else if (path.match(/^\/\d+$/)) {
      document.getElementById('detail-page').style.display = 'block';
      Detail.init(path.slice(1));
    }
  }
};

// 페이지 로드시 라우터 초기화
window.addEventListener('DOMContentLoaded', router.init);
