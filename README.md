# Topic Weaver

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/nafeu/topic-weaver/tests.yml)
[![codecov](https://codecov.io/gh/nafeu/topic-weaver/branch/main/graph/badge.svg)](https://codecov.io/gh/nafeu/topic-weaver)

Topic Weaver lets you generate unique combinations of topics utilizing a hierarchical concept map. Useful for general purpose random text generation, topic combinations, content creation, brainstorming, creative exploration and more.

## Installation

```bash
npm install topic-weaver
```

## Usage

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
|**strictMode**|_boolean_|Throw an error if an issue occurs during topic generation|`weaveTopics(conceptMap, count, { strictMode: true })`

>TODO: Update...

## Contributing

Feel free to open issues for bugs and feature requests or open pull requests to address them.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
