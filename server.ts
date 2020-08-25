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
  hatGames.push(new hatsGame)
}
var hatUsers = [];


function findHatUser(id){
  return hatUsers.find(x=>x.socketid==id)
}
class HatPlayer{
  public isready=false;
  public socketid:string;
  public playing=false;
  public points=0;
  public currentRoom:number;
  constructor(id:string){
    this.socketid=id;
  }
  public getGame(){
    return hatGames[this.currentRoom];
  }
}

class hatsGame{
  users:Array<HatPlayer>=[]
  currentPlayer:HatPlayer;
  currentWord:string;
  public checkReady(){
    return users.forEach(element => {
      element.ready=true;
    });
  }

}
function hatRef(num){
  return "hats"+num.toString()
}
var hatGames = [];
function getGame(id){
  return hatGames[findHatUser(id).currentRoom];
}

function getPrettyUsers(roomNum){
  return hatGames[roomNum].map(user=> [user.name, user.ready]);
}

io.on('connection', function(socket){
  hatUsers.push(new HatPlayer(socket.id))
  console.log("CONNECT!!");

  // old chat stuff
  socket.on('chat message', function(msg){
    console.log("send");
    io.emit('chat message', msg);
  });

  // join a game
  socket.on("joinhats", data=>{
    socket.join(hatRef(data))
    findHatUser(socket.id).currentRoom=data;
    hatGames[data].users.push(findHatUser(socket.id))
    console.log(hatGames[data]);
  })

  // player is ready
  socket.on("start", data=>{
    findHatUser(socket.id).isready=true;
    io.to(hatRef(data)).send("users", getPrettyUsers(data));
    if()
  })

});

http.listen(port, function(){
  console.log('listening on *:' + port);
});

