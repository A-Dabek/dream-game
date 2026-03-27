---
name: docs
description: Check and update documentation
---

# What you need

1. What aspect of documentation to check/update (e.g., "check AGENTS.md", "update component tree", "review skills").

# What to do

## Documentation Files to Check

| File | Description |
|------|-------------|
| `AGENTS.md` | Project overview and conventions |
| `.opencode/skills/*/SKILL.md` | Skill definitions |
| `projects/game-board-ui/COMPONENTS.md` | UI component documentation |
| `projects/game-board-ui/styles/component-tree.html` | Component hierarchy |

## What to Look For

- **Outdated information**: APIs, file paths, project structure that no longer match the code
- **Missing documentation**: New features without documentation
- **Inconsistencies**: Differences between docs and actual implementation
- **Type-safe registries**: Ensure new items/genres/status-effects are registered in conventions

## Update vs. Check

- **Check**: Review documentation and report what is outdated or missing
- **Update**: Make necessary changes to keep documentation in sync with implementation

## When to Update

- Add new items to convention JSON files (e.g., `basic-items.json`)
- Register new genres in `convention-registry.ts`
- Update AGENTS.md when project structure changes
- Update skills when implementation changes

## What NOT to do

- Do NOT create new documentation files unless explicitly requested
- Do NOT change business logic
- Do NOT add unnecessary documentation bloat
