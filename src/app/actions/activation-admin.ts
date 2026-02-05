'use server';

import { cookies } from 'next/headers';
import { listCodes, createCode, updateCode, setStatus, deleteCodeEntry, extendCodeMonths } from '@/lib/activationRepo';
import { revalidatePath } from 'next/cache';

const FIXED_USERNAME = 'omar46';
const FIXED_PASSWORD = '123456omarA';

export async function adminLoginAction(prevState: any, formData: FormData) {
  const username = (formData.get('username') as string)?.trim();
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'يرجى إدخال اسم المستخدم وكلمة المرور' };
  }
  if (username !== FIXED_USERNAME || password !== FIXED_PASSWORD) {
    return { error: 'بيانات الدخول غير صحيحة' };
  }

  const cookieStore = await cookies();
  cookieStore.set('codes_admin_session', 'ok', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 4,
    path: '/',
  });
  return { success: true, redirectTo: '/activation-admin' };
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function generateCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 16; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export async function createCodeAction(prevState: any, formData: FormData) {
  const buyerName = (formData.get('buyerName') as string)?.trim();
  const contact = (formData.get('contact') as string)?.trim();
  const durationStr = (formData.get('duration') as string)?.trim();
  const months = Math.max(1, Math.min(12, Number(durationStr || 1)));

  if (!buyerName) return { error: 'يرجى إدخال اسم المشتري' };
  if (!contact) return { error: 'يرجى إدخال وسيلة التواصل' };

  const code = generateCode();
  const now = new Date();
  const end = addMonths(now, months);
  await createCode({ buyerName, contact, months, startAt: now, endAt: end, code });
  revalidatePath('/activation-admin');

  return { success: true, code, endAt: end.toISOString() };
}

export async function updateCodeAction(prevState: any, formData: FormData) {
  const code = (formData.get('code') as string)?.trim();
  const buyerName = (formData.get('buyerName') as string)?.trim();
  const contact = (formData.get('contact') as string)?.trim();
  const durationStr = (formData.get('duration') as string)?.trim();
  const status = (formData.get('status') as string)?.trim();

  if (!code) return { error: 'يرجى تحديد الكود' };

  const updates: any = {};
  if (buyerName) updates.buyerName = buyerName;
  if (contact) updates.contact = contact;
  if (durationStr) updates.months = Math.max(1, Math.min(12, Number(durationStr)));
  if (status && ['active', 'blocked', 'suspended'].includes(status)) updates.status = status as any;
  await updateCode({ code, ...updates });
  return { success: true };
}

export async function setCodeStatusAction(prevState: any, formData: FormData) {
  const code = (formData.get('code') as string)?.trim();
  const status = (formData.get('status') as string)?.trim();
  if (!code) return { error: 'يرجى تحديد الكود' };
  if (!status || !['active', 'blocked', 'suspended'].includes(status)) {
    return { error: 'حالة غير صالحة' };
  }
  await setStatus(code, status as any);
  return { success: true };
}

export async function deleteCodeAction(prevState: any, formData: FormData) {
  const code = (formData.get('code') as string)?.trim();
  if (!code) return { error: 'يرجى تحديد الكود' };
  await deleteCodeEntry(code);
  return { success: true };
}

export async function extendCodeAction(prevState: any, formData: FormData) {
  const code = (formData.get('code') as string)?.trim();
  const deltaStr = (formData.get('monthsDelta') as string)?.trim();
  const delta = Math.max(1, Math.min(24, Number(deltaStr || 1)));
  if (!code) return { error: 'يرجى تحديد الكود' };
  const res = await extendCodeMonths(code, delta);
  revalidatePath('/activation-admin');
  if (!res) return { error: 'لم يتم العثور على الكود' };
  return { success: true, endAt: res.endAt.toISOString(), durationMonths: res.durationMonths };
}
