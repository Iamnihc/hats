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
socket.on("err", x=>{
    alert("error");
    alert (x);
})
socket.on("users", x=> {
    document.getElementById("users").innerHTML="";
    x.forEach(element => {
        document.getElementById("users").innerHTML+=element[0] + " is "+ (element[1]?" ":" not ") + "ready"  + " and has " + (element[2]?" ":" Not ") + " Guessed the word. "+(element[3]?"online":"OFFLINE!!")+"<br>";
    });
    
    console.log(x);
});
socket.on("turnEnd", data=>{
    document.getElementById("typeArea").readOnly = false;
    if (data.drawingUser==username){
        document.getElementById("typeArea").readOnly=true;
    }
});
socket.on("begin", x=> {
    console.log(x)
}
);
window.onload= ()=>{
    document.getElementById("typeArea").oninput = function (v){
        socket.emit("typing", v.data)
    }
};

