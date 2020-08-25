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
    return hatsGame;
}());
var hatGames = [];
io.on('connection', function (socket) {
    hatUsers.push(new HatPlayer(socket.id));
    console.log("CONNECT!!");
    socket.on('chat message', function (msg) {
        console.log("send");
        io.emit('chat message', msg);
    });
    socket.on("joinhats", function (data) {
        socket.join("hats" + data);
        hatGames[data] += 1;
    });
    socket.on("start", function (data) {
        findHatUser(socket.id).isready = true;
    });
});
http.listen(port, function () {
    console.log('listening on *:' + port);
});
