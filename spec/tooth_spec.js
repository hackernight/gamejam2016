describe("Clean Transition", function() {
  it("should never get cleaner than clean", function() {
    expect(cleanTransistion(CLEAN)).toBe(CLEAN);
  });
  it("can't clean cavities", function() {
    expect(cleanTransistion(CAVITY)).toBe(CAVITY);
  });
  it("decreases dirty state normally", function() {
    expect(cleanTransistion(DIRTIEST)).toBe(DIRTIER);
    expect(cleanTransistion(DIRTIER)).toBe(DIRTY);
    expect(cleanTransistion(DIRTY)).toBe(CLEAN);
  });
});

describe("Dirty Transition", function() {
  it("should never get dirtier than a cavity", function() {
    expect(dirtyTransition(CAVITY)).toBe(CAVITY);
  });
  it("increases dirty state normally", function() {
    expect(dirtyTransition(CLEAN)).toBe(DIRTY);
    expect(dirtyTransition(DIRTY)).toBe(DIRTIER);
    expect(dirtyTransition(DIRTIER)).toBe(DIRTIEST);
    expect(dirtyTransition(DIRTIEST)).toBe(CAVITY);
  });
});
