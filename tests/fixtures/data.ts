export function uniqueEmail() {
  return `sabina.rai${Date.now()}${Math.floor(Math.random() * 1000)}@gmail.com`;
}
export function newUser(role: string = 'jobseeker') {
  return { full_name: 'Sabina Rai', email: uniqueEmail(), password: 'Sabina@2026', phone: '9812345678', role };
}
export function newJob(overrides: object = {}) {
  return { title: 'Software Test Engineer', company: 'F1Soft International', location: 'Kathmandu', job_type: 'full-time', category: 'Quality Assurance', salary_min: 50000, salary_max: 75000, description: 'Test web and API features of our payment products.', requirements: '2+ years of testing experience. Knowledge of Playwright and SQL.', ...overrides };
}