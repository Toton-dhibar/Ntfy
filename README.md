# Ntfy

Netlify CDN tunnel configuration for Xray xHTTP (VLESS) backend.

## Configuration

This repository is configured as a pure HTTP reverse proxy using Netlify's redirect feature with `status = 200`.

### Backend
- Origin: `http://ad.sdbuild.me/vless-xhttp`
- Protocol: HTTP (no WebSocket)
- Path: `/vless-xhttp`

### Features
- Pure HTTP proxy (no WebSocket, no protocol upgrades)
- Automatic Host header preservation (`ad.sdbuild.me`)
- Automatic `X-Forwarded-Proto: https` header
- CDN caching and distribution via Netlify

### Deployment

The configuration is in `netlify.toml`:
- Proxy rule forwards `/vless-xhttp` to backend
- Response headers configured for security
- Fallback serves `index.html` for all other routes

### Usage

Point your VLESS client to:
- Address: Your Netlify domain
- Port: 443 (HTTPS)
- Path: `/vless-xhttp`
- Transport: xhttp