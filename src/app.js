// By Lot. — main app logic.
// Renders 9 chapters, persists submissions to Supabase, handles scroll-driven
// reveals, ticks navigation, and the closing constellation sequence.

import { CHAPTERS, placeholderFor, sendLabelFor } from './chapters.js';
import {
  fetchWallPage,
  fetchEchoes,
  insertSubmission,
  fetchSpeechClosing,
  PAGE_SIZE,
} from './supabase.js';

const SESSION_KEY = 'bylot_session_v2';

// ---------- Session-local "mine" tracking (sessionStorage; cleared when tab closes) ----------
function loadSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}'); }
  catch { return {}; }
}
function rememberMine(slug, id) {
  const sess = loadSession();
  sess[slug] = id;
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(sess)); } catch {}
}
function isMine(slug, id) {
  return loadSession()[slug] === id;
}

// ---------- Per-chapter wall state ----------
const wallState = new Map(); // slug -> { offset, entries, exhausted }

function getState(slug) {
  if (!wallState.has(slug)) {
    wallState.set(slug, { offset: 0, entries: [], exhausted: false });
  }
  return wallState.get(slug);
}

// ---------- Scroll observer ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    const t = en.target;
    const delay = parseInt(t.dataset.delay || '0', 10);
    setTimeout(() => t.classList.add('in'), delay);
    io.unobserve(t);
  });
}, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

function observeFadeIn(el, delay) {
  el.dataset.delay = String(delay || 0);
  io.observe(el);
}

// ---------- Build chapters ----------
const root = document.getElementById('chapters');

CHAPTERS.forEach((c, idx) => {
  const sec = document.createElement('section');
  sec.className = 'chapter';
  sec.id = c.slug;
  sec.dataset.idx = String(idx);
  const wallLabelHtml = c.slug === 'believe'
    ? '<div class="wall-label">The Wall — voices of others</div>'
    : '';
  sec.innerHTML = `
    <div class="col">
      <div class="chap-num">Chapter ${c.n}</div>
      <h2 class="chap-title">${escapeHtml(c.title)}</h2>
      <div class="chap-rule"></div>
      <div class="preamble">
        ${c.preamble.map(renderPreambleLine).join('')}
      </div>
      <div class="prompt">${escapeHtml(c.prompt)}</div>
      <form class="form" data-slug="${c.slug}" novalidate>
        <textarea rows="6" placeholder="${escapeHtml(placeholderFor(c.slug))}" aria-label="Your response to ${escapeHtml(c.title)}"></textarea>
        <div class="form-actions">
          <button type="submit" class="form-send" disabled>${escapeHtml(sendLabelFor(c.slug))}</button>
        </div>
        <div class="form-error" hidden></div>
      </form>
      <div class="post" data-slug="${c.slug}"></div>
      <div class="wall" data-slug="${c.slug}">
        ${wallLabelHtml}
        <div class="entries"></div>
        <button type="button" class="show-more" hidden>Show more</button>
      </div>
    </div>
  `;
  root.appendChild(sec);
});

