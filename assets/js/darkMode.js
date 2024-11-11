// 다크모드 상태 관리
let isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

// 다크모드 토글 함수
const toggleDarkMode = () => {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('dark-mode', isDarkMode);
  updateDarkModeIcon();
  saveDarkModePreference();
};

// 다크모드 아이콘 업데이트
const updateDarkModeIcon = () => {
  const darkModeToggle = document.getElementById('darkModeToggle');
  darkModeToggle.innerHTML = isDarkMode ? '☀️' : '🌙';
};

// 다크모드 설정 저장
const saveDarkModePreference = () => {
  localStorage.setItem('darkMode', isDarkMode);
};

// 다크모드 설정 불러오기
const loadDarkModePreference = () => {
  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode !== null) {
    isDarkMode = savedDarkMode === 'true';
    document.body.classList.toggle('dark-mode', isDarkMode);
    updateDarkModeIcon();
  }
};

// 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', () => {
  const darkModeToggle = document.getElementById('darkModeToggle');
  darkModeToggle.addEventListener('click', toggleDarkMode);
  loadDarkModePreference();

  // 시스템 다크모드 변경 감지
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    isDarkMode = e.matches;
    document.body.classList.toggle('dark-mode', isDarkMode);
    updateDarkModeIcon();
    saveDarkModePreference();
  });
}); 