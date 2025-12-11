function createSystemStatusSelector() {
  return (state) => state.system.status.item;
}

export default createSystemStatusSelector;
