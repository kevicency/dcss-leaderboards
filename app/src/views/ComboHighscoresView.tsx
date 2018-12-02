import { gql } from 'apollo-boost'
import {
  DetailsListLayoutMode,
  IColumn,
  Link,
  SelectionMode,
} from 'office-ui-fabric-react'
import * as React from 'react'
import { Query, QueryResult } from 'react-apollo'
import { ErrorMessage, FancyList, FlexSpinner } from '../components'
import { Box } from '../styled'

const GET_COMBO_HIGHSCORES = gql`
  query ComboHighscoresQuery {
    comboHighscores {
      background
      date
      duration
      gid
      god
      morgue
      player
      race
      points
    }
  }
`

const columns: IColumn[] = [
  {
    key: 'gid',
    name: 'Combo',
    fieldName: 'gid',
    minWidth: 40,
    maxWidth: 40,
    isResizable: true,
  },
  {
    key: 'player',
    name: 'Player',
    fieldName: 'player',
    minWidth: 75,
    maxWidth: 110,
    isResizable: true,
  },
  {
    key: 'points',
    name: 'Points',
    fieldName: 'points',
    minWidth: 80,
    maxWidth: 80,
    isResizable: true,
    isSorted: true,
    isSortedDescending: false,
  },
  {
    key: 'duration',
    name: 'Time',
    fieldName: 'duration',
    minWidth: 50,
    maxWidth: 50,
    isResizable: true,
  },
  {
    key: 'race',
    name: 'Race',
    fieldName: 'race',
    minWidth: 40,
    maxWidth: 40,
    isResizable: true,
  },
  {
    key: 'background',
    name: 'Class',
    fieldName: 'background',
    minWidth: 40,
    maxWidth: 40,
    isResizable: true,
  },
  {
    key: 'god',
    name: 'God',
    fieldName: 'god',
    minWidth: 90,
    maxWidth: 100,
    isResizable: true,
  },
  {
    key: 'morgue',
    name: 'Morgue',
    fieldName: 'morgue',
    minWidth: 70,
    isResizable: true,
    onRender: item =>
      item.morgue ? (
        <Link href={item.morgue} target="_blank">
          Morgue
        </Link>
      ) : null,
  },
]

export type ComboHighscorsesViewProps = {}

export class ComboHighscoresView extends React.Component<
  ComboHighscorsesViewProps
> {
  public render() {
    return (
      <Query query={GET_COMBO_HIGHSCORES}>
        {({ loading, error, data }: QueryResult) => {
          if (loading) {
            return <FlexSpinner flex="1" />
          }
          if (error) {
            return (
              <Box flex="1" alignSelf="center">
                <ErrorMessage
                  message="Oops, something went wrong!"
                  error={error}
                />
              </Box>
            )
          }

          return (
            <Box flex="1">
              <FancyList
                selectionMode={SelectionMode.none}
                layoutMode={DetailsListLayoutMode.justified}
                items={data.comboHighscores.map((x: any, i: number) => ({
                  ...x,
                  position: i + 1,
                }))}
                columns={columns}
              />
            </Box>
          )
        }}
      </Query>
    )
  }
}
