global.wave = -1;
const Spawner = require('./spawner.js');
const { PetalContainer } = require('./petal.js');
var SAT = require('sat');

const rarities = ['common','uncommon','rare','epic','legendary','unique','mythic','omnipotent'];

global.rarityToNumber = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5,
    unique: 6,
    mythic: 7,
    omnipotent: 8
};

global.spawners = [];
global.petalContainers = {};
global.enemies = {};

// const waves = [
//     [
//         new Spawner('evadesnormal', 'common', 1000, 10)
//     ],
//     [
//         new Spawner('evadesnormal', 'legendary', 200, 3),
//         new Spawner('evadesnormal', 'omnipotent', 100, 2)
//     ],
//     [
//         new Spawner('evadesnormal', 'legendary', 200, 3),
//         new Spawner('evadesnormal', 'omnipotent', 10, 100)
//     ],
//     [
//         new Spawner('evadesnormal', 'common', 200, 3),
//         new Spawner('evadesnormal', 'uncommon', 200, 3),
//         new Spawner('evadesnormal', 'rare', 200, 3),
//         new Spawner('evadesnormal', 'epic', 200, 3),
//         new Spawner('evadesnormal', 'legendary', 200, 3),
//         new Spawner('evadesnormal', 'unique', 200, 3),
//         new Spawner('evadesnormal', 'mythic', 200, 3),
//         new Spawner('evadesnormal', 'omnipotent', 200, 3),
//     ],
// ]

function spawnWave(wave){
    let spawnerTypes = ['evadesnormal'];
    if(wave > 5){
        spawnerTypes.push('homing');
    }
    if(wave > 3){
        spawnerTypes.push('diep');
    }
    spawners = [];
    let power = 0;
    for(let p of Object.values(players)){
        for(let petal of Object.values(p.petals)){
            power += rarityToNumber[petal.rarity]*(Math.random());
        }
        power++;
    }
    power += wave*4.5;
    if(wave % 5 === 0){
        power *= 1.25+Math.random()*0.1;
    }
    if(wave < 10){
        power /= Math.sqrt(Object.keys(players).length);   
    } else if(wave < 30){
        power /= Math.cbrt(Object.keys(players).length);   
    } else if(wave > 200){
        power *= 3;
    } else if(wave > 100){
        power *= 2;
    }
    
    while(power > 1){
        // generating the highest square under the limit of power
        let spawnPower = Math.floor(Math.sqrt(Math.min(64,power)));

        // generating random type
        let spawnType = randomChoice(spawnerTypes);
        
        // generating a random amount
        let spawnAmount = Math.floor((Math.random()*10)/(spawnPower+1));
        if(spawnType === 'homing'){
            spawnAmount = Math.floor(1.4*spawnAmount);
        } else if(spawnType === 'diep'){
            spawnAmount = Math.ceil(0.8*spawnAmount);
        }
        power -= spawnPower;
        
        spawners.push(new Spawner(spawnType, rarities[spawnPower-1], 3000*Math.random(), spawnAmount));
    }
    if(wave >= 50){
        if(wave % 100 === 0){
            spawners.push(new Spawner('boss', 'omnipotent', 100, 1));
        }  
        // ok ur done
        if(wave > 250){
            for(i = 0; i < 3; i++){
                spawners.push(new Spawner('boss', 'omnipotent', 100, 1));
            }
        }
    }
}

function spawnPetalContainer(x, y, petalname, rarity){
    const pid = Math.random();
    const p = new PetalContainer(x,y,petalname,rarity,pid);
    petalContainers[pid] = p;
    return {petalContainer: p.pack()};
}

function intersectingCircleCircle(c1,c2){
    return Math.sqrt((c1.x-c2.x)**2+(c1.y-c2.y)**2) < c1.r+c2.r;
}

