import { createSelector, createSelectorCreator, lruMemoize } from 'reselect';
import hasDifferentItemsOrOrder from 'Utilities/Object/hasDifferentItemsOrOrder';
import createBooksClientSideCollectionSelector from './createBooksClientSideCollectionSelector';

function createMappedItemsSelector(uiSection) {
  return createSelector(
    createBooksClientSideCollectionSelector(uiSection),
    (books) => {
      return books.items.map((s) => {
        const {
          id,
          title,
          authorTitle
        } = s;

        return {
          id,
          title,
          authorTitle
        };
      });
    }
  );
}

function createUnoptimizedSelector(uiSection) {
  return createSelector(
    createBooksClientSideCollectionSelector(uiSection),
    createMappedItemsSelector(uiSection),
    (books, items) => {
      return {
        ...books,
        items
      };
    }
  );
}

function bookListEqual(a, b) {
  return hasDifferentItemsOrOrder(a, b);
}

const createBookEqualSelector = createSelectorCreator(
  lruMemoize,
  bookListEqual
);

function createBookClientSideCollectionItemsSelector(uiSection) {
  return createUnoptimizedSelector(uiSection);
}

export default createBookClientSideCollectionItemsSelector;
