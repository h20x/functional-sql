class Table {
  constructor(rows) {
    this._rows = rows.slice();
  }

  getRows() {
    return this._rows.slice();
  }
}

class CombinedTable {
  constructor(tables) {
    this._tables = tables.map((table) => table.slice());
  }

  getRows() {
    return this._combineTables();
  }

  _combineTables(cTable = [], cRow = [], tables = this._tables) {
    if (tables.length) {
      tables = tables.slice();
      const rows = tables.shift();
      rows.forEach((row) => {
        this._combineTables(cTable, cRow.concat(row), tables);
      });
    } else {
      cTable.push(cRow);
    }

    return cTable;
  }
}

module.exports = { Table, CombinedTable };
