import React, { Component } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import keyboardShortcuts, { shortcuts } from 'Components/keyboardShortcuts';
import IconButton from 'Components/Link/IconButton';
import Link from 'Components/Link/Link';
import { ThemeToggle } from 'ComponentsV2/Navigation/ThemeToggle';
import { icons } from 'Helpers/Props';
import AuthorSearchInputConnector from 'Components/Page/Header/AuthorSearchInputConnector';
import KeyboardShortcutsModal from 'Components/Page/Header/KeyboardShortcutsModal';
import PageHeaderActionsMenuConnector from 'Components/Page/Header/PageHeaderActionsMenuConnector';

interface AppPageHeaderProps {
  onSidebarToggle: () => void;
  bindShortcut: (key: string, callback: () => void) => void;
}

interface AppPageHeaderState {
  isKeyboardShortcutsModalOpen: boolean;
}

function HeaderContent({ onSidebarToggle, onOpenKeyboardShortcutsModal }: any) {
  const { scrollY } = useScroll();
  const bgOpacityLight = useTransform(scrollY, [0, 72], [0.5, 0.9]);
  const bgOpacityDark = useTransform(scrollY, [0, 72], [0.2, 0.8]);

  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between gap-12 px-4 transition backdrop-blur-sm sm:px-6 lg:left-72 lg:z-30 lg:px-8 xl:left-80"
      style={
        {
          backgroundColor: `rgb(255 255 255 / var(--bg-opacity-light))`,
          '--bg-opacity-light': bgOpacityLight,
          '--bg-opacity-dark': bgOpacityDark,
        } as any
      }
    >
      <div className="absolute inset-x-0 top-full h-px bg-zinc-900/7.5 dark:bg-white/7.5" />

      {/* Mobile menu button & Logo */}
      <div className="flex items-center gap-5 lg:hidden">
        <IconButton
          id="sidebar-toggle-button"
          name={icons.NAVBAR_COLLAPSE}
          onPress={onSidebarToggle}
        />
        <Link to="/">
          <img
            className="h-6"
            src={`${window.Readarr.urlBase}/Content/Images/logo.svg`}
            alt="Readarr"
          />
        </Link>
      </div>

      {/* Search bar */}
      <div className="flex-1 max-w-md hidden lg:block">
        <AuthorSearchInputConnector />
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Mobile search icon */}
        <div className="lg:hidden">
          <AuthorSearchInputConnector />
        </div>

        <ThemeToggle />

        <div className="hidden md:block md:h-5 md:w-px md:bg-zinc-900/10 md:dark:bg-white/15" />

        <IconButton
          className="hidden min-[416px]:inline-flex"
          name={icons.HEART}
          aria-label="Donate"
          to="https://opencollective.com/readarr"
          size={14}
        />

        <PageHeaderActionsMenuConnector
          onKeyboardShortcutsPress={onOpenKeyboardShortcutsModal}
        />
      </div>
    </motion.div>
  );
}

class AppPageHeader extends Component<AppPageHeaderProps, AppPageHeaderState> {
  constructor(props: AppPageHeaderProps) {
    super(props);

    this.state = {
      isKeyboardShortcutsModalOpen: false
    };
  }

  componentDidMount() {
    this.props.bindShortcut(shortcuts.OPEN_KEYBOARD_SHORTCUTS_MODAL.key, this.onOpenKeyboardShortcutsModal);
  }

  onOpenKeyboardShortcutsModal = () => {
    this.setState({ isKeyboardShortcutsModalOpen: true });
  };

  onKeyboardShortcutsModalClose = () => {
    this.setState({ isKeyboardShortcutsModalOpen: false });
  };

  render() {
    const { onSidebarToggle } = this.props;

    return (
      <>
        <HeaderContent
          onSidebarToggle={onSidebarToggle}
          onOpenKeyboardShortcutsModal={this.onOpenKeyboardShortcutsModal}
        />

        <KeyboardShortcutsModal
          isOpen={this.state.isKeyboardShortcutsModalOpen}
          onModalClose={this.onKeyboardShortcutsModalClose}
        />
      </>
    );
  }
}

export default keyboardShortcuts(AppPageHeader);
