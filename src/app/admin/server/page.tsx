import CoordinatorServerInfo from '@/components/server/CoordinatorServerInfo';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { activationDbReady, activationProjectId } from '@/lib/firebase';
import { getCode } from '@/lib/activationRepo';

export default async function AdminServerPage({ searchParams }: { searchParams?: Promise<{ page?: string }> }) {
  const sp = searchParams ? await searchParams : undefined;
  const pageParam = sp?.page || '1';
  const page = Math.max(1, parseInt(pageParam, 10) || 1);

  const cookieStore = await cookies();
  const activationCode = cookieStore.get('activation_code')?.value || '';
  const activationEndIso = cookieStore.get('activation_end')?.value || '';
  const now = new Date();
  const cookieEnd = activationEndIso ? new Date(activationEndIso) : null;

  let codeDoc: any = null;
  let effectiveEnd: Date | null = cookieEnd;
  let status: string | null = null;
  try {
    if (activationCode) {
      codeDoc = await getCode(activationCode);
      if (codeDoc?.endAt?.toDate) {
        effectiveEnd = codeDoc.endAt.toDate() as Date;
      } else if (codeDoc?.endAt) {
        effectiveEnd = new Date(codeDoc.endAt as string);
      }
      status = codeDoc?.status || null;
    }
  } catch {
    // ignore repo errors (missing credentials etc.)
  }

  const remainingMs = effectiveEnd ? Math.max(0, effectiveEnd.getTime() - now.getTime()) : 0;
  const remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
  const isExpired = effectiveEnd ? effectiveEnd.getTime() <= now.getTime() : true;

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-secondary/30 border border-border">
        <h1 className="text-2xl font-bold mb-2">حالة السيرفر</h1>
        <p className="text-muted-foreground">هذه الصفحة تستعرض كامل معلومات السيرفر الخاصة بالمنسق</p>
      </div>

      <div className="p-6 rounded-2xl bg-secondary/30 border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">التفعيل</h2>
            <p className="text-muted-foreground text-sm">إدارة حالة تفعيل الموقع وربط قاعدة أكواد التفعيل</p>
          </div>
          <div className="flex gap-2">
            <Link href="/activation" className="px-3 py-2 rounded-lg border border-border hover:bg-secondary text-sm">
              إعادة التفعيل
            </Link>
            <Link href="/activation-admin" className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90">
              إدارة أكواد التفعيل
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-background/50 border border-border">
            <p className="text-xs text-muted-foreground mb-1">حالة القاعدة</p>
            <p className={`text-sm font-bold ${activationDbReady ? 'text-emerald-500' : 'text-red-500'}`}>
              {activationDbReady ? 'متصلة' : 'غير متصلة'}
            </p>
            <p className="text-xs text-muted-foreground mt-2 break-all">Project: {activationProjectId || 'غير محدد'}</p>
          </div>

          <div className="p-4 rounded-xl bg-background/50 border border-border">
            <p className="text-xs text-muted-foreground mb-1">كود التفعيل الحالي</p>
            <p className="text-sm font-bold">{activationCode ? activationCode : 'لا يوجد'}</p>
            {status && <p className="text-xs mt-2">{status === 'active' ? 'نشط' : status === 'suspended' ? 'موقوف مؤقتًا' : status === 'blocked' ? 'محظور' : status}</p>}
          </div>

          <div className="p-4 rounded-xl bg-background/50 border border-border">
            <p className="text-xs text-muted-foreground mb-1">تاريخ الانتهاء</p>
            <p className={`text-sm font-bold ${isExpired ? 'text-red-500' : 'text-foreground'}`}>
              {effectiveEnd ? new Date(effectiveEnd).toLocaleString('ar-EG') : 'غير متاح'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-background/50 border border-border">
            <p className="text-xs text-muted-foreground mb-1">الأيام المتبقية</p>
            <p className={`text-sm font-bold ${isExpired ? 'text-red-500' : 'text-emerald-500'}`}>
              {effectiveEnd ? (isExpired ? 'منتهي' : `${remainingDays} يوم`) : 'غير متاح'}
            </p>
          </div>
        </div>

        {codeDoc && (
          <div className="rounded-xl border border-border p-4 bg-background/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">اسم المشتري</p>
                <p className="font-medium">{codeDoc.buyerName || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">وسيلة التواصل</p>
                <p className="font-medium">{codeDoc.contact || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">مدة الاشتراك</p>
                <p className="font-medium">{typeof codeDoc.durationMonths === 'number' ? `${codeDoc.durationMonths} شهر` : '-'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <CoordinatorServerInfo page={page} />
    </div>
  );
}
