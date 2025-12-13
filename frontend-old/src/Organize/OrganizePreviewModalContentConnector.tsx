import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import * as commandNames from 'Commands/commandNames';
import { executeCommand } from 'Store/Actions/commandActions';
import { fetchOrganizePreview } from 'Store/Actions/organizePreviewActions';
import { fetchNamingSettings } from 'Store/Actions/settingsActions';
import createAuthorSelector from 'Store/Selectors/createAuthorSelector';
import OrganizePreviewModalContent from './OrganizePreviewModalContent';

interface OrganizePreviewModalContentConnectorProps {
  authorId: number;
  bookId?: number;
  fetchOrganizePreview: (payload: { authorId: number; bookId?: number }) => void;
  fetchNamingSettings: () => void;
  executeCommand: (command: { name: string; authorId: number; files: number[] }) => void;
  onModalClose: () => void;
}

function createMapStateToProps() {
  return createSelector(
    (state: any) => state.organizePreview,
    (state: any) => state.settings.naming,
    createAuthorSelector(),
    (organizePreview: any, naming: any, author: any) => {
      const props = { ...organizePreview };
      props.isFetching = organizePreview.isFetching || naming.isFetching;
      props.isPopulated = organizePreview.isPopulated && naming.isPopulated;
      props.error = organizePreview.error || naming.error;
      props.trackFormat = naming.item.standardBookFormat;
      props.path = author.path;

      return props;
    }
  );
}

const mapDispatchToProps = {
  fetchOrganizePreview,
  fetchNamingSettings,
  executeCommand
};

class OrganizePreviewModalContentConnector extends Component<OrganizePreviewModalContentConnectorProps> {
  componentDidMount() {
    const { authorId, bookId } = this.props;

    this.props.fetchOrganizePreview({
      authorId,
      bookId
    });

    this.props.fetchNamingSettings();
  }

  onOrganizePress = (files: number[]) => {
    this.props.executeCommand({
      name: commandNames.RENAME_FILES,
      authorId: this.props.authorId,
      files
    });

    this.props.onModalClose();
  };

  render() {
    return (
      <OrganizePreviewModalContent
        {...this.props}
        onOrganizePress={this.onOrganizePress}
      />
    );
  }
}

export default connect(createMapStateToProps, mapDispatchToProps)(OrganizePreviewModalContentConnector);
