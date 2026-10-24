'use strict';
const projects = [...document.querySelectorAll('.project')];
const buttons = [...document.querySelectorAll('[data-filter]')];
const countLabel = document.querySelector('#project-count');
const expand = document.querySelector('#expand-projects');
let category = 'all';
function updateExpansionState() {
  const visible = projects.filter(project => !project.hidden);
  const allOpen = visible.length > 0 && visible.every(project => project.open);
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
  const shouldOpen = !visible.every(project => project.open);
  for (const project of visible) project.open = shouldOpen;
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
