var socket = io();


function joinRoom(){
    console.log("yep")
    socket.emit("joinhats",0)
    return false;
}