import { connect } from 'react-redux';
import { setBookPosterOption } from 'Store/Actions/bookIndexActions';
import BookIndexPosterOptionsModalContent from './BookIndexPosterOptionsModalContent';

function createMapStateToProps() {
  return (state) => state.bookIndex.posterOptions;
}

function createMapDispatchToProps(dispatch, props) {
  return {
    onChangePosterOption(payload) {
      dispatch(setBookPosterOption(payload));
    }
  };
}

export default connect(createMapStateToProps, createMapDispatchToProps)(BookIndexPosterOptionsModalContent);
