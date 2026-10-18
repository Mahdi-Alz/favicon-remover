const STORAGE_KEY = 'hiddenSites';

function normalizeHost(input) {
  let value = String(input || '').trim().toLowerCase();
  if (!value) return '';
  if (!value.includes('://')) value = 'https://' + value;
  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function hostMatches(hostname, entry) {
  const host = hostname.replace(/^www\./, '');
  return host === entry || host.endsWith('.' + entry);
}

async function getHiddenSites() {
  const data = await chrome.storage.sync.get(STORAGE_KEY);
  return Array.isArray(data[STORAGE_KEY]) ? data[STORAGE_KEY] : [];
}

function setHiddenSites(sites) {
  return chrome.storage.sync.set({ [STORAGE_KEY]: sites });
}
