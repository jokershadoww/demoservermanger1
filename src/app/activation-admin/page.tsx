import { listCodes } from '@/lib/activationRepo';
import { setCodeStatusAction, deleteCodeAction, updateCodeAction, extendCodeAction } from '@/app/actions/activation-admin';
import React from 'react';
import CodeCreator from './CodeCreator';
import CopyCodeButton from './CopyCodeButton';
import EditCodeButton from './EditCodeButton';
import { activationDbReady, activationProjectId } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

async function getCodes() {
  const rows = await listCodes();
  return rows;
}

async function setStatus(formData: FormData) {
  'use server';
  await setCodeStatusAction(null as any, formData);
}

async function removeCode(formData: FormData) {
  'use server';
  await deleteCodeAction(null as any, formData);
}

async function applyUpdate(formData: FormData) {
  'use server';
  await updateCodeAction(null as any, formData);
}

async function extend(formData: FormData) {
  'use server';
  await extendCodeAction(null as any, formData);
}

export default async function ActivationAdminPage() {
  const codes = await getCodes();
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-zinc-900 to-black p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">حالة ربط قاعدة التفعيل</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">المشروع: {activationProjectId || 'غير محدد'}</p>
            </div>
            <span className={`px-3 py-1 rounded-md text-sm ${activationDbReady ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
              {activationDbReady ? 'متصل' : 'غير متصل'}
            </span>
          </div>
          {!activationDbReady && (
            <div className="mt-3 text-zinc-300 text-sm leading-relaxed">
              لم يتم تهيئة قاعدة التفعيل. سيتم استخدام القاعدة الأساسية كبديل. فضلاً تأكد من ضبط متغيرات البيئة الخاصة بقاعدة التفعيل.
            </div>
          )}
        </div>
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 space-y-4">
          <h1 className="text-2xl font-extrabold text-white tracking-wide">إنشاء كود تفعيل</h1>
          <CodeCreator activationReady={activationDbReady} activationProjectId={activationProjectId} />
        </div>

        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-white tracking-wide">الأكواد</h2>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm text-white">
              <thead>
                <tr className="bg-black/30 text-zinc-300 tracking-wide">
                  <th className="text-right px-4 py-2">الكود</th>
                  <th className="text-right px-4 py-2">الاسم</th>
                  <th className="text-right px-4 py-2">التواصل</th>
                  <th className="text-right px-4 py-2">المدة</th>
                  <th className="text-right px-4 py-2">النهاية</th>
                  <th className="text-right px-4 py-2">الحالة</th>
                  <th className="text-right px-4 py-2">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {codes.map((c: any) => {
                  const end = c.endAt?.toDate ? c.endAt.toDate() : new Date(c.endAt);
                  return (
                    <tr key={c.id} className="odd:bg-zinc-900/30 even:bg-zinc-900/50 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-white">{c.id}</span>
                        {React.createElement(CopyCodeButton, { code: c.id })}
                        <span className={`ml-2 inline-flex items-center rounded-md px-2 py-0.5 text-xs ${
                          c.status === 'active'
                            ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-600/30'
                            : c.status === 'suspended'
                            ? 'bg-yellow-600/20 text-yellow-300 border border-yellow-600/30'
                            : 'bg-red-600/20 text-red-300 border border-red-600/30'
                        }`}>
                          {c.status === 'active' ? 'نشط' : c.status === 'suspended' ? 'موقوف' : 'محظور'}
                        </span>
                        {React.createElement(EditCodeButton, {
                          code: c.id,
                          buyerName: c.buyerName,
                          contact: c.contact,
                          durationMonths: c.durationMonths,
                          status: c.status,
                        })}
                      </td>
                      <td className="px-4 py-3 text-zinc-200">{c.buyerName}</td>
                      <td className="px-4 py-3 text-zinc-200">{c.contact}</td>
                      <td className="px-4 py-3 text-zinc-200">{c.durationMonths}</td>
                      <td className="px-4 py-3 text-zinc-200">{end.toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-zinc-200">{c.status}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <form action={setStatus}>
                            <input type="hidden" name="code" value={c.id} />
                            <input type="hidden" name="status" value="active" />
                            <button className="px-3 py-1 rounded-md bg-green-600 text-white hover:bg-green-700">تفعيل</button>
                          </form>
                          <form action={setStatus}>
                            <input type="hidden" name="code" value={c.id} />
                            <input type="hidden" name="status" value="suspended" />
                            <button className="px-3 py-1 rounded-md bg-yellow-600 text-white hover:bg-yellow-700">إيقاف مؤقت</button>
                          </form>
                          <form action={setStatus}>
                            <input type="hidden" name="code" value={c.id} />
                            <input type="hidden" name="status" value="blocked" />
                            <button className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700">حظر</button>
                          </form>
                          <form action={removeCode}>
                            <input type="hidden" name="code" value={c.id} />
                            <button className="px-3 py-1 rounded-md bg-zinc-700 text-white hover:bg-zinc-800">حذف</button>
                          </form>
                          <form action={applyUpdate} className="flex flex-wrap gap-2 mt-2">
                            <input type="hidden" name="code" value={c.id} />
                            <input name="buyerName" placeholder="اسم جديد" className="px-3 py-2 rounded-md bg-black/50 border border-white/10 text-white placeholder:text-zinc-500" />
                            <input name="contact" placeholder="تواصل جديد" className="px-3 py-2 rounded-md bg-black/50 border border-white/10 text-white placeholder:text-zinc-500" />
                            <input name="duration" placeholder="مدة جديدة" className="px-3 py-2 rounded-md bg-black/50 border border-white/10 text-white w-28 placeholder:text-zinc-500" />
                            <button className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">تحديث</button>
                          </form>
                          <form action={extend} className="flex items-center gap-2 mt-2">
                            <input type="hidden" name="code" value={c.id} />
                            <input
                              name="monthsDelta"
                              type="number"
                              min={1}
                              max={24}
                              defaultValue={1}
                              className="px-3 py-2 rounded-md bg-black/50 border border-white/10 text-white w-28 placeholder:text-zinc-500"
                            />
                            <button className="px-3 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700">تمديد</button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
