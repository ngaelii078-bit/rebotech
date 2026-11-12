(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.__rvReady = true;

  /* Year */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* Mobile menu */
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  function setMenu(open) {
    mobileNav.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuButton.addEventListener('click', () => setMenu(!mobileNav.classList.contains('open')));
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileNav.classList.contains('open')) { setMenu(false); menuButton.focus(); }
  });
  document.addEventListener('click', event => {
    if (mobileNav.classList.contains('open') && !mobileNav.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
  });

  /* Assistant (answers only from the company profile) */
  const chat = document.querySelector('.chat');
  const chatToggle = document.querySelector('.dock-ask');
  const chatBody = chat.querySelector('.chat-body');
  const chatInput = document.getElementById('chat-input');
  function setChat(open) {
    chat.hidden = !open;
    chatToggle.setAttribute('aria-expanded', String(open));
    if (open) chatInput.focus();
  }
  chatToggle.addEventListener('click', () => setChat(chat.hidden));
  chat.querySelector('.chat-close').addEventListener('click', () => { setChat(false); chatToggle.focus(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !chat.hidden) { setChat(false); chatToggle.focus(); } });

  function answer(question) {
    const q = question.toLowerCase();
    if (/where|address|location|based|find|visit|directions/.test(q)) return 'The workshop is at 16 Grader Road, Spartan Ext 3, Kempton Park, Gauteng, 1619.';
    if (/small|little|one part|single|quick|minor/.test(q)) return 'Yes. As well as big builds we take on one-off parts, repairs and short runs. Describe the job in the form at the bottom of the page, or call 011 392 1011.';
    if (/build|make|fabricat|can you|machine|custom|design|drawing/.test(q)) return 'Very likely. We build machines, plant equipment and structures to order, mostly for mining and industry. Send us a drawing, a sketch or a description using the form at the bottom of the page, and we will tell you whether we can build it.';
    if (/contact|phone|call|number|email|quote|price|cost|whatsapp/.test(q)) return 'Call 011 392 1011 or 011 392 6490, or use the form at the bottom of the page to send us the job on WhatsApp. Every job is quoted on its own.';
    if (/pipe|fitting|bend|flang|thread|reducer/.test(q)) return 'We make pipework and fittings, including flanging, threading, reducers, T- and Y-pieces and lobster-back bends.';
    if (/drive|rebuild|repair|dropbox|differential|gearbox/.test(q)) return 'We repair and rebuild dropboxes, differentials and final drives. Call with the details of the unit.';
    if (/steel|plate|stainless|thick/.test(q)) return 'We work in carbon and stainless steel, with platework from 3 to 40 mm.';
    if (/metallurg|consult|fail|crack|assess|structur|troubleshoot|engineer/.test(q)) return 'Our engineering side offers metallurgical and mechanical engineering consulting, troubleshooting and structural engineering assessments.';
    if (/service|offer|what|work|do you|take on/.test(q)) return 'We are an engineering and fabrication workshop. We build big machines and plant equipment for mines and industry, take on smaller jobs and repairs, and offer engineering consulting.';
    return 'The quickest way to get an answer on that is to call the workshop on 011 392 1011. You can also ask me what we build or where we are.';
  }
  function sendQuestion(value) {
    const question = value.trim();
    if (!question) return;
    const quick = chatBody.querySelector('.quick-questions');
    if (quick) quick.remove();
    const user = document.createElement('div');
    user.className = 'user-message';
    user.textContent = question;
    const reply = document.createElement('div');
    reply.className = 'bot-message';
    reply.textContent = answer(question);
    chatBody.append(user, reply);
    chatBody.scrollTop = chatBody.scrollHeight;
    chatInput.value = '';
  }
  chat.querySelector('.chat-form').addEventListener('submit', event => { event.preventDefault(); sendQuestion(chatInput.value); });
  chat.querySelectorAll('.quick-questions button').forEach(button => button.addEventListener('click', () => sendQuestion(button.textContent)));

  /* Job form: composes a WhatsApp message, no backend needed */
  const jobForm = document.querySelector('.job-form');
  if (jobForm) {
    const note = jobForm.querySelector('.form-note');
    const defaultNote = note.textContent;
    jobForm.addEventListener('submit', event => {
      event.preventDefault();
      const field = id => document.getElementById(id);
      const job = field('job').value.trim();
      if (!job) {
        note.textContent = 'Tell us a little about the job first.';
        note.classList.add('is-error');
        field('job').focus();
        return;
      }
      note.textContent = defaultNote;
      note.classList.remove('is-error');
      const size = (jobForm.querySelector('input[name="size"]:checked') || {}).value || 'Not sure yet';
      const name = field('name').value.trim();
      const company = field('company').value.trim();
      const lines = ['Hi Rebotech, can you build this?', '', `Job: ${job}`, `Size: ${size}`];
      if (name) lines.push(`Name: ${name}`);
      if (company) lines.push(`Company: ${company}`);
      window.open(`https://wa.me/27113921011?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
    });
  }

  /* Reveals: content travels in a short way and stops dead. Caption plates slide out on the photos. */
  const reveals = [...document.querySelectorAll('.rv, .captioned')];
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(entries => {
      let batch = 0;
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.classList.contains('rv')) el.style.setProperty('--d', `${Math.min(batch++, 6) * 90}ms`);
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: .18, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(el => io.observe(el));
  }

  /* Hide the floating dock while the contact form is on screen, so it never covers a field */
  const dock = document.querySelector('.dock');
  const contact = document.getElementById('contact');
  if (dock && contact && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      const hide = entry.isIntersecting && chat.hidden;
      dock.classList.toggle('is-away', hide);
      dock.toggleAttribute('inert', hide);
    }, { threshold: .15 }).observe(contact);
  }

  /* Smooth wheel scrolling on desktop (Lenis). Touch stays native. */
  if (!reduced && matchMedia('(pointer: fine)').matches) {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/lenis@1.1.13/dist/lenis.min.js';
    script.async = true;
    script.onload = () => {
      if (typeof window.Lenis !== 'function') return;
      const lenis = new window.Lenis({ lerp: .1 });
      const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
      const headerOffset = () => -(document.querySelector('.header').offsetHeight + 16);
      document.addEventListener('click', event => {
        const link = event.target.closest('a[href^="#"]');
        if (!link || link.classList.contains('skip')) return;
        const hash = link.getAttribute('href');
        const target = hash === '#top' ? 0 : document.querySelector(hash);
        if (target === null) return;
        event.preventDefault();
        lenis.scrollTo(target, { offset: target === 0 ? 0 : headerOffset() });
        history.pushState(null, '', hash);
      });
      chat.addEventListener('wheel', event => event.stopPropagation(), { passive: true });
    };
    document.head.appendChild(script);
  }
})();
