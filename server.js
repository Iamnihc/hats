"use strict";
exports.__esModule = true;
var users;
var words = ["hat", "person"];
var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require("socket.io")(http);
var port = process.env.PORT || 3000;
app.use(express.static('public'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
function createRoom() {
    hatGames.push(new hatsGame());
}
var hatUsers = [];
function findHatUser(id) {
    //console.log(id);
    return hatUsers.find(function (x) { return x.socketid == id; });
}
var HatPlayer = /** @class */ (function () {
    function HatPlayer(id, nick) {
        this.isReady = false;
        this.playing = false;
        this.points = 0;
        this.socketid = id;
        this.nickname = nick;
    }
    HatPlayer.prototype.getGame = function () {
        return hatGames[this.currentRoom];
    };
    return HatPlayer;
}());
var hatsGame = /** @class */ (function () {
    function hatsGame() {
        this.users = [];
    }
    hatsGame.prototype.checkReady = function () {
        return this.users.forEach(function (element) {
            element.isReady = true;
        });
    };
    hatsGame.prototype.getGameInfo = function () {
        return [this.currentPlayer, this.currentWord, this.currentPic];
    };
    return hatsGame;
}());
function hatRef(num) {
    return "hats" + num.toString();
}
var hatGames = [];
createRoom();
function getGame(id) {
    console.log(findHatUser(id).currentRoom);
    return hatGames[findHatUser(id).currentRoom];
}
function getPrettyUsers(roomNum) {
    //console.log(roomNum)
    return hatGames[roomNum].users.map(function (user) { return [user.name, user.ready]; });
}
io.on('connection', function (socket) {
    console.log("CONNECT!!");
    // old chat stuff
    socket.on('chat message', function (msg) {
        console.log("send");
        io.emit('chat message', msg);
    });
    // join a game
    socket.on("joinHats", function (data) {
        hatUsers.push(new HatPlayer(socket.id, data[1]));
        socket.join(hatRef(data));
        //console.log(data)
        findHatUser(socket.id).currentRoom = data[0];
        //console.log(hatGames[0].users);
        hatGames[data[0]].users.push(findHatUser(socket.id));
    });
    // player is ready
    socket.on("start", function (data) {
        //console.log(data)
        findHatUser(socket.id).isready = true;
        console.log(hatRef(data));
        io.to(hatRef(data)).send("users", getPrettyUsers(data));
        if (getGame(socket.id).checkReady()) {
            socket.to(hatRef(data)).emit("begin", hatsGame[data].getGameInfo());
        }
    });
});
http.listen(port, function () {
    console.log('listening on *:' + port);
});
