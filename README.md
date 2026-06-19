# swipe-platform

Deploy repo for the **in-app swipe feed** (Instagram/TikTok-style feed of
playable mini-games), served as one static site on Render. Separate from
`playables-export` (which hosts the AppLovin creative previews).

Everything here is a generated artifact — do not hand-edit. Sources live in:

- **Feed (platform shell):** `feed-prototype/` → built to `index.html` here.
- **Mini-games (swipe builds):** `playables/<id>/dist-swipe/` → copied to
  `<id>.html` here. These are `SWIPE=1` builds: no internal preloader, no MRAID
  wait, and they report completion to the feed via `postMessage`
  (`{ source:'playable', id, type:'completed', success }`).

The feed loads `./<id>.html` as **same-origin** siblings — required so the feed
can pause off-screen games (visibility override) and receive the completion
signal.

## Update / redeploy

```bash
# 1. (Re)build the swipe games you changed
cd playables
npm run build:swipe <id>          # → playables/<id>/dist-swipe/index.html

# 2. (Re)build the feed if it changed
cd ../feed-prototype && npm run build

# 3. Assemble into this repo
cp feed-prototype/dist/index.html  swipe-platform/index.html
cd playables && bash scripts/export-swipe.sh --all   # or: <id> [<id> ...]

# 4. Commit + push → Render auto-deploys
cd ../swipe-platform && git add -A && git commit -m "..." && git push
```
