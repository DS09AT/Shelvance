import React from 'react';
import { motion } from 'framer-motion';
import AppPageHeader from './AppPageHeader';
import AppPageSidebar from './AppPageSidebar';
import AppUpdatedModalConnector from 'App/AppUpdatedModalConnector';
import ConnectionLostModalConnector from 'App/ConnectionLostModalConnector';
import AuthenticationRequiredModal from 'FirstRun/AuthenticationRequiredModal';
import SignalRConnector from 'Components/SignalRConnector';
import ColorImpairedContext from 'App/ColorImpairedContext';

interface AppPageProps {
  className?: string;
  location: any;
  children: React.ReactNode;
  isSmallScreen: boolean;
  isSidebarVisible: boolean;
  isUpdated: boolean;
  isDisconnected: boolean;
  enableColorImpairedMode: boolean;
  authenticationEnabled: boolean;
  onResize: (dimensions: { width: number; height: number }) => void;
  onSidebarToggle: () => void;
  onSidebarVisibleChange: (visible: boolean) => void;
}

interface AppPageState {
  isUpdatedModalOpen: boolean;
  isConnectionLostModalOpen: boolean;
}

class AppPage extends React.Component<AppPageProps, AppPageState> {
  constructor(props: AppPageProps) {
    super(props);

    this.state = {
      isUpdatedModalOpen: false,
      isConnectionLostModalOpen: false
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
  }

  componentDidUpdate(prevProps: AppPageProps) {
    const { isDisconnected, isUpdated } = this.props;

    if (!prevProps.isUpdated && isUpdated) {
      this.setState({ isUpdatedModalOpen: true });
    }

    if (prevProps.isDisconnected !== isDisconnected) {
      this.setState({ isConnectionLostModalOpen: isDisconnected });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  onResize = () => {
    this.props.onResize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };

  onUpdatedModalClose = () => {
    this.setState({ isUpdatedModalOpen: false });
  };

  onConnectionLostModalClose = () => {
    this.setState({ isConnectionLostModalOpen: false });
  };

  render() {
    const {
      location,
      children,
      isSmallScreen,
      isSidebarVisible,
      enableColorImpairedMode,
      authenticationEnabled,
      onSidebarToggle,
      onSidebarVisibleChange
    } = this.props;

    return (
      <ColorImpairedContext.Provider value={enableColorImpairedMode}>
        <div className="flex min-h-full flex-col bg-white dark:bg-zinc-900">
          <SignalRConnector />

          {/* Sidebar - Fixed on desktop, drawer on mobile */}
          <div className="h-full lg:ml-72 xl:ml-80">
            <motion.div
              layoutScroll
              className="contents lg:pointer-events-none lg:fixed lg:inset-0 lg:z-40 lg:flex"
            >
              <div className="contents lg:pointer-events-auto lg:block lg:w-72 lg:overflow-y-auto lg:border-r lg:border-zinc-900/10 lg:px-6 lg:pb-8 lg:pt-4 xl:w-80 lg:dark:border-white/10">
                <AppPageSidebar
                  location={location}
                  isSmallScreen={isSmallScreen}
                  isSidebarVisible={isSidebarVisible}
                  onSidebarVisibleChange={onSidebarVisibleChange}
                />
              </div>
            </motion.div>

            {/* Header - Sticky with blur backdrop */}
            <AppPageHeader onSidebarToggle={onSidebarToggle} />

            {/* Main content area */}
            <div className="relative flex h-full flex-col px-4 pt-14 sm:px-6 lg:px-8">
              <main className="flex-auto py-6">
                {children}
              </main>

              {/* Footer could go here if needed */}
              <footer className="mx-auto mt-24 w-full max-w-2xl lg:max-w-5xl">
                <div className="border-t border-zinc-900/5 py-10 dark:border-white/5">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    &copy; {new Date().getFullYear()} Readarr. All rights reserved.
                  </p>
                </div>
              </footer>
            </div>
          </div>

          {/* Modals */}
          <AppUpdatedModalConnector
            isOpen={this.state.isUpdatedModalOpen}
            onModalClose={this.onUpdatedModalClose}
          />

          <ConnectionLostModalConnector
            isOpen={this.state.isConnectionLostModalOpen}
            onModalClose={this.onConnectionLostModalClose}
          />

          <AuthenticationRequiredModal
            isOpen={!authenticationEnabled}
          />
        </div>
      </ColorImpairedContext.Provider>
    );
  }
}

export default AppPage;
