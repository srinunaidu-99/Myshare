/* ═══════════════════════════════════════
   STATE
═══════════════════════════════════════ */
let user = null;
let notes = JSON.parse(localStorage.getItem('ms_notes') || '[]');
let users = JSON.parse(localStorage.getItem('ms_users') || '[]');
let editingNoteId = null;
let currentRoom = 'ABCD1234';
let selectedFile = null;

const pageTitles = {
  quickshare: 'Quick Share',
  qrconnect: 'QR Connect',
  vault: 'MyVault',
  profile: 'Profile',
  settings: 'Settings',
  howitworks: 'About'
};

/* ═══════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════ */
function goto(id, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('topbarTitle').textContent = pageTitles[id] || '';
  if (id === 'vault') renderVault();
  if (id === 'profile') renderProfile();
  if (id === 'qrconnect') renderQRPage();
}

function setActive(el) {
  document.querySelectorAll('.bnav-item').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

/* ═══════════════════════════════════════
   ROOM
═══════════════════════════════════════ */
function joinRoom() {
  const code = document.getElementById('roomCode').value.trim().toUpperCase();
  if (!code) { toast('Enter a room code', 'err'); return; }
  currentRoom = code;
  document.getElementById('qrRoomCode').textContent = code;
  document.getElementById('qrPageCode').textContent = code;
  buildQR();
  toast('Joined room: ' + code, 'ok');
  addHistory('text', 'Joined room ' + code, now());
}

function genRoom() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  document.getElementById('roomCode').value = code;
  joinRoom();
}

function copyRoom() {
  const code = document.getElementById('roomCode').value || currentRoom;
  const url = location.href.split('?')[0] + '?room=' + code;
  navigator.clipboard.writeText(url).then(() => toast('Link copied! 📋', 'ok'));
}

/* ═══════════════════════════════════════
   QR CODE
═══════════════════════════════════════ */
function buildQR() {
  const url = location.href.split('?')[0] + '?room=' + currentRoom;
  const box = document.getElementById('qrBox');
  box.innerHTML = '';
  try {
    new QRCode(box, { text: url, width: 150, height: 150, colorDark: '#000', colorLight: '#fff', correctLevel: QRCode.CorrectLevel.M });
  } catch (e) {
    box.innerHTML = '<div style="color:#999;font-size:.75rem;text-align:center;padding:20px">' + currentRoom + '</div>';
  }
}

function renderQRPage() {
  const url = location.href.split('?')[0] + '?room=' + currentRoom;
  document.getElementById('qrPageCode').textContent = currentRoom;
  const box = document.getElementById('qrPageBox');
  box.innerHTML = '';
  try {
    new QRCode(box, { text: url, width: 190, height: 190, colorDark: '#000', colorLight: '#fff', correctLevel: QRCode.CorrectLevel.M });
  } catch (e) {
    box.innerHTML = '<div style="color:#999;font-size:.8rem;padding:20px">' + currentRoom + '</div>';
  }
}

/* ═══════════════════════════════════════
   SHARE
═══════════════════════════════════════ */
function sendText() {
  const msg = document.getElementById('msgInput').value.trim();
  if (!msg) { toast('Type a message first', 'err'); return; }
  document.getElementById('msgInput').value = '';
  addHistory('text', msg, now());
  toast('Message sent! ✈️', 'ok');
  setTimeout(() => simulateReply(), 900 + Math.random() * 600);
}

const autoReplies = ['Got it! 👍', 'Received ✅', 'Thanks!', 'On it!', '📥 Copied'];
function simulateReply() {
  addHistory('text', autoReplies[Math.floor(Math.random() * autoReplies.length)], now());
}

function selectFile(input) {
  if (input.files[0]) {
    selectedFile = input.files[0];
    document.getElementById('fileLabel').textContent = selectedFile.name + '  ✕';
  }
}

function sendFile() {
  if (!selectedFile) { toast('Choose a file first', 'err'); return; }
  const sizeStr = fmtSize(selectedFile.size);
  addHistory('file', selectedFile.name + ' &nbsp;<span style="color:var(--muted);font-size:.75rem">' + sizeStr + '</span>', now());
  toast('File sent! 📂', 'ok');
  selectedFile = null;
  document.getElementById('fileLabel').textContent = 'Choose file';
  document.getElementById('fileInput').value = '';
}

function addHistory(type, content, time) {
  const list = document.getElementById('historyList');
  const el = document.createElement('div');
  el.className = 'history-item';
  el.innerHTML = `<span class="history-badge badge-${type}">${type === 'text' ? 'Text' : 'File'}</span>
    <span class="history-content">${content}</span>
    <span class="history-time">${time}</span>`;
  list.appendChild(el);
  list.scrollTop = list.scrollHeight;
}

