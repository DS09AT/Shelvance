import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/shared/components/layout';
import { Heading } from '@/shared/components/ui';
import { AuthorsPage } from '@/features/authors/AuthorsPage';
import { AuthorDetailsPage } from '@/features/authors/AuthorDetailsPage';

function Placeholder({ title }: { title: string }) {
  return (
    <>
      <Heading level={1}>{title}</Heading>
      <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
        This feature is not yet migrated.
      </p>
    </>
  );
}

export function App() {
  return (
    <Layout>
      <Routes>
        {/* Library */}
        <Route path="/" element={<AuthorsPage />} />
        <Route path="/authors" element={<AuthorsPage />} />
        <Route path="/add/search" element={<Placeholder title="Add New" />} />
        <Route path="/shelf" element={<Placeholder title="Bookshelf" />} />
        <Route path="/books" element={<Placeholder title="Books" />} />
        <Route path="/unmapped" element={<Placeholder title="Unmapped Files" />} />
        <Route path="/author/:titleSlug" element={<AuthorDetailsPage />} />
        <Route path="/book/:titleSlug" element={<Placeholder title="Book Details" />} />

        {/* Calendar */}
        <Route path="/calendar" element={<Placeholder title="Calendar" />} />

        {/* Activity */}
        <Route path="/activity/history" element={<Placeholder title="History" />} />
        <Route path="/activity/queue" element={<Placeholder title="Queue" />} />
        <Route path="/activity/blocklist" element={<Placeholder title="Blocklist" />} />

        {/* Wanted */}
        <Route path="/wanted/missing" element={<Placeholder title="Missing" />} />
        <Route path="/wanted/cutoffunmet" element={<Placeholder title="Cutoff Unmet" />} />

        {/* Settings */}
        <Route path="/settings" element={<Placeholder title="Settings" />} />
        <Route path="/settings/mediamanagement" element={<Placeholder title="Media Management" />} />
        <Route path="/settings/profiles" element={<Placeholder title="Profiles" />} />
        <Route path="/settings/quality" element={<Placeholder title="Quality" />} />
        <Route path="/settings/customformats" element={<Placeholder title="Custom Formats" />} />
        <Route path="/settings/indexers" element={<Placeholder title="Indexers" />} />
        <Route path="/settings/downloadclients" element={<Placeholder title="Download Clients" />} />
        <Route path="/settings/importlists" element={<Placeholder title="Import Lists" />} />
        <Route path="/settings/connect" element={<Placeholder title="Connect" />} />
        <Route path="/settings/metadata" element={<Placeholder title="Metadata" />} />
        <Route path="/settings/tags" element={<Placeholder title="Tags" />} />
        <Route path="/settings/general" element={<Placeholder title="General" />} />
        <Route path="/settings/ui" element={<Placeholder title="UI Settings" />} />
        <Route path="/settings/development" element={<Placeholder title="Development" />} />

        {/* System */}
        <Route path="/system/status" element={<Placeholder title="System Status" />} />
        <Route path="/system/tasks" element={<Placeholder title="Tasks" />} />
        <Route path="/system/backup" element={<Placeholder title="Backups" />} />
        <Route path="/system/updates" element={<Placeholder title="Updates" />} />
        <Route path="/system/events" element={<Placeholder title="Events" />} />
        <Route path="/system/logs/files/*" element={<Placeholder title="Log Files" />} />

        {/* Not Found / Catch All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
