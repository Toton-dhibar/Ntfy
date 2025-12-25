// V2Ray xhttp Netlify Proxy Handler
// This Edge Function forwards all requests to the real V2Ray server
export default async function handler(req) {
  try {
    // Target V2Ray server
    const TARGET_HOST = 'ad.sdbuild.me';
    const TARGET_URL = `http://${TARGET_HOST}`;
    
    // Get the full path from Netlify's event object
    // In Netlify Functions, req is an event object
    const url = new URL(req.url);
    const path = req.rawUrl || url.pathname;
    const search = url.search;
    
    // Construct target URL - preserve the full path including /vless-xhttp
    const targetPath = path + search;
    const targetUrl = TARGET_URL + targetPath.replace('/vless-xhttp', '/xhttp');
    
    // Prepare headers - forward most headers but update host
    const headers = new Headers(req.headers);
    headers.set('Host', TARGET_HOST);
    
    // Remove Netlify-specific headers that shouldn't be forwarded
    headers.delete('x-nf-request-id');
    headers.delete('x-forwarded-host');
    headers.delete('x-netlify-edge');
    
    // Prepare fetch options
    const fetchOptions = {
      method: req.httpMethod || req.method,
      headers: headers,
      redirect: 'manual', // Don't follow redirects automatically
    };
    
    // Add body for non-GET/HEAD requests
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = req.body;
    }
    
    // Forward the request to the real V2Ray server
    const response = await fetch(targetUrl, fetchOptions);
    
    // Create response with same status and headers
    const responseHeaders = new Headers(response.headers);
    
    // Remove headers that might cause issues
    responseHeaders.delete('content-encoding'); // Let Netlify handle encoding
    
    // Return the proxied response
    return {
      statusCode: response.status,
      headers: Object.fromEntries(responseHeaders.entries()),
      body: await response.text(),
    };
    
  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Proxy error', 
        message: error.message 
      }),
    };
  }
      }
