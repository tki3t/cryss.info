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

const ALLOWED_ORIGIN = 'https://cryss.info';
const KV_KEY = 'total';

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return corsResponse(null, 204);
    }

    // Chỉ cho phép GET
    if (request.method !== 'GET') {
      return corsResponse(JSON.stringify({ error: 'Method not allowed' }), 405);
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

    return corsResponse(JSON.stringify({ count }), 200);
  },
};

function corsResponse(body, status) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store',
  };

  return new Response(body, { status, headers });
}
