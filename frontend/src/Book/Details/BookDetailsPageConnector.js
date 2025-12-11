import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { withRouter } from 'Helpers/withRouter';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import NotFound from 'Components/NotFound';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import translate from 'Utilities/String/translate';
import BookDetailsConnector from './BookDetailsConnector';

function createMapStateToProps() {
  return createSelector(
    (state, { params }) => params,
    (state) => state.books,
    (state) => state.authors,
    (params, books, author) => {
      const titleSlug = params.titleSlug;
      const isFetching = books.isFetching || author.isFetching;
      const isPopulated = books.isPopulated && author.isPopulated;

      // if books have been fetched, make sure requested one exists
      // otherwise don't map titleSlug to trigger not found page
      if (!isFetching && isPopulated) {
        const bookIndex = _.findIndex(books.items, { titleSlug });
        if (bookIndex === -1) {
          return {
            isFetching,
            isPopulated
          };
        }
      }

      return {
        titleSlug,
        isFetching,
        isPopulated
      };
    }
  );
}

const mapDispatchToProps = {};

class BookDetailsPageConnector extends Component {

  //
  // Render

  render() {
    const {
      titleSlug,
      isFetching,
      isPopulated
    } = this.props;

    if (!titleSlug) {
      return (
        <NotFound
          message={translate('SorryThatBookCannotBeFound')}
        />
      );
    }

    if (isFetching || !isPopulated) {
      return (
        <PageContent title={translate('Loading')}>
          <PageContentBody>
            <LoadingIndicator />
          </PageContentBody>
        </PageContent>
      );
    }

    return (
      <BookDetailsConnector
        titleSlug={titleSlug}
      />
    );
  }
}

BookDetailsPageConnector.propTypes = {
  titleSlug: PropTypes.string,
  params: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  isPopulated: PropTypes.bool.isRequired
};

export default withRouter(connect(createMapStateToProps, mapDispatchToProps)(BookDetailsPageConnector));
