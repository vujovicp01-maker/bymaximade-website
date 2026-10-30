/* ===========================================================
   byMaximade site interactions
   - Scroll progress line (homepage)
   - Apply wizard to Web3Forms (fallback: mailto)
   =========================================================== */

(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ----- Scroll progress line (homepage) -----
  const progress = document.getElementById('scroll-progress');
  if (progress) {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ----- Apply wizard -----
  const form = document.getElementById('apply-form');
  if (!form) return;
  const isJoin = form.dataset.kind === 'join';
  const steps = Array.from(form.querySelectorAll('.step'));
  const TOTAL = steps.filter((s) => s.dataset.step !== 'done').length;
  const label = document.getElementById('step-label');
  const bar = document.getElementById('progress-bar');
  const backBtn = document.getElementById('step-back');
  const nextBtn = document.getElementById('step-next');
  const actions = document.getElementById('step-actions');
  const errorEl = document.getElementById('step-error');
  let current = 0;
  let sending = false;

  const setError = (msg) => { errorEl.textContent = msg || ''; };

  // Named per field: a generic "check the form" makes the visitor hunt for what is wrong.
  // The browser only enforces minlength on text the visitor typed, so a pasted or autofilled
  // one-word answer passes checkValidity(). Length is checked explicitly in validate().
  const DETAIL_ERROR = {
    name: 'Add your name.',
    email: 'Add a valid email so we can reply.',
    handle: 'Add your Instagram or website. We look before we reply.',
    brief: 'Tell us about the project. A couple of sentences is enough.',
  };

  // A silent minimum reads as a broken button: say how much is missing, right under the field.
  const noteFor = (field) => {
    if (!field.nextElementSibling || !field.nextElementSibling.classList.contains('field-note')) {
      field.insertAdjacentHTML('afterend', '<p class="field-note" aria-live="polite"></p>');
    }
    return field.nextElementSibling;
  };
  const updateNote = (field, force) => {
    const left = field.minLength - field.value.trim().length;
    noteFor(field).textContent = left > 0 && (force || field.value) ? `${left} more character${left === 1 ? '' : 's'} to go` : '';
  };
  form.querySelectorAll('.field[minlength]').forEach((f) => f.addEventListener('input', () => updateNote(f)));

  // Chip selection → hidden input
  form.querySelectorAll('.step[data-field]').forEach((step) => {
    const hidden = form.elements[step.dataset.field];
    const multi = step.hasAttribute('data-multi');
    const chips = step.querySelectorAll('.chip');
    chips.forEach((chip) => {
      chip.setAttribute('aria-pressed', 'false');
      chip.addEventListener('click', () => {
        if (multi) {
          chip.classList.toggle('is-on');
        } else {
          chips.forEach((c) => c.classList.remove('is-on'));
          chip.classList.add('is-on');
        }
        chips.forEach((c) => c.setAttribute('aria-pressed', String(c.classList.contains('is-on'))));
        hidden.value = Array.from(step.querySelectorAll('.chip.is-on')).map((c) => c.dataset.value).join(', ');
        setError('');
        // Single-choice auto-advances, unless a quick second pick has already moved the wizard on.
        if (!multi) { const at = current; setTimeout(() => current === at && next(), 180); }
      });
    });
  });

  function validate(step) {
    const field = step.dataset.field;
    if (field === 'details') {
      let firstBad = null;
      step.querySelectorAll('[required]').forEach((input) => {
        // checkValidity() passes a required field that holds only spaces, so blank after trim is bad too.
        const bad = !input.checkValidity() || !input.value.trim() || (input.minLength > 0 && input.value.trim().length < input.minLength);
        input.classList.toggle('is-invalid', bad);
        if (bad) input.setAttribute('aria-invalid', 'true');
        else input.removeAttribute('aria-invalid');
        if (input.minLength > 0) updateNote(input, true);
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
      // Every step, not just `from`: a quick Back during a transition would otherwise leave two showing.
      steps.forEach((s) => s.classList.remove('is-active', 'is-leaving'));
      to.classList.add('is-active');
      current = index;
      const isDone = to.dataset.step === 'done';
      label.textContent = isDone ? 'Done' : `Step ${index + 1} of ${TOTAL}`;
      bar.style.width = `${Math.min(index + 1, TOTAL) / TOTAL * 100}%`;
      backBtn.classList.toggle('invisible', index === 0 || isDone);
      actions.classList.toggle('hidden', isDone);
      nextBtn.textContent = index === TOTAL - 1 ? (isJoin ? 'Send my application' : 'Send my inquiry') : 'Continue';
      setError('');
      // The done title takes focus so its message is read out. The step scrolls in first, so focus never lands under the header.
      const focusable = isDone ? document.getElementById('done-title') : to.querySelector('.chip, input, textarea');
      to.scrollIntoView({ block: 'nearest' });
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
    // Enter advances only from a text field. On a chip or Back, the button's own Enter runs instead.
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); next(); return; }
    // Number keys pick a chip only while focus is on one, so a stray digit elsewhere selects nothing.
    if (e.target.classList.contains('chip') && /^[1-9]$/.test(e.key)) {
      const chip = steps[current].querySelectorAll('.chip')[Number(e.key) - 1];
      if (chip) chip.click();
    }
  });
  form.querySelectorAll('.field').forEach((f) => f.addEventListener('input', () => {
    f.classList.remove('is-invalid');
    f.removeAttribute('aria-invalid');
    setError('');
  }));
  form.addEventListener('submit', (e) => { e.preventDefault(); next(); });

  async function submit() {
    // One send per visit: Enter or a click while "Sending…" would otherwise post the lead twice.
    if (sending) return;
    sending = true;
    const data = new FormData(form);
    const name = data.get('name').trim();
    // Unique per submission: Gmail never merges two leads into one conversation, and the
    // automation files the lead under it.
    const ref = Date.now().toString(36).slice(-6).toUpperCase();
    // n8n detects the kind with /project inquiry #([A-Z0-9]+)/i and /new application/i: keep those substrings.
    if (isJoin) {
      const role = String(data.get('role') || '');
      const exp = String(data.get('experience') || '');
      const strong = exp === '3 – 5 years' || exp === '5+ years';
      data.set('subject', `${strong ? '★ ' : ''}New application: ${name} · ${role} · ${exp}`);
    } else {
      // The lead sees "Re: <this subject>" on our follow-up, so it stays neutral; triage lives
      // in Gmail labels and the automation's brief.
      data.set('subject', `Your project inquiry #${ref} with byMaximade`);
    }
    form.classList.add('is-sending');
    nextBtn.setAttribute('aria-disabled', 'true');
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
      window.location.href = 'mailto:contact@bymaximade.com?subject=' + encodeURIComponent(data.get('subject')) + '&body=' + encodeURIComponent(body);
    }

    document.getElementById('done-title').textContent = `Got it, ${name.split(' ')[0]}.`;
    const doneOk = form.dataset.done || 'We reply from contact@bymaximade.com within 24 hours with a scope and a price. If you don’t see it, check spam or promotions.';
    document.getElementById('done-text').textContent = sent
      ? doneOk
      : 'Your email app should open with your message. Press send and it reaches us.';
    show(steps.length - 1);
  }
})();
