import React, { Component } from 'react';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import { kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import { Card } from 'ComponentsV2/UI';
import TagDetailsModal from './Details/TagDetailsModal';

interface TagProps {
  id: number;
  label: string;
  delayProfileIds: number[];
  importListIds: number[];
  notificationIds: number[];
  restrictionIds: number[];
  indexerIds: number[];
  downloadClientIds: number[];
  authorIds: number[];
  onConfirmDeleteTag: (payload: { id: number }) => void;
}

interface TagState {
  isDetailsModalOpen: boolean;
  isDeleteTagModalOpen: boolean;
}

class Tag extends Component<TagProps, TagState> {
  static defaultProps = {
    delayProfileIds: [],
    importListIds: [],
    notificationIds: [],
    restrictionIds: [],
    indexerIds: [],
    downloadClientIds: [],
    authorIds: [],
  };

  constructor(props: TagProps) {
    super(props);

    this.state = {
      isDetailsModalOpen: false,
      isDeleteTagModalOpen: false,
    };
  }

  onShowDetailsPress = () => {
    this.setState({ isDetailsModalOpen: true });
  };

  onDetailsModalClose = () => {
    this.setState({ isDetailsModalOpen: false });
  };

  onDeleteTagPress = () => {
    this.setState({
      isDetailsModalOpen: false,
      isDeleteTagModalOpen: true,
    });
  };

  onDeleteTagModalClose = () => {
    this.setState({ isDeleteTagModalOpen: false });
  };

  onConfirmDeleteTag = () => {
    this.props.onConfirmDeleteTag({ id: this.props.id });
  };

  render() {
    const {
      label,
      delayProfileIds,
      importListIds,
      notificationIds,
      restrictionIds,
      indexerIds,
      downloadClientIds,
      authorIds,
    } = this.props;

    const { isDetailsModalOpen, isDeleteTagModalOpen } = this.state;

    const isTagUsed = !!(
      delayProfileIds.length ||
      importListIds.length ||
      notificationIds.length ||
      restrictionIds.length ||
      indexerIds.length ||
      downloadClientIds.length ||
      authorIds.length
    );

    return (
      <>
        <Card
          className="flex-[150px_0_1] cursor-pointer"
          variant="bordered"
          onClick={this.onShowDetailsPress}
        >
          <div className="mb-5 whitespace-nowrap text-2xl font-light text-zinc-900 dark:text-zinc-100">
            {label}
          </div>

          {isTagUsed && (
            <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              {!!authorIds.length && <div>{authorIds.length} authors</div>}

              {!!delayProfileIds.length && (
                <div>
                  {delayProfileIds.length} delay profile{delayProfileIds.length > 1 && 's'}
                </div>
              )}

              {!!importListIds.length && (
                <div>
                  {importListIds.length} import list{importListIds.length > 1 && 's'}
                </div>
              )}

              {!!notificationIds.length && (
                <div>
                  {notificationIds.length} connection{notificationIds.length > 1 && 's'}
                </div>
              )}

              {!!restrictionIds.length && (
                <div>
                  {restrictionIds.length} restriction{restrictionIds.length > 1 && 's'}
                </div>
              )}

              {indexerIds.length ? (
                <div>
                  {indexerIds.length} indexer{indexerIds.length > 1 && 's'}
                </div>
              ) : null}

              {downloadClientIds.length ? (
                <div>
                  {downloadClientIds.length} download client{indexerIds.length > 1 && 's'}
                </div>
              ) : null}
            </div>
          )}

          {!isTagUsed && <div className="text-sm text-zinc-500 dark:text-zinc-400">No links</div>}
        </Card>

        <TagDetailsModal
          label={label}
          isTagUsed={isTagUsed}
          authorIds={authorIds}
          delayProfileIds={delayProfileIds}
          importListIds={importListIds}
          notificationIds={notificationIds}
          restrictionIds={restrictionIds}
          indexerIds={indexerIds}
          downloadClientIds={downloadClientIds}
          isOpen={isDetailsModalOpen}
          onModalClose={this.onDetailsModalClose}
          onDeleteTagPress={this.onDeleteTagPress}
        />

        <ConfirmModal
          isOpen={isDeleteTagModalOpen}
          kind={kinds.DANGER}
          title={translate('DeleteTag')}
          message={translate('DeleteTagMessageText', [label])}
          confirmLabel={translate('Delete')}
          onConfirm={this.onConfirmDeleteTag}
          onCancel={this.onDeleteTagModalClose}
        />
      </>
    );
  }
}

export default Tag;
