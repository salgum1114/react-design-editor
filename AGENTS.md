# AGENTS.md

## Development Principles

This file defines the basic rules for AI coding agents working in this repository.

### 1. Make Minimal Changes

- Make only the changes necessary to fulfill the requested task.
- Do not modify unrelated code.
- Do not perform unnecessary refactoring, renaming, formatting, or cleanup.
- Preserve existing behavior unless the task explicitly requires changing it.
- Prefer a small, focused diff over a broad rewrite.

### 2. Understand Before Modifying

Before changing code:

- inspect the relevant implementation
- check nearby code and existing patterns
- identify the actual cause or responsibility of the change
- avoid making assumptions based only on filenames or partial context

Do not change code that you do not understand sufficiently.

### 3. Follow Existing Structure

- Follow the architecture and conventions already used by the project.
- Prefer extending an existing pattern rather than introducing a new one.
- Do not introduce a new architectural pattern unless it is clearly necessary.
- Do not reorganize existing code simply because another structure appears cleaner.

### 4. Separate Responsibilities

Keep files and modules focused on a clear responsibility.

When new functionality is clearly separate from the responsibility of an existing file:

- create a new file or module
- place the functionality in the appropriate location
- connect it to the existing code through a clear interface

Do not keep adding unrelated responsibilities to an existing file just to minimize the number of files changed.

At the same time, do not create unnecessary files or abstractions for small logic that naturally belongs in the existing implementation.

### 5. Avoid Speculative Changes

Do not:

- implement features that were not requested
- add abstractions for hypothetical future requirements
- add configuration options without a current need
- introduce compatibility layers without evidence they are required
- change dependencies unless necessary for the task

Implement what is needed now.

### 6. Preserve Compatibility

Changes should preserve existing interfaces and behavior whenever possible.

Do not casually change:

- public APIs
- exported types
- component props
- data structures
- serialized formats
- configuration formats

If a breaking change is unavoidable, keep it limited to the requested scope and clearly report it.

### 7. Prefer Existing Dependencies

- Use existing project dependencies and utilities when they reasonably solve the problem.
- Do not add a new dependency for functionality that can be implemented simply with the existing stack.
- Do not upgrade unrelated dependencies while working on another task.

### 8. Keep Code Simple

Prefer:

- clear code
- explicit behavior
- small focused functions
- meaningful names
- straightforward control flow

Avoid:

- unnecessary abstraction
- excessive indirection
- clever implementations that are difficult to understand
- duplicated logic when an existing reusable implementation already exists

### 9. Bug Fixes

For bug fixes:

- identify the root cause before changing code
- fix the cause rather than hiding the symptom
- avoid unrelated cleanup during the fix
- check nearby code only when the same root cause may reasonably affect it

Do not add arbitrary exceptions or special cases unless they represent an actual requirement.

### 10. Testing and Verification

After making changes:

- run the most relevant existing tests
- run type checking when TypeScript code is affected
- run the relevant build when the change can affect compilation or packaging

Use the repository's existing commands:

```bash
npm run test:unit
npm run typecheck
npm run build:lib
```

Use broader verification when the change affects multiple areas:

```bash
npm run test:unit
npm run typecheck
npm run build
```

Do not claim that a test or build passed unless it was actually executed.

### 11. Do Not Work Around Errors Carelessly

When encountering a type error, test failure, or build failure:

- determine the cause
- fix the underlying issue when it is related to the current change

Do not solve errors by:

- disabling checks
- weakening compiler settings
- removing tests
- adding broad ignores
- suppressing errors without understanding them

### 12. Protect Existing Work

- Do not overwrite or revert unrelated user changes.
- Do not discard uncommitted work.
- Do not rewrite Git history.
- Do not delete files unless deletion is clearly required by the task.

### 13. Final Review

Before completing a task, review the final changes and confirm:

- the requested task is fully addressed
- no unrelated code was changed
- the implementation follows existing project patterns
- responsibilities remain appropriately separated
- no unnecessary abstraction or dependency was introduced
- relevant tests or checks were performed

When reporting completion, briefly state:

- what changed
- what was verified
- any known limitation or unresolved issue

### 14. Git: Conventional Commits

Use the Conventional Commits format for commit messages:

```text
<type>[optional scope]: <description>
```

Common types include:

- `feat`: add or change user-facing functionality
- `fix`: fix a bug
- `docs`: change documentation only
- `test`: add or update tests
- `refactor`: restructure code without changing behavior
- `style`: change formatting or presentation without changing behavior
- `build`: change build tooling or dependencies
- `ci`: change continuous integration configuration
- `chore`: perform repository maintenance
- `revert`: revert a previous commit

Keep the description concise, imperative, and lowercase. Add a scope only when it provides useful context.

Include related GitHub issue numbers at the end of the commit description. Replace `57` with the actual issue number.

Reference an issue without closing it:

```text
feat: add multiple pages (#57)
```

Indicate that the commit resolves and should automatically close an issue:

```text
fix: correct link routing (fixes #57)
```

GitHub also supports `closes` and `resolves`; prefer `fixes` in this repository for consistency. A bare `#57` creates a reference but does not close the issue.

When committing from the command line, include the issue reference in the commit title:

```bash
git commit -m "fix: correct link routing (fixes #57)"
```

For multiple issues, repeat the reference or closing keyword:

```text
feat: add multiple pages (#57, #61)
fix: correct link routing (fixes #57, fixes #61)
```

Do not prefix a Conventional Commit with an issue number. If pull requests are introduced later, a suffix such as `(#57)` may instead be a pull request number added by GitHub during a squash merge; distinguish it from manually written issue references in that workflow.

Use `revert` when reverting an earlier commit:

```text
revert: feat: add multiple pages

This reverts commit <commit-sha>.
```

Use `!` or a `BREAKING CHANGE:` footer for breaking changes.
