import { createSelector, createSelectorCreator, lruMemoize } from 'reselect';
import hasDifferentItemsOrOrder from 'Utilities/Object/hasDifferentItemsOrOrder';
import createClientSideCollectionSelector from './createClientSideCollectionSelector';

function createMappedItemsSelector(uiSection) {
  return createSelector(
    createClientSideCollectionSelector('authors', uiSection),
    (authors) => {
      return authors.items.map((s) => {
        const {
          id,
          sortName,
          sortNameLastFirst
        } = s;

        return {
          id,
          sortName,
          sortNameLastFirst
        };
      });
    }
  );
}

function createUnoptimizedSelector(uiSection) {
  return createSelector(
    createClientSideCollectionSelector('authors', uiSection),
    createMappedItemsSelector(uiSection),
    (authors, items) => {
      return {
        ...authors,
        items
      };
    }
  );
}

function authorListEqual(a, b) {
  return hasDifferentItemsOrOrder(a, b);
}

const createAuthorEqualSelector = createSelectorCreator(
  lruMemoize,
  authorListEqual
);

function createAuthorClientSideCollectionItemsSelector(uiSection) {
  return createUnoptimizedSelector(uiSection);
}

export default createAuthorClientSideCollectionItemsSelector;
