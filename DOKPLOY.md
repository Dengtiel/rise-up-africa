# Dokploy Deployment Guide

This guide covers deploying the RiseUp Africa web application as a single service on Dokploy with a custom domain.

## Prerequisites

- Dokploy instance installed and running
- Domain name ready to configure
- Access to your domain's DNS settings
- Docker image built or Dockerfile ready

## Step 1: Prepare Your Application

### Option A: Build and Push Docker Image

1. **Build the Docker image:**
   ```bash
   docker build -f apps/web/Dockerfile \
     --build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
     -t your-registry/riseup-web:latest .
   ```

2. **Push to a registry** (Docker Hub, GitHub Container Registry, etc.):
   ```bash
   docker push your-registry/riseup-web:latest
   ```

### Option B: Use Git Repository (Recommended)

Dokploy can build directly from your Git repository. Ensure your Dockerfile is at `apps/web/Dockerfile` in the repository.

## Step 2: Create Application in Dokploy

1. **Log in to Dokploy** dashboard
2. **Click "New Application"** or "Create Service"
3. **Select deployment method:**
   - **From Git Repository** (recommended):
     - Connect your Git repository
     - Set **Root Directory**: `apps/web`
     - Set **Dockerfile Path**: `Dockerfile` (relative to root directory)
     - Or use **Dockerfile Path**: `apps/web/Dockerfile` (if from repo root)
   
   - **From Docker Image**:
     - Enter your image name: `your-registry/riseup-web:latest`

## Step 3: Configure Build Settings

If deploying from Git:

1. **Build Arguments:**
   - Add build argument: `NEXT_PUBLIC_API_URL`
   - Value: `https://api.yourdomain.com` (or your API URL)

2. **Build Context:**
   - If Dockerfile is at `apps/web/Dockerfile`, you may need to set build context to repository root
   - Dokploy should handle this automatically if you set the correct Dockerfile path

## Step 4: Configure Environment Variables

Add the following environment variables in Dokploy:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Node environment |
| `PORT` | `3000` | Application port (must match container port) |
| `HOSTNAME` | `0.0.0.0` | Bind to all interfaces |
| `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com` | Your API endpoint URL |

**Important:** 
- The `PORT` must be `3000` (as configured in your Dockerfile)
- `NEXT_PUBLIC_API_URL` should be set at build time via build args AND runtime via env var

## Step 5: Configure Container Settings

1. **Container Port:** Set to `3000` (this is what your app listens on)
2. **Health Check:**
   - Path: `/api/health`
   - Port: `3000`
   - Interval: `30s`
   - Timeout: `3s`
   - Start Period: `5s`
   - Retries: `3`

## Step 6: Configure Custom Domain

### 6.1 Add Domain in Dokploy

