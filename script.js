/* Progressive enhancement. Every project and record is present in the HTML. */
import { matches } from './lib/search.mjs';
import { evaluateSignal, signalSVG } from './lib/uncertainty.mjs';
document.documentElement.classList.add('js');

const captions = {
  engineering: ['01', 'Start with the details.', 'Physical design, power integrity, and tools that help engineers work.'],
  research: ['02', 'Ask a better question.', 'Forecast uncertainty, reliable monitoring, and evidence that connects to decisions.'],
  impact: ['03', 'Keep people in the loop.', 'Mentorship, sustainable energy, and a semiconductor alumni community.']
};
document.querySelectorAll('[data-domain-select]').forEach(button => {
  button.addEventListener('click', () => {
    const domain = button.dataset.domainSelect;
    const [number, title, description] = captions[domain];
    document.querySelector('.hero-lab').dataset.domain = domain;
    document.querySelector('.lab-caption-number').textContent = number;
    const caption = document.querySelector('#domain-caption');
    const strong = document.createElement('strong');
    strong.textContent = title;
    caption.replaceChildren(strong, document.createElement('br'), document.createTextNode(description));
    document.querySelectorAll('[data-domain-select]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  });
});
document.querySelectorAll('[data-project-filter]').forEach(button => {
  button.addEventListener('click', () => {
    const category = button.dataset.projectFilter;
    let visible = 0;
    document.querySelectorAll('[data-project-category]').forEach(card => {
      card.hidden = category !== 'All' && card.dataset.projectCategory !== category;
      if (!card.hidden) visible++;
    });
    document.querySelectorAll('[data-project-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelector('#project-count').textContent = `${visible} projects shown${category === 'All' ? '' : ` in ${category}`}.`;
  });
});
document.querySelector('#copy-email').addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText('nigeltanjc@gmail.com');
    status.textContent = 'Email address copied.';
  } catch {
    status.textContent = 'Copy is unavailable here. Select nigeltanjc@gmail.com or open the email link.';
  }
});
document.querySelector('#print-profile').addEventListener('click', () => window.print());

// Local fieldbook search, combined with independent category filters.
const recordSearch = document.querySelector('#record-search');
const recordGroups = [...document.querySelectorAll('.record-group')];
const initialOpen = new Map();
let searchingRecords = false;
function updateRecords() {
  const query = recordSearch.value.trim();
  if (query && !searchingRecords) recordGroups.forEach(group => initialOpen.set(group, group.open));
  const restoring = !query && searchingRecords;
  searchingRecords = Boolean(query);
  let total = 0;
  for (const group of recordGroups) {
    const category = group.querySelector('select').value;
    let visible = 0;
    group.querySelectorAll('.record').forEach(row => {
      row.hidden = !matches(row.dataset.search, query) || (category !== 'All' && row.dataset.recordCategory !== category);
      if (!row.hidden) visible++;
    });
    if (query) group.open = visible > 0;
    else if (restoring) group.open = initialOpen.get(group) ?? false;
    total += visible;
    // Keep the group and its filter visible even for an empty category.
    group.querySelector('.record-total').firstChild.textContent = `${visible} `;
    const pmi = group.querySelector('.pmi-detail');
    if (pmi) {
      pmi.hidden = (Boolean(query) && !matches(pmi.textContent, query)) || (category !== 'All' && category !== 'Leadership');
      if (query && !pmi.hidden) pmi.open = true;
    }
  }
  document.querySelector('#record-results').textContent = `${total} matching ${total === 1 ? 'entry' : 'entries'}.`;
  document.querySelector('#record-empty').hidden = total > 0;
}
recordSearch.addEventListener('input', updateRecords);
recordGroups.forEach(group => group.querySelector('select').addEventListener('change', updateRecords));
document.querySelector('#clear-record-search').addEventListener('click', () => {
  recordSearch.value = '';
  recordGroups.forEach(group => { group.querySelector('select').value = 'All'; });
  updateRecords();
  recordSearch.focus();
});

// Search the already-rendered page; no tracking, network request, or account needed.
const dialog = document.querySelector('#search-dialog');
const siteSearch = document.querySelector('#site-search');
const searchList = document.querySelector('#site-search-results');
const sectionEntries = [...document.querySelectorAll('main > section[id]')].map(section => ({
  title: section.querySelector('h1,h2').textContent.replace(/\s+/g, ' '),
  label: 'Section', text: section.querySelector('h1,h2').textContent,
  target: section, href: `#${section.id}`
}));
const contentEntries = [...document.querySelectorAll('.project-card, .record')].map((element, i) => {
  if (!element.id) element.id = `entry-${i}`;
  return { title: element.querySelector('h3,h4').textContent, label: element.dataset.projectCategory || element.dataset.recordCategory,
    text: element.dataset.search, target: element, href: `#${element.id}` };
});
const searchIndex = [...sectionEntries, ...contentEntries];
let searchOpener;
function updateSiteSearch() {
  const query = siteSearch.value.trim();
  const results = query ? searchIndex.filter(entry => matches(entry.text, query)) : sectionEntries;
  searchList.replaceChildren();
  results.slice(0, 30).forEach(entry => {
    const li = document.createElement('li');
    const anchor = document.createElement('a');
    const label = document.createElement('span');
    label.textContent = entry.label;
    anchor.href = entry.href;
    anchor.append(label, document.createTextNode(entry.title));
    anchor.addEventListener('click', () => {
      dialog.close();
      // Reset active filters so a result can never be hidden by an earlier choice.
      if (entry.target.classList.contains('record')) {
        recordSearch.value = '';
        recordGroups.forEach(group => { group.querySelector('select').value = 'All'; });
        updateRecords();
      } else if (entry.target.classList.contains('project-card')) {
        document.querySelector('[data-project-filter="All"]').click();
      }
      let ancestor = entry.target;
      while (ancestor && ancestor !== document.body) {
        if (ancestor.tagName === 'DETAILS') ancestor.open = true;
        ancestor = ancestor.parentElement;
      }
      entry.target.tabIndex = -1;
      entry.target.focus({ preventScroll: true });
      entry.target.addEventListener('blur', () => entry.target.removeAttribute('tabindex'), { once: true });
      // The anchor's default action updates the fragment and scrolls into view.
    });
    li.append(anchor);
    searchList.append(li);
  });
  document.querySelector('#site-search-status').textContent = results.length > 30 ? `${results.length} matches. Showing the first 30; type more to narrow the list.` : `${results.length} ${results.length === 1 ? 'match' : 'matches'}.`;
}
function openSearch(opener) {
  if (dialog.open || typeof dialog.showModal !== 'function') return;
  searchOpener = opener;
  siteSearch.value = '';
  updateSiteSearch();
  dialog.showModal();
  siteSearch.focus();
}
document.querySelectorAll('[data-open-search]').forEach(button => button.addEventListener('click', () => openSearch(button)));
document.querySelector('[data-close-search]').addEventListener('click', () => { dialog.close(); searchOpener?.focus(); });
dialog.addEventListener('cancel', () => searchOpener?.focus());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
    dialog.close();
    searchOpener?.focus();
  }
});
siteSearch.addEventListener('input', updateSiteSearch);
document.addEventListener('keydown', event => {
  const editing = event.target.closest('input,textarea,select,[contenteditable="true"]');
  if (!editing && !dialog.open && (event.key === '/' || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k'))) {
    event.preventDefault();
    openSearch(document.activeElement);
  }
});

// Expand fragment-linked records even when the visitor opens a URL directly.
function revealFragment() {
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const target = document.getElementById(id);
  if (!target) return;
  let ancestor = target;
  while (ancestor && ancestor !== document.body) {
    if (ancestor.tagName === 'DETAILS') ancestor.open = true;
    ancestor = ancestor.parentElement;
  }
}
window.addEventListener('hashchange', revealFragment);
revealFragment();

// A deterministic illustration of interval width, explicitly separate from research evidence.
const intervalWidth = document.querySelector('#interval-width');
const toggleDrift = document.querySelector('#toggle-drift');
function updateSignal() {
  const drift = toggleDrift.getAttribute('aria-pressed') === 'true';
  const result = evaluateSignal(intervalWidth.value, drift);
  // SVG markup is generated only from bounded numeric values, never user-supplied text.
  document.querySelector('#signal-chart').innerHTML = signalSVG(result.halfWidth, drift);
  document.querySelector('#interval-value').textContent = `±${result.halfWidth.toFixed(1)}°C`;
  document.querySelector('#signal-count').textContent = `${result.outside} / 80 outside interval`;
}
intervalWidth.addEventListener('input', updateSignal);
toggleDrift.addEventListener('click', () => {
  const on = toggleDrift.getAttribute('aria-pressed') !== 'true';
  toggleDrift.setAttribute('aria-pressed', String(on));
  toggleDrift.firstChild.textContent = on ? 'Remove sensor drift ' : 'Add sensor drift ';
  updateSignal();
});
updateSignal();

// Ensure closed disclosure content is printable, then restore the visitor's state.
let printState = [];
window.addEventListener('beforeprint', () => {
  printState = [...document.querySelectorAll('details')].map(details => [details, details.open]);
  printState.forEach(([details]) => { details.open = true; });
});
window.addEventListener('afterprint', () => {
  printState.forEach(([details, open]) => { details.open = open; });
  printState = [];
});
