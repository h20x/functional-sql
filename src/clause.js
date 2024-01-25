class Where {
  constructor() {
    this._condition = null;
  }

  execute(rows) {
    return null == this._condition ? rows : rows.filter(this._condition);
  }

  addConditions(conditions) {
    this._condition = joinConditions(this._condition, conditions);
  }
}

class Having {
  constructor() {
    this._condition = null;
  }

  execute(groups) {
    return null == this._condition ? groups : groups.filter(this._condition);
  }

  addConditions(conditions) {
    this._condition = joinConditions(this._condition, conditions);
  }
}

class Select {
  constructor() {
    this._selectFn = null;
  }

  execute(rows) {
    return null == this._selectFn ? rows : rows.map(this._selectFn);
  }

  setSelectFn(fn) {
    this._selectFn = fn;
  }
}

class OrderBy {
  constructor() {
    this._compareFn = null;
  }

  execute(rows) {
    return null == this._compareFn ? rows : rows.sort(this._compareFn);
  }

  setCompareFn(fn) {
    this._compareFn = fn;
  }
}

class GroupBy {
  constructor() {
    this._cols = [];
  }

  execute(rows) {
    return this._group(rows);
  }

  setCols(cols) {
    this._cols = cols;
  }

  _group(rows, cols = this._cols) {
    if (!cols.length) {
      return rows;
    }

    const _cols = cols.slice();
    const col = _cols.shift();
    const groups = new Map();

    rows.forEach((row) => {
      const key = col(row);

      if (!groups.has(key)) {
        groups.set(key, []);
      }

      groups.get(key).push(row);
    });

    const result = [];

    for (let [key, items] of groups.entries()) {
      result.push([key, this._group(items, _cols)]);
    }

    return result;
  }
}

function joinConditions(c1, c2) {
  c1 = c1 || (() => true);

  return (item) => {
    return c1(item) && c2.some((fn) => fn(item));
  };
}

module.exports = { Where, Having, Select, OrderBy, GroupBy };
