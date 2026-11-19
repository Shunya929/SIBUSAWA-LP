/* SIBUSAWA STYLE RC LP — 最小限のUI制御（スライダー／フォーム） */
(function () {
  'use strict';

  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  /* ---------- フェード型スライダー（FV・入居者セクション） ---------- */
  document.querySelectorAll('[data-slider="fv"], [data-slider="fade"]').forEach(function (root) {
    var slides = root.querySelectorAll('[data-slide]');
    var thumbs = root.querySelectorAll('[data-thumb]');
    var bars = root.querySelectorAll('[data-progress] > span');
    var current = root.querySelector('[data-current]');
    var index = 0;
    var timer = null;

    function go(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (el, n) { el.classList.toggle('is-active', n === index); });
      thumbs.forEach(function (el, n) { el.classList.toggle('is-active', n === index); });
      bars.forEach(function (el, n) { el.classList.toggle('is-active', n === index); });
      if (current) current.textContent = pad(index + 1);
    }
    function restart() {
      if (root.dataset.slider !== 'fv') return;
      clearInterval(timer);
      timer = setInterval(function () { go(index + 1); }, 6000);
    }

    var prev = root.querySelector('[data-prev]');
    var next = root.querySelector('[data-next]');
    if (prev) prev.addEventListener('click', function () { go(index - 1); restart(); });
    if (next) next.addEventListener('click', function () { go(index + 1); restart(); });
    thumbs.forEach(function (el, n) { el.addEventListener('click', function () { go(n); restart(); }); });

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) restart();
  });

  /* ---------- 横スクロール型スライダー（プラン・施工実例） ---------- */
  document.querySelectorAll('[data-slider="scroll"]').forEach(function (root) {
    var track = root.querySelector('[data-track]');
    var items = track.children;
    var bars = root.querySelectorAll('[data-progress] > span');
    var current = root.querySelector('[data-current]');

    function step() {
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return items[0].getBoundingClientRect().width + gap;
    }
    function update() {
      var max = track.scrollWidth - track.clientWidth;
      var i = track.scrollLeft >= max - 2 ? items.length - 1 : Math.round(track.scrollLeft / step());
      bars.forEach(function (el, n) { el.classList.toggle('is-active', n === i); });
      if (current) current.textContent = pad(i + 1);
    }

    root.querySelector('[data-prev]').addEventListener('click', function () {
      track.scrollBy({ left: -step(), behavior: 'smooth' });
    });
    root.querySelector('[data-next]').addEventListener('click', function () {
      track.scrollBy({ left: step(), behavior: 'smooth' });
    });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
  });

  /* ---------- フォーム（必須チェック → 完了画面へ） ---------- */
  var form = document.querySelector('[data-form]');
  if (form) {
    var want = function (v) { return form.querySelector('input[name="want"][value="' + v + '"]').checked; };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var errors = [];
      var group = form.querySelector('[data-required-group]');
      var wantChecked = form.querySelectorAll('input[name="want"]:checked').length > 0;

      // 条件付き必須
      form.tel.required = want('consult');
      form.date1.required = want('consult');
      form.address.required = want('document') && form.receive.value === 'post';

      if (!wantChecked) errors.push(group.querySelector('input'));
      form.querySelectorAll('.input').forEach(function (el) {
        if (el.offsetParent !== null && !el.checkValidity()) errors.push(el);
      });

      if (errors.length) {
        if (!wantChecked) alert('ご希望の内容を1つ以上お選びください。');
        else errors[0].reportValidity();
        errors[0].focus();
        return;
      }

      // TODO: 送信処理（フォーム送信サービス／CMS連携）を実装する
      var onlyDocument = want('document') && !want('consult');
      window.location.href = 'thanks.html' + (onlyDocument ? '?type=document' : '');
    });
  }
})();
