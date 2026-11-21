// Lantern Row — Spot the Difference: canvas rendering.
// One clear job: draw a scene on a panel, and draw the marks on top of
// it. Every scene is drawn in code from one specification: drawScene
// takes a side ('left' or 'right') and applies that scene's differences
// to the right panel only. No images, no external assets — all art is
// shapes, gradients and glow, drawn fresh every frame.

import { PANEL_WIDTH, PANEL_HEIGHT } from './config.js';

// ---------------------------------------------------------------- helpers

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

function poly(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
}

function star(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const rad = i % 2 === 0 ? r : r * 0.4;
    const px = x + Math.cos(angle) * rad;
    const py = y + Math.sin(angle) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// A small fish, facing left or right, at (x, y) with the given size.
function fish(ctx, x, y, size, body, facing) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  ctx.fillStyle = body;
  ellipse(ctx, 0, 0, size, size * 0.55);
  ctx.fill();
  poly(ctx, [[-size * 0.8, 0], [-size * 1.5, -size * 0.6], [-size * 1.5, size * 0.6]]);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  circle(ctx, size * 0.45, -size * 0.12, size * 0.14);
  ctx.fill();
  ctx.fillStyle = '#10202e';
  circle(ctx, size * 0.5, -size * 0.12, size * 0.07);
  ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------- scene 1

const LANTERN_STARS = [
  [40, 30], [90, 70], [140, 25], [200, 55], [260, 35], [330, 28],
  [390, 60], [450, 30], [520, 80], [30, 110], [180, 100], [300, 90],
  [360, 110], [520, 130],
];

const LANTERN_COLOURS = ['#e23b3b', '#f08a1d', '#f2c230', '#e26a8a', '#8a5fd6'];

function drawLantern(ctx, x, y, colour) {
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(x - 1, y - 34, 2, 10); // hanging thread
  ctx.fillStyle = '#d9a441';
  ctx.fillRect(x - 8, y - 26, 16, 5); // top cap
  ctx.fillStyle = colour;
  ellipse(ctx, x, y, 20, 25);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1.5;
  for (const off of [-10, 0, 10]) {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.abs(off) + 4, 25, 0, -Math.PI / 2.4, Math.PI / 2.4);
    ctx.stroke();
  }
  ctx.fillStyle = '#d9a441';
  ctx.fillRect(x - 8, y + 21, 16, 5); // bottom cap
  ctx.fillStyle = '#f2c230';
  ctx.fillRect(x - 1, y + 26, 2, 12); // tassel
}

