const currentHostEl = document.getElementById('currentHost');
const statusEl = document.getElementById('status');
const toggleBtn = document.getElementById('toggle');
const addForm = document.getElementById('addForm');
const addInput = document.getElementById('addInput');
const listEl = document.getElementById('list');
const emptyEl = document.getElementById('empty');
const searchToggle = document.getElementById('searchToggle');
const searchInput = document.getElementById('searchInput');

let currentHost = '';
let sites = [];
let query = '';

function render() {
  const hiddenHere = Boolean(currentHost) && sites.some((site) => hostMatches(currentHost, site));
  toggleBtn.disabled = !currentHost;
  toggleBtn.textContent = hiddenHere ? 'Put favicon back' : 'Hide favicon';
  toggleBtn.classList.toggle('on', Boolean(hiddenHere));
  statusEl.textContent = !currentHost ? '' : hiddenHere ? 'Favicon is hidden here' : 'Favicon is visible';
  statusEl.classList.toggle('hidden-here', Boolean(hiddenHere));

  const visible = sites.filter((site) => site.includes(query));

  listEl.replaceChildren(
    ...visible.map((site) => {
      const li = document.createElement('li');
      const name = document.createElement('span');
      name.textContent = site;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Remove';
      remove.addEventListener('click', () => save(sites.filter((s) => s !== site)));
      li.append(name, remove);
      return li;
    })
  );
  emptyEl.textContent = sites.length ? 'No matches.' : 'No sites yet.';
  emptyEl.hidden = visible.length > 0;
}

async function save(next) {
  sites = [...new Set(next)].sort();
  await setHiddenSites(sites);
  render();
}

toggleBtn.addEventListener('click', () => {
  if (!currentHost) return;
  const covered = sites.some((site) => hostMatches(currentHost, site));
  save(covered ? sites.filter((site) => !hostMatches(currentHost, site)) : [...sites, currentHost]);
});

searchToggle.addEventListener('click', () => {
  const open = searchInput.hidden;
  searchInput.hidden = !open;
  searchToggle.setAttribute('aria-expanded', String(open));
  if (open) {
    searchInput.focus();
  } else {
    searchInput.value = '';
    query = '';
    render();
  }
});

searchInput.addEventListener('input', () => {
  query = searchInput.value.trim().toLowerCase();
  render();
});

addForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const host = normalizeHost(addInput.value);
  if (!host) return;
  addInput.value = '';
  save([...sites, host]);
});

(async () => {
  sites = await getHiddenSites();
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url && /^https?:/.test(tab.url)) {
    currentHost = normalizeHost(tab.url);
    currentHostEl.textContent = currentHost;
  } else {
    currentHostEl.textContent = 'Not a website tab';
  }
  render();
})();
