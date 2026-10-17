# ri-search — local semantic search for Claude Code

A Claude Code plugin that adds `/ri`: ask in plain language, get the best-matching **documents, notes, code, screenshots and audio** from your own machine — outside the repo you are working in.

It is a thin front end. The embedding indexes are built and served by two CLIs you provide (see [Engine](#engine)); this plugin only calls them, merges the results, and prints a compact 2-line-per-hit summary.

---

## Install

```bash
/plugin marketplace add Finfra/f-claude-plugins
/plugin install ri-search@f-claude-plugins
```

* Requires `python3` (3.9+) on the machine that runs Claude Code
* The plugin ships **no index and no embedding model** — see Engine

---

## Usage

```text
/ri where is my lecture on attention heads
/ri 계약서 초안 --ext pdf,docx
/ri login flow --code --ext py,ts          # code search: English queries work best
/ri error dialog --kind screenshot         # media index only
/ri budget --media                         # text hits first, then media hits
/ri status                                 # progress of both indexes
/ri update                                 # incremental re-index (needs RI_UPDATE_CMD)
```

| Option | Meaning |
| :-- | :-- |
| `-k N` | hits per index (default 8) |
| `--ext a,b` · `--root DIR` · `--sort importance\|relevance\|recent` | text-index filters |
| `--code` | search code (use an English query) |
| `--kind K,K` | media index only — `screenshot,image,pdf,doc,audio,video` |
| `--media` | also append a media block after the text hits |
| `--json` | raw JSON from both engines |

By default only the text index is queried; the media index joins automatically when the text index returns nothing. Its ranking cannot be tuned, and screenshots would otherwise crowd out real documents.

---

## Engine

| Role | CLI | Contract |
| :-- | :-- | :-- |
| Text · code · documents | `rindex` | `rindex search <query> -k N --json [--ext E] [--root R] [--sort S] [--code]` → JSON array of `{path, score, mtime, snippet, loc?, copies?}` · `rindex stats` |
| Screenshots · images · audio | `digup` | `digup search <query> -n N --json [--kind K,K]` → JSON array of `{path, cosine, kind, modified, excerpt}` · `digup status` |

Either engine may be absent. A missing `digup` only disables the media block; a missing `rindex` makes text search fail with a clear message. Any CLI that honors the contract above works.

---

## Options

All settings are environment variables — put them in your shell profile or in the `env` block of Claude Code `settings.json`. Nothing is required if `rindex`/`digup` are on `PATH` and the indexes live on the same machine.

| Variable | Default | Description |
| :-- | :-- | :-- |
| `RI_RINDEX` | `rindex` | text-index CLI |
| `RI_DIGUP` | `digup` on `PATH`, else the DigUp.app helper | media-index CLI |
| `RI_SSH_HOST` | *(empty)* | host that holds the indexes; used with `RI_LOCAL_MARK` |
| `RI_LOCAL_MARK` | *(empty)* | a directory that exists only where the indexes live. If it is missing locally and `RI_SSH_HOST` is set, the search runs over `ssh` |
| `RI_REMOTE_CMD` | *(empty)* | how to call this script on the remote host, e.g. `python3 /path/to/ri.py` — required with `RI_SSH_HOST` |
| `RI_UPDATE_CMD` | *(empty)* | incremental re-index command `/ri update` runs in a tmux session `ri-index` — required for `update` |
| `RI_INDEXER_PAT` | *(empty)* | `pgrep -f` pattern of the running indexer; if it matches, `update` refuses to start a second one (rc 3) |
| `RI_SSH` · `RI_PGREP` · `RI_TMUX` | `ssh` · `pgrep` · `tmux` | executables |

Exit codes: `0` ok · `1` backend failed · `2` usage or missing setting · `3` indexer already running.

---

## Tests

```bash
npm test        # includes tdd/cases/ri-search-plugin.test.js — fake rindex/digup, no real index touched
```

---

## License

[MIT](../LICENSE)
