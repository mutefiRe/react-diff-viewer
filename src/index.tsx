import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as cn from 'classnames';

import {
  computeLineInformation,
  LineInformation,
  DiffInformation,
  DiffType,
  DiffMethod,
} from './compute-lines';
import { bem, ReactDiffViewerStylesOverride } from './styles';

export enum LineNumberPrefix {
  LEFT = 'L',
  RIGHT = 'R',
}

export interface ReactDiffViewerProps {
  // Old value to compare.
  oldValue: string;
  // New value to compare.
  newValue: string;
  // Enable/Disable split view.
  splitView?: boolean;
  // Set line Offset
  linesOffset?: number;
  // Enable/Disable word diff.
  disableWordDiff?: boolean;
  // JsDiff text diff method from https://github.com/kpdecker/jsdiff/tree/v4.0.1#api
  compareMethod?: DiffMethod;
  // Number of unmodified lines surrounding each line diff.
  extraLinesSurroundingDiff?: number;
  // Show/hide line number.
  hideLineNumbers?: boolean;
  // Show only diff between the two values.
  showDiffOnly?: boolean;
  // Render prop to format final string before displaying them in the UI.
  renderContent?: (source: string) => JSX.Element;
  // Render prop to format code fold message.
  codeFoldMessageRenderer?: (
    totalFoldedLines: number,
    leftStartLineNumber: number,
    rightStartLineNumber: number,
  ) => JSX.Element;
  // Event handler for line number click.
  onLineNumberClick?: (
    lineId: string,
    event: React.MouseEvent<HTMLTableCellElement>,
  ) => void;
  // Array of line ids to highlight lines.
  highlightLines?: string[];
  // Style overrides.
  classes?: ReactDiffViewerStylesOverride;
  // Title for left column
  leftTitle?: string | JSX.Element;
  // Title for left column
  rightTitle?: string | JSX.Element;
  className?: string;
}

export interface ReactDiffViewerState {
  // Array holding the expanded code folding.
  expandedBlocks?: number[];
}

