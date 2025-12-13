import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Card from 'Components/Card';
import FieldSet from 'Components/FieldSet';
import Icon from 'Components/Icon';
import PageSectionContent from 'Components/Page/PageSectionContent';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import AddMetadataProviderModal from './AddMetadataProviderModal';
import EditMetadataProviderModalConnector from './EditMetadataProviderModalConnector';
import MetadataProvider from './MetadataProvider';
import styles from './MetadataProviders.css';

class MetadataProviders extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isAddMetadataProviderModalOpen: false,
      isEditMetadataProviderModalOpen: false
    };
  }

  //
  // Listeners

  onAddMetadataProviderPress = () => {
    this.setState({ isAddMetadataProviderModalOpen: true });
  };

  onAddMetadataProviderModalClose = ({ metadataProviderSelected = false } = {}) => {
    this.setState({
      isAddMetadataProviderModalOpen: false,
      isEditMetadataProviderModalOpen: metadataProviderSelected
    });
  };

  onEditMetadataProviderModalClose = () => {
    this.setState({ isEditMetadataProviderModalOpen: false });
  };

  //
  // Render

  render() {
    const {
      items,
      onConfirmDeleteMetadataProvider,
      ...otherProps
    } = this.props;

    return (
      <FieldSet legend={translate('MetadataProviders')}>
        <PageSectionContent
          errorMessage={translate('UnableToLoadMetadataProviders')}
          {...otherProps}
        >
          <div className={styles.metadataProviders}>
            {
              items.map((item) => {
                return (
                  <MetadataProvider
                    key={item.id}
                    {...item}
                    onConfirmDeleteMetadataProvider={onConfirmDeleteMetadataProvider}
                  />
                );
              })
            }

            <Card
              className={styles.addMetadataProvider}
              onPress={this.onAddMetadataProviderPress}
            >
              <div className={styles.center}>
                <Icon
                  name={icons.ADD}
                  size={45}
                />
              </div>
            </Card>
          </div>
        </PageSectionContent>

        <AddMetadataProviderModal
          isOpen={this.state.isAddMetadataProviderModalOpen}
          onModalClose={this.onAddMetadataProviderModalClose}
        />

        <EditMetadataProviderModalConnector
          isOpen={this.state.isEditMetadataProviderModalOpen}
          onModalClose={this.onEditMetadataProviderModalClose}
        />
      </FieldSet>
    );
  }
}

MetadataProviders.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.object,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  onConfirmDeleteMetadataProvider: PropTypes.func.isRequired
};

export default MetadataProviders;
