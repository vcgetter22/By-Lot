// By Lot. — entry point.
// app.js is the critical path (chapters, walls, forms).
// field.js (Three.js) is heavier and not interactive — load it after first paint.
import { boot } from './app.js';

boot();

// Defer the WebGL field so Three.js doesn't block the first wall render.
// The static .field-fallback CSS layer stays visible until the field replaces it.
const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));
idle(() => {
  import('./field.js').then((m) => m.initField()).catch((e) => {
    console.warn('[by-lot] field failed to load', e);
  });
});
