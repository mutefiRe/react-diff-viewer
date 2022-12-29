import { setup } from 'bem-cn';

export interface ReactDiffViewerStyles {
  diffContainer?: string;
  diffRemoved?: string;
  diffAdded?: string;
  line?: string;
  highlightedGutter?: string;
  contentText?: string;
  gutter?: string;
  highlightedLine?: string;
  lineNumber?: string;
  marker?: string;
  wordDiff?: string;
  wordAdded?: string;
  wordRemoved?: string;
  codeFoldGutter?: string;
  emptyGutter?: string;
  emptyLine?: string;
  codeFold?: string;
  titleBlock?: string;
  content?: string;
  splitView?: string;
  [key: string]: string | undefined;
}

export interface ReactDiffViewerStylesVariables {
  diffViewerBackground?: string;
  diffViewerTitleBackground?: string;
  diffViewerColor?: string;
  diffViewerTitleColor?: string;
  diffViewerTitleBorderColor?: string;
  addedBackground?: string;
  addedColor?: string;
  removedBackground?: string;
  removedColor?: string;
  wordAddedBackground?: string;
  wordRemovedBackground?: string;
  addedGutterBackground?: string;
  removedGutterBackground?: string;
  gutterBackground?: string;
  gutterBackgroundDark?: string;
  highlightBackground?: string;
  highlightGutterBackground?: string;
  codeFoldGutterBackground?: string;
  codeFoldBackground?: string;
  emptyLineBackground?: string;
  gutterColor?: string;
  addedGutterColor?: string;
  removedGutterColor?: string;
  codeFoldContentColor?: string;
}

export type ReactDiffViewerClassKey =
  | 'diffContainer'
  | 'diffRemoved'
  | 'diffAdded'
  | 'marker'
  | 'emptyGutter'
  | 'highlightedLine'
  | 'lineNumber'
  | 'highlightedGutter'
  | 'contentText'
  | 'gutter'
  | 'line'
  | 'wordDiff'
  | 'wordAdded'
  | 'wordRemoved'
  | 'codeFoldGutter'
  | 'emptyLine'
  | 'content'
  | 'titleBlock'
  | 'splitView'
  | 'codeFoldContent'
  | 'codeFold';

export type ReactDiffViewerStylesOverride = Partial<Record<ReactDiffViewerClassKey, string>>;

const block = setup({ el: '__', mod: '--' });
export const bem = block('react-diff-viewer');
