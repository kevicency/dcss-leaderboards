import { groupBy, mapValues, Omit, sortBy } from 'lodash'
import {
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  IDetailsListProps,
  IGroup,
  ISelection,
  Selection,
  SelectionMode,
} from 'office-ui-fabric-react'
import * as React from 'react'
import styled from 'styled'

function sortByColumn<T>(items: T[], sortColumn: IColumn) {
  if (sortColumn) {
    const sortedItems = sortColumn ? sortBy(items, sortColumn.fieldName) : items

    return sortColumn.isSortedDescending ? sortedItems : sortedItems.reverse()
  }

  return items
}

const StyledDetailsList = styled(DetailsList)`
  .ms-DetailsRow-cell {
    color: ${({ theme }) => theme.palette.neutralPrimaryAlt};
  }
`

export interface FancyListState<T> {
  sortedItems: T[]
  columns: IColumn[]
  groups: IGroup[]
}

export type FancyListProps<T> = Omit<IDetailsListProps, 'items'> & {
  items: T[]
  onSelectionChanged?: (selection: T[]) => void
}

export class FancyList<T = any> extends React.Component<
  FancyListProps<T>,
  FancyListState<T>
> {
  private selection: ISelection

  constructor(props: FancyListProps<T>) {
    super(props)

    this.state = this.deriveState({}, props)

    this.selection = new Selection({
      onSelectionChanged: this.handleSelectionChanged(props.onSelectionChanged),
    })
  }

  public componentWillReceiveProps(newProps: FancyListProps<T>) {
    if (
      this.props.items !== newProps.items ||
      this.props.columns !== newProps.columns
    ) {
      this.setState(this.deriveState({}, newProps))
    }
  }

  public render(): JSX.Element {
    const { onSelectionChanged, items, ...listProps } = this.props

    return (
      <StyledDetailsList
        selectionMode={SelectionMode.single}
        layoutMode={DetailsListLayoutMode.justified}
        isHeaderVisible={true}
        setKey="entities"
        {...listProps}
        items={this.state.sortedItems}
        columns={this.state.columns}
        groups={this.state.groups}
        selection={this.selection}
        onColumnHeaderClick={this.handleColumnHeaderClick}
      />
    )
  }

  private deriveState = (
    overwrites: {
      sortColumn?: IColumn
      groupColumn?: IColumn
    } = {},
    props: FancyListProps<T> = null
  ) => {
    const { columns, items } = props || this.props

    const sortColumn = overwrites.sortColumn || columns.find(x => x.isSorted)
    const groupColumn = overwrites.groupColumn || columns.find(x => x.isGrouped)

    let groups: IGroup[] = null
    let sortedItems = sortByColumn(items, sortColumn)

    if (groupColumn) {
      const dictionary = mapValues(groupBy(items, groupColumn.fieldName), x =>
        sortByColumn(x, sortColumn)
      )

      groups = []
      sortedItems = []

      Object.keys(dictionary).forEach(groupKey => {
        const groupItems = dictionary[groupKey]

        groups.push({
          key: groupKey,
          name: groupKey,
          startIndex: sortedItems.length,
          count: groupItems.length,
        })

        sortedItems = [...sortedItems, ...groupItems]
      })
    }

    return {
      sortedItems,
      groups,
      columns: columns.map(x => {
        if (sortColumn && x.key === sortColumn.key) {
          x.isSorted = true
          x.isSortedDescending = sortColumn.isSortedDescending
        } else {
          x.isSorted = false
          x.isSortedDescending = false
        }

        if (groupColumn && x.key === groupColumn.key) {
          x.isGrouped = true
        } else {
          x.isGrouped = false
        }

        return x
      }),
    }
  }

  private handleColumnHeaderClick = (
    ev: React.MouseEvent<HTMLElement>,
    column: IColumn
  ): void => {
    const isGroupClick = ev.getModifierState('Alt')

    const derivedState = this.deriveState(
      isGroupClick
        ? {
            groupColumn: {
              ...column,
              isGrouped: true,
            },
          }
        : {
            sortColumn: {
              ...column,
              isSorted: true,
              isSortedDescending: column.isSorted
                ? !column.isSortedDescending
                : false,
            },
          }
    )

    this.setState(derivedState, this.props.onColumnHeaderClick)
  }

  private handleSelectionChanged = (callback: any) => () => {
    if (callback) {
      const selection = this.selection.getSelection()

      callback(selection)
    }
  }
}
