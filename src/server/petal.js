const rarityToNumber = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5,
    unique: 6,
    mythic: 7,
    omnipotent: 8
};

class PetalContainer {
    constructor(x,y,petal,rarity,id){
        this.x = x;
        this.y = y;
        // string representing petal name
        this.petal = petal;
        this.rarity = rarity;
        this.id = id;
        this.decayTime = 12000;
        this.petalRadius = new RootPetal({parent:{},rarity: this.rarity, type: this.petal}).r;
    }
    simulate(dt){
        this.decayTime -= dt;
        if(this.decayTime < 0){
            return true; // delete
        }
    }
    pack() {
        return {
            x: roundPack(this.x),
            y: roundPack(this.y),
            id: this.id,
            petal: this.petal,
            rarity: this.rarity,
            decayTime: this.decayTime,
            petalRadius: this.petalRadius,
        }
    }
}

class RootPetal {
    constructor(init){
        switch(init.type){
            case 'stinger':
                return new Stinger(init);
            case 'diep':
                return new DiepPetal(init);
            default:
                return new Default(init);
        }
    }
}

class Default {
    constructor(init){
        this.angle = init.angle;
        this.x = init.parent.x+Math.cos(this.angle)*30;
        this.y = init.parent.y+Math.sin(this.angle)*30;
        this.lastX = init.parent.x+Math.cos(this.angle)*30;
        this.lastY = init.parent.y+Math.sin(this.angle)*30;
        this.type = init.type;
        this.rarity = init.rarity;
        this.parentId = init.parent.id;
        this.id = init.id;
        this.rotationSpeed = 0.002;
        this.rotationDistance = 75;
        this.desiredRotationDistance = 75;
        
        this.r = 10+rarityToNumber[this.rarity]**1.5;
        this.maxHealth = 10+rarityToNumber[this.rarity]**2*8;
        this.health = this.maxHealth;
        this.damage = 8+rarityToNumber[this.rarity]**2/2;
        this.rechargeTime = 2000/rarityToNumber[this.rarity];
        
        this.rechargeTimer = this.rechargeTime;
        this.dead = false;
    }
    setRotationDistance(dist) {
        this.desiredRotationDistance = dist;
    }
    simulate(dt, players) {
        const parent = players[this.parentId];
        this.angle += this.rotationSpeed*dt;
        while(this.angle > Math.PI*2){
            this.angle -= Math.PI*2;
        }
        
        this.rotationDistance = this.linearLerp(this.rotationDistance, this.desiredRotationDistance, Math.min(1,dt/2.4));
        this.x = players[this.parentId].x+Math.cos(this.angle)*this.rotationDistance;
        this.y = players[this.parentId].y+Math.sin(this.angle)*this.rotationDistance;
        
        if(this.dead){
            this.rechargeTimer -= dt;
            if(this.rechargeTimer < 0){
                this.rechargeTimer += this.rechargeTime;
                this.dead = false;
                this.health = this.maxHealth;
                broadcast({recharged: this.parentId, petalId: this.id});
            }
        }
    }
    linearLerp(start, end, time) {
        return start * (1 - time) + end * time;
    }
}

class Stinger {
    constructor(init){
        this.angle = init.angle;
        this.x = init.parent.x+Math.cos(this.angle)*30;
        this.y = init.parent.y+Math.sin(this.angle)*30;
        this.lastX = init.parent.x+Math.cos(this.angle)*30;
        this.lastY = init.parent.y+Math.sin(this.angle)*30;
        this.type = init.type;
        this.rarity = init.rarity;
        this.parentId = init.parent.id;
        this.id = init.id;
        this.rotationSpeed = 0.002;
        this.rotationDistance = 75;
        this.desiredRotationDistance = 75;
        
        this.r = 8+rarityToNumber[this.rarity]**2;
        this.maxHealth = 1;
        this.health = this.maxHealth;
        this.damage = 12+rarityToNumber[this.rarity]**3;
        this.rechargeTime = 2000-rarityToNumber[this.rarity]*100;
        if(this.rarity === 'mythic' || this.rarity === 'omnipotent'){
            this.rechargeTime = 800;
        }
        
        this.rechargeTimer = this.rechargeTime;
        this.dead = false;
    }
    setRotationDistance(dist) {
        this.desiredRotationDistance = dist;
    }
    simulate(dt, players) {
        const parent = players[this.parentId];
        this.angle += this.rotationSpeed*dt;
        
        this.rotationDistance = this.linearLerp(this.rotationDistance, this.desiredRotationDistance, Math.min(1,dt/2.4));
        this.x = players[this.parentId].x+Math.cos(this.angle)*this.rotationDistance;
        this.y = players[this.parentId].y+Math.sin(this.angle)*this.rotationDistance;
        
        if(this.dead){
            this.rechargeTimer -= dt;
            if(this.rechargeTimer < 0){
                this.rechargeTimer += this.rechargeTime;
                this.dead = false;
                this.health = this.maxHealth;
                broadcast({recharged: this.parentId, petalId: this.id});
            }
        }
    }
    linearLerp(start, end, time) {
        return start * (1 - time) + end * time;
    }
}

