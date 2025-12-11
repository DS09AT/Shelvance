import React from 'react';
import { useDragLayer } from 'react-dnd';
import DragPreviewLayer from 'Components/DragPreviewLayer';
import { TABLE_COLUMN } from 'Helpers/dragTypes';
import TableOptionsColumn from './TableOptionsColumn';
import styles from './TableOptionsColumnDragPreview.css';

function TableOptionsColumnDragPreview() {
  const {
    item,
    itemType,
    currentOffset
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getClientOffset()
  }));

  if (!currentOffset || itemType !== TABLE_COLUMN) {
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

  return (
    <DragPreviewLayer>
      <div
        className={styles.dragPreview}
        style={style}
      >
        <TableOptionsColumn
          isDragging={false}
          {...item}
        />
      </div>
    </DragPreviewLayer>
  );
}

export default TableOptionsColumnDragPreview;
