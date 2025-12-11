import React from 'react';
import { useDragLayer } from 'react-dnd';
import DragPreviewLayer from 'Components/DragPreviewLayer';
import { QUALITY_PROFILE_ITEM } from 'Helpers/dragTypes';
import QualityProfileItem from './QualityProfileItem';
import styles from './QualityProfileItemDragPreview.css';

function QualityProfileItemDragPreview() {
  const {
    item,
    itemType,
    currentOffset
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getClientOffset()
  }));

  if (!currentOffset || itemType !== QUALITY_PROFILE_ITEM) {
    return null;
  }

  const { x, y } = currentOffset;
  const transform = `translate3d(${x}px, ${y}px, 0)`;

  const style = {
    position: 'absolute',
    WebkitTransform: transform,
    msTransform: transform,
    transform
  };

  const {
    editGroups,
    groupId,
    qualityId,
    name,
    allowed
  } = item;

  // TODO: Show a different preview for groups

  return (
    <DragPreviewLayer>
      <div
        className={styles.dragPreview}
        style={style}
      >
        <QualityProfileItem
          editGroups={editGroups}
          isPreview={true}
          qualityId={groupId || qualityId}
          name={name}
          allowed={allowed}
          isDragging={false}
        />
      </div>
    </DragPreviewLayer>
  );
}

export default QualityProfileItemDragPreview;
