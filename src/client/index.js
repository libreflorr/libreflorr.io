var HOST = location.origin.replace(/^http/, 'ws')
const ws = new WebSocket(HOST);
ws.binaryType = "arraybuffer";
let closed = false;

const players = {};

const petalContainers = {};

window.enemies = {};

let wave = 1;

window.lastUpdateTime = 0;

window.delta = 0;

ws.addEventListener("message", ( datas ) => {
    const msg = msgpack.decode(new Uint8Array(datas.data));
    if(msg.delta){
        window.delta = msg.delta;
    }
    if(msg.newplayer){
        players[msg.id] = new Flower(msg.data);
    }   
    if(msg.serverid){
        selfId = msg.serverid;
        run();
    }
    if(msg.removeplayer){
        delete players[msg.removeplayer];
    }
    if(msg.arena){
        window.arena = msg.arena;
    }
    if(msg.chat){
        const div = document.createElement('div');
        div.classList.add('chat-message');
        div.innerHTML = `${msg.name.safe()}: ${msg.chat.safe()}`;
        ref.chatMessageDiv.appendChild(div);
        ref.chatMessageDiv.scrollTop = ref.chatMessageDiv.scrollHeight;
    }
    if(msg.u){
        window.lastUpdateTime = performance.now();
        for(let playerId of Object.keys(msg.u)){
            if(players[playerId]){
                players[playerId].updatePack(msg.u[playerId]);
            }
        }
    }
    if(msg.rotationDist){
        players[msg.id].setRotationDistance(msg.rotationDist);
    }
    if(msg.petalContainer){
        petalContainers[msg.petalContainer.id] = new PetalContainer(msg.petalContainer);
    }
    // if(msg.removePetalContainer){
    //     if(petalContainers[msg.removePetalContainer] !== undefined){
    //         pushDeadObject(petalContainers[msg.removePetalContainer]);   
    //     }
    //     delete petalContainers[msg.removePetalContainer];
    // }
    if(msg.newPetal){
        const msgId = msg.newPetal.parentId;
        const petalId = msg.newPetal.id;

        // fading out the other petal
        //pushDeadObject(players[msgId].petals[msg.newPetal.id]);
        players[msgId].petals[petalId] = new RootPetal({...msg.newPetal, rotationDistance: players[msgId].rotationDistance});
    }
    // if(msg.enemy){
    //     if(enemies[msg.enemy.id]){
    //         enemies[msg.enemy.id].updatePack(msg.enemy);
    //     }
    // }
    if (msg.enemies){
        for(let enemyId of Object.keys(msg.enemies)){
            if(enemies[enemyId]){
                enemies[enemyId].updatePack(msg.enemies[enemyId]);
            }
        }
    }
    if(msg.wave){
        wave = msg.wave;
    }
    if(msg.spawn){
        enemies[msg.spawn.id] = new RootEnemy(msg.spawn);
    }
    if(msg.killEnemy){
        let enemy = enemies[msg.killEnemy];
        pushDeadObject(enemy);
        delete enemies[msg.killEnemy];
    }
    if(msg.killPetal){
        let deepPetal = JSON.parse(JSON.stringify(players[msg.killPetal].petals[msg.petalId]));
        deepPetal.render = players[msg.killPetal].petals[msg.petalId].render;
        pushDeadObject(deepPetal);
        players[msg.killPetal].petals[msg.petalId].dead = true;
    }
    if(msg.recharged){
        players[msg.recharged].petals[msg.petalId].dead = false;
        players[msg.recharged].petals[msg.petalId].lastDeadTime = performance.now();
    }
    if(msg.takeDmg){
        if(enemies[msg.takeDmg] !== undefined){
            enemies[msg.takeDmg].lastDamage = performance.now();
        }
    }
    if(msg.hit){
        players[msg.hit].health = Math.max(msg.health,0);
        if(msg.hit === selfId && players[msg.hit].health === 0){
            location.reload();
            // ws.close();
        }
    }
    // if(msg.newBullet){
    //     if(players[msg.playerId]){
    //         if(players[msg.playerId].petals[msg.petalId].bullets){
    //             players[msg.playerId].petals[msg.petalId].bullets.push(msg.newBullet);
    //         }
    //     }
    // }
    if(msg.removeBullet !== undefined){
        if(players[msg.playerId]){
            if(players[msg.playerId].petals[msg.petalId].bullets){
                players[msg.playerId].petals[msg.petalId].bullets.splice(msg.removeBullet,1);
            }
        }
    }
    // if(msg.shootAngle !== undefined){
    //     if(players[msg.playerId]){
    //         players[msg.playerId].petals[msg.petalId].setShootAngle(msg.shootAngle);
    //     }
    // }
});

ws.addEventListener('close', (event) => {
    console.error('socket closed!');
    closed = true;
});

function send(msg){
    try {
        ws.send(msgpack.encode(msg));
    } catch(e){
        // websocket is still connecting so we should reload to give the client another chance
        location.reload()
    }
}