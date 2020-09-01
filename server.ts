var users


import * as dataJSON from './words.json';
const words = dataJSON.words;
import express from "express";
import socketio from "socket.io";
const app = express();
var http = require("http").Server(app);
let io = socketio(http);
var port = process.env.PORT || 3001;
app.use(express.static("public"));
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

function createRoom() {
  hatGames.push(new hatsGame())
}
var hatUsers = [];

function findHatUser(id) {
  //console.log(id);
  return hatUsers.find(x => x.socketid == id)
}

class HatPlayer {
  public isReady = false;
  private socketid: string;
  public playing = false;
  public points = 0;
  public currentRoom: number;
  public nickname: string;
  public guessed = false;
  public online = true;
  constructor(id: string, nick: string) {
    this.socketid = id;
    this.nickname = nick;
  }
  public getGame() {
    return hatGames[this.currentRoom];
  }
  public getSimple() {
    return { nickname: this.nickname, ready: this.isReady, playing: this.playing, points: this.points, room: this.currentRoom }
  }
  public resetiD(id) {
    this.socketid = id;
  }
}


class hatsGame {
  private users: Array<HatPlayer> = []
  public currentPlayer: HatPlayer;
  roundnum = 0;
  private currentWord: string;
  public currentPic: string;
  public started = false;
  public checkReady() {
    return this.users.every(element => element.isReady || !element.online);
  }
  public round() {

    this.roundnum++;
    this.resetPlaying();
    this.resetGuess();
    //console.log("user is "+this.roundnum%this.users.length);
    this.currentPlayer = this.users[this.roundnum % this.users.length];
    this.currentWord = words[Math.floor(Math.random() * words.length)];
    this.currentPic = "";

    this.currentPlayer.guessed = true;
    this.currentPlayer.playing = true;
    console.log(this.getGameInfo());
  }
  public setup() {
    this.round()
  }
  public getGameInfo() {
    return { playing: this.currentPlayer.getSimple(), wordLength: this.currentWord.length, picture: this.currentPic };
  }
  public allGuessed() {

    return this.users.every(x => {
      //console.log(x.guessed);
      return x.guessed || !x.online
    }
    )

  }
  public resetGuess() {
    this.users.forEach(element => {

      element.guessed = false;
    });
  }
  public resetPlaying() {
    this.users.forEach(element => {
      element.playing = false;
    });
  }
  public checkWord(word) {
    return word == this.currentWord;
  }

}

function hatRef(num) {
  return "hats" + num.toString()
}
var hatGames = [];
createRoom();
function getGame(id) {
  //console.log(findHatUser(id).currentRoom);
  return hatGames[findHatUser(id).currentRoom];
}

function getPrettyUsers(roomNum) {
  //console.log("pretty users",hatGames[roomNum].users.map(user=> [user.nickname, user.isReady, user.guessed]))
  return hatGames[roomNum].users.map(user => [user.nickname, user.isReady, user.guessed, user.online]);
}

io.on('connection', function (socket) {
  let realplayer = false;
  console.log("CONNECT!!");

  // old chat stuff
  socket.on('chat message', function (msg) {
    //console.log("send");
    io.emit('chat message', msg);
  });

  // join a game
  socket.on("joinHats", data => {

    //console.log(data)
    if (hatUsers.find(x => x.nickname == data[1])) {

      if (hatUsers.find(x => x.nickname == data[1]).onlne) {
        socket.emit("err", "user already exists and is online")
        return;
      }
      else {
        socket.join(hatRef(data[0]));
        hatUsers.find(x => x.nickname == data[1]).online = true;
        hatUsers.find(x => x.nickname == data[1]).resetiD(socket.id);
        io.to(hatRef(data[0])).emit("users", getPrettyUsers(data[0]));
        realplayer = true;
        return;
      }
    }
    hatUsers.push(new HatPlayer(socket.id, data[1]));
    findHatUser(socket.id).online = true;
    socket.join(hatRef(data[0]))
    //console.log(data)
    findHatUser(socket.id).currentRoom = data[0];
    //console.log(hatGames[0].users);
    hatGames[data[0]].users.push(findHatUser(socket.id))
    io.to(hatRef(data[0])).emit("users", getPrettyUsers(data[0]));
    realplayer = true;
  })

  // player is ready
  socket.on("start", data => {
    if (!realplayer) {
      return;
    }
    //console.log(data)
    if (hatGames[data].started) {
      socket.emit("err", "This game is already in progress. get ready later!")
      return false;
    }
    findHatUser(socket.id).isReady = true;
    io.to(hatRef(data)).emit("users", getPrettyUsers(data));
    if (getGame(socket.id).checkReady()) {
      //console.log("all ready")
      getGame(socket.id).round();
      io.to(hatRef(data)).emit("begin", hatGames[data].getGameInfo())
      io.to(hatGames[data].currentPlayer.socketid).emit("word", hatGames[data].currentWord);
    }
  })
  socket.on("checkword", word => {
    if (!realplayer) {
      return;
    }
    if (getGame(socket.id).checkWord(word)) {
      findHatUser(socket.id).guessed = true;
      socket.emit("correct")

      if (getGame(socket.id).allGuessed()) {
        getGame(socket.id).round();
        console.log("all guess");
        console.log(getGame(socket.id).currentPlayer);
        console.log("info");
        console.log(getGame(socket.id).getGameInfo())
        io.to(hatRef(findHatUser(socket.id).currentRoom)).emit("begin", hatGames[0].getGameInfo());
        io.to(getGame(socket.id).currentPlayer.socketid).emit("word", getGame(socket.id).currentWord);


      }
    }
  });
  socket.on("typing", text => {
    if (!realplayer) {
      return;
    }
    //console.log(text);
    if (findHatUser(socket.id).playing) {
      io.to(hatRef(findHatUser(socket.id).currentRoom)).emit("typed", text)
    }
    else {
      console.log("we got a cheater i think")
    }
  })
  socket.on('disconnect', (reason) => {
    if (findHatUser(socket.id)) {
      findHatUser(socket.id).online = false;

      findHatUser(socket.id).isReady = false;
      io.to(hatRef(findHatUser(socket.id).currentRoom)).emit("users", getPrettyUsers(findHatUser(socket.id).currentRoom));
    }

  });

});

http.listen(port, function () {
  console.log('listening on *:' + port);
});

