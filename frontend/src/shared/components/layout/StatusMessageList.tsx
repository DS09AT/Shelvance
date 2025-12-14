import { useStatusMessage } from '@/shared/lib/StatusMessageProvider';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export function StatusMessageList() {
  const { messages } = useStatusMessage();

  if (messages.length === 0) return null;

  return (
    <div className="mt-auto px-4 pb-4">
      <div className="space-y-2">
        {messages.map((message) => (
          <div key={message.id} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            {message.status === 'started' || message.status === 'queued' ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
            ) : message.status === 'completed' ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <div className="flex-1 truncate">
              <div className="font-medium text-xs">{message.name}</div>
              {message.message && <div className="text-xs opacity-75 truncate">{message.message}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
