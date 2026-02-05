import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCode } from '@/lib/activationRepo';

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const activationCode = cookieStore.get('activation_code')?.value;
  const activationEnd = cookieStore.get('activation_end')?.value;

  if (!activationCode || !activationEnd) {
    redirect('/activation');
  }

  const now = new Date();
  const endDate = new Date(activationEnd);
  if (isNaN(endDate.getTime()) || endDate.getTime() <= now.getTime()) {
    redirect('/activation');
  }

  try {
    const data = await getCode(activationCode);
    if (!data) {
      redirect('/activation');
    }
    const status = (data as any).status as string;
    const dbEnd = (data as any).endAt?.toDate ? (data as any).endAt.toDate() : new Date((data as any).endAt);
    const effectiveEnd = isNaN(dbEnd?.getTime?.() || NaN) ? endDate : dbEnd;

    if (status === 'blocked' || status === 'suspended' || effectiveEnd.getTime() <= now.getTime()) {
      redirect('/activation');
    }
  } catch {
    redirect('/activation');
  }

  return children as any;
}
