import { createSelector } from 'reselect';
import getSectionState from 'Utilities/State/getSectionState';

function createSortedSectionSelector(section, comparer) {
  return createSelector(
    (state) => getSectionState(state, section, true),
    (sectionState) => {
      return {
        ...sectionState,
        items: [...sectionState.items].sort(comparer)
      };
    }
  );
}

export default createSortedSectionSelector;
