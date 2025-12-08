import PropTypes from 'prop-types';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import ErrorBoundary from 'Components/Error/ErrorBoundary';
import PageContentError from './PageContentError';
import styles from './PageContent.css';

function PageContent(props) {
  const {
    className,
    title,
    children
  } = props;

  return (
    <ErrorBoundary errorComponent={PageContentError}>
      <Helmet>
        <title>{title ? `${title} - ${window.Readarr.instanceName}` : window.Readarr.instanceName}</title>
      </Helmet>
      <div className={className}>
        {children}
      </div>
    </ErrorBoundary>
  );
}

PageContent.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.node.isRequired
};

PageContent.defaultProps = {
  className: styles.content
};

export default PageContent;
