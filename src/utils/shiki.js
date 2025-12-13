import { createHighlighter } from 'shiki';

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
            'javascript', 'js', 'ts', 'typescript', 'css', 'html',
            'json', 'bash', 'markdown', 'jsx', 'tsx', 'astro',
            'java', 'scss', 'python', 'shell', 'c', 'cpp',
            'yaml', 'yml', 'xml', 'sql', 'graphql', 'dockerfile',
            'ini', 'mermaid', 'csharp', 'py', 'kotlin', 'kt', 'kts',
            'jinja', 'hcl', 'mermaid', 'asm', 'astro', 'json', 'json5', 'toml',
            'terraform'
        ],
    }).then(highlighter => {
        highlighterInstance = highlighter;
        return highlighter;
    });

    return highlighterPromise;
}
