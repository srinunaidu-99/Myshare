// ================= CONFIG =================
const BACKEND_URL = "https://your-backend-url.onrender.com";
const socket = io(BACKEND_URL);

let currentRoom = "";
let selectedFile = null;

// ================= UTIL =================
function now() {
  return new Date().toLocaleTimeString();
}

function toast(msg) {
  alert(msg);
}

// ================= ROOM =================
function joinRoom() {
  const code = document.getElementById("roomCode").value.trim().toUpperCase();

  if (!code) {
    toast("Enter room code");
    return;
  }

  currentRoom = code;
  socket.emit("joinRoom", code);

  toast("Connected to room " + code);
}

// ================= TEXT =================
function sendText() {
  const input = document.getElementById("msgInput");
  const msg = input.value.trim();

  if (!msg) return;

  socket.emit("sendText", {
    room: currentRoom,
    message: msg
  });

  addHistory("text", msg, now());
  input.value = "";
}

// Receive text
socket.on("receiveText", (msg) => {
  addHistory("text", msg, now());
});

// ================= FILE =================
function handleFile(e) {
  selectedFile = e.target.files[0];
}

async function sendFile() {
  if (!selectedFile) {
    toast("Select file first");
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    const res = await fetch(`${BACKEND_URL}/upload`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    socket.emit("sendFile", {
      room: currentRoom,
      fileName: data.fileName
    });

    addHistory("file", selectedFile.name, now());
    selectedFile = null;

  } catch (err) {
    console.error(err);
    toast("Upload failed");
  }
}

// Receive file
socket.on("receiveFile", (fileName) => {
  const link = `${BACKEND_URL}/uploads/${fileName}`;

  addHistory(
    "file",
    `<a href="${link}" target="_blank">Download File</a>`,
    now()
  );
});

// ================= HISTORY =================
function addHistory(type, content, time) {
  const box = document.getElementById("history");

  const div = document.createElement("div");
  div.className = "item";

  if (type === "text") {
    div.innerHTML = `<b>Text:</b> ${content} <span>${time}</span>`;
  } else {
    div.innerHTML = `<b>File:</b> ${content} <span>${time}</span>`;
  }

  box.prepend(div);
}

// ================= QR AUTO JOIN =================
window.onload = () => {
  const params = new URLSearchParams(window.location.search);
  const room = params.get("room");

  if (room) {
    document.getElementById("roomCode").value = room;
    joinRoom();
  }
};
