# Fork Sync Workflow

Status: Active Reference  
Owner: Repo Maintenance  
Date: 2026-03-27

## Purpose

This repo is now being developed from the fork at `leviison/paperclip`.

The working preference is:

- track only the fork by default
- do not keep a permanent `upstream` remote configured
- pull from the original Paperclip repo only intentionally, when updates are needed

## Default Remote Model

- `origin` = `https://github.com/leviison/paperclip.git`

There is no permanent `upstream` remote by default.

Verify with:

```bash
git remote -v
```

## Recommended Branching Model

Yes: branch before starting implementation work from the planning docs.

Recommended approach:

- keep `master` as the integration branch that stays close to upstream
- do all feature work on short-lived branches
- merge completed feature branches back into your fork's `master`
- regularly pull upstream changes into local `master`

Suggested branch names:

- `feature/briefs-foundation`
- `feature/memory-summaries-foundation`
- `feature/context-assembly-integration`
- `feature/operator-session-workflow`
- `feature/knowledge-browser`
- `feature/agent-evolution`

## Pulling Updates From Paperclip

You can still pull updates from `paperclipai/paperclip` safely without tracking it permanently and without pushing any of your work there.

### Option 1: Fetch directly from URL

This is the recommended default for this repo.

```bash
git checkout master
git fetch https://github.com/paperclipai/paperclip.git master
git merge FETCH_HEAD
git push origin master
```

This does not create a permanent `upstream` remote.

### Option 2: Temporary `upstream` remote

If you prefer named remotes for a one-time sync:

```bash
git remote add upstream https://github.com/paperclipai/paperclip.git
git fetch upstream
git checkout master
git merge upstream/master
git push origin master
git remote remove upstream
```

This keeps the repo pointed only at your fork before and after the sync.

## Alternative: Rebase Flow

If you want a cleaner linear history during an intentional upstream sync:

```bash
git checkout master
git fetch https://github.com/paperclipai/paperclip.git master
git rebase FETCH_HEAD
git push origin master --force-with-lease
```

Use this only if you are comfortable with rebasing and force-pushing your fork branch.

## Starting New Feature Work

Before starting a milestone:

```bash
git checkout master
git push origin master
git checkout -b feature/briefs-foundation
```

Then do the work on the feature branch, not directly on `master`.

## Keeping a Feature Branch Current

If upstream moves while a feature branch is in progress:

```bash
git checkout master
git fetch https://github.com/paperclipai/paperclip.git master
git merge FETCH_HEAD
git push origin master
git checkout feature/briefs-foundation
git merge master
```

This avoids letting long-running branches drift too far from the latest upstream state.

## Merge Back to Fork

When a feature branch is ready:

```bash
git checkout master
git merge feature/briefs-foundation
git push origin master
```

Then optionally delete the branch:

```bash
git branch -d feature/briefs-foundation
git push origin --delete feature/briefs-foundation
```

## Rules

- do not work directly on `master` for milestone implementation
- sync `master` from Paperclip intentionally when needed
- keep commits focused by milestone or sub-slice
- do not configure or push to `upstream` unless explicitly intended

## Recommendation

The right next step is:

1. sync `master` from Paperclip intentionally when needed
2. create `feature/briefs-foundation`
3. execute Milestone 1 from the planning docs on that branch
