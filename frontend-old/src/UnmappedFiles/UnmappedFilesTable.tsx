import React, { Component } from 'react';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import TableOptionsModalWrapper from 'Components/Table/TableOptions/TableOptionsModalWrapper';
import VirtualTable from 'Components/Table/VirtualTable';
import VirtualTableRow from 'Components/Table/VirtualTableRow';
import { align, icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import UnmappedFilesTableHeader from './UnmappedFilesTableHeader';
import UnmappedFilesTableRow from './UnmappedFilesTableRow';

interface Column {
  name: string;
  label?: string;
  isVisible: boolean;
  isSortable?: boolean;
  isModifiable?: boolean;
}

interface UnmappedFile {
  id: number;
  path: string;
  size: number;
  quality: any;
  dateAdded: string;
}

interface UnmappedFilesTableProps {
  isFetching: boolean;
  isPopulated: boolean;
  error?: object;
  items: UnmappedFile[];
  columns: Column[];
  sortKey?: string;
  sortDirection?: string;
  onTableOptionChange: (payload: any) => void;
  onSortPress: (sortKey: string) => void;
  isScanningFolders: boolean;
  onAddMissingAuthorsPress: () => void;
  deleteUnmappedFile: (id: number) => void;
  allSelected: boolean;
  allUnselected: boolean;
  selectedState: Record<number, boolean>;
  onSelectAllChange: (selected: boolean) => void;
  onSelectedChange: (id: number, selected: boolean) => void;
}

interface UnmappedFilesTableState {
  scroller: any;
}

class UnmappedFilesTable extends Component<UnmappedFilesTableProps, UnmappedFilesTableState> {
  constructor(props: UnmappedFilesTableProps) {
    super(props);

    this.state = {
      scroller: null
    };
  }

  setScrollerRef = (ref: any) => {
    this.setState({ scroller: ref });
  };

  rowRenderer = ({ key, rowIndex, style }: { key: string; rowIndex: number; style: React.CSSProperties }) => {
    const {
      items,
      columns,
      selectedState,
      onSelectedChange,
      deleteUnmappedFile
    } = this.props;

    const item = items[rowIndex];

    return (
      <VirtualTableRow
        key={key}
        style={style}
      >
        <UnmappedFilesTableRow
          key={item.id}
          columns={columns}
          isSelected={selectedState[item.id]}
          onSelectedChange={onSelectedChange}
          deleteUnmappedFile={deleteUnmappedFile}
          {...item}
        />
      </VirtualTableRow>
    );
  };

  render() {
    const {
      isFetching,
      isPopulated,
      error,
      items,
      columns,
      sortKey,
      sortDirection,
      allSelected,
      allUnselected,
      onTableOptionChange,
      onSortPress,
      onSelectAllChange,
      isScanningFolders,
      onAddMissingAuthorsPress,
      ...otherProps
    } = this.props;

    const { scroller } = this.state;

    return (
      <PageContent title={translate('UnmappedFiles')}>
        <PageToolbar>
          <PageToolbarSection>
            <PageToolbarButton
              label={translate('AddMissing')}
              iconName={icons.ADD_MISSING_AUTHORS}
              isDisabled={isPopulated && !error && !items.length}
              isSpinning={isScanningFolders}
              onPress={onAddMissingAuthorsPress}
            />
          </PageToolbarSection>

          <PageToolbarSection alignContent={align.RIGHT}>
            <TableOptionsModalWrapper
              {...otherProps}
              columns={columns}
              onTableOptionChange={onTableOptionChange}
            >
              <PageToolbarButton
                label={translate('Options')}
                iconName={icons.TABLE}
              />
            </TableOptionsModalWrapper>
          </PageToolbarSection>
        </PageToolbar>

        <PageContentBody>
          {isFetching && !isPopulated && <LoadingIndicator />}

          {!isFetching && error && <div>Unable to load unmapped files</div>}

          {isPopulated && !error && !items.length && (
            <div className="text-center text-zinc-500 dark:text-zinc-400 py-20">
              {translate('NoUnmappedFiles')}
            </div>
          )}

          {isPopulated && !error && !!items.length && scroller && (
            <VirtualTable
              items={items}
              isSmallScreen={false}
              scroller={scroller}
              rowHeight={38}
              overscanRowCount={2}
              rowRenderer={this.rowRenderer}
              header={
                <UnmappedFilesTableHeader
                  columns={columns}
                  sortKey={sortKey}
                  sortDirection={sortDirection}
                  allSelected={allSelected}
                  allUnselected={allUnselected}
                  onSortPress={onSortPress}
                  onSelectAllChange={onSelectAllChange}
                  onTableOptionChange={onTableOptionChange}
                />
              }
            />
          )}

          {isPopulated && !error && !!items.length && !scroller && (
            <div ref={this.setScrollerRef} />
          )}
        </PageContentBody>
      </PageContent>
    );
  }
}

export default UnmappedFilesTable;
