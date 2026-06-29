const output = document.getElementById("output");

// TEXT SHARE
function shareText() {
    const text = document.getElementById("textData").value;

    if (!text) {
        showToast("Enter something first 😅");
        return;
    }

    output.innerHTML = `
        <div class="result">
            <h3>Shared Data</h3>
            <p>${text}</p>
        </div>
    `;
}

// QR GENERATE
function generateQR() {
    const text = document.getElementById("textData").value;

    if (!text) {
        showToast("Enter text first!");
        return;
    }

    output.innerHTML = `<div id="qrBox" class="qr-animate"></div>`;

    new QRCode(document.getElementById("qrBox"), {
        text: text,
        width: 180,
        height: 180
    });
}

// FILE
function triggerFile() {
    document.getElementById("fileInput").click();
}

document.getElementById("fileInput").addEventListener("change", function () {
    const file = this.files[0];

    if (!file) return;

    const url = URL.createObjectURL(file);

    output.innerHTML = `
        <div class="result">
            <h3>${file.name}</h3>
            <a href="${url}" download>⬇ Download File</a>
        </div>
    `;
});

// TOAST
function showToast(msg) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = msg;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2000);
}
