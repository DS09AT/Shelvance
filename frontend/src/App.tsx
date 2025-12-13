import { Layout } from '@/shared/components/layout';
import { Button, Heading, Prose, Tag } from '@/shared/components/ui';

export function App() {
  return (
    <Layout>
      <div className="space-y-8 py-8">
        <div>
          <Tag color="emerald">Beta</Tag>
          <Heading level={1} className="mt-4">
            Welcome to Readarr
          </Heading>
          <Prose className="mt-4">
            <p>
              This is a new frontend implementation using Vite, React 19, and
              Tailwind CSS v4.
            </p>
          </Prose>
        </div>

        <div className="space-y-4">
          <Heading level={2}>Quick Actions</Heading>
          <div className="flex gap-4 flex-wrap">
            <Button variant="primary" arrow="right">
              Get Started
            </Button>
            <Button variant="secondary">Documentation</Button>
            <Button variant="outline">Learn More</Button>
            <Button variant="filled">Sign In</Button>
            <Button variant="text" arrow="right">
              View All
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
          <Heading level={3} className="mb-4">
            System Status
          </Heading>
          <Prose>
            <ul>
              <li>✅ Frontend: Running</li>
              <li>✅ Vite: Configured</li>
              <li>✅ Tailwind CSS v4: Active</li>
              <li>✅ TypeScript: Enabled</li>
              <li>✅ Theme System: Operational</li>
            </ul>
          </Prose>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <Tag color="sky" className="mb-2">
              Authors
            </Tag>
            <Heading level={4}>Manage Authors</Heading>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Add and organize your favorite authors
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <Tag color="amber" className="mb-2">
              Books
            </Tag>
            <Heading level={4}>Browse Books</Heading>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Explore your book collection
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <Tag color="rose" className="mb-2">
              Settings
            </Tag>
            <Heading level={4}>Configuration</Heading>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Customize your Readarr instance
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
