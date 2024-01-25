const { CombinedTable } = require('./table');

test('CombinedTable', () => {
  const table = new CombinedTable([
    [1, 2],
    [4, 5],
  ]);

  expect(table.getRows()).toEqual([
    [1, 4],
    [1, 5],
    [2, 4],
    [2, 5],
  ]);
});
