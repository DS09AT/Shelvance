import { connect } from 'react-redux';
import { setQueueOption } from 'Store/Actions/queueActions';
import QueueOptions from './QueueOptions';

function createMapStateToProps() {
  return (state) => state.queue.options;
}

const mapDispatchToProps = {
  onOptionChange: setQueueOption
};

export default connect(createMapStateToProps, mapDispatchToProps)(QueueOptions);
