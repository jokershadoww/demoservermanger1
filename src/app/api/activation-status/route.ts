import { NextResponse } from 'next/server';
import { getActivationStatusForAdmin } from '@/app/actions/activation';

export async function GET() {
  const status = await getActivationStatusForAdmin();
  return NextResponse.json(status);
}
