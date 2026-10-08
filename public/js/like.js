'use strict';

/* Bascule des likes — appel API JSON, UI optimiste. */
(function () {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };

  function getCsrf() {
    const el = document.querySelector('input[name="_csrf"]');
    return el ? el.value : '';
  }

  async function toggle(button) {
    const id = button.dataset.like;
    if (!id || button.disabled) return;

    const counters = document.querySelectorAll('[data-like-count="' + id + '"]');
    const wasLiked = button.classList.contains('is-liked');
    const current = parseInt(counters[0].textContent, 10) || 0;

    // UI optimiste
    setUi(button, counters, !wasLiked, wasLiked ? Math.max(0, current - 1) : current + 1);

    try {
      const res = await fetch('/api/articles/' + id + '/like', {
        method: 'POST',
        headers: Object.assign({}, headers, { 'X-CSRF': getCsrf() }),
        credentials: 'same-origin',
      });
      if (res.status === 401 || res.status === 403) {
        window.location.href = '/login?next=' + encodeURIComponent(location.pathname);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setUi(button, counters, data.liked, data.likesCount);
      document.dispatchEvent(new CustomEvent('like:changed', { detail: data }));
    } catch (err) {
      setUi(button, counters, wasLiked, current);
      console.error(err);
    }
  }

  function setUi(button, counters, liked, count) {
    counters.forEach(function (el) { el.textContent = String(count); });
    button.classList.toggle('is-liked', liked);
    button.setAttribute('aria-pressed', liked ? 'true' : 'false');
    const label = button.querySelector('.like-label');
    if (label) label.textContent = liked ? 'Aimé' : 'J’aime';
  }

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-like]');
    if (btn) {
      e.preventDefault();
      toggle(btn);
    }
  });
})();
