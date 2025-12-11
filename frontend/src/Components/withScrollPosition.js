import PropTypes from 'prop-types';
import React from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import scrollPositions from 'Store/scrollPositions';

function withScrollPosition(WrappedComponent, scrollPositionKey) {
  function ScrollPosition(props) {
    const location = useLocation();
    const navigationType = useNavigationType();

    const scrollTop = navigationType === 'POP' || (location.state && location.state.restoreScrollPosition) ?
      scrollPositions[scrollPositionKey] :
      0;

    return (
      <WrappedComponent
        {...props}
        scrollTop={scrollTop}
      />
    );
  }

  ScrollPosition.propTypes = {};

  return ScrollPosition;
}

export default withScrollPosition;
