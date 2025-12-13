import PropTypes from 'prop-types';
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearInteractiveImportBookFiles, fetchInteractiveImportBookFiles } from 'Store/Actions/interactiveImportActions';
import createClientSideCollectionSelector from 'Store/Selectors/createClientSideCollectionSelector';
import ConfirmImportModalContent from './ConfirmImportModalContent';

const makeSelector = () => {
  return createClientSideCollectionSelector('interactiveImport.bookFiles');
};

function ConfirmImportModalContentConnector({ books, ...otherProps }) {
  const dispatch = useDispatch();

  const selector = useMemo(makeSelector, []);

  const stateProps = useSelector(selector);

  useEffect(() => {
    const bookIds = books.map((x) => x.id);
    dispatch(fetchInteractiveImportBookFiles({ bookId: bookIds }));

    return () => {
      dispatch(clearInteractiveImportBookFiles());
    };
  }, [dispatch, books]);

  return (
    <ConfirmImportModalContent
      {...stateProps}
      books={books}
      {...otherProps}
    />
  );
}

ConfirmImportModalContentConnector.propTypes = {
  books: PropTypes.arrayOf(PropTypes.object).isRequired,
  onModalClose: PropTypes.func.isRequired
};

export default ConfirmImportModalContentConnector;
