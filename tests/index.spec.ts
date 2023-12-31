import { describe, expect, it } from '@jest/globals';
import { parseConceptMap, getRandomString, generateTopics, PATTERN_ID, weaveTopics } from '../index';

describe('parseConceptMap', () => {
  describe('given a null or empty text value', () => {
    it('should throw an error', () => {
      expect(() => parseConceptMap('')).toThrow('Missing concept map text parameter');
      expect(() => parseConceptMap(null)).toThrow('Missing concept map text parameter');
    });
  });
  describe('given a non-empty string', () => {
    describe('with no id symbol', () => {
      it('should throw an error', () => {
        const exampleInput = 'root\nexample';

        expect(() => parseConceptMap(exampleInput)).toThrow('Missing root id');
      });
    });
    describe('with a flat heirarchy', () => {
      it('should return a valid concept map with root string and no issues', () => {
        const exampleInput = '#root\nexample';

        const result = parseConceptMap(exampleInput);

        expect(result).toEqual({
          concepts: {
            root: ['example'],
          },
          root: 'root',
        });
      });
      describe('with duplicate lines', () => {
        it('should return a valid concept map with root string and no issues', () => {
          const exampleInput = '#root\nexample\nexample';

          const result = parseConceptMap(exampleInput);

          expect(result).toEqual({
            concepts: {
              root: ['example', 'example'],
            },
            root: 'root',
          });
        });
      });
    });
    describe('with a deep heirarchy', () => {
      it('should return a valid concept map with root string and no issues', () => {
        const exampleInput = '#x\n[a]\n#a\n[b]\n#b\nc';

        const result = parseConceptMap(exampleInput);

        expect(result).toEqual({
          concepts: {
            x: ['[a]'],
            a: ['[b]'],
            b: ['c'],
          },
          root: 'x',
        });
      });
      describe('with a duplicate concept id', () => {
        it('should throw an error', () => {
          const exampleInput = '#x\n[a]\n#a\n[b]\n#a\n[d]\n#b\nc';

          expect(() => parseConceptMap(exampleInput)).toThrow('Duplicate id: #a');
        });
      });
    });
  });
  describe('given custom options', () => {
    describe('with a deep heirarchy', () => {
      describe('with a custom delimiter', () => {
        it('should return a valid concept map with root string and no issues', () => {
          const exampleInput = '#x;[a];#a;[b];#b;c';
          const options = { delimiter: ';' };

          const result = parseConceptMap(exampleInput, options);

          expect(result).toEqual({
            concepts: {
              x: ['[a]'],
              a: ['[b]'],
              b: ['c'],
            },
            root: 'x',
          });
        });
      });
      describe('with a custom idSymbol', () => {
        it('should return a valid concept map with root string and no issues', () => {
          const exampleInput = '|x\n[a]\n|a\n[b]\n|b\nc';
          const options = { idSymbol: '|' };

          const result = parseConceptMap(exampleInput, options);

          expect(result).toEqual({
            concepts: {
              x: ['[a]'],
              a: ['[b]'],
              b: ['c'],
            },
            root: 'x',
          });
        });

        describe('with an idSymbol longer than one character', () => {
          it('should throw an error', () => {
            const exampleInput = '--x\n[a]\n--a\n[b]\n--b\nc';
            const options = { idSymbol: '--' };

            expect(() => parseConceptMap(exampleInput, options)).toThrow(
              'ID symbol "--" too long, must be one character',
            );
          });
        });
      });
    });
  });
});

describe('getRandomString', () => {
  describe('with a valid non-empty array', () => {
    it('should return a valid item', () => {
      const myArray = ['apple', 'banana', 'orange', 'grape'];
      const result = getRandomString(myArray);
      expect(myArray).toContain(result);
    });
  });

  describe('with an empty array', () => {
    it('should return null', () => {
      const result = getRandomString([]);
      expect(result).toBeNull();
    });
  });

  describe('with an array with all null or undefined values', () => {
    it('should return null', () => {
      const result = getRandomString([null, undefined, null]);
      expect(result).toBeNull();
    });
  });
});

