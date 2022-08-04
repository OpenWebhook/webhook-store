import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const res = http.post(
    'https://k6.webhook.store/simple-payload',
    JSON.stringify({ simple: 'payload' }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
  check(res.status, 201);
}
