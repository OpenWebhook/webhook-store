import http from 'k6/http';
import { check, sleep } from 'k6';

const query = `query {
  webhooks(first: 100) {
    id
  }
}
`;

export default function () {
  const res = http.post(
    'https://k6.dev.webhook.store/graphql',
    JSON.stringify({ query: query }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
  check(res.status, 200);
  const body = JSON.parse(res.body);
  check(body.data.webhooks.length, 100);
  sleep(0.2);
}

export const options = {
  thresholds: {
    // fail the test if 95th percentile response goes above 500ms
    http_req_duration: ['p(95)<1000'],
  },
};
