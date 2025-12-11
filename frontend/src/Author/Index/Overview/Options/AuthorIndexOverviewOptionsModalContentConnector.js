import { connect } from 'react-redux';
import { setAuthorOverviewOption } from 'Store/Actions/authorIndexActions';
import AuthorIndexOverviewOptionsModalContent from './AuthorIndexOverviewOptionsModalContent';

function createMapStateToProps() {
  return (state) => state.authorIndex.overviewOptions;
}

function createMapDispatchToProps(dispatch, props) {
  return {
    onChangeOverviewOption(payload) {
      dispatch(setAuthorOverviewOption(payload));
    }
  };
}

export default connect(createMapStateToProps, createMapDispatchToProps)(AuthorIndexOverviewOptionsModalContent);
