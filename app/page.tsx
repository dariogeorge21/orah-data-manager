import { redirect } from 'next/navigation';

export default function Home() {
  // Middleware handles the logic of redirecting to /dashboard if logged in,
  // or /login if not logged in. We can just default to redirecting to /dashboard
  // here because if they hit this page, middleware either let them through (meaning 
  // they aren't logged in, wait, middleware redirects `/` to `/dashboard` if logged in.
  // Actually, middleware redirects `/` to `/dashboard` if logged in, but if NOT logged in,
  // it might let them hit `/`. We should redirect them to `/login` if they hit here.
  redirect('/login');
}
