# Troubleshooting

- **JSON fetch fails locally:** use `python -m http.server 8000`; do not open `index.html` directly with `file://`.
- **GitHub Pages 404:** deploy the repository root and choose GitHub Actions in Settings → Pages.
- **Subpath assets fail:** keep relative paths and `data-root` attributes unchanged.
- **Validation fails:** run `npm run validate` and fix the first reported ID, source, dossier, prompt-pack, ranking, or relationship error.
- **Link check flags a dynamic URL:** use relative static paths or explicitly update the checker only when the link is truly dynamic.
