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
}


class hatsGame{
  users:Array<HatPlayer>=[]
  currentPlayer:HatPlayer;
  roundnum=0;
  currentWord:string;
  currentPic:string;
  public checkReady(){
    return this.users.every(element => element.isReady);
  }
  public round(){
    this.roundnum++;
    this.currentPlayer = this.users[this.roundnum%this.users.length];
    this.currentWord = words[Math.floor(Math.random() * words.length)]; 
    this.currentPic=""
    
  }
  public setup(){
    this.round()
  }
  public getGameInfo(){
    return {playing:this.currentPlayer.getSimple(), wordLength:this.currentWord.length, picture: this.currentPic};
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
  //console.log(hatGames[roomNum].users)
  return hatGames[roomNum].users.map(user=> [user.nickname, user.isReady]);
}

io.on('connection', function(socket){


  // wtff
  
  
  console.log("CONNECT!!");

  // old chat stuff
  socket.on('chat message', function(msg){
    //console.log("send");
    io.emit('chat message', msg);
  });

  // join a game
  socket.on("joinHats", data=>{
    console.log(data)
    if (hatUsers.find(x=> x.nickname == data[1]) ){
      socket.emit("err", "user already exists")
      return ;
    }
    hatUsers.push(new HatPlayer(socket.id, data[1]));
    socket.join(hatRef(data[0]))
    //console.log(data)
    findHatUser(socket.id).currentRoom=data[0];
    //console.log(hatGames[0].users);
    hatGames[data[0]].users.push(findHatUser(socket.id))
    
  })

  // player is ready
  socket.on("start", data=>{
    console.log(data)
    findHatUser(socket.id).isReady=true;
    //console.log(hatRef(data));
    //console.log(socket.rooms);
    //console.log(hatGames[0].users);
    io.to(hatRef(data)).emit("users", getPrettyUsers(data));
    if(getGame(socket.id).checkReady()){
      console.log("all ready")
      getGame(socket.id).setup();
      
      io.to(hatRef(data)).emit("begin", hatGames[data].getGameInfo() )
      io.to(hatGames[data].currentPlayer.socketid).emit(hatGames[data].currentWord)
    }
  })
  
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});

