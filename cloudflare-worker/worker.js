/**
 * Visit Counter — Cloudflare Worker
 *
 * SETUP:
 * 1. Tạo KV namespace tên "VISITS" trong Cloudflare dashboard
 * 2. Deploy worker này, bind KV namespace với biến VISITS
 * 3. (Tuỳ chọn) Thêm custom route: cryss.info/api/visits -> worker này
 *
 * KV binding name: VISITS
 */

const ALLOWED_ORIGINS = [
  'https://cryss.info',
  'https://www.cryss.info',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://127.0.0.1:3000',
  'http://localhost:3000',
];

function getAllowedOrigin(request) {
  const origin = request.headers.get('Origin') || '';
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  // Allow requests with no Origin header (direct browser open / local file)
  if (!origin) return '*';
  return null;
}
const KV_KEY = 'total';

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return corsResponse(request, null, 204);
    }

    // Chỉ cho phép GET
    if (request.method !== 'GET') {
      return corsResponse(request, JSON.stringify({ error: 'Method not allowed' }), 405);
    }

    const url = new URL(request.url);

    // GET /visits  — chỉ đọc, không tăng (dùng để check)
    // GET /visits/up — tăng 1 rồi trả về
    const increment = url.pathname.endsWith('/up');

    // Đọc giá trị hiện tại
    let count = parseInt(await env.VISITS.get(KV_KEY)) || 0;

    if (increment) {
      count += 1;
      // Ghi lại (không await để phản hồi nhanh hơn)
      env.VISITS.put(KV_KEY, String(count));
    }

    return corsResponse(request, JSON.stringify({ count }), 200);
  },
};

function corsResponse(request, body, status) {
  const origin = getAllowedOrigin(request);
  if (!origin) {
    return new Response('Forbidden', { status: 403 });
  }
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store',
  };
  return new Response(body, { status, headers });
}
