class Flower {
  constructor(init) {
    this.id = init.id;
    this.x = init.x;
    this.y = init.y;
    this.r = init.r;
    this.name = init.name;
    this.health = init.health;
    this.lastX = this.x;
    this.lastY = this.y;
    this.petals = {};
    for (let p of Object.values(init.petals)) {
      this.petals[p.id] = new RootPetal(p);
    }
    this.renderX = init.x;
    this.renderY = init.y;
    this.rotationDistance = 75;
  }
  setRotationDistance(dist) {
    for (let petal of Object.values(this.petals)) {
      petal.setRotationDistance(dist);
    }
    this.rotationDistance = dist;
  }
  render() {
    const dt = (performance.now() - window.lastUpdateTime) * 30 / 1000;
    window.serverDT = window.delta * 30 / 1000;

    this.renderX = linearLerp(this.lastX, this.x, dt);
    this.renderY = linearLerp(this.lastY, this.y, dt);

    // body
    ctx.fillStyle = '#ffe763';
    ctx.strokeStyle = '#a29442';
    ctx.beginPath();
    const pos = offset(this.renderX, this.renderY);
    ctx.arc(pos.x, pos.y, this.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    // health
    ctx.fillStyle = '#181818';
    ctx.roundRect(pos.x - 40, pos.y + this.r * 1.1 + 16, 80, 8, 4).fill();
    ctx.fillStyle = '#8cdc48';
    ctx.strokeStyle = '#181818';
    ctx.lineWidth = 5;
    ctx.roundRect(pos.x - 40, pos.y + this.r * 1.1 + 16, 80, 8, 4).stroke();
    ctx.roundRect(pos.x - 40, pos.y + this.r * 1.1 + 16, Math.max(0, this.health) * 4 / 5, 8, 4).fill();

    // petals
    for (let petal of Object.values(this.petals)) {
      petal.render(dt);
    }

    // name
    ctx.fillStyle = 'white';
    ctx.font = "32px Ubuntu";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.strokeText(this.name, pos.x, pos.y - this.r * 1.1 - 16);
    ctx.fillText(this.name, pos.x, pos.y - this.r * 1.1 - 16);
  }
  updatePack(pack) {
    // read up on prediction later on
    this.lastX = this.x;
    this.lastY = this.y;

    for (let key of Object.keys(pack)) {
      if (key === 'petals') {
        // for(let petalId of Object.keys(pack[key])){
        //     if(this.petals[petalId]){
        //         this.petals[petalId].updateAngle(pack[key][petalId]);
        //     }
        // }
        const petalAmount = Object.keys(this.petals).length;
        const rotationIncrement = Math.PI * 2 / petalAmount;
        let rotation = pack.petals;
        for (let petalId of Object.keys(this.petals)) {
          this.petals[petalId].updateAngle(rotation);
          rotation += rotationIncrement;
        }
      } else if (pack[key] !== undefined) {
        this[key] = pack[key];
      }
    }
  }
}