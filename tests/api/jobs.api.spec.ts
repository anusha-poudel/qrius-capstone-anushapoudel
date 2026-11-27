import { test, expect } from '../fixtures/test';
test.describe('Jobs and applications API', () => {
  test('TC_API_13 employer can create, read, update and delete a job', async ({ request, employer, makeJob }) => {
    const job = await makeJob();
    const read = await request.get(`/api/jobs/${job.id}`);
    expect(read.status()).toBe(200);
    expect(await read.json()).toMatchObject({ id: job.id, title: 'Software Test Engineer' });
    const update = await request.put(`/api/jobs/${job.id}`, { headers: employer, data: { title: 'Senior Test Engineer' } });
    expect(update.status()).toBe(200);
    expect((await update.json()).job).toMatchObject({ id: job.id, title: 'Senior Test Engineer', company: job.company });
    const deleted = await request.delete(`/api/jobs/${job.id}`, { headers: employer });
    expect(deleted.status()).toBe(200);
    expect((await request.get(`/api/jobs/${job.id}`)).status()).toBe(404);
  });
  test('TC_API_14 jobs list supports filter, sort and limit together', async ({ request }) => {
    const res = await request.get('/api/jobs?location=Lalitpur&sort=salary_high&limit=2');
    expect(res.status()).toBe(200);
    const { jobs } = await res.json();
    expect(jobs).toHaveLength(2);
    for (const job of jobs) expect(job.location).toContain('Lalitpur');
    expect(jobs[0].salary_max).toBeGreaterThanOrEqual(jobs[1].salary_max);
  });
  test('TC_API_15 jobseeker applies, sees it in their list and employer updates the status', async ({ request, employer, jobseeker, makeJob }) => {
    const job = await makeJob();
    const me = await (await request.get('/api/auth/me', { headers: jobseeker })).json();
    const apply = await request.post('/api/applications', { headers: jobseeker, data: { job_id: job.id, cover_letter: 'I have 2 years of Playwright experience.' } });
    expect(apply.status()).toBe(201);
    const application = (await apply.json()).application;
    expect(application).toMatchObject({ job_id: job.id, applicant_id: me.id, status: 'pending' });
    const mine = await request.get('/api/applications', { headers: jobseeker });
    expect(mine.status()).toBe(200);
    const list = (await mine.json()).applications;
    expect(list.map((a: { id: number }) => a.id)).toContain(application.id);
    for (const a of list) expect(a.applicant_id).toBe(me.id);
    const again = await request.post('/api/applications', { headers: jobseeker, data: { job_id: job.id } });
    expect(again.status()).toBe(409);
    const update = await request.put(`/api/applications/${application.id}`, { headers: employer, data: { status: 'shortlisted' } });
    expect(update.status()).toBe(200);
    expect((await update.json()).application).toMatchObject({ id: application.id, job_id: job.id, applicant_id: me.id, status: 'shortlisted' });
  });
});