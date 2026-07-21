import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function EmployerDashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getCurrentSession();
  if (!session || session.role !== 'employer') redirect('/employer/login');
  return children;
}
