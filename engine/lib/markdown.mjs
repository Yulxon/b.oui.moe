const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

function inline(source) {
  let text = escapeHtml(source);
  const stash = [];
  const keep = (html) => `\u0000${stash.push(html) - 1}\u0000`;

  text = text.replace(/`([^`]+)`/g, (_, code) => keep(`<code>${code}</code>`));
  text = text.replace(/!\[([^\]]*)\]\(([^\s)]+)(?:\s+"([^"]*)")?\)/g, (_, alt, url, title) => {
    const safeUrl = escapeHtml(url);
    const t = title ? ` title="${escapeHtml(title)}"` : "";
    return keep(`<img src="${safeUrl}" alt="${alt}" loading="lazy"${t}>`);
  });
  text = text.replace(/\[([^\]]+)\]\(([^\s)]+)(?:\s+"([^"]*)")?\)/g, (_, label, url, title) => {
    const t = title ? ` title="${escapeHtml(title)}"` : "";
    const external = /^https?:\/\//.test(url) ? ' rel="noreferrer"' : "";
    return keep(`<a href="${escapeHtml(url)}"${t}${external}>${label}</a>`);
  });
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  text = text.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>");
  text = text.replace(/~~([^~]+)~~/g, "<del>$1</del>");

  text = text.replace(/\u0000(\d+)\u0000/g, (_, index) => stash[Number(index)]);
  return text;
}

export function markdownToHtml(markdown = "", headings = []) {
  const lines = String(markdown).replaceAll("\r\n", "\n").split("\n");
  const out = [];
  const ids = new Set(["top", "site-menu"]);
  let paragraph = [];
  let list = null;
  let code = null;
  let codeLang = "";

  const flushParagraph = () => {
    if (!paragraph.length) return;
    out.push(`<p>${inline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const closeList = () => {
    if (!list) return;
    out.push(`</${list}>`);
    list = null;
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/g, "");

    if (code !== null) {
      if (/^```/.test(line)) {
        const className = codeLang ? ` class="language-${escapeHtml(codeLang)}"` : "";
        out.push(`<pre><code${className}>${escapeHtml(code.join("\n"))}</code></pre>`);
        code = null;
        codeLang = "";
      } else {
        code.push(raw);
      }
      continue;
    }

    const fence = line.match(/^```\s*([\w-]+)?\s*$/);
    if (fence) {
      flushParagraph();
      closeList();
      code = [];
      codeLang = fence[1] || "";
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      closeList();
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length;
      const title = heading[2];
      const stem = title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || 'section';
      let id = stem;
      let suffix = 2;
      while (ids.has(id)) id = `${stem}-${suffix++}`;
      ids.add(id);
      headings.push({ id, level, title: stripMarkdown(title) });
      out.push(`<h${level} id="${escapeHtml(id)}">${inline(title)}</h${level}>`);
      continue;
    }

    if (/^(---|\*\*\*|___)$/.test(line.trim())) {
      flushParagraph();
      closeList();
      out.push("<hr>");
      continue;
    }

    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      flushParagraph();
      closeList();
      out.push(`<blockquote><p>${inline(quote[1])}</p></blockquote>`);
      continue;
    }

    const ul = line.match(/^[-*+]\s+(.+)$/);
    const ol = line.match(/^\d+[.)]\s+(.+)$/);
    if (ul || ol) {
      flushParagraph();
      const next = ul ? "ul" : "ol";
      if (list && list !== next) closeList();
      if (!list) {
        list = next;
        out.push(`<${list}>`);
      }
      out.push(`<li>${inline((ul || ol)[1])}</li>`);
      continue;
    }

    paragraph.push(line.trim());
  }

  if (code !== null) {
    const className = codeLang ? ` class="language-${escapeHtml(codeLang)}"` : "";
    out.push(`<pre><code${className}>${escapeHtml(code.join("\n"))}</code></pre>`);
  }
  flushParagraph();
  closeList();
  return out.join("\n");
}

export function stripMarkdown(markdown = "") {
  return String(markdown)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~`-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
