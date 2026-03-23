/**
 * A robust HTML sanitizer that uses the browser's DOMParser to clean HTML.
 * While DOMPurify is preferred, this implementation provides a more comprehensive
 * approach than simple regex or element removal by using a whitelist of safe elements and attributes.
 */

const ALLOWED_TAGS = new Set([
  'address', 'article', 'aside', 'footer', 'header', 'h1', 'h2', 'h3', 'h4',
  'h5', 'h6', 'hgroup', 'main', 'nav', 'section', 'blockquote', 'dd', 'div',
  'dl', 'dt', 'figcaption', 'figure', 'hr', 'li', 'main', 'ol', 'p', 'pre',
  'ul', 'a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'data', 'dfn',
  'em', 'i', 'kbd', 'mark', 'q', 'rb', 'rp', 'rt', 'rtc', 'ruby', 's', 'samp',
  'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr', 'caption',
  'col', 'colgroup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr'
]);

const ALLOWED_ATTR = new Set([
  'href', 'title', 'src', 'alt', 'class', 'id', 'target', 'rel'
]);

export function sanitizeHtml(html) {
  if (!html) return '';

  if (typeof window === 'undefined') {
    return ''; // Return empty or simple text-only version for SSR
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const sanitizeElement = (el) => {
    // Remove if not an allowed tag
    if (!ALLOWED_TAGS.has(el.tagName.toLowerCase())) {
      const fragment = document.createDocumentFragment();
      while (el.firstChild) {
        fragment.appendChild(el.firstChild);
      }
      el.parentNode.replaceChild(fragment, el);
      return;
    }

    // Sanitize attributes
    const attrs = el.attributes;
    for (let i = attrs.length - 1; i >= 0; i--) {
      const attr = attrs[i];
      const name = attr.name.toLowerCase();

      if (!ALLOWED_ATTR.has(name) || name.startsWith('on')) {
        el.removeAttribute(name);
        continue;
      }

      // Special handling for href and src to prevent javascript:
      if ((name === 'href' || name === 'src')) {
        const value = attr.value.toLowerCase().replace(/\s/g, '');
        if (value.startsWith('javascript:') || value.startsWith('data:') || value.startsWith('vbscript:')) {
          el.removeAttribute(name);
        }
      }
    }

    // Recursively sanitize children
    const children = Array.from(el.children);
    children.forEach(child => sanitizeElement(child));
  };

  Array.from(doc.body.children).forEach(child => sanitizeElement(child));

  return doc.body.innerHTML;
}
