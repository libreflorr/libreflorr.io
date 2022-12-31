let canvas, ctx;
canvas = document.getElementById("canvas");
ctx = canvas.getContext('2d');

let chkMouse = document.getElementById("chkMouse");
let useMouse = false;

chkMouse.onclick = function() {
  useMouse = chkMouse.checked;
}

// ctx.fillStyle = 'rgb(30,167,97)';
// ctx.fillRect(0, 0, canvas.width, canvas.height);

let x = 100, y = 100,
  vx = 0, vy = 0,
  ax1 = 0, ax2 = 0, ay1 = 0, ay2 = 0;

canvas.onmousemove = function(e) {
  // TODO: update even if mouse doesn't move
  if (useMouse) {
    console.log("mousemove", e.offsetX, e.offsetY);
    ax1 = e.offsetX - x;
    ax2 = 0;
    ay1 = e.offsetY - y;
    ay2 = 0;
  }
};

document.addEventListener("keydown", function(e) {
  // TODO: what if focus lost?
  console.log(e);
  switch (e.key) {
    case "ArrowLeft":
    case "a":
      ax1 = -1;
      break;
    case "ArrowRight":
    case "d":
      ax2 = +1;
      break;
    case "ArrowUp":
    case "w":
      ay1 = -1;
      break;
    case "ArrowDown":
    case "s":
      ay2 = +1;
      break;
  };
});

document.addEventListener("keyup", function(e) {
  // TODO 
  console.log(e);
  switch (e.key) {
    case "ArrowLeft":
    case "a":
      ax1 = 0;
      break;
    case "ArrowRight":
    case "d":
      ax2 = 0;
      break;
    case "ArrowUp":
    case "w":
      ay1 = 0;
      break;
    case "ArrowDown":
    case "s":
      ay2 = 0;
      break;
  };
});

function norm2(x, y) {
  return Math.sqrt(x * x + y * y);
}



function update() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // TODO: tune kinematics
  // TODO: boundaries
  // TODO: mouse
  let vmax = 5, vmin = 0.8, damp = 0.85;
  let accel = (1 - damp) / damp * vmax;
  let ax = ax1 + ax2;
  let ay = ay1 + ay2;
  let a = norm2(ax, ay);
  if (a) { ax /= a; ay /= a; }
  vx = damp * (vx + accel * ax);
  vy = damp * (vy + accel * ay);
  if (a == 0 && norm2(vx, vy) <= vmin) vx = vy = 0;
  x += vx;
  y += vy;
  console.log("v", vx, vy);
  ctx.fillStyle = 'rgb(0,0,0)';
  ctx.fillRect(x - 25, y - 25, 50, 50);
  requestAnimationFrame(update);
  // TODO: need to be independent of screen refresh rate
}

update();
