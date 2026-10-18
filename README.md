# Favicon Remover

A small browser extension that hides the favicon on the tab for websites you choose. Hide it on a site with one click, and put it back the same way.

## Install

### Firefox

Available on Firefox Add-ons: https://addons.mozilla.org/firefox/addon/favicon-remover/

### Chrome (and other Chromium browsers)

It isn't on the Chrome Web Store, so load it as an unpacked extension:

1. Download this repository: click **Code → Download ZIP** and unzip it, or run `git clone https://github.com/Mahdi-Alz/favicon-remover.git`.
2. Open `chrome://extensions`.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select the project folder (the one containing `manifest.json`).
5. Pin the extension from the puzzle-piece menu if you want it in the toolbar.

The same steps work in Edge, Brave and other Chromium browsers.

## Usage

- Open a website and click the toolbar icon.
- Press **Hide favicon** to hide that site's tab icon. Press **Put favicon back** to restore it. No page reload is needed.
- Add a site by hand with the field at the top of the list.
- Use the search icon next to **Hidden on** to filter your list.
- A site entry also covers its subdomains: `example.com` covers `app.example.com`. A leading `www.` is ignored.

The browser still reserves the space where the icon would be, so a hidden favicon leaves an empty gap in the tab.

## How it works

A content script runs on every http and https page. On sites in your list, it removes the page's icon `<link>` tags and adds a blank icon in their place. A `MutationObserver` keeps it that way if the page changes its icon later. Your list is stored with `storage.sync`.

## Privacy

Favicon Remover collects no data and makes no network requests. Your site list stays in your browser's storage, and is synced by your browser only if you use browser sync.

## Project layout

- `manifest.json`: extension manifest (Manifest V3)
- `content.js`: swaps the icon on hidden sites
- `shared.js`: site matching and storage helpers
- `popup.html`, `popup.css`, `popup.js`: toolbar popup
- `icons/`: extension icons (`icon.svg` is the source)

There is no build step. To make a Firefox package:

```sh
zip -r favicon-remover.xpi manifest.json content.js shared.js popup.html popup.css popup.js icons/icon-*.png
```

## License

MIT. See [LICENSE](LICENSE).
