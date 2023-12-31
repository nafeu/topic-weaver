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

const FIXED_VALUE_ID_DELIMITER = '*';

type Concepts = {
  [key: string]: string[];
};

interface ConceptMap {
  concepts: Concepts;
  root: string | null;
}

interface ParsingOptions {
  delimiter?: string;
  idSymbol?: string;
}

interface GeneratorOptions {
  attemptLimit?: number;
  recursionLimit?: number;
  strictMode?: boolean;
}

interface WeaveOptions {
  parsingOptions?: ParsingOptions;
  generatorOptions?: GeneratorOptions;
}

interface Topics {
  topics: string[];
  issues: string[];
}

type FixedValueCache = {
  [key: string]: { [innerKey: string]: string };
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

  const conceptText = text
    .split(delimiter)
    .filter((line) => {
      const isLineNotEmpty = line.length > 0 && line !== '' && line.trim() !== '';

      return isLineNotEmpty;
    })
    .map((line) => line.trim());

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

export function generateTopics(conceptMap: ConceptMap, count: number, options: GeneratorOptions = {}): Topics {
  const { concepts, root } = conceptMap;
  const fixedValueCache: FixedValueCache = {};

  const { attemptLimit = DEFAULT_ATTEMPT_LIMIT, recursionLimit = DEFAULT_RECURSION_LIMIT, strictMode } = options;

  const conceptCollection = Object.keys(concepts).map((key) => ({
    id: key,
    data: concepts[key],
  }));

  let originalTopicCounter = count;
  let attemptCount = 0;
  let recursionCount = 0;

  const topics: string[] = [];
  let issues = [];

  const interpolate = (inputString: string) => {
    recursionCount += 1;

    if (recursionCount >= recursionLimit) {
      const issueMessage = `Recursion limit reached (${recursionLimit}), please expand possible unique combinations in your concept map.`;

      if (strictMode) {
        throw new Error(issueMessage);
      }

      issues.push(issueMessage);

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

      const fullId = match.replace(PATTERN_SQUARE_BRACKET, '');
      const [id, fixedValueCacheId] = fullId.split(FIXED_VALUE_ID_DELIMITER);

      const starSymbolCount: number | undefined = fullId.match(/\*/g)?.length;
      const isInvalidCacheId = starSymbolCount && starSymbolCount > 1;

      if (isInvalidCacheId) {
        throw new Error(`Invalid concept map id, too many * symbols: ${fullId}`);
      }

      const matchedConcept = conceptCollection.find((concept) => concept.id === id);

      if (matchedConcept) {
        const isFixedValueInCache =
          fixedValueCacheId && fixedValueCache[id] && fixedValueCache[id][fixedValueCacheId] !== undefined;

        if (isFixedValueInCache) {
          const cachedString = fixedValueCache[id][fixedValueCacheId];

          input = input.replace(match, cachedString as string);
        } else {
          const interpolatedString = interpolate(getRandomString(matchedConcept.data) as string);

          if (fixedValueCacheId && fixedValueCache[id]) {
            fixedValueCache[id] = {
              ...fixedValueCache[id],
              [fixedValueCacheId]: interpolatedString,
            };
          } else if (fixedValueCacheId) {
            fixedValueCache[id] = { [fixedValueCacheId]: interpolatedString };
          }

          input = input.replace(match, interpolatedString as string);
        }
      } else {
        const issueMessage = `Could not match the concept: ${id}`;

        if (strictMode) {
          throw new Error(issueMessage);
        }

        issues.push(issueMessage);
        break;
      }
    }

    return input;
  };

  while (originalTopicCounter > 0 && attemptCount < attemptLimit) {
    const rootConcept = conceptCollection.find((concept) => concept.id === root);

    if (rootConcept) {
      const randomStringRootConcept = getRandomString(rootConcept.data);
      const topic = interpolate(randomStringRootConcept as string);

      const isOriginalTopic = !topics.includes(topic);

      if (isOriginalTopic) {
        topics.push(topic);
        originalTopicCounter -= 1;
      }

      attemptCount += 1;
    } else {
      const issueMessage = `Missing root id (${root}) in concept map`;

      if (strictMode) {
        throw new Error(issueMessage);
      }

      issues.push(issueMessage);
      break;
    }
  }

  if (attemptCount === attemptLimit) {
    const issueMessage = `Maximum attempts reached (${attemptLimit}), please expand possible unique combinations in your concept map.`;

    if (strictMode) {
      throw new Error(issueMessage);
    }

    issues.push(issueMessage);
  }

  issues = [...new Set(issues)];

  return { topics, issues };
}

export function weaveTopics(text: string, count: number, options: WeaveOptions = {}): Topics {
  const { parsingOptions = {}, generatorOptions = {} } = options;

  const conceptMap = parseConceptMap(text, parsingOptions);
  const output = generateTopics(conceptMap, count, generatorOptions);

  return output;
}

export default { parseConceptMap, generateTopics, weaveTopics };
