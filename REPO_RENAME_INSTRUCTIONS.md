# Repository Rename Instructions

## 🎯 Goal
Rename repositories to match the "OpenClaw Pro" rebrand:
- `enterprise-openclaw` → `openclaw-pro` (private)
- `enterprise-openclaw-public` → `openclaw-pro-public` (public)

---

## ✅ Step 1: Rename on GitHub (YOU DO THIS)

### Private Repo Rename:

1. Go to: https://github.com/wjlgatech/enterprise-openclaw/settings
2. Scroll to **"Repository name"** section
3. Change: `enterprise-openclaw` → `openclaw-pro`
4. Click **"Rename"**
5. GitHub will show: "Your repository has been renamed"

**New URL:** https://github.com/wjlgatech/openclaw-pro

---

### Public Repo Rename:

1. Go to: https://github.com/wjlgatech/enterprise-openclaw-public/settings
2. Scroll to **"Repository name"** section
3. Change: `enterprise-openclaw-public` → `openclaw-pro-public`
4. Click **"Rename"**
5. GitHub will show: "Your repository has been renamed"

**New URL:** https://github.com/wjlgatech/openclaw-pro-public

---

## ✅ Step 2: Update Local Git Remotes

After renaming on GitHub, run this script in your local repo:

```bash
./update-git-remotes.sh
```

**This script will:**
- Update `origin` remote → https://github.com/wjlgatech/openclaw-pro.git
- Update `public` remote → https://github.com/wjlgatech/openclaw-pro-public.git
- Show you the updated remotes

---

## ✅ Step 3: Verify Everything Works

```bash
# Test fetching from both remotes
git fetch origin
git fetch public

# Should work without errors
```

---

## 📋 What's Already Updated

I've already updated all code references:

✅ **package.json**
- Workspace name: `openclaw-pro-workspace`
- Package scopes: `@openclaw/*`
- Author: `OpenClaw Pro Team`

✅ **README.md**
- All GitHub URLs → new repo names
- All domain refs → `openclaw.pro`
- All brand references → "OpenClaw Pro"

✅ **Memory files**
- DUAL_REPO_PUBLISHING_RULES.md
- MEMORY.md

✅ **All committed and pushed** to the (old) private repo

---

## 🔄 GitHub Auto-Redirects

**Good news:** GitHub automatically redirects old URLs to new ones!

- Old: `github.com/wjlgatech/enterprise-openclaw`
- New: `github.com/wjlgatech/openclaw-pro`

**Both work!** But it's cleaner to update your local remotes.

---

## 📊 Summary of Changes

| Item | Old | New |
|------|-----|-----|
| **Private Repo** | enterprise-openclaw | openclaw-pro |
| **Public Repo** | enterprise-openclaw-public | openclaw-pro-public |
| **Package Scope** | @enterprise-openclaw/* | @openclaw/* |
| **Domain** | enterprise-openclaw.com | openclaw.pro |
| **Brand Name** | Enterprise OpenClaw | OpenClaw Pro |

---

## 🚀 After Rename is Complete

1. ✅ Rename repos on GitHub (you)
2. ✅ Run `./update-git-remotes.sh` (automated)
3. ✅ Test: `git fetch origin && git fetch public`
4. ✅ Continue working as normal!

---

## ⚠️ Important Notes

### For Collaborators:
If anyone else has this repo cloned, they should also update their remotes:

```bash
git remote set-url origin https://github.com/wjlgatech/openclaw-pro.git
git remote set-url public https://github.com/wjlgatech/openclaw-pro-public.git
```

### For Package Names:
If you publish npm packages, update them gradually:
- Keep old package names working (redirect/deprecate)
- Publish new packages under `@openclaw/*` scope
- Update docs to reference new names

---

## 🆘 If Something Goes Wrong

### Can't push after rename?
```bash
# Update remote and try again
git remote set-url origin https://github.com/wjlgatech/openclaw-pro.git
git push origin main
```

### Old remote still showing?
```bash
# Remove and re-add
git remote remove origin
git remote add origin https://github.com/wjlgatech/openclaw-pro.git
```

### Need to go back?
GitHub keeps redirects, so old URLs still work. But to revert:
1. Rename repos back on GitHub
2. Run `git remote set-url` with old URLs

---

## ✅ Checklist

- [ ] Rename `enterprise-openclaw` → `openclaw-pro` on GitHub
- [ ] Rename `enterprise-openclaw-public` → `openclaw-pro-public` on GitHub
- [ ] Run `./update-git-remotes.sh`
- [ ] Test: `git fetch origin` (should work)
- [ ] Test: `git fetch public` (should work)
- [ ] Update any external services pointing to old URLs (CI/CD, webhooks, etc.)

---

**Ready? Go rename those repos on GitHub!** 🚀
