const { Table, CombinedTable } = require('./table');
const { Where, Having, Select, OrderBy, GroupBy } = require('./clause');

class Query {
  constructor() {
    this._duplications = new Set();
    this._table = new Table([]);
    this._WHERE = new Where();
    this._GROUPBY = new GroupBy();
    this._HAVING = new Having();
    this._SELECT = new Select();
    this._ORDERBY = new OrderBy();
  }

  execute() {
    const { _WHERE, _GROUPBY, _HAVING, _SELECT, _ORDERBY } = this;

    return [_WHERE, _GROUPBY, _HAVING, _SELECT, _ORDERBY].reduce(
      (rows, clause) => clause.execute(rows),
      this._table.getRows()
    );
  }

  from(...tables) {
    this._checkDuplication('FROM');

    this._table =
      tables.length > 1 ? new CombinedTable(tables) : new Table(tables[0]);

    return this;
  }

  select(fn) {
    this._checkDuplication('SELECT');

    this._SELECT.setSelectFn(fn);

    return this;
  }

  groupBy(...cols) {
    this._checkDuplication('GROUPBY');

    this._GROUPBY.setCols(cols);

    return this;
  }

  orderBy(fn) {
    this._checkDuplication('ORDERBY');

    this._ORDERBY.setCompareFn(fn);

    return this;
  }

  where(...conditions) {
    this._WHERE.addConditions(conditions);

    return this;
  }

  having(...conditions) {
    this._HAVING.addConditions(conditions);

    return this;
  }

  _checkDuplication(clause) {
    if (this._duplications.has(clause)) {
      throw new Error(`Duplicate ${clause}`);
    }

    this._duplications.add(clause);
  }
}

function query() {
  return new Query();
}

module.exports = { query };
