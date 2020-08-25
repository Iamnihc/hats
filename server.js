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
    hatGames.push(new hatsGame);
}
var hatUsers = [];
function findHatUser(id) {
    return hatUsers.find(function (x) { return x.socketid == id; });
}
var HatPlayer = /** @class */ (function () {
    function HatPlayer(id) {
        this.isready = false;
        this.playing = false;
        this.points = 0;
        this.socketid = id;
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
        return users.forEach(function (element) {
            element.ready = true;
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
function getGame(id) {
    return hatGames[findHatUser(id).currentRoom];
}
function getPrettyUsers(roomNum) {
    return hatGames[roomNum].map(function (user) { return [user.name, user.ready]; });
}
io.on('connection', function (socket) {
    hatUsers.push(new HatPlayer(socket.id));
    console.log("CONNECT!!");
    // old chat stuff
    socket.on('chat message', function (msg) {
        console.log("send");
        io.emit('chat message', msg);
    });
    // join a game
    socket.on("joinhats", function (data) {
        socket.join(hatRef(data));
        findHatUser(socket.id).currentRoom = data;
        hatGames[data].users.push(findHatUser(socket.id));
        console.log(hatGames[data]);
    });
    // player is ready
    socket.on("start", function (data) {
        findHatUser(socket.id).isready = true;
        io.to(hatRef(data)).send("users", getPrettyUsers(data));
        if (getGame(socket.id).checkReady()) {
            socket.to(hatRef(data)).emit("begin");
        }
    });
});
http.listen(port, function () {
    console.log('listening on *:' + port);
});
