# Deploy

Static prototype — no build step. See [README.md](README.md) for the project map.

## Drag & drop (fastest)
1. https://app.netlify.com/drop
2. Drag the project folder
3. Open the `random-name.netlify.app` URL → smoke-test the flow:
   - Landing loads
   - Onboarding → my-twyns → talk-sara
   - Logo click goes home from every page
   - `/asdf` shows the 404 page

## Git-based (recommended ongoing)
```bash
git init && git add . && git commit -m "Initial prototype"
git remote add origin git@github.com:<you>/twynity-prototype.git
git push -u origin main
```
Netlify: **Add new site → Import** → pick the repo. Build command empty, publish dir `.`. `netlify.toml` handles the rest.