function fmtSize(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* ═══════════════════════════════════════
   AUTH
═══════════════════════════════════════ */
function openModal(type) {
  document.getElementById('authOverlay').classList.add('open');
  switchForm(type);
}

function closeModal() {
  document.getElementById('authOverlay').classList.remove('open');
}

function switchForm(type) {
  document.getElementById('loginForm').style.display  = type === 'login'  ? '' : 'none';
  document.getElementById('signupForm').style.display = type === 'signup' ? '' : 'none';
}

function doLogin() {
  const email = document.getElementById('lemail').value.trim();
  const pass  = document.getElementById('lpass').value;
  if (!email || !pass) { toast('Fill in all fields', 'err'); return; }
  const u = users.find(u => u.email === email && u.pass === pass);
  if (!u) { toast('Wrong email or password', 'err'); return; }
  setUser(u);
  closeModal();
  toast('Welcome back, ' + u.name + '! 👋', 'ok');
}

function doSignup() {
  const name  = document.getElementById('sname').value.trim();
  const email = document.getElementById('semail').value.trim();
  const pass  = document.getElementById('spass').value;
  if (!name || !email || !pass) { toast('Fill in all fields', 'err'); return; }
  if (pass.length < 6) { toast('Password min 6 chars', 'err'); return; }
  if (users.find(u => u.email === email)) { toast('Email already used', 'err'); return; }
  const u = { name, email, pass };
  users.push(u);
  localStorage.setItem('ms_users', JSON.stringify(users));
  setUser(u);
  closeModal();
  toast('Account created! Welcome 🎉', 'ok');
}

function doGoogleLogin() {
  const u = { name: 'John Doe', email: 'john@gmail.com', pass: 'google' };
  if (!users.find(x => x.email === u.email)) {
    users.push(u);
    localStorage.setItem('ms_users', JSON.stringify(users));
  }
  setUser(u);
  closeModal();
  toast('Logged in with Google ✅', 'ok');
}

function setUser(u) {
  user = u;
  const init = initials(u.name);
  const col  = pickColor(u.name);
  // Sidebar
  document.getElementById('sidebarUserRow').style.display = 'flex';
  document.getElementById('sidebarLoginBtn').style.display = 'none';
  document.getElementById('sidebarAva').textContent = init;
  document.getElementById('sidebarAva').style.background = col;
  document.getElementById('sidebarName').textContent = u.name;
  document.getElementById('sidebarEmail').textContent = u.email;
  // Topbar
  document.getElementById('topbarUserArea').style.display = 'flex';
  document.getElementById('topbarLoginBtn').style.display = 'none';
  document.getElementById('topbarAva').textContent = init;
  document.getElementById('topbarName').textContent = u.name;
  document.getElementById('topbarEmail').textContent = u.email;
  // Mobile
  document.getElementById('mLoginBtn').style.display = 'none';
  renderVault();
  renderProfile();
}

function logout() {
  user = null;
  document.getElementById('sidebarUserRow').style.display = 'none';
  document.getElementById('sidebarLoginBtn').style.display = '';
  document.getElementById('topbarUserArea').style.display = 'none';
  document.getElementById('topbarLoginBtn').style.display = '';
  document.getElementById('mLoginBtn').style.display = '';
  document.getElementById('vaultLocked').style.display = 'flex';
  document.getElementById('vaultOpen').style.display = 'none';
  document.getElementById('profileLoggedOut').style.display = '';
  document.getElementById('profileLoggedIn').style.display = 'none';
  toast('Logged out', 'ok');
}

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const clrs = ['#7c3aed','#06b6d4','#f59e0b','#ef4444','#10b981','#6366f1'];
function pickColor(s) {
  let h = 0;
  for (let c of s) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return clrs[Math.abs(h) % clrs.length];
}

/* ═══════════════════════════════════════
   VAULT
═══════════════════════════════════════ */
function renderVault() {
  if (!user) {
    document.getElementById('vaultLocked').style.display = 'flex';
    document.getElementById('vaultOpen').style.display = 'none';
    return;
  }
  document.getElementById('vaultLocked').style.display = 'none';
  document.getElementById('vaultOpen').style.display = 'flex';
  renderNoteList(notes.filter(n => n.user === user.email));
}

function renderNoteList(list) {
  const el = document.getElementById('noteList');
  if (!list.length) {
    el.innerHTML = '<div style="text-align:center;padding:32px;color:var(--muted);font-size:.875rem">Your vault is empty.<br>Tap <strong>+ New Note</strong> to add one.</div>';
    return;
  }
  el.innerHTML = list.map(n => `
    <div class="note-card" onclick="editNote(${n.id})">
      <div class="note-card-top">
        <div class="note-card-title">${esc(n.title || 'Untitled')}</div>
        <div style="display:flex;align-items:center;gap:6px">
          <div class="note-card-date">${n.date}</div>
          <button class="note-card-actions" onclick="event.stopPropagation();deleteNote(${n.id})">⋮</button>
        </div>
      </div>
      <div class="note-card-body">${esc(n.content || '')}</div>
    </div>`).join('');
}

function filterNotes(q) {
  if (!user) return;
  const all = notes.filter(n => n.user === user.email);
  const filtered = q ? all.filter(n => (n.title + n.content).toLowerCase().includes(q.toLowerCase())) : all;
  renderNoteList(filtered);
}

function openNoteModal(id) {
  editingNoteId = id || null;
  const note = id ? notes.find(n => n.id === id) : null;
  document.getElementById('noteModalTitle').textContent = id ? 'Edit Note' : 'New Note';
  document.getElementById('noteTitleInput').value = note ? note.title : '';
  document.getElementById('noteContentInput').value = note ? note.content : '';
  document.getElementById('noteOverlay').classList.add('open');
}

function closeNoteModal() {
  document.getElementById('noteOverlay').classList.remove('open');
}

function editNote(id) { openNoteModal(id); }

function saveNote() {
  if (!user) { toast('Login first', 'err'); return; }
  const title   = document.getElementById('noteTitleInput').value.trim();
  const content = document.getElementById('noteContentInput').value.trim();
  if (!title && !content) { toast('Add a title or content', 'err'); return; }
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  if (editingNoteId) {
    const i = notes.findIndex(n => n.id === editingNoteId);
    if (i >= 0) notes[i] = { ...notes[i], title, content, date: dateStr };
  } else {
    notes.unshift({ id: Date.now(), title, content, user: user.email, date: dateStr });
  }
  localStorage.setItem('ms_notes', JSON.stringify(notes));
  closeNoteModal();
  renderVault();
  toast(editingNoteId ? 'Note updated ✅' : 'Saved to vault! 🔐', 'ok');
  editingNoteId = null;
}

function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  localStorage.setItem('ms_notes', JSON.stringify(notes));
  renderVault();
  toast('Note deleted', 'ok');
}

