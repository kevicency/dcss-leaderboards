import { gql } from 'apollo-boost'
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

const GET_TURNCOUNTRUNS = gql`
  query TurncountrunsQuery {
    turncountruns {
      background
      date
      turns
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
    key: 'turns',
    name: 'Turns',
    fieldName: 'turns',
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

export type TurncountrunsViewProps = Partial<InjectedRouterNode> & {}

@(routeNode as any)('turncountruns') // todo compiler pls
export class TurncountrunsView extends React.Component<TurncountrunsViewProps> {
  public render() {
    const { route, router } = this.props

    return (
      <Flex flexDirection="column" flex="1">
        <LightBackgroundContainer>
          <ContentContainer flex="1">
            <Pivot
              headersOnly={true}
              linkFormat={PivotLinkFormat.tabs}
              selectedKey="player"
              onLinkClick={item => {
                router.navigate(`turncountruns.${item.props.itemKey}`)
              }}>
              <PivotItem itemKey="player" headerText="by Player" />
            </Pivot>
          </ContentContainer>
        </LightBackgroundContainer>
        <OverflowContentContainer flex="1">
          <Query query={GET_TURNCOUNTRUNS}>
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
                    items={data.turncountruns.map((x: any, i: number) => ({
                      ...x,
                      position: i + 1,
                    }))}
                    columns={columns}
                  />
                </Box>
              )
            }}
          </Query>
        </OverflowContentContainer>
      </Flex>
    )
  }
}
