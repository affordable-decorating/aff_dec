/*
  Affordable Decorating: shared text markup.

  Page bodies are plain text with a few simple marks. The text is turned into
  DOM nodes (never HTML strings), so nothing typed into a body can inject markup.

    Blank line          starts a new paragraph
    ## Heading          a heading (### for a smaller one)
    - item              a bulleted list (consecutive lines)
    1. item             a numbered list (consecutive lines)
    | a | b |           a table (consecutive lines). If the second line is
    |---|---|           made of dashes, the first line is the header row.
    **bold**  *italic*  emphasis
    [text](address)     a link

  Link addresses may be http(s), mailto, #anchor, a relative path, or one of
  these shortcuts, resolved against the site root:
    page:slug        a site page            item:AD-0001      a catalog item
    dept:slug        a department           collection:slug   a collection
    intranet:slug    an intranet page       intranet:home     the intranet front
*/
(function (global) {
  "use strict";

  function el(tag, text) {
    var n = document.createElement(tag);
    if (text != null) n.textContent = text;
    return n;
  }

  function resolve(url, root) {
    url = String(url || "").trim();
    var m = /^(page|item|dept|collection|intranet):(.*)$/.exec(url);
    if (m) {
      var v = encodeURIComponent(m[2].trim());
      if (m[1] === "page") return root + "page/?id=" + v;
      if (m[1] === "item") return root + "item/?id=" + v;
      if (m[1] === "dept") return root + "department/?id=" + v;
      if (m[1] === "collection") return root + "collection/?id=" + v;
      if (m[2].trim() === "home") return root + "intranet/";
      return root + "intranet/page/?id=" + v;
    }
    if (/^(https?:|mailto:|#)/i.test(url)) return url;
    if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return null; // javascript:, data:, etc.
    return url;
  }

  var INLINE = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)/g;

  function inline(text, parent, root) {
    var last = 0, m;
    INLINE.lastIndex = 0;
    while ((m = INLINE.exec(text))) {
      if (m.index > last) parent.appendChild(document.createTextNode(text.slice(last, m.index)));
      if (m[1] != null) parent.appendChild(el("strong", m[1]));
      else if (m[2] != null) parent.appendChild(el("em", m[2]));
      else {
        var href = resolve(m[4], root);
        if (href == null) parent.appendChild(document.createTextNode(m[3]));
        else { var a = el("a", m[3]); a.setAttribute("href", href); parent.appendChild(a); }
      }
      last = INLINE.lastIndex;
    }
    if (last < text.length) parent.appendChild(document.createTextNode(text.slice(last)));
  }

  function splitRow(line) {
    var s = line.trim().replace(/^\|/, "").replace(/\|$/, "");
    return s.split("|").map(function (c) { return c.trim(); });
  }

  function render(text, options) {
    options = options || {};
    var root = options.root || "./";
    var frag = document.createDocumentFragment();
    var blocks = String(text || "").replace(/\r\n?/g, "\n").split(/\n\s*\n/);
    var headingCount = 0;

    blocks.forEach(function (block) {
      block = block.replace(/^\n+|\s+$/g, "");
      if (!block.trim()) return;
      var lines = block.split("\n");

      // A block may begin with a heading line followed by more content.
      while (lines.length && /^#{2,3} /.test(lines[0])) {
        var level = lines[0].indexOf("### ") === 0 ? "h3" : "h2";
        var h = el(level);
        var label = lines[0].replace(/^#{2,3} /, "");
        if (level === "h2" && options.numberHeadings) { headingCount += 1; label = headingCount + ". " + label; }
        inline(label, h, root);
        frag.appendChild(h);
        lines.shift();
      }
      if (!lines.length) return;

      if (lines.every(function (l) { return /^- /.test(l); })) {
        var ul = el("ul");
        lines.forEach(function (l) { var li = el("li"); inline(l.slice(2), li, root); ul.appendChild(li); });
        frag.appendChild(ul);
      } else if (lines.every(function (l) { return /^\d+\. /.test(l); })) {
        var ol = el("ol");
        lines.forEach(function (l) { var li = el("li"); inline(l.replace(/^\d+\. /, ""), li, root); ol.appendChild(li); });
        frag.appendChild(ol);
      } else if (lines.every(function (l) { return /^\|/.test(l.trim()); })) {
        var table = el("table");
        table.className = "grid";
        var rows = lines.slice();
        var header = null;
        if (rows.length > 1 && /^\|?[\s:|-]+\|?$/.test(rows[1]) && /-/.test(rows[1])) {
          header = splitRow(rows[0]);
          rows.splice(0, 2);
        }
        if (header) {
          var tr = el("tr");
          header.forEach(function (c) { var th = el("th"); inline(c, th, root); tr.appendChild(th); });
          var thead = el("thead"); thead.appendChild(tr); table.appendChild(thead);
        }
        var tbody = el("tbody");
        rows.forEach(function (r) {
          var tr2 = el("tr");
          splitRow(r).forEach(function (c) { var td = el("td"); inline(c, td, root); tr2.appendChild(td); });
          tbody.appendChild(tr2);
        });
        table.appendChild(tbody);
        frag.appendChild(table);
      } else {
        var p = el("p");
        lines.forEach(function (l, i) {
          if (i) p.appendChild(document.createElement("br"));
          inline(l, p, root);
        });
        frag.appendChild(p);
      }
    });
    return frag;
  }

  global.ADMarkup = { render: render, resolve: resolve };
})(window);
