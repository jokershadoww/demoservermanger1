import { activationAdminDb } from './firebase';

function getActivationDb() {
  if (!activationAdminDb) {
    throw new Error('Activation Firestore not initialized');
  }
  return activationAdminDb;
}

export async function listCodes() {
  const snap = await getActivationDb().collection('activation_codes').orderBy('createdAt', 'desc').get();
  return snap.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => ({ id: d.id, ...d.data() }));
}

export async function getCode(code: string) {
  const snap = await getActivationDb().collection('activation_codes').doc(code).get();
  if (!snap.exists) return null;
  const data = snap.data() as any;
  return { id: code, ...data };
}

export async function createCode(input: { buyerName: string; contact: string; months: number; startAt: Date; endAt: Date; code: string; }) {
  const { Timestamp } = await import('firebase-admin/firestore');
  await getActivationDb().collection('activation_codes').doc(input.code).set({
    buyerName: input.buyerName,
    contact: input.contact,
    durationMonths: input.months,
    startAt: Timestamp.fromDate(input.startAt),
    endAt: Timestamp.fromDate(input.endAt),
    status: 'active',
    createdAt: Timestamp.fromDate(new Date()),
  });
}

export async function updateCode(input: { code: string; buyerName?: string; contact?: string; months?: number; status?: 'active' | 'blocked' | 'suspended'; }) {
  const updates: any = {};
  if (input.buyerName) updates.buyerName = input.buyerName;
  if (input.contact) updates.contact = input.contact;
  if (input.status) updates.status = input.status;
  if (typeof input.months === 'number') {
    const doc = await getActivationDb().collection('activation_codes').doc(input.code).get();
    if (doc.exists) {
      const data = doc.data() as any;
      const start = data.startAt?.toDate ? data.startAt.toDate() : new Date();
      const newEnd = new Date(new Date(start).setMonth(start.getMonth() + input.months));
      const { Timestamp } = await import('firebase-admin/firestore');
      updates.durationMonths = input.months;
      updates.endAt = Timestamp.fromDate(newEnd);
    }
  }
  await getActivationDb().collection('activation_codes').doc(input.code).update(updates);
}

export async function setStatus(code: string, status: 'active' | 'blocked' | 'suspended') {
  await getActivationDb().collection('activation_codes').doc(code).update({ status });
}

export async function deleteCodeEntry(code: string) {
  await getActivationDb().collection('activation_codes').doc(code).delete();
}

export async function extendCodeMonths(code: string, deltaMonths: number) {
  const { Timestamp } = await import('firebase-admin/firestore');
  const ref = getActivationDb().collection('activation_codes').doc(code);
  const doc = await ref.get();
  if (!doc.exists) return null;
  const data = doc.data() as any;
  const currentDuration = Number(data.durationMonths || 0);
  const end = data.endAt?.toDate ? data.endAt.toDate() : new Date(data.endAt);
  const newEnd = new Date(end);
  newEnd.setMonth(newEnd.getMonth() + deltaMonths);
  const newDuration = currentDuration + deltaMonths;
  await ref.update({
    durationMonths: newDuration,
    endAt: Timestamp.fromDate(newEnd),
  });
  return { durationMonths: newDuration, endAt: newEnd };
}
