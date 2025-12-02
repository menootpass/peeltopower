# Cloudflare R2 Storage Setup Guide

## Prerequisites

1. Cloudflare account
2. R2 bucket created in Cloudflare dashboard
3. API tokens with R2 permissions

## Setup Steps

### 1. Create R2 Bucket

1. Go to Cloudflare Dashboard → R2
2. Click "Create bucket"
3. Enter bucket name (e.g., `peeltofuel-storage`)
4. Choose location
5. Click "Create bucket"

### 2. Get R2 Credentials

1. Go to Cloudflare Dashboard → R2 → Manage R2 API Tokens
2. Click "Create API token"
3. Set permissions: **Object Read & Write**
4. Set TTL: **No expiration** (or set expiration date)
5. Click "Create API token"
6. Save the following:
   - **Access Key ID**
   - **Secret Access Key**

### 3. Get R2 Endpoint

Your R2 endpoint follows this pattern:
```
https://<account-id>.r2.cloudflarestorage.com
```

To find your account ID:
1. Go to Cloudflare Dashboard
2. Click on your account name (top right)
3. Your Account ID is displayed there

### 4. Setup Public Access (Optional)

If you want public access to your files:

1. Go to R2 bucket settings
2. Enable "Public Access"
3. Set up Custom Domain (recommended) or use R2.dev subdomain
4. Add CNAME record to your domain pointing to R2 bucket

### 5. Configure Environment Variables

Create `.env.local` file in project root:

```env
# Cloudflare R2 Configuration
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-public-domain.com
```

### 6. Install Dependencies

Dependencies are already installed:
- `@aws-sdk/client-s3`
- `@aws-sdk/s3-request-presigner`

### 7. Test Upload

1. Start development server: `npm run dev`
2. Go to `/admin/new`
3. Upload an image
4. Check R2 bucket to verify file is uploaded

## File Structure in R2

Files are organized in folders:
- `news/images/` - Main article images
- `news/avatars/` - Author avatars
- `uploads/` - General uploads (if using upload endpoint)

## Security Notes

1. **Never commit `.env.local`** to version control
2. Use environment variables for all sensitive data
3. Set up CORS policies in R2 bucket if needed
4. Consider using presigned URLs for temporary access

## Troubleshooting

### Error: "Endpoint not configured"
- Check `R2_ENDPOINT` in `.env.local`
- Ensure endpoint URL is correct

### Error: "Access Denied"
- Check `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`
- Verify API token has correct permissions

### Error: "Bucket not found"
- Check `R2_BUCKET_NAME` matches your bucket name exactly
- Ensure bucket exists in your Cloudflare account

### Files uploaded but not accessible
- Check `R2_PUBLIC_URL` is correct
- Verify public access is enabled in bucket settings
- Check CORS settings if accessing from browser


