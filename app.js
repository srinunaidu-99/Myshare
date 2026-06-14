// PAGE SWITCH
function goto(page, el){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById("page-"+page).classList.add("active");

  document.querySelectorAll(".nav-item").forEach(n=>n.classList.remove("active"));
  if(el) el.classList.add("active");

  document.getElementById("topbarTitle").innerText = page.toUpperCase();
}

// COPY ROOM
function copyRoom(){
  const val = document.getElementById("roomCode").value;
  navigator.clipboard.writeText(val);
  toast("Room code copied!");
}

// TOAST
function toast(msg){
  const t = document.createElement("div");
  t.innerText = msg;
  t.style.background="#333";
  t.style.padding="10px";
  t.style.margin="5px";
  document.getElementById("toastArea").appendChild(t);
  setTimeout(()=>t.remove(),2000);
}

// SEND TEXT
function sendText(){
  const msg = document.getElementById("msgInput").value;
  if(!msg) return;

  addHistory("Text", msg);
  document.getElementById("msgInput").value="";
}

// FILE
let selectedFile=null;

function selectFile(input){
  selectedFile = input.files[0];
  document.getElementById("fileLabel").innerText = selectedFile.name;
}

function sendFile(){
  if(!selectedFile) return;
  addHistory("File", selectedFile.name);
}

// HISTORY
function addHistory(type, content){
  const div = document.createElement("div");
  div.className="history-item";
  div.innerHTML = `
    <span>${type}</span>
    <span>${content}</span>
  `;
  document.getElementById("historyList").appendChild(div);
}

// QR GENERATE
function genRoom(){
  const code = Math.random().toString(36).substring(2,8).toUpperCase();
  document.getElementById("roomCode").value = code;
  document.getElementById("qrRoomCode").innerText = code;
  document.getElementById("qrPageCode").innerText = code;

  document.getElementById("qrBox").innerHTML="";
  new QRCode(document.getElementById("qrBox"), code);

  document.getElementById("qrPageBox").innerHTML="";
  new QRCode(document.getElementById("qrPageBox"), code);
}

// JOIN ROOM
function joinRoom(){
  toast("Joined room!");
}

// LOGIN
function openModal(){
  document.getElementById("authOverlay").style.display="flex";
}
function closeModal(){
  document.getElementById("authOverlay").style.display="none";
}

// INIT
window.onload = ()=>{
  genRoom();
};