function drawLanternRow(ctx, side) {
  const sky = ctx.createLinearGradient(0, 0, 0, 330);
  sky.addColorStop(0, '#0a0f2e');
  sky.addColorStop(1, '#1d2c58');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_WIDTH, 330);

  // Stars.
  ctx.fillStyle = '#ffffff';
  for (const [x, y] of LANTERN_STARS) {
    star(ctx, x, y, 2.2);
    ctx.fill();
  }

  // Moon: full on the left, a crescent on the right.
  ctx.fillStyle = '#f7e8a4';
  circle(ctx, 495, 48, 26);
  ctx.fill();
  if (side === 'right') {
    ctx.fillStyle = '#141c40';
    circle(ctx, 505, 40, 22);
    ctx.fill();
  } else {
    ctx.fillStyle = '#d9c47a';
    circle(ctx, 488, 42, 4);
    ctx.fill();
    circle(ctx, 502, 56, 3);
    ctx.fill();
  }

  // String lights sagging across the top.
  ctx.strokeStyle = '#2c2417';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 42);
  ctx.quadraticCurveTo(280, 118, 560, 42);
  ctx.stroke();
  for (let i = 0; i < 10; i++) {
    const t = (i + 0.5) / 10;
    const bx = (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * 280 + t * t * 560;
    const by = (1 - t) * (1 - t) * 42 + 2 * (1 - t) * t * 118 + t * t * 42;
    if (side === 'right' && i === 5) continue; // the missing bulb
    ctx.fillStyle = ['#ffd94a', '#ff8a5c', '#7ce0c3', '#ff9ecf'][i % 4];
    circle(ctx, bx, by + 8, 6);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 220, 120, 0.25)';
    circle(ctx, bx, by + 8, 11);
    ctx.fill();
  }

  // Lantern wire and the row of paper lanterns.
  ctx.strokeStyle = '#2c2417';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(20, 118);
  ctx.lineTo(540, 118);
  ctx.stroke();
  const lanternXs = [70, 160, 250, 340, 430];
  lanternXs.forEach((x, i) => {
    if (side === 'right' && i === 2) return; // the missing lantern
    const colour = side === 'right' && i === 0 ? '#2bb3a3' : LANTERN_COLOURS[i];
    drawLantern(ctx, x, 150, colour);
  });

  // Ground: cobbled night-market street.
  ctx.fillStyle = '#2a1f14';
  ctx.fillRect(0, 330, PANEL_WIDTH, 130);
  ctx.fillStyle = '#33261a';
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 9; col++) {
      ctx.fillRect(8 + col * 64 + (row % 2) * 28, 342 + row * 28, 52, 18);
    }
  }

  // Left stall: striped awning, counter, TEA sign.
  ctx.fillStyle = '#7a2e2e';
  poly(ctx, [[30, 250], [170, 250], [180, 282], [20, 282]]);
  ctx.fill();
  ctx.fillStyle = '#f2e3c2';
  for (let i = 0; i < 4; i++) {
    poly(ctx, [[46 + i * 34, 250], [62 + i * 34, 250], [66 + i * 34, 282], [50 + i * 34, 282]]);
    ctx.fill();
  }
  ctx.fillStyle = '#5d3a1e';
  ctx.fillRect(34, 282, 132, 62);
  ctx.fillStyle = '#8a5a2e';
  ctx.fillRect(30, 278, 140, 8);
  ctx.fillStyle = '#f7e8c8';
  roundRect(ctx, 66, 292, 68, 26, 4);
  ctx.fill();
  ctx.fillStyle = '#7a2e2e';
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('TEA', 100, 306);

  // Right stall: awning, counter, NOODLES sign.
  ctx.fillStyle = '#2e5d7a';
  poly(ctx, [[390, 250], [530, 250], [540, 282], [380, 282]]);
  ctx.fill();
  ctx.fillStyle = '#f2e3c2';
  for (let i = 0; i < 4; i++) {
    poly(ctx, [[406 + i * 34, 250], [422 + i * 34, 250], [426 + i * 34, 282], [410 + i * 34, 282]]);
    ctx.fill();
  }
  ctx.fillStyle = '#5d3a1e';
  ctx.fillRect(394, 282, 132, 62);
  ctx.fillStyle = '#8a5a2e';
  ctx.fillRect(390, 278, 140, 8);
  ctx.fillStyle = '#f7e8c8';
  roundRect(ctx, 414, 292, 92, 26, 4);
  ctx.fill();
  ctx.fillStyle = '#2e5d7a';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillText('NOODLES', 460, 306);

  // Cat on a crate, on the ground clear of the stalls.
  ctx.fillStyle = '#8a5a2e';
  ctx.fillRect(24, 396, 56, 44);
  ctx.strokeStyle = '#5d3a1e';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 396, 56, 44);
  ctx.beginPath();
  ctx.moveTo(24, 418);
  ctx.lineTo(80, 418);
  ctx.stroke();
  ctx.fillStyle = '#3d3d3d';
  ellipse(ctx, 54, 388, 22, 15);
  ctx.fill();
  circle(ctx, 54, 366, 13);
  ctx.fill();
  poly(ctx, [[44, 358], [48, 344], [54, 356]]);
  ctx.fill();
  poly(ctx, [[64, 358], [60, 344], [54, 356]]);
  ctx.fill();
  ctx.strokeStyle = '#3d3d3d';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(74, 392);
  ctx.quadraticCurveTo(90, 378, 86, 362);
  ctx.stroke();
  ctx.fillStyle = '#ffd94a';
  circle(ctx, 49, 365, 2);
  ctx.fill();
  circle(ctx, 59, 365, 2);
  ctx.fill();

  // Bicycle parked in front of the right stall.
  ctx.strokeStyle = '#c8c8c8';
  ctx.lineWidth = 3;
  circle(ctx, 430, 388, 26);
  ctx.stroke();
  circle(ctx, 506, 388, 26);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(430, 388);
  ctx.lineTo(462, 344);
  ctx.lineTo(506, 388);
  ctx.moveTo(462, 344);
  ctx.lineTo(446, 388);
  ctx.moveTo(462, 344);
  ctx.lineTo(478, 330);
  ctx.moveTo(478, 330);
  ctx.lineTo(492, 330);
  ctx.moveTo(462, 344);
  ctx.lineTo(452, 332);
  ctx.stroke();
  ctx.fillStyle = '#e23b3b';
  circle(ctx, 452, 330, 5);
  ctx.fill();
  if (side === 'left') {
    // The bell, present only on the left panel.
    ctx.fillStyle = '#ffd94a';
    circle(ctx, 468, 318, 6);
    ctx.fill();
    ctx.strokeStyle = '#8a6d1f';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(468, 324);
    ctx.lineTo(472, 330);
    ctx.stroke();
  }
}

