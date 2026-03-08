import { getCategories } from '../../../utils/api';
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

// Basic text wrapping for SVG
function wrapText(text: string, maxChars: number) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';

    words.forEach((word: string) => {
        if ((currentLine + word).length > maxChars) {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
        } else {
            currentLine += word + ' ';
        }
    });
    lines.push(currentLine.trim());
    return lines.slice(0, 2); // Max 2 lines
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

    const lines = wrapText(article.title || 'CLOUDNIVE_DATABASE', 45); // Adjust max chars based on width
    const line1 = lines[0] || '';
    const line2 = lines[1] || '';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" width="800" height="400">
  <defs>
      <!-- Media query for light mode -->
      <style>
          .bg-deep { fill: #0A0F0A; }
          .bg-stroke { stroke: #237227; }
          .bg-stroke-light { stroke: #519A66; }
          .text-main { fill: #E8F5E8; }
          .text-dim { fill: #519A66; }
          
          @media (prefers-color-scheme: light) {
              .bg-deep { fill: #F4FBF4; }
              .bg-stroke { stroke: #519A66; }
              .bg-stroke-light { stroke: #237227; }
              .text-main { fill: #0A0F0A; }
              .text-dim { fill: #237227; }
          }
      </style>
  </defs>

  <!-- Background -->
  <rect width="800" height="400" class="bg-deep" />
  
  <!-- Subtle scanline / tech grid -->
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
    <path d="M 40 0 L 0 0 0 40" fill="none" class="bg-stroke" stroke-width="1" stroke-opacity="0.2" />
    <circle cx="40" cy="40" r="1.5" class="bg-stroke-light" fill-opacity="0.4" />
  </pattern>
  <rect width="800" height="400" fill="url(#grid)" />

  <!-- Outer frame -->
  <rect x="20" y="20" width="760" height="360" fill="none" class="bg-stroke" stroke-width="2" stroke-opacity="0.5" />
  <rect x="26" y="26" width="748" height="348" fill="none" class="bg-stroke-light" stroke-width="1" stroke-opacity="0.3" />

  <!-- Decorative technical marks -->
  <path d="M 20 60 L 30 60 M 20 340 L 30 340 M 780 60 L 770 60 M 780 340 L 770 340" stroke="#FFAA00" stroke-width="2" />
  <path d="M 60 20 L 60 30 M 340 20 L 340 30 M 60 380 L 60 370 M 340 380 L 340 370" stroke="#FFAA00" stroke-width="2" />

  <!-- Giant Background Icon -->
  <g opacity="0.05" transform="matrix(15 0 0 15 480 30)">
    <path fill="none" class="bg-stroke-light" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="${catData.icon}" />
  </g>

  <!-- Tag / Breadcrumb -->
  <rect x="60" y="110" width="80" height="24" fill="#237227" fill-opacity="0.2" stroke="#237227" stroke-width="1" />
  <text x="70" y="126" font-family="monospace" font-size="12" font-weight="bold" fill="#519A66" letter-spacing="1.5">SYS.LOG</text>

  <!-- Main Category Title -->
  <text x="60" y="195" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="56" class="text-main" letter-spacing="-1">
    <tspan fill="#FFAA00">//</tspan> ${catData.name.toUpperCase()}
  </text>
  
  <!-- Subtitle / Meta (Truncated Title) -->
  <text x="60" y="240" font-family="monospace" font-size="16" class="text-dim" letter-spacing="1">
    ${line1}
  </text>
  <text x="60" y="265" font-family="monospace" font-size="16" class="text-dim" letter-spacing="1">
    ${line2}
  </text>
  
  <!-- "Status" indicator -->
  <circle cx="66" cy="336" r="4" fill="#FFAA00" />
  <text x="80" y="340" font-family="monospace" font-size="12" fill="#888888">STATUS: <tspan fill="#FFAA00">ONLINE</tspan></text>
</svg>`;

    return new Response(svg, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=86400'
        }
    });
}
