# ☁ CloudNive — Cloud & DevOps Engineering Blog

> **Every article = a new level unlocked. 🎮**

Technical blog covering AWS/Azure Cloud, Terraform, Kubernetes, CI/CD, and modern software engineering. Built with Astro and powered by a custom backend API.

🌐 **Live:** [cloud.nivekaa.com](https://cloud.nivekaa.com)

[![Rebuild](https://github.com/nivekalara237/blog-nivekaa.com/actions/workflows/rebuild.yml/badge.svg)](https://github.com/nivekalara237/blog-nivekaa.com/actions/workflows/rebuild.yaml)
[![Deploy](https://github.com/nivekalara237/blog-nivekaa.com/actions/workflows/deploy.yml/badge.svg)](https://github.com/nivekalara237/blog-nivekaa.com/actions/workflows/deploy.yml)

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | [Astro](https://astro.build) |
| UI Components | React (islands) |
| Auth | [Kinde](https://kinde.com) |
| Backend API | Custom REST API (`cloudnive-api.nivekaa.com`) |
| Image Storage | AWS S3 |
| Language | TypeScript / JavaScript |
| Styling | CSS |

---

## Content Categories

- ☁ **Cloud** — AWS, Kubernetes, Serverless architectures
- ⚙ **DevOps** — Ansible, CI/CD, Linux, infrastructure automation
- 🔧 **Dev Backend** — Spring Boot, Java, security (JWT, RBAC, ABAC)
- 🖥 **Dev Frontend** — React, Node.js, npm

---

## Project Structure

```
/
├── public/                  # Static assets
├── src/
│   ├── components/          # Astro & React components
│   └── pages/               # File-based routing
│       ├── index.astro
│       ├── articles/
│       ├── categories/
│       ├── admin/           # Protected admin dashboard
│       ├── kinde-callback/  # Auth callback handler
│       └── kinde-logout/    # Logout handler
├── .env.example
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
# Backend API
PUBLIC_API_URL=https://cloudnive-api.nivekaa.com
PUBLIC_IMAGE_URL=https://your-s3-bucket.s3.amazonaws.com

# Kinde Auth
PUBLIC_KINDE_CLIENT_ID=***
PUBLIC_KINDE_DOMAIN=https://yourappname.kinde.com
```

> For local development, replace `PUBLIC_API_URL` with `http://localhost:3000`.

---

## Commands

All commands are run from the root of the project:

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Start local dev server at `localhost:4321` |
| `npm run build` | Build for production to `./dist/` |
| `npm run preview` | Preview production build locally |
| `npm run astro ...` | Run Astro CLI commands |
| `npm run astro -- --help` | Astro CLI help |

---

## 🔗 API Integration

See [`API_INTEGRATION.md`](./API_INTEGRATION.md) for details on how the frontend communicates with the backend API, including endpoints, authentication headers, and data models.

---

## 📡 Newsletter

Readers can subscribe to receive new articles, Terraform tips, and AWS guides directly by email. Managed via the blog's backend API.

---

## 👤 Author

**Kevin L.K.** — Cloud & DevOps Engineer

- 🌐 [cloud.nivekaa.com](https://cloud.nivekaa.com)
- 💼 [LinkedIn](https://linkedin.com)
- 🐙 [GitHub](https://github.com/nivekalara237)

---

## 📝 License

This project is personal and not open for contributions. Feel free to use the code as inspiration for your own Astro-based blog.