var users
const words = ["hat","person"]
import * as express from "express";
import * as socketio from "socket.io";
const app = express();
var http = require('http').Server(app);
let io = require("socket.io")(http);
var port = process.env.PORT || 3000;
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
  public socketid:string;
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
}

class hatsGame{
  users:Array<HatPlayer>=[]
  currentPlayer:HatPlayer;
  currentWord:string;
  currentPic:string;
  public checkReady(){
    return this.users.forEach(element => {
      element.isReady=true;
    });
  }

  public getGameInfo(){
    return [this.currentPlayer,this.currentWord, this.currentPic]
  }

}
function hatRef(num){
  return "hats"+num.toString()
}
var hatGames = [];
createRoom();
function getGame(id){
  console.log(findHatUser(id).currentRoom);
  return hatGames[findHatUser(id).currentRoom];
}

function getPrettyUsers(roomNum){
  //console.log(roomNum)
  return hatGames[roomNum].users.map(user=> [user.name, user.ready]);
}

io.on('connection', function(socket){
  
  console.log("CONNECT!!");

  // old chat stuff
  socket.on('chat message', function(msg){
    console.log("send");
    io.emit('chat message', msg);
  });

  // join a game
  socket.on("joinHats", data=>{
    hatUsers.push(new HatPlayer(socket.id, data[1]));
    socket.join(hatRef(data))
    //console.log(data)
    findHatUser(socket.id).currentRoom=data[0];
    //console.log(hatGames[0].users);
    hatGames[data[0]].users.push(findHatUser(socket.id))
    
  })

  // player is ready
  socket.on("start", data=>{
    //console.log(data)
    findHatUser(socket.id).isready=true;
    console.log(hatRef(data));
    io.to(hatRef(data)).send("users", getPrettyUsers(data));
    if(getGame(socket.id).checkReady()){
      socket.to(hatRef(data)).emit("begin", hatsGame[data].getGameInfo() )
    }
  })

});

http.listen(port, function(){
  console.log('listening on *:' + port);
});

