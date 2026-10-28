/*
  AD-Net: renders the recovered intranet from data/intranet.json.

  Shells: intranet/index.html (home), intranet/page/ (?id=slug), intranet/list/ (?type=notice|form|policy|reference|minutes).
  Page types: notice, form, policy, reference, minutes.
  Access: "all" (listed), "restricted" (listed, marked), "classified" (never listed anywhere;
  reached only by a link, a "see also" entry or a typed address). It is theatre: the data is public.
  Dates are stored as YYYY-MM-DD and shown as MM/DD/YY.
*/
(function () {
  "use strict";

  var body = document.body;
  var root = body.getAttribute("data-root") || "../";
  var kind = body.getAttribute("data-page");
  var app = document.getElementById("ad-net");

  // Switchboard numbers shown on every page. Edit here.
  var CONTACTS = [["Facilities", "214"], ["Commissions", "230"]];

  var TYPES = {
    notice:    { list: "Notices",         plural: "Notices to Staff" },
    form:      { list: "Forms",           plural: "Forms Index" },
    policy:    { list: "Policies",        plural: "Policies and Procedures" },
    reference: { list: "Reference",       plural: "Reference" },
    minutes:   { list: "Minutes",         plural: "Minutes and Logs" }
  };
  var ORDER = ["notice", "form", "policy", "reference", "minutes"];

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (k) { n.appendChild(typeof k === "string" ? document.createTextNode(k) : k); });
    return n;
  }
  function query(name) { return new URLSearchParams(window.location.search).get(name); }
  function pageUrl(slug) { return root + "intranet/page/?id=" + encodeURIComponent(slug); }
  function listUrl(type) { return root + "intranet/list/?type=" + type; }

  function fmt(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    return m ? m[2] + "/" + m[3] + "/" + m[1].slice(2) : (iso || "");
  }
  function newest(a, b) { return a.issued < b.issued ? 1 : a.issued > b.issued ? -1 : 0; }
  function isListed(p) { return p.access !== "classified"; }
  function find(pages, slug) { return pages.filter(function (p) { return p.slug === slug; })[0]; }

  // ---------- frame ----------

  function frame(pages, title) {
    document.title = title + " | AD-Net";
    var wrap = el("div", { "class": "frame" });

    var banner = el("div", { "class": "banner" }, [
      el("img", { "class": "mark", src: root + "assets/logo/decades/1990s-mark-light.svg", width: "48", height: "48", alt: "Affordable Decorating" }),
      el("div", {}, [
        el("div", { "class": "name", text: "AD-Net" }),
        el("div", { "class": "tag", text: "Affordable Decorating Internal Resources" })
      ])
    ]);
    wrap.appendChild(banner);

    var bar = el("div", { "class": "buttons" });
    bar.appendChild(el("a", { href: root + "intranet/", text: "Home" }));
    ORDER.forEach(function (t) { bar.appendChild(el("a", { href: listUrl(t), text: TYPES[t].list })); });
    wrap.appendChild(bar);

    var layout = el("div", { "class": "layout" });
    var side = el("div", { "class": "side" });
    side.appendChild(el("b", { text: "Contents" }));
    var ul = el("ul");
    ul.appendChild(el("li", {}, [el("a", { href: root + "intranet/", text: "AD-Net Home" })]));
    ORDER.forEach(function (t) { ul.appendChild(el("li", {}, [el("a", { href: listUrl(t), text: TYPES[t].plural })])); });
    side.appendChild(ul);
    side.appendChild(el("b", { text: "Switchboard" }));
    var cl = el("ul");
    CONTACTS.forEach(function (c) { cl.appendChild(el("li", { text: c[0] + ", Ext. " + c[1] })); });
    side.appendChild(cl);
    layout.appendChild(side);

    var main = el("div", { "class": "main" });
    layout.appendChild(main);
    wrap.appendChild(layout);
    app.appendChild(wrap);
    return { wrap: wrap, main: main };
  }

  function footer(wrap, p) {
    var f = el("div", { "class": "footer" });
    if (p) {
      var bits = [];
      if (p.owner) bits.push("Owner: " + p.owner);
      bits.push("Revision " + (p.revision || 1));
      bits.push("Last updated " + fmt(p.issued));
      if (p.originally) bits.push("Originally issued " + fmt(p.originally));
      f.appendChild(el("div", { text: bits.join(". ") + "." }));
    }
    f.appendChild(el("div", {}, ["Archived copy. ", el("a", { href: root, text: "Return to the catalog" })]));
    wrap.appendChild(f);
  }

  // ---------- lists ----------

  function table(headers, rows) {
    var t = el("table", { "class": "grid" });
    t.appendChild(el("tr", {}, headers.map(function (h) { return el("th", { text: h }); })));
    rows.forEach(function (r) {
      t.appendChild(el("tr", {}, r.map(function (c) {
        return el("td", {}, [typeof c === "string" ? document.createTextNode(c) : c]);
      })));
    });
    return t;
  }
  function link(p, text) { return el("a", { href: pageUrl(p.slug), text: text || p.title }); }
  function tag(p) {
    var bits = [];
    if (p.access === "restricted") bits.push("RESTRICTED");
    if (p.status === "superseded") bits.push("SUPERSEDED");
    if (p.status === "withdrawn") bits.push("WITHDRAWN");
    return bits.join(", ");
  }

  function listRows(type, pages) {
    var mine = pages.filter(function (p) { return p.type === type && isListed(p); });
    if (type === "form") return formsIndex(mine);
    mine.sort(newest);
    if (type === "notice") return { headers: ["Date", "From", "Subject", "Notes"], rows: mine.map(function (p) { return [fmt(p.issued), p.from || p.owner || "", link(p), tag(p)]; }) };
    if (type === "policy") return { headers: ["Number", "Title", "Effective", "Owner", "Notes"], rows: mine.map(function (p) { return [p.number || "", link(p), fmt(p.effective), p.owner || "", tag(p)]; }) };
    if (type === "minutes") return { headers: ["Meeting", "Record", "Owner", "Notes"], rows: mine.map(function (p) { return [fmt(p.meetingDate || p.issued), link(p), p.owner || "", tag(p)]; }) };
    mine.sort(function (a, b) { return a.title < b.title ? -1 : 1; });
    return { headers: ["Title", "Owner", "Updated", "Notes"], rows: mine.map(function (p) { return [link(p), p.owner || "", fmt(p.issued), tag(p)]; }) };
  }

  // Numbered forms run from 1 to the highest number on file. A number with no
  // listed entry (never issued, lost or classified) shows as not on file.
  function formsIndex(forms) {
    var byNumber = {}, max = 0, other = [];
    forms.forEach(function (p) {
      var n = parseInt(p.number, 10);
      if (String(n) === String(p.number).trim() && n > 0) {
        (byNumber[n] = byNumber[n] || []).push(p);
        if (n > max) max = n;
      } else other.push(p);
    });
    var rows = [], gapStart = 0;
    function closeGap(end) {
      if (!gapStart) return;
      rows.push([gapStart === end ? String(end) : gapStart + "-" + end, "Not on file", "", "", ""]);
      gapStart = 0;
    }
    for (var n = 1; n <= max; n++) {
      if (byNumber[n]) {
        closeGap(n - 1);
        byNumber[n].forEach(function (p) { rows.push([p.number, link(p), String(p.revision || 1), p.owner || "", tag(p)]); });
      } else if (!gapStart) gapStart = n;
    }
    closeGap(max);
    other.forEach(function (p) { rows.push([p.number || "", link(p), String(p.revision || 1), p.owner || "", tag(p)]); });
    return { headers: ["Form", "Title", "Rev.", "Owner", "Notes"], rows: rows };
  }

  function renderList(pages) {
    var type = query("type");
    var f;
    if (!TYPES[type]) {
      f = frame(pages, "Not on file");
      f.main.appendChild(el("h1", { text: "Not on file" }));
      f.main.appendChild(el("p", { text: "There is no such index." }));
      footer(f.wrap);
      return;
    }
    f = frame(pages, TYPES[type].plural);
    f.main.appendChild(el("h1", { text: TYPES[type].plural }));
    var data = listRows(type, pages);
    if (!data.rows.length) f.main.appendChild(el("p", { text: "Nothing is on file." }));
    else f.main.appendChild(table(data.headers, data.rows));
    footer(f.wrap);
  }

  // ---------- home ----------

  function renderHome(pages) {
    var f = frame(pages, "Home");
    f.main.appendChild(el("h1", { text: "AD-Net" }));
    f.main.appendChild(el("p", { text: "Welcome to AD-Net, the internal resource for Affordable Decorating staff. Notices, forms, policies and reference material are kept here. Please check this site before contacting a department." }));
    f.main.appendChild(el("h2", { text: "Notices to Staff" }));
    var data = listRows("notice", pages);
    if (!data.rows.length) f.main.appendChild(el("p", { text: "There are no current notices." }));
    else f.main.appendChild(table(data.headers, data.rows.slice(0, 5)));
    f.main.appendChild(el("h2", { text: "Indexes" }));
    var ul = el("ul");
    ORDER.forEach(function (t) { ul.appendChild(el("li", {}, [el("a", { href: listUrl(t), text: TYPES[t].plural })])); });
    f.main.appendChild(ul);
    footer(f.wrap);
  }

  // ---------- one page ----------

  function banner(text, cls) {
    return el("div", { "class": "alert " + cls, text: text });
  }

  function renderPage(pages) {
    var p = find(pages, query("id"));
    var f;
    if (!p || !TYPES[p.type]) {
      f = frame(pages, "Not on file");
      f.main.appendChild(el("h1", { text: "Not on file" }));
      f.main.appendChild(el("p", { text: "No page with that name is on file. It may have been removed." }));
      footer(f.wrap);
      return;
    }
    var heading = p.title;
    if (p.type === "form") heading = "Form " + (p.number || "") + ": " + p.title;
    if (p.type === "policy" && p.number) heading = p.number + ": " + p.title;
    if (p.type === "notice") heading = "Notice: " + p.title;
    f = frame(pages, heading);
    var m = f.main;

    if (p.access === "classified") m.appendChild(banner("CLASSIFIED. Do not copy or distribute.", "classified"));
    if (p.access === "restricted") m.appendChild(banner("DISTRIBUTION RESTRICTED" + (p.restrictedTo ? " to " + p.restrictedTo : "") + ".", "restricted"));
    if (p.status === "superseded") m.appendChild(banner("THIS DOCUMENT HAS BEEN SUPERSEDED. Do not use.", "status"));
    if (p.status === "withdrawn") m.appendChild(banner("THIS DOCUMENT HAS BEEN WITHDRAWN.", "status"));

    m.appendChild(el("h1", { text: heading }));
    var md = function (text, opts) {
      opts = opts || {};
      opts.root = root;
      m.appendChild(window.ADMarkup.render(text, opts));
    };

    if (p.type === "notice") {
      var memo = el("table", { "class": "memo" });
      [["To:", p.to || "All Staff"], ["From:", p.from || p.owner || ""], ["Date:", fmt(p.issued)], ["Re:", p.title]].forEach(function (r) {
        memo.appendChild(el("tr", {}, [el("th", { text: r[0] }), el("td", { text: r[1] })]));
      });
      m.appendChild(memo);
      m.appendChild(el("hr"));
      md(p.body);
    } else if (p.type === "form") {
      md(p.body);
      var ft = el("table", { "class": "form" });
      (p.fields || []).forEach(function (fl) {
        var th = el("th", { text: fl.label });
        var td = el("td", { "class": "blank" });
        if (fl.instruction) td.textContent = fl.instruction;
        ft.appendChild(el("tr", {}, [th, td]));
      });
      m.appendChild(ft);
      if (p.submitTo) m.appendChild(el("p", {}, [el("b", { text: "Return to: " }), p.submitTo]));
    } else if (p.type === "policy") {
      var meta = el("table", { "class": "memo" });
      if (p.number) meta.appendChild(el("tr", {}, [el("th", { text: "Number:" }), el("td", { text: p.number })]));
      if (p.effective) meta.appendChild(el("tr", {}, [el("th", { text: "Effective:" }), el("td", { text: fmt(p.effective) })]));
      if (p.supersedes) meta.appendChild(el("tr", {}, [el("th", { text: "Supersedes:" }), el("td", { text: p.supersedes })]));
      m.appendChild(meta);
      m.appendChild(el("hr"));
      md(p.body, { numberHeadings: true });
    } else if (p.type === "minutes") {
      var mt = el("table", { "class": "memo" });
      mt.appendChild(el("tr", {}, [el("th", { text: "Meeting:" }), el("td", { text: fmt(p.meetingDate || p.issued) })]));
      if (p.attendees && p.attendees.length) mt.appendChild(el("tr", {}, [el("th", { text: "Present:" }), el("td", { text: p.attendees.join("; ") })]));
      m.appendChild(mt);
      m.appendChild(el("hr"));
      md(p.body);
    } else {
      md(p.body);
    }

    if (p.seeAlso && p.seeAlso.length) {
      m.appendChild(el("h2", { text: "See also" }));
      var ul = el("ul");
      p.seeAlso.forEach(function (slug) {
        var other = find(pages, slug);
        ul.appendChild(el("li", {}, [el("a", { href: pageUrl(slug), text: other ? other.title : slug })]));
      });
      m.appendChild(ul);
    }
    if (p.hidden) m.appendChild(document.createComment(" " + String(p.hidden).replace(/--/g, "- -") + " "));
    footer(f.wrap, p);
  }

  // ---------- start ----------

  fetch(root + "data/intranet.json")
    .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
    .then(function (pages) {
      pages = pages.filter(function (p) { return !p.draft; });   // drafts do not exist yet
      if (kind === "page") renderPage(pages);
      else if (kind === "list") renderList(pages);
      else renderHome(pages);
    })
    .catch(function () {
      app.appendChild(el("p", { text: "This page needs a web server to load its contents. See README.md." }));
    });
})();
