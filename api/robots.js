export default function handler(req, res) {
  const body = `User-agent: facebookexternalhit
Allow: /

User-agent: Facebot
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

User-agent: *
Allow: /
`;

  const length = Buffer.byteLength(body);

  res.status(206);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Content-Range", `bytes 0-${length - 1}/${length}`);
  res.setHeader("Content-Length", length);
  res.send(body);
}