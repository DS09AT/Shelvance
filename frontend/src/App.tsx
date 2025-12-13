import { Layout } from '@/shared/components/layout';
import { Heading } from '@/shared/components/ui';

export function App() {
  return (
    <Layout>
      <Heading level={1}>Welcome to Readarr</Heading>
      <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
        Your automated book library manager
      </p>
    </Layout>
  );
}
