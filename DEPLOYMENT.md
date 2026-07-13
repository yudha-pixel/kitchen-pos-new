# Deployment Guide - Kitchen POS to Vercel

## Prerequisites

- GitHub account with the project pushed to a repository
- Vercel account (free tier is sufficient)
- Supabase project with database configured

## Step 1: Push to GitHub

1. Initialize git repository (if not already done):
```bash
git init
git add .
git commit -m "Initial commit - Kitchen POS"
```

2. Create repository on GitHub and push:
```bash
git remote add origin https://github.com/your-username/kitchen-pos.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
5. Click "Deploy"

### Option B: Via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Follow the prompts to configure your project

## Step 3: Configure Environment Variables

### In Vercel Dashboard:

1. Go to your project in Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

#### Required for Supabase Sync:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Optional - Store Configuration:
```
NEXT_PUBLIC_STORE_NAME=Kitchen POS
NEXT_PUBLIC_STORE_ADDRESS=Your Store Address
NEXT_PUBLIC_STORE_PHONE=Your Phone Number
```

#### Optional - Odoo Integration:
```
NEXT_PUBLIC_ODOO_URL=https://your-odoo-instance.com
ODOO_DATABASE=your_odoo_database
```

4. Click "Save"
5. **Important**: Redeploy your project after adding environment variables:
   - Go to **Deployments** tab
   - Click the three dots (...) next to latest deployment
   - Select "Redeploy"

### Getting Supabase Credentials:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 4: Database Setup

### Run SQL Schema in Supabase:

1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Run the schema from `src/lib/database.sql`:
   - Categories table
   - Products table
   - Modifiers table
   - Orders table
   - Order items table
   - Order void logs table

### Enable Row Level Security (RLS):

```sql
-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_void_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth setup)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON orders FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON orders FOR INSERT WITH CHECK (true);
```

## Step 5: Verify Deployment

1. Check your Vercel deployment URL
2. Open the POS application
3. Test:
   - Product loading from Supabase
   - Adding items to cart
   - Payment processing
   - Receipt printing
   - Offline mode (by disconnecting internet)

## .gitignore Configuration

Your `.gitignore` already includes:
```
.env*
```

This ensures:
- `.env.local` (development) is NOT committed
- `.env.production` (production) is NOT committed
- Only `.env.example` should be committed (as template)

**Important**: Never commit actual environment variables with sensitive data to Git!

## Troubleshooting

### Environment Variables Not Loading:
- Ensure variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding variables
- Check Vercel build logs for errors

### Supabase Connection Issues:
- Verify Supabase URL and Anon Key are correct
- Check Supabase project is active
- Ensure RLS policies allow access

### Build Errors:
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Offline Mode Not Working:
- IndexedDB requires HTTPS in production (Vercel provides this)
- Check browser console for IndexedDB errors
- Verify service worker is registered (if using PWA)

## Production Checklist

- [ ] Environment variables configured in Vercel
- [ ] Supabase database schema applied
- [ ] RLS policies configured in Supabase
- [ ] Store information updated (name, address, phone)
- [ ] Test payment flow in production
- [ ] Test receipt printing
- [ ] Test offline mode
- [ ] Verify sync to Supabase works
- [ ] Check mobile responsiveness

## Post-Deployment

1. **Monitor**: Use Vercel Analytics to monitor performance
2. **Logs**: Check Vercel function logs for errors
3. **Database**: Monitor Supabase dashboard for database usage
4. **Updates**: Deploy updates by pushing to GitHub and Vercel auto-deploys

## Custom Domain (Optional)

1. In Vercel project → **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. SSL certificate is automatically provisioned

## Support

- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs
- Next.js Documentation: https://nextjs.org/docs
