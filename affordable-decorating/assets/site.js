/*
  Affordable Decorating: shared script.

  Every page sets <body data-page="..." data-root="...">.
    data-root  is the relative path back to the site root ("./", "../", "../../").
    data-page  is one of: home, about, catalog, department, collection, collections, item, intranet-index.

  All catalog content comes from /data/*.json. To add an item, edit
  data/items.json. No other file needs to change.
*/
(function () {
  "use strict";

  var body = document.body;
  var root = body.getAttribute("data-root") || "./";
  var page = body.getAttribute("data-page");

  // ---------- helpers ----------

  function el(tag, attrs, kids) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "text") node.textContent = attrs[key];
      else node.setAttribute(key, attrs[key]);
    });
    (kids || []).forEach(function (kid) {
      node.appendChild(typeof kid === "string" ? document.createTextNode(kid) : kid);
    });
    return node;
  }

  function getJSON(path) {
    return fetch(root + path).then(function (response) {
      if (!response.ok) throw new Error("Could not load " + path);
      return response.json();
    });
  }

  function query(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  var collections = [];

  function itemUrl(id) { return root + "item/?id=" + encodeURIComponent(id); }
  function deptUrl(slug) { return root + "department/?id=" + encodeURIComponent(slug); }
  function collectionUrl(slug) { return root + "collection/?id=" + encodeURIComponent(slug); }

  function findCollection(slug) {
    return collections.filter(function (c) { return c.slug === slug; })[0];
  }

  // The departments a collection touches: its own department (if it has one)
  // plus the department of every item in it. Collections may span departments.
  function collectionDepartments(items, coll, departments) {
    var slugs = [];
    if (coll.department) slugs.push(coll.department);
    items.forEach(function (item) {
      if (item.collection === coll.slug && slugs.indexOf(item.department) === -1) slugs.push(item.department);
    });
    return slugs.sort(function (a, b) {
      return departmentName(departments, a) < departmentName(departments, b) ? -1 : 1;
    });
  }

  function paragraphs(text) {
    return String(text || "")
      .split(/\n\s*\n/)
      .filter(function (chunk) { return chunk.trim() !== ""; })
      .map(function (chunk) { return el("p", { text: chunk.trim() }); });
  }

  // Where a downloadable file came from, in the archive's own terms.
  // file.source is "scan" or "reconstruction"; file.reference is optional.
  function fileOrigin(file) {
    var ref = file.reference ? " " + file.reference : "";
    if (file.source === "scan") {
      return "Scan of the item as it stands in the warehouse." + (file.reference ? " Scan record" + ref + "." : "");
    }
    if (file.source === "reconstruction") {
      return "Reconstructed from an internal blueprint" + ref + ". The item itself has not been found.";
    }
    return "";
  }

  function departmentName(departments, slug) {
    var found = departments.filter(function (d) { return d.slug === slug; })[0];
    return found ? found.name : slug;
  }

  function showError(message) {
    var target = document.getElementById("content") || document.getElementById("main");
    if (!target) return;
    target.appendChild(el("p", { "class": "notice", text: message }));
  }

  function setTitle(text) {
    document.title = text + " | Affordable Decorating";
  }

  // ---------- shared pieces ----------

  function renderNav(departments) {
    var nav = document.getElementById("site-nav");
    if (!nav) return;
    var here = window.location.pathname + window.location.search;
    function link(href, text) {
      var a = el("a", { href: href, text: text });
      var target = new URL(href, window.location.href);
      if (target.pathname + target.search === here ||
          (target.search === "" && target.pathname === window.location.pathname && page !== "home")) {
        a.setAttribute("aria-current", "page");
      }
      return el("li", {}, [a]);
    }
    var primary = el("ul");
    primary.appendChild(link(root + "catalog/", "All items"));
    primary.appendChild(link(root + "collections/", "Collections"));
    nav.appendChild(primary);

    var details = el("details", { "class": "depts" }, [el("summary", { text: "Departments" })]);
    var list = el("ul");
    departments.forEach(function (d) { list.appendChild(link(deptUrl(d.slug), d.name)); });
    details.appendChild(list);
    // Open on wide screens, collapsed on narrow ones, unless the page is inside a department.
    if (window.matchMedia("(min-width: 48rem)").matches || page === "department") details.setAttribute("open", "");
    nav.appendChild(details);
  }

  function renderItemList(items, departments, options) {
    options = options || {};
    var list = el("ul", { "class": "entries" });
    items.forEach(function (item) {
      var note = [];
      if (options.showDepartment !== false) note.push(departmentName(departments, item.department));
      if (options.showCollection !== false && item.collection) {
        var coll = findCollection(item.collection);
        if (coll) note.push(coll.name);
      }
      if (options.showDate && item.added) note.push("added " + item.added);
      if (item.status && item.status !== "catalogued") note.push(item.status);
      var entry = el("li", {}, [
        el("a", { href: itemUrl(item.id), text: item.id + "  " + item.title })
      ]);
      if (note.length) entry.appendChild(el("span", { "class": "meta", text: note.join(", ") }));
      list.appendChild(entry);
    });
    return list;
  }

  function newestFirst(a, b) {
    if (a.added !== b.added) return a.added < b.added ? 1 : -1;
    return a.id < b.id ? 1 : -1;
  }

  // ---------- pages ----------

  function renderHome(items, departments) {
    var target = document.getElementById("recent");
    if (!target) return;
    var recent = items.slice().sort(newestFirst).slice(0, 5);
    if (!recent.length) {
      target.appendChild(el("p", { text: "No items have been catalogued yet." }));
      return;
    }
    target.appendChild(renderItemList(recent, departments, { showDate: true }));
  }

  function renderCatalog(items, departments) {
    var target = document.getElementById("content");
    var sorted = items.slice().sort(function (a, b) { return a.id < b.id ? -1 : 1; });
    target.appendChild(el("p", { text: sorted.length + (sorted.length === 1 ? " item" : " items") + " catalogued." }));
    target.appendChild(renderItemList(sorted, departments));
  }

  function renderDepartment(items, departments) {
    var target = document.getElementById("content");
    var slug = query("id");
    var dept = departments.filter(function (d) { return d.slug === slug; })[0];
    if (!dept) {
      setTitle("No such department");
      target.appendChild(el("h1", { text: "No such department" }));
      target.appendChild(el("p", {}, ["No department with that name is on file. ", el("a", { href: root + "catalog/", text: "Return to the catalog" }), "."]));
      return;
    }
    setTitle(dept.name);
    target.appendChild(el("h1", { text: dept.name }));
    target.appendChild(el("p", { text: dept.description }));

    var deptCollections = collections.filter(function (c) {
      return c.department === slug || items.some(function (i) { return i.collection === c.slug && i.department === slug; });
    });
    if (deptCollections.length) {
      target.appendChild(el("h2", { text: "Collections" }));
      var collList = el("ul", { "class": "entries" });
      deptCollections.forEach(function (c) {
        var count = items.filter(function (i) { return i.collection === c.slug; }).length;
        var entry = el("li", {}, [el("a", { href: collectionUrl(c.slug), text: c.name })]);
        entry.appendChild(el("span", { "class": "meta", text: count + (count === 1 ? " item" : " items") }));
        collList.appendChild(entry);
      });
      target.appendChild(collList);
      target.appendChild(el("h2", { text: "Items" }));
    }

    var members = items
      .filter(function (item) { return item.department === slug; })
      .sort(function (a, b) { return a.id < b.id ? -1 : 1; });
    if (!members.length) {
      target.appendChild(el("p", { text: "Nothing in this department has been catalogued yet." }));
      return;
    }
    target.appendChild(renderItemList(members, departments, { showDepartment: false }));
  }

  function renderCollectionsIndex(items, departments) {
    var target = document.getElementById("content");
    if (!collections.length) {
      target.appendChild(el("p", { text: "No collections have been catalogued yet." }));
      return;
    }
    var list = el("ul", { "class": "entries" });
    collections
      .slice()
      .sort(function (a, b) { return a.name < b.name ? -1 : 1; })
      .forEach(function (c) {
        var count = items.filter(function (i) { return i.collection === c.slug; }).length;
        var names = collectionDepartments(items, c, departments).map(function (s) { return departmentName(departments, s); });
        var meta = count + (count === 1 ? " item" : " items") + (names.length ? ", " + names.join(", ") : "");
        list.appendChild(el("li", {}, [
          el("a", { href: collectionUrl(c.slug), text: c.name }),
          el("span", { "class": "meta", text: meta })
        ]));
      });
    target.appendChild(list);
  }

  function renderCollection(items, departments) {
    var target = document.getElementById("content");
    var slug = query("id");
    var coll = findCollection(slug);
    if (!coll) {
      setTitle("No such collection");
      target.appendChild(el("h1", { text: "No such collection" }));
      target.appendChild(el("p", {}, ["No collection with that name is on file. ", el("a", { href: root + "catalog/", text: "Return to the catalog" }), "."]));
      return;
    }
    setTitle(coll.name);
    target.appendChild(el("h1", { text: coll.name }));
    var spanned = collectionDepartments(items, coll, departments);
    if (spanned.length) {
      var parts = [spanned.length === 1 ? "Collection within " : "Collection spanning "];
      spanned.forEach(function (s, idx) {
        if (idx > 0) parts.push(idx === spanned.length - 1 ? " and " : ", ");
        parts.push(el("a", { href: deptUrl(s), text: departmentName(departments, s) }));
      });
      target.appendChild(el("p", { "class": "lede" }, parts));
    }
    paragraphs(coll.description).forEach(function (p) { target.appendChild(p); });
    var members = items
      .filter(function (item) { return item.collection === slug; })
      .sort(function (a, b) { return a.id < b.id ? -1 : 1; });
    if (!members.length) {
      target.appendChild(el("p", { text: "Nothing in this collection has been catalogued yet." }));
      return;
    }
    target.appendChild(renderItemList(members, departments, { showDepartment: false, showCollection: false }));
  }

  function renderItem(items, departments) {
    var target = document.getElementById("content");
    var id = query("id");
    var item = items.filter(function (i) { return i.id === id; })[0];
    if (!item) {
      setTitle("Item not on file");
      target.appendChild(el("h1", { text: "Item not on file" }));
      target.appendChild(el("p", {}, ["No item with that number has been catalogued. ", el("a", { href: root + "catalog/", text: "Return to the catalog" }), "."]));
      return;
    }
    setTitle(item.id + " " + item.title);

    var article = el("article");
    article.appendChild(el("h1", { text: item.title }));

    var facts = el("dl", { "class": "facts" });
    function fact(label, valueNode) {
      facts.appendChild(el("dt", { text: label }));
      facts.appendChild(el("dd", {}, [valueNode]));
    }
    fact("Inventory number", document.createTextNode(item.id));
    fact("Department", el("a", { href: deptUrl(item.department), text: departmentName(departments, item.department) }));
    var itemCollection = item.collection ? findCollection(item.collection) : null;
    if (itemCollection) fact("Collection", el("a", { href: collectionUrl(itemCollection.slug), text: itemCollection.name }));
    (item.details || []).forEach(function (detail) {
      if (detail && detail.label) fact(detail.label, document.createTextNode(detail.value || ""));
    });
    // Optional purchase inquiry: a price and an email address, shown together.
    // Hidden once the status is "sold" or "acquired".
    var inquiry = item.inquiry;
    var available = inquiry && inquiry.price && inquiry.email && !/^(sold|acquired)$/i.test(item.status || "");
    if (available) fact("Price", document.createTextNode(inquiry.price));
    if (item.status) fact("Status", document.createTextNode(item.status));
    if (item.added) fact("Catalogued", document.createTextNode(item.added));
    article.appendChild(facts);

    (item.images || []).forEach(function (image) {
      var figure = el("figure");
      figure.appendChild(el("img", { src: root + image.src, alt: image.alt || "" }));
      if (image.caption) figure.appendChild(el("figcaption", { text: image.caption }));
      article.appendChild(figure);
    });

    paragraphs(item.description).forEach(function (p) { article.appendChild(p); });

    if (item.condition) {
      article.appendChild(el("h2", { text: "Condition" }));
      article.appendChild(el("p", { text: item.condition }));
    }

    if (item.files && item.files.length) {
      article.appendChild(el("h2", { text: "Files" }));
      var fileList = el("ul");
      item.files.forEach(function (file) {
        var entry = el("li", {}, [el("a", { href: root + file.path, text: file.label })]);
        var origin = fileOrigin(file);
        if (origin) entry.appendChild(el("span", { "class": "meta", text: origin }));
        fileList.appendChild(entry);
      });
      article.appendChild(fileList);
    }

    if (available) {
      var subject = "Inquiry: " + item.id + " " + item.title;
      var href = "mailto:" + inquiry.email + "?subject=" + encodeURIComponent(subject);
      article.appendChild(el("p", { "class": "inquiry" }, [el("a", { href: href, text: "Inquire about purchase" })]));
    }

    // Optional hidden note: appears only in the page source, as an HTML comment.
    if (item.hidden) {
      article.appendChild(document.createComment(" " + String(item.hidden).replace(/--/g, "- -") + " "));
    }

    target.appendChild(article);
  }

  function renderIntranetIndex(pages) {
    var target = document.getElementById("pages");
    if (!target) return;
    var table = el("table", { "class": "grid" });
    var head = el("tr", {}, [
      el("th", { text: "Page" }),
      el("th", { text: "Owner" }),
      el("th", { text: "Last updated" })
    ]);
    table.appendChild(el("thead", {}, [head]));
    var tbody = el("tbody");
    pages.forEach(function (p) {
      tbody.appendChild(el("tr", {}, [
        el("td", {}, [el("a", { href: p.path, text: p.title })]),
        el("td", { text: p.owner || "" }),
        el("td", { text: p.updated || "" })
      ]));
    });
    table.appendChild(tbody);
    target.appendChild(table);
  }

  // ---------- start ----------

  function start() {
    if (page === "intranet-index") {
      getJSON("data/intranet.json").then(renderIntranetIndex).catch(function () {
        showError("This page needs a web server to load its list. See README.md.");
      });
      return;
    }

    Promise.all([
      getJSON("data/items.json"),
      getJSON("data/departments.json"),
      getJSON("data/collections.json").catch(function () { return []; })
    ])
      .then(function (results) {
        var items = results[0];
        var departments = results[1];
        collections = results[2];
        renderNav(departments);
        if (page === "home") renderHome(items, departments);
        else if (page === "catalog") renderCatalog(items, departments);
        else if (page === "department") renderDepartment(items, departments);
        else if (page === "collection") renderCollection(items, departments);
        else if (page === "collections") renderCollectionsIndex(items, departments);
        else if (page === "item") renderItem(items, departments);
      })
      .catch(function () {
        showError("This page needs a web server to load the catalog. See README.md.");
      });
  }

  start();
})();
