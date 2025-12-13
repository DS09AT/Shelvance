import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Card from 'Components/Card';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import { icons, kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import EditMetadataProviderModalConnector from './EditMetadataProviderModalConnector';
import styles from './MetadataProvider.css';

class MetadataProvider extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isEditMetadataProviderModalOpen: false,
      isDeleteMetadataProviderModalOpen: false
    };
  }

  //
  // Listeners

  onEditMetadataProviderPress = () => {
    this.setState({ isEditMetadataProviderModalOpen: true });
  };

  onEditMetadataProviderModalClose = () => {
    this.setState({ isEditMetadataProviderModalOpen: false });
  };

  onDeleteMetadataProviderPress = () => {
    this.setState({
      isEditMetadataProviderModalOpen: false,
      isDeleteMetadataProviderModalOpen: true
    });
  };

  onDeleteMetadataProviderModalClose= () => {
    this.setState({ isDeleteMetadataProviderModalOpen: false });
  };

  onConfirmDeleteMetadataProvider = () => {
    this.props.onConfirmDeleteMetadataProvider(this.props.id);
  };

  //
  // Render

  render() {
    const {
      id,
      name,
      enableAuthorSearch,
      enableBookSearch,
      priority
    } = this.props;

    return (
      <Card
        className={styles.metadataProvider}
        overlayContent={true}
        onPress={this.onEditMetadataProviderPress}
      >
        <div className={styles.name}>
          {name}
        </div>

        <div className={styles.enabled}>
          {
            (enableAuthorSearch || enableBookSearch) ?
              <Label kind={kinds.SUCCESS}>
                {translate('Enabled')}
              </Label> :
              <Label
                kind={kinds.DISABLED}
                outline={true}
              >
                {translate('Disabled')}
              </Label>
          }
        </div>

        {
          priority &&
            <div>
              <Label
                kind={kinds.DEFAULT}
                title={translate('Priority')}
              >
                {translate('Priority')}: {priority}
              </Label>
            </div>
        }

        {
          (enableAuthorSearch || enableBookSearch) &&
            <div>
              {
                enableAuthorSearch &&
                  <Label kind={kinds.SUCCESS}>
                    {translate('AuthorSearch')}
                  </Label>
              }

              {
                enableBookSearch &&
                  <Label kind={kinds.SUCCESS}>
                    {translate('BookSearch')}
                  </Label>
              }
            </div>
        }

        <EditMetadataProviderModalConnector
          id={id}
          isOpen={this.state.isEditMetadataProviderModalOpen}
          onModalClose={this.onEditMetadataProviderModalClose}
          onDeleteMetadataProviderPress={this.onDeleteMetadataProviderPress}
        />

        <ConfirmModal
          isOpen={this.state.isDeleteMetadataProviderModalOpen}
          kind={kinds.DANGER}
          title={translate('DeleteMetadataProvider')}
          message={translate('DeleteMetadataProviderMessageText', [name])}
          confirmLabel={translate('Delete')}
          onConfirm={this.onConfirmDeleteMetadataProvider}
          onCancel={this.onDeleteMetadataProviderModalClose}
        />
      </Card>
    );
  }
}

MetadataProvider.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  enableAuthorSearch: PropTypes.bool.isRequired,
  enableBookSearch: PropTypes.bool.isRequired,
  priority: PropTypes.number,
  onConfirmDeleteMetadataProvider: PropTypes.func.isRequired
};

export default MetadataProvider;
