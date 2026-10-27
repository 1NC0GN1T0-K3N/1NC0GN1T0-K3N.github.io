'use strict';
const projects = [...document.querySelectorAll('.project')];
const buttons = [...document.querySelectorAll('[data-filter]')];
const countLabel = document.querySelector('#project-count');
const expand = document.querySelector('#expand-projects');
let category = 'all';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const disclosureState = new WeakMap();
function desiredOpen(item) { return disclosureState.get(item)?.target ?? item.open; }
function setDisclosure(item, open) {
  const previous = disclosureState.get(item);
  const start = item.getBoundingClientRect().height;
  if (previous?.animation) previous.animation.cancel();
  item.style.height = '';
  item.style.overflow = '';
  if (reducedMotion.matches || !item.animate || item.hidden) {
    item.open = open;
    disclosureState.delete(item);
    updateExpansionState();
    return;
  }
  const summary = item.querySelector('summary');
  item.open = true;
  const end = open ? item.getBoundingClientRect().height : summary.getBoundingClientRect().height + 1;
  item.style.overflow = 'hidden';
  const animation = item.animate([{height: `${start}px`}, {height: `${end}px`}], {
    duration: 360, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both'
  });
  disclosureState.set(item, {target: open, animation});
  animation.onfinish = () => {
    if (disclosureState.get(item)?.animation !== animation) return;
    item.open = open;
    animation.cancel();
    item.style.overflow = '';
    disclosureState.delete(item);
    updateExpansionState();
  };
  updateExpansionState();
}
for (const item of document.querySelectorAll('.project, .timeline')) {
  item.querySelector('summary').addEventListener('click', event => {
    if (event.target.closest('a')) return;
    event.preventDefault();
    setDisclosure(item, !desiredOpen(item));
  });
}
window.addEventListener('resize', () => {
  for (const item of document.querySelectorAll('.project, .timeline')) {
    const state = disclosureState.get(item);
    if (!state) continue;
    state.animation.cancel(); item.open = state.target;
    item.style.overflow = ''; disclosureState.delete(item);
  }
  updateExpansionState();
});
function updateExpansionState() {
  const visible = projects.filter(project => !project.hidden);
  const allOpen = visible.length > 0 && visible.every(desiredOpen);
  expand.innerHTML = allOpen
    ? 'Collapse All <svg class="icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12"/></svg>'
    : 'Expand All <svg class="icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 15 15 5M5 5h10v10"/></svg>';
  expand.setAttribute('aria-expanded', String(allOpen));
  expand.disabled = visible.length === 0;
}
function filterProjects() {
  let count = 0;
  for (const project of projects) {
    const matchesCategory = category === 'all' || project.dataset.category.split(' ').includes(category);
    project.hidden = !matchesCategory;
    project.closest('.project-card').hidden = !matchesCategory;
    if (!project.hidden) count++;
  }
  for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.filter === category));
  countLabel.textContent = `${count} ${count === 1 ? 'project' : 'projects'}`;
  updateExpansionState();
}
for (const button of buttons) button.addEventListener('click', () => { category = button.dataset.filter; filterProjects(); });
expand.addEventListener('click', () => {
  const visible = projects.filter(project => !project.hidden);
  const shouldOpen = !visible.every(desiredOpen);
  for (const project of visible) setDisclosure(project, shouldOpen);
  updateExpansionState();
});
for (const project of projects) project.addEventListener('toggle', updateExpansionState);
document.querySelector('#project-filters').hidden = false;
document.querySelector('#project-tools').hidden = false;
filterProjects();
const navLinks = [...document.querySelectorAll('nav a[href^="#"]')];
let navFramePending = false;
function updateNavigation() {
  let current = '';
  for (const link of navLinks) {
    const section = document.querySelector(link.hash);
    if (section && section.getBoundingClientRect().top <= 140) current = link.hash;
  }
  for (const link of navLinks) {
    if (link.hash === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
  const range = document.documentElement.scrollHeight - window.innerHeight;
  document.querySelector('.reading-progress').style.transform = `scaleX(${range > 0 ? Math.min(1, window.scrollY / range) : 0})`;
  navFramePending = false;
}
window.addEventListener('scroll', () => {
  if (!navFramePending) { navFramePending = true; requestAnimationFrame(updateNavigation); }
}, {passive: true});
window.addEventListener('resize', updateNavigation);
updateNavigation();