describe('PATTERN_ID', () => {
  it('matches a valid pattern', () => {
    const input = 'Some text [valid_pattern] more text';
    const matches = input.match(PATTERN_ID);

    expect(matches).toEqual(['[valid_pattern]']);
  });

  it('matches when preceded by another "["', () => {
    const input = 'Some text [[valid_pattern] more text';
    const matches = input.match(PATTERN_ID);

    expect(matches).toEqual(['[[valid_pattern]']);
  });

  it('matches when followed by another "]"', () => {
    const input = 'Some text [valid_pattern]] more text';
    const matches = input.match(PATTERN_ID);

    expect(matches).toEqual(['[valid_pattern]]']);
  });

  it('matches multiple valid patterns', () => {
    const input = '[pattern1] some text [pattern2] more text [pattern3]';
    const matches = input.match(PATTERN_ID);

    expect(matches).toEqual(['[pattern1]', '[pattern2]', '[pattern3]']);
  });

  it('does not match nested patterns', () => {
    const input = '[outer [inner] outer]';
    const matches = input.match(PATTERN_ID);

    expect(matches).toEqual(['[outer [inner]']);
  });
});

describe('generateTopics', () => {
  describe('given a valid non-empty concept map, count, and root', () => {
    describe('when count = 1', () => {
      it('should generate empty issues and an ideas array', () => {
        const result = generateTopics({ concepts: { root: ['a', 'b'] }, root: 'root' }, 1);

        expect(result.topics.length).toBe(1);
        expect([['a'], ['b']]).toContainEqual(result.topics);
      });
    });
    describe('when count > 1', () => {
      it('should generate empty issues and an ideas array', () => {
        const result = generateTopics({ concepts: { root: ['a', 'b'] }, root: 'root' }, 2);

        expect(result.issues.length).toBe(0);
        expect(result.topics.length).toBe(2);
        expect([['a', 'b'], ['b', 'a'], ['a'], ['b']]).toContainEqual(result.topics);
      });
    });
    describe('when given a heirarchy with count = 1', () => {
      it('should generate empty issues and an ideas array', () => {
        const result = generateTopics({ concepts: { root: ['[a] [b]'], a: ['1'], b: ['2'] }, root: 'root' }, 1);

        expect(result.issues.length).toBe(0);
        expect(result.topics.length).toBe(1);
        expect([['1 2']]).toContainEqual(result.topics);
      });
    });
    describe('when given an extended heirarchy with count = 1', () => {
      it('should generate empty issues and an ideas array', () => {
        const result = generateTopics(
          { concepts: { root: ['[a] [b]'], a: ['1', '2'], b: ['3', '4'] }, root: 'root' },
          1,
        );

        expect(result.issues.length).toBe(0);
        expect(result.topics.length).toBe(1);
        expect([['1 3'], ['1 4'], ['2 3'], ['2 4']]).toContainEqual(result.topics);
      });
    });
    describe('when given no-spaces in root with count = 1', () => {
      it('should generate empty issues and an ideas array', () => {
        const result = generateTopics({ concepts: { root: ['[a][b]'], a: ['1'], b: ['2'] }, root: 'root' }, 1);

        expect(result.issues.length).toBe(0);
        expect(result.topics.length).toBe(1);
        expect(result.topics[0]).toEqual('12');
      });
    });
    describe('when given escaped square brackets in root with count = 1', () => {
      it('should generate empty issues and an ideas array', () => {
        const resultA = generateTopics({ concepts: { root: ['[[a]][b]'], a: ['1'], b: ['2'] }, root: 'root' }, 1);

        expect(resultA.issues.length).toBe(0);
        expect(resultA.topics.length).toBe(1);
        expect(resultA.topics[0]).toEqual('[a]2');

        const resultB = generateTopics(
          { concepts: { root: ['[[a]] [b] [[c]] [d][e]'], b: ['1'], d: ['2'], e: ['3'] }, root: 'root' },
          1,
        );

        expect(resultB.issues.length).toBe(0);
        expect(resultB.topics.length).toBe(1);
        expect(resultB.topics[0]).toEqual('[a] 1 [c] 23');
      });
    });
    describe('when given a * symbol for fixed value generation', () => {
      it('should generate empty issues and an ideas array', () => {
        const result = generateTopics(
          {
            concepts: {
              root: ['[a*x][a*x][a*x][a*x][a*x][a*x][a*x][a*x][a*x][a*x][b]'],
              a: ['3', '4', '5'],
              b: ['2'],
            },
            root: 'root',
          },
          1,
        );

        expect(result.issues.length).toBe(0);
        expect(result.topics.length).toBe(1);
        expect([['33333333332'], ['44444444442'], ['55555555552']]).toContainEqual(result.topics);
      });

      describe('when given multiple fixed value caching ids', () => {
        it('should generate empty issues and an ideas array', () => {
          const result = generateTopics(
            {
              concepts: {
                root: ['[a*x][a*x][a*y][a*y]'],
                a: ['3', '4'],
              },
              root: 'root',
            },
            1,
          );

          expect(result.issues.length).toBe(0);
          expect(result.topics.length).toBe(1);
          expect([['3344'], ['3333'], ['4444'], ['4433']]).toContainEqual(result.topics);
        });
      });

      describe('when more than one * symbol is used in the id', () => {
        it('should throw an error', () => {
          expect(() => generateTopics({ concepts: { root: ['[a*x*y]'], a: ['1'] }, root: 'root' }, 1)).toThrow(
            'Invalid concept map id, too many * symbols: a*x*y',
          );
        });
      });
    });
  });
  describe('given a small valid non-empty concept map with high count, and root', () => {
    it('should return a maximum attempt issue', () => {
      const result = generateTopics({ concepts: { root: ['a'] }, root: 'root' }, 2, { attemptLimit: 2 });

      expect(result.issues.length).toBe(1);
      expect(result.topics.length).toBe(1);
      expect([['a']]).toContainEqual(result.topics);
      expect(result.issues).toEqual([
        'Maximum attempts reached (2), please expand possible unique combinations in your concept map.',
      ]);
    });

    describe('in strict mode', () => {
      it('should throw an error', () => {
        expect(() =>
          generateTopics({ concepts: { root: ['a'] }, root: 'root' }, 2, { attemptLimit: 2, strictMode: true }),
        ).toThrow('Maximum attempts reached (2), please expand possible unique combinations in your concept map.');
      });
    });
  });
  describe('given a small non-empty concept map with a cyclical mapping', () => {
    it('should return a maximum recursion issue', () => {
      const result = generateTopics({ concepts: { a: ['[b]'], b: ['[a]'] }, root: 'a' }, 1, { recursionLimit: 4 });

      expect(result.issues.length).toBe(1);
      expect(result.topics.length).toBe(1);
      expect([['[a]'], ['[b]']]).toContainEqual(result.topics);
      expect(result.issues).toEqual([
        'Recursion limit reached (4), please expand possible unique combinations in your concept map.',
      ]);
    });

    describe('in strict mode', () => {
      it('should throw an error', () => {
        expect(() =>
          generateTopics({ concepts: { a: ['[b]'], b: ['[a]'] }, root: 'a' }, 1, {
            recursionLimit: 4,
            strictMode: true,
          }),
        ).toThrow('Recursion limit reached (4), please expand possible unique combinations in your concept map.');
      });
    });
  });
  describe('given a small non-empty concept map with a root id', () => {
    it('should return a missing root id issue', () => {
      const result = generateTopics({ concepts: { a: ['[b]'], b: ['[a]'] }, root: 'x' }, 1);

      expect(result.issues.length).toBe(1);
      expect(result.topics.length).toBe(0);
      expect(result.issues).toEqual(['Missing root id (x) in concept map']);
    });

    describe('in strict mode', () => {
      it('should throw an error', () => {
        expect(() =>
          generateTopics({ concepts: { a: ['[b]'], b: ['[a]'] }, root: 'x' }, 1, { strictMode: true }),
        ).toThrow('Missing root id (x) in concept map');
      });
    });
  });
  describe('given a small non-empty concept map with a mismatched id', () => {
    it('should return an id matching issue', () => {
      const result = generateTopics({ concepts: { root: ['[a]'], a: ['[b] [c]'], b: ['x'] }, root: 'root' }, 1);

      expect(result.issues.length).toBe(1);
      expect(result.topics.length).toBe(1);
      expect(result.issues).toEqual(['Could not match the concept: c']);
    });

    describe('in strict mode', () => {
      it('should throw an error', () => {
        expect(() =>
          generateTopics({ concepts: { root: ['[a]'], a: ['[b] [c]'], b: ['x'] }, root: 'root' }, 1, {
            strictMode: true,
          }),
        ).toThrow('Could not match the concept: c');
      });
    });
  });
});

