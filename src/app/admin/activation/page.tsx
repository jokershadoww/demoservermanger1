'use client';

import { Suspense, useActionState } from 'react';
import { verifyActivationAction } from '@/app/actions/activation';
import { Loader2, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function AdminActivationInner() {
  const [state, formAction, isPending] = useActionState(verifyActivationAction, null);
  const searchParams = useSearchParams();
  const prefill = searchParams.get('code') || '';
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">التفعيل</h1>
          <p className="text-muted-foreground text-sm">استخدم كود التفعيل لتفعيل الموقع</p>
        </div>
        <Link href="/activation" className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm">
          صفحة التفعيل العامة
        </Link>
      </div>

      <div className="p-6 rounded-2xl bg-background/50 border border-border max-w-lg">
        {state?.error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">كود التفعيل</label>
            <div className="relative">
              <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                name="code"
                type="text"
                required
                defaultValue={prefill}
                placeholder="ادخل الكود هنا"
                className="w-full bg-secondary/50 border border-border rounded-lg py-2.5 pr-10 pl-4 focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جارِ التفعيل...
              </>
            ) : (
              'تفعيل الموقع'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminActivationPage() {
  return (
    <Suspense>
      <AdminActivationInner />
    </Suspense>
  );
}
