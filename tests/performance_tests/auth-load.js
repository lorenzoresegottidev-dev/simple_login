import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
  vus: 10,
  duration: '15s',
};

export default function authLoad() {
  const response = http.get(`${__ENV.BASE_URL || 'http://127.0.0.1:3000'}/api/health`);

  check(response, {
    'health endpoint responds with 200': (result) => result.status === 200,
    'health endpoint returns ok': (result) => result.json('status') === 'ok',
  });
  sleep(1);
}