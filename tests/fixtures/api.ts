import { APIRequestContext, expect } from '@playwright/test';
import { PASSWORD } from './users';
import { newUser, newJob } from './data';
export async function getToken(request: APIRequestContext, email: string, password: string = PASSWORD) {
  const res = await request.post('/api/auth/login', { data: { email, password } });
  const body = await res.json();
  return body.token as string;
}
export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
export async function createUser(request: APIRequestContext, role: string = 'jobseeker') {
  const user = newUser(role);
  const res = await request.post('/api/auth/register', { data: user });
  expect(res.status()).toBe(201);
  return user;
}
export async function loginAs(request: APIRequestContext, email: string) {
  return authHeader(await getToken(request, email));
}
export async function createJob(request: APIRequestContext, headers: { Authorization: string }, overrides: object = {}) {
  const res = await request.post('/api/jobs', { headers, data: newJob(overrides) });
  expect(res.status()).toBe(201);
  return (await res.json()).job;
}