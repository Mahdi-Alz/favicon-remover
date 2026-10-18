(() => {
  const BLANK_ICON =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'/%3E";
  const MARK = 'data-favicon-remover';
  const ICON_SELECTOR = [
    'link[rel~="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]',
    'link[rel="apple-touch-icon-precomposed"]',
    'link[rel="mask-icon"]'
  ].join(',');

  const stashed = [];
  let observer = null;
  let blank = null;

  function isHidden(sites) {
    return sites.some((entry) => hostMatches(location.hostname, entry));
  }

  function touchesLinks(records) {
    return records.some((record) => {
      if (record.type === 'attributes') return record.target.localName === 'link';
      return [...record.addedNodes, ...record.removedNodes].some(
        (node) =>
          node.nodeType === Node.ELEMENT_NODE &&
          (node.localName === 'link' || node.localName === 'head' || node.querySelector('link'))
      );
    });
  }

  function sweep() {
    const head = document.head;
    if (!head) return;

    document.querySelectorAll(ICON_SELECTOR).forEach((link) => {
      if (link.hasAttribute(MARK)) return;
      stashed.push({ link, parent: link.parentNode, next: link.nextSibling });
      link.remove();
    });

    if (!blank) {
      blank = document.createElement('link');
      blank.rel = 'icon';
      blank.href = BLANK_ICON;
      blank.setAttribute(MARK, '');
    }
    if (blank.parentNode !== head || head.lastElementChild !== blank) {
      head.appendChild(blank);
    }
  }

  function start() {
    if (observer) return;
    observer = new MutationObserver((records) => {
      if (touchesLinks(records)) sweep();
    });
    observer.observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['rel', 'href']
    });
    sweep();
  }

  function stop() {
    if (!observer) return;
    observer.disconnect();
    observer = null;
    if (blank) blank.remove();
    while (stashed.length) {
      const { link, parent, next } = stashed.pop();
      const anchor = next && next.parentNode === parent ? next : null;
      (parent && parent.isConnected ? parent : document.head)?.insertBefore(link, anchor);
    }
  }

  function apply(sites) {
    if (isHidden(sites)) start();
    else stop();
  }

  getHiddenSites().then(apply);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync' || !changes[STORAGE_KEY]) return;
    const value = changes[STORAGE_KEY].newValue;
    apply(Array.isArray(value) ? value : []);
  });
})();
