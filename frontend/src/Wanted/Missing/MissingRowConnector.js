import { connect } from 'react-redux';
import createAuthorSelector from 'Store/Selectors/createAuthorSelector';
import MissingRow from './MissingRow';

function createMapStateToProps() {
  const authorSelector = createAuthorSelector();
  
  return (state, props) => {
    return {
      author: authorSelector(state, props)
    };
  };
}

export default connect(createMapStateToProps)(MissingRow);
