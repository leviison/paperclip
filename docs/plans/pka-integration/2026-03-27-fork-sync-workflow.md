# Fork Sync Workflow

Status: Active Reference  
Owner: Repo Maintenance  
Date: 2026-03-27

## Purpose

This repo is now being developed from the fork at `leviison/paperclip` while still tracking the original Paperclip project for upstream updates.

## Remote Model

- `origin` = `https://github.com/leviison/paperclip.git`
- `upstream` = `https://github.com/paperclipai/paperclip.git`

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

## Normal Upstream Sync Flow

### 1. Fetch upstream changes

```bash
git fetch upstream
```

### 2. Update local `master`

```bash
git checkout master
git merge upstream/master
```

### 3. Push updated `master` to your fork

```bash
git push origin master
```

This is the safest and simplest sync model.

## Alternative: Rebase Flow

If you want a cleaner linear history:

```bash
git checkout master
git fetch upstream
git rebase upstream/master
git push origin master --force-with-lease
```

Use this only if you are comfortable with rebasing and force-pushing your fork branch.

## Starting New Feature Work

Before starting a milestone:

```bash
git checkout master
git fetch upstream
git merge upstream/master
git push origin master
git checkout -b feature/briefs-foundation
```

Then do the work on the feature branch, not directly on `master`.

## Keeping a Feature Branch Current

If upstream moves while a feature branch is in progress:

```bash
git checkout master
git fetch upstream
git merge upstream/master
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
- sync `master` from `upstream` regularly
- keep commits focused by milestone or sub-slice
- do not push anything to `upstream` unless explicitly intended

## Recommendation

The right next step is:

1. sync `master` from `upstream`
2. create `feature/briefs-foundation`
3. execute Milestone 1 from the planning docs on that branch
