import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { withRouter } from 'Helpers/withRouter';
import { deleteBook } from 'Store/Actions/bookActions';
import createBookSelector from 'Store/Selectors/createBookSelector';
import DeleteBookModalContent from './DeleteBookModalContent';

function createMapStateToProps() {
  return createBookSelector();
}

const mapDispatchToProps = {
  deleteBook
};

class DeleteBookModalContentConnector extends Component {

  //
  // Listeners

  onDeletePress = (deleteFiles, addImportListExclusion) => {
    this.props.deleteBook({
      id: this.props.bookId,
      deleteFiles,
      addImportListExclusion
    });

    this.props.onModalClose(true);

    this.props.navigate(`/author/${this.props.authorSlug}`);
  };

  //
  // Render

  render() {
    return (
      <DeleteBookModalContent
        {...this.props}
        onDeletePress={this.onDeletePress}
      />
    );
  }
}

DeleteBookModalContentConnector.propTypes = {
  bookId: PropTypes.number.isRequired,
  authorSlug: PropTypes.string.isRequired,
  navigate: PropTypes.func.isRequired,
  onModalClose: PropTypes.func.isRequired,
  deleteBook: PropTypes.func.isRequired
};

export default withRouter(connect(createMapStateToProps, mapDispatchToProps)(DeleteBookModalContentConnector));
