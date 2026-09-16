/* ===========================================================
   bymaximade — site interactions
   - Nav scroll state, mobile menu, reveal-on-scroll
   - Hero word reveal, card tilt
   - Apply wizard → Web3Forms (fallback: mailto)
   =========================================================== */

(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ----- Nav scroll state -----
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ----- Mobile menu -----
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  menuToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('hidden') === false;
    menuToggle.classList.toggle('is-open', isOpen);
  });
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      menuToggle.classList.remove('is-open');
    });
  });

  // ----- Reveal-on-scroll -----
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // ----- Hero word-by-word reveal -----
  let wordIndex = 0;
  document.querySelectorAll('.words').forEach((el) => {
    wordIndex += Number(el.dataset.delay || 0);
    el.innerHTML = el.textContent.trim().split(/\s+/)
      .map((w) => `<span class="w" style="--i:${wordIndex++}">${w}</span>`)
      .join(' ');
  });

  // ----- Cursor tilt on service cards -----
  if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.tilt').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', `${x * 8}deg`);
        card.style.setProperty('--rx', `${-y * 8}deg`);
      });
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  // ----- Apply wizard -----
  const form = document.getElementById('apply-form');
  const steps = Array.from(form.querySelectorAll('.step'));
  const TOTAL = steps.filter((s) => s.dataset.step !== 'done').length;
  const label = document.getElementById('step-label');
  const bar = document.getElementById('progress-bar');
  const backBtn = document.getElementById('step-back');
  const nextBtn = document.getElementById('step-next');
  const actions = document.getElementById('step-actions');
  const errorEl = document.getElementById('step-error');
  let current = 0;

  const setError = (msg) => { errorEl.textContent = msg || ''; };

  // Chip selection → hidden input
  form.querySelectorAll('.step[data-field]').forEach((step) => {
    const hidden = form.elements[step.dataset.field];
    const multi = step.hasAttribute('data-multi');
    step.querySelectorAll('.chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        if (multi) {
          chip.classList.toggle('is-on');
        } else {
          step.querySelectorAll('.chip').forEach((c) => c.classList.remove('is-on'));
          chip.classList.add('is-on');
        }
        hidden.value = Array.from(step.querySelectorAll('.chip.is-on')).map((c) => c.dataset.value).join(', ');
        setError('');
        if (!multi) setTimeout(next, 180); // single-choice auto-advances
      });
    });
  });

  function validate(step) {
    const field = step.dataset.field;
    if (field === 'details') {
      let ok = true;
      step.querySelectorAll('[required]').forEach((input) => {
        const bad = !input.checkValidity();
        input.classList.toggle('is-invalid', bad);
        if (bad) ok = false;
      });
      if (!ok) setError('Add your name and a valid email so we can reply.');
      return ok;
    }
    if (!form.elements[field].value) {
      setError('Pick at least one option to continue.');
      return false;
    }
    return true;
  }

  function show(index) {
    const from = steps[current];
    const to = steps[index];
    const go = () => {
      from.classList.remove('is-active', 'is-leaving');
      to.classList.add('is-active');
      current = index;
      const isDone = to.dataset.step === 'done';
      label.textContent = isDone ? 'Done' : `Step ${index + 1} of ${TOTAL}`;
      bar.style.width = `${Math.min(index + 1, TOTAL) / TOTAL * 100}%`;
      backBtn.classList.toggle('invisible', index === 0 || isDone);
      actions.classList.toggle('hidden', isDone);
      nextBtn.firstChild.textContent = index === TOTAL - 1 ? 'Send my application ' : 'Continue ';
      setError('');
      const focusable = to.querySelector('.chip, input, textarea');
      if (focusable) focusable.focus({ preventScroll: true });
    };
    if (reducedMotion || from === to) return go();
    from.classList.add('is-leaving');
    setTimeout(go, 250); // matches step-out duration in styles.css
  }

  function next() {
    const step = steps[current];
    if (!validate(step)) return;
    if (current === TOTAL - 1) return submit();
    show(current + 1);
  }

  nextBtn.addEventListener('click', next);
  backBtn.addEventListener('click', () => current > 0 && show(current - 1));

  form.addEventListener('keydown', (e) => {
    const typing = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); next(); return; }
    const chips = steps[current].querySelectorAll('.chip');
    if (chips.length && !typing && /^[1-9]$/.test(e.key)) {
      const chip = chips[Number(e.key) - 1];
      if (chip) chip.click();
    }
  });
  form.querySelectorAll('.field').forEach((f) => f.addEventListener('input', () => { f.classList.remove('is-invalid'); setError(''); }));
  form.addEventListener('submit', (e) => { e.preventDefault(); next(); });

  async function submit() {
    const data = new FormData(form);
    const name = data.get('name').trim();
    data.set('subject', `New inquiry — ${name} · ${data.get('budget')}`);
    form.classList.add('is-sending');
    setError('Sending…');

    let sent = false;
    if (data.get('access_key') !== 'YOUR_WEB3FORMS_ACCESS_KEY') {
      try {
        const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        sent = res.ok;
      } catch (_) { sent = false; }
    }
    form.classList.remove('is-sending');

    if (!sent) {
      // Fallback: open the visitor's email client pre-filled
      const body = ['need', 'who', 'budget', 'timeline', 'name', 'email', 'handle', 'brief']
        .map((k) => `${k}: ${data.get(k) || ''}`).join('\n');
      window.location.href = 'mailto:bymaximade@gmail.com?subject=' + encodeURIComponent(data.get('subject')) + '&body=' + encodeURIComponent(body);
    }

    document.getElementById('done-title').textContent = `Got it, ${name.split(' ')[0]}.`;
    document.getElementById('done-text').textContent = sent
      ? "We'll reply within 24 hours."
      : 'Your email app should open with the application. Hit send and we reply within 24 hours.';
    document.getElementById('done-community').classList.toggle('hidden', data.get('budget') !== 'Under $1k');
    show(steps.length - 1);
  }
})();
