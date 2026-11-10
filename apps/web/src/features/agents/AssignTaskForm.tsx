import { useId, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import type { Agent, TaskPriority } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForPriority } from '@ads-nolimit/i18n';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { useAgentDisplayName } from '@/components/domain/AgentName';
import { Field, Select, TextInput, dateInputToIso } from '@/features/tasks/FormControls';
import { PRIORITY_ORDER } from '@/features/tasks/selectors';

/** Biểu mẫu nhỏ "Giao việc mới" trong ngăn hồ sơ nhân sự AI: tiêu đề, ưu tiên, hạn → api.createTask. */
export function AssignTaskForm({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const displayName = useAgentDisplayName();
  const uid = useId();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [due, setDue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [created, setCreated] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (trimmed.length < 2) {
      setError(new Error(t('agents:detail.assignForm.titleRequired')));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const task = await api.createTask({
        title: trimmed,
        priority,
        assigneeId: agent.id,
        departmentId: agent.departmentId,
        dueAt: dateInputToIso(due),
      });
      setCreated(task.title);
      setTitle('');
      setDue('');
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="neon-border-violet glass flex flex-col gap-3 p-3.5" aria-label={t('agents:detail.assignForm.title', { name: displayName(agent) })}>
      <p className="text-sm font-semibold text-text">{t('agents:detail.assignForm.title', { name: displayName(agent) })}</p>
      <Field label={t('agents:detail.assignForm.fieldTitle')} htmlFor={`${uid}-title`}>
        <TextInput
          id={`${uid}-title`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('agents:detail.assignForm.titlePlaceholder')}
          maxLength={300}
          autoFocus
          required
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('agents:detail.assignForm.fieldPriority')} htmlFor={`${uid}-priority`}>
          <Select
            id={`${uid}-priority`}
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            options={PRIORITY_ORDER.map((p) => ({ value: p, label: bilingual(termIdForPriority(p), locale).inline }))}
          />
        </Field>
        <Field label={t('agents:detail.assignForm.fieldDue')} htmlFor={`${uid}-due`}>
          <TextInput id={`${uid}-due`} type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </Field>
      </div>
      {error ? <ErrorBanner error={error} /> : null}
      {created ? (
        <p role="status" className="flex items-center gap-2 text-xs font-semibold text-brand-green">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {t('agents:detail.assignForm.success', { title: created })}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose} disabled={busy}>
          {t('agents:detail.assignForm.cancel')}
        </Button>
        <Button type="submit" size="sm" loading={busy}>
          {busy ? t('agents:detail.assignForm.submitting') : t('agents:detail.assignForm.submit')}
        </Button>
      </div>
    </form>
  );
}
