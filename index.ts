const DEFAULT_DELIMITER = '\n';
const DEFAULT_ID_SYMBOL = '#';

const FIRST_INDEX = 0;
const SECOND_INDEX = 1;
const MIN_CONCEPT_KEY_LENGTH = 1;
const MAX_DELIMITER_LENGTH = 1;

type ParsingOptions = {
  delimiter?: string;
  idSymbol?: string;
};

type Concepts = {
  [key: string]: string[];
};

type ConceptMap = {
  concepts: Concepts;
  root: string | null;
};

export function parseConceptMap(text: string, options: ParsingOptions = {}): ConceptMap {
  const isMissingText: boolean = text === null || text === undefined || text.length === 0;

  if (isMissingText) {
    throw new Error('Missing concept map text parameter');
  }

  const { delimiter = DEFAULT_DELIMITER, idSymbol = DEFAULT_ID_SYMBOL } = options;

  if (idSymbol.length > MAX_DELIMITER_LENGTH) {
    throw new Error(`ID symbol "${idSymbol}" too long, must be one character`);
  }

  const concepts: Concepts = {};

  const conceptText = text.split(delimiter).filter((item) => {
    const isItemNotEmpty = item.length > 0 && item !== '';

    return isItemNotEmpty;
  });

  let activeKey: string | null = null;
  let root: string | null = null;

  for (const line of conceptText) {
    const isConceptKey = line[FIRST_INDEX] === idSymbol && line.length > MIN_CONCEPT_KEY_LENGTH;

    if (isConceptKey) {
      activeKey = line.substring(SECOND_INDEX);

      if (root === null) {
        root = activeKey;
      } else if (concepts.hasOwnProperty(activeKey)) {
        throw new Error(`Duplicate id: ${idSymbol}${activeKey}`);
      }
    } else if (activeKey) {
      concepts[activeKey] = concepts[activeKey] ? [...concepts[activeKey], line] : [line];
    }
  }

  if (root === null) {
    throw new Error('Missing root id');
  }

  return { concepts, root };
}

export function getRandomString(strings: string[]): string | null {
  if (strings.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * strings.length);
  return strings[randomIndex] || null;
}

export default { parseConceptMap, getRandomString };