class DiffViewer extends React.Component<
ReactDiffViewerProps,
ReactDiffViewerState
> {
  public static defaultProps: ReactDiffViewerProps = {
    oldValue: '',
    newValue: '',
    splitView: true,
    highlightLines: [],
    disableWordDiff: false,
    compareMethod: DiffMethod.CHARS,
    classes: {},
    hideLineNumbers: false,
    extraLinesSurroundingDiff: 3,
    showDiffOnly: true,
    linesOffset: 0,
  };

  public static propTypes = {
    oldValue: PropTypes.string.isRequired,
    newValue: PropTypes.string.isRequired,
    splitView: PropTypes.bool,
    disableWordDiff: PropTypes.bool,
    compareMethod: PropTypes.oneOf(Object.values(DiffMethod)),
    renderContent: PropTypes.func,
    onLineNumberClick: PropTypes.func,
    extraLinesSurroundingDiff: PropTypes.number,
    classes: PropTypes.object,
    hideLineNumbers: PropTypes.bool,
    showDiffOnly: PropTypes.bool,
    highlightLines: PropTypes.arrayOf(PropTypes.string),
    leftTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    rightTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    linesOffset: PropTypes.number,
  };

  public constructor(props: ReactDiffViewerProps) {
    super(props);

    this.state = {
      expandedBlocks: [],
    };
  }

  /**
	 * Resets code block expand to the initial stage. Will be exposed to the parent component via
	 * refs.
	 */
  public resetCodeBlocks = (): boolean => {
    if (this.state.expandedBlocks.length > 0) {
      this.setState({
        expandedBlocks: [],
      });
      return true;
    }
    return false;
  };

  /**
	 * Pushes the target expanded code block to the state. During the re-render,
	 * this value is used to expand/fold unmodified code.
	 */
  private onBlockExpand = (id: number): void => {
    const prevState = this.state.expandedBlocks.slice();
    prevState.push(id);

    this.setState({
      expandedBlocks: prevState,
    });
  };

  /**
	 * Returns a function with clicked line number in the closure. Returns an no-op function when no
	 * onLineNumberClick handler is supplied.
	 *
	 * @param id Line id of a line.
	 */
  private onLineNumberClickProxy = (id: string): any => {
    if (this.props.onLineNumberClick) {
      return (e: any): void => this.props.onLineNumberClick(id, e);
    }
    return (): void => {};
  };

  /**
	 * Maps over the word diff and constructs the required React elements to show word diff.
	 *
	 * @param diffArray Word diff information derived from line information.
	 * @param renderer Optional renderer to format diff words. Useful for syntax highlighting.
	 */
  private renderWordDiff = (
    diffArray: DiffInformation[],
    renderer?: (chunk: string) => JSX.Element,
  ): JSX.Element[] => {
    const { classes = {} } = this.props;

    return diffArray.map(
      (wordDiff, i): JSX.Element => {
        return (
          <span
            key={i}
            className={cn(
              bem('word-diff', {
                'word-added': wordDiff.type === DiffType.ADDED,
                'word-removed': wordDiff.type === DiffType.REMOVED,
              }).toString(),
              classes.wordDiff,
              {
                [classes.wordAdded]: wordDiff.type === DiffType.ADDED,
                [classes.wordRemoved]: wordDiff.type === DiffType.REMOVED,
              },
            )}>
            {renderer ? renderer(wordDiff.value as string) : wordDiff.value}
          </span>
        );
      },
    );
  };

  /**
	 * Maps over the line diff and constructs the required react elements to show line diff. It calls
	 * renderWordDiff when encountering word diff. This takes care of both inline and split view line
	 * renders.
	 *
	 * @param lineNumber Line number of the current line.
	 * @param type Type of diff of the current line.
	 * @param prefix Unique id to prefix with the line numbers.
	 * @param value Content of the line. It can be a string or a word diff array.
	 * @param additionalLineNumber Additional line number to be shown. Useful for rendering inline
	 *  diff view. Right line number will be passed as additionalLineNumber.
	 * @param additionalPrefix Similar to prefix but for additional line number.
	 */
  private renderLine = (
    lineNumber: number,
    type: DiffType,
    prefix: LineNumberPrefix,
    value: string | DiffInformation[],
    additionalLineNumber?: number,
    additionalPrefix?: LineNumberPrefix,
  ): JSX.Element => {
    const {
      classes = {},
      hideLineNumbers,
      highlightLines,
      renderContent,
      splitView,
    } = this.props;
    const lineNumberTemplate = `${prefix}-${lineNumber}`;
    const additionalLineNumberTemplate = `${additionalPrefix}-${additionalLineNumber}`;
    const highlightLine = highlightLines.includes(lineNumberTemplate)
      || highlightLines.includes(additionalLineNumberTemplate);
    const added = type === DiffType.ADDED;
    const removed = type === DiffType.REMOVED;
    let content;
    if (Array.isArray(value)) {
      content = this.renderWordDiff(value, renderContent);
    } else if (renderContent) {
      content = renderContent(value);
    } else {
      content = value;
    }

    return (
      <React.Fragment>
        {!hideLineNumbers && (
          <td
            onClick={
              lineNumber && this.onLineNumberClickProxy(lineNumberTemplate)
            }
            className={cn(bem('gutter', {
              empty: !lineNumber,
              'diff-added': added,
              'diff-removed': removed,
              highlight: highlightLine,
            }).toString(), bem('line-cell', {
              'diff-added': added,
              'diff-removed': removed,
            }).toString(), classes.gutter, {
              [classes.emptyGutter]: !lineNumber,
              [classes.diffAdded]: added,
              [classes.diffRemoved]: removed,
              [classes.highlightedGutter]: highlightLine,
            })}>
            <pre className={cn(bem('line-number').toString(), classes.lineNumber)}>
              {lineNumber}
            </pre>
          </td>
        )}
        {!splitView && !hideLineNumbers && (
          <td
            onClick={
              additionalLineNumber
              && this.onLineNumberClickProxy(additionalLineNumberTemplate)
            }
            className={cn(bem('gutter', {
              empty: !additionalLineNumber,
              highlight: highlightLine,
            }).toString(), bem('line-cell', {
              'diff-added': added,
              'diff-removed': removed,
            }).toString(), classes.gutter, {
              [classes.emptyGutter]: !additionalLineNumber,
              [classes.diffAdded]: added,
              [classes.diffRemoved]: removed,
              [classes.highlightedGutter]: highlightLine,
            })}>
            <pre className={cn(bem('line-number').toString(), classes.lineNumber)}>
              {additionalLineNumber}
            </pre>
          </td>
        )}
        <td
          className={cn(bem('marker').toString(),
            bem('line-cell', {
              empty: !content,
              'diff-added': added,
              'diff-removed': removed,
              highlight: highlightLine,
            }).toString(), classes.marker, {
              [classes.emptyLine]: !content,
              [classes.diffAdded]: added,
              [classes.diffRemoved]: removed,
              [classes.highlightedLine]: highlightLine,
            })}>
          <pre>
            {added && '+'}
            {removed && '-'}
          </pre>
        </td>
        <td
          className={cn(bem('content').toString(),
            bem('line-cell', {
              empty: !content,
              'diff-added': added,
              'diff-removed': removed,
              highlight: highlightLine,
            }).toString(), classes.content, {
              [classes.emptyLine]: !content,
              [classes.diffAdded]: added,
              [classes.diffRemoved]: removed,
              [classes.highlightedLine]: highlightLine,
            })}>
          <pre className={cn(bem('content-text').toString(), classes.contentText)}>{content}</pre>
        </td>
      </React.Fragment>
    );
  };

  /**
	 * Generates lines for split view.
	 *
	 * @param obj Line diff information.
	 * @param obj.left Life diff information for the left pane of the split view.
	 * @param obj.right Life diff information for the right pane of the split view.
	 * @param index React key for the lines.
	 */
  private renderSplitView = (
    { left, right }: LineInformation,
    index: number,
  ): JSX.Element => {
    const { classes = {} } = this.props;

    return (
      <tr key={index} className={cn(bem('line').toString(), classes.line)}>
        {this.renderLine(
          left.lineNumber,
          left.type,
          LineNumberPrefix.LEFT,
          left.value,
        )}
        {this.renderLine(
          right.lineNumber,
          right.type,
          LineNumberPrefix.RIGHT,
          right.value,
        )}
      </tr>
    );
  };

  /**
	 * Generates lines for inline view.
	 *
	 * @param obj Line diff information.
	 * @param obj.left Life diff information for the added section of the inline view.
	 * @param obj.right Life diff information for the removed section of the inline view.
	 * @param index React key for the lines.
	 */
  public renderInlineView = (
    { left, right }: LineInformation,
    index: number,
  ): JSX.Element => {
    const { classes = {} } = this.props;

    let content;
    if (left.type === DiffType.REMOVED && right.type === DiffType.ADDED) {
      return (
        <React.Fragment key={index}>
          <tr className={cn(bem('line').toString(), classes.line)}>
            {this.renderLine(
              left.lineNumber,
              left.type,
              LineNumberPrefix.LEFT,
              left.value,
              null,
            )}
          </tr>
          <tr className={cn(bem('line').toString(), classes.line)}>
            {this.renderLine(
              null,
              right.type,
              LineNumberPrefix.RIGHT,
              right.value,
              right.lineNumber,
            )}
          </tr>
        </React.Fragment>
      );
    }
    if (left.type === DiffType.REMOVED) {
      content = this.renderLine(
        left.lineNumber,
        left.type,
        LineNumberPrefix.LEFT,
        left.value,
        null,
      );
    }
    if (left.type === DiffType.DEFAULT) {
      content = this.renderLine(
        left.lineNumber,
        left.type,
        LineNumberPrefix.LEFT,
        left.value,
        right.lineNumber,
        LineNumberPrefix.RIGHT,
      );
    }
    if (right.type === DiffType.ADDED) {
      content = this.renderLine(
        null,
        right.type,
        LineNumberPrefix.RIGHT,
        right.value,
        right.lineNumber,
      );
    }

    return (
      <tr key={index} className={cn(bem('line').toString(), classes.line)}>
        {content}
      </tr>
    );
  };

  /**
	 * Returns a function with clicked block number in the closure.
	 *
	 * @param id Cold fold block id.
	 */
  private onBlockClickProxy = (id: number): any => (): void => this.onBlockExpand(id);

  /**
	 * Generates cold fold block. It also uses the custom message renderer when available to show
	 * cold fold messages.
	 *
	 * @param num Number of skipped lines between two blocks.
	 * @param blockNumber Code fold block id.
	 * @param leftBlockLineNumber First left line number after the current code fold block.
	 * @param rightBlockLineNumber First right line number after the current code fold block.
	 */
  private renderSkippedLineIndicator = (
    num: number,
    blockNumber: number,
    leftBlockLineNumber: number,
    rightBlockLineNumber: number,
  ): JSX.Element => {
    const {
      classes = {},
      codeFoldMessageRenderer,
      hideLineNumbers,
      splitView,
    } = this.props;
    const message = codeFoldMessageRenderer ? (
      codeFoldMessageRenderer(
        num,
        leftBlockLineNumber,
        rightBlockLineNumber,
      )
    ) : (
      <pre className={cn(bem('code-fold-content').toString(), classes.codeFoldContent)}>
        Expand {num} lines ...
      </pre>
    );
    const content = (
      <td>
        <a onClick={this.onBlockClickProxy(blockNumber)} tabIndex={0}>
          {message}
        </a>
      </td>
    );
    const isUnifiedViewWithoutLineNumbers = !splitView && !hideLineNumbers;
    return (
      <tr
        key={`${leftBlockLineNumber}-${rightBlockLineNumber}`}
        className={cn(bem('code-fold').toString(), classes.codeFold)}>
        {!hideLineNumbers && (
          <td className={cn(bem('code-fold-gutter').toString(), classes.codeFoldGutter)} />
        )}
        <td
          className={cn({
            [bem('code-fold-gutter').toString()]: isUnifiedViewWithoutLineNumbers,
            [classes.codeFoldGutter]: isUnifiedViewWithoutLineNumbers,
          })}
        />

        {/* Swap columns only for unified view without line numbers */}
        {isUnifiedViewWithoutLineNumbers ? (
          <React.Fragment>
            <td />
            {content}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {content}
            <td />
          </React.Fragment>
        )}

        <td />
        <td />
      </tr>
    );
  };

  /**
	 * Generates the entire diff view.
	 */
  private renderDiff = (): JSX.Element[] => {
    const {
      oldValue,
      newValue,
      splitView,
      disableWordDiff,
      compareMethod,
      linesOffset,
      extraLinesSurroundingDiff,
      showDiffOnly,
    } = this.props;
    const { lineInformation, diffLines } = computeLineInformation(
      oldValue,
      newValue,
      disableWordDiff,
      compareMethod,
      linesOffset,
    );
    const extraLines = extraLinesSurroundingDiff < 0
      ? 0
      : extraLinesSurroundingDiff;
    let skippedLines: number[] = [];
    return lineInformation.map(
      (line: LineInformation, i: number): JSX.Element => {
        const diffBlockStart = diffLines[0];
        const currentPosition = diffBlockStart - i;
        if (showDiffOnly) {
          if (currentPosition === -extraLines) {
            skippedLines = [];
            diffLines.shift();
          }
          if (
            line.left.type === DiffType.DEFAULT
            && (currentPosition > extraLines
              || typeof diffBlockStart === 'undefined')
              && !this.state.expandedBlocks.includes(diffBlockStart)
          ) {
            skippedLines.push(i + 1);
            if (i === lineInformation.length - 1 && skippedLines.length > 1) {
              return this.renderSkippedLineIndicator(
                skippedLines.length,
                diffBlockStart,
                line.left.lineNumber,
                line.right.lineNumber,
              );
            }
            return null;
          }
        }

        const diffNodes = splitView
          ? this.renderSplitView(line, i)
          : this.renderInlineView(line, i);

        if (currentPosition === extraLines && skippedLines.length > 0) {
          const { length } = skippedLines;
          skippedLines = [];
          return (
            <React.Fragment key={i}>
              {this.renderSkippedLineIndicator(
                length,
                diffBlockStart,
                line.left.lineNumber,
                line.right.lineNumber,
              )}
              {diffNodes}
            </React.Fragment>
          );
        }
        return diffNodes;
      },
    );
  };

  public render = (): JSX.Element => {
    const {
      oldValue,
      newValue,
      leftTitle,
      rightTitle,
      splitView,
      hideLineNumbers,
      classes = {},
      className,
    } = this.props;

    if (typeof oldValue !== 'string' || typeof newValue !== 'string') {
      throw Error('"oldValue" and "newValue" should be strings');
    }

    const nodes = this.renderDiff();
    const colSpanOnSplitView = hideLineNumbers ? 2 : 3;
    const colSpanOnInlineView = hideLineNumbers ? 2 : 4;

    const title = (leftTitle || rightTitle) && (
      <tr>
        <td
          colSpan={splitView ? colSpanOnSplitView : colSpanOnInlineView}
          className={cn(bem('title-block').toString(), classes.titleBlock)}>
          <pre className={cn(bem('content-text').toString(), classes.contentText)}>{leftTitle}</pre>
        </td>
        {splitView && (
          <td
            colSpan={colSpanOnSplitView}
            className={cn(bem('title-block').toString(), classes.titleBlock)}>
            <pre className={cn(bem('content-text').toString(), classes.contentText)}>
              {rightTitle}
            </pre>
          </td>
        )}
      </tr>
    );

    return (
      <table
        className={cn(
          bem({ 'split-view': splitView }).toString(),
          classes.diffContainer,
          classes.splitView && { [classes.splitView]: splitView },
          className,
        )}>
        <tbody>
          {title}
          {nodes}
        </tbody>
      </table>
    );
  };
}

export default DiffViewer;
export { ReactDiffViewerStylesOverride, DiffMethod };
