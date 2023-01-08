const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', () => {
	canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // make sure that you see <= than a 1920 by 1080 screen
    const scale = Math.max(canvas.width/1920,canvas.height/1080);
    window.camera.scale = scale;
    ctx.scale(scale,scale);
    tileImgs = {};
});

const deadObjects = [];

window.chatOpen = false;
window.camera = { x: 0, y: 0, scale: 1 };
window.selfId = 1;

window.serverDT = 0;

window.mouse = {x: 0, y: 0};

window.time = 0;
window.delta = 0;

window.lineWidth = 5;

window.loaded = false;
window.onload = () => {
    window.loaded = true;
};

window.input = {
    // down: false,
    // left: false,
    // up: false,
    // right: false,
};

const scale = Math.max(canvas.width/1920,canvas.height/1080);
window.camera.scale = scale;
ctx.scale(scale,scale);

window.backgroundColor = '#20a464';

window.offset = function (x, y) {
    return {
        x: x - camera.x + canvas.width / 2 / camera.scale,
        y: y - camera.y + canvas.height / 2 / camera.scale,
    };
};

const initGame = (name) => {
    window.onkeydown = (event) => trackKeys(event, input);
    window.onkeyup = (event) => trackKeys(event, input);
    ref.chatDiv.blur();
    send({join: true, name: name });
}

function runPlayerMovement(){
    const angle = Math.atan2(mouse.y-canvas.height/2,mouse.x-canvas.width/2);
    const magnitude = Math.sqrt(((mouse.y-canvas.height/2)/canvas.height)**2+((mouse.x-canvas.width/2)/canvas.width)**2);
    send([angle,magnitude]);
}

function pushDeadObject(obj){
    deadObjects[deadObjects.length] = obj;
    if(deadObjects[deadObjects.length-1]){
        deadObjects[deadObjects.length-1].deadTimer = 0;   
    }
}

function intersectingCircleCircle(c1,c2){
    if(Math.sqrt((c1.x-c2.x)**2+(c1.y-c2.y)**2) < c1.r+c2.r){
        return true;
    }
    return false;
}

function runPetalCollision(){
    for(let id of Object.keys(petalContainers)){
        const p = petalContainers[id];
        if(intersectingCircleCircle({...p, r: 25*Math.sqrt(2)}, players[selfId])){
            // collect petal
            send({petal: p.petal, rarity: p.rarity});
            pushDeadObject(petalContainers[id]);
            delete petalContainers[id];
        }
    }
}

function simulateDeadObjects(dt){
    deadObjects.forEach((o, i) => {
        if(o){
            o.deadTimer += dt;
            if(o.deadTimer > consts.deadDecayTime){
                deadObjects.splice(o,1);
            }   
        }
    })
}

let lastTime = null;

function run() {
    const t = window.performance.now();
    if (lastTime == null) {
        lastTime = t;
    }
    window.delta = t - lastTime;
    window.time += delta / 1000;
    lastTime = t;
    runPlayerMovement();
    if (loaded) {
        simulateDeadObjects(window.delta);
        runPetalCollision();
        render(window.camera, players);
        window.camera.x = linearLerp(window.camera.x,players[selfId].x,0.125);
        window.camera.y = linearLerp(window.camera.y,players[selfId].y,0.125);
    }
    if(!closed){
        requestAnimationFrame(run);   
    }
}