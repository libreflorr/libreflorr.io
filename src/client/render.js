function render(camera, players) {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width / camera.scale, canvas.height / camera.scale);
  renderTiles(camera);
  renderBorders();
  ctx.lineWidth = lineWidth;
  for (let d of deadObjects) {
    if (!d) continue;
    ctx.globalAlpha = Math.max(0, (consts.deadDecayTime - d.deadTimer) / consts.deadDecayTime);
    // ctx.filter = `hue-rotate(90deg)`;
    d.render((performance.now() - window.lastUpdateTime) * 30 / 1000);
    ctx.globalAlpha = 1;
    // ctx.filter = 'none';
  }
  for (let c of Object.values(petalContainers)) {
    c.render();
  }
  for (let p of Object.values(players)) {
    p.render();
  }
  for (let e of Object.values(enemies)) {
    e.render();
  }
  renderOverlay();
}

let tileImgs = {};

function createTileImg(xsize, ysize, color) {
  const tileSize = 50;

  const canv = document.createElement('canvas');
  const cx = canv.getContext('2d');
  canv.width = xsize + 100;
  canv.height = ysize + 100;
  cx.imageSmoothingEnabled = false;

  // tile background
  cx.globalAlpha = 0.5;
  cx.strokeStyle = color;
  cx.lineWidth = 2;
  for (let y = 0; y < ysize + 100; y += tileSize) {
    for (let x = 0; x < xsize + 100; x += tileSize) {
      cx.strokeRect(x, y, tileSize, tileSize);
    }
  }
  cx.globalAlpha = 1;
  return canv;
}

function renderTiles(camera) {
  if (tileImgs[backgroundColor] === undefined) {
    tileImgs[backgroundColor] = createTileImg(canvas.width / camera.scale, canvas.height / camera.scale, '#18874f');
  }
  // render the image
  const img = tileImgs[backgroundColor];
  const pos = offset(camera.x, camera.y);
  const gridOffset = offset(0, 0);
  ctx.translate(pos.x + (gridOffset.x % 50), pos.y + (gridOffset.y % 50));
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  ctx.translate(-pos.x - (gridOffset.x % 50), -pos.y - (gridOffset.y % 50));
}

window.arena = { w: 1200, h: 1200 };

function renderBorders() {
  ctx.fillStyle = '#18874f';
  const off = offset(0, 0);
  ctx.translate(off.x, off.y);
  const w = canvas.width / camera.scale;
  const h = canvas.height / camera.scale;
  ctx.fillRect(
    -w,
    -h,
    w,
    2 * h + arena.h
  );
  ctx.fillRect(
    -w,
    -h,
    2 * w + arena.w,
    h
  );
  ctx.fillRect(
    arena.w,
    -h,
    w,
    2 * h + arena.h
  );
  ctx.fillRect(
    -w,
    arena.h,
    2 * w + arena.w,
    h
  );
  ctx.translate(-off.x, -off.y);
}

function renderOverlay() {
  ctx.imageSmoothingEnabled = false;
  ctx.scale(1 / window.camera.scale, 1 / window.camera.scale);
  ctx.fillStyle = 'white';
  ctx.font = "50px Ubuntu";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 7;
  ctx.strokeText('Wave ' + wave, window.innerWidth / 2, 10);
  ctx.fillText('Wave ' + wave, window.innerWidth / 2, 10);
  const hp = me().health
  if (hp < 40) {
    // outer vinette if damaged
    var grd = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, Math.max(canvas.width / 1.5, canvas.height / 1.5));
    grd.addColorStop(0, "rgba(255,0,0,0)");
    grd.addColorStop(1, `rgba(255,0,0,${(1 - hp / 40) ** 0.8})`);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
  }
  ctx.scale(window.camera.scale, window.camera.scale)
  ctx.imageSmoothingEnabled = true;
}