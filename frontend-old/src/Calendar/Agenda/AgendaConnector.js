import { connect } from 'react-redux';
import Agenda from './Agenda';

function createMapStateToProps() {
  return (state) => state.calendar;
}

export default connect(createMapStateToProps)(Agenda);
