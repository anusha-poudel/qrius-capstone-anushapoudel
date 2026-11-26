import { test, expect } from '@playwright/test';
import { USERS } from '../fixtures/users';
import { getToken, authHeader, createUser } from '../fixtures/api';
import { newUser } from '../fixtures/data';

test.describe('Auth API', () => {
    test('TC_API_02 register jobseeker returns 201 and a working token', async ({ request }) => {
    const user = newUser('jobseeker');
    const res = await request.post('/api/auth/register', { data: user });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.user.email).toBe(user.email);
    expect(body.user.role).toBe('jobseeker');
    expect(body.user.password).toBeUndefined();
    expect(body.token).toBeTruthy();
    const me = await request.get('/api/auth/me', { headers: authHeader(body.token) });
    expect(me.status()).toBe(200);
    expect((await me.json()).email).toBe(user.email);
 });
  test('TC_API_03 register without email returns 400', async ({ request }) => {
    const { email, ...userWithoutEmail } = newUser();
    const res = await request.post('/api/auth/register', {data: userWithoutEmail,});
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
    expect(body.token).toBeUndefined();
  });
  test('TC_API_04 register as admin returns 400 and creates no account', async ({ request }) => {
    const user = newUser('admin');
    const res = await request.post('/api/auth/register', { data: user });
    expect(res.status()).toBe(400);
    const login = await request.post('/api/auth/login', { data: { email: user.email, password: user.password } });
    expect(login.status()).toBe(401);
  });
  test('TC_API_05 duplicate email returns 409 and the original account still works', async ({ request }) => {
    const user = await createUser(request);
    const second = await request.post('/api/auth/register', { data: { ...user, full_name: 'Someone Else' } });
    expect(second.status()).toBe(409);
    const login = await request.post('/api/auth/login', { data: { email: user.email, password: user.password } });
    expect(login.status()).toBe(200);
  });
  test('TC_API_06 login with valid credentials returns a working token', async ({ request }) => {
    const user = await createUser(request);
    const res = await request.post('/api/auth/login', { data: { email: user.email, password: user.password } });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.user.email).toBe(user.email);
    expect(body.user.role).toBe('jobseeker');
    expect(body.user.password).toBeUndefined();
    const me = await request.get('/api/auth/me', { headers: authHeader(body.token) });
    expect(me.status()).toBe(200);
  });
  test('TC_API_07 login with wrong password returns 401 and no token', async ({ request }) => {
    const user = await createUser(request);
    const res = await request.post('/api/auth/login', { data: { email: user.email, password: 'Wrong@999' } });
    expect(res.status()).toBe(401);
    expect((await res.json()).token).toBeUndefined();
  });
  test('TC_API_08 login with unknown email returns 401 and no token', async ({ request }) => {
    const user = newUser();
    const res = await request.post('/api/auth/login', { data: { email: user.email, password: user.password } });
    expect(res.status()).toBe(401);
    expect((await res.json()).token).toBeUndefined();
  });
  test('TC_API_09 login without password returns 400 and no token', async ({ request }) => {
    const user = await createUser(request);
    const res = await request.post('/api/auth/login', { data: { email: user.email } });
    expect(res.status()).toBe(400);
    expect((await res.json()).token).toBeUndefined();
  });
  test('TC_API_10 me returns the current user without the password', async ({ request }) => {
    const token = await getToken(request, USERS.employer.email);
    const res = await request.get('/api/auth/me', { headers: authHeader(token) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.email).toBe(USERS.employer.email);
    expect(body.role).toBe('employer');
    expect(body.password).toBeUndefined();
  });
  test('TC_API_11 me without token returns 401 and no user data', async ({ request }) => {
    const res = await request.get('/api/auth/me');
    expect(res.status()).toBe(401);
    expect((await res.json()).email).toBeUndefined();
  });
  // This app returns 401 for a missing token but 403 for an invalid one
  test('TC_API_12 me with invalid token returns 403 and no user data', async ({ request }) => {
    const res = await request.get('/api/auth/me', { headers: authHeader('not.a.real.token') });
    expect(res.status()).toBe(403);
    expect((await res.json()).email).toBeUndefined();
  });
});