var users
const words = ["hat","person"]
import * as express from "express";
import * as socketio from "socket.io";
const app = express();
var http = require('http').Server(app);
let io = require("socket.io")(http);
var port = process.env.PORT || 3001;
app.use(express.static('public'))
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


function createRoom(){
  hatGames.push(new hatsGame())
}
var hatUsers = [];

function findHatUser(id){
  //console.log(id);
  return hatUsers.find(x=>x.socketid==id)
}

class HatPlayer{
  public isReady=false;
  private socketid:string;
  public playing=false;
  public points=0;
  public currentRoom:number;
  public nickname:string;
  public guessed = false;
  public online = true;
  constructor(id:string, nick:string){
    this.socketid=id;
    this.nickname=nick;
  }
  public getGame(){
    return hatGames[this.currentRoom];
  }
  public getSimple(){
    return {nickname:this.nickname, ready: this.isReady, playing:this.playing, points:this.points, room:this.currentRoom}
  }
  public resetiD(id){
    this.socketid=id;
  }
}


class hatsGame{
  private users:Array<HatPlayer>=[]
  public currentPlayer:HatPlayer;
  roundnum=0;
  private currentWord:string;
  public currentPic:string;
  public started = false;
  public checkReady(){
    return this.users.every(element => element.isReady||!element.online);
  }
  public round(){
    this.roundnum++;
    this.currentPlayer = this.users[this.roundnum%this.users.length];
    this.currentWord = words[Math.floor(Math.random() * words.length)]; 
    this.currentPic="";
    this.resetGuess();
    this.currentPlayer.guessed= true;
    
  }
  public setup(){
    this.round()
  }
  public getGameInfo(){
    return {playing:this.currentPlayer.getSimple(), wordLength:this.currentWord.length, picture: this.currentPic};
  }
  public allGuessed(){
    return users.every(x=> x.guessed || !x.online)
  }
  public resetGuess(){
    this.users.forEach(element => {
      element.guessed=false;
    });
  }

}

function hatRef(num){
  return "hats"+num.toString()
}
var hatGames = [];
createRoom();
function getGame(id){
  //console.log(findHatUser(id).currentRoom);
  return hatGames[findHatUser(id).currentRoom];
}

function getPrettyUsers(roomNum){
  //console.log("pretty users",hatGames[roomNum].users.map(user=> [user.nickname, user.isReady, user.guessed]))
  return hatGames[roomNum].users.map(user=> [user.nickname, user.isReady, user.guessed, user.online]);
}

io.on('connection', function(socket){
  
  console.log("CONNECT!!");

  // old chat stuff
  socket.on('chat message', function(msg){
    //console.log("send");
    io.emit('chat message', msg);
  });

  // join a game
  socket.on("joinHats", data=>{
    console.log(data)
    if (hatUsers.find(x=> x.nickname == data[1])){

      if (hatUsers.find(x=> x.nickname == data[1]).onlne){
        socket.emit("err", "user already exists and is online")
        return ;
      }
      else{
        socket.join(hatRef(data[0]));
        hatUsers.find(x=> x.nickname == data[1]).online = true;
        hatUsers.find (x=> x.nickname == data[1]).resetiD(socket.id);
        io.to(hatRef(data[0])).emit("users", getPrettyUsers(data[0]));
        return;
      }
    }
    hatUsers.push(new HatPlayer(socket.id, data[1]));
    findHatUser(socket.id).online = true;
    socket.join(hatRef(data[0]))
    //console.log(data)
    findHatUser(socket.id).currentRoom=data[0];
    //console.log(hatGames[0].users);
    hatGames[data[0]].users.push(findHatUser(socket.id))
    io.to(hatRef(data[0])).emit("users", getPrettyUsers(data[0]));
  })

  // player is ready
  socket.on("start", data=>{
    console.log(data)
    if (hatGames[data].started){
      socket.emit("err", "This game is already in progress. get ready later!")
      return false;
    }
    findHatUser(socket.id).isReady=true;
    io.to(hatRef(data)).emit("users", getPrettyUsers(data));
    if(getGame(socket.id).checkReady()){
      console.log("all ready")
      getGame(socket.id).setup();
      io.to(hatRef(data)).emit("begin", hatGames[data].getGameInfo() )
      io.to(hatGames[data].currentPlayer.socketid).emit("Word", hatGames[data].currentWord);
    }
  })
  socket.on("checkword", word=>{
    if (findHatUser(socket.id).getGame().checkWord(word)){
      findHatUser(socket.id).getGame().guessed = true;
    }
  })
  socket.on('disconnect', (reason) => {
    if (findHatUser(socket.id)){
      findHatUser(socket.id).online = false;
      io.to(hatRef(findHatUser(socket.id).currentRoom)).emit("users", getPrettyUsers(findHatUser(socket.id).currentRoom));
    }

  });

});

http.listen(port, function(){
  console.log('listening on *:' + port);
});

