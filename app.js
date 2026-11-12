/* The catalog is a local script, not a network request. */
(function () {
  'use strict';
  function filterPosters(records, query = '', genre = 'All') {
    const needle = query.trim().toLocaleLowerCase();
    return records.filter(p => (genre === 'All' || p.genre === genre) &&
      [p.title, p.genre, p.synopsis].some(value => String(value || '').toLocaleLowerCase().includes(needle)));
  }
  function storyText(p) {
    return [p.title, '='.repeat(p.title.length), '', 'Source image: ' + p.name, 'Suggested genre: ' + p.genre, '', 'VISUAL REVIEW', p.visualAnalysis, '', 'RECOMMENDED STORY CONCEPT', p.synopsis, '', 'Note: This is an original fictional synopsis inspired by the poster artwork, not a verified or official film plot.', ''].join('\r\n');
  }
  if (typeof module !== 'undefined') module.exports = { filterPosters, storyText };
  if (typeof document === 'undefined') return;
  const posters = Array.isArray(window.POSTERS) ? window.POSTERS : [];
  const gallery = document.querySelector('#gallery');
  const search = document.querySelector('#search');
  const genre = document.querySelector('#genre');
  const results = document.querySelector('#results');
  const viewer = document.querySelector('#viewer');
  let viewerPosters = [];
  let viewerIndex = 0;
  let opener = null;
  // Chrome ignores download on file:// links. A local Blob preserves offline saving.
  function downloadStory(event, p) {
    event.preventDefault();
    const url = URL.createObjectURL(new Blob([storyText(p)], {type: 'text/plain;charset=utf-8'}));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = p.name.replace(/\.[^.]+$/, '') + '.txt';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  document.querySelector('#viewer-download').addEventListener('click', event => downloadStory(event, viewerPosters[viewerIndex]));
  function showArtwork() {
    const p = viewerPosters[viewerIndex];
    document.querySelector('#viewer-title').textContent = p.title;
    document.querySelector('#viewer-genre').textContent = p.genre;
    document.querySelector('#viewer-analysis').textContent = p.visualAnalysis;
    document.querySelector('#viewer-position').textContent = String(viewerIndex + 1).padStart(2, '0') + ' / ' + String(viewerPosters.length).padStart(2, '0');
    const image = document.querySelector('#viewer-image');
    image.src = p.image;
    image.alt = p.title + ' — original poster artwork';
    const download = document.querySelector('#viewer-download');
    download.href = p.descriptionFile;
    download.download = p.name.replace(/\.[^.]+$/, '') + '.txt';
  }
  function openViewer(p, visible, control) {
    viewerPosters = visible;
    viewerIndex = visible.indexOf(p);
    opener = control;
    showArtwork();
    viewer.showModal();
    document.body.classList.add('viewer-open');
  }
  function navigateViewer(direction) {
    viewerIndex = (viewerIndex + direction + viewerPosters.length) % viewerPosters.length;
    showArtwork();
  }
  document.querySelector('#previous').addEventListener('click', () => navigateViewer(-1));
  document.querySelector('#next').addEventListener('click', () => navigateViewer(1));
  document.querySelector('#close-viewer').addEventListener('click', () => viewer.close());
  viewer.addEventListener('close', () => { document.body.classList.remove('viewer-open'); if (opener && opener.isConnected) opener.focus(); });
  viewer.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); navigateViewer(event.key === 'ArrowLeft' ? -1 : 1); }
  });
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  for (const category of [...new Set(posters.map(p => p.genre))].sort()) {
    genre.add(new Option(category, category));
  }
  document.querySelector('#collection-total').textContent = String(posters.length).padStart(2, '0');
  function render() {
    const visible = filterPosters(posters, search.value, genre.value);
    gallery.replaceChildren();
    for (const p of visible) {
      const card = element('article', 'poster-card');
      const stage = element('div', 'poster-stage');
      const front = element('div', 'poster-front');
      const image = element('img');
      image.src = p.thumbnail;
      image.alt = p.title + ' — poster artwork';
      image.loading = 'lazy';
      image.decoding = 'async';
      front.append(image);
      const inner = element('div', 'flip-inner');
      const back = element('div', 'poster-back');
      back.id = 'story-' + p.index;
      back.tabIndex = 0;
      back.setAttribute('role', 'region');
      back.setAttribute('aria-label', 'Original story concept for ' + p.title);
      back.append(element('span', 'eyebrow', 'AN ORIGINAL STORY CONCEPT'), element('h3', '', p.title), element('p', 'synopsis', p.synopsis), element('p', 'concept-note', 'Imagined from the artwork. Not an official film synopsis.'));
      inner.append(front, back);
      stage.append(inner);
      const actions = element('div', 'card-actions');
      const flip = element('button', 'flip-button', 'Read story ↻');
      flip.type = 'button';
      flip.setAttribute('aria-controls', back.id);
      flip.setAttribute('aria-label', 'Read story for ' + p.title);
      const download = element('a', 'download-story', 'Save story ↓');
      download.href = p.descriptionFile;
      download.download = p.name.replace(/\.[^.]+$/, '') + '.txt';
      download.setAttribute('aria-label', 'Download original story for ' + p.title);
      download.addEventListener('click', event => downloadStory(event, p));
      let pinned = false;
      let hovered = false;
      function updateFace() {
        const revealed = pinned || hovered;
        stage.classList.toggle('is-flipped', pinned);
        stage.classList.toggle('is-hovered', hovered);
        flip.setAttribute('aria-expanded', String(revealed));
        flip.textContent = revealed ? 'Show artwork ↶' : 'Read story ↻';
        flip.setAttribute('aria-label', (revealed ? 'Show artwork for ' : 'Read story for ') + p.title);
        back.inert = !revealed;
        back.setAttribute('aria-hidden', String(!revealed));
        front.setAttribute('aria-hidden', String(revealed));
      }
      back.addEventListener('focusin', () => { pinned = true; updateFace(); });
      flip.addEventListener('click', () => { pinned = !pinned; hovered = false; updateFace(); });
      stage.addEventListener('mouseenter', () => { if (window.matchMedia('(hover: hover)').matches) { hovered = true; updateFace(); } });
      stage.addEventListener('mouseleave', () => { hovered = false; updateFace(); });
      updateFace();
      const open = element('button', 'open-poster', 'Full poster ↗');
      open.type = 'button';
      open.setAttribute('aria-label', 'Open full poster for ' + p.title);
      open.setAttribute('aria-haspopup', 'dialog');
      open.addEventListener('click', () => openViewer(p, visible, open));
      actions.append(flip, open, download);
      const info = element('div', 'poster-info');
      info.append(element('span', 'poster-index', String(p.index).padStart(2, '0') + ' / THE ARCHIVE'), element('h3', '', p.title), element('p', 'poster-genre', p.genre));
      card.append(stage, info, actions);
      gallery.append(card);
    }
    results.textContent = visible.length + ' of ' + posters.length + ' posters · Original stories, imagined from the artwork';
    document.querySelector('#empty-state').hidden = visible.length !== 0;
  }
  search.addEventListener('input', render);
  genre.addEventListener('change', render);
  document.querySelector('#reset').addEventListener('click', () => { search.value = ''; genre.value = 'All'; render(); });
  render();
})();
