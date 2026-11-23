# FORK.md: afterever's copy of claude-skins

Read this first when upstream ships a release. Written 2026-11-20 against upstream 0.5.16.

This is a fork of [hellosverre/claude-skins](https://github.com/hellosverre/claude-skins). The
`afterever` branch is what my machines install. It is upstream plus a few patches, kept small
so that taking an upstream release is a merge, a version bump and a test run.

## What the fork adds

| Piece | Where | Goes upstream? |
|---|---|---|
| Optional `border` palette slot for the prompt outline | upstream PR [#101](https://github.com/hellosverre/claude-skins/pull/101), **merged 2026-11-22** as `f93ba84` (identical to my branch) | Done: it is upstream now |
| Optional `promptFg` / `promptBg` slots (a "caution sign" prompt). With a fill the prompt is drawn as a solid plate: `Text` rows rimmed in half blocks of the fill colour, wrapped to the viewport, no outline, `border` ignored (a Box border cannot paint its own background, so it left a visible rim on a dark or a light terminal). The plate is on `afterever` only, not on `feat/prompt-sign` | `feat/prompt-sign`, fork PR [afterever/claude-skins#1](https://github.com/afterever/claude-skins/pull/1) | **No, kept in the fork.** I mentioned it in a comment on #101 and the owner never answered; silence is not a yes. If the conflicts on each merge get tiresome, open an issue with lettered options (the owner's way) before sending a PR |
| A built-in `cupertino` skin and a first-run look | the last commit on `afterever` | Never: it is my taste |

`afterever` = upstream `main` + the `promptFg`/`promptBg` commits + the personal commit. Last merged
with upstream `main` at `a4cdb19` (2026-11-22, version `0.5.16-afterever.20261122`). Upstream `v0.5.16` is
still its latest release; `main` is ahead of it, and the fork now carries those unreleased commits.

The `promptFg`/`promptBg` commits extend lines upstream's `border` slot also touches, so a merge
conflicts in the same places each time: `types/index.d.ts`, `hooks/custom.ts`, `hooks/light.ts`,
`hooks/rows.tsx`, `hooks/settings.tsx`, `hooks/skin.ts`, `skills/skin-designer/SKILL.md`, `README.md`,
`tests/logic.test.ts`, `tests/rows.test.tsx`. In the 2026-11-22 merge every hunk had upstream's side as
a strict subset of mine, so each kept mine. Resolve hunk by hunk (not `git checkout --ours`, which
drops upstream's other changes in the same file) and read each hunk before keeping a side.

The personal commit is made of new files plus a few one-line edits, so it rarely conflicts:

- new: `hooks/first-run.ts`, `hooks/themes/cupertino.ts`, `tests/first-run.test.ts`, this file
- one line each: `hooks/themes/index.ts` (import and append `cupertino`), `hooks/register.tsx` (import and call `seedFirstRun($)` first in `load`), `.claude-plugin/plugin.json` (the version suffix)
- two test lines: `tests/logic.test.ts` (the built-in skin count) and `tests/rows.test.tsx` (one import and one assertion that the pinned test saw the seed)

`DEFAULT_PREFS` is deliberately **not** edited. Upstream's tests treat it as the reference, and
editing it broke about thirty of them. `FIRST_RUN_PREFS` spreads it and overrides eight values;
`seedFirstRun` writes that record to the store once, only when no prefs were ever saved. A machine
with saved prefs is never touched, and test stubs never persist a write, so they see upstream's
defaults.

## When upstream ships a release

Check for one now and then (nothing tells me): `gh release list --repo hellosverre/claude-skins --limit 3`.

```
git fetch origin
git checkout afterever
git log --oneline HEAD..origin/main        # what is coming
git merge origin/main                      # a merge, not a rebase: nobody has to force-push
```

Resolve any conflicts (see "Conflicts" below), then:

1. **Bump the version** in `.claude-plugin/plugin.json` to the upstream version plus the date of
   the build: `0.5.17-afterever.20261215` (`afterever.YYYYMMDD`). A second build on the same day
   adds a counter: `0.5.17-afterever.20261215.1`. Both sort above the older suffixes (`.2`, `.3`,
   and any earlier date). Tag the pushed commit `v<version>` (`v0.5.16-afterever.20261123`) and make a
   GitHub release on the fork as a marker; the install still reads the `afterever` branch, not the tag. This is not cosmetic: Claude Code's plugin cache is keyed by version
   (`~/.claude/plugins/cache/<marketplace>/skins/<version>`), so an unchanged version can look
   like "nothing new" and never be fetched.
2. **Run the checks** from the repo root (Git Bash). All three must be clean:
   ```
   claude plugin test . 2>&1 | grep -E "\(fail\)|^ *[0-9]+ (pass|fail)"      # expect 0 fail
   claude plugin validate .                                                   # passes; host-typing warnings are normal
   mkdir -p .claude/types && cp -r .claude-plugin/types/. .claude/types/ && rm -f .claude/types/tsconfig.json && npx -y -p typescript@5.9.3 tsc -p tsconfig.json   # no output
   ```
   Do not pipe the test run to `tail`: it hides the exit code.
3. **Commit and push**: `git commit` the merge and the bump, then `git push fork afterever`.
4. **Pick it up on each machine**: `claude plugin marketplace update afterever-mods`, then
   `claude plugin update skins@afterever-mods`, then restart Claude Code. `afterever-mods` has
   `autoUpdate` on, so a restart alone usually does it.

## Conflicts: where they will be

Upstream touched these files only a handful of times a month, so most releases merge cleanly.

| Conflict | Fix |
|---|---|
| `tests/logic.test.ts`: `expect(SKINS.length).toBe(N)` | Upstream added a skin. Set it to upstream's count plus one (mine is the extra). |
| `hooks/themes/index.ts` | Keep upstream's list and keep `cupertino` last. |
| `hooks/register.tsx` around `load` | Keep upstream's code and keep the `seedFirstRun($)` line first in `load`. |
| `.claude-plugin/plugin.json` version | Take upstream's number and add the suffix again. |
| `border` / `promptFg` / `promptBg` files (`hooks/skin.ts`, `custom.ts`, `light.ts`, `rows.tsx`, `settings.tsx`, `types/index.d.ts`, tests) | Only if upstream changed these. See "When #101 is merged or reshaped". |
| A new upstream test fails because of the first-run seed | A test with its own store that asserts "nothing saved yet". Fix it as `tests/rows.test.tsx` was fixed: expect `FIRST_RUN_PREFS` there. |

A new upstream **pref** needs nothing: `FIRST_RUN_PREFS` spreads `DEFAULT_PREFS`, so it gets
upstream's value. Add an override in `hooks/first-run.ts` only if I want it different.

## History: #101

#101 was merged as written (squash), so the first merge of `origin/main` brought it in. The
`feat/border-slot` branch is now redundant (see Housekeeping). It did conflict, though: not because
upstream changed #101, but because `promptFg`/`promptBg` sit on lines next to `border`, and git
compares against the old common ancestor.

If `promptFg`/`promptBg` ever reach upstream, take upstream's shape (it wins), re-apply what the
personal commit needs on top, and then ask whether the fork is still worth keeping: it would be only
`cupertino` and the first-run seed.

## Changing the fork itself

- **A change I would send upstream** goes on its own `feat/…` or `fix/…` branch from `origin/main`
  (never from `afterever`), as a PR to `hellosverre/claude-skins`. Then merge that branch into
  `afterever`. The owner's process: an issue with lettered options, an answer by letter, then a
  PR whose body has "What changed / Checked locally / Things you may want a different way"; the
  commit title is `feat: …` or `fix: …`.
- **A change only I want** goes straight on `afterever` with a `chore:` title, and bumps the suffix.
- **Another look value on a fresh install**: edit `FIRST_RUN_PREFS` in `hooks/first-run.ts`. It
  only affects machines with nothing saved. A machine that already has prefs keeps them, so change
  those there with `/skin`.
- **A different `cupertino` colour**: edit `hooks/themes/cupertino.ts`. A stored custom skin with
  the same name is shadowed by the built-in (`skinNames` drops it), so nothing is left to migrate.
  Editing a slot of a built-in skin in the settings pane forks it into `my-cupertino`.

## How a machine installs it

The `skins` entry in `afterever/claude-craftkits` (`.claude-plugin/marketplace.json`) is
`{ "source": "github", "repo": "afterever/claude-skins", "ref": "afterever" }`, so the plugin ID is
`skins@afterever-mods`.

```
claude plugin marketplace add afterever/claude-craftkits     # once per machine
claude plugin install skins@afterever-mods
```

Move a machine over from upstream: back up `~/.claude/plugins/store/skins_hellosverre-mods-*.json`
first, then `claude plugin uninstall skins@hellosverre-mods`, install the fork, restart. Never run
both at once: two `skins` plugins would both register `/skin` and the same hooks. A machine with no
saved prefs starts as `cupertino` with the first-run look; one that already has a store keeps it
(the store file is named for the plugin and the marketplace, `skins_<marketplace>-<hash>.json`, so
I expect the fork to start with an empty store and be seeded; check `/skin list` after the first
start, and if it did not seed, copy `custom` and `prefs` over from the backup).

Back to upstream: `claude plugin uninstall skins@afterever-mods`, then
`claude plugin marketplace add hellosverre/claude-skins` and
`claude plugin install skins@hellosverre-mods`, then rebuild `cupertino` from the table in
craftkits' `SETUP.md`.

## Housekeeping

- Branches kept on purpose: `feat/prompt-sign` (the fork-only prompt sign as its own branch, in case
  it is ever sent upstream; fork PR #1 for it was closed) and `screenshots` (the image in the #101
  comment is served from it: do not delete). The 2026-11-22 cleanup deleted every branch whose upstream
  PR was merged with a matching tip.
- Safe to delete when you are happy with the merge: the local `backup/afterever-pre-merge-0.5.16-afterever.2`
  (the branch as it was before the 2026-11-22 merge, `0ee4e1e`).
- `fork/main` is an unused mirror and is far behind upstream. To refresh it:
  `git push fork origin/main:main`. Nothing installs from it.
- `.claude/types/` is the type check's scratch copy of the host typings; it is git-ignored.
- Pushes to the fork are manual. No auto-push hook applies to this repo.
