import PropTypes from 'prop-types';
import React, { Component } from 'react';
import TextTruncate from 'react-text-truncate';
import AuthorPoster from 'Author/AuthorPoster';
import HeartRating from 'Components/HeartRating';
import Icon from 'Components/Icon';
import Label from 'Components/Label';
import Link from 'Components/Link/Link';
import { icons, kinds, sizes } from 'Helpers/Props';
import dimensions from 'Styles/Variables/dimensions';
import fonts from 'Styles/Variables/fonts';
import stripHtml from 'Utilities/String/stripHtml';
import translate from 'Utilities/String/translate';
import AddNewAuthorModal from './AddNewAuthorModal';
import styles from './AddNewAuthorSearchResult.css';

const columnPadding = parseInt(dimensions.authorIndexColumnPadding);
const columnPaddingSmallScreen = parseInt(dimensions.authorIndexColumnPaddingSmallScreen);
const defaultFontSize = parseInt(fonts.defaultFontSize);
const lineHeight = parseFloat(fonts.lineHeight);

function calculateHeight(rowHeight, isSmallScreen) {
  let height = rowHeight - 45;

  if (isSmallScreen) {
    height -= columnPaddingSmallScreen;
  } else {
    height -= columnPadding;
  }

  return height;
}

class AddNewAuthorSearchResult extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isNewAddAuthorModalOpen: false
    };
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isExistingAuthor && this.props.isExistingAuthor) {
      this.onAddAuthorModalClose();
    }
  }

  //
  // Listeners

  onPress = () => {
    this.setState({ isNewAddAuthorModalOpen: true });
  };

  onAddAuthorModalClose = () => {
    this.setState({ isNewAddAuthorModalOpen: false });
  };

  onMBLinkPress = (event) => {
    event.stopPropagation();
  };

  //
  // Render

  render() {
    const {
      foreignAuthorId,
      titleSlug,
      authorName,
      year,
      disambiguation,
      status,
      overview,
      ratings,
      folder,
      images,
      born,
      died,
      genres,
      topWork,
      isExistingAuthor,
      isSmallScreen
    } = this.props;

    const {
      isNewAddAuthorModalOpen
    } = this.state;

    const linkProps = isExistingAuthor ? { to: `/author/${titleSlug}` } : { onPress: this.onPress };

    const endedString = 'Deceased';

    const height = calculateHeight(230, isSmallScreen);

    const bornYear = born ? new Date(born).getFullYear() : null;
    const diedYear = died ? new Date(died).getFullYear() : null;
    const lifespan = bornYear && diedYear ? `${bornYear} - ${diedYear}` : 
                     bornYear ? `Born ${bornYear}` : 
                     diedYear ? `Died ${diedYear}` : null;

    const topGenres = genres && genres.length > 0 ? genres.slice(0, 3) : null;

    return (
      <div className={styles.searchResult}>
        <div className={styles.authorBadge}>
          <Icon
            name={icons.INTERACTIVE}
            size={16}
          />
          <span className={styles.authorBadgeText}>Author</span>
        </div>
        
        <Link
          className={styles.underlay}
          {...linkProps}
        />

        <div className={styles.overlay}>
          {
            isSmallScreen ?
              null :
              <AuthorPoster
                className={styles.poster}
                images={images}
                size={250}
                overflow={true}
                lazy={false}
              />
          }

          <div className={styles.content}>
            <div className={styles.nameRow}>
              <div className={styles.nameContainer}>
                <div className={styles.name}>
                  {authorName}

                  {
                    authorName && !authorName.contains(year) && year ?
                      <span className={styles.year}>
                        ({year})
                      </span> :
                      null
                  }
                  {
                    !!disambiguation &&
                      <span className={styles.year}>({disambiguation})</span>
                  }
                </div>
              </div>

              <div className={styles.icons}>
                {
                  isExistingAuthor ?
                    <Icon
                      className={styles.alreadyExistsIcon}
                      name={icons.CHECK_CIRCLE}
                      size={36}
                      title={translate('AlreadyInYourLibrary')}
                    /> :
                    null
                }

                <Link
                  className={styles.mbLink}
                  to={`https://goodreads.com/author/show/${foreignAuthorId}`}
                  onPress={this.onMBLinkPress}
                >
                  <Icon
                    className={styles.mbLinkIcon}
                    name={icons.EXTERNAL_LINK}
                    size={28}
                  />
                </Link>
              </div>
            </div>

            <div>
              {
                topWork ?
                  <Label
                    kind={kinds.SUCCESS}
                    size={sizes.LARGE}
                    title="Top Work"
                  >
                    <Icon
                      name={icons.BOOK}
                      size={12}
                    />
                    {' '}
                    {topWork}
                  </Label> :
                  null
              }

              {
                lifespan ?
                  <Label
                    kind={kinds.INFO}
                    size={sizes.LARGE}
                  >
                    <Icon
                      name={icons.CALENDAR}
                      size={12}
                    />
                    {' '}
                    {lifespan}
                  </Label> :
                  null
              }

              {
                ratings && ratings.votes > 0 ?
                  <Label size={sizes.LARGE}>
                    <HeartRating
                      rating={ratings.value}
                      iconSize={13}
                    />
                    {' '}
                    ({ratings.votes.toLocaleString()})
                  </Label> :
                  null
              }

              {
                status === 'ended' ?
                  <Label
                    kind={kinds.DANGER}
                    size={sizes.LARGE}
                  >
                    {endedString}
                  </Label> :
                  null
              }

              {
                topGenres && topGenres.map((genre, index) => (
                  <Label
                    key={index}
                    kind={kinds.DEFAULT}
                    size={sizes.MEDIUM}
                  >
                    {genre}
                  </Label>
                ))
              }
            </div>

            <div
              className={styles.overview}
              style={{
                maxHeight: `${height}px`
              }}
            >
              <TextTruncate
                truncateText="…"
                line={Math.floor(height / (defaultFontSize * lineHeight))}
                text={stripHtml(overview)}
              />
            </div>
          </div>
        </div>

        <AddNewAuthorModal
          isOpen={isNewAddAuthorModalOpen && !isExistingAuthor}
          foreignAuthorId={foreignAuthorId}
          authorName={authorName}
          disambiguation={disambiguation}
          year={year}
          overview={overview}
          folder={folder}
          images={images}
          onModalClose={this.onAddAuthorModalClose}
        />
      </div>
    );
  }
}

AddNewAuthorSearchResult.propTypes = {
  foreignAuthorId: PropTypes.string,
  titleSlug: PropTypes.string,
  authorName: PropTypes.string,
  year: PropTypes.number,
  disambiguation: PropTypes.string,
  status: PropTypes.string,
  overview: PropTypes.string,
  ratings: PropTypes.object,
  folder: PropTypes.string,
  images: PropTypes.arrayOf(PropTypes.object),
  born: PropTypes.string,
  died: PropTypes.string,
  genres: PropTypes.arrayOf(PropTypes.string),
  topWork: PropTypes.string,
  isExistingAuthor: PropTypes.bool.isRequired,
  isSmallScreen: PropTypes.bool.isRequired
};

export default AddNewAuthorSearchResult;
