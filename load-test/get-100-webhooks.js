import http from 'k6/http';
import { check } from 'k6';

const query = `query {
  webhooks(first: 100) {
    id
  }
}
`;

export default function () {
  const res = http.post(
    'https://webhook-store.herokuapp.com/graphql',
    JSON.stringify({ query: query }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
  const body = JSON.parse(res.body);

  check(body.data.webhooks.length, 100);
}
