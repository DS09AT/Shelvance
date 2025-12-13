import React from 'react';
import { connect } from 'react-redux';
import { clearRetagPreview } from 'Store/Actions/retagPreviewActions';
import RetagPreviewModal from './RetagPreviewModal';

interface RetagPreviewModalConnectorProps {
  clearRetagPreview: () => void;
  onModalClose: () => void;
  isOpen: boolean;
  authorId: number;
  bookId?: number;
}

const mapDispatchToProps = {
  clearRetagPreview
};

class RetagPreviewModalConnector extends React.Component<RetagPreviewModalConnectorProps> {
  onModalClose = () => {
    this.props.clearRetagPreview();
    this.props.onModalClose();
  };

  render() {
    return (
      <RetagPreviewModal
        {...this.props}
        onModalClose={this.onModalClose}
      />
    );
  }
}

export default connect(undefined, mapDispatchToProps)(RetagPreviewModalConnector);
