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

  // 설정 버튼
  const settingsBtn = document.getElementById('settingsBtn');
  settingsBtn.addEventListener('click', openSettings);
}

// ==================== 메모 데이터 관리 ====================
let notes = [];

// LocalStorage에서 메모 불러오기
function loadNotes() {
  const savedNotes = localStorage.getItem('myNotes');
  if (savedNotes) {
    notes = JSON.parse(savedNotes);
    displayNotes(notes);
  }
}

// LocalStorage에 메모 저장
function saveNotes() {
  localStorage.setItem('myNotes', JSON.stringify(notes));
}

// ==================== 메모 표시 ====================
function displayNotes(notesToDisplay) {
  const notesList = document.getElementById('notesList');
  notesList.innerHTML = '';

  if (notesToDisplay.length === 0) {
    notesList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); margin-top: 2rem;">메모가 없습니다. 새 메모를 추가해보세요!</p>';
    return;
  }

  notesToDisplay.forEach(note => {
    const noteCard = createNoteCard(note);
    notesList.appendChild(noteCard);
  });
}

// 메모 카드 생성
function createNoteCard(note) {
  const card = document.createElement('div');
  card.className = 'note-card';
  card.dataset.id = note.id;

  const title = document.createElement('h3');
  title.textContent = note.title || '제목 없음';

  const content = document.createElement('p');
  content.textContent = note.content || '';

  card.appendChild(title);
  card.appendChild(content);

  // 클릭 이벤트
  card.addEventListener('click', () => openNote(note.id));

  return card;
}

// ==================== 메모 CRUD 기능 ====================
// 새 메모 생성
function createNewNote() {
  const newNote = {
    id: Date.now(),
    title: '새 메모',
    content: '',
    date: new Date().toISOString()
  };

  notes.unshift(newNote);
  saveNotes();
  displayNotes(notes);

  console.log('새 메모 생성:', newNote.id);
}

// 메모 열기
function openNote(id) {
  console.log('메모 열기:', id);
  // TODO: 메모 상세보기 화면 구현 예정
}

// ==================== 검색 기능 ====================
function searchNotes(e) {
  const searchTerm = e.target.value.toLowerCase();

  const filteredNotes = notes.filter(note => {
    const titleMatch = note.title.toLowerCase().includes(searchTerm);
    const contentMatch = note.content.toLowerCase().includes(searchTerm);
    return titleMatch || contentMatch;
  });

  displayNotes(filteredNotes);
}

// ==================== 설정 ====================
function openSettings() {
  console.log('설정 열기');
  // TODO: 설정 모달 구현 예정
}
