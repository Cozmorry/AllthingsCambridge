/**
 * Simple HTML sanitizer using DOMParser.
 * Since we cannot install DOMPurify, we use this whitelist-based approach.
 */
export const sanitizeHtml = (html) => {
    if (!html) return '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.body;

    const allowedTags = [
        'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
        'P', 'BR', 'DIV', 'SPAN',
        'UL', 'OL', 'LI',
        'STRONG', 'EM', 'U', 'S', 'B', 'I',
        'BLOCKQUOTE', 'CODE', 'PRE',
        'A', 'IMG'
    ];

    const allowedAttributes = ['href', 'src', 'alt', 'title', 'class'];

    const sanitizeNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.cloneNode(true);
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            if (!allowedTags.includes(node.tagName)) {
                // If tag is not allowed, we might still want to keep its text content
                const fragment = document.createDocumentFragment();
                Array.from(node.childNodes).forEach(child => {
                    fragment.appendChild(sanitizeNode(child));
                });
                return fragment;
            }

            const newNode = document.createElement(node.tagName);

            // Copy allowed attributes
            Array.from(node.attributes).forEach(attr => {
                if (allowedAttributes.includes(attr.name)) {
                    let value = attr.value;

                    // Sanitize href and src for javascript: protocols
                    if (attr.name === 'href' || attr.name === 'src') {
                        if (value.toLowerCase().replace(/\s/g, '').startsWith('javascript:')) {
                            value = '#';
                        }
                    }

                    newNode.setAttribute(attr.name, value);
                }
            });

            // Recursively sanitize children
            Array.from(node.childNodes).forEach(child => {
                newNode.appendChild(sanitizeNode(child));
            });

            return newNode;
        }

        return document.createDocumentFragment();
    };

    const fragment = document.createDocumentFragment();
    Array.from(body.childNodes).forEach(child => {
        fragment.appendChild(sanitizeNode(child));
    });

    const tempDiv = document.createElement('div');
    tempDiv.appendChild(fragment);
    return tempDiv.innerHTML;
};
