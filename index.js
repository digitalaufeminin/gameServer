var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//synchronised var
var nbParticipantsInit = 200;
var ipads = 0;
var smartbands = 12;
var rest = nbParticipantsInit - ipads - smartbands;
var pushed = false;
var resultat;
var caseActuelle;
var texte;


function tireAuSort(){
    var total = ipads + smartbands + rest;
    if(total==0){
      texte="<span class='looser'>C'est perdu</span>";
      return 2;
    }
    var drawnNB = Math.floor(Math.random() * total + 1);
    if(drawnNB <= ipads){
        ipads-=1;
        texte="<span class='ipads'>Gagné : iPad </span>";
        return 0;
    }
    else if (drawnNB <= smartbands + ipads){
        smartbands-=1;
        texte="<span class='bands'>Gagné : Bracelet Connecté</span>";
        return 1;
    }
    else{
        rest-=1;
        texte="<span class='looser'>C'est perdu</span>";
        return 2;
    }
}

function choisiCase(){
    switch(resultat){
      case 0: //ipad
        caseActuelle = 1;
        break;
      case 1: //bracelet (5 cases possibles)
        caseActuelle = 1 + Math.floor(Math.random()*5+1);
        break;
      default: //perdu (6 cases possibles)
        caseActuelle = 6 + Math.floor(Math.random()*6+1);
  }
}

function joue(){
    resultat = tireAuSort();
    choisiCase();
}

app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
});

io.on('connection', function(socket){
  console.log('une connection');
  
  socket.on('disconnect',function(){
    console.log('une deconection'); });
    
  socket.on('buttonClick',function() {
    joue();
    io.emit('switchCase',{caseActuelle,texte});
    io.emit('stockUpdate',{ipads,smartbands,rest});
    console.log('active');
    pushed = true;
  });
      
  socket.on('headerClick',function() {
    io.emit('switchCase',{caseActuelle,texte});
    console.log('desactive');
    pushed = false;
  });
      
  socket.on('askButtonStatus',function() {
    io.emit('buttonStatusUpdate', pushed);
    console.log('button status asked');
  });
  
  socket.on('askWheelStatus',function() {
    console.log('wheel status asked');
      if(pushed){
        io.emit('switchCase',{caseActuelle,texte});
      }
      
  });
  
  socket.on('askStockStatus',function() {
      io.emit('stockUpdate',{ipads,smartbands,rest});
  });
  
  socket.on('reset',function() {
      ipads=2;
      smartbands=15;
      rest=133;
      pushed=false;
      io.emit('switchCase',{caseActuelle,texte});
      io.emit('buttonStatusUpdate', pushed);
      io.emit('stockUpdate',{ipads,smartbands,rest});
  });
  
  socket.on('modify',function(data) {
    ipads=data.ipads;
    smartbands=data.smartbands;
    rest=data.rest;
    pushed=false;
    io.emit('switchCase',{caseActuelle,texte});
    io.emit('buttonStatusUpdate', pushed);
    io.emit('stockUpdate',{ipads,smartbands,rest});
  });
});

http.listen(process.env.PORT,process.env.IP, function(){
  console.log('listening on *:'+process.env.PORT);
});