import { verifySession } from '@/lib/auth-server';
import DashboardClient from './client';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await verifySession();

  return <DashboardClient />;
}
