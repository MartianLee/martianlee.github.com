import KBShell from '@/components/kb/KBShell'
import KBSidebar from '@/components/kb/KBSidebar'
import KBNoteList from '@/components/kb/KBNoteList'
import kbData from 'app/kb-data.json'
import type { KBData } from '@/components/kb/types'

const data = kbData as KBData

export default function KBPage() {
  return (
    <div className="kb-breakout">
      <KBShell
        sidebar={<KBSidebar />}
        main={<KBNoteList />}
        breadcrumb={<span style={{ color: 'var(--kb-text-strong)' }}>All Notes</span>}
        statusBar={
          <div className="flex w-full items-center gap-4">
            <span style={{ color: 'var(--kb-accent)' }}>&#9679; KB</span>
            <span>{data.postIndex.length} notes</span>
            <span>&middot;</span>
            <span>{data.topics.length} topics</span>
            <span className="ml-auto">Cmd+K to search</span>
          </div>
        }
      />
    </div>
  )
}
