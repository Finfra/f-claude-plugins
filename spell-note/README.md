# spell-note — Korean spell-check mod for Claude Code

A Claude Code plugin (mod) that quietly checks **Korean spelling and grammar** in the prompts you type, shows a one-line note in the band above the prompt, and appends every finding to a markdown log.

![spell-note in action](img/demo.png)

---

## What it does

* Checks only prompts a human typed — notifications, auto-continue, headless sessions (`claude -p`) and slash commands are skipped
* Only prompts with 3+ Hangul characters; code blocks and IDE attachment tags are stripped first
* Runs on **haiku** in the background, so the turn is never blocked
* Ignores spacing, code, English, casual endings and colloquial style — reports confident errors only
* The band shows up to 3 fixes (`됬는지→됐는지 · 몇일→며칠 …`) with a `닫기` (close) button, and yields when another plugin is using the band
* Findings are appended to the log as a `| time | wrong | right | why | prompt |` table

---

## Install

```bash
/plugin marketplace add Finfra/f-claude-plugins
/plugin install spell-note@f-claude-plugins
```

* Requires a Claude Code build with function hooks (mods) — an early-access API that may change between releases
* Each check costs one haiku call against your usage

---

## Options

| Option    | Default                                             | Description                             |
| :-------- | :-------------------------------------------------- | :-------------------------------------- |
| `logPath` | `~/.claude/spell-note/SpellingAndGrammarChecker.md` | Log file. A leading `~` becomes `$HOME` |

Change it from `/config` as `spell-note.logPath`.

---

## Development

```bash
claude plugin validate spell-note
claude plugin test spell-note
```

See [README_kr.md](README_kr.md) for the Korean version.
