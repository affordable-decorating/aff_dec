# Affordable Decorating: site

A plain static site. No build step, no framework. Everything the site shows comes from JSON files in `data/`: the catalog, the site's own pages, and the intranet.

## Edit the catalog with a form (the CMS)

`affordable-decorating-cms.html` (next to this folder, not inside it) is a single-file editor for the data files. Do not upload it with the site.

1. Open it in Chrome or Edge.
2. Choose **Open site folder** and select this folder. Allow editing when asked.
3. Use the Items, Collections, Departments, Site pages and Intranet tabs. Saving writes straight to `data/*.json`. Images and downloads you attach are copied into `images/` and `files/` and named after the item number.

Every image needs alt text, and the form will not save without it. In browsers that cannot edit folders (Firefox, Safari), use **Open data files** instead, then **Download changed files** and replace the originals; attached files must be copied into the site by hand.

## Edit the hosted site directly (GitHub mode)

Instead of a folder, the editor can work on the GitHub repository itself, from any device, including a phone. Choose **Open from GitHub** and enter:

- the repository, as `owner/name` (or its address);
- the branch (usually `main`);
- an access token. Create one at https://github.com/settings/personal-access-tokens/new : Repository access, *Only select repositories*, pick the site's repository; Repository permissions, **Contents: Read and write**; nothing else; set an expiry. Treat it like a password.

Each save becomes a commit, and GitHub Pages republishes the site a minute or two later. Images and downloads you attach are committed too (files over 25 MB are refused; add those with GitHub Desktop or the GitHub website). If the data changed on GitHub since you opened it (say, from another device), a save is refused rather than overwriting; open from GitHub again and redo the change. The token is kept only if you tick *Remember*, and only in that browser.

The editor file contains no secrets, so it can live anywhere: in its own repository with GitHub Pages turned on, or on any web host. Do not put it in the site repository's published files unless you are fine with it being public (it is harmless without a token, but there is no reason to advertise it).

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

    index.html                front page (text comes from data/pages.json, page "home")
    about/index.html          a stub that loads the "about" page from data/pages.json
    page/index.html           any site page                (?id=slug)
    catalog/index.html        every item
    department/index.html     one department's items   (?id=slug)
    collection/index.html     one collection's items   (?id=slug)
    collections/index.html    every collection
    item/index.html           one item                 (?id=AD-0001)
    intranet/index.html       the intranet front page (built from data/intranet.json)
    intranet/page/index.html  one intranet page            (?id=slug)
    intranet/list/index.html  an index of one page type    (?type=notice|form|policy|reference|minutes)
    assets/site.js            renders the catalog and site pages from the data files
    assets/markup.js          the simple text markup used in page bodies (shared)
    assets/intranet.js        renders the intranet
    assets/site.css           styles for the cataloguers' pages (navy side menu, white page)
    assets/logo/              the wordmark, short mark and favicon; decades/ holds the 1970s to 1990s versions and the hat's
    assets/intranet.css       styles for the intranet pages (1995)
    data/items.json           the catalog
    data/departments.json     the departments (also the site navigation)
    data/collections.json     optional groups within departments
    data/pages.json           the site's own pages (front page, About, notes, finding aids)
    data/intranet.json        the intranet pages

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

## Drafts

Any item, site page or intranet page can be marked `"draft": true` (the **Draft** tick box in the editor). The site skips drafts everywhere, as if they did not exist, and the editor labels them DRAFT in its lists. Untick it to publish. A draft is hidden, not secret: the data file is still uploaded with the site. The editor's **Duplicate as new draft** button copies a record as a starting point.

## Text markup

Page bodies (site pages and intranet pages), item descriptions and collection descriptions are plain text with a few marks. Nothing else is interpreted, and raw HTML is not allowed.

    Blank line          new paragraph
    ## Heading          heading (### for a smaller one)
    - item              bulleted list (one per line)
    1. item             numbered list
    | a | b |           table rows; a line of |---|---| after the first row makes it the header
    **bold**  *italic*
    [text](address)     link

Link addresses can be a full `https://` address, `mailto:`, a relative path, or a shortcut: `page:slug`, `item:AD-0001`, `dept:slug`, `collection:slug`, `intranet:slug` (or `intranet:home`). In the CMS, the **Insert a link** panel under each text box lists every page, item, department and collection to pick from, so you do not type these by hand. The page and intranet forms show a live preview.

## Finding your way around the editor

The list on the left can be searched, sorted and filtered (by draft, department, collection, status, page type, menu, access and so on). **Check site** (top bar) lists broken links, missing departments or files, drafts that published pages point at, missing About or front pages and intranet date problems, with an Open button for each. Notes are things that may be deliberate, such as an intranet see-also link to a page that does not exist.

## Site pages (the Site pages tab, `data/pages.json`)

Every page has `slug`, `type`, `title`, `menu` (`none`, `about` or `main`), `order`, `listed`, `revised` (optional, shown quietly at the bottom) and `hidden` (optional HTML comment). A page lives at `/page/?id=slug`. Four types:

- **standard**: a title and a `body`. Use it for About and legal notices.
- **notes**: Cataloguer's notes. A dated log (`entries`: `date`, `title`, `body`), newest first, with an optional `body` introduction.
- **finding-aid**: a curated list of catalog items (`items`: `id`, optional `note`) with an introduction in `body`.
- **front**: the front page. Exactly one, with slug `home`: `lede`, `body` (the story) and `recentCount`.

`menu: "main"` puts the page in the side menu after Collections; `"about"` puts it at the bottom with About. `listed: false` keeps it out of the menu. `about/index.html` is a tiny stub that loads the page with slug `about`, so the old link (and the link in the front-page copy) keeps working. Keep a page with slug `about`.

## Intranet pages (the Intranet tab, `data/intranet.json`)

The intranet is dated 1995. Dates are stored as `YYYY-MM-DD` and shown as MM/DD/YY. The CMS refuses dates after 1995. Every page has: `slug`, `type`, `title`, `owner` (a department or title, never a name), `issued`, optional `originally` (when it first appeared), `revision`, `status` (`current`, `superseded`, `withdrawn`), `access`, `seeAlso` (slugs of other intranet pages), `body`, and optional `hidden`.

Five types, each with its own extra fields and layout:

- **notice**: a memo (`to`, `from`; the title is the Re: line). Listed on the Notices board.
- **form**: `number`, `submitTo`, and `fields` (`label`, `instruction`), shown as a table of blanks. Listed on the Forms Index, which shows gaps in the numbering as "Not on file".
- **policy**: `number`, `effective`, `supersedes`; `##` headings in the body are numbered automatically.
- **reference**: tables and lists (extension lists, schedules, org charts by title).
- **minutes**: `meetingDate` and `attendees` (titles only).

Access: `all` pages are listed. `restricted` pages are listed and marked, with a "restricted to" line. `classified` pages are listed nowhere (not on the home page, any index, or the forms-index numbering); they are found only through a link in some other page's text, a `seeAlso` entry, a skipped number in an index, or by typing the address. This is theatre: the data file is public. The home page, indexes and navigation are built automatically from the pages, so adding a page needs no other edits.

## Add a department

Add an entry to `data/departments.json` with a `slug`, `name` and `description`. It appears in the navigation and gets its own page automatically. (The Departments tab does this too.)

## Change the front-page story or the About text

Use the Site pages tab, or edit `data/pages.json` (pages `home` and `about`). The HTML files no longer hold any of that text.

## Notes

- The "this is fictional" statement lives on the About page (slug `about`), which is linked from the bottom of the side menu on every page. Keep it.
- Add a contact line to the About page if you want people to be able to reach you.