1. **Navigate to your application** in Dokploy dashboard
2. **Click on "Domains"** tab (or "Domain" section)
3. **Click "Create Domain"** or "Add Domain"
4. **Configure domain settings:**
   - **Host:** Enter your domain (e.g., `www.yourdomain.com` or `yourdomain.com`)
   - **Path:** `/` (root path)
   - **Container Port:** `3000` (must match your app's port)
   - **HTTPS:** Toggle `ON` (enable SSL)
   - **Certificate:** Select `Let's Encrypt` (for automatic SSL)
   - **Force HTTPS:** Enable (redirect HTTP to HTTPS)

5. **Click "Create"** or "Save"

### 6.2 Configure DNS Records

1. **Log in to your domain registrar** (GoDaddy, Namecheap, Cloudflare, etc.)
2. **Navigate to DNS management**
3. **Add an A record:**
   - **Type:** `A`
   - **Name:** `@` (for root domain) or `www` (for www subdomain)
   - **Value:** Your Dokploy server's public IP address
   - **TTL:** `3600` (or default)

   **Example:**
   ```
   Type: A
   Name: @
   Value: 123.45.67.89 (your Dokploy server IP)
   TTL: 3600
   ```

4. **For www subdomain** (if using both):
   ```
   Type: A
   Name: www
   Value: 123.45.67.89 (same IP)
   TTL: 3600
   ```

   **OR use CNAME** (if your registrar supports it):
   ```
   Type: CNAME
   Name: www
   Value: yourdomain.com
   TTL: 3600
   ```

### 6.3 Verify DNS Propagation

1. **Check DNS propagation:**
   ```bash
   # Using dig
   dig yourdomain.com
   dig www.yourdomain.com
   
   # Using nslookup
   nslookup yourdomain.com
   ```

2. **Wait for propagation** (usually 5 minutes to 48 hours, typically 15-30 minutes)

3. **Verify in Dokploy:**
   - Dokploy will automatically request SSL certificate once DNS is propagated
   - Check domain status in Dokploy dashboard
   - Certificate status should show as "Active" or "Valid"

## Step 7: Deploy the Application

1. **Click "Deploy"** or "Save and Deploy" in Dokploy
2. **Monitor the build logs** (if building from Git)
3. **Wait for deployment to complete**
4. **Check application status** - should show as "Running"

## Step 8: Verify Deployment

1. **Check application logs** in Dokploy dashboard
2. **Test health endpoint:**
   ```bash
   curl https://yourdomain.com/api/health
   ```
   Should return HTTP 200

3. **Access your application:**
   - Open browser: `https://yourdomain.com`
   - Should load your Next.js application
   - Check browser console for any API connection errors

## Troubleshooting

### Domain Not Resolving

1. **Check DNS records:**
   ```bash
   dig yourdomain.com +short
   ```
   Should return your Dokploy server IP

2. **Wait longer** - DNS can take up to 48 hours (usually much faster)

3. **Clear DNS cache:**
   ```bash
   # macOS
   sudo dscacheutil -flushcache
   
   # Linux
   sudo systemd-resolve --flush-caches
   
   # Windows
   ipconfig /flushdns
   ```

### SSL Certificate Issues

1. **Check certificate status** in Dokploy dashboard
2. **Verify DNS is pointing correctly** before requesting certificate
3. **Check Let's Encrypt rate limits** - you may need to wait if you've made too many requests
4. **Manually renew certificate** in Dokploy if needed

### Application Not Starting

1. **Check container logs** in Dokploy
2. **Verify environment variables** are set correctly
3. **Check port configuration:**
   - Container port must be `3000`
   - Health check port must be `3000`
4. **Verify build arguments** (especially `NEXT_PUBLIC_API_URL`)

### Health Check Failing

1. **Verify health endpoint exists:**
   - Your Dockerfile expects `/api/health` endpoint
   - Ensure this route exists in your Next.js app

2. **Check health check configuration:**
   - Path: `/api/health`
   - Port: `3000`
   - Allow sufficient start period (5-10 seconds)

### API Connection Issues

1. **Verify `NEXT_PUBLIC_API_URL`:**
   - Must be set at build time (build arg)
   - Can also be set at runtime (env var)
   - Must be accessible from browser (CORS configured)

2. **Check API endpoint:**
   ```bash
   curl https://api.yourdomain.com/health
   ```

3. **Verify CORS settings** on your API server

## Advanced Configuration

### Multiple Domains

You can add multiple domains to the same service:
- `yourdomain.com`
- `www.yourdomain.com`
- `app.yourdomain.com`

Each domain will route to the same container on port 3000.

### Custom SSL Certificate

If you have your own SSL certificate:
1. Upload certificate in Dokploy
2. Select "Custom Certificate" instead of "Let's Encrypt"
3. Provide certificate and private key

### Environment-Specific Deployments

For staging/production:
- Create separate applications in Dokploy
- Use different domains: `staging.yourdomain.com` and `yourdomain.com`
- Configure different environment variables

## Important Notes

1. **Container Port:** Always use `3000` - this is hardcoded in your Dockerfile
2. **Build Args:** `NEXT_PUBLIC_API_URL` must be set during build for Next.js to include it
3. **Runtime Env:** Environment variables prefixed with `NEXT_PUBLIC_` are embedded at build time
4. **Standalone Mode:** Your Next.js app uses standalone output, which is optimized for Docker
5. **Health Checks:** Ensure `/api/health` endpoint exists in your Next.js app

## Quick Reference

**Container Port:** `3000`  
**Health Check Path:** `/api/health`  
**Required Env Vars:**
- `NODE_ENV=production`
- `PORT=3000`
- `HOSTNAME=0.0.0.0`
- `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`

**DNS Record:**
- Type: `A`
- Name: `@` or `www`
- Value: `<Dokploy Server IP>`

---

**Last Updated:** [Current Date]

