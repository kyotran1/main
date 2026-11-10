import type { LucideIcon } from 'lucide-react';
import { BookA, CircleHelp, Compass, GitBranch, Layers3, Users } from 'lucide-react';

/** Định danh kỹ thuật của từng mục (dùng làm id phần tử + hash URL, không dịch). */
export type KnowledgeSectionId = 'intro' | 'workflow' | 'roles' | 'quickstart' | 'glossary' | 'faq';

export interface KnowledgeSection {
  id: KnowledgeSectionId;
  icon: LucideIcon;
}

/** Thứ tự mục lục của Kho tri thức – nhãn song ngữ lấy từ knowledge:sections.<id>. */
export const KNOWLEDGE_SECTIONS: readonly KnowledgeSection[] = [
  { id: 'intro', icon: Layers3 },
  { id: 'workflow', icon: GitBranch },
  { id: 'roles', icon: Users },
  { id: 'quickstart', icon: Compass },
  { id: 'glossary', icon: BookA },
  { id: 'faq', icon: CircleHelp },
] as const;

export const isKnowledgeSectionId = (value: string): value is KnowledgeSectionId =>
  KNOWLEDGE_SECTIONS.some((s) => s.id === value);
