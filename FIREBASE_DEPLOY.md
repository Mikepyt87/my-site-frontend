# Portfolio v5.7 — Firebase Hosting

## Verified destination

Verified on 2026-09-09 against authenticated accounts:
- GitHub: Mikepyt87; repository Mikepyt87/my-site-frontend; default branch main.
- Firebase: mikepyt87@gmail.com; project michael-pytlowany (256855728561).
- Hosting site: michael-pytlowany, explicitly set in firebase.json.
- Custom domain: michaelpytlowany.com. Hosting API reports HOST_ACTIVE,
  OWNERSHIP_ACTIVE, CERT_ACTIVE and association with this site.

Only portfolio-public is uploaded. No build is needed. The older src/, public/,
package files and unrelated work are preserved. The editable source package is
separate; regenerate its public output before copying future edits here.
Do not copy private archives, review/audit files, owner pages, editing tools,
credentials or local configuration into portfolio-public.

## Review before live publication

The static .html links and custom 404 are retained. The old React catch-all
rewrite was removed. Security headers from the prepared package are retained.
All 188 public files initially match the supplied version 5.7 package.

From the repository root, using Node.js 22 or later:

    npx --yes firebase-tools@15.30.0 login
    npx --yes firebase-tools@15.30.0 hosting:channel:deploy portfolio-review --expires 7d --project michael-pytlowany --non-interactive --no-authorized-domains

Check home, grouped projects, Tool Crib search/details, Professional view,
career history, direct .html project URLs, mobile menu, images and video.
Preview publication does not change live content or Authentication domains.

## GitHub deployments

.github/workflows/portfolio-preview.yml publishes a seven-day preview for
same-repository pull requests. Fork PRs do not receive deployment credentials.
The run log includes the preview URL. Review and test before merging.

.github/workflows/portfolio-live.yml runs manually, only from main.
In GitHub Actions choose "Publish portfolio", then "Run workflow" on main.
Merging alone does not publish. Workflows run the pinned Firebase CLI with no
application build. The live command explicitly uses --only hosting.

The dedicated account is:
portfolio-hosting-github@michael-pytlowany.iam.gserviceaccount.com
It has roles/firebasehosting.admin and roles/serviceusage.serviceUsageConsumer.
Its credential is stored only in the encrypted GitHub Actions secret
FIREBASE_PORTFOLIO_HOSTING. Never put a credential in repository files or chat.
The authentication action creates a temporary ignored credential file in the
runner and cleans it up after the job. Action versions are pinned to commits.

Manual equivalent after review:

    npx --yes firebase-tools@15.30.0 deploy --only hosting --project michael-pytlowany

Do not run an unrestricted deploy or initialize Functions, databases, rules,
Authentication, or another hosting platform. Do not change DNS.

## Rollback

Before this update, the live release was:
- Release: sites/michael-pytlowany/releases/1679517874716000
- Version: sites/michael-pytlowany/versions/b529edf76deaa66d
- Released: 2023-03-22T20:44:34.716Z

In Firebase Console, open Hosting for michael-pytlowany, find the prior release
in the live release history, and choose Roll back. This restores Hosting
content and configuration without changing DNS or backend services.
Do not delete the prior release/version while it is needed for rollback.

For source rollback, revert the portfolio merge through a new branch and PR.
Avoid force-pushing or deleting the preserved older application.
For subsequent deployments, record the then-current live version first.

Official documentation:
- https://firebase.google.com/docs/hosting/manage-hosting-resources
- https://firebase.google.com/docs/hosting/github-integration
- https://firebase.google.com/docs/hosting/full-config