// ---------- Ticks ----------
const ticks = document.getElementById('ticks');
CHAPTERS.forEach((c) => {
  const b = document.createElement('button');
  b.dataset.slug = c.slug;
  b.title = `Chapter ${c.n} — ${c.title}`;
  b.setAttribute('aria-label', `Jump to Chapter ${c.n}: ${c.title}`);
  b.addEventListener('click', () => {
    document.getElementById(c.slug).scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  ticks.appendChild(b);
});

// ---------- Form wiring ----------
document.querySelectorAll('form.form').forEach((form) => {
  const slug = form.dataset.slug;
  const ta = form.querySelector('textarea');
  const btn = form.querySelector('button');
  const err = form.querySelector('.form-error');

  ta.addEventListener('input', () => {
    autosize(ta);
    btn.disabled = ta.value.trim().length === 0;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = ta.value.trim();
    if (!text) return;
    btn.disabled = true;
    err.hidden = true;
    try {
      const inserted = await insertSubmission(slug, text);
      rememberMine(slug, inserted.id);

      // Collapse form
      form.style.transition = 'opacity 700ms var(--ease), transform 700ms var(--ease)';
      form.style.opacity = '0';
      form.style.transform = 'translateY(-6px)';
      setTimeout(() => { form.style.display = 'none'; }, 750);

      // Reveal post-submission element
      revealPost(slug, inserted.id);

      // Re-render wall with the new entry highlighted briefly
      setTimeout(async () => {
        await refreshWall(slug, inserted.id);
        setTimeout(() => {
          const el = document.querySelector(`.wall[data-slug="${slug}"] .entry[data-id="${cssAttr(inserted.id)}"]`);
          if (el) el.classList.add('settled');
        }, 2200);
      }, 800);

      if (slug === 'speech') {
        setTimeout(() => triggerClosing(inserted.id), 1200);
      }
    } catch (ex) {
      console.error('[by-lot] submission failed', ex);
      err.textContent = 'Could not save. Please try again in a moment.';
      err.hidden = false;
      btn.disabled = false;
    }
  });
});

function renderPreambleLine(line) {
  if (typeof line === 'string') {
    return `<p>${escapeHtml(line)}</p>`;
  }
  const classes = [];
  if (line.silenced) classes.push('silenced');
  if (line.stanzaBreak) classes.push('stanza-break');
  const cls = classes.length ? ` class="${classes.join(' ')}"` : '';
  return `<p${cls}>${escapeHtml(line.text)}</p>`;
}

function autosize(ta) {
  ta.style.height = 'auto';
  ta.style.height = Math.max(ta.scrollHeight, 140) + 'px';
}

// ---------- Wall rendering ----------
async function loadInitialWall(slug) {
  const wall = document.querySelector(`.wall[data-slug="${slug}"]`);
  const list = wall.querySelector('.entries');
  const more = wall.querySelector('.show-more');
  const state = getState(slug);
  state.entries = [];
  state.offset = 0;
  state.exhausted = false;
  list.innerHTML = '';
  let rows;
  try {
    rows = await fetchWallPage(slug, 0);
  } catch (ex) {
    console.error('[by-lot] wall load failed', slug, ex);
    return;
  }
  state.entries = rows;
  state.offset = rows.length;
  if (rows.length < PAGE_SIZE) state.exhausted = true;
  renderWallList(slug);
  more.hidden = state.exhausted;
  more.onclick = () => loadMore(slug);
}

async function loadMore(slug) {
  const wall = document.querySelector(`.wall[data-slug="${slug}"]`);
  const more = wall.querySelector('.show-more');
  const state = getState(slug);
  if (state.exhausted) return;
  more.disabled = true;
  try {
    const rows = await fetchWallPage(slug, state.offset);
    state.entries = state.entries.concat(rows);
    state.offset += rows.length;
    if (rows.length < PAGE_SIZE) state.exhausted = true;
    renderWallList(slug);
  } catch (ex) {
    console.error('[by-lot] wall page failed', slug, ex);
  } finally {
    more.disabled = false;
    more.hidden = state.exhausted;
  }
}

async function refreshWall(slug, highlightId) {
  // Reload first page so the just-submitted row appears at the top.
  const wall = document.querySelector(`.wall[data-slug="${slug}"]`);
  const more = wall.querySelector('.show-more');
  const state = getState(slug);
  try {
    const fresh = await fetchWallPage(slug, 0);
    // Splice new rows on top of any pages already loaded beyond 8.
    const existingBeyond = state.entries.slice(PAGE_SIZE);
    state.entries = dedupeById(fresh.concat(existingBeyond));
    state.offset = Math.max(state.offset, fresh.length);
    if (fresh.length < PAGE_SIZE && existingBeyond.length === 0) state.exhausted = true;
  } catch (ex) {
    console.error('[by-lot] wall refresh failed', slug, ex);
  }
  renderWallList(slug, highlightId);
  more.hidden = state.exhausted;
}

function dedupeById(rows) {
  const seen = new Set();
  const out = [];
  for (const r of rows) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    out.push(r);
  }
  return out;
}

function renderWallList(slug, highlightId) {
  const wall = document.querySelector(`.wall[data-slug="${slug}"]`);
  const list = wall.querySelector('.entries');
  const state = getState(slug);
  list.innerHTML = '';
  if (state.entries.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'wall-empty';
    empty.textContent = 'No one has written here yet. You could be the first.';
    list.appendChild(empty);
    return;
  }
  state.entries.forEach((entry, i) => {
    const div = document.createElement('div');
    div.className = 'entry';
    div.dataset.id = entry.id;
    const mine = entry.id === highlightId || isMine(slug, entry.id);
    if (mine) div.classList.add('mine');
    div.innerHTML = formatEntryText(entry.content);
    list.appendChild(div);
    observeFadeIn(div, i * 80);
  });
}

function formatEntryText(text) {
  const safe = String(text || '');
  if (safe.length <= 500) return escapeHtml(safe);
  const head = escapeHtml(safe.slice(0, 500));
  const rest = escapeHtml(safe.slice(500));
  return `${head}<span class="rest" hidden>${rest}</span>… <button type="button" class="more">continue reading</button>`;
}

document.addEventListener('click', (e) => {
  if (e.target instanceof HTMLElement && e.target.classList.contains('more')) {
    const entry = e.target.closest('.entry');
    const rest = entry?.querySelector('.rest');
    if (rest) {
      rest.hidden = false;
      rest.style.display = 'inline';
      e.target.remove();
    }
  }
});

// ---------- Post-submission reveal ----------
async function revealPost(slug, justSubmittedId) {
  const c = CHAPTERS.find((x) => x.slug === slug);
  const target = document.querySelector(`.post[data-slug="${slug}"]`);
  if (!target || !c) return;
  const post = c.post;
  if (post.kind === 'quote') {
    target.innerHTML = `<div class="quote">${escapeHtml(post.text)}<span class="attr">${escapeHtml(post.attr)}</span></div>`;
    animateIn(target.firstElementChild);
  } else if (post.kind === 'line') {
    target.innerHTML = `<div class="line">${escapeHtml(post.text)}</div>`;
    animateIn(target.firstElementChild);
  } else if (post.kind === 'silence') {
    target.innerHTML = `<div class="silence-gap">·</div>`;
  } else if (post.kind === 'echoes') {
    // Three other recent Believe-submissions fade in below.
    target.innerHTML = `<div class="echoes"></div>`;
    const wrap = target.querySelector('.echoes');
    let echoes = [];
    try {
      echoes = await fetchEchoes(slug, justSubmittedId, 3);
    } catch (ex) {
      console.error('[by-lot] echoes fetch failed', ex);
    }
    if (echoes.length === 0) {
      // Nothing else has been submitted yet — leave space empty rather than fabricate.
      target.innerHTML = '';
      return;
    }
    echoes.forEach((row, i) => {
      const el = document.createElement('div');
      el.className = 'echo';
      el.textContent = row.content;
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';
      el.style.transition = 'opacity 900ms var(--ease), transform 900ms var(--ease)';
      wrap.appendChild(el);
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 800 + i * 700);
    });
  } else if (post.kind === 'objections') {
    target.innerHTML = `
      <p class="obj-prompt">${escapeHtml(post.lead)} <button type="button" class="seehow">→ see how</button></p>
      <div class="obj-list">
        ${post.list.map((pair, i) => `
          <div class="obj-item">
            <div class="obj-q"><span>${String(i + 1).padStart(2, '0')}</span>${escapeHtml(pair[0])}</div>
            <div class="obj-a">${escapeHtml(pair[1])}</div>
          </div>
        `).join('')}
      </div>`;
    const btn = target.querySelector('.seehow');
    const list = target.querySelector('.obj-list');
    btn.addEventListener('click', () => {
      const open = list.classList.toggle('open');
      btn.textContent = open ? '↑ collapse' : '→ see how';
    });
    animateIn(target.querySelector('.obj-prompt'));
  } else if (post.kind === 'closing') {
    // handled by triggerClosing()
  }
}

