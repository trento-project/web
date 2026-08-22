# Agent Skills

Tool-agnostic skills documenting trento's AI Assistant stack. Loadable by any agent CLI that honors the [agentskills.io specification](https://agentskills.io/specification).

## Skills

| Skill | Scope |
|---|---|
| `trento-ai-assistant/` | Elixir side — Phoenix channel, `Trento.AI.*` modules, `Trento.Infrastructure.AI.*` sagents adapters, AG-UI emission, system prompt, tools. |
| `trento-ai-assistant-ui/` | React + JS side — `WebSocketAIAgent` transport, `assistant-ui` runtime wiring, components under `assets/js/common/AIAssistant/`. |
| `sagents/` | Generic sagents v0.7 library reference. Not trento-specific. SKILL.md is a 1-page cheat sheet; `*.md` siblings hold detail per topic (api, middleware, persistence, etc.). |

## Per-tool setup

Each skill is a plain markdown file with [agentskills.io](https://agentskills.io/specification) frontmatter. How agents discover this directory depends on the tool.

### Claude Code

Add a symlink so Claude Code finds the skills under its default path:

```bash
ln -s "$(pwd)/agents/skills" ~/.claude/skills/trento
```

Or configure your `settings.json` to include this directory in the skill search path (refer to Claude Code's settings docs for the current key).

### Codex

Codex discovers skills under `.agents/skills/` at the repo root. Symlink:

```bash
ln -s agents/skills .agents/skills
```

Or move (if your team standardizes on Codex):

```bash
mv agents .agents
```

### Cursor / other agent tools

Refer to the tool's documentation for the skill discovery path. The skills here are plain markdown with standardized YAML frontmatter — they should be loadable by anything that follows the agentskills.io spec.

## Conventions

- Every skill has a `SKILL.md` with YAML frontmatter (`name` + `description` required, `description` starts with "Use when...").
- Skills cross-reference each other by name (not path) so the loader can resolve them per its convention.
- Code paths in skill text are relative to the trento repo root (`lib/...`, `assets/...`, `test/...`).
- Skills don't reference any specific agent tool's invocation mechanism (no `/slash-commands`, no `Skill` tool, etc.). The "how" of invoking a skill belongs to the tool, not the skill.

## Contributing

When you make a substantive change to the AI Assistant code (channel handlers, adapter wiring, system prompt, AG-UI events, React runtime integration), update the corresponding skill in the same PR. Skills that drift from code are worse than no skills.

If a code path becomes too gnarly to explain in 1-2 sentences, that's the skill telling you to refactor — not to write more skill prose.
