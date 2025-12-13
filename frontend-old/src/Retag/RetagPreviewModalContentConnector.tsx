import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import * as commandNames from 'Commands/commandNames';
import { executeCommand } from 'Store/Actions/commandActions';
import { fetchRetagPreview } from 'Store/Actions/retagPreviewActions';
import createAuthorSelector from 'Store/Selectors/createAuthorSelector';
import RetagPreviewModalContent from './RetagPreviewModalContent';

interface RetagPreviewModalContentConnectorProps {
  authorId: number;
  bookId?: number;
  isPopulated: boolean;
  isFetching: boolean;
  fetchRetagPreview: (payload: { authorId: number; bookId?: number }) => void;
  executeCommand: (command: { name: string; authorId: number; updateCovers: boolean; embedMetadata: boolean; files: number[] }) => void;
  onModalClose: () => void;
}

function createMapStateToProps() {
  return createSelector(
    (state: any) => state.retagPreview,
    createAuthorSelector(),
    (retagPreview: any, author: any) => {
      const props = { ...retagPreview };
      props.isFetching = retagPreview.isFetching;
      props.isPopulated = retagPreview.isPopulated;
      props.error = retagPreview.error;
      props.path = author.path;

      return props;
    }
  );
}

const mapDispatchToProps = {
  fetchRetagPreview,
  executeCommand
};

class RetagPreviewModalContentConnector extends Component<RetagPreviewModalContentConnectorProps> {
  componentDidMount() {
    const { authorId, bookId } = this.props;

    this.props.fetchRetagPreview({
      authorId,
      bookId
    });
  }

  onRetagPress = (files: number[], updateCovers: boolean, embedMetadata: boolean) => {
    this.props.executeCommand({
      name: commandNames.RETAG_FILES,
      authorId: this.props.authorId,
      updateCovers,
      embedMetadata,
      files
    });

    this.props.onModalClose();
  };

  render() {
    return (
      <RetagPreviewModalContent
        {...this.props}
        onRetagPress={this.onRetagPress}
      />
    );
  }
}

export default connect(createMapStateToProps, mapDispatchToProps)(RetagPreviewModalContentConnector);
