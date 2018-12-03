import { gql, OperationVariables } from 'apollo-boost'
import {
  DetailsListLayoutMode,
  IColumn,
  Link,
  Pivot,
  PivotItem,
  PivotLinkFormat,
  SelectionMode,
} from 'office-ui-fabric-react'
import * as React from 'react'
import { Query, QueryResult } from 'react-apollo'
import { InjectedRouterNode, routeNode } from 'react-router5'
import {
  ContentContainer,
  ErrorMessage,
  FancyList,
  FlexSpinner,
  LightBackgroundContainer,
  OverflowContentContainer,
} from '../components'
import { BronzeTrophy, GoldTrophy, SilverTrophy } from '../components/Trophy'
import { Box, Flex } from '../styled'

const GET_HIGHSCORES = gql`
  query HighscoresQuery($by: HighscoreType!) {
    highscores(by: $by) {
      background
      date
      duration
      gid
      god
      morgue
      player
      race
      points
      turns
    }
  }
`

const columns: IColumn[] = [
  {
    key: 'player',
    name: 'Player',
    fieldName: 'player',
    minWidth: 90,
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
    key: 'turns',
    name: 'Turns',
    fieldName: 'turns',
    minWidth: 70,
    maxWidth: 70,
    isResizable: true,
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
    key: 'date',
    name: 'Date',
    fieldName: 'date',
    minWidth: 80,
    maxWidth: 90,
    isResizable: true,
    onRender: item => new Date(item.date).toLocaleDateString(),
  },
  {
    key: 'morgue',
    name: 'Morgue',
    fieldName: 'morgue',
    minWidth: 60,
    isResizable: true,
    onRender: item =>
      item.morgue ? (
        <Link href={item.morgue} target="_blank">
          Morgue
        </Link>
      ) : null,
  },
]

export type HighscorsesViewProps = Partial<InjectedRouterNode> & {}

@(routeNode as any)('highscores') // todo compiler pls
export class HighscoresView extends React.Component<HighscorsesViewProps> {
  public render() {
    const { route, router } = this.props
    const aggregationType = route.name.split('.')[1]
    const variables = { by: aggregationType } as OperationVariables

    return (
      <Flex flexDirection="column" flex="1">
        <LightBackgroundContainer>
          <ContentContainer flex="1">
            <Pivot
              headersOnly={true}
              linkFormat={PivotLinkFormat.tabs}
              selectedKey={aggregationType}
              onLinkClick={item => {
                router.navigate(`highscores.${item.props.itemKey}`)
              }}>
              <PivotItem itemKey="player" headerText="by Player" />
              <PivotItem itemKey="combo" headerText="by Race/Class Combo" />
            </Pivot>
          </ContentContainer>
        </LightBackgroundContainer>
        <OverflowContentContainer flex="1">
          <Query query={GET_HIGHSCORES} variables={variables}>
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
                    items={data.highscores.map((x: any, i: number) => ({
                      ...x,
                      position: i + 1,
                    }))}
                    columns={this.getColumns(aggregationType)}
                  />
                </Box>
              )
            }}
          </Query>
        </OverflowContentContainer>
      </Flex>
    )
  }
  private getColumns(aggregationType: string): IColumn[] {
    if (aggregationType === 'combo') {
      return [
        {
          key: 'gid',
          name: 'Combo',
          fieldName: 'gid',
          minWidth: 40,
          maxWidth: 40,
          isResizable: true,
        },
        ...columns,
      ]
    }
    if (aggregationType === 'player') {
      return [
        {
          key: 'position',
          name: 'Pos',
          fieldName: 'position',
          minWidth: 20,
          maxWidth: 20,
          isResizable: true,
          onRender: item => {
            switch (item.position) {
              case 1:
                return <GoldTrophy />
              case 2:
                return <SilverTrophy />
              case 3:
                return <BronzeTrophy />
              default:
                return <span>{item.position}</span>
            }
          },
        },
        ...columns,
      ]
    }
    return columns
  }
}
