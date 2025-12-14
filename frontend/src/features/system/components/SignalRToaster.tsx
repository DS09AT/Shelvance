import { useEffect } from 'react';
import { signalRService } from '@/features/system/services/signalRService';
import { useToast } from '@/shared/components/ui/Toast';
import { useStatusMessage, StatusMessage } from '@/shared/lib/StatusMessageProvider';

export function SignalRToaster() {
  const { addToast } = useToast();
  const { updateMessage } = useStatusMessage();

  useEffect(() => {
            const handleCommand = (body: any) => {
              const statusMessage: StatusMessage = {
                  id: body.id,
                  name: body.commandName || body.name,
                  message: body.message,
                  status: body.status,
                  startedOn: body.started,
                  stateChangeTime: body.stateChangeTime,
                  sendUpdatesToClient: body.sendUpdatesToClient,
              };

              updateMessage(statusMessage);

              if (statusMessage.status === 'failed') {
                addToast({
                  type: 'error',
                  title: 'Command Failed',
                  message: `${statusMessage.name} failed: ${statusMessage.message || 'Unknown error'}`,
                });
              }
            };

            const handleApplication = (body: any) => {
               if (body.action === 'updated') {
                   addToast({
                       type: 'info',
                       title: 'Application Updated',
                       message: 'Readarr has been updated. Please reload.',
                       duration: 0,
                   });
               }
            };

    const handleAll = (message: { name: string; body: any }) => {
        if (message.name === 'command') {
            handleCommand(message.body.resource);
        }
        if (message.name === 'Application') {
            handleApplication(message.body);
        }
    };

    signalRService.on('all', handleAll);

    return () => {
      signalRService.off('all', handleAll);
    };
  }, [addToast, updateMessage]);

  return null;
}
