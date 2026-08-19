import { api } from '../../../lib/api';

const ICONS = {
    cloud: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z',
    cog: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    box: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    code: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    lock: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    desktop: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    terminal: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
};

function getCategoryData(cat: string | null | undefined) {
    if (!cat) return { id: 'default', name: 'Article', icon: ICONS.document };
    const clean = cat.toLowerCase().replace(/[^a-z0-9/]/g, '');
    if (clean.includes('cloud') || clean.includes('aws')) return { id: 'cloud', name: 'Cloud', icon: ICONS.cloud };
    if (clean.includes('terraform') || clean.includes('iac')) return { id: 'terraform', name: 'Terraform', icon: ICONS.cog };
    if (clean.includes('docker')) return { id: 'docker', name: 'Docker', icon: ICONS.box };
    if (clean.includes('kubernetes') || clean.includes('k8s')) return { id: 'kubernetes', name: 'Kubernetes', icon: ICONS.box };
    if (clean.includes('cicd') || clean.includes('devops')) return { id: 'cicd', name: 'CI/CD', icon: ICONS.refresh };
    if (clean.includes('backend') || clean.includes('java')) return { id: 'backend', name: 'Dev Backend', icon: ICONS.code };
    if (clean.includes('securite') || clean.includes('security')) return { id: 'securite', name: 'Sécurité', icon: ICONS.lock };
    if (clean.includes('frontend') || clean.includes('react')) return { id: 'frontend', name: 'Dev Frontend', icon: ICONS.desktop };
    if (clean.includes('linux')) return { id: 'linux', name: 'Linux', icon: ICONS.terminal };
    return { id: 'default', name: cat, icon: ICONS.document };
}

export async function getStaticPaths() {
    const response = await api.getArticles({ limit: 1000 });
    const articles = response.items || [];

    return articles.map((article: any) => {
        return {
            params: { slug: article.slug },
            props: { article }
        };
    });
}

export async function GET({ props }: any) {
    const { article } = props;
    const catData = getCategoryData(article.category);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" width="800" height="400">
  <defs>
      <style>
          .bg { fill: #EEF0F8; }
          .icon { stroke: #7C93D8; }
          .label { fill: #6D7390; }

          @media (prefers-color-scheme: dark) {
              .bg { fill: #2E303F; }
              .icon { stroke: #A8BCEF; }
              .label { fill: #A6ABC7; }
          }
      </style>
  </defs>

  <!-- Background -->
  <rect width="800" height="400" class="bg" />

  <!-- Centered category icon -->
  <g transform="translate(364,120) scale(3)">
    <path fill="none" class="icon" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" d="${catData.icon}" />
  </g>

  <!-- Category label -->
  <text x="400" y="280" text-anchor="middle" font-family="Inter, sans-serif" font-weight="600" font-size="20" letter-spacing="0.02em" class="label">${catData.name}</text>
</svg>`;

    return new Response(svg, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=86400'
        }
    });
}
