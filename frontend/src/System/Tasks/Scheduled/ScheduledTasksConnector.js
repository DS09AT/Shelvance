import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchTasks } from 'Store/Actions/systemActions';
import ScheduledTasks from './ScheduledTasks';

function createMapStateToProps() {
  return (state) => state.system.tasks;
}

const mapDispatchToProps = {
  dispatchFetchTasks: fetchTasks
};

class ScheduledTasksConnector extends Component {

  //
  // Lifecycle

  componentDidMount() {
    this.props.dispatchFetchTasks();
  }

  //
  // Render

  render() {
    return (
      <ScheduledTasks
        {...this.props}
      />
    );
  }
}

ScheduledTasksConnector.propTypes = {
  dispatchFetchTasks: PropTypes.func.isRequired
};

export default connect(createMapStateToProps, mapDispatchToProps)(ScheduledTasksConnector);
