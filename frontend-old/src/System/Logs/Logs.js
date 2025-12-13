import React from 'react';
import { Route } from 'react-router-dom';
import Switch from 'Components/Router/Switch';
import LogFilesConnector from './Files/LogFilesConnector';
import UpdateLogFilesConnector from './Updates/UpdateLogFilesConnector';

function Logs() {
  return (
    <Switch>
      <Route index element={<LogFilesConnector />} />
      <Route path="update" element={<UpdateLogFilesConnector />} />
    </Switch>
  );
}

export default Logs;
