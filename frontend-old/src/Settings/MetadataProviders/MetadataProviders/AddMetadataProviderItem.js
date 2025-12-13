import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Button from 'Components/Link/Button';
import Link from 'Components/Link/Link';
import { sizes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import styles from './AddMetadataProviderItem.css';

class AddMetadataProviderItem extends Component {

  //
  // Listeners

  onMetadataProviderSelect = () => {
    const {
      implementation
    } = this.props;

    this.props.onMetadataProviderSelect({ implementation });
  };

  //
  // Render

  render() {
    const {
      implementationName,
      infoLink
    } = this.props;

    return (
      <div className={styles.metadataProvider}>
        <Link
          className={styles.underlay}
          onPress={this.onMetadataProviderSelect}
        />

        <div className={styles.overlay}>
          <div className={styles.name}>
            {implementationName}
          </div>

          {
            infoLink &&
              <div className={styles.actions}>
                <Button
                  to={infoLink}
                  size={sizes.SMALL}
                >
                  {translate('MoreInfo')}
                </Button>
              </div>
          }
        </div>
      </div>
    );
  }
}

AddMetadataProviderItem.propTypes = {
  implementation: PropTypes.string.isRequired,
  implementationName: PropTypes.string.isRequired,
  infoLink: PropTypes.string,
  onMetadataProviderSelect: PropTypes.func.isRequired
};

export default AddMetadataProviderItem;
