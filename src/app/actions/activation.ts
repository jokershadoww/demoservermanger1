'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCode } from '@/lib/activationRepo';
import { activationDbReady } from '@/lib/firebase';
import { enableAllNonAdminBulk, disableAllNonAdminBulk } from './members';

type ActivationDoc = {
  buyerName: string;
  contact: string;
  durationMonths: number;
  startAt: FirebaseFirestore.Timestamp;
  endAt: FirebaseFirestore.Timestamp;
  status: 'active' | 'blocked' | 'suspended';
  createdAt: FirebaseFirestore.Timestamp;
};

export async function verifyActivationAction(prevState: any, formData: FormData) {
  const code = (formData.get('code') as string)?.trim();

  if (!code) {
    return { error: 'يرجى إدخال كود التفعيل' };
  }

  try {
    const data = await getCode(code);
    if (!data) return { error: 'كود التفعيل غير صحيح' };
    const now = new Date();
    const endDate = (data as any).endAt?.toDate ? (data as any).endAt.toDate() : new Date((data as any).endAt);

    if (data.status === 'blocked') return { error: 'هذا الكود محظور' };
    if (data.status === 'suspended') return { error: 'هذا الكود موقوف مؤقتًا' };
    if (endDate.getTime() <= now.getTime()) {
      return { error: 'انتهت صلاحية كود التفعيل' };
    }

    const cookieStore = await cookies();
    cookieStore.set('activation_code', code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: Math.floor((endDate.getTime() - now.getTime()) / 1000),
      path: '/',
    });
    cookieStore.set('activation_end', endDate.toISOString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: Math.floor((endDate.getTime() - now.getTime()) / 1000),
      path: '/',
    });

    await enableAllNonAdminBulk();
    redirect('/login?activated=1');
  } catch (e) {
    console.error('Activation verify error:', e);
    if (!activationDbReady) {
      return { error: 'تعذر الاتصال بقاعدة التفعيل. تأكد من ضبط مفاتيح فايربيز الخاصة بالتفعيل.' };
    }
    return { error: 'حدث خطأ أثناء التحقق من الكود' };
  }
}

export async function getActivationStatusForAdmin() {
  const cookieStore = await cookies();
  const code = cookieStore.get('activation_code')?.value;
  const endIso = cookieStore.get('activation_end')?.value;
  const now = new Date();
  if (!code || !endIso) {
    await disableAllNonAdminBulk();
    return { active: false };
  }
  try {
    const data = await getCode(code);
    const endDate = (data as any)?.endAt?.toDate ? (data as any).endAt.toDate() : new Date((data as any)?.endAt || endIso);
    const status = (data as any)?.status || 'active';
    const active = !!data && status === 'active' && endDate.getTime() > now.getTime();
    if (!active) {
      await disableAllNonAdminBulk();
    }
    return { active, endAt: endDate.toISOString(), status };
  } catch {
    return { active: false };
  }
}
