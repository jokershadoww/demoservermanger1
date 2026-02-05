'use client';

import { useActionState, useMemo, useState } from 'react';
import { createCodeAction } from '@/app/actions/activation-admin';
import CopyCodeButton from './CopyCodeButton';
import { useRouter } from 'next/navigation';

interface Props {
  activationReady: boolean;
  activationProjectId: string;
}

export default function CodeCreator({ activationReady, activationProjectId }: Props) {
  const [state, action, pending] = useActionState(createCodeAction, null);
  const [months, setMonths] = useState<number>(1);
  const router = useRouter();

  const endPreview = useMemo(() => {
    const start = new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + months);
    return end.toLocaleDateString();
  }, [months]);

  return (
    <div className="space-y-6">
      {!activationReady && (
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-sm leading-relaxed">
          قاعدة التفعيل ({activationProjectId || 'غير محدد'}) غير متصلة. لن يتم الحفظ في فايربيز 2 حتى يتم ضبط مفاتيح الخدمة.
        </div>
      )}

      <form action={action} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="space-y-1">
          <label className="text-sm text-zinc-300 tracking-wide">اسم المشتري</label>
          <input name="buyerName" className="w-full bg-black/50 border border-white/10 rounded-lg py-3 px-4 text-white placeholder:text-zinc-500" required />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-zinc-300 tracking-wide">المدة (بالأشهر)</label>
          <select
            name="duration"
            value={months}
            onChange={(e) => setMonths(parseInt(e.target.value, 10))}
            className="w-full bg-black/50 border border-white/10 rounded-lg py-3 px-4 text-white"
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-zinc-400 tracking-wide">ينتهي في: {endPreview}</p>
        </div>
        <div className="space-y-1">
          <label className="text-sm text-zinc-300 tracking-wide">وسيلة التواصل</label>
          <input name="contact" className="w-full bg-black/50 border border-white/10 rounded-lg py-3 px-4 text-white placeholder:text-zinc-500" required />
        </div>
        <button
          type="submit"
          disabled={pending || !activationReady}
          className={`bg-primary text-white font-bold py-3 rounded-lg ${pending || !activationReady ? 'opacity-60 cursor-not-allowed' : 'hover:bg-primary/90'}`}
        >
          {pending ? 'جارِ الإنشاء...' : 'إنشاء كود'}
        </button>
      </form>

      {state?.error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm leading-relaxed">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="p-5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold tracking-wide">تم إنشاء الكود بنجاح</p>
              <p className="text-sm text-zinc-300 leading-relaxed">انتهاء الصلاحية: {new Date(state.endAt).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-white tracking-wide">{state.code}</span>
              <CopyCodeButton code={state.code} />
            </div>
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => { router.push(`/admin/activation?code=${state.code}`); }}
              className="px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
            >
              إرسال الكود إلى صفحة تفعيل الأدمن
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
