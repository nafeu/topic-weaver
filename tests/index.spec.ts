import { describe, expect, it } from '@jest/globals';
import { parseConceptMap, getRandomString } from '../index';

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
