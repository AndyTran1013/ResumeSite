# Publish to GitHub Pages

The deployment workflow builds this React/Vite site and publishes only `dist`.
It runs when you push to the GitHub repository's default branch (main or master)
and can also be started manually from the Actions tab on that branch.

## One-time setup

1. Create a GitHub repository and push this project, including
   `.github/workflows/deploy.yml` and `package-lock.json`. GitHub Free requires
   a public repository for Pages, so the committed source files will be public too.
2. In the repository, open **Settings > Pages**. Under **Build and deployment**,
   set **Source** to **GitHub Actions**.
3. Open **Actions > Deploy to GitHub Pages > Run workflow** and select the
   default branch. You can also trigger deployment by pushing another commit.
4. Once the workflow succeeds, open the URL shown by its deployment or in
   **Settings > Pages**. Usually this is `https://USERNAME.github.io/REPOSITORY/`.

The workflow reads the site's base path from GitHub Pages and passes it to Vite
at build time. No repository name needs to be hardcoded, and local `npm run dev`
continues to work as before. Root-level Pages sites and configured custom domains
also use the correct base path.

## Updates and local previews

Commit and push changes to the default branch to publish an update. Deployment
uses committed files on GitHub; unsaved or uncommitted local edits are not included.

To check a production build under a repository subpath locally:

```sh
npm run build -- --base /ResumeSite/
npm run preview -- --base /ResumeSite/
```

Open `http://localhost:4173/ResumeSite/` (or the port printed by Vite).
Replace `ResumeSite` with your repository name if different.

When adding images or downloads in React, import files from `src`, or use
`import.meta.env.BASE_URL + 'filename.ext'` for files in `public`. This keeps
links working when the site is hosted under a repository path.

## References

- [Vite deployment guide](https://vite.dev/guide/static-deploy.html#github-pages)
- [GitHub Pages publishing settings](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
