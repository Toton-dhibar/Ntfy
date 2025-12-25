import { Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  // Get the backend URL from environment or default to the existing one
  const backendUrl = Netlify.env.get("VLESS_BACKEND") || "http://ad.sdbuild.me/vless-xhttp";
  
  // Create the target URL
  const target = new URL(backendUrl);

  // We are proxying, so we want to forward the request method, headers, and body
  // Note: For VLESS XHTTP, proper header forwarding is crucial.
  
  const headers = new Headers(request.headers);
  // Ensure the Host header matches the backend
  headers.set("Host", target.host);
  // Add X-Forwarded headers for the backend to know the real client IP
  const clientIp = context.ip || "0.0.0.0";
  headers.set("X-Forwarded-For", clientIp);
  headers.set("X-Real-IP", clientIp);
  headers.set("X-Forwarded-Proto", "https");
  headers.set("X-Forwarded-Host", request.headers.get("Host") || "");
  
  // XHTTP uses standard HTTP requests, so we can just fetch
  try {
    const response = await fetch(target.toString(), {
      method: request.method,
      headers: headers,
      body: request.body,
      redirect: "manual", // Let the client handle redirects if any
      // @ts-ignore: duplex is needed for streaming bodies in some Deno envs
      duplex: "half", 
    });

    // Return the response to the client
    // We recreate the response to ensure we have full control over headers if needed
    // but usually passing the response directly is fine.
    return response;
  } catch (err) {
    console.error("Proxy error:", err);
    return new Response("Proxy Error", { status: 502 });
  }
};

export const config = {
  path: "/vless-xhttp",
  cache: "manual",
};