function animateIn(el) {
  if (!el) return;
  el.style.opacity = '0';
  el.style.transform = 'translateY(8px)';
  el.style.transition = 'opacity 1100ms var(--ease), transform 1100ms var(--ease)';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  }));
}

// ---------- Stagger preamble + prompt + form + wall reveals ----------
document.querySelectorAll('.preamble').forEach((p) => {
  p.querySelectorAll('p').forEach((line, i) => observeFadeIn(line, i * 180));
});
document.querySelectorAll('.prompt').forEach((el) => observeFadeIn(el, 200));
document.querySelectorAll('form.form').forEach((el) => observeFadeIn(el, 350));
document.querySelectorAll('.wall').forEach((el) => observeFadeIn(el, 0));

// ---------- Ticks active state ----------
const ticksEl = document.getElementById('ticks');
function updateTicks() {
  const y = window.scrollY + window.innerHeight * 0.4;
  let activeIdx = -1;
  CHAPTERS.forEach((c, i) => {
    const el = document.getElementById(c.slug);
    if (!el) return;
    const top = el.offsetTop;
    if (y >= top) activeIdx = i;
  });
  [...ticksEl.children].forEach((b, i) => b.classList.toggle('active', i === activeIdx));
  if (window.scrollY > window.innerHeight * 0.6) ticksEl.classList.add('visible');
  else ticksEl.classList.remove('visible');
}
window.addEventListener('scroll', updateTicks, { passive: true });
updateTicks();

