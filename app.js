// PAGE SWITCH
function goto(page, el){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById("page-"+page).classList.add("active");

  document.querySelectorAll(".nav-item").forEach(n=>n.classList.remove("active"));
  if(el) el.classList.add("active");

 const titles = {
  home:"MyShare",
  quickshare:"Quick Share",
  qrconnect:"QR Connect",
  vault:"MyVault",
  profile:"Profile",
  settings:"Settings",
  howitworks:"About"
};

document.getElementById("topbarTitle").innerText =
titles[page] || page;

// COPY ROOM
function copyRoom(){
  const val = document.getElementById("roomCode").value;
  navigator.clipboard.writeText(val);
  toast("Room code copied!");
}
let notes =
JSON.parse(localStorage.getItem("notes")) || [];

function openNoteModal(){
  document.getElementById("noteOverlay").style.display="flex";
}

function closeNoteModal(){
  document.getElementById("noteOverlay").style.display="none";
}

function saveNote(){

  const title =
  document.getElementById("noteTitleInput").value;

  const content =
  document.getElementById("noteContentInput").value;

  if(!title){
    toast("Enter title");
    return;
  }

  notes.push({
    title,
    content,
    date:new Date().toLocaleString()
  });

  localStorage.setItem(
    "notes",
    JSON.stringify(notes)
  );

  renderNotes();

  closeNoteModal();

  toast("Saved");
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

function renderNotes(){

  const list =
  document.getElementById("noteList");

  if(!list) return;

  list.innerHTML="";

  notes.forEach(note=>{

    const div =
    document.createElement("div");

    div.className="note-card";

    div.innerHTML=`
      <h3>${note.title}</h3>
      <p>${note.content}</p>
      <small>${note.date}</small>
    `;

    list.appendChild(div);

  });

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
// LOGIN / SIGNUP

function switchForm(type){
  document.getElementById("loginForm").style.display =
    type === "login" ? "block" : "none";

  document.getElementById("signupForm").style.display =
    type === "signup" ? "block" : "none";
}

function doLogin(){

  const email = document.getElementById("lemail").value;

  if(!email){
    toast("Enter email");
    return;
  }

  const user = {
    name: email.split("@")[0],
    email: email
  };

  localStorage.setItem("user", JSON.stringify(user));

  updateUserUI();
  closeModal();

  toast("Login Successful");
}

function doSignup(){

  const name = document.getElementById("sname").value;
  const email = document.getElementById("semail").value;

  if(!name || !email){
    toast("Fill all fields");
    return;
  }

  const user = { name, email };

  localStorage.setItem("user", JSON.stringify(user));

  updateUserUI();

  closeModal();

  toast("Account Created");
}

function doGoogleLogin(){

  const user = {
    name: "Google User",
    email: "googleuser@gmail.com"
  };

  localStorage.setItem("user", JSON.stringify(user));

  updateUserUI();

  closeModal();

  toast("Google Login Success");
}

function logout(){

  localStorage.removeItem("user");

  location.reload();
}

window.onload = ()=>{

  genRoom();

  updateUserUI();

  renderNotes();

  goto("home");

};
function updateUserUI(){

  const user =
    JSON.parse(localStorage.getItem("user"));

  if(!user) return;

  document.getElementById("profileLoggedOut").style.display="none";
  document.getElementById("profileLoggedIn").style.display="block";

  document.getElementById("profileName").innerText=user.name;
  document.getElementById("profileEmail").innerText=user.email;

  document.getElementById("topbarLoginBtn").style.display="none";

}function filterNotes(text){

  const cards =
  document.querySelectorAll(".note-card");

  cards.forEach(card=>{

    card.style.display =
      card.innerText
      .toLowerCase()
      .includes(text.toLowerCase())
      ? "block"
      : "none";

  });

}function setActive(btn){

  document
  .querySelectorAll(".bnav-item")
  .forEach(x=>x.classList.remove("active"));

  btn.classList.add("active");

}
