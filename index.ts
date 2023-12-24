const DEFAULT_DELIMITER = '\n';
const DEFAULT_ID_SYMBOL = '#';

const FIRST_INDEX = 0;
const SECOND_INDEX = 1;
const MIN_CONCEPT_KEY_LENGTH = 1;
const MAX_DELIMITER_LENGTH = 1;

export const DEFAULT_ATTEMPT_LIMIT = 2000;
export const DEFAULT_RECURSION_LIMIT = 2000;

export const PATTERN_ID = /(?<!\[)\[(?:(?!\[\[).)*?\](?!\])/g;
export const PATTERN_SQUARE_BRACKET = /^\[|\]$/g;
export const PATTERN_DOUBLE_SQUARE_BRACKET = /\[\[(.*?)\]\]/g;

interface ParsingOptions {
  delimiter?: string;
  idSymbol?: string;
}

type Concepts = {
  [key: string]: string[];
};

interface ConceptMap {
  concepts: Concepts;
  root: string | null;
}

interface GeneratorOptions {
  attemptLimit?: number;
  recursionLimit?: number;
}

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

export const generateIdeas = (conceptMap: ConceptMap, count: number, options: GeneratorOptions = {}) => {
  const { concepts, root } = conceptMap;

  const { attemptLimit = DEFAULT_ATTEMPT_LIMIT, recursionLimit = DEFAULT_RECURSION_LIMIT } = options;

  const conceptCollection = Object.keys(concepts).map((key) => ({
    id: key,
    data: concepts[key],
  }));

  let originalIdeaCounter = count;
  let attemptCount = 0;
  let recursionCount = 0;

  const ideas: string[] = [];
  let issues = [];

  const interpolate = (inputString: string) => {
    recursionCount += 1;

    if (recursionCount >= recursionLimit) {
      issues.push(
        `Recursion limit reached (${recursionLimit}), please expand possible unique combinations in your concept map.`,
      );
      return inputString;
    }

    let input = inputString;
    const matches = inputString.matchAll(PATTERN_ID);

    for (const [match] of matches) {
      const isEscapedMatch = match.match(PATTERN_DOUBLE_SQUARE_BRACKET) !== null;

      if (isEscapedMatch) {
        input = input.replace(match, match.replace(PATTERN_SQUARE_BRACKET, ''));
        continue;
      }

      const id = match.replace(PATTERN_SQUARE_BRACKET, '');
      const matchedConcept = conceptCollection.find((concept) => concept.id === id);

      if (matchedConcept) {
        input = input.replace(match, interpolate(getRandomString(matchedConcept.data) as string));
      } else {
        issues.push(`Could not match the concept: ${id}`);
        break;
      }
    }

    return input;
  };

  while (originalIdeaCounter > 0 && attemptCount < attemptLimit) {
    const rootConcept = conceptCollection.find((concept) => concept.id === root);

    if (rootConcept) {
      const randomStringRootConcept = getRandomString(rootConcept.data);
      const idea = interpolate(randomStringRootConcept as string);

      const isOriginalIdea = !ideas.includes(idea);

      if (isOriginalIdea) {
        ideas.push(idea);
        originalIdeaCounter -= 1;
      }

      attemptCount += 1;
    } else {
      issues.push(`Missing root id (${root}) in concept map`);
      break;
    }
  }

  if (attemptCount === attemptLimit) {
    issues.push(
      `Maximum attempts reached (${attemptLimit}), please expand possible unique combinations in your concept map.`,
    );
  }

  issues = [...new Set(issues)];

  return { ideas, issues };
};

export default { parseConceptMap, generateIdeas };
