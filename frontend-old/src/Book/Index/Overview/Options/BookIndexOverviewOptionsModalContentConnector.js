import { connect } from 'react-redux';
import { setBookOverviewOption } from 'Store/Actions/bookIndexActions';
import BookIndexOverviewOptionsModalContent from './BookIndexOverviewOptionsModalContent';

function createMapStateToProps() {
  return (state) => state.bookIndex.overviewOptions;
}

function createMapDispatchToProps(dispatch, props) {
  return {
    onChangeOverviewOption(payload) {
      dispatch(setBookOverviewOption(payload));
    }
  };
}

export default connect(createMapStateToProps, createMapDispatchToProps)(BookIndexOverviewOptionsModalContent);
