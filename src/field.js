// By Lot. — field of points hero. Three.js InstancedMesh of tiny quads.
// Cursor produces a soft gravitational well; scroll pulls the camera back.
// One illuminated burgundy point near centre, gently pulsing.
// On the closing call, replays in "constellation" mode: extra burgundy points.
//
// Honors prefers-reduced-motion: no field at all if user prefers reduced motion;
// the static .field-fallback CSS layer underneath remains visible instead.

import * as THREE from 'three';

export function initField() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    window.byLotField = {
      enterConstellation() {},
      setHeroMode() {},
      reduced: true,
    };
    return;
  }

  const COUNT = 18000;
  const FIELD_W = 28;
  const FIELD_H = 16;
  const FIELD_D = 6;
  const POINT_SIZE = 0.018;
  const CREAM = new THREE.Color('#F4EFE3');
  const BURGUNDY = new THREE.Color('#8B2D2D');

  const container = document.getElementById('field-canvas');
  if (!container) return;

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 14);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    // No WebGL — leave the static fallback in place.
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const geom = new THREE.PlaneGeometry(POINT_SIZE, POINT_SIZE);
  const mat = new THREE.MeshBasicMaterial({
    color: CREAM,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const mesh = new THREE.InstancedMesh(geom, mat, COUNT);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  const basePos = new Float32Array(COUNT * 3);
  const curPos = new Float32Array(COUNT * 3);
  const drift = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const isLit = new Uint8Array(COUNT);

  function rand() { return (Math.random() - 0.5) * 2; }
  function gaussian() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  for (let i = 0; i < COUNT; i++) {
    let x, y, z;
    if (Math.random() < 0.7) {
      x = rand() * FIELD_W * 0.5;
      y = rand() * FIELD_H * 0.5;
      z = rand() * FIELD_D * 0.5;
    } else {
      x = gaussian() * FIELD_W * 0.18;
      y = gaussian() * FIELD_H * 0.18;
      z = gaussian() * FIELD_D * 0.3;
    }
    basePos[i*3] = x; basePos[i*3+1] = y; basePos[i*3+2] = z;
    curPos[i*3] = x;  curPos[i*3+1] = y;  curPos[i*3+2] = z;
    drift[i*3]   = (Math.random() - 0.5) * 0.0006;
    drift[i*3+1] = (Math.random() - 0.5) * 0.0006;
    drift[i*3+2] = (Math.random() - 0.5) * 0.0003;

    colors[i*3] = CREAM.r; colors[i*3+1] = CREAM.g; colors[i*3+2] = CREAM.b;
  }

  const phase = new Float32Array(COUNT * 2);
  for (let i = 0; i < COUNT; i++) {
    phase[i*2]   = Math.random() * Math.PI * 2;
    phase[i*2+1] = Math.random() * Math.PI * 2;
  }

  const litIdx = Math.floor(COUNT * 0.382);
  basePos[litIdx*3]   = 1.8;
  basePos[litIdx*3+1] = -0.6;
  basePos[litIdx*3+2] = 0.4;
  curPos[litIdx*3]    = basePos[litIdx*3];
  curPos[litIdx*3+1]  = basePos[litIdx*3+1];
  curPos[litIdx*3+2]  = basePos[litIdx*3+2];
  isLit[litIdx] = 1;
  colors[litIdx*3] = BURGUNDY.r;
  colors[litIdx*3+1] = BURGUNDY.g;
  colors[litIdx*3+2] = BURGUNDY.b;

  mesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);

  const dummy = new THREE.Object3D();
  for (let i = 0; i < COUNT; i++) {
    dummy.position.set(curPos[i*3], curPos[i*3+1], curPos[i*3+2]);
    dummy.scale.setScalar(isLit[i] ? 3.0 : 1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  scene.add(mesh);

  const cursor = new THREE.Vector3(0, 0, 0);
  const cursorWorld = new THREE.Vector3(0, 0, 0);
  let cursorActive = false;
  let lastCursorMove = -Infinity;
  let cursorIntensity = 0;
  let cursorSpeedBoost = 0;
  let lastCx = 0, lastCy = 0;

  function noteCursor(clientX, clientY) {
    const x = (clientX / window.innerWidth) * 2 - 1;
    const y = -(clientY / window.innerHeight) * 2 + 1;
    cursor.set(x, y, 0.5);
    cursor.unproject(camera);
    const dir = cursor.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    cursorWorld.copy(camera.position).add(dir.multiplyScalar(distance));
    cursorActive = true;
    const dxm = x - lastCx, dym = y - lastCy;
    const moved = Math.sqrt(dxm*dxm + dym*dym);
    const tnow = performance.now();
    const dtm = Math.max(1, tnow - (lastCursorMove === -Infinity ? tnow : lastCursorMove));
    if (moved > 0.004) {
      const speed = moved / (dtm / 1000);
      cursorSpeedBoost = Math.min(2.4, cursorSpeedBoost + speed * 0.18);
      lastCursorMove = tnow;
      lastCx = x; lastCy = y;
    }
  }
  window.addEventListener('mousemove', (e) => noteCursor(e.clientX, e.clientY));
  window.addEventListener('mouseleave', () => { cursorActive = false; });
  window.addEventListener('touchmove', (e) => {
    if (!e.touches[0]) return;
    noteCursor(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  let cameraTargetZ = 14;
  function onScroll() {
    const ch9 = document.getElementById('speech');
    const ch1 = document.getElementById('believe');
    if (!ch1) { cameraTargetZ = 14; return; }
    const y = window.scrollY + window.innerHeight * 0.4;
    const startY = ch1.offsetTop;
    const endY = (ch9 && ch9.offsetTop) || startY + window.innerHeight * 8;
    let progress = (y - startY) / Math.max(1, endY - startY);
    progress = Math.max(0, Math.min(1, progress));
    const eased = progress * progress * (3 - 2 * progress);
    let z = 14 + eased * 10;

    if (ch9) {
      const past = (y - ch9.offsetTop) / Math.max(1, window.innerHeight * 1.2);
      const inProg = Math.max(0, Math.min(1, past));
      const inEased = inProg * inProg * (3 - 2 * inProg);
      z = z + (10 - z) * inEased;
    }
    cameraTargetZ = z;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  let mode = 'hero';

  window.byLotField = {
    enterConstellation(speechCount) {
      mode = 'constellation';
      const want = Math.min(speechCount, 200, COUNT - 1);
      const set = new Set([litIdx]);
      while (set.size < want + 1) {
        set.add(Math.floor(Math.random() * COUNT));
      }
      [...set].forEach((idx) => {
        if (!isLit[idx]) {
          isLit[idx] = 1;
          colors[idx*3] = BURGUNDY.r;
          colors[idx*3+1] = BURGUNDY.g;
          colors[idx*3+2] = BURGUNDY.b;
        }
      });
      mesh.instanceColor.needsUpdate = true;
    },
    setHeroMode() { mode = 'hero'; },
    reduced: false,
  };

  let t0 = performance.now();
  const opacityTarget = 0.55;
  function animate(now) {
    const dt = Math.min((now - t0) / 1000, 0.05);
    t0 = now;
    const elapsed = now / 1000;

    if (mat.opacity < opacityTarget) mat.opacity += dt * 0.4;

    const targetZ = mode === 'constellation' ? 22 : cameraTargetZ;
    camera.position.z += (targetZ - camera.position.z) * Math.min(1, dt * 1.4);

    const restMs = now - lastCursorMove;
    if (cursorActive && restMs < 3000) {
      cursorIntensity += (1 - cursorIntensity) * Math.min(1, dt * 0.45);
    } else {
      cursorIntensity += (0 - cursorIntensity) * Math.min(1, dt * 0.14);
    }
    cursorSpeedBoost += (0 - cursorSpeedBoost) * Math.min(1, dt * 0.9);
    const cursorStrength = cursorIntensity * (1 + cursorSpeedBoost * 0.5);

    const pulse = 0.78 + 0.22 * (0.5 + 0.5 * Math.sin(elapsed * (Math.PI * 2 / 6)));

    for (let i = 0; i < COUNT; i++) {
      curPos[i*3]   += drift[i*3];
      curPos[i*3+1] += drift[i*3+1];
      curPos[i*3+2] += drift[i*3+2];

      const px = phase[i*2], py = phase[i*2+1];
      const nx = Math.sin(elapsed * 0.23 + px) * 0.00045
               + Math.sin(elapsed * 0.71 + py * 1.7) * 0.00018;
      const ny = Math.cos(elapsed * 0.27 + py) * 0.00045
               + Math.cos(elapsed * 0.83 + px * 1.3) * 0.00018;
      curPos[i*3]   += nx;
      curPos[i*3+1] += ny;

      const dxb = basePos[i*3]   - curPos[i*3];
      const dyb = basePos[i*3+1] - curPos[i*3+1];
      const dzb = basePos[i*3+2] - curPos[i*3+2];
      curPos[i*3]   += dxb * 0.006;
      curPos[i*3+1] += dyb * 0.006;
      curPos[i*3+2] += dzb * 0.006;

      // Cursor gravity: bell-shaped halo around the cursor.
      // Force is zero at the cursor centre, ramps up to a peak at `ringPeak`
      // distance, then falls off to zero at `radius`. This produces a visible
      // circular disturbance around the cursor instead of a sharp inward yank.
      if (mode === 'hero' && cursorActive && cursorStrength > 0.01) {
        const dx = cursorWorld.x - curPos[i*3];
        const dy = cursorWorld.y - curPos[i*3+1];
        const distSq = dx * dx + dy * dy;
        const speedT = Math.min(1, cursorSpeedBoost / 2.0);
        const radius = 3.0 - speedT * 1.4;
        const ringPeak = 0.8;
        const pullScale = 0.014 + speedT * 0.020;
        if (distSq < radius * radius && distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          const t = dist / radius;
          const ramp = Math.min(1, dist / ringPeak);
          const env = ramp * (1 - t);
          let f = env * pullScale * cursorStrength;
          if (f > dist * 0.4) f = dist * 0.4;
          curPos[i*3]   += (dx / dist) * f;
          curPos[i*3+1] += (dy / dist) * f;
        }
      }

      const baseScale = isLit[i] ? 3.1 : 1;
      const scale = isLit[i] ? baseScale * pulse : baseScale;
      dummy.position.set(curPos[i*3], curPos[i*3+1], curPos[i*3+2]);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}
