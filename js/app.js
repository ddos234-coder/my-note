// ==================== 전역 변수 ====================
let notes = [];
let currentNoteId = null;
let showOnlyImportant = false;

// ==================== 초기화 ====================
document.addEventListener('DOMContentLoaded', () => {
  console.log('my note 앱 시작');

  // 다크모드 설정 불러오기
  loadDarkMode();

  // 저장된 메모 불러오기
  loadNotes();

  // 이벤트 리스너 설정
  setupEventListeners();
});

// ==================== 이벤트 리스너 설정 ====================
function setupEventListeners() {
  // 새 메모 추가 버튼
  const addNoteBtn = document.getElementById('addNoteBtn');
  addNoteBtn.addEventListener('click', createNewNote);

  // 검색 기능
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', searchNotes);

  // 필터 버튼 (중요 메모 토글)
  const filterBtn = document.getElementById('filterBtn');
  filterBtn.addEventListener('click', toggleImportantFilter);

  // 설정 버튼
  const settingsBtn = document.getElementById('settingsBtn');
  settingsBtn.addEventListener('click', openSettings);

  // 모달 관련
  const closeModalBtn = document.getElementById('closeModalBtn');
  closeModalBtn.addEventListener('click', closeModal);

  const saveNoteBtn = document.getElementById('saveNoteBtn');
  saveNoteBtn.addEventListener('click', saveCurrentNote);

  const cancelNoteBtn = document.getElementById('cancelNoteBtn');
  cancelNoteBtn.addEventListener('click', closeModal);

  // 모달 배경 클릭 시 닫기
  const modal = document.getElementById('noteModal');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // 백업 관련
  const exportBtn = document.getElementById('exportBtn');
  exportBtn.addEventListener('click', exportNotes);

  const importBtn = document.getElementById('importBtn');
  importBtn.addEventListener('click', () => {
    document.getElementById('importFileInput').click();
  });

  const importFileInput = document.getElementById('importFileInput');
  importFileInput.addEventListener('change', importNotes);
}

// ==================== 메모 데이터 관리 ====================
// LocalStorage에서 메모 불러오기
function loadNotes() {
  const savedNotes = localStorage.getItem('myNotes');
  if (savedNotes) {
    notes = JSON.parse(savedNotes);
  }
  displayNotes();
}

// LocalStorage에 메모 저장
function saveNotes() {
  localStorage.setItem('myNotes', JSON.stringify(notes));
}

// ==================== 메모 표시 ====================
function displayNotes() {
  const notesList = document.getElementById('notesList');
  const searchInput = document.getElementById('searchInput');
  const searchTerm = searchInput.value.toLowerCase();

  notesList.innerHTML = '';

  // 필터링: 검색어 + 중요 메모
  let filteredNotes = notes.filter(note => {
    const titleMatch = note.title.toLowerCase().includes(searchTerm);
    const contentMatch = (note.content || '').toLowerCase().includes(searchTerm);
    const searchMatch = titleMatch || contentMatch;

    const importantMatch = showOnlyImportant ? note.important : true;

    return searchMatch && importantMatch;
  });

  if (filteredNotes.length === 0) {
    const emptyMessage = showOnlyImportant
      ? '중요한 메모가 없습니다.'
      : '메모가 없습니다. 새 메모를 추가해보세요!';
    notesList.innerHTML = `<p style="text-align: center; color: var(--text-secondary); margin-top: 2rem;">${emptyMessage}</p>`;
    return;
  }

  filteredNotes.forEach(note => {
    const noteCard = createNoteCard(note);
    notesList.appendChild(noteCard);
  });
}

// 메모 카드 생성
function createNoteCard(note) {
  const card = document.createElement('div');
  card.className = 'note-card';
  card.dataset.id = note.id;

  // 카드 헤더 (제목 + 별 버튼)
  const cardHeader = document.createElement('div');
  cardHeader.className = 'note-card-header';

  const title = document.createElement('div');
  title.className = 'note-card-title';
  title.textContent = note.title || '제목 없음';

  // 중요 메모 별 버튼
  const starBtn = document.createElement('button');
  starBtn.className = 'star-btn';
  starBtn.textContent = note.important ? '⭐' : '☆';
  if (note.important) {
    starBtn.classList.add('active');
  }
  starBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleImportant(note.id);
  });

  cardHeader.appendChild(title);
  cardHeader.appendChild(starBtn);

  // 카드 내용
  const cardContent = document.createElement('div');
  cardContent.className = 'note-card-content';

  const preview = document.createElement('p');
  preview.className = 'note-card-preview';
  preview.textContent = note.content || '내용 미리보기';

  cardContent.appendChild(preview);

  // 카드 푸터 (날짜 + 삭제 버튼)
  const cardFooter = document.createElement('div');
  cardFooter.className = 'note-card-footer';

  const dateSpan = document.createElement('span');
  dateSpan.className = 'note-card-date';
  const date = new Date(note.date);
  dateSpan.textContent = date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'note-delete-btn';
  deleteBtn.textContent = '삭제';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteNoteFromCard(note.id);
  });

  cardFooter.appendChild(dateSpan);
  cardFooter.appendChild(deleteBtn);

  // 카드 클릭 이벤트
  card.addEventListener('click', () => openNote(note.id));

  card.appendChild(cardHeader);
  card.appendChild(cardContent);
  card.appendChild(cardFooter);

  return card;
}

