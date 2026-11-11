const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
function setMenu(open) { mobileNav.classList.toggle('open', open); menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); }
menuButton.addEventListener('click', () => setMenu(!mobileNav.classList.contains('open')));
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && mobileNav.classList.contains('open')) { setMenu(false); menuButton.focus(); } });
document.addEventListener('click', event => { if (mobileNav.classList.contains('open') && !mobileNav.contains(event.target) && !menuButton.contains(event.target)) setMenu(false); });
document.getElementById('year').textContent = new Date().getFullYear();
const chat = document.querySelector('.chat');
const chatToggle = document.querySelector('.assistant-toggle');
const chatBody = document.querySelector('.chat-body');
const chatInput = document.getElementById('chat-input');
function setChat(open) { chat.hidden = !open; chatToggle.setAttribute('aria-expanded', String(open)); if (open) chatInput.focus(); }
chatToggle.addEventListener('click', () => setChat(chat.hidden));
document.querySelector('.chat-close').addEventListener('click', () => { setChat(false); chatToggle.focus(); });
function answer(question) { const q = question.toLowerCase(); if (/where|address|location|based|find|visit/.test(q)) return 'Our workshop is at 16 Grader Road, Spartan Ext 3, Kempton Park, Gauteng, 1619.'; if (/contact|phone|call|number|email|quote|price|cost/.test(q)) return 'Call our team on +27 (0)11 392 1011 or +27 (0)11 392 6490 to discuss your requirements.'; if (/pipe|fitting|bend/.test(q)) return 'We fabricate industrial pipework and fittings, including flanges, reducers, T- and Y-pieces and lobster-back bends.'; if (/drive|rebuild|repair/.test(q)) return 'We inspect, repair and rebuild driveline and final-drive components. Give us a call to discuss the details of your job.'; if (/fabricat|steel|tank|chute|hopper|conveyor/.test(q)) return 'Our general and heavy fabrication includes carbon and stainless steel platework, tanks, chutes, hoppers, gantries and conveyor modules.'; if (/service|offer|what|engineering|work|do you/.test(q)) return 'We offer driveline and final-drive rebuilding, metallurgical and mechanical engineering consulting, general and heavy fabrication, and industrial pipework.'; return 'For help with that, please call our team on +27 (0)11 392 1011. You can also ask me about our services or workshop location.'; }
function sendQuestion(value) { const question = value.trim(); if (!question) return; const quick = chatBody.querySelector('.quick-questions'); if (quick) quick.remove(); const user = document.createElement('div'); user.className = 'user-message'; user.textContent = question; chatBody.appendChild(user); const response = document.createElement('div'); response.className = 'bot-message'; response.textContent = answer(question); chatBody.appendChild(response); chatBody.scrollTop = chatBody.scrollHeight; chatInput.value = ''; }
document.querySelector('.chat-form').addEventListener('submit', event => { event.preventDefault(); sendQuestion(chatInput.value); });
document.querySelectorAll('.quick-questions button').forEach(button => button.addEventListener('click', () => sendQuestion(button.textContent)));

// A word-by-word scroll reveal that keeps the existing heading markup and colours.
(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const headings = document.querySelectorAll('.hero h1, main h2');
  const reveals = document.querySelectorAll('.intro-bottom, .section-head > p, .service-row, .feature-copy > p:not(.overline), .capabilities, .statement p, .contact-main > p:not(.overline), .contact-details');
  const photo = document.querySelector('.feature-image');

  function prepareHeading(heading) {
    const label = heading.innerText.replace(/\s+/g, ' ').trim();
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let index = 0;
    nodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      (node.nodeValue.match(/\s+|\S+/g) || []).forEach(part => {
        if (/^\s+$/.test(part)) { fragment.appendChild(document.createTextNode(part)); return; }
        const mask = document.createElement('span');
        const word = document.createElement('span');
        mask.className = 'motion-mask';
        mask.setAttribute('aria-hidden', 'true');
        word.className = 'motion-word';
        word.textContent = part;
        word.style.setProperty('--word-delay', `${Math.min(index++ * 50, 500)}ms`);
        mask.appendChild(word);
        fragment.appendChild(mask);
      });
      node.replaceWith(fragment);
    });
    heading.setAttribute('aria-label', label);
    heading.classList.add('word-heading');
  }

  if ('IntersectionObserver' in window) {
    headings.forEach(prepareHeading);
    reveals.forEach((element, index) => {
      element.classList.add('scroll-reveal');
      if (element.classList.contains('service-row')) element.style.setProperty('--reveal-delay', `${(index % 4) * 70}ms`);
    });
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('motion-visible'); observer.unobserve(entry.target); }
    }), { threshold: .1, rootMargin: '0px 0px -30px 0px' });
    [...headings, ...reveals, photo].forEach(element => observer.observe(element));
    if (!reduce.matches) root.classList.add('motion-enabled');
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('hero-ready')));
  }

  let frame = 0;
  function paint() {
    frame = 0;
    if (reduce.matches) return;
    const rect = photo.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < innerHeight) {
      const position = Math.max(-1, Math.min(1, (innerHeight / 2 - (rect.top + rect.height / 2)) / innerHeight));
      photo.style.setProperty('--feature-shift', `${position * 20}px`);
    }
  }
  function requestPaint() { if (!frame) frame = requestAnimationFrame(paint); }
  window.addEventListener('scroll', requestPaint, { passive: true });
  window.addEventListener('resize', requestPaint, { passive: true });
  reduce.addEventListener('change', event => {
    root.classList.toggle('motion-enabled', !event.matches && 'IntersectionObserver' in window);
    requestPaint();
  });
  requestPaint();
})();


// Smooth desktop wheel movement while keeping touch and nested chat scrolling native.
(() => {
  const desktop = matchMedia('(min-width: 768px) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let target = 0;
  let wheelFrame = 0;
  function step() {
    const delta = target - window.scrollY;
    if (Math.abs(delta) < .5) { window.scrollTo({ top: target, behavior: 'instant' }); wheelFrame = 0; return; }
    window.scrollTo({ top: window.scrollY + delta * .14, behavior: 'instant' });
    wheelFrame = requestAnimationFrame(step);
  }
  window.addEventListener('wheel', event => {
    if (!desktop.matches || reduced.matches || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || event.target.closest('.chat')) return;
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    event.preventDefault();
    const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
    if (!wheelFrame) target = scrollY;
    target = Math.max(0, Math.min(document.documentElement.scrollHeight - innerHeight, target + event.deltaY * scale));
    if (!wheelFrame) wheelFrame = requestAnimationFrame(step);
  }, { passive: false });
  window.addEventListener('keydown', () => { if (wheelFrame) cancelAnimationFrame(wheelFrame); wheelFrame = 0; }, { passive: true });
})();


// Respect reduced-motion preferences and pause the decorative video off screen.
(() => {
  const video = document.querySelector('.hero-video');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let onScreen = true;
  function syncVideo() {
    if (reduced.matches || !onScreen || document.hidden) video.pause();
    else video.play().catch(() => {});
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { onScreen = entries[0].isIntersecting; syncVideo(); }).observe(video);
  }
  reduced.addEventListener('change', syncVideo);
  document.addEventListener('visibilitychange', syncVideo);
  syncVideo();
})();
