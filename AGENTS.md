# Agent Instructions

## GitHub workflow for `ofunk/www-f8`

- Treat local commits and GitHub state as separate facts.
- Before publishing changes, check:
  - `git status --short --branch`
  - `git remote -v`
  - `gh auth status`
- Do not retry `git push` blindly after an HTTPS credential failure.
- If local `git push` cannot authenticate, use the GitHub connector for
  `ofunk/www-f8` instead of circling on local credentials.
- For structural repository changes through the connector, use Git objects:
  create blobs, create a tree, create a commit, then update `main`.
- After any publish step, verify the remote state, not only the local tree:
  - `git fetch origin`
  - `git ls-tree -r --name-only origin/main`
  - fetch critical files through the GitHub connector when useful.
- Do not tell the user GitHub is fixed until `origin/main` shows the intended
  files and removed paths are actually gone.

## GitHub Pages shape

- This repository publishes a single static site from the repository root.
- Expected Pages settings:
  - Source: `Deploy from a branch`
  - Branch: `main`
  - Folder: `/(root)`
  - Custom domain: `funktion8.de`
- Keep `CNAME` in the repository root with exactly `funktion8.de`.
