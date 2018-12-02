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
} from '../components'
import { BronzeTrophy, GoldTrophy, SilverTrophy } from '../components/Trophy'
import styled, { Box, Flex } from '../styled'

const PivotContainer = styled.div`
  background: ${({ theme }) => theme.palette.neutralLighterAlt};
`

const GET_SPEEDRUNS = gql`
  query SpeedrunsQuery($by: AggregationField!) {
    speedruns(by: $by) {
      background
      date
      duration
      god
      morgue
      player
      race
      vod
    }
  }
`

const columns: IColumn[] = [
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
  {
    key: 'player',
    name: 'Player',
    fieldName: 'player',
    minWidth: 75,
    maxWidth: 110,
    isResizable: true,
  },
  {
    key: 'duration',
    name: 'Time',
    fieldName: 'duration',
    minWidth: 50,
    maxWidth: 50,
    isResizable: true,
    isSorted: true,
    isSortedDescending: true,
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
    minWidth: 80,
    maxWidth: 80,
    isResizable: true,
    onRender: item =>
      item.morgue ? (
        <Link href={item.morgue} target="_blank">
          Morgue
        </Link>
      ) : null,
  },
  {
    key: 'vod',
    name: 'Video',
    fieldName: 'vod',
    minWidth: 90,
    isResizable: true,
    onRender: item =>
      item.vod ? (
        <Link href={item.vod} target="_blank">
          Youtube
        </Link>
      ) : null,
  },
]

export type SpeedrunsViewProps = Partial<InjectedRouterNode> & {}

@(routeNode as any)('speedruns') // todo compiler pls
export class SpeedrunsView extends React.Component<SpeedrunsViewProps> {
  public render() {
    const { route, router } = this.props
    const aggregation = route.name.split('.')[1]
    const variables = { by: aggregation } as OperationVariables

    return (
      <Flex flexDirection="column" flex="1">
        <PivotContainer>
          <ContentContainer flex="1">
            <Pivot
              headersOnly={true}
              linkFormat={PivotLinkFormat.tabs}
              selectedKey={aggregation}
              onLinkClick={item => {
                router.navigate(`speedruns.${item.props.itemKey}`)
              }}>
              <PivotItem itemKey="player" headerText="by Player" />
              <PivotItem itemKey="race" headerText="by Race" />
              <PivotItem itemKey="background" headerText="by Class" />
              <PivotItem itemKey="god" headerText="by God" />
            </Pivot>
          </ContentContainer>
        </PivotContainer>
        <ContentContainer flex="1">
          <Query query={GET_SPEEDRUNS} variables={variables}>
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
                    items={data.speedruns.map((x: any, i: number) => ({
                      ...x,
                      position: i + 1,
                    }))}
                    columns={this.getColumns(aggregation)}
                  />
                </Box>
              )
            }}
          </Query>
        </ContentContainer>
      </Flex>
    )
  }

  private getColumns(rankingType: string) {
    if (rankingType !== 'player') {
      const rankingColumnIdx = columns.findIndex(
        x => x.fieldName === rankingType
      )

      if (rankingColumnIdx !== -1) {
        const rankingColumn = columns[rankingColumnIdx]

        return [
          ...columns.slice(0, 1),
          rankingColumn,
          ...columns.slice(1, rankingColumnIdx),
          ...columns.slice(rankingColumnIdx + 1),
        ]
      }
    }

    return columns
  }
}
