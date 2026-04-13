// shiki/bundle/web is the browser-safe build — it resolves WASM internally
// without dynamic imports that Vite can't handle in the browser.
import { createHighlighter } from 'shiki/bundle-full.mjs';

let highlighterInstance = null;
let highlighterPromise = null;

export async function getHighlighter() {
    if (highlighterInstance) {
        return highlighterInstance;
    }

    if (highlighterPromise) {
        return highlighterPromise;
    }

    highlighterPromise = createHighlighter({
        themes: ['github-light', 'github-dark'],
        langs: [
            'javascript', 'typescript', 'css', 'html',
            'json', 'json5', 'bash', 'shell', 'markdown',
            'jsx', 'tsx', 'astro', 'scss',
            'java', 'python', 'c', 'cpp',
            'yaml', 'xml', 'sql', 'graphql', //'docker', 'ini', 'toml
            'properties'
            // 'mermaid',
            //'hcl', 'kotlin',
            // 'asm',
        ],
    }).then(highlighter => {
        highlighterInstance = highlighter;
        return highlighter;
    });

    return highlighterPromise;
}
