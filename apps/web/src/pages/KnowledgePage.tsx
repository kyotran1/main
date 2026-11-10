import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { KnowledgeToc } from '@/features/knowledge/KnowledgeToc';
import { IntroSection } from '@/features/knowledge/IntroSection';
import { WorkflowSection } from '@/features/knowledge/WorkflowSection';
import { RolesSection } from '@/features/knowledge/RolesSection';
import { QuickstartSection } from '@/features/knowledge/QuickstartSection';
import { GlossaryTable } from '@/features/knowledge/GlossaryTable';
import { FaqSection } from '@/features/knowledge/FaqSection';
import { KNOWLEDGE_SECTIONS, isKnowledgeSectionId } from '@/features/knowledge/sections';
import { useActiveSection } from '@/features/knowledge/useActiveSection';

/**
 * KHO TRI THỨC (/knowledge): tài liệu hướng dẫn tiếng Việt – giới thiệu & kiến trúc, quy trình 6 giai đoạn,
 * vai trò chức vụ AI, hướng dẫn nhanh, bảng thuật ngữ tra cứu và câu hỏi thường gặp.
 * Mục lục dính bên trái ở màn hình rộng; hỗ trợ mở thẳng một mục qua hash (vd /knowledge#glossary).
 */
export default function KnowledgePage() {
  const { t } = useTranslation();
  const { hash } = useLocation();
  const ids = useMemo(() => KNOWLEDGE_SECTIONS.map((s) => s.id), []);
  const active = useActiveSection(ids);

  // Cuộn tới mục được trỏ bằng hash sau khi nội dung đã dựng xong.
  useEffect(() => {
    const target = hash.replace(/^#/, '');
    if (!isKnowledgeSectionId(target)) return;
    const frame = requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView({ block: 'start' }));
    return () => cancelAnimationFrame(frame);
  }, [hash]);

  return (
    <div className="flex min-w-0 flex-col gap-4 md:gap-5">
      <PageHeader termId="module.knowledge_base" icon={<BookOpen className="size-5" />} description={t('knowledge:description')} />

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[252px_minmax(0,1fr)] xl:gap-6">
        {/* Mục lục: dải chip dính dưới thanh tiêu đề (hẹp) / cột dính bên trái (rộng) */}
        <div className="sticky top-[68px] z-20 -mx-3 bg-bg-deep/85 px-3 py-2 backdrop-blur-xl xl:static xl:mx-0 xl:bg-transparent xl:p-0 xl:backdrop-blur-none">
          <KnowledgeToc active={active} className="xl:sticky xl:top-[84px]" />
        </div>

        <article className="flex min-w-0 flex-col gap-4 md:gap-5">
          <IntroSection />
          <WorkflowSection />
          <RolesSection />
          <QuickstartSection />
          <GlossaryTable />
          <FaqSection />
        </article>
      </div>
    </div>
  );
}
