# Agent skills for trento web

Skills here follow the [Agent Skills](https://agentskills.io/specification) format.
Codex, Cursor, Copilot, Gemini CLI and OpenCode read this directory directly.
Claude Code reads `.claude/skills`, which is a symlink to this directory.

Move personal skills out of `.claude/skills/` before you check out this change, for example to
`~/.claude/skills/`. Git replaces the old ignored directory with the symlink and deletes its
contents without a warning.

If your clone has `core.symlinks=false`, `.claude/skills` is a text file. Fix it with
`rm .claude/skills && ln -s ../.agents/skills .claude/skills`, or install with
`npx skills add ./.agents/skills -a claude-code`.

Update a skill in the same PR as the code it describes. Generic skills live in
[trento-project/agent-skills](https://github.com/trento-project/agent-skills).
