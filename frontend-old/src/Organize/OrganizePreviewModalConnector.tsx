import React from 'react';
import { connect } from 'react-redux';
import { clearOrganizePreview } from 'Store/Actions/organizePreviewActions';
import OrganizePreviewModal from './OrganizePreviewModal';

interface OrganizePreviewModalConnectorProps {
  clearOrganizePreview: () => void;
  onModalClose: () => void;
  isOpen: boolean;
  authorId: number;
  bookId?: number;
}

const mapDispatchToProps = {
  clearOrganizePreview
};

class OrganizePreviewModalConnector extends React.Component<OrganizePreviewModalConnectorProps> {
  onModalClose = () => {
    this.props.clearOrganizePreview();
    this.props.onModalClose();
  };

  render() {
    return (
      <OrganizePreviewModal
        {...this.props}
        onModalClose={this.onModalClose}
      />
    );
  }
}

export default connect(undefined, mapDispatchToProps)(OrganizePreviewModalConnector);
