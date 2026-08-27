# TechshiftCrea private submissions dashboard

This package keeps brand and creator submissions private from each other. Visitors only see the public forms. Submissions go to Cloudflare D1, and you can view them at `/admin.html` after signing in. Email notifications are sent to the configured `NOTIFY_EMAIL` through Resend.

## Cloudflare setup
1. Create a D1 database named `techshiftcrea` in Cloudflare.
2. Run `schema.sql` in that database.
3. In your Pages project, add the D1 binding named `DB` pointing to that database.
4. In Pages Settings → Variables and Secrets, add:
   - `ADMIN_PASSWORD` = a strong password only you know
   - `ADMIN_SECRET` = a long random secret
   - `RESEND_API_KEY` = your Resend API key (for email notifications)
   - `NOTIFY_EMAIL` = `techshift431@gmail.com`
   - `FROM_EMAIL` = a verified sender such as `TechshiftCrea <hello@yourdomain.com>`
5. Deploy the project as a Pages deployment with the `functions/` folder included.
6. Open `https://techshift-creators.pages.dev/admin.html` and sign in.

## Important privacy note
Brands and creators do not receive a list of submissions or see one another's data. The public site never displays D1 records. Only the admin API returns submissions after the private admin login succeeds.

## Email note
Resend requires a verified sending identity for normal production sending. If you do not have a custom domain, use Resend's permitted test sender only for initial testing. The database still stores submissions even if email delivery is not configured.