// ---------------------------------------------------------------- scene 2

function drawCoral(ctx, x, y, colour, scale) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = 7 * scale;
  ctx.lineCap = 'round';
  const branches = [[-18, -34], [-6, -48], [8, -40], [20, -28], [0, -58]];
  for (const [dx, dy] of branches) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + dx * 0.4, y + dy * 0.6, x + dx * scale, y + dy * scale);
    ctx.stroke();
  }
  ctx.fillStyle = colour;
  for (const [dx, dy] of branches) {
    circle(ctx, x + dx * scale, y + dy * scale, 5 * scale);
    ctx.fill();
  }
}

function drawReef(ctx, side) {
  const water = ctx.createLinearGradient(0, 0, 0, 385);
  water.addColorStop(0, '#0a4a6e');
  water.addColorStop(1, '#0d6d8a');
  ctx.fillStyle = water;
  ctx.fillRect(0, 0, PANEL_WIDTH, 385);

  // Sun rays from the surface.
  ctx.fillStyle = 'rgba(255, 255, 220, 0.07)';
  for (const [x0, x1] of [[60, 120], [220, 280], [380, 450]]) {
    poly(ctx, [[x0, 0], [x1, 0], [x1 + 70, 385], [x0 + 40, 385]]);
    ctx.fill();
  }

  // Sandy floor.
  ctx.fillStyle = '#d8bd85';
  ctx.fillRect(0, 385, PANEL_WIDTH, 75);
  ctx.fillStyle = '#c4a76c';
  for (let i = 0; i < 26; i++) {
    const sx = (i * 53 + 17) % 540;
    const sy = 392 + ((i * 31) % 60);
    circle(ctx, sx, sy, 2.5);
    ctx.fill();
  }

  // Seaweed: three strands, the middle one missing on the right.
  const weed = (x, height, lean) => {
    ctx.strokeStyle = '#2e8a4a';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, 392);
    ctx.quadraticCurveTo(x + lean, 392 - height / 2, x + lean * 1.6, 392 - height);
    ctx.stroke();
  };
  weed(40, 70, 12);
  if (side === 'left') weed(140, 84, -10);
  weed(520, 64, -12);

  // Corals: left pink, centre pink on the left / orange on the right,
  // right purple.
  drawCoral(ctx, 80, 385, '#ff7fa5', 1);
  drawCoral(ctx, 280, 388, side === 'right' ? '#ff9f43' : '#ff7fa5', 1.15);
  drawCoral(ctx, 470, 385, '#9a6fd6', 0.9);

  // The turtle, mid-water.
  ctx.fillStyle = '#5da85d';
  ellipse(ctx, 350, 280, 42, 28);
  ctx.fill();
  ctx.fillStyle = '#7cc47c';
  circle(ctx, 396, 272, 13);
  ctx.fill();
  ctx.fillStyle = '#10202e';
  circle(ctx, 400, 268, 2.5);
  ctx.fill();
  ctx.fillStyle = '#4a8a4a';
  ellipse(ctx, 322, 296, 16, 8);
  ctx.fill();
  ellipse(ctx, 378, 298, 16, 8);
  ctx.fill();
  // Shell spots; one is missing on the right panel.
  ctx.fillStyle = '#2e6b34';
  circle(ctx, 336, 268, 6);
  ctx.fill();
  circle(ctx, 366, 288, 6);
  ctx.fill();
  if (side === 'left') {
    circle(ctx, 350, 275, 6);
    ctx.fill();
  }

  // Fish, in their usual places.
  fish(ctx, 120, 120, 18, '#ffd94a', 1);
  fish(ctx, 220, 90, 15, '#6db7ff', -1);
  fish(ctx, 330, 150, 17, '#ff8a5c', 1);
  fish(ctx, 430, 100, 14, '#ff9ecf', -1);
  fish(ctx, 180, 220, 16, '#7ce0a3', 1);
  // The extra fish, present only on the right panel.
  if (side === 'right') fish(ctx, 400, 200, 15, '#ffd94a', -1);

  // Bubbles rising; one is missing on the right.
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 1.5;
  for (const [bx, by, br] of [[320, 140, 6], [280, 220, 5], [360, 120, 7]]) {
    circle(ctx, bx, by, br);
    ctx.stroke();
  }
  if (side === 'left') {
    circle(ctx, 300, 180, 8);
    ctx.stroke();
  }

  // Treasure chest on the sand; open on the right, closed on the left.
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(448, 400, 64, 26);
  ctx.fillStyle = '#8a5a2e';
  ctx.fillRect(448, 400, 64, 6);
  ctx.fillStyle = '#ffd94a';
  ctx.fillRect(476, 406, 8, 14);
  if (side === 'right') {
    ctx.save();
    ctx.translate(448, 400);
    ctx.rotate(-0.9);
    ctx.fillStyle = '#6b4423';
    ctx.fillRect(0, -16, 64, 16);
    ctx.restore();
    ctx.fillStyle = '#ffd94a';
    star(ctx, 470, 396, 5);
    ctx.fill();
    star(ctx, 490, 392, 4);
    ctx.fill();
  } else {
    ctx.fillStyle = '#6b4423';
    ctx.beginPath();
    ctx.arc(480, 400, 32, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#8a5a2e';
    ctx.beginPath();
    ctx.arc(480, 400, 32, Math.PI, 0);
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  // Starfish on the sand; missing on the right.
  if (side === 'left') {
    ctx.fillStyle = '#ff8a5c';
    star(ctx, 200, 420, 14);
    ctx.fill();
    ctx.fillStyle = '#e06a3c';
    circle(ctx, 200, 420, 3);
    ctx.fill();
  }
}

// ---------------------------------------------------------------- scene 3

const CAMP_STARS = [
  [30, 40], [120, 80], [160, 30], [260, 50], [330, 90], [420, 40],
  [500, 110], [60, 140], [380, 130], [470, 70], [240, 110], [140, 150],
];

function drawPine(ctx, x, y, height, tiers) {
  ctx.fillStyle = '#5d3a1e';
  ctx.fillRect(x - 5, y, 10, 18);
  ctx.fillStyle = '#1e5c2e';
  for (let i = 0; i < tiers; i++) {
    const w = 34 + i * 22;
    const ty = y - i * (height / tiers) * 0.85;
    poly(ctx, [[x - w / 2, ty], [x + w / 2, ty], [x, ty - height / tiers]]);
    ctx.fill();
  }
}

function drawCamp(ctx, side) {
  const sky = ctx.createLinearGradient(0, 0, 0, 360);
  sky.addColorStop(0, '#0a1030');
  sky.addColorStop(1, '#24355e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_WIDTH, 360);

  // Stars; one is missing on the right.
  ctx.fillStyle = '#ffffff';
  for (const [x, y] of CAMP_STARS) {
    if (side === 'right' && x === 200 && y === 60) continue;
    star(ctx, x, y, 2.2);
    ctx.fill();
  }

  // Moon with craters; one crater is missing on the right.
  ctx.fillStyle = '#f7e8a4';
  circle(ctx, 80, 50, 24);
  ctx.fill();
  ctx.fillStyle = '#d9c47a';
  circle(ctx, 72, 44, 4);
  ctx.fill();
  if (side === 'left') {
    circle(ctx, 88, 44, 3.5);
    ctx.fill();
  }
  circle(ctx, 78, 60, 3);
  ctx.fill();

  // Ground.
  ctx.fillStyle = '#1d2b1a';
  ctx.fillRect(0, 360, PANEL_WIDTH, 100);
  ctx.fillStyle = '#2a3d24';
  for (let i = 0; i < 14; i++) {
    ellipse(ctx, (i * 47 + 13) % 550, 372 + ((i * 29) % 80), 14, 5);
    ctx.fill();
  }

  // Pine trees: the right one loses a tier on the right panel.
  drawPine(ctx, 70, 330, 120, 3);
  drawPine(ctx, 490, 330, 120, side === 'right' ? 2 : 3);
  drawPine(ctx, 300, 300, 70, 2);

  // The tent: big triangle, door closed on the left, open on the right.
  ctx.fillStyle = '#c25e2e';
  poly(ctx, [[200, 420], [360, 420], [280, 300]]);
  ctx.fill();
  ctx.fillStyle = '#a34a22';
  poly(ctx, [[280, 300], [360, 420], [280, 420]]);
  ctx.fill();
  ctx.strokeStyle = '#7a3416';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(280, 300);
  ctx.lineTo(280, 420);
  ctx.stroke();
  if (side === 'right') {
    ctx.fillStyle = '#1a0f08';
    poly(ctx, [[262, 420], [298, 420], [280, 336]]);
    ctx.fill();
    ctx.fillStyle = '#3a6fd6';
    ellipse(ctx, 280, 412, 14, 6);
    ctx.fill();
  } else {
    ctx.fillStyle = '#8a3d1c';
    poly(ctx, [[262, 420], [298, 420], [280, 336]]);
    ctx.fill();
    ctx.strokeStyle = '#5d2812';
    ctx.beginPath();
    ctx.moveTo(280, 336);
    ctx.lineTo(280, 420);
    ctx.stroke();
  }

  // Campfire: stones, logs, flames. The middle flame is smaller on
  // the right, and one log is missing from the pile.
  ctx.fillStyle = '#8a8a8a';
  for (const [sx, sy] of [[168, 424], [184, 430], [216, 430], [232, 424]]) {
    circle(ctx, sx, sy, 7);
    ctx.fill();
  }
  ctx.fillStyle = '#6b4423';
  ctx.save();
  ctx.translate(200, 414);
  ctx.rotate(0.35);
  ctx.fillRect(-26, -5, 52, 10);
  ctx.restore();
  if (side === 'left') {
    ctx.save();
    ctx.translate(240, 418);
    ctx.rotate(-0.3);
    ctx.fillRect(-22, -5, 44, 10);
    ctx.restore();
  }
  const flame = (x, y, h, colour) => {
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.moveTo(x, y - h);
    ctx.quadraticCurveTo(x + 12, y - h * 0.4, x, y);
    ctx.quadraticCurveTo(x - 12, y - h * 0.4, x, y - h);
    ctx.fill();
  };
  flame(186, 414, 26, '#f08a1d');
  flame(200, 414, side === 'right' ? 16 : 34, '#f2c230');
  flame(214, 414, 24, '#f08a1d');
  flame(200, 414, 16, '#ffe08a');

  // Marshmallow on a stick; missing on the right.
  if (side === 'left') {
    ctx.strokeStyle = '#8a5a2e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(128, 410);
    ctx.lineTo(152, 386);
    ctx.stroke();
    ctx.fillStyle = '#fff6e8';
    roundRect(ctx, 144, 378, 14, 18, 5);
    ctx.fill();
    ctx.fillStyle = '#d9a441';
    ctx.fillRect(150, 384, 2, 6);
    ctx.fill();
  }

  // Backpack; its strap is missing on the right.
  ctx.fillStyle = '#3a6fd6';
  roundRect(ctx, 396, 372, 48, 56, 12);
  ctx.fill();
  ctx.fillStyle = '#2a55a8';
  roundRect(ctx, 404, 396, 32, 22, 6);
  ctx.fill();
  ctx.fillStyle = '#ffd94a';
  ctx.fillRect(414, 380, 12, 8);
  ctx.fill();
  if (side === 'left') {
    ctx.strokeStyle = '#223d66';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(404, 374);
    ctx.quadraticCurveTo(392, 388, 404, 402);
    ctx.stroke();
  }

  // Camp lantern on a stump: glowing on the left, dark on the right.
  ctx.fillStyle = '#5d3a1e';
  ctx.fillRect(318, 404, 26, 20);
  if (side === 'left') {
    ctx.fillStyle = 'rgba(255, 220, 120, 0.22)';
    circle(ctx, 331, 390, 24);
    ctx.fill();
  }
  ctx.fillStyle = side === 'left' ? '#ffd94a' : '#5a5a5a';
  roundRect(ctx, 324, 378, 14, 20, 4);
  ctx.fill();
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(322, 374, 18, 4);
}

// ---------------------------------------------------------------- entry

/** Draw one panel of a scene: `side` is 'left' or 'right'. */
export function drawScene(ctx, sceneId, side) {
  ctx.clearRect(0, 0, PANEL_WIDTH, PANEL_HEIGHT);
  if (sceneId === 'lantern') drawLanternRow(ctx, side);
  else if (sceneId === 'reef') drawReef(ctx, side);
  else drawCamp(ctx, side);
}

/**
 * Draw the found-difference markers: a gold ring and a check on both
 * panels. `marks` maps difference id -> startedAt (performance.now ms);
 * a mark whose start is far in the past renders in its final state,
 * which is what the deterministic screenshot modes use.
 */
export function drawMarkers(ctx, scene, marks, nowMs) {
  for (const diff of scene.differences) {
    const startedAt = marks.get(diff.id);
    if (startedAt === undefined) continue;
    const age = nowMs - startedAt;
    const p = Math.min(1, Math.max(0, age / 350));
    const ringR = diff.r * (0.75 + 0.45 * p);
    ctx.save();
    ctx.strokeStyle = `rgba(255, 217, 74, ${0.55 + 0.45 * p})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(diff.x, diff.y, ringR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(diff.x, diff.y, ringR + 4, 0, Math.PI * 2);
    ctx.stroke();
    if (p >= 1) {
      // The check mark, drawn once the ring has settled.
      ctx.strokeStyle = '#ffd94a';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(diff.x - 10, diff.y);
      ctx.lineTo(diff.x - 3, diff.y + 8);
      ctx.lineTo(diff.x + 11, diff.y - 8);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/** A pulsing ring over the hinted difference. */
export function drawHintRing(ctx, diff, nowMs) {
  const pulse = 1 + 0.18 * Math.sin(nowMs / 160);
  ctx.save();
  ctx.strokeStyle = 'rgba(124, 224, 195, 0.95)';
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 6]);
  ctx.beginPath();
  ctx.arc(diff.x, diff.y, diff.r * pulse + 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** Floating score popups: {x, y, text, startedAt} in panel space. */
export function drawPopups(ctx, popups, nowMs) {
  for (const popup of popups) {
    const age = nowMs - popup.startedAt;
    if (age < 0 || age > 1000) continue;
    const p = age / 1000;
    ctx.save();
    ctx.globalAlpha = 1 - p;
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffd94a';
    ctx.fillText(popup.text, popup.x, popup.y - p * 34);
    ctx.restore();
  }
}
