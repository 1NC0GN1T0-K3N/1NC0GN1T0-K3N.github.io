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

const demoStates = [
 ['Choose a gateway, fetch its models, and review your selection before import.', 'Original settings', 'Created before the first write'],
 ['Connect saves the original configuration, then applies the selected gateway and models with atomic file writes.', 'Selected gateway and models applied', 'Original settings preserved across repeated imports'],
 ['Use original config restores the saved baseline. Later edits require confirmation and are kept in a separate copy.', 'Original settings restored', 'Later edits preserved before confirmed restore']
];
for (const button of document.querySelectorAll('[data-demo-step]')) {
 button.addEventListener('click', () => {
  const step = Number(button.dataset.demoStep);
  document.querySelectorAll('[data-demo-step]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  ['demo-status', 'demo-config', 'demo-backup'].forEach((id, i) => document.getElementById(id).textContent = demoStates[step][i]);
 });
}
// Evidence anchors inside summaries must also reveal their destination.
for (const link of document.querySelectorAll('.summary-evidence a[href^="#"]')) {
 link.addEventListener('click', () => {
  const target = document.querySelector(link.hash);
  if (target) { const details = target.closest('details'); if (details) setDisclosure(details, true); }
 });
}

document.querySelector('.demo-controls').hidden = false;
