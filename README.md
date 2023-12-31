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

### Import:

```javascript
const { weaveTopics } = require('topic-weaver');
// import { weaveTopics } from 'topic-weaver' // for ESM
```

### Simple Examples:

> **Pick a meeting leader or notetaker:**

```javascript
const { weaveTopics } = require('topic-weaver');

const conceptMap = `
  #prompt
  Today's meeting notetaker is [person].

  #person
  Erlich
  Gilfoyle
  Dinesh
  Jared
  Monica
  Richard
`;

const { topics } = weaveTopics(conceptMap, 1);

console.log(topics);

/*

(Potential) Result:

> ['Dinesh']

*/
```

> **Make a list of narrative writing exercises:**

```javascript
const { weaveTopics } = require('topic-weaver');

const conceptMap = `
  #prompt
  Write a [length] [genre] about [theme].

  #length
  1 paragraph
  2 sentence
  1 page

  #genre
  short story
  poem
  journal entry

  #theme
  fantasy battles
  dystopian societies
  sci-fi technology
`;

const count = 3;

const { topics } = weaveTopics(conceptMap, count);

console.log(topics);

/*

(Potential) Result:

> [
>   'Write a 1 page poem about dystopian societies.',
>   'Write a 1 paragraph journal entry about fantasy battles.',
>   'Write a 2 sentence short story about sci-fi technology.'
> ]

*/
```

### Advanced Examples

> **Make a list of social media content ideas:**

```javascript
const { weaveTopics } = require('topic-weaver');

const conceptMap = `
  #social_media_content_ideas
  Create [video_style] of [craft] for [platform]

  #craft
  drawing realistic portraits
  setting up your studio
  painting fan requested characters

  #video_style
  a timelapse
  a quick before and after look
  a fast slideshow
  a single process shot

  #platform
  instagram
  youtube
  tiktok
`;

const count = 12;

const { topics } = weaveTopics(conceptMap, count);

console.log(topics.join('\n'));

/*

(Potential) Result:

> Create a fast slideshow of painting fan requested characters for instagram
> Create a quick before and after look of setting up your studio for tiktok
> Create a single process shot of painting fan requested characters for instagram
> Create a quick before and after look of painting fan requested characters for youtube
> Create a single process shot of drawing realistic portraits for instagram
> Create a timelapse of painting fan requested characters for tiktok
> Create a single process shot of setting up your studio for tiktok
> Create a timelapse of setting up your studio for instagram
> Create a single process shot of painting fan requested characters for tiktok
> Create a quick before and after look of painting fan requested characters for tiktok
> Create a single process shot of setting up your studio for youtube
> Create a fast slideshow of setting up your studio for instagram

*/
```

> **Generate 3d models with matching dimensions:**

```javascript
const { weaveTopics } = require('topic-weaver');

const conceptMap = `
  #model
  Construct a [color] [polygon]

  #color
  red
  blue

  #polygon
  cube of [length] x [width] x [height*matching]
  pyramid of [length] x [width] x [height*matching]

  #length
  100cm
  200cm
  300cm

  #width
  25cm
  50cm
  75cm

  #height
  200cm
  300cm
  400cm
`;

const count = 4;

const { topics } = weaveTopics(conceptMap, count);

console.log(topics.join('\n'));

/*

(Potential) Result:

> Construct a blue pyramid of 100cm x 50cm x 300cm
> Construct a red pyramid of 300cm x 50cm x 300cm
> Construct a blue cube of 200cm x 75cm x 300cm
> Construct a red cube of 200cm x 25cm x 300cm

*/
```

## Documentation

### Syntax

```
const { topics, issues } = weaveTopics(conceptMap, count);
```

- _**topics**_ is a `string[]` containing a list of generated strings
- _**issues**_ is a `string[]` containing a list of issues during generation
- _**conceptMap**_ is a multiline `string` formatted as follows:
  - `#` followed by a string is a _concept id_
  - any number of regular strings can be included separated by newlines after a line with `#` which are the results selected when that id is invoked
  - `[id]` is where a _concept id_ is used to tell the generator how to traverse the tree when generating results
  - `*` symbol followed by a string within `[]` like `[id*a]` is used to tell the generator to lock in the same value for any other instance of `[id*a]` during generation

### Options

|Option|Type|Description|Syntax
|-|-|-|-|
|**strictMode**|_boolean_|Throw an error if an issue occurs during topic generation|`weaveTopics(conceptMap, count, { generatorOptions: { strictMode: true } })`|
|**delimiter**|_string_|Custom seperator for each id or result string in a concept map (default is `\n`), note that this symbol cannot be used inside an id or result line|`weaveTopics(conceptMap, count, { parsingOptions: { delimiter: ';' } })`|
|**idSymbol**|_string_|Custom identifier for an `id` line in a concept map (default is `#`), note that this symbol cannot be used inside the id or a result line|`weaveTopics(conceptMap, count, { parsingOptions: { idSymbol: '$' } })`|
|**attemptLimit**|_number_|Limit of unique generation attempts before stopping the execution (default is `2000`)|`weaveTopics(conceptMap, count, { generatorOptions: { attemptLimit: 20 } })`|
|**recursionLimit**|_number_|Limit of recursions occuring during topic generation before stopping execution (default is `2000`)|`weaveTopics(conceptMap, count, { generatorOptions: { recursionLimit: 9999 } })`|

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
