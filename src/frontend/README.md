# NPB Morning Web

Frontend for NPB Morning - a read-only web app displaying Nippon Professional Baseball standings and teams.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.local.example .env.local
```

3. Fill in your Supabase credentials in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

- `app/` - Next.js App Router pages and layouts
- `src/components/` - React components
- `src/lib/` - Utility functions (Supabase client)
- `src/types/` - TypeScript type definitions

