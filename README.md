# RedmineSprintEditor

[![CI](https://github.com/yuik/RedmineSprintEditor/actions/workflows/ci.yml/badge.svg)](https://github.com/yuik/RedmineSprintEditor/actions/workflows/ci.yml)

A React/Next.js application for managing Redmine tickets specialised for agile sprints.

## Features

- 🔗 Connect to any Redmine instance using a URL + API key
- 📋 Browse **Product Backlog Items (PBI)** for a project
- 🔀 Visualise and reorder ticket **flow** with drag-and-drop
- ➕ Create new tickets inline at any position in the flow
- 🔢 **Renumber** button to keep ticket sequences consistent
- 🏷️ Hierarchical ticket numbering: `n-n-n-n` (numbers = ordered, letters = parallel)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), enter your Redmine URL, API key, and project ID to begin.

## Documentation

See [`docs/SPECIFICATION.md`](docs/SPECIFICATION.md) for full specification including:
- Component diagram
- Page flow diagram
- Ticket numbering system
- API reference

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm test` | Run unit tests |
| `npm run lint` | Run ESLint |

## Ticket Numbering

Tickets use the pattern `n-n-n-n` where digits mean ordered steps and letters mean parallel steps.

```
1       → first ordered step
2-a     → first parallel variant of step 2
2-b     → second parallel variant of step 2
3-1     → first sub-step of step 3
```

The **Renumber** button on the flow page reassigns all sequences so they are contiguous after drag-and-drop reordering.

## CI/CD

- **CI** runs on every push/PR: lint → test → build
- **Releases** are managed by [semantic-release](https://semantic-release.gitbook.io/) using [Conventional Commits](https://www.conventionalcommits.org/)

