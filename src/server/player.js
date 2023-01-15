const { RootPetal, PetalContainer } = require('./petal.js');

const rarities = ['common','uncommon','rare','epic','legendary','mythic','omnipotent'];

module.exports = class Player{
    constructor(id, name, arena){
        this.id = id;
        this.x = Math.random()*arena.w;
        this.y = Math.random()*arena.h;
        this.clientPack = {
            x: -1,
            y: -1,
        }
        this.inGame = false;
        this.health = 100;
        this.r = 25;
        this.name = name;
        this.angle = 0;
        this.magnitude = 0;
        this.xv = 0;
        this.yv = 0;
        this.fric = 0;
        this.speed = 3.2;
        this.grav = {x: 0, y: 0};
        this.petals = {};
        this.regen = 6.4;
        for(let i = 0; i < 10; i++){
            this.petals[i] = new RootPetal({
                parent: this,
                angle: i/10*Math.PI*2,
                type: 'basic',
                rarity: 'common',
                parentId: this.id,
                id: i
            });
        }
    }
    setRotationDistance(dist){
        for(let petal of Object.values(this.petals)){
            petal.setRotationDistance(dist);
        }
    }
    createPetal(data){
        this.petals[data.id] = new RootPetal(data);
    }
    simulate(dt, arena, players) {
    this.health = Math.min(this.health + this.regen * dt / 1000, 100);
    this.magnitude /= 100;
    if (this.magnitude > 1) {
      this.magnitude = 1;
    }

    this.speed = 5.0;
    const tau = 200; // characteristic time in ms
    this.fric = 1 / tau;
    let accel = this.fric * this.speed;

    // Change the linear acceleration to square root acceleration
    this.xv += Math.cos(this.angle) * Math.sqrt(this.magnitude) * accel * dt;
    this.yv += Math.sin(this.angle) * Math.sqrt(this.magnitude) * accel * dt;

    this.xv /= 1 + this.fric * dt;
    this.yv /= 1 + this.fric * dt;

    this.x += this.xv * dt;
    this.y += this.yv * dt;

    // boundary check
    if (this.x + this.r > arena.w) {
      this.x = arena.w - this.r;
    } else if (this.x - this.r < 0) {
      this.x = this.r;
    }
    if (this.y + this.r > arena.h) {
      this.y = arena.h - this.r;
    } else if (this.y - this.r < 0) {
      this.y = this.r;
    }

    for (let petal of Object.values(this.petals)) {
      petal.simulate(dt, players)
    }
  }
    initPack(){
        return {
            id: this.id,
            x: roundPack(this.x),
            y: roundPack(this.y),
            health: roundPack(this.health),
            name: this.name,
            r: this.r,
            petals: this.petals
        }
    }
    pack(){
        let pack = {};
        if(roundPack(this.x) !== this.clientPack.x){
            pack.x = roundPack(this.x);
        }
        if(roundPack(this.y) !== this.clientPack.y){
            pack.y = roundPack(this.y);
        }
        if(roundPack(this.health) !== this.clientPack.health){
            pack.health = roundPack(this.health);
        }
        pack.petals = Math.round(Object.values(this.petals)[0].angle * 1000) / 1000;//{};
        // for(let petal of Object.values(this.petals)){
        //     pack.petals[petal.id] = petal.angle;
        // }
        this.clientPack = {
            x: pack.x,
            y: pack.y,
            health: pack.health,
            petals: pack.petals
        }
        return pack;
    }
}
