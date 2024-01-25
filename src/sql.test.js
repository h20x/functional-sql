const { query } = require('./sql');

describe('SQL', () => {
  const persons = [
    {
      name: 'Peter',
      profession: 'teacher',
      age: 20,
      maritalStatus: 'married',
    },
    {
      name: 'Michael',
      profession: 'teacher',
      age: 50,
      maritalStatus: 'single',
    },
    {
      name: 'Peter',
      profession: 'teacher',
      age: 20,
      maritalStatus: 'married',
    },
    {
      name: 'Anna',
      profession: 'scientific',
      age: 20,
      maritalStatus: 'married',
    },
    {
      name: 'Rose',
      profession: 'scientific',
      age: 50,
      maritalStatus: 'married',
    },
    {
      name: 'Anna',
      profession: 'scientific',
      age: 20,
      maritalStatus: 'single',
    },
    {
      name: 'Anna',
      profession: 'politician',
      age: 50,
      maritalStatus: 'married',
    },
  ];

  test('Basic SELECT', () => {
    const numbers = [1, 2, 3];

    expect(query().select().from(numbers).execute()).toEqual(numbers);
    expect(query().select().execute()).toEqual([]);
    expect(query().from(numbers).execute()).toEqual(numbers);
    expect(query().execute()).toEqual([]);
    expect(query().from(numbers).select().execute()).toEqual(numbers);
  });

  test('Basic SELECT and WHERE over objects', () => {
    expect(query().select().from(persons).execute()).toEqual(persons);

    // SELECT profession FROM persons
    expect(query().select(pick('profession')).from(persons).execute()).toEqual([
      'teacher',
      'teacher',
      'teacher',
      'scientific',
      'scientific',
      'scientific',
      'politician',
    ]);

    expect(query().select(pick('profession')).execute()).toEqual([]);

    // SELECT profession FROM persons WHERE profession="teacher"
    expect(
      query()
        .select(pick('profession'))
        .from(persons)
        .where(isTeacher)
        .execute()
    ).toEqual(['teacher', 'teacher', 'teacher']);

    // SELECT * FROM persons WHERE profession="teacher"
    expect(query().from(persons).where(isTeacher).execute()).toEqual(
      persons.slice(0, 3)
    );

    // SELECT name FROM persons WHERE profession="teacher"
    expect(
      query().select(pick('name')).from(persons).where(isTeacher).execute()
    ).toEqual(['Peter', 'Michael', 'Peter']);

    expect(
      query().where(isTeacher).from(persons).select(pick('name')).execute()
    ).toEqual(['Peter', 'Michael', 'Peter']);
  });

  test('GROUP BY', () => {
    // SELECT * FROM persons GROUPBY profession <- Bad in SQL but possible in JavaScript
    expect(
      query().select().from(persons).groupBy(pick('profession')).execute()
    ).toEqual([
      ['teacher', find({ profession: 'teacher' })],
      ['scientific', find({ profession: 'scientific' })],
      ['politician', find({ profession: 'politician' })],
    ]);

    // SELECT * FROM persons WHERE profession='teacher' GROUPBY profession
    expect(
      query()
        .select()
        .from(persons)
        .where(isTeacher)
        .groupBy(pick('profession'))
        .execute()
    ).toEqual([['teacher', find({ profession: 'teacher' })]]);

    // SELECT profession FROM persons GROUPBY profession
    expect(
      query()
        .select(professionGroup)
        .from(persons)
        .groupBy(pick('profession'))
        .execute()
    ).toEqual(['teacher', 'scientific', 'politician']);

    // SELECT * FROM persons WHERE profession='teacher' GROUPBY profession, name
    expect(
      query()
        .select()
        .from(persons)
        .groupBy(pick('profession'), pick('name'))
        .execute()
    ).toEqual([
      [
        'teacher',
        [
          ['Peter', find({ profession: 'teacher', name: 'Peter' })],
          ['Michael', find({ profession: 'teacher', name: 'Michael' })],
        ],
      ],
      [
        'scientific',
        [
          ['Anna', find({ profession: 'scientific', name: 'Anna' })],
          ['Rose', find({ profession: 'scientific', name: 'Rose' })],
        ],
      ],
      [
        'politician',
        [['Anna', find({ profession: 'politician', name: 'Anna' })]],
      ],
    ]);

    // SELECT * FROM persons WHERE profession='teacher' GROUPBY profession, name, age, maritalStatus
    expect(
      query()
        .select()
        .from(persons)
        .groupBy(
          pick('profession'),
          pick('name'),
          pick('age'),
          pick('maritalStatus')
        )
        .execute()
    ).toEqual([
      [
        'teacher',
        [
          [
            'Peter',
            [
              [
                20,
                [
                  [
                    'married',
                    find({
                      profession: 'teacher',
                      name: 'Peter',
                      age: 20,
                      maritalStatus: 'married',
                    }),
                  ],
                ],
              ],
            ],
          ],
          [
            'Michael',
            [
              [
                50,
                [
                  [
                    'single',
                    find({
                      profession: 'teacher',
                      name: 'Michael',
                      age: 50,
                      maritalStatus: 'single',
                    }),
                  ],
                ],
              ],
            ],
          ],
        ],
      ],
      [
        'scientific',
        [
          [
            'Anna',
            [
              [
                20,
                [
                  [
                    'married',
                    find({
                      profession: 'scientific',
                      name: 'Anna',
                      age: 20,
                      maritalStatus: 'married',
                    }),
                  ],
                  [
                    'single',
                    find({
                      profession: 'scientific',
                      name: 'Anna',
                      age: 20,
                      maritalStatus: 'single',
                    }),
                  ],
                ],
              ],
            ],
          ],
          [
            'Rose',
            [
              [
                50,
                [
                  [
                    'married',
                    find({
                      profession: 'scientific',
                      name: 'Rose',
                      age: 50,
                      maritalStatus: 'married',
                    }),
                  ],
                ],
              ],
            ],
          ],
        ],
      ],
      [
        'politician',
        [
          [
            'Anna',
            [
              [
                50,
                [
                  [
                    'married',
                    find({
                      profession: 'politician',
                      name: 'Anna',
                      age: 50,
                      maritalStatus: 'married',
                    }),
                  ],
                ],
              ],
            ],
          ],
        ],
      ],
    ]);

    // SELECT profession, count(profession) FROM persons GROUPBY profession
    expect(
      query()
        .select(professionCount)
        .from(persons)
        .groupBy(pick('profession'))
        .execute()
    ).toEqual([
      ['teacher', 3],
      ['scientific', 3],
      ['politician', 1],
    ]);

    // SELECT profession, count(profession) FROM persons GROUPBY profession ORDER BY profession
    expect(
      query()
        .select(professionCount)
        .from(persons)
        .groupBy(pick('profession'))
        .orderBy(naturalCompare)
        .execute()
    ).toEqual([
      ['politician', 1],
      ['scientific', 3],
      ['teacher', 3],
    ]);

    function professionGroup(group) {
      return group[0];
    }

    function professionCount(group) {
      return [group[0], group[1].length];
    }
  });

  test('Numbers', () => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    // SELECT * FROM numbers
    expect(query().select().from(numbers).execute()).toEqual(numbers);

    // SELECT * FROM numbers GROUP BY parity
    expect(query().select().from(numbers).groupBy(parity).execute()).toEqual([
      ['odd', [1, 3, 5, 7, 9]],
      ['even', [2, 4, 6, 8]],
    ]);

    // SELECT * FROM numbers GROUP BY parity, isPrime
    expect(
      query().select().from(numbers).groupBy(parity, prime).execute()
    ).toEqual([
      [
        'odd',
        [
          ['divisible', [1, 9]],
          ['prime', [3, 5, 7]],
        ],
      ],
      [
        'even',
        [
          ['prime', [2]],
          ['divisible', [4, 6, 8]],
        ],
      ],
    ]);

    // SELECT * FROM numbers GROUP BY parity HAVING
    expect(
      query().select().from(numbers).groupBy(parity).having(odd).execute()
    ).toEqual([['odd', [1, 3, 5, 7, 9]]]);

    // SELECT * FROM numbers ORDER BY value DESC
    expect(
      query().select().from(numbers).orderBy(descendentCompare).execute()
    ).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1]);

    // SELECT * FROM number WHERE number < 3 OR number > 4
    expect(
      query().select().from(numbers).where(lessThan3, greaterThan4).execute()
    ).toEqual([1, 2, 5, 6, 7, 8, 9]);

    function isEven(number) {
      return 0 === number % 2;
    }

    function parity(number) {
      return isEven(number) ? 'even' : 'odd';
    }

    function isPrime(number) {
      if (number < 2) {
        return false;
      }

      let divisor = 2;

      for (; number % divisor !== 0; divisor++);

      return divisor === number;
    }

    function prime(number) {
      return isPrime(number) ? 'prime' : 'divisible';
    }

    function odd(group) {
      return 'odd' === group[0];
    }

    function lessThan3(number) {
      return number < 3;
    }

    function greaterThan4(number) {
      return number > 4;
    }
  });

  test('Frequency', () => {
    const persons = [
      ['Peter', 3],
      ['Anna', 4],
      ['Peter', 7],
      ['Michael', 10],
    ];

    const numbers = [1, 2, 1, 3, 5, 6, 1, 2, 5, 6];

    // SELECT name, sum(value) FROM persons ORDER BY naturalCompare GROUP BY nameGrouping
    expect(
      query()
        .select(sumValues)
        .from(persons)
        .orderBy(naturalCompare)
        .groupBy(nameGrouping)
        .execute()
    ).toEqual([
      ['Anna', 4],
      ['Michael', 10],
      ['Peter', 10],
    ]);

    // SELECT number, count(number) FROM numbers GROUP BY number
    expect(
      query().select(frequency).from(numbers).groupBy(id).execute()
    ).toEqual([
      { value: 1, frequency: 3 },
      { value: 2, frequency: 2 },
      { value: 3, frequency: 1 },
      { value: 5, frequency: 2 },
      { value: 6, frequency: 2 },
    ]);

    // SELECT number, count(number) FROM numbers GROUP BY number HAVING count(number) > 1 AND isPair(number)
    expect(
      query()
        .select(frequency)
        .from(numbers)
        .groupBy(id)
        .having(greatThan1)
        .having(isPair)
        .execute()
    ).toEqual([
      { value: 2, frequency: 2 },
      { value: 6, frequency: 2 },
    ]);

    function nameGrouping(person) {
      return person[0];
    }

    function sumValues(value) {
      return [
        value[0],
        value[1].reduce((result, person) => result + person[1], 0),
      ];
    }

    function frequency(group) {
      return { value: group[0], frequency: group[1].length };
    }

    function greatThan1(group) {
      return group[1].length > 1;
    }

    function isPair(group) {
      return 0 === group[0] % 2;
    }
  });

  test('JOIN', () => {
    const teachers = [
      {
        teacherId: '1',
        teacherName: 'Peter',
      },
      {
        teacherId: '2',
        teacherName: 'Anna',
      },
    ];

    const students = [
      {
        studentName: 'Michael',
        tutor: '1',
      },
      {
        studentName: 'Rose',
        tutor: '2',
      },
    ];

    const numbers1 = [1, 2];
    const numbers2 = [4, 5];

    // SELECT studentName, teacherName FROM teachers, students WHERE teachers.teacherId = students.tutor
    expect(
      query()
        .select(student)
        .from(teachers, students)
        .where(teacherJoin)
        .execute()
    ).toEqual([
      { studentName: 'Michael', teacherName: 'Peter' },
      { studentName: 'Rose', teacherName: 'Anna' },
    ]);

    expect(query().select().from(numbers1, numbers2).execute()).toEqual([
      [1, 4],
      [1, 5],
      [2, 4],
      [2, 5],
    ]);

    // SELECT studentName, teacherName FROM teachers, students WHERE teachers.teacherId = students.tutor AND tutor = 1
    expect(
      query()
        .select(student)
        .from(teachers, students)
        .where(teacherJoin)
        .where(tutor1)
        .execute()
    ).toEqual([{ studentName: 'Michael', teacherName: 'Peter' }]);

    function teacherJoin(join) {
      return join[0].teacherId === join[1].tutor;
    }

    function student(join) {
      return {
        studentName: join[1].studentName,
        teacherName: join[0].teacherName,
      };
    }

    function tutor1(join) {
      return '1' === join[1].tutor;
    }
  });

  test('Duplication exception', () => {
    expect(() => {
      query().select().select().execute();
    }).toThrow('Duplicate SELECT');

    expect(() => {
      query().select().from([]).select().execute();
    }).toThrow('Duplicate SELECT');

    expect(() => {
      query().select().from([]).from([]).execute();
    }).toThrow('Duplicate FROM');

    expect(() => {
      query().select().from([]).orderBy(id).orderBy(id).execute();
    }).toThrow('Duplicate ORDERBY');

    expect(() => {
      query().select().groupBy(id).from([]).groupBy(id).execute();
    }).toThrow('Duplicate GROUPBY');
  });

  function isTeacher(person) {
    return 'teacher' === person.profession;
  }

  function pick(p) {
    return (o) => o[p];
  }

  function id(value) {
    return value;
  }

  function naturalCompare(value1, value2) {
    return value1 < value2 ? -1 : value1 > value2 ? 1 : 0;
  }

  function descendentCompare(number1, number2) {
    return number2 - number1;
  }

  function find(q) {
    const keys = Object.keys(q);

    return persons.filter((person) => {
      return keys.every((key) => person[key] === q[key]);
    });
  }
});
