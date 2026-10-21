# Affordable Decorating: site

A plain static site. No build step, no framework. Everything the catalog shows comes from three JSON files in `data/`.

## Edit the catalog with a form (the CMS)

`affordable-decorating-cms.html` (next to this folder, not inside it) is a single-file editor for the data files. Do not upload it with the site.

1. Open it in Chrome or Edge.
2. Choose **Open site folder** and select this folder. Allow editing when asked.
3. Use the Items, Collections and Departments tabs. Saving writes straight to `data/*.json`. Images and downloads you attach are copied into `images/` and `files/` and named after the item number.

Every image needs alt text, and the form will not save without it. In browsers that cannot edit folders (Firefox, Safari), use **Open data files** instead, then **Download changed files** and replace the originals; attached files must be copied into the site by hand.

## Collections

A collection is a more specific group inside the catalog, for example a series of related works. Add collections on the Collections tab (or in `data/collections.json`: `slug`, `name`, `department`, `description`) and pick one on any item. Items do not need a collection. A collection may belong to one department (set `department`) or run through several (leave it out). Each collection gets its own page (`/collection/?id=slug`), which names every department it touches, and `/collections/` lists them all. A department page lists every collection that has an item in that department.

## Purchase inquiries

An item can offer an "Inquire about purchase" email link. In the CMS, tick **Available for purchase** and enter a price; the email address defaults to the owner's. The price and the email are saved together as one `inquiry` field:

    "inquiry": { "price": "$40", "email": "someone@example.com" }

The item page then shows the price and a mailto link with the item number in the subject. Setting the item's status to `sold` or `acquired` hides both. There is no cart, checkout or payment handling.

## Where 3D files come from

Each download can say where it came from, using the archive's own terms. In the CMS, pick an origin for the file:

- **Scan:** taken of an item physically in the warehouse. The page says so.
- **Reconstruction:** made from an internal blueprint for an item that has not been found. The page says the item has not been found. Also set the item's status to `not found`.

In the data this is `"source": "scan"` or `"source": "reconstruction"` on a file entry, plus an optional `"reference"` (a blueprint or scan number). Leave both out and the file shows no origin line. The front page explains the two origins to visitors.

## Details

An item can carry any number of label and value pairs, such as Medium or Dimensions. They show with the item's other facts.

## Run it locally

**Do not double-click `index.html`.** The pages load the catalog from the JSON files in `data/`, and browsers block that when a page is opened straight from disk (the address starts with `file://`). You would see the front-page story but no recent items, and other pages would say they need a web server. The fix is to serve the folder from a small local web server, so the address starts with `http://localhost`.

Any of these three ways works. The first is the easiest.

### 1. Double-click a launcher (needs Python 3)

- **Windows:** double-click `start-local-server.bat`. A black window opens and your browser goes to the site.
- **macOS:** double-click `start-local-server.command`. The first time, macOS may refuse to open it; right-click the file, choose Open, then Open again. If it says the file is not executable, open Terminal and run `chmod +x start-local-server.command` in this folder.
- **Linux:** in a terminal in this folder, run `./start-local-server.command` (or `python3 -m http.server 8000`, as below).

Leave the window open while you use the site. Close it, or press Ctrl+C in it, to stop the server. If the launcher says Python was not found, install it from https://www.python.org/downloads/ (on Windows, tick "Add python.exe to PATH" in the installer), then try again.

### 2. Type one command

1. Open a terminal in this folder (the one that contains `index.html` and `data`):
   - **Windows:** open the folder in File Explorer, click the address bar, type `cmd`, press Enter.
   - **macOS:** right-click the folder in Finder, then Services, then New Terminal at Folder. Or open Terminal and type `cd ` followed by dragging the folder into the window.
   - **Linux:** right-click in the folder and choose Open in Terminal, or `cd` to it.
2. Check that Python is installed: `python3 --version` (on Windows, `py --version`). Any 3.x version works.
3. Start the server:
   - macOS and Linux: `python3 -m http.server 8000`
   - Windows: `py -m http.server 8000`
4. In your browser, go to http://localhost:8000/ (the address bar must start with `http://localhost`, not `file://`).
5. Stop the server with Ctrl+C in the terminal.

### 3. Use an editor or Node

- **VS Code:** install the Live Server extension, open this folder in VS Code, right-click `index.html`, and choose Open with Live Server.
- **Node.js:** in this folder, run `npx serve` and open the address it prints.

### If something looks wrong

- **The recent items list is empty, or a page says it needs a web server:** you opened the file directly. Use one of the methods above.
- **"Address already in use":** another program is using port 8000. Use another number, such as `python3 -m http.server 8001`, and visit http://localhost:8001/ instead. (For the launchers, change the `PORT` line at the top of the file.)
- **Your edits to the JSON files do not show:** refresh the page. If it still looks old, hold Shift while refreshing.
- **The pages show but links 404:** the server was started in the wrong folder. It must be started in the folder that contains `index.html`.

