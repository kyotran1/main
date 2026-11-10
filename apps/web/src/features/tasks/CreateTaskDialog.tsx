import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, SquarePlus, X } from 'lucide-react';
import type { TaskPriority } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForPriority } from '@ads-nolimit/i18n';
import { api } from '@/lib/api';
import { useOfficeStore } from '@/store/officeStore';
import { useDerived } from '@/store/hooks';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { useAgentDisplayName } from '@/components/domain/AgentName';
import { Field, Select, TextArea, TextInput, dateInputToIso } from './FormControls';
import { PRIORITY_ORDER, selectAssignableAgents } from './selectors';

/**
 * Hộp thoại "Tạo công việc": tiêu đề, mô tả, phụ trách, ưu tiên, hạn → api.createTask.
 * Công việc mới xuất hiện trong bảng/Kanban qua realtime; sau khi tạo mở luôn ngăn chi tiết.
 */
export function CreateTaskDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const uid = useId();
  const displayName = useAgentDisplayName();
  const agents = useDerived(selectAssignableAgents);
  const selectTask = useOfficeStore((s) => s.selectTask);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [due, setDue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [created, setCreated] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    dialogRef.current?.focus({ preventScroll: true });
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (trimmed.length < 2) {
      setError(new Error(t('tasks:create.titleRequired')));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const assignee = agents.find((a) => a.id === assigneeId);
      const task = await api.createTask({
        title: trimmed,
        description: description.trim() || undefined,
        assigneeId: assignee?.id,
        departmentId: assignee?.departmentId,
        priority,
        dueAt: dateInputToIso(due),
      });
      setCreated(task.title);
      setTitle('');
      setDescription('');
      setDue('');
      selectTask(task.id);
      onClose();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-bg-base/70 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${t('tasks:create.title')} – ${t('tasks:create.secondary')}`}
        tabIndex={-1}
        className="glass-strong neon-border-violet relative w-full max-w-lg rounded-b-none p-4 outline-none sm:rounded-card md:p-5"
      >
        <div className="mb-3 flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-violet/20 text-brand-violet ring-1 ring-brand-violet/50">
            <SquarePlus className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="term-stack" title={`${t('tasks:create.secondary')} – ${t('tasks:create.title')}`}>
              <span className="term-primary text-base">{t('tasks:create.title')}</span>
              <span className="term-secondary">{t('tasks:create.secondary')}</span>
            </h2>
            <p className="mt-1 text-xs text-text-muted">{t('tasks:create.description')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('tasks:create.cancel')}
            title={t('tasks:create.cancel')}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-line bg-white/[0.03] text-text-muted hover:bg-white/[0.08] hover:text-text focus-visible:focus-ring"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <Field label={t('tasks:create.fieldTitle')} htmlFor={`${uid}-title`}>
            <TextInput id={`${uid}-title`} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('tasks:create.titlePlaceholder')} maxLength={300} autoFocus required />
          </Field>
          <Field label={t('tasks:create.fieldDescription')} htmlFor={`${uid}-desc`}>
            <TextArea id={`${uid}-desc`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('tasks:create.descriptionPlaceholder')} maxLength={5000} />
          </Field>
          <Field label={t('tasks:create.fieldAssignee')} htmlFor={`${uid}-assignee`}>
            <Select
              id={`${uid}-assignee`}
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              options={[{ value: '', label: t('tasks:create.autoAssign') }, ...agents.map((a) => ({ value: a.id, label: displayName(a) }))]}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('tasks:create.fieldPriority')} htmlFor={`${uid}-priority`}>
              <Select
                id={`${uid}-priority`}
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                options={PRIORITY_ORDER.map((p) => ({ value: p, label: bilingual(termIdForPriority(p), locale).inline }))}
              />
            </Field>
            <Field label={t('tasks:create.fieldDue')} htmlFor={`${uid}-due`}>
              <TextInput id={`${uid}-due`} type="date" value={due} onChange={(e) => setDue(e.target.value)} />
            </Field>
          </div>
          {error ? <ErrorBanner error={error} /> : null}
          {created ? (
            <p role="status" className="flex items-center gap-2 text-xs font-semibold text-brand-green">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              {t('tasks:create.success', { title: created })}
            </p>
          ) : null}
          <div className="mt-1 flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose} disabled={busy}>
              {t('tasks:create.cancel')}
            </Button>
            <Button type="submit" loading={busy} icon={<SquarePlus className="size-4" aria-hidden="true" />}>
              {busy ? t('tasks:create.submitting') : t('tasks:create.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
