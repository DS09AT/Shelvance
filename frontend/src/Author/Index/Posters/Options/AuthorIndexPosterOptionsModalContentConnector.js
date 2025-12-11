import { connect } from 'react-redux';
import { setAuthorPosterOption } from 'Store/Actions/authorIndexActions';
import AuthorIndexPosterOptionsModalContent from './AuthorIndexPosterOptionsModalContent';

function createMapStateToProps() {
  return (state) => state.authorIndex.posterOptions;
}

function createMapDispatchToProps(dispatch, props) {
  return {
    onChangePosterOption(payload) {
      dispatch(setAuthorPosterOption(payload));
    }
  };
}

export default connect(createMapStateToProps, createMapDispatchToProps)(AuthorIndexPosterOptionsModalContent);
