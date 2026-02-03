## Quick Setup Guide: Dual Publishing

**Goal:** One local codebase, automatic publishing to public and private repos

### 🚀 Quick Start (5 minutes)

#### 1. Create Public Repository on GitHub

```bash
# Go to https://github.com/new

# Create PUBLIC repository:
# - Name: enterprise-openclaw-public
# - Visibility: Public
# - Don't initialize with README

# NOTE: Current repo (enterprise-openclaw) stays as PRIVATE
```

#### 2. Add Git Remote

```bash
# Add public remote
git remote add public https://github.com/wjlgatech/enterprise-openclaw-public.git

# Verify
git remote -v

# You should see:
# origin  https://github.com/wjlgatech/enterprise-openclaw.git (private)
# public  https://github.com/wjlgatech/enterprise-openclaw-public.git (public)
```

#### 3. Test Manual Publishing

```bash
# Publish core to public (manual test)
./scripts/publish-public.sh

# Current repo is already private, no additional publish needed
# But you can verify with: git push origin main
```

#### 4. Setup GitHub Secrets (for automation)

Go to your **main repository** settings → Secrets and variables → Actions

Add these secrets:
- **NPM_TOKEN** - Get from https://www.npmjs.com/settings/YOUR_USERNAME/tokens
- **PUBLIC_REPO_TOKEN** - GitHub PAT with `repo` scope (https://github.com/settings/tokens)
- **PRIVATE_REPO_TOKEN** - GitHub PAT with `repo` scope

#### 5. Enable Automatic Publishing

```bash
# Push to trigger the workflow
git push origin main
```

**Done!** ✅ Every push now automatically publishes to both repos.

---

### 📋 Usage

**Daily Development:**
```bash
# Work on any package
cd packages/core  # or packages/enterprise

# Make changes, test
npm test

# Commit and push once
git commit -m "feat: add feature"
git push origin main

# Both public and private repos update automatically!
```

**Create Release:**
```bash
# Tag and push
git tag v1.0.1
git push origin v1.0.1

# Create GitHub release
gh release create v1.0.1 --title "Release v1.0.1"

# Packages automatically published:
# - @enterprise-openclaw/core → npm (public)
# - @enterprise-openclaw/enterprise → GitHub Packages (private)
```

---

### 🔍 Verification

**Check public repo:**
```bash
git clone https://github.com/wjlgatech/enterprise-openclaw-public.git /tmp/test-public
cd /tmp/test-public
ls packages/  # Should see only "core"
```

**Check private repo (current repo):**
```bash
# Already have it locally, but to verify:
ls packages/  # Should see "core" and "enterprise"
```

---

### 📖 Full Documentation

See [MONOREPO_DUAL_PUBLISH.md](./MONOREPO_DUAL_PUBLISH.md) for complete details.
