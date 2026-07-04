# Install Procea Online

Online installation subcontractor settlement system for Customer SO, vendor budget split, dispatch/application cost, acceptance extra cost, margin check, payment schedule, finance approval, and posting.

## Stack

- Next.js App Router
- Supabase Auth + PostgreSQL + Row Level Security
- Vercel deployment

## Business Flow

```text
Customer SO
  -> Installation Revenue
  -> Vendor Budget Split
  -> Application Form
  -> Standard Installation + Extra Cost + Special Request
  -> Margin Check
  -> Acceptance Form
  -> Payment 1 / Payment 2 / Payment 3
  -> Finance Approve
  -> Post
```

## Online Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Optionally run `supabase/seed.sql` for demo records.
4. Copy `.env.example` to `.env.local` and fill:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

5. Push this repository to GitHub.
6. Import the GitHub repository into Vercel.
7. Add the same environment variables in Vercel Project Settings.
8. Deploy.

The deployed app will run from a Vercel URL and use Supabase as the cloud database. The current UI can save a project snapshot after Supabase Auth is connected and the user is signed in.

## Local Development

```bash
npm install
npm run dev
```

Local development is only for testing the online app before deployment; production data is stored in Supabase.

## Source References

- Next.js project structure: https://nextjs.org/docs/app/getting-started/project-structure
- Supabase SSR client for Next.js: https://supabase.com/docs/guides/auth/server-side/nextjs
- Vercel Next.js deployment: https://vercel.com/docs/frameworks/full-stack/nextjs
