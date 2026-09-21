import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { GET } from '../../src/app/api/health/route';

const server = createServer(async (_request, response) => {
  const result = await GET();
  response.statusCode = result.status;
  response.setHeader('content-type', 'application/json');
  response.end(await result.text());
});

let baseUrl = '';

beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

describe('health API', () => {
  it('returns a healthy JSON response', async () => {
    const response = await request(baseUrl).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});