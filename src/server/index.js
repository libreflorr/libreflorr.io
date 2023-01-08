const express = require('express');
const WebSocket = require('ws');
const uuid = require("uuid");
const path = require("path");
const app = express();
const wss = new WebSocket.Server({ noServer: true });
const msgpack = require("msgpack-lite");
const Player = require('./player.js');
const simulateWaves = require('./waves.js');
const tickRate = 30;
// maps??
global.arena = {
    w: 1200,
    h: 1200,
}

global.clients = {};
global.players = {};

var iid = 0;
/*const Database = require("@replit/database");
const db = new Database();
db.set("testkey","value").then(() => {
    db.get('testkey').then((val) =>{
        console.log(val);
        db.delete('testkey');
    })
})*/
/*const Client = require("@replit/database");
const client = new Client();
async function testDB(){
    await client.set("key", "value");
    let key = await client.get("key");
    console.log(key);   
}
testDB();*/
// wtf
app.use(express.static("src/client"));

app.get("/", function (req, res) {
  res.sendFile("index.html");
});

wss.on("connection", ws=>{
    // player opens new tab
    ws.binaryType = "arraybuffer"

    iid++;
    if(iid > 9999){
        iid = 0;
    }

    const clientId = iid;
    clients[iid] = ws;
    
	ws.on("message",(data)=>{
		const msg = msgpack.decode(new Uint8Array(data));
        if(Array.isArray(msg)){
            players[clientId].angle = msg[0];
            players[clientId].magnitude = msg[1];
        }
        else if(msg.join){
            players[clientId] = new Player(clientId, msg.name, arena);
            players[clientId].inGame = true;
            for(let playerId of Object.keys(players)){
                send({newplayer: true, id: playerId, data: players[playerId].initPack()}, clientId);
            }
            for(let enemyId of Object.keys(enemies)){
                send({spawn: enemies[enemyId]}, clientId);
            }
            
            broadcast({newplayer: true, id: clientId, data: players[clientId].initPack()});
            
            calculateArenaSize()
            
            send({serverid: clientId}, clientId);
            send({wave: wave}, clientId);
        }
        else if(msg.chat){
            broadcast({chat: msg.chat, name: players[clientId].name});
        }
        else if(msg.attack !== undefined){
            if(msg.attack){
                players[clientId].setRotationDistance(150);
                broadcast({id: clientId, rotationDist: 150});
            } else {
                players[clientId].setRotationDistance(75);
                broadcast({id: clientId, rotationDist: 75});
            }
        }
        else if(msg.defend !== undefined){
            if(msg.defend){
                players[clientId].setRotationDistance(50);
                broadcast({id: clientId, rotationDist: 50});
            } else {
                players[clientId].setRotationDistance(75);
                broadcast({id: clientId, rotationDist: 75});
            }
        }
        else if(msg.petal){
            // choosing a random petal from the petals object
            const keys = Object.values(players[clientId].petals);
            const randomPetalInd = Math.floor(Math.random() * keys.length);
            const randomPetal = keys[randomPetalInd];
            if(rarityToNumber[randomPetal.rarity] <= rarityToNumber[msg.rarity]){
                // creating a new petal to replace the existing one
                players[clientId].createPetal({...randomPetal, parent: players[clientId], type: msg.petal, rarity: msg.rarity});
                // sending msg to all clients that this replacement happened
                broadcast({newPetal: players[clientId].petals[randomPetalInd]});
            }
        }
	})
	ws.on('close',()=>{
        delete clients[clientId];
        delete players[clientId];
        
        calculateArenaSize();
        
        broadcast({removeplayer: clientId});
	})
})


const server = app.listen(3000);
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, socket => {
        wss.emit('connection', socket, request);
    });
});

global.roundPack = (num) => {
    return Math.round(num * 10) / 10;
}

global.send = (msg,id) => {
    clients[id].send(msgpack.encode(msg));
}

global.broadcast = (msg) => {
    //console.log(msg);
    for(let playerId of Object.keys(players)){
        clients[playerId].send(msgpack.encode(msg));
    }
}

function intersectingCircleCircle(c1,c2){
    if(Math.sqrt((c1.x-c2.x)**2+(c1.y-c2.y)**2) < c1.r+c2.r){
        return true;
    }
    return false;
}

function calculateArenaSize(){
    const lastArena = global.arena;
    arena = {
        w: 1200,
        h: 1200
    }
    for(let p of Object.values(players)){
        arena.w += 100;
        arena.h += 100;
    }
    if(lastArena.w !== arena.w){
        broadcast({arena: arena});
    }
}

function resetGame(){
    enemies = {};
    spawners = [];
    petalContainers = {};
    wave = -1;
}

let boundCircleCircle = (c1,c2) => {
    // angle from c1 to c2
    const diffX = c2.x-c1.x;
    const diffY = c2.y-c1.y;
    const angle = Math.atan2(diffY,diffX);
    const overlap = c1.r+c2.r-Math.sqrt(diffX*diffX+diffY*diffY);
    const overlapcos = Math.cos(angle)*overlap/2;
    const overlapsin = Math.sin(angle)*overlap/2;
    if(overlap > 0){
        c1.x -= overlapcos;
        c1.y -= overlapsin;
        c2.x += overlapcos;
        c2.y += overlapsin;
    }
}

let lastTs = 0;
global.accum = 0;

function ServerTick() {
    global.delta = Date.now() - lastTs;
    lastTs = Date.now();
    const goodFps = global.delta <= 1000 / tickRate + 100;
    if(global.delta < 10000){
        accum += global.delta;
    }
    // broadcast({delta: global.delta});

    while (accum > 0){
        accum -= 1000/tickRate;
        if(goodFps){
            for(const player of Object.values(players)){
                player.simulate(/*global.delta*/1000/tickRate, arena, players);
            }   
        }
    }

    if(Object.values(players).length === 0){
        resetGame();
    }

    if(goodFps) {
        simulateWaves(global.delta/*1000/tickRate*/, players, arena);

        for(const player1 of Object.values(players)){
            for(const player2 of Object.values(players)){
                if(intersectingCircleCircle(player1,player2) && player2.id !== player1.id){
                    const angle = Math.atan2(player1.y-player2.y,player1.x-player2.x);
                    boundCircleCircle(player1,player2);
                    // player1.grav.x += Math.cos(angle)*5;
                    // player1.grav.y += Math.sin(angle)*5;
                    // player2.grav.x -= Math.cos(angle)*5;
                    // player2.grav.y -= Math.sin(angle)*5;
                }
            }
        }
        
        const changedPlayers = {};
    
        for(let player of Object.values(players)){
            const pack = player.pack();
            if(Object.keys(pack).length > 0){
                changedPlayers[player.id] = pack;
            }
        }
    
        if (Object.keys(changedPlayers).length > 0) {
            broadcast({
                u: changedPlayers,
            });
        }
    }
}

setInterval(ServerTick, Math.round(1000 / tickRate));