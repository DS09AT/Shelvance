import React from 'react';
import FilterMenu from 'Components/Menu/FilterMenu';
import PageMenuButton from 'Components/Menu/PageMenuButton';
import { align } from 'Helpers/Props';
import InteractiveSearchFilterModalConnector from './InteractiveSearchFilterModalConnector';

interface InteractiveSearchFilterMenuProps {
  selectedFilterKey: string | number;
  filters: Array<Record<string, unknown>>;
  customFilters: Array<Record<string, unknown>>;
  onFilterSelect: (key: string | number) => void;
}

function InteractiveSearchFilterMenu({
  selectedFilterKey,
  filters,
  customFilters,
  onFilterSelect,
}: InteractiveSearchFilterMenuProps) {
  return (
    <div className="mb-2.5 flex justify-end">
      <FilterMenu
        alignMenu={align.RIGHT}
        selectedFilterKey={selectedFilterKey}
        filters={filters}
        customFilters={customFilters}
        buttonComponent={PageMenuButton}
        filterModalConnectorComponent={InteractiveSearchFilterModalConnector}
        onFilterSelect={onFilterSelect}
      />
    </div>
  );
}

export default InteractiveSearchFilterMenu;
