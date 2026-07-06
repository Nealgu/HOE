# Codex Handoff: Install Procea

This file is the handoff note for continuing the project from another computer or another Codex conversation.

## Repository

- GitHub: https://github.com/Nealgu/HOE
- Active branch: `codex/online-install-procea`
- Local project path on the original computer: `C:\Users\ayape\OneDrive\文档\Install procea`

## How To Continue On Another Computer

```powershell
git clone -b codex/online-install-procea https://github.com/Nealgu/HOE.git
cd HOE
pnpm install
pnpm dev
```

If `pnpm` is not installed on the new computer, install Node.js first, then run:

```powershell
npm install -g pnpm
```

## Online App Context

The project is a Next.js app for an online installation subcontractor settlement process. It was changed from a local-only idea into a web project that can be pushed to GitHub and deployed online.

Important app files:

- `app/`
- `components/dashboard.tsx`
- `lib/`
- `types/domain.ts`
- `public/workflow-map.svg`
- `supabase/schema.sql`
- `supabase/seed.sql`

Expected environment variables for Supabase:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

## Verification Already Done

These commands passed earlier in this branch:

```powershell
pnpm install
pnpm run typecheck
pnpm run build
```

## Diagram Files

The main current work is diagram refinement.

Diagram entry page:

- `docs/diagrams/export.html`

Main diagram files:

- `docs/diagrams/main-business-flow.svg`
- `docs/diagrams/payment-flow.svg`
- `docs/diagrams/finance-payment-post-flow.svg`
- `docs/diagrams/swimlane-flow.svg`

## Current Main Business Flow State

The latest visual work is in `docs/diagrams/main-business-flow.svg`.

Current decisions:

- `Application Form` is an outer green frame with an internal orange cost box.
- `Application Form` cost box contains:
  - `Standard Cost / 标准安装费`
  - `Extra Cost`
  - `水电 / 差旅 / 其他`
- The old `价格判断` node was removed.
- `Price List` now feeds directly into `Margin Check`.
- `Margin Check` has a green diamond border.
- `Margin Check` receives input from above.
- `Margin Check` branches left/right with dashed blue lines:
  - `Pass` to `进入付款流程`
  - `Hold` to `Hold / 调整`
- `Acceptance Form` follows a similar outer-frame structure.
- `Acceptance Form` internal cost box contains only:
  - `* Extra Cost`
- `Standard Cost` should not be added inside `Acceptance Form`.
- The payment line was aligned as:
  - `Payment 1 -> Acceptance Form -> 数量校验 -> Payment 2 -> Payment 3`

## Recent Commits

Most recent diagram commits:

```text
0228ba8 Align payment acceptance section
a92828f Nest acceptance extra cost
b789401 Rework margin check branches
a2cf51f Nest application form costs
defc230 Simplify main diagram cost flow
```

## Suggested Prompt For New Conversation

Use this when continuing in a fresh Codex conversation:

```text
继续 Install procea 项目，仓库 Nealgu/HOE，分支 codex/online-install-procea。
请先阅读 docs/codex-handoff.md，然后继续改流程图。
当前主要文件是 docs/diagrams/main-business-flow.svg。
```

