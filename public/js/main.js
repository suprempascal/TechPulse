'use strict';

/* Petites interactions d'interface. */

// Compteur de caractères des zones de texte [data-counter-for]
document.querySelectorAll('[data-counter-for]').forEach(function (area) {
  const target = document.getElementById(area.dataset.counterFor);
  if (!target) return;
  const update = function () {
    area.textContent = target.value.length + ' / ' + (target.maxLength > 0 ? target.maxLength : '∞');
  };
  target.addEventListener('input', update);
  update();
});

// Disparition automatique des messages flash
const flash = document.querySelector('.flash');
if (flash) {
  setTimeout(function () {
    flash.style.transition = 'opacity .4s ease, transform .4s ease';
    flash.style.opacity = '0';
    flash.style.transform = 'translateY(-6px)';
    setTimeout(function () { flash.remove(); }, 420);
  }, 5000);
}
