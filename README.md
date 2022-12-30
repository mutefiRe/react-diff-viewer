
<p align="center">
  <img src='https://i.ibb.co/DKrGhVQ/Frame-1-1.png' width="100%" alt='React Diff Viewer' />
</p>
<br/>

[![Build Status](https://travis-ci.com/praneshr/react-diff-viewer.svg?branch=master)](https://travis-ci.com/praneshr/react-diff-viewer)
[![npm version](https://badge.fury.io/js/react-diff-viewer.svg)](https://badge.fury.io/js/react-diff-viewer)
[![GitHub license](https://img.shields.io/github/license/praneshr/react-diff-viewer.svg)](https://github.com/praneshr/react-diff-viewer/blob/master/LICENSE)

A simple and beautiful text diff viewer component made with [Diff](https://github.com/kpdecker/jsdiff) and [React](https://reactjs.org).

Inspired from Github diff viewer, it includes features like split view, inline view, word diff, line highlight and more. It is highly customizable and it supports almost all languages.

Check [here](https://github.com/praneshr/react-diff-viewer/tree/v2.0) for v2.0

## Install

```bash
yarn add react-diff-viewer

# or

npm i react-diff-viewer
```

## Usage

```javascript
import React, { PureComponent } from 'react';
import ReactDiffViewer from 'react-diff-viewer';

const oldCode = `
const a = 10
const b = 10
const c = () => console.log('foo')

if(a > 10) {
  console.log('bar')
}

console.log('done')
`;
const newCode = `
const a = 10
const boo = 10

if(a === 10) {
  console.log('bar')
}
`;

class Diff extends PureComponent {
  render = () => {
    return (
      <ReactDiffViewer oldValue={oldCode} newValue={newCode} splitView={true} />
    );
  };
}
```

## Props

| Prop                      | Type            | Default                        | Description                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------- | --------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| oldValue                  | `string`        | `''`                           | Old value as string.                                                                                                                                                                                                                                                                                                                                                                                             |
| newValue                  | `string`        | `''`                           | New value as string.                                                                                                                                                                                                                                                                                                                                                                                             |
| splitView                 | `boolean`       | `true`                         | Switch between `unified` and `split` view.                                                                                                                                                                                                                                                                                                                                                                       |
| disableWordDiff           | `boolean`       | `false`                        | Show and hide word diff in a diff line.                                                                                                                                                                                                                                                                                                                                                                          |
| compareMethod             | `DiffMethod`    | `DiffMethod.CHARS`             | JsDiff text diff method used for diffing strings. Check out the [guide](https://github.com/praneshr/react-diff-viewer/tree/v3.0.0#text-block-diff-comparison) to use different methods.                                                                                                                                                                                                                          |
| hideLineNumbers           | `boolean`       | `false`                        | Show and hide line numbers.                                                                                                                                                                                                                                                                                                                                                                                      |
| renderContent             | `function`      | `undefined`                    | Render Prop API to render code in the diff viewer. Helpful for [syntax highlighting](#syntax-highlighting)                                                                                                                                                                                                                                                                                                       |
| onLineNumberClick         | `function`      | `undefined`                    | Event handler for line number click. `(lineId: string) => void`                                                                                                                                                                                                                                                                                                                                                  |
| highlightLines            | `array[string]` | `[]`                           | List of lines to be highlighted. Works together with `onLineNumberClick`. Line number are prefixed with `L` and `R` for the left and right section of the diff viewer, respectively. For example, `L-20` means 20th line in the left pane. To highlight a range of line numbers, pass the prefixed line number as an array. For example, `[L-2, L-3, L-4, L-5]` will highlight the lines `2-5` in the left pane. |
| showDiffOnly              | `boolean`       | `true`                         | Shows only the diffed lines and folds the unchanged lines                                                                                                                                                                                                                                                                                                                                                        |
| extraLinesSurroundingDiff | `number`        | `3`                            | Number of extra unchanged lines surrounding the diff. Works along with `showDiffOnly`.                                                                                                                                                                                                                                                                                                                           |
| codeFoldMessageRenderer   | `function`      | `Expand {number} of lines ...` | Render Prop API to render code fold message.                                                                                                                                                                                                                                                                                                                                                                     |
| classes                    | `object`        | `{}`                           | To override styles. Learn more about [overriding styles](#overriding-styles)                                                                                                                                                                                                                                                                                                                 |
| leftTitle                 | `string`        | `undefined`                    | Column title for left section of the diff in split view. This will be used as the only title in inline view.                                                                                                                                                                                                                                                                                                     |
| rightTitle                | `string`        | `undefined`                    | Column title for right section of the diff in split view. This will be ignored in inline view.                                                                                                                                                                                                                                                                                                                   |
| linesOffset               | `number`        | `0`                            | Number to start count code lines from.                                                                                                                                                                                                                                                                                                                                                                           |

## Instance Methods

`resetCodeBlocks()` - Resets the expanded code blocks to it's initial state. Return `true` on successful reset and `false` during unsuccessful reset.

## Syntax Highlighting

Syntax highlighting is a bit tricky when combined with diff. Here, React Diff Viewer provides a simple render prop API to handle syntax highlighting. Use `renderContent(content: string) => JSX.Element` and your favorite syntax highlighting library to achieve this.

An example using [Prism JS](https://prismjs.com)

```html
// Load Prism CSS
<link
  href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.15.0/prism.min.css"
/>

// Load Prism JS
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.15.0/prism.min.js"></script>
```

```javascript
import React, { PureComponent } from 'react';
import ReactDiffViewer from 'react-diff-viewer';
import 'react-diff-viewer/lib/light.css';

const oldCode = `
const a = 10
const b = 10
const c = () => console.log('foo')

if(a > 10) {
  console.log('bar')
}

console.log('done')
`;
const newCode = `
const a = 10
const boo = 10

if(a === 10) {
  console.log('bar')
}
`;

class Diff extends PureComponent {
  highlightSyntax = str => (
    <pre
      style={{ display: 'inline' }}
      dangerouslySetInnerHTML={{
        __html: Prism.highlight(str, Prism.languages.javascript),
      }}
    />
  );

  render = () => {
    return (
      <ReactDiffViewer
        oldValue={oldCode}
        newValue={newCode}
        splitView={true}
        renderContent={this.highlightSyntax}
      />
    );
  };
}
```

## Text block diff comparison

Different styles of text block diffing are possible by using the enums corresponding to variou JsDiff methods ([learn more](https://github.com/kpdecker/jsdiff/tree/v4.0.1#api)). The supported methods are as follows.

```javascript
enum DiffMethod {
  CHARS = 'diffChars',
  WORDS = 'diffWords',
  WORDS_WITH_SPACE = 'diffWordsWithSpace',
  LINES = 'diffLines',
  TRIMMED_LINES = 'diffTrimmedLines',
  SENTENCES = 'diffSentences',
  CSS = 'diffCss',
}
```

```javascript
import React, { PureComponent } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';

const oldCode = `
{
  "name": "Original name",
  "description": null
}
`;
const newCode = `
{
  "name": "My updated name",
  "description": "Brand new description",
  "status": "running"
}
`;

class Diff extends PureComponent {
  render = () => {
    return (
      <ReactDiffViewer
        oldValue={oldCode}
        newValue={newCode}
        compareMethod={DiffMethod.WORDS}
        splitView={true}
      />
    );
  };
}
```

## Overriding Styles

React Diff Viewer uses css for styling. It also offers a simple way to override styles. You can supply different class names.

Below are the default class object keys.

```javascript

// Default style keys

const defaultClasses = {
  diffContainer?: 'react-diff-viewer',
  diffRemoved?: 'react-diff-viewer__line-cell--diff-removed',
  diffAdded?: 'react-diff-viewer__line-cell--diff-added',
  marker?: 'react-diff-viewer__marker',
  emptyGutter?: 'react-diff-viewer__gutter--empty',
  highlightedLine?: 'react-diff-viewer__line-cell--highlight',
  lineNumber?: 'react-diff-viewer__line-number',
  highlightedGutter?: 'react-diff-viewer__gutter--highlight',
  contentText?: 'react-diff-viewer__content-text',
  gutter?: 'react-diff-viewer__gutter',
  line?: 'react-diff-viewer__line',
  wordDiff?: 'react-diff-viewer__word-diff',
  wordAdded?: 'react-diff-viewer__word-diff--word-added',
  wordRemoved?: 'react-diff-viewer__word-diff--word-removed',
  codeFoldGutter?: 'react-diff-viewer__code-fold-gutter',
  codeFold?: 'react-diff-viewer__code-fold',
  emptyLine?: 'react-diff-viewer__line-cell--empty',
  content?: 'react-diff-viewer__content',
  titleBlock?: 'react-diff-viewer__title-block',
  splitView?: 'react-diff-viewer--split-view',
}
```

To override any style, just pass the class names to the `classes` prop.

```css
/* styles.css */
.diff-viewer__line {
  padding: 10px 2px;
}

.diff-viewer__line:hover {
  background: #a26ea1;
}
```

```javascript
import React, { PureComponent } from 'react';
import ReactDiffViewer from 'react-diff-viewer';
import './styles.css'

const oldCode = `
const a = 10
const b = 10
const c = () => console.log('foo')

if(a > 10) {
  console.log('bar')
}

console.log('done')
`;
const newCode = `
const a = 10
const boo = 10

if(a === 10) {
  console.log('bar')
}
`;

class Diff extends PureComponent {
  highlightSyntax = str => (
    <span
      style={{ display: 'inline' }}
      dangerouslySetInnerHTML={{
        __html: Prism.highlight(str, Prism.languages.javascript),
      }}
    />
  );

  render = () => {
    const classes = {
      line: 'diff-viewer__line',
    };

    return (
      <ReactDiffViewer
        styles={newStyles}
        oldValue={oldCode}
        newValue={newCode}
        splitView={true}
        renderContent={this.highlightSyntax}
      />
    );
  };
}
```

## Local Development

```bash
yarn install
yarn build # or use yarn build:watch
yarn start:examples
```

Check package.json for more build scripts.

## License

MIT
