// ==================== 전역 변수 ====================
let notes = [];
let currentNoteId = null;
let showOnlyImportant = false;

// ==================== 초기화 ====================
document.addEventListener('DOMContentLoaded', () => {
  console.log('my note 앱 시작');

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

  const deleteNoteBtn = document.getElementById('deleteNoteBtn');
  deleteNoteBtn.addEventListener('click', deleteCurrentNote);

  // 모달 배경 클릭 시 닫기
  const modal = document.getElementById('noteModal');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
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

  const title = document.createElement('h3');
  title.textContent = note.title || '제목 없음';
  title.addEventListener('click', () => openNote(note.id));

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
  cardContent.addEventListener('click', () => openNote(note.id));

  const content = document.createElement('p');
  content.textContent = note.content || '';

  cardContent.appendChild(content);

  card.appendChild(cardHeader);
  card.appendChild(cardContent);

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

// 현재 메모 삭제
function deleteCurrentNote() {
  if (!currentNoteId) return;

  if (confirm('이 메모를 삭제하시겠습니까?')) {
    notes = notes.filter(n => n.id !== currentNoteId);
    saveNotes();
    displayNotes();
    closeModal();
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

// ==================== 설정 ====================
function openSettings() {
  console.log('설정 열기');
  // TODO: 설정 모달 구현 예정 (3단계 이후)
}