/* ═══════════════════════════════════════
   PROFILE
═══════════════════════════════════════ */
function renderProfile() {
  if (!user) {
    document.getElementById('profileLoggedOut').style.display = '';
    document.getElementById('profileLoggedIn').style.display = 'none';
    return;
  }
  document.getElementById('profileLoggedOut').style.display = 'none';
  document.getElementById('profileLoggedIn').style.display = 'block';
  document.getElementById('profileAva').textContent = initials(user.name);
  document.getElementById('profileAva').style.background = pickColor(user.name);
  document.getElementById('profileName').textContent = user.name;
  document.getElementById('profileEmail').textContent = user.email;
}

/* ═══════════════════════════════════════
   TOAST
═══════════════════════════════════════ */
function toast(msg, type = 'ok') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = (type === 'ok' ? '✅' : '❌') + ' ' + msg;
  document.getElementById('toastArea').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ═══════════════════════════════════════
   INIT
═══════════════════════════════════════ */
window.addEventListener('load', () => {
  ['authOverlay', 'noteOverlay'].forEach(id => {
    document.getElementById(id).addEventListener('click', e => {
      if (e.target.id === id) e.target.classList.remove('open');
    });
  });
  const p = new URLSearchParams(location.search);
  if (p.get('room')) {
    document.getElementById('roomCode').value = p.get('room');
    joinRoom();
  } else {
    buildQR();
  }
});// Connect to your deployed server (change localhost to your actual URL when deployed)
const socket = io("http://localhost:5000"); 

// Join a room (when QR is scanned or code is entered)
function joinRoom(roomCode) {
    socket.emit("join-room", roomCode);
    console.log("Joined room:", roomCode);
}

// Send a message
function sendTextMessage(message, roomCode) {
    socket.emit("send-message", { room: roomCode, text: message });
}

// Listen for incoming messages
socket.on("receive-message", (data) => {
    console.log("Message received:", data.text);
    // Add your UI logic here to display the message
    toast("New message: " + data.text, "ok");
});

// File sending logic (convert file to Base64 to send over socket)
function sendFile(file, roomCode) {
    const reader = new FileReader();
    reader.onload = () => {
        socket.emit("send-file", { 
            room: roomCode, 
            fileName: file.name, 
            fileData: reader.result 
        });
    };
    reader.readAsDataURL(file);
}

socket.on("receive-file", (data) => {
    // Logic to create a download link for the received file
    console.log("File received:", data.fileName);
    const link = document.createElement("a");
    link.href = data.fileData;
    link.download = data.fileName;
    link.click();
});

