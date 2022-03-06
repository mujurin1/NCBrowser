import React from "react";
import {
  ListChildComponentProps,
  VariableSizeList,
  VariableSizeListProps,
} from "react-window";

export type VariableSizeListWithHeaderProps<T> = VariableSizeListProps<T> & {
  /** ビュー全体の高さ */
  height: number;
  /** ビュー全体の幅 */
  width: number;
  /** ヘッダーの高さ */
  headerHeight: number;
  /** ヘッダー要素 */
  header: React.ReactElement;
  /** ref */
  _ref: React.LegacyRef<VariableSizeList<T>>;
  children: React.ComponentType<ListChildComponentProps<T>>;
};

export function VariableSizeListWithHeader<T>(
  props: VariableSizeListWithHeaderProps<T>
) {
  const innerElement: (innerProps: any) => JSX.Element = React.useMemo(
    () => (innerProps) =>
      (
        <div {...innerProps}>
          {props.header}
          {innerProps.children}
        </div>
      ),
    [props.header]
  );

  return (
    <VariableSizeList
      {...props}
      ref={props._ref}
      innerElementType={innerElement}
    >
      {(arg) => React.createElement(props.children, arg)}
    </VariableSizeList>
  );
}
