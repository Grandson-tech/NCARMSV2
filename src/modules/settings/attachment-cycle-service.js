import { callDatabaseFunction, countRows, deleteRows, insertRows, selectRows, updateRows } from '../../../supabase/database.js';
import { loadAndCacheActiveCycle, activateAndNotifyCycle, getActiveCycle } from '../../shared/active-cycle-manager.js';

const CYCLE_COLUMNS = 'id, name, year, start_month, end_month, is_active, created_at, updated_at';
const STUDENT_CYCLE_COLUMNS = 'attachment_cycle_id';

function presentCycle(cycle, linkedStudentCount) {
  return Object.freeze({
    id: cycle.id,
    name: cycle.name,
    year: cycle.year,
    startMonth: cycle.start_month,
    endMonth: cycle.end_month,
    isActive: Boolean(cycle.is_active),
    linkedStudentCount,
    createdAt: cycle.created_at,
    updatedAt: cycle.updated_at,
  });
}

function cyclePayload({ name, year, startMonth, endMonth }) {
  return {
    name: String(name).trim(),
    year: Number(year),
    start_month: Number(startMonth),
    end_month: Number(endMonth),
  };
}

export async function loadAttachmentCycles() {
  const [cycles, studentReferences] = await Promise.all([
    selectRows('attachment_cycles', { columns: CYCLE_COLUMNS }),
    selectRows('students', { columns: STUDENT_CYCLE_COLUMNS }),
  ]);
  const counts = new Map();
  studentReferences.forEach(({ attachment_cycle_id: cycleId }) => {
    if (cycleId) counts.set(cycleId, (counts.get(cycleId) ?? 0) + 1);
  });
  return cycles
    .map((cycle) => presentCycle(cycle, counts.get(cycle.id) ?? 0))
    .sort((first, second) => Number(second.isActive) - Number(first.isActive) || second.year - first.year || first.name.localeCompare(second.name));
}

export async function loadActiveAttachmentCycle() {
  const activeCycle = await getActiveCycle();
  return activeCycle ? {
    id: activeCycle.id,
    name: activeCycle.name,
    year: activeCycle.year,
    isActive: activeCycle.isActive,
  } : null;
}

export async function createAttachmentCycle(values) {
  const records = await insertRows('attachment_cycles', { ...cyclePayload(values), is_active: false }, { columns: CYCLE_COLUMNS });
  if (!records[0]) throw new Error('Attachment cycle could not be created.');
  if (values.activateImmediately) await activateAttachmentCycle(records[0].id);
  return presentCycle(records[0], 0);
}

export async function updateAttachmentCycle(cycleId, values) {
  const records = await updateRows('attachment_cycles', cyclePayload(values), { filters: { id: cycleId }, columns: CYCLE_COLUMNS });
  if (!records[0]) throw new Error('Attachment cycle could not be updated.');
  if (values.activateImmediately) await activateAttachmentCycle(cycleId);
  return presentCycle(records[0], 0);
}

export function activateAttachmentCycle(cycleId) {
  return activateAndNotifyCycle(cycleId);
}

export async function deleteAttachmentCycle(cycleId) {
  const linkedStudentCount = await countRows('students', { filters: { attachment_cycle_id: cycleId } });
  if (linkedStudentCount > 0) {
    const error = new Error('This attachment cycle is currently assigned to student records and cannot be deleted.');
    error.code = 'ATTACHMENT_CYCLE_IN_USE';
    throw error;
  }
  await deleteRows('attachment_cycles', { filters: { id: cycleId } });
}
