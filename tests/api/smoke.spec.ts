import { test, expect } from '@playwright/test';
test('TC_API_01 health check returns healthy', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.status()).toBe(200);
  expect((await res.json()).status).toBe('healthy');
});