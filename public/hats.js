var socket = io();
var username;
function joinRoom(){
    console.log("yep")
    username = document.getElementById("usernameBox").value;
    socket.emit("joinHats",[0,username])
    return false;
}


function readyGame(){
    console.log("player is ready");
    socket.emit("start", 0);
}

socket.on("users", x=> {
    console.log(x);
});
socket.on("turnEnd", data=>{
    document.getElementById("typeArea").readOnly = false;
    if (data.drawingUser==username){
        document.getElementById("typeArea").readOnly=true;
    }
});

window.onload= ()=>{





};