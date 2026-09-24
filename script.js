/* ===========================================================
   bymaximade — site interactions
   - Nav scroll state, mobile menu, reveal-on-scroll
   - Hero word reveal
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
  if (menuToggle) menuToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('hidden') === false;
    menuToggle.classList.toggle('is-open', isOpen);
  });
  if (mobileMenu) mobileMenu.querySelectorAll('a').forEach((link) => {
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
    // Armed at load, not now: the Tailwind CDN generates its CSS asynchronously, so before that
    // the page has no real layout and every element measures as above the fold. Hiding a block
    // that is below the fold is invisible to the visitor, so arming late costs nothing — and
    // content is on screen the whole time instead of waiting on this script.
    const arm = () => revealEls.forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight) el.classList.add('pending');
      io.observe(el);
    });
    if (document.readyState === 'complete') arm();
    else window.addEventListener('load', arm, { once: true });
  }

  // ----- Hero word-by-word reveal -----
  let wordIndex = 0;
  document.querySelectorAll('.words').forEach((el) => {
    wordIndex += Number(el.dataset.delay || 0);
    el.innerHTML = el.textContent.trim().split(/\s+/)
      .map((w) => `<span class="w" style="--i:${wordIndex++}">${w}</span>`)
      .join(' ');
  });

  // ----- Apply wizard -----
  const form = document.getElementById('apply-form');
  if (!form) return;
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

  // Named per field: a generic "check the form" makes the visitor hunt for what is wrong.
  // The browser only enforces minlength on text the visitor typed, so a pasted or autofilled
  // one-word answer passes checkValidity(). Length is checked explicitly in validate().
  const DETAIL_ERROR = {
    name: 'Add your name.',
    email: 'Add a valid email so we can reply.',
    handle: 'Add your Instagram or website — we look before we reply.',
    brief: 'Tell us about the project. A couple of sentences is enough.',
  };

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
      let firstBad = null;
      step.querySelectorAll('[required]').forEach((input) => {
        const bad = !input.checkValidity() || (input.minLength > 0 && input.value.trim().length < input.minLength);
        input.classList.toggle('is-invalid', bad);
        if (bad && !firstBad) firstBad = input;
      });
      if (firstBad) {
        setError(firstBad.dataset.error || DETAIL_ERROR[firstBad.name] || 'Check this field.');
        firstBad.focus();
      }
      return !firstBad;
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
    // A star on the ones worth opening first, so the inbox list triages itself without
    // opening anything: filter Gmail on the star, or on the words after the dash.
    if (form.dataset.kind === 'join') {
      const role = String(data.get('role') || '');
      const exp = String(data.get('experience') || '');
      const strong = exp === '3 – 5 years' || exp === '5+ years';
      data.set('subject', `${strong ? '★ ' : ''}New application — ${name} · ${role} · ${exp}`);
    } else {
      const budget = String(data.get('budget') || '');
      const timeline = String(data.get('timeline') || '');
      const strong = budget !== 'Under $1k' && timeline !== 'Just exploring';
      data.set('subject', `${strong ? '★ ' : ''}New inquiry — ${name} · ${budget} · ${timeline}`);
    }
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
      const META = ['access_key', 'subject', 'from_name', 'botcheck'];
      const body = [...data.entries()].filter(([k]) => !META.includes(k))
        .map(([k, v]) => `${k}: ${v}`).join('\n');
      window.location.href = 'mailto:bymaximade@gmail.com?subject=' + encodeURIComponent(data.get('subject')) + '&body=' + encodeURIComponent(body);
    }

    document.getElementById('done-title').textContent = `Got it, ${name.split(' ')[0]}.`;
    const doneOk = form.dataset.done || "We'll get back to you within 48 hours.";
    document.getElementById('done-text').textContent = sent
      ? doneOk
      : 'Your email app should open with the application. Hit send and it reaches us.';
    const community = document.getElementById('done-community');
    if (community) community.classList.toggle('hidden', data.get('budget') !== 'Under $1k');
    show(steps.length - 1);
  }
})();
