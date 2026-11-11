# Story Desk Admin Quick Reference

## Your Account
- **Email**: c.mccann@mdx.ac.ae
- **Role**: super_admin
- **Status**: ✅ Approved

## Quick Links
- 🚀 **Live App**: https://story-desk-v2.vercel.app
- 📊 **Supabase Dashboard**: https://supabase.com/dashboard
- 🔧 **Vercel Dashboard**: https://vercel.com/cfmccann10-dotcom/story-desk-v2
- 📝 **GitHub Repo**: https://github.com/cfmccann10-dotcom/story-desk-v2

## Daily Tasks

### Add a New Staff Member
1. Sign in at https://story-desk-v2.vercel.app with your email
2. Go to **Settings** page
3. Fill in:
   - Email: (new staff member's email)
   - Role: editor | reviewer | viewer
4. Click **Add Staff**
5. ✅ Done! They can now sign up with that email

### Remove Staff Member
1. Go to **Settings**
2. Find the person in the staff list
3. Click **Remove** next to their name
4. ✅ They'll no longer be able to access the system

### Change Someone's Role
1. Go to **Settings**
2. Find the person in the staff list
3. Click **Edit** or the role dropdown
4. Select new role
5. ✅ Changes take effect immediately

### View All Stories
1. Go to **Dashboard**
2. See all submitted stories (public + staff submissions)
3. Can view details, status, and notes for each story

---

## Troubleshooting

**Can't sign in?**
- Check: Is your email (c.mccann@mdx.ac.ae) in Supabase staff_members table?
- Fix: Add it via Supabase dashboard if missing

**New staff member can't sign up?**
- Check: Is their email in staff_members with approved=TRUE?
- Fix: Add them via Settings page, or manually in Supabase

**Settings page not loading?**
- Check: Are you signed in?
- Check: Is your role set to "super_admin" in Supabase?
- Fix: Verify in Supabase → staff_members table

**Stories not showing?**
- Check: Is public submission working? (Try /submit page)
- Check: Do stories exist in Supabase → stories table?

---

## Key Data

### Staff Members Table (Supabase)
Table: `public.staff_members`
Columns: `id, email, role, approved, created_at`

### Stories Table (Supabase)
Table: `public.stories`
Columns: `id, submitter_id, overview, summary, status, ...`

### Profiles Table (Supabase)
Table: `public.profiles`
Columns: `id, email, full_name, role, ...`

---

## Common Roles & Permissions

- **super_admin**: Full access, can manage all staff
- **editor**: Can submit, view, and edit stories; see dashboard
- **reviewer**: Can submit and view; read-only on stories
- **viewer**: Can submit and view; no editing access

---

## Important Notes

✅ Auto-deploy: Just push to GitHub main branch → Vercel deploys automatically

⚠️ Environment Variables: Already set in `.env.production` file in the repo

📧 Email Confirmation: When staff signs up, they'll get confirmation email; must click link to activate

🔐 Security: All database access is protected with RLS (Row Level Security) policies

---

## Getting Help

1. Check DEPLOYMENT_SUMMARY.md for full documentation
2. Check browser console (F12) for error messages
3. Check Supabase logs for database errors
4. Check Vercel logs for deployment issues

---

**Last Updated**: 2026-11-11  
**System Status**: ✅ Live and working