describe('weaveTopics', () => {
  describe('given a valid raw conceptMap string and count', () => {
    it('should return an appropriate array of string results', () => {
      const result = weaveTopics(`#root\ndraw a [color] [shape]\n#color\nred\nblue\n#shape\nsquare\ncircle`, 2);

      expect(result.topics.length).toBe(2);
      expect(result.issues.length).toBe(0);
      expect([
        ['draw a red circle', 'draw a red square'],
        ['draw a red square', 'draw a red circle'],
        ['draw a red circle', 'draw a blue circle'],
        ['draw a blue circle', 'draw a red circle'],
        ['draw a red square', 'draw a blue circle'],
        ['draw a blue circle', 'draw a red square'],
        ['draw a red square', 'draw a blue square'],
        ['draw a blue square', 'draw a red square'],
        ['draw a blue circle', 'draw a blue square'],
        ['draw a blue square', 'draw a blue circle'],
        ['draw a blue square', 'draw a red circle'],
        ['draw a red circle', 'draw a blue square'],
        ['draw a blue square', 'draw a red square'],
        ['draw a red square', 'draw a blue square'],
      ]).toContainEqual(result.topics);
    });
  });
  describe('given a valid raw conceptMap string, count and options', () => {
    it('should return an appropriate array of string results with issues', () => {
      const result = weaveTopics(`$root;draw a [color] [shape];$color;red;blue;$shape;square;circle`, 4, {
        parsingOptions: {
          delimiter: ';',
          idSymbol: '$',
        },
        generatorOptions: {
          attemptLimit: 2,
          recursionLimit: 2,
        },
      });

      expect(result.topics.length).toBe(2);
      expect([
        [
          'Recursion limit reached (2), please expand possible unique combinations in your concept map.',
          'Maximum attempts reached (2), please expand possible unique combinations in your concept map.',
        ],
        [
          'Maximum attempts reached (2), please expand possible unique combinations in your concept map.',
          'Recursion limit reached (2), please expand possible unique combinations in your concept map.',
        ],
      ]).toContainEqual(result.issues);
    });
  });
  describe('given a valid multiline raw conceptMap string and count', () => {
    it('should return an appropriate array of string results', () => {
      const conceptMap = `
        #prompt
        Draw a [color] [shape].
        #color
        red
        #shape
        circle
        square
      `;

      const result = weaveTopics(conceptMap, 2);

      expect(result.topics.length).toBe(2);
      expect([
        ['Draw a red circle.', 'Draw a red square.'],
        ['Draw a red square.', 'Draw a red circle.'],
      ]).toContainEqual(result.topics);
    });
  });
});
