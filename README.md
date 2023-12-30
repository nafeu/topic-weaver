# Topic Weaver

![Version](https://img.shields.io/github/v/tag/nafeu/topic-weaver?label=version)
![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/nafeu/topic-weaver/tests.yml)
[![codecov](https://codecov.io/gh/nafeu/topic-weaver/branch/main/graph/badge.svg)](https://codecov.io/gh/nafeu/topic-weaver)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Topic Weaver lets you generate unique combinations of topics utilizing a hierarchical concept map. Useful for general purpose random text generation, topic combinations, content creation, brainstorming, creative exploration and more.

## Installation

```bash
npm install topic-weaver
```

## Usage

#### Simple Example:

```javascript
import { weaveTopics } from 'topic-weaver';

const conceptMap = `
  #prompt
  Draw a [color] [shape].

  #color
  red

  #shape
  circle
  square
`;

const count = 2;

const { topics } = weaveTopics(conceptMap, count);

console.log(topics);
```

This will generate 2 random unique results using the provided concept map like so:

```
Draw a red circle.
Draw a red square.
```

## Documentation

|Option|Type|Description|Syntax
|-|-|-|-|
|**strictMode**|_boolean_|Throw an error if an issue occurs during topic generation|`weaveTopics(conceptMap, count, { generatorOptions: { strictMode: true } })`

>TODO: Update...

## Development

_Note: `topic-weaver` was developed on Node v20.10.0_

```
git clone https://github.com/nafeu/topic-weaver.git
cd topic-weaver
npm install
```

Install pre-commit hooks:

```
npx husky install
```

Run tests and coverage with the following commands:

- `npm run test`
- `npm run test:watch` (to run tests in watch mode)
- `npm run coverage` (to run tests with coverage report)
- `npm run coverage:watch` (to run tests with coverage report in watch mode)
- `npm run coverage:view` (to open coverage report)

Lint TypeScript code with:

- `npm run lint`

Format code with:

- `npm run format` (using prettier)

## Contributing

Feel free to open issues for bugs and feature requests or open pull requests to address them.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
