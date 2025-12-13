import React, { Component } from 'react';
import classNames from 'classnames';
import { Link as RouterLink } from 'react-router-dom';
import QueueStatusConnector from 'Activity/Queue/Status/QueueStatusConnector';
import Icon from 'Components/Icon';
import { icons } from 'Helpers/Props';
import HealthStatusConnector from 'System/Status/Health/HealthStatusConnector';
import translate from 'Utilities/String/translate';
import MessagesConnector from 'Components/Page/Sidebar/Messages/MessagesConnector';

const links = [
  {
    iconName: icons.AUTHOR_CONTINUING,
    title: () => translate('Library'),
    to: '/',
    alias: '/authors',
    children: [
      { title: () => translate('Authors'), to: '/authors' },
      { title: () => translate('Books'), to: '/books' },
      { title: () => translate('AddNew'), to: '/add/search' },
      { title: () => translate('Bookshelf'), to: '/shelf' },
      { title: () => translate('UnmappedFiles'), to: '/unmapped' }
    ]
  },
  {
    iconName: icons.CALENDAR,
    title: () => translate('Calendar'),
    to: '/calendar'
  },
  {
    iconName: icons.ACTIVITY,
    title: () => translate('Activity'),
    to: '/activity/queue',
    children: [
      { title: () => translate('Queue'), to: '/activity/queue', statusComponent: QueueStatusConnector },
      { title: () => translate('History'), to: '/activity/history' },
      { title: () => translate('Blocklist'), to: '/activity/blocklist' }
    ]
  },
  {
    iconName: icons.WARNING,
    title: () => translate('Wanted'),
    to: '/wanted/missing',
    children: [
      { title: () => translate('Missing'), to: '/wanted/missing' },
      { title: () => translate('CutoffUnmet'), to: '/wanted/cutoffunmet' }
    ]
  },
  {
    iconName: icons.SETTINGS,
    title: () => translate('Settings'),
    to: '/settings',
    children: [
      { title: () => translate('MediaManagement'), to: '/settings/mediamanagement' },
      { title: () => translate('Profiles'), to: '/settings/profiles' },
      { title: () => translate('Quality'), to: '/settings/quality' },
      { title: () => translate('CustomFormats'), to: '/settings/customformats' },
      { title: () => translate('Indexers'), to: '/settings/indexers' },
      { title: () => translate('DownloadClients'), to: '/settings/downloadclients' },
      { title: () => translate('ImportLists'), to: '/settings/importlists' },
      { title: () => translate('Connect'), to: '/settings/connect' },
      { title: () => translate('Metadata'), to: '/settings/metadata' },
      { title: () => translate('Tags'), to: '/settings/tags' },
      { title: () => translate('General'), to: '/settings/general' },
      { title: () => translate('UI'), to: '/settings/ui' }
    ]
  },
  {
    iconName: icons.SYSTEM,
    title: () => translate('System'),
    to: '/system/status',
    children: [
      { title: () => translate('Status'), to: '/system/status' },
      { title: () => translate('Tasks'), to: '/system/tasks' },
      { title: () => translate('Backup'), to: '/system/backup' },
      { title: () => translate('Updates'), to: '/system/updates' },
      { title: () => translate('Events'), to: '/system/events' },
      { title: () => translate('LogFiles'), to: '/system/logs/files' }
    ]
  }
];

interface AppPageSidebarProps {
  location: any;
  isSmallScreen: boolean;
  isSidebarVisible: boolean;
  onSidebarVisibleChange: (visible: boolean) => void;
}

interface AppPageSidebarState {
  openSections: Set<string>;
}

class AppPageSidebar extends Component<AppPageSidebarProps, AppPageSidebarState> {
  constructor(props: AppPageSidebarProps) {
    super(props);

    const pathname = props.location.pathname;
    const openSections = new Set<string>();

    links.forEach(link => {
      if (link.children) {
        const isActive = pathname.startsWith(link.to);
        if (isActive) {
          openSections.add(link.to);
        }
      }
    });

    this.state = {
      openSections
    };
  }

  toggleSection = (linkTo: string) => {
    this.setState(prevState => {
      const openSections = new Set(prevState.openSections);
      if (openSections.has(linkTo)) {
        openSections.delete(linkTo);
      } else {
        openSections.add(linkTo);
      }
      return { openSections };
    });
  };

  isLinkActive = (link: any) => {
    const pathname = this.props.location.pathname;

    if (link.alias && pathname.startsWith(link.alias)) {
      return true;
    }

    if (pathname === link.to) {
      return true;
    }

    if (link.children) {
      return link.children.some((child: any) => pathname.startsWith(child.to));
    }

    return false;
  };

  render() {
    const { isSmallScreen, isSidebarVisible, onSidebarVisibleChange } = this.props;
    const { openSections } = this.state;

    if (isSmallScreen && !isSidebarVisible) {
      return null;
    }

    return (
      <nav className="mt-10">
        {/* Logo */}
        <div className="hidden lg:flex mb-10">
          <RouterLink to="/" className="flex items-center gap-3">
            <img
              className="h-8"
              src={`${window.Readarr.urlBase}/Content/Images/logo.svg`}
              alt="Readarr"
            />
            <span className="text-xl font-semibold text-zinc-900 dark:text-white">
              Readarr
            </span>
          </RouterLink>
        </div>

        {/* Messages */}
        <div className="mb-6">
          <MessagesConnector />
        </div>

        {/* Health Status */}
        <div className="mb-6">
          <HealthStatusConnector />
        </div>

        {/* Navigation Links */}
        <ul role="list" className="space-y-1">
          {links.map((link) => {
            const isActive = this.isLinkActive(link);
            const isOpen = openSections.has(link.to);
            const hasChildren = link.children && link.children.length > 0;

            return (
              <li key={link.to}>
                {hasChildren ? (
                  <>
                    <button
                      onClick={() => this.toggleSection(link.to)}
                      className={classNames(
                        'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition',
                        isActive
                          ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                          : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-white'
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <Icon name={link.iconName} size={18} />
                        <span>{link.title()}</span>
                      </span>
                      <Icon
                        name={icons.CARET_DOWN}
                        size={12}
                        className={classNames(
                          'transition-transform',
                          isOpen && 'rotate-180'
                        )}
                      />
                    </button>

                    {/* Children */}
                    {isOpen && (
                      <ul className="mt-1 space-y-0.5 border-l border-zinc-200 pl-4 ml-6 dark:border-zinc-800">
                        {link.children.map((child: any) => {
                          const isChildActive = this.props.location.pathname.startsWith(child.to);
                          const StatusComponent = child.statusComponent;

                          return (
                            <li key={child.to}>
                              <RouterLink
                                to={child.to}
                                className={classNames(
                                  'flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition',
                                  isChildActive
                                    ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                                )}
                                onClick={() => isSmallScreen && onSidebarVisibleChange(false)}
                              >
                                <span>{child.title()}</span>
                                {StatusComponent && (
                                  <span className="ml-2">
                                    <StatusComponent />
                                  </span>
                                )}
                              </RouterLink>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <RouterLink
                    to={link.to}
                    className={classNames(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition',
                      isActive
                        ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-white'
                    )}
                    onClick={() => isSmallScreen && onSidebarVisibleChange(false)}
                  >
                    <Icon name={link.iconName} size={18} />
                    <span>{link.title()}</span>
                  </RouterLink>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }
}

export default AppPageSidebar;
