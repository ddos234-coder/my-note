// Service Worker 등록
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        console.log('[앱] Service Worker 등록 성공:', registration.scope);

        // 업데이트 확인
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('[앱] 새로운 Service Worker 발견');

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[앱] 새로운 버전 사용 가능. 페이지를 새로고침하세요.');
              // 필요시 사용자에게 알림 표시
            }
          });
        });
      })
      .catch((error) => {
        console.log('[앱] Service Worker 등록 실패:', error);
      });
  });

  // Service Worker 메시지 수신
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('[앱] Service Worker 메시지:', event.data);
  });
} else {
  console.log('[앱] Service Worker를 지원하지 않는 브라우저입니다.');
}