// ---------- Smooth scroll on data-scroll links ----------
document.querySelectorAll('a[data-scroll]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const tgt = document.querySelector(href);
    if (!tgt) return;
    e.preventDefault();
    tgt.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ---------- Closing sequence ----------
async function triggerClosing(myId) {
  const sec = document.getElementById('closing');
  sec.hidden = false;
  setTimeout(() => sec.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);

  const line1 = document.getElementById('closing-line-1');
  const line2 = document.getElementById('closing-line-2');
  const line3 = document.getElementById('closing-line-3');
  const stage = document.getElementById('closing-stage');
  const speeches = document.getElementById('closing-speeches');

  // Aristotle (large)
  setTimeout(() => line1.classList.add('in'), 1400);
  setTimeout(() => line1.classList.remove('in'), 1400 + 5500);
  setTimeout(() => {
    line1.style.display = 'none';
    line2.style.display = 'block';
  }, 1400 + 5500 + 1500);
  // Zuboff (medium)
  setTimeout(() => line2.classList.add('in'), 1400 + 5500 + 1700);
  setTimeout(() => line2.classList.remove('in'), 1400 + 5500 + 1700 + 5500);
  setTimeout(() => {
    line2.style.display = 'none';
    line3.style.display = 'block';
  }, 1400 + 5500 + 1700 + 5500 + 1500);
  // Van Reybrouck (small)
  setTimeout(() => line3.classList.add('in'), 1400 + 5500 + 1700 + 5500 + 1700);
  setTimeout(() => line3.classList.remove('in'), 1400 + 5500 + 1700 + 5500 + 1700 + 5500);

  let speechRows = [];
  try {
    speechRows = await fetchSpeechClosing(500);
  } catch (ex) {
    console.error('[by-lot] speech closing fetch failed', ex);
  }

  const total = 1400 + 5500 + 1700 + 5500 + 1700 + 5500 + 2000;
  setTimeout(() => {
    if (window.byLotField && !window.byLotField.reduced) {
      window.byLotField.enterConstellation(speechRows.length);
    }
  }, total - 800);
  setTimeout(() => {
    stage.style.position = 'relative';
    stage.style.minHeight = '0';
    stage.style.padding = '0';
    line3.style.display = 'none';
    speeches.classList.add('shown');
    const list = document.getElementById('speech-list');
    list.innerHTML = '';
    speechRows.forEach((e, i) => {
      const d = document.createElement('div');
      d.className = 'entry';
      if (e.id === myId || isMine('speech', e.id)) d.classList.add('mine');
      d.textContent = e.content;
      d.dataset.id = e.id;
      list.appendChild(d);
      observeFadeIn(d, i * 60);
    });
    setTimeout(() => speeches.scrollIntoView({ behavior: 'smooth', block: 'start' }), 1200);
  }, total + 600);
}

// ---------- Helpers ----------
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function cssAttr(s) { return String(s).replace(/"/g, '\\"'); }

// ---------- Boot: load every wall in parallel ----------
export function boot() {
  CHAPTERS.forEach((c) => { loadInitialWall(c.slug); });
}
