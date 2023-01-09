String.prototype.safe = function() {
  return this.replace(/&/g, '&amp;')
    .replace(/ /g, '&nbsp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

function linearLerp(start, end, time) {
  return start * (1 - time) + end * time;
}

function interpolateDirection(start, end, time) {
  const absD = Math.abs((end - start));
  if (absD >= Math.PI) {
    // The angle between the directions is large - we should rotate the other way
    if (start > end) {
      return start + (end + 2 * Math.PI - start) * time;
    } else {
      return start - (end - 2 * Math.PI - start) * time;
    }
  } else {
    // Normal interp
    return start + (end - start) * time;
  }
}

window.me = () => {
  return players[selfId];
}

CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x + r, y);
  this.arcTo(x + w, y, x + w, y + h, r);
  this.arcTo(x + w, y + h, x, y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x + w, y, r);
  this.closePath();
  return this;
}