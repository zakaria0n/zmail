/**
 * Defensive HTML sanitization for rendering untrusted mail.tm message bodies.
 *
 * This intentionally re-implements a small allow-list sanitizer instead of
 * pulling in a heavy dependency. It strips scripts, event handlers and
 * dangerous markup while preserving the inline styles and structure that
 * make transactional emails readable.
 *
 * For defence-in-depth the rendered HTML is always mounted inside a sandboxed
 * `<iframe>` (see `MessageHtmlFrame`), so this is the second line of defence.
 */

const ALLOWED_TAGS = new Set([
  "a", "abbr", "address", "article", "aside", "b", "blockquote", "body",
  "br", "caption", "cite", "code", "col", "colgroup", "dd", "del", "details",
  "div", "dl", "dt", "em", "figcaption", "figure", "footer", "h1", "h2",
  "h3", "h4", "h5", "h6", "head", "header", "hr", "html", "i", "img",
  "ins", "kbd", "li", "main", "mark", "nav", "ol", "p", "pre", "q",
  "section", "small", "span", "strong", "sub", "summary", "sup", "table",
  "tbody", "td", "tfoot", "th", "thead", "time", "title", "tr", "u", "ul",
]);

const ALLOWED_ATTRS = new Set([
  "href", "src", "alt", "title", "width", "height", "colspan", "rowspan",
  "target", "rel", "align", "valign", "bgcolor", "color", "style", "class",
  "id", "datetime", "cite",
]);

const URL_ATTRS = new Set(["href", "src"]);

function sanitizeUrl(value: string): string | null {
  const trimmed = value.trim();
  if (/^(https?:|mailto:|tel:|data:image\/|\/|#)/i.test(trimmed)) {
    return trimmed;
  }
  return null;
}

interface ParsedTag {
  type: "open" | "close" | "self";
  name: string;
  attrs: Record<string, string>;
  raw: string;
}

function parseTag(chunk: string): ParsedTag | null {
  const match = chunk.match(/^<\/?([a-zA-Z0-9]+)/);
  if (!match) return null;
  const name = match[1]!.toLowerCase();
  const isClose = chunk.startsWith("</");
  const isSelf = chunk.endsWith("/>");

  const attrs: Record<string, string> = {};
  const attrRegex = /([a-zA-Z_:][a-zA-Z0-9_:.\-]*)\s*(?:=\s*("([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let attrMatch: RegExpExecArray | null;
  while ((attrMatch = attrRegex.exec(chunk)) !== null) {
    const attrName = attrMatch[1]!.toLowerCase();
    const value = attrMatch[3] ?? attrMatch[4] ?? attrMatch[5] ?? "";
    attrs[attrName] = value;
  }

  return {
    type: isClose ? "close" : isSelf ? "self" : "open",
    name,
    attrs,
    raw: chunk,
  };
}

function serializeTag(tag: ParsedTag): string {
  const safeAttrs = Object.entries(tag.attrs)
    .filter(([name, value]) => ALLOWED_ATTRS.has(name) && value.length > 0)
    .map(([name, value]) => {
      if (URL_ATTRS.has(name)) {
        const safe = sanitizeUrl(value);
        if (safe === null) return "";
        if (name === "href") {
          return ` ${name}="${escapeAttr(safe)}" rel="noopener noreferrer nofollow" target="_blank"`;
        }
        return ` ${name}="${escapeAttr(safe)}"`;
      }
      return ` ${name}="${escapeAttr(value)}"`;
    })
    .filter(Boolean)
    .join("");

  if (tag.type === "close") return `</${tag.name}>`;
  if (tag.type === "self") return `<${tag.name}${safeAttrs} />`;
  return `<${tag.name}${safeAttrs}>`;
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Returns a sanitized HTML string safe to render inside a sandboxed iframe. */
export function sanitizeHtml(input: string): string {
  if (!input) return "";
  const tokenRegex = /<\/?[a-zA-Z0-9][^>]*?>/g;
  let result = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(input)) !== null) {
    const start = match.index;
    if (start > lastIndex) {
      result += escapeText(input.slice(lastIndex, start));
    }
    const parsed = parseTag(match[0]);
    if (parsed && ALLOWED_TAGS.has(parsed.name)) {
      result += serializeTag(parsed);
    }
    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < input.length) {
    result += escapeText(input.slice(lastIndex));
  }

  return result;
}

/** Wraps arbitrary HTML in a minimal, dark-themed document shell. */
export function wrapHtmlForFrame(bodyHtml: string): string {
  const safe = sanitizeHtml(bodyHtml);
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <base target="_blank" />
    <style>
      :root { color-scheme: light dark; }
      html, body {
        margin: 0;
        padding: 20px 4px 4px 4px;
        background: #ffffff;
        color: #0F1115;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 15px;
        line-height: 1.6;
        word-wrap: break-word;
      }
      img { max-width: 100% !important; height: auto !important; }
      table { max-width: 100% !important; }
      a { color: #22C55E; }
      pre { white-space: pre-wrap; word-wrap: break-word; }
    </style>
  </head>
  <body>${safe}</body>
</html>`;
}
