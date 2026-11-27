import { test as base, expect } from '@playwright/test';
import { loginAs, createJob } from './api';
import { USERS } from './users';
type AuthHeaders = { Authorization: string };
type Job = { id: number; title: string; company: string };
export const test = base.extend<{ employer: AuthHeaders; jobseeker: AuthHeaders; makeJob: (overrides?: object) => Promise<Job> }>({
  employer: async ({ request }, use) => { await use(await loginAs(request, USERS.employer.email)); },
  jobseeker: async ({ request }, use) => { await use(await loginAs(request, USERS.jobseeker.email)); },
  makeJob: async ({ request, employer }, use) => {
    const ids: number[] = [];
    await use(async (overrides = {}) => {
      const job = await createJob(request, employer, overrides);
      ids.push(job.id);
      return job;
    });
    for (const id of ids) await request.delete(`/api/jobs/${id}`, { headers: employer });
  }
});
export { expect };