var socket = io();
var username;
var isDrawer = false;
let word = "";
function joinRoom() {
  console.log("yep");
  username = document.getElementById("usernameBox").value;
  socket.emit("joinHats", [0, username]);
  return false;
}
function guess() {
  console.log("yep");
  playerGuess = document.getElementById("guessBox").value;
  socket.emit("checkword", playerGuess);
  return false;
}

function readyGame() {
  console.log("player is ready");
  socket.emit("start", 0);
}
socket.on("err", (x) => {
  alert("error");
  alert(x);
});
socket.on("users", (x) => {
  document.getElementById("users").innerHTML = "";
  x.forEach((element) => {
    document.getElementById("users").innerHTML +=
      element[0] +
      " is " +
      (element[1] ? " " : " not ") +
      "ready" +
      " and has " +
      (element[2] ? " " : " Not ") +
      " Guessed the word. " +
      (element[3] ? "online" : "OFFLINE!!") +
      "<br>";
  });

  console.log(x);
});
socket.on("begin", (data) => {
  console.log("round!");
  console.log(data);
  document.getElementById("typeArea").readOnly = true;
  isDrawer = false;
  document.getElementById("word").innerHTML = "_".repeat(data.wordLength);
  document.getElementById("currentArtist").innerHTML = data.playing.nickname;
  if (data.playing.nickname == username) {
    isDrawer = true;
    document.getElementById("typeArea").readOnly = false;
  }
});
socket.on("word", (x) => {
  word = x;
  document.getElementById("word").innerHTML = x;
  document.getElementById("currentArtist").innerHTML = "YOU!";
});

socket.on("typed", function (x) {
  if (isDrawer) {
  } else {
    document.getElementById("typeArea").value = x;
  }
});
socket.on("correct", function () {
  alert("you got it!");
});

banned = "abcdefghikmqrstyzABFGHKMPQRSTZ";
window.onload = () => {
  document.getElementById("typeArea").oninput = function (v) {
    banned.split("").forEach((char) => {
      document.getElementById("typeArea").value = document
        .getElementById("typeArea")
        .value.replace(char, "");
    });
    document.getElementById("typeArea");
    console.log(v);
    socket.emit("typing", document.getElementById("typeArea").value);
  };
};
