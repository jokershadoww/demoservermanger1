 'use client';
 
 import { useState } from 'react';
 import { useActionState } from 'react';
 import { updateCodeAction } from '@/app/actions/activation-admin';
 import { Edit, X } from 'lucide-react';
 
 export default function EditCodeButton({
   code,
   buyerName,
   contact,
   durationMonths,
   status,
 }: {
   code: string;
   buyerName?: string;
   contact?: string;
   durationMonths?: number;
   status?: 'active' | 'blocked' | 'suspended';
 }) {
   const [open, setOpen] = useState(false);
   const [state, formAction, pending] = useActionState(updateCodeAction, null);
 
   return (
     <>
       <button
         type="button"
         onClick={() => setOpen(true)}
         className="ml-2 inline-flex items-center justify-center rounded-md border border-white/10 px-2 py-1 text-xs text-zinc-300 hover:bg-white/10"
         aria-label="تعديل"
         title="تعديل"
       >
         <Edit className="w-4 h-4" />
       </button>
 
       {open && (
         <div className="fixed inset-0 z-50 flex items-center justify-center">
           <div
             className="absolute inset-0 bg-black/60"
             onClick={() => !pending && setOpen(false)}
           />
           <div className="relative z-10 w-full max-w-md rounded-2xl bg-zinc-900/90 border border-white/10 p-5">
             <div className="flex items-center justify-between mb-3">
               <h3 className="text-lg font-bold text-white">تعديل الكود</h3>
               <button
                 type="button"
                 onClick={() => !pending && setOpen(false)}
                 className="inline-flex items-center justify-center rounded-md border border-white/10 px-2 py-1 text-xs text-zinc-300 hover:bg-white/10"
                 aria-label="إغلاق"
                 title="إغلاق"
               >
                 <X className="w-4 h-4" />
               </button>
             </div>
 
             <form action={formAction} className="space-y-3">
               <input type="hidden" name="code" value={code} />
               <div className="space-y-1">
                 <label className="text-sm text-zinc-300">اسم المشتري</label>
                 <input
                   name="buyerName"
                   defaultValue={buyerName || ''}
                   className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-white placeholder:text-zinc-500"
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-sm text-zinc-300">وسيلة التواصل</label>
                 <input
                   name="contact"
                   defaultValue={contact || ''}
                   className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-white placeholder:text-zinc-500"
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-sm text-zinc-300">المدة (أشهر)</label>
                 <input
                   name="duration"
                   type="number"
                   min={1}
                   max={24}
                   defaultValue={durationMonths || 1}
                   className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-white"
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-sm text-zinc-300">الحالة</label>
                 <select
                   name="status"
                   defaultValue={status || 'active'}
                   className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-white"
                 >
                   <option value="active">نشط</option>
                   <option value="suspended">موقوف مؤقتًا</option>
                   <option value="blocked">محظور</option>
                 </select>
               </div>
 
               {state?.error && (
                 <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                   {state.error}
                 </div>
               )}
 
               <div className="flex items-center justify-end gap-2 pt-2">
                 <button
                   type="button"
                   onClick={() => !pending && setOpen(false)}
                   className="px-3 py-2 rounded-md bg-zinc-700 text-white hover:bg-zinc-800"
                 >
                   إلغاء
                 </button>
                 <button
                   type="submit"
                   disabled={pending}
                   className={`px-3 py-2 rounded-md bg-blue-600 text-white ${pending ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                 >
                   حفظ
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}
     </>
   );
 }
