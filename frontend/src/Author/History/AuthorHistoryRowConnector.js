import { connect } from 'react-redux';
import { fetchHistory, markAsFailed } from 'Store/Actions/historyActions';
import createAuthorSelector from 'Store/Selectors/createAuthorSelector';
import createBookSelector from 'Store/Selectors/createBookSelector';
import AuthorHistoryRow from './AuthorHistoryRow';

function createMapStateToProps() {
  const authorSelector = createAuthorSelector();
  const bookSelector = createBookSelector();
  
  return (state, props) => {
    return {
      author: authorSelector(state, props),
      book: bookSelector(state, props)
    };
  };
}

const mapDispatchToProps = {
  fetchHistory,
  markAsFailed
};

export default connect(createMapStateToProps, mapDispatchToProps)(AuthorHistoryRow);
