import { marked } from "marked";
import DOMPurify from "dompurify";

let hljsPromise = null;
let hljsLoaded = false;

/**
 * Lazily load highlight.js and its CSS only when code blocks are present
 */
async function loadHljs() {
  if (hljsLoaded) return hljsPromise;
  hljsLoaded = true;
  hljsPromise = (async () => {
    const [{ default: hljs }] = await Promise.all([
      import("highlight.js"),
      import("highlight.js/styles/github-dark.css"),
    ]);
    // The CSS import is a side effect (Vite injects it)
    return hljs;
  })();
  return hljsPromise;
}

marked.setOptions({
  breaks: true,
  gfm: true,
  // Use a lightweight sync fallback for marked's built-in highlighter
  // The real hljs runs async in the post-pass below
  highlight: (code, lang) => {
    // If we already loaded hljs, use it; otherwise return plain code
    // (the async post-pass will handle highlighting)
    if (typeof window !== "undefined" && window.__hljs) {
      try {
        return window.__hljs.highlight(code, { language: lang }).value;
      } catch {
        return code;
      }
    }
    return code;
  },
});

/**
 * Parse markdown -> HTML -> highlight code blocks -> linkify #hashtags in text nodes -> sanitize
 */
export async function renderMarkdown(text) {
  if (!text) return "";

  // 1. marked parse (fast, sync)
  let html = marked.parse(text);

  // 2. Only load hljs if there are code blocks
  const hasCodeBlocks = /<pre><code/.test(html);
  if (hasCodeBlocks) {
    const hljs = await loadHljs();

    // Cache on window for the sync highlighter above (future calls)
    if (typeof window !== "undefined") {
      window.__hljs = hljs;
    }

    // 3. Build a temporary DOM to run hljs on any <pre><code>
    const doc = new DOMParser().parseFromString(html, "text/html");

    doc.querySelectorAll("pre code").forEach((block) => {
      if (!block.className && block.parentElement) {
        const lang = block.parentElement.getAttribute("data-language");
        if (lang && hljs.getLanguage(lang)) {
          block.classList.add(`language-${lang}`);
        }
      }
      hljs.highlightElement(block);
    });

    html = doc.body.innerHTML;
  } else {
    // No code blocks: just parse through DOMParser for hashtag linkifying
    const doc = new DOMParser().parseFromString(html, "text/html");
    html = doc.body.innerHTML;
  }

  // 4. Linkify #hashtags in text nodes only (skip inside <a>, <code>, <pre>, <script>, <style>)
  const doc = new DOMParser().parseFromString(html, "text/html");

  const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName.toLowerCase();
      if (["a", "code", "pre", "script", "style"].includes(tag)) {
        return NodeFilter.FILTER_REJECT;
      }
      return node.textContent.includes("#") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });

  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  textNodes.forEach((node) => {
    const span = document.createElement("span");
    span.innerHTML = node.textContent.replace(
      /#([\p{L}\p{N}_]+)/gu,
      (match, tag) =>
        `<a href="/posts/search?tag=${encodeURIComponent(tag)}" class="hashtag">#${tag}</a>`
    );
    node.parentNode.replaceChild(span, node);
  });

  html = doc.body.innerHTML;

  // 5. Final sanitize
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ["pre", "code", "span"],
    ADD_ATTR: ["class", "data-language"],
  });
}

// Keep synchronous version for backwards compat (FeedPost uses it)
// Falls back to non-highlighted code blocks if hljs not loaded yet
export function renderMarkdownSync(text) {
  if (!text) return "";
  let html = marked.parse(text);
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ["pre", "code", "span"],
    ADD_ATTR: ["class", "data-language"],
  });
}

export function extractHashtags(text) {
  if (!text) return [];
  const matches = text.match(/#[\p{L}\p{N}_]+/gu);
  return matches ? [...new Set(matches.map((t) => t.slice(1).toLowerCase()))] : [];
}

export function linkifyHashtags(html, baseUrl = "/") {
  return html.replace(/#([\p{L}\p{N}_]+)/gu, (match, tag) =>
    `<a href="${baseUrl}/posts/search?tag=${encodeURIComponent(tag)}" class="hashtag">#${tag}</a>`
  );
}