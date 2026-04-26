import { verifySession } from '@/lib/auth-server';
import DashboardClient from './client';

export default async function DashboardPage() {
  const session = await verifySession();

  return <DashboardClient />;
}
