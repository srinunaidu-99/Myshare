function shareText() {
  const text = document.getElementById("textInput").value;
  const output = document.getElementById("output");

  if (text.trim() === "") {
    alert("Enter something!");
    return;
  }

  output.style.display = "block";
  output.innerText = text;
}

function generateQR() {
  const text = document.getElementById("textInput").value;

  if (text.trim() === "") {
    alert("Enter text for QR!");
    return;
  }

  const canvas = document.getElementById("qrCanvas");

  QRCode.toCanvas(canvas, text, function (error) {
    if (error) console.error(error);
  });
}
