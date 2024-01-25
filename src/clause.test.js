const { GroupBy } = require('./clause');

test('GroupBy', () => {
  const persons = [
    { name: 'Peter', profession: 'teacher' },
    { name: 'Michael', profession: 'teacher' },
    { name: 'Peter', profession: 'teacher' },
    { name: 'Anna', profession: 'scientific' },
  ];

  const groupBy = new GroupBy();
  groupBy.setCols([(person) => person.profession, (person) => person.name]);

  expect(groupBy.execute(persons)).toEqual([
    [
      'teacher',
      [
        ['Peter', [persons[0], persons[2]]],
        ['Michael', [persons[1]]],
      ],
    ],
    ['scientific', [['Anna', [persons[3]]]]],
  ]);
});