let bounceCircleCircle = (c1,c2,force=1) => {
    const diffX = c1.x-c2.x;
    const diffY = c1.y-c2.y;
    const angle = Math.atan2(diffY,diffX);
    //const distance = Math.sqrt(diffY*diffY+diffX*diffX);
    c1.grav.x += Math.cos(angle)*force;
    c1.grav.y += Math.sin(angle)*force;
    // c1.x = c2.x+Math.cos(angle)*(c1.r+c2.r);
    // c1.y = c2.y+Math.sin(angle)*(c1.r+c2.r);
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

function calculateDropRarity(enemyrarity){
    const baseRarity = rarityToNumber[enemyrarity]-1;
    const luck = Math.random();
    let rarity = baseRarity;
    if(luck > 0.95){
        rarity = Math.min(7,baseRarity+1);
    } else if(luck < 0.8) {
        rarity = Math.max(0,baseRarity-1);
    }
    return rarities[rarity];
}

global.randomChoice = function(array){
    return array[Math.floor(Math.random()*array.length)];
}

const dropTypes = new Map();

dropTypes.set('evadesnormal', 'basic');
dropTypes.set('diep', 'diep');
dropTypes.set('boss', 'diep');
dropTypes.set('homing', 'stinger');
dropTypes.set('bullet', 'none');

function calculateDropType(type){
    // switch(type){
    //     case 'evadesnormal':
    //         return 'basic'
    //     case 'diep':
    //         return 'diep';
    //     case 'homing':
    //         return 'stinger';
    //     case 'bullet':
    //         return 'none';
    //     default:
    //         return 'basic'
    // }
    return dropTypes.get(type);
}

function runCollision(dt, players, enemies){
    for(let playerId of Object.keys(players)){
        const player = players[playerId];
        for(let enemyId of Object.keys(enemies)){
            const enemy = enemies[enemyId];
            for(let petal of Object.values(player.petals)){
                if(petal.dead){
                    continue;
                }
                if(intersectingCircleCircle(enemy, petal) && enemies[enemyId]){
                    bounceCircleCircle(enemy, petal, 0.3/Math.cbrt(rarityToNumber[enemy.rarity]));
                    enemies[enemyId].health -= petal.damage;
                    petal.health -= enemy.damage;
                    enemies[enemyId].health -= enemy.damage;
                    petal.health -= petal.damage;
                    broadcast({takeDmg: enemyId});
                    if(enemy.health <= 0){
                        broadcast({killEnemy: enemyId});
                        
                        const dropType = calculateDropType(enemy.type);
                        if(dropType !== 'none'){
                            const petalContainer = spawnPetalContainer(enemy.x,enemy.y,dropType,calculateDropRarity(enemy.rarity));
                            broadcast(petalContainer);
                        }
                        
                        delete enemies[enemyId];
                    }
                    if(petal.health <= 0){
                        broadcast({killPetal: playerId, petalId: petal.id});
                        petal.dead = true;
                    }
                }
                if(petal.type === 'diep'){
                    petal.bullets.forEach((b,i) => {
                        if(!b.r){
                            b.r = petal.r * 1.5;
                        }
                        if(intersectingCircleCircle(enemy,b) && enemies[enemyId]){
                            enemies[enemyId].health -= enemies[enemyId].damage + petal.bulletDamage;
                            broadcast({takeDmg: enemyId});
                            if(enemy.health <= 0){
                                broadcast({killEnemy: enemyId});
                                
                                const dropType = calculateDropType(enemy.type);
                                if(dropType !== 'none'){
                                    const petalContainer = spawnPetalContainer(enemy.x,enemy.y,dropType,calculateDropRarity(enemy.rarity));
                                    broadcast(petalContainer);
                                }
                                
                                delete enemies[enemyId];
                            }
                            petal.bullets.splice(i,1);
                            if(this.parentId !== undefined){
                                broadcast({
                                    removeBullet: i,
                                    playerId: this.parentId,
                                    petalId: this.id
                                });
                            }
                        }
                    })
                }
            }
            if(intersectingCircleCircle(enemy, player)){
                boundCircleCircle(enemy, player);
                if(enemy.type === 'homing' && enemy.damageDelay > 0){
                    continue;
                }
                player.health -= enemy.damage;
                enemy.health -= enemy.damage;
                broadcast({hit: player.id, health: roundPack(player.health)});
                broadcast({takeDmg: enemyId});
                if(enemy.health <= 0){
                    broadcast({killEnemy: enemyId});
                    
                    const dropType = calculateDropType(enemy.type);
                    if(dropType !== 'none'){
                        const petalContainer = spawnPetalContainer(enemy.x,enemy.y,dropType,calculateDropRarity(enemy.rarity));
                        broadcast(petalContainer);
                    }
                    bounceCircleCircle(player, enemy, (rarityToNumber[enemy.rarity]**1.5)/80);
                    delete enemies[enemyId];
                } else {
                    bounceCircleCircle(player, enemy, (rarityToNumber[enemy.rarity]**1.5)/30);
                    bounceCircleCircle(enemy, player, (rarityToNumber[enemy.rarity]**1.5)/30);
                }
            }
        }
    };
    
    global.totalEnemyArea = 0;
    for(let enemy1 of Object.values(enemies)){
        for(let enemy2 of Object.values(enemies)){
            if(enemy2.id >= enemy1.id){
                continue;
            } else if(enemy2.type === 'bullet' || enemy1.type === 'bullet'){
                continue;
            }
            boundCircleCircle(enemy1,enemy2);
        }
        if(enemy1.type !== 'bullet'){
            global.totalEnemyArea += enemy1.r**2;   
        }
    }
    global.totalEnemyArea = Math.sqrt(global.totalEnemyArea);   
}

function simulateWaves(dt, players, arena){
    // updating current wave
    spawners.forEach((s,i) => {
        if(s.simulate(dt, arena, enemies)){
            spawners.splice(i,1);
        }
    })
    // moving onto next wave if enemies are low
    if(spawners.length === 0 && Object.keys(enemies).length < 4){
        wave++;
        spawnWave(wave);
        if(wave !== 0){
            broadcast({wave: wave});
        }
    }
    // simulating enemies and drops
    for(let id of Object.keys(enemies)){
        let toDelete = enemies[id].simulate(dt, players, enemies, arena);
        if(toDelete){
            delete enemies[id];
            broadcast({killEnemy: id});
        }
    }
    
    // array of enemies
    const earray = Object.values(enemies).map(e => e.pack());
    if(earray.length !== 0){
        let epack = {
            
        };
        // converting them to object to send faster
        for(let ene of earray){
            epack[ene.id] = ene;
            delete epack[ene.id].id;
        }
        broadcast({enemies: epack});
    }
    // if(Math.random() > 0.9){
    //     spawnPetalContainer(Math.random()*arena.w, Math.random()*arena.h,'stinger',rarities[Math.floor(Math.random()*rarities.length)]);
    // }

    runCollision(dt, players, enemies);

    for(let petalContainer of Object.values(petalContainers)){
        if(petalContainer.simulate(global.delta)){
            delete petalContainers[petalContainer.id];
            // broadcast({removePetalContainer: petalContainer.id});
        }
    }
}

module.exports = simulateWaves;