// ==================== 메모 CRUD 기능 ====================
// 새 메모 생성
function createNewNote() {
  const newNote = {
    id: Date.now(),
    title: '새 메모',
    content: '',
    date: new Date().toISOString(),
    important: false
  };

  notes.unshift(newNote);
  saveNotes();

  // 새 메모를 바로 열기
  openNote(newNote.id);
}

// 메모 열기
function openNote(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;

  currentNoteId = id;

  // 모달에 데이터 채우기
  document.getElementById('noteTitleInput').value = note.title || '';
  document.getElementById('noteContentInput').value = note.content || '';

  // 모달 열기
  const modal = document.getElementById('noteModal');
  modal.classList.add('active');

  // 제목 input에 포커스
  setTimeout(() => {
    document.getElementById('noteTitleInput').focus();
  }, 100);
}

// 현재 메모 저장
function saveCurrentNote() {
  if (!currentNoteId) return;

  const note = notes.find(n => n.id === currentNoteId);
  if (!note) return;

  const title = document.getElementById('noteTitleInput').value.trim();
  const content = document.getElementById('noteContentInput').value.trim();

  note.title = title || '제목 없음';
  note.content = content;
  note.date = new Date().toISOString();

  saveNotes();
  displayNotes();
  closeModal();
}

// 카드에서 메모 삭제
function deleteNoteFromCard(id) {
  if (confirm('이 메모를 삭제하시겠습니까?')) {
    notes = notes.filter(n => n.id !== id);
    saveNotes();
    displayNotes();
  }
}

// 모달 닫기
function closeModal() {
  const modal = document.getElementById('noteModal');
  modal.classList.remove('active');
  currentNoteId = null;
}

// ==================== 중요 메모 기능 ====================
// 중요 메모 토글
function toggleImportant(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;

  note.important = !note.important;
  saveNotes();
  displayNotes();
}

// 중요 메모 필터 토글
function toggleImportantFilter() {
  showOnlyImportant = !showOnlyImportant;

  const filterBtn = document.getElementById('filterBtn');
  if (showOnlyImportant) {
    filterBtn.textContent = '⭐';
    filterBtn.title = '중요 메모만 보기';
  } else {
    filterBtn.textContent = '📋';
    filterBtn.title = '전체 메모';
  }

  displayNotes();
}

// ==================== 검색 기능 ====================
function searchNotes() {
  displayNotes();
}

// ==================== 다크모드 ====================
// 다크모드 설정 불러오기
function loadDarkMode() {
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
  }
}

// 다크모드 토글
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDarkMode);
  console.log('다크모드:', isDarkMode ? 'ON' : 'OFF');
}

// ==================== 설정 ====================
function openSettings() {
  // 설정 버튼을 다크모드 토글로 사용
  toggleDarkMode();
}

// ==================== 백업 관리 ====================
// 메모 내보내기 (Export)
function exportNotes() {
  try {
    // 날짜 형식: YYYYMMDD_HHMMSS
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const filename = `my-note-backup_${dateStr}_${timeStr}.json`;

    // JSON 문자열 생성
    const dataStr = JSON.stringify(notes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });

    // 다운로드 링크 생성
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // 성공 알림
    alert(`✅ 백업 완료!\n파일명: ${filename}\n메모 개수: ${notes.length}개`);
    console.log('메모 내보내기 성공:', filename);
  } catch (error) {
    // 실패 알림
    alert('❌ 백업 실패!\n오류가 발생했습니다.');
    console.error('메모 내보내기 실패:', error);
  }
}

// 메모 가져오기 (Import)
function importNotes(event) {
  const file = event.target.files[0];
  if (!file) return;

  // 파일 형식 검증
  if (!file.name.endsWith('.json')) {
    alert('❌ 잘못된 파일 형식!\nJSON 파일만 가져올 수 있습니다.');
    event.target.value = '';
    return;
  }

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const importedData = JSON.parse(e.target.result);

      // 데이터 유효성 검증
      if (!Array.isArray(importedData)) {
        throw new Error('올바른 메모 데이터가 아닙니다.');
      }

      // 복원 전 확인
      const confirmMsg = `📥 메모를 가져오시겠습니까?\n\n가져올 메모: ${importedData.length}개\n현재 메모: ${notes.length}개\n\n기존 메모는 유지되고, 새로운 메모가 추가됩니다.`;

      if (!confirm(confirmMsg)) {
        event.target.value = '';
        return;
      }

      // ID 중복 방지를 위해 새 ID 부여
      const importedNotes = importedData.map(note => ({
        ...note,
        id: Date.now() + Math.random(),
        date: note.date || new Date().toISOString()
      }));

      // 기존 메모에 추가
      notes = [...importedNotes, ...notes];
      saveNotes();
      displayNotes();

      // 성공 알림
      alert(`✅ 가져오기 완료!\n${importedNotes.length}개의 메모를 가져왔습니다.`);
      console.log('메모 가져오기 성공:', importedNotes.length);
    } catch (error) {
      // 실패 알림
      alert('❌ 가져오기 실패!\n파일 형식이 올바르지 않거나 손상되었습니다.');
      console.error('메모 가져오기 실패:', error);
    }

    // 파일 input 초기화
    event.target.value = '';
  };

  reader.onerror = () => {
    alert('❌ 파일 읽기 실패!\n파일을 읽을 수 없습니다.');
    event.target.value = '';
  };

  reader.readAsText(file);
}