The launchers and this README are only for working locally. You do not need to upload them to a host. The CMS (`affordable-decorating-cms.html`) does not need a server; open it directly in Chrome or Edge.

## Put it online for free

All links are relative, so the site works at a domain root or in a subfolder, and item and department pages use query strings (`/item/?id=AD-0001`), so no server rewrite rules are needed. Upload the contents of this folder (the one containing `index.html`), not the zip and not the CMS file. Three free options:

### Netlify Drop (simplest; no account needed to publish)

1. Unzip the download so you have the `affordable-decorating` folder.
2. Go to https://app.netlify.com/drop and drag that folder onto the page.
3. Netlify publishes it at a `netlify.app` address straight away. Sign up (free) to claim the site so you can manage it, and rename the address in the site's settings if you want a nicer one.
4. To update later: edit the files (the CMS does this), open the project in your Netlify dashboard, and drag the updated folder onto it. The same address updates.

### GitHub Pages (best if you will keep editing)

1. Create a free GitHub account, then a new **public** repository.
2. In the repository choose Add file, then Upload files. Drag in everything inside the site folder (so `index.html` sits at the top of the repository), and commit.
3. Open the repository's Settings, then Pages. Under Source pick the `main` branch and the root folder, and save.
4. After a minute or two the site is at `https://YOURNAME.github.io/REPOSITORY/`. To update, upload the changed files the same way.

### Cloudflare Pages

Create a free Cloudflare account, choose Workers & Pages, create a Pages project with the direct-upload option, and drag in the site folder. The free plan allows up to 20,000 files per site and 25 MiB per file.

Use your own account and, if you can, your own device and network. Hosting a personal project from a work computer may be against your employer's rules.

## Layout

    index.html                front page: story, then recent items
    about/index.html          About (the plain statement that the project is fiction)
    catalog/index.html        every item
    department/index.html     one department's items   (?id=slug)
    collection/index.html     one collection's items   (?id=slug)
    collections/index.html    every collection
    item/index.html           one item                 (?id=AD-0001)
    intranet/                 the recovered intranet, in its own period design
    assets/site.js            renders the catalog from the data files
    assets/site.css           styles for the cataloguers' pages (navy side menu, white page)
    assets/logo/              the wordmark, short mark and favicon; decades/ holds the 1970s to 1990s versions and the hat's
    assets/intranet.css       styles for the intranet pages
    data/items.json           the catalog
    data/departments.json     the departments (also the site navigation)
    data/collections.json     optional groups within departments
    data/intranet.json        the list of intranet pages

## Add an item

The CMS form does this for you. To do it by hand, add an entry to `data/items.json`. Nothing else needs to change.

    {
      "id": "AD-0005",
      "department": "miniature-environments",
      "collection": "optional-collection-slug",
      "title": "Short title",
      "description": "First paragraph.\n\nSecond paragraph.",
      "condition": "Condition or acquisition note (optional).",
      "status": "catalogued",
      "details": [{ "label": "Medium", "value": "Ink on paper" }],
      "images": [{ "src": "images/ad-0005.jpg", "alt": "What the picture shows", "caption": "Optional" }],
      "files": [{ "label": "Print file (STL)", "path": "files/ad-0005.stl" }],
      "added": "2026-10-21",
      "hidden": ""
    }

- `department` must match a `slug` in `data/departments.json`.
- `status` is shown on the item and in lists unless it is `catalogued`. Use words like `returned`, `missing` or `not found` when you want the archive to look incomplete.
- `images` and `files` are paths relative to the site root. Put the files in new `images/` and `files/` folders.
- `hidden` is optional. If it holds text, that text appears only in the page's HTML source, as a comment. Use it for light-trail clues.
- The front page shows the five most recently `added` items.
- The sample entries are placeholders. Replace them. Item number AD-0003 is skipped on purpose as a small gap in the inventory; keep or fill it.

## Add a department

Add an entry to `data/departments.json` with a `slug`, `name` and `description`. It appears in the navigation and gets its own page automatically.

## Add an intranet page

1. Copy `intranet/form-12.html` to a new file and edit its contents.
2. Add an entry to `data/intranet.json` (`path`, `title`, `owner`, `updated`).

Keep the intranet in its period style: small sans-serif type, dates as MM/DD/YY, nothing modern.

## Change the front-page story or the About text

Both are plain HTML in `index.html` and `about/index.html`. Edit them directly.

## Notes

- The "this is fictional" statement lives on the About page, which is linked from the bottom of the side menu on every page. If you add a page, keep that menu.
- Add a contact line to the About page if you want people to be able to reach you.
