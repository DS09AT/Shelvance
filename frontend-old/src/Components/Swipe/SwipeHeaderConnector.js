import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { withRouter } from 'Helpers/withRouter';
import createDimensionsSelector from 'Store/Selectors/createDimensionsSelector';
import SwipeHeader from './SwipeHeader';

function createMapStateToProps() {
  return createSelector(
    createDimensionsSelector(),
    (dimensions) => {
      return {
        isSmallScreen: dimensions.isSmallScreen
      };
    }
  );
}

function createMapDispatchToProps(dispatch, props) {
  return {
    onGoTo(url) {
      props.navigate(url);
    }
  };
}

class SwipeHeaderConnector extends Component {

  //
  // Render

  render() {
    return (
      <SwipeHeader
        {...this.props}
      />
    );
  }
}

SwipeHeaderConnector.propTypes = {
  onGoTo: PropTypes.func.isRequired
};

export default withRouter(connect(createMapStateToProps, createMapDispatchToProps)(SwipeHeaderConnector));
