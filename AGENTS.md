# Agent Instructions

## GitHub workflow for `notariat8/www-n8`

- Treat local commits and GitHub state as separate facts.
- Before publishing changes, check:
  - `git status --short --branch`
  - `git remote -v`
  - `gh auth status`
- Do not retry `git push` blindly after an HTTPS credential failure.
- Do not try random SSH keys, alternate remotes, or repeated HTTPS pushes.
- Known working local publish route: use the repository deploy key
  `/home/ubuntu/.ssh/id_ed25519_www_n8_deploy_20260520` against
  `git@github.com:notariat8/www-n8.git`. The public key in GitHub must match
  local fingerprint
  `SHA256:mY5GxmGGHGV/BvlybApP4ou5Tm45q/CEiBJARlRHa7Y` and have `Read/write`
  access. A deploy key with a different fingerprint is not usable from this
  workspace even if it is named similarly.
- Push command:
  `git -c core.sshCommand='ssh -i /home/ubuntu/.ssh/id_ed25519_www_n8_deploy_20260520 -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new' push git@github.com:notariat8/www-n8.git main:main`
- If local `git push` cannot authenticate, use the GitHub connector for
  `notariat8/www-n8` instead of circling on local credentials.
- Before using connector write operations, confirm repository permissions via
  the connector. If `notariat8/www-n8` reports `push: false`, stop immediately
  and tell the user that the GitHub App/Connector needs write access for this
  repository. Do not attempt another local push workaround.
- For structural repository changes through the connector, use Git objects:
  create blobs, create a tree, create a commit, then update `main`.
- Connector publish recipe when `push: true`:
  1. Use current `origin/main` as parent and `origin/main^{tree}` as base tree.
  2. Create blobs for each changed file that must be published.
  3. Create a tree with those blob SHAs and the correct paths/modes.
  4. Create a commit with parent `origin/main`.
  5. Update `refs/heads/main` to that commit with `force: false`.
- After any publish step, verify the remote state, not only the local tree:
  - `git fetch origin`
  - `git ls-tree -r --name-only origin/main`
  - fetch critical files through the GitHub connector when useful.
- Do not tell the user GitHub is fixed until `origin/main` shows the intended
  files and removed paths are actually gone.
- After creating or updating a pull request, always tell the user what they
  need to do next for the work to move forward, such as review, approve, merge,
  wait for checks, or provide more input.
- After every completed job, check whether cleanup is possible and sensible.
  Report what can be cleaned up, perform safe cleanup when approved or already
  authorized, and tell the user when no further cleanup is needed.

## GitHub Pages shape

- This repository publishes a single static site from the repository root.
- Expected Pages settings:
  - Source: `Deploy from a branch`
  - Branch: `main`
  - Folder: `/(root)`
  - Custom domain: `notariat8.de`
- Keep `CNAME` in the repository root with exactly `notariat8.de`.

## Public website style guide

- Before changes to öffentlich sichtbaren Texten / publicly visible website
  text, read `docs/agent-style-guide.md` and apply `styleguide.json`.
- Public copy must stay strict-conservative, externally suitable, legally
  and notarially understandable, and factually checkable for Notariate,
  Rechtsanwälte, Notarkammern, Partner, and Behörden.
- Do not introduce blocked public terms from `styleguide.json`. Terms marked
  as explanation-only must be explained in their first visible context.

## German language style

- German-language user-facing text and repository documentation must use real
  German characters: `ä`, `ö`, `ü`, `Ä`, `Ö`, `Ü`, and `ß`.
- Do not use ASCII transliterations such as `ae`, `oe`, `ue`, or `ss` where
  German spelling requires the proper character.
- Keep code identifiers, URLs, file names, branch names, commands, and external
  product names unchanged.
