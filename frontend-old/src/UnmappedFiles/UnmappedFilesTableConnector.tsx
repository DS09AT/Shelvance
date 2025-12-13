import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import * as commandNames from 'Commands/commandNames';
import withCurrentPage from 'Components/withCurrentPage';
import { deleteBookFile, fetchBookFiles, setBookFilesSort, setBookFilesTableOption } from 'Store/Actions/bookFileActions';
import { executeCommand } from 'Store/Actions/commandActions';
import createClientSideCollectionSelector from 'Store/Selectors/createClientSideCollectionSelector';
import createCommandExecutingSelector from 'Store/Selectors/createCommandExecutingSelector';
import createDimensionsSelector from 'Store/Selectors/createDimensionsSelector';
import { registerPagePopulator, unregisterPagePopulator } from 'Utilities/pagePopulator';
import UnmappedFilesTable from './UnmappedFilesTable';

function createMapStateToProps() {
  return createSelector(
    createClientSideCollectionSelector('bookFiles'),
    createCommandExecutingSelector(commandNames.RESCAN_FOLDERS),
    createDimensionsSelector(),
    (
      bookFiles: any,
      isScanningFolders: boolean,
      dimensionsState: any
    ) => {
      const { items, ...otherProps } = bookFiles;
      const unmappedFiles = _.filter(items, { bookId: 0 });
      return {
        items: unmappedFiles,
        ...otherProps,
        isScanningFolders,
        isSmallScreen: dimensionsState.isSmallScreen
      };
    }
  );
}

function createMapDispatchToProps(dispatch: any, props: any) {
  return {
    onTableOptionChange(payload: any) {
      dispatch(setBookFilesTableOption(payload));
    },

    onSortPress(sortKey: string) {
      dispatch(setBookFilesSort({ sortKey }));
    },

    deleteUnmappedFile(id: number) {
      dispatch(deleteBookFile({ id }));
    },

    onAddMissingAuthorsPress() {
      dispatch(executeCommand({ name: commandNames.MISSING_BOOK_SEARCH }));
    }
  };
}

class UnmappedFilesTableConnector extends Component<any> {
  componentDidMount() {
    registerPagePopulator(this.repopulate);
    this.props.dispatchFetchBookFiles();
  }

  componentWillUnmount() {
    unregisterPagePopulator(this.repopulate);
  }

  repopulate = () => {
    this.props.dispatchFetchBookFiles();
  };

  render() {
    return <UnmappedFilesTable {...this.props} />;
  }
}

export default withCurrentPage(
  connect(createMapStateToProps, createMapDispatchToProps)(UnmappedFilesTableConnector)
);
