import React from 'react';
import { Badge } from 'ComponentsV2/UI';

interface ProtocolLabelProps {
  protocol: string;
}

function ProtocolLabel({ protocol }: ProtocolLabelProps) {
  const protocolName = protocol === 'usenet' ? 'nzb' : protocol;
  
  const variant = protocol === 'torrent' ? 'info' : 'success';

  return (
    <Badge variant={variant} size="sm">
      {protocolName}
    </Badge>
  );
}

export default ProtocolLabel;