class DiepPetal {
    constructor(init){
        this.angle = init.angle;
        this.x = init.parent.x+Math.cos(this.angle)*30;
        this.y = init.parent.y+Math.sin(this.angle)*30;
        this.lastX = init.parent.x+Math.cos(this.angle)*30;
        this.lastY = init.parent.y+Math.sin(this.angle)*30;
        this.type = init.type;
        this.rarity = init.rarity;
        this.parentId = init.parent.id;
        this.id = init.id;
        this.rotationSpeed = 0.002;
        this.rotationDistance = 75;
        this.desiredRotationDistance = 75;
        
        this.r = 6+rarityToNumber[this.rarity]**1.8;
        this.maxHealth = 4+rarityToNumber[this.rarity]**1.33*3;
        this.health = this.maxHealth;
        this.damage = 20;
        this.rechargeTime = 1600-rarityToNumber[this.rarity]*70;
        this.bulletDamage = 4+rarityToNumber[this.rarity]**3/16;
        if(this.rarity === 'mythic'){
            this.rechargeTime = 800;
        } else if(this.rarity === 'omnipotent'){
            this.rechargeTime = 550;
        }
        
        this.rechargeTimer = this.rechargeTime;
        this.dead = false;
        
        this.maxShootTimer = 4000/(rarityToNumber[this.rarity]+4);
        this.shootTimer = this.maxShootTimer;
        this.bullets = [];
        this.bulletSpeed = rarityToNumber[this.rarity]**1.25/8;
        this.shootAngle = Math.random()*Math.PI*2;
    }
    setRotationDistance(dist) {
        this.desiredRotationDistance = dist;
    }
    simulate(dt, players) {
        const parent = players[this.parentId];
        this.angle += this.rotationSpeed*dt;
        this.rotationDistance = this.linearLerp(this.rotationDistance, this.desiredRotationDistance, Math.min(1,dt/2.4));
        this.x = players[this.parentId].x+Math.cos(this.angle)*this.rotationDistance;
        this.y = players[this.parentId].y+Math.sin(this.angle)*this.rotationDistance;
        
        if(this.dead){
            this.rechargeTimer -= dt;
            if(this.rechargeTimer < 0){
                this.rechargeTimer += this.rechargeTime;
                this.dead = false;
                this.health = this.maxHealth;
                broadcast({recharged: this.parentId, petalId: this.id});
            }
        } else {
            let nearestEnemy = null;
            let nearestDistance = 300+this.r*3;// detection radius
            for(let e of Object.values(enemies)){
                let d = Math.sqrt((e.x-this.x)**2+(e.y-this.y)**2);
                if(d < nearestDistance){
                    nearestDistance = d;
                    nearestEnemy = e;
                }
            }
    
            if(nearestEnemy !== null){
                // TODO:
                // we can do prediction later on but for rn 
                // just shoot at the player's angle
                this.targetAngle = Math.atan2(nearestEnemy.y-this.y,nearestEnemy.x-this.x);
                this.shootAngle = interpolateDirection(this.shootAngle, this.targetAngle, dt/250);
                // broadcast({
                //     shootAngle: this.shootAngle,
                //     playerId: this.parentId,
                //     petalId: this.id,
                // })
            } else {
                this.targetAngle += dt*Math.PI/3200;
                this.shootAngle += dt*Math.PI/3200;
                // broadcast({
                //     shootAngle: this.shootAngle,
                //     playerId: this.parentId,
                //     petalId: this.id,
                // })
            }

            
            this.shootTimer -= dt;
            if(this.shootTimer < 0 /*&& this.desiredRotationDistance === 150*/){
                this.shootTimer = this.maxShootTimer;
                if(this.rarity === 'mythic' || this.rarity === 'omnipotent'){
                    // twin and triplet
                    const angle = this.shootAngle;//Math.atan2(this.y-parent.y,this.x-parent.x);
                    const newBullets = [
                        {x: this.x+Math.cos(angle+Math.PI/2)*0.6*this.r, y: this.y+Math.sin(angle+Math.PI/2)*0.6*this.r, angle: angle, life: 5000},
                        {x: this.x-Math.cos(angle+Math.PI/2)*0.6*this.r, y: this.y-Math.sin(angle+Math.PI/2)*0.6*this.r, angle: angle, life: 5000},
                    ];
                    if(this.rarity === 'omnipotent'){
                        newBullets.push({x: this.x, y: this.y, angle: angle, life: 5000});
                    }
                    for(let newBullet of newBullets){
                        this.bullets.push(newBullet);
                        // broadcast({
                        //     newBullet: newBullet,
                        //     playerId: this.parentId,
                        //     petalId: this.id
                        // });
                    }
                } else {
                    const newBullet = {x: this.x, y: this.y, angle: this.shootAngle, life: 5000}
                    this.bullets.push(newBullet);
                    // broadcast({
                    //     newBullet: newBullet,
                    //     playerId: this.parentId,
                    //     petalId: this.id
                    // });
                }
            }
        }
        this.bullets.forEach((b,i) => {
            b.x += Math.cos(b.angle)*this.bulletSpeed*dt;
            b.y += Math.sin(b.angle)*this.bulletSpeed*dt;
            b.life -= dt;
            if(b.life < 0){
                broadcast({
                    removeBullet: i,
                    playerId: this.parentId,
                    petalId: this.id
                });
                this.bullets.splice(i,1);
            }
        })
        // broadcast({
        //     bu: this.bullets.map((b) => {
        //         return {
        //             x: b.x,
        //             y: b.y,
        //             life: b.life,
        //         } 
        //     }),
        //     playerId: this.parentId,
        //     petalId: this.id,
        // });
    }
    linearLerp(start, end, time) {
        return start * (1 - time) + end * time;
    }
}

module.exports = {
    RootPetal,
    PetalContainer
}