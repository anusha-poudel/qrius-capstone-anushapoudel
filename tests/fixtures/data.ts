export function uniqueEmail() {
  return `sabina.rai${Date.now()}${Math.floor(Math.random() * 1000)}@gmail.com`;
}
export function newUser(role: string = 'jobseeker') {
  return { full_name: 'Sabina Rai', email: uniqueEmail(), password: 'Sabina@2026', phone: '9812345678', role };
}