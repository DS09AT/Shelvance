import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { removeBlocklistItem } from 'Store/Actions/blocklistActions';
import createAuthorSelector from 'Store/Selectors/createAuthorSelector';
import BlocklistRow from './BlocklistRow.tsx';

function createMapStateToProps() {
  const authorSelector = createAuthorSelector();
  
  return (state, props) => {
    return {
      author: authorSelector(state, props)
    };
  };
}

function createMapDispatchToProps(dispatch, props) {
  return {
    onRemovePress() {
      dispatch(removeBlocklistItem({ id: props.id }));
    }
  };
}

export default connect(createMapStateToProps, createMapDispatchToProps)(BlocklistRow);
