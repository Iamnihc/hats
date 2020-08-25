var socket = io();
window.onload= ()=>{
const username;
function joinRoom(){
    console.log("yep")
    username = document.getElementById("usernameBox").value;
    socket.emit("joinhats",[0,username])
    return false;
}

function ready(){
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


};