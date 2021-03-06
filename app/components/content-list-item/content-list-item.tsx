import * as React from "react"
import {
  Image,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native"
import { SwipeRow } from "react-native-swipe-list-view"
import ReactNativeSvg from "react-native-svg"
import { observer } from "mobx-react"

import { ContentListItemProps as Props } from "./content-list-item.props"
import { ContentListItemState as State } from "./content-list-item.state"
import { ContentListItemStyle as Style } from "./content-list-item.style"
import { ContentListItemSkeleton } from "./content-list-item.skeleton"
import BookmarkIcon from "./bookmark.svg"

import { Button } from "../button"
import { Icon } from "../icon"
import { Text } from "../text"

import { translate } from "../../i18n"
import { color } from "../../theme"
import { ContentListItemBack } from "./content-list-item.back"

@observer
export class ContentListItem extends React.Component<Props, State> {
  swipeRowRef = React.createRef<SwipeRow<{}>>()

  isPrevFollow = this.props.content.creator && this.props.content.creator.isFollowing

  constructor(props: Props) {
    super(props)

    this.state = {
      isRowOpen: false,
      offsetX: 0,
    }
  }

  static defaultProps = {
    isShowBookmarkIcon: true,
  } as Partial<Props>

  componentDidMount() {
    if (this.props.content.shouldFetchDetails) {
      this.props.content.fetchDetails()
    }
    this.fetchCreatorDependedDetails()
  }

  componentDidUpdate() {
    this.fetchCreatorDependedDetails()
  }

  private getSwipeRowWidth() {
    return -(this.props.content.creator ? 128 : 64)
  }

  private fetchCreatorDependedDetails() {
    if (this.props.content.shouldFetchLikeStat) {
      this.props.content.fetchLikeStat()
    }
    if (this.props.content.shouldFetchCreatorDetails) {
      this.props.content.creator.fetchDetails()
    }
  }

  private onRowOpen = () => {
    if (this.props.onSwipeOpen) this.props.onSwipeOpen(this.props.content.url, this.swipeRowRef)
    this.setState({ isRowOpen: true })
  }

  private onRowClose = () => {
    if (this.props.onSwipeClose) this.props.onSwipeClose(this.props.content.url)
    this.setState({ isRowOpen: false })
  }

  private onToggleBookmark = () => {
    this.swipeRowRef.current.closeRow()
    if (this.props.onToggleBookmark) this.props.onToggleBookmark(this.props.content.url)
  }

  private onToggleFollow = () => {
    this.swipeRowRef.current.closeRow()
    if (this.props.onToggleFollow) this.props.onToggleFollow(this.props.content)
  }

  private onPressMoreButton = () => {
    if (this.state.isRowOpen) {
      this.swipeRowRef.current.closeRow()
    } else {
      this.swipeRowRef.current.manuallySwipeRow(this.getSwipeRowWidth())
    }
  }

  private onPress = () => {
    if (this.props.onPress) this.props.onPress(this.props.content.url)
  }

  private onPressUndoButton = () => {
    if (this.props.onPressUndoButton) {
      this.props.onPressUndoButton(this.props.content)
    }
  }

  render() {
    const {
      isBookmarked,
      isFollowingCreator,
      isLoading,
    } = this.props.content

    if (isLoading) {
      return <ContentListItemSkeleton />
    } else if (
      this.props.content.creator &&
      this.props.onPressUndoButton &&
      this.isPrevFollow &&
      !isFollowingCreator
    ) {
      return this.renderUndo()
    }

    return (
      <SwipeRow
        ref={this.swipeRowRef}
        rightOpenValue={this.getSwipeRowWidth()}
        stopLeftSwipe={0}
        onRowOpen={this.onRowOpen}
        onRowClose={this.onRowClose}
      >
        <ContentListItemBack
          isShowFollowToggle={!!this.props.content.creator}
          isBookmarked={isBookmarked}
          isFollowingCreator={isFollowingCreator}
          onToggleBookmark={this.onToggleBookmark}
          onToggleFollow={this.onToggleFollow}
        />
        {this.renderFront()}
      </SwipeRow>
    )
  }

  private renderFront() {
    const {
      content,
      style,
    } = this.props

    const {
      likeCount,
      coverImageURL,
      normalizedTitle,
    } = content

    const rootStyle = {
      ...Style.Root,
      ...style,
      transform: [{ translateX: this.state.offsetX }],
    }

    return (
      <TouchableHighlight
        underlayColor={color.palette.greyf2}
        style={rootStyle}
        onPress={this.onPress}
      >
        <View>
          <View style={Style.ROW}>
            <View style={Style.DETAIL_VIEW}>
              <Text
                color="likeGreen"
                size="default"
                weight="600"
                text={content.creatorDisplayName}
              />
              <Text
                color="grey4a"
                size="medium"
                weight="600"
                text={normalizedTitle}
                style={Style.DETAIL_TEXT}
              />
            </View>
            {!!coverImageURL &&
              <Image
                source={{ uri: coverImageURL }}
                style={Style.IMAGE_VIEW}
              />
            }
            {content.isBookmarked &&
              this.props.isShowBookmarkIcon &&
              this.renderBookmarkFlag()
            }
          </View>
          <View style={Style.FOOTER}>
            <View>
              {likeCount > 0 &&
                <Text
                  text={translate("ContentListItem.likeStatsLabel", { count: likeCount })}
                  size="medium"
                  prepend={(
                    <Icon
                      name="like-clap"
                      width={24}
                      color="grey9b"
                    />
                  )}
                  color="grey9b"
                />
              }
            </View>
            <View style={Style.BOTTOM_BUTTON_CONTAINER}>
              {this.renderBookmarkButton(content.isBookmarked)}
              {this.renderMoreButton()}
            </View>
          </View>
        </View>
      </TouchableHighlight>
    )
  }

  private renderBookmarkButton(isBookmarked: boolean) {
    const iconName = isBookmarked ? "bookmark-filled" : "bookmark-outlined"
    const iconColor = isBookmarked ? "likeCyan" : "grey4a"
    return (
      <TouchableOpacity onPress={this.onToggleBookmark}>
        <Icon
          name={iconName}
          width={24}
          height={24}
          color={iconColor}
        />
      </TouchableOpacity>
    )
  }

  private renderMoreButton() {
    return (
      <TouchableOpacity
        style={Style.MORE_BUTTON}
        onPress={this.onPressMoreButton}
      >
        <Icon
          name="three-dot-horizontal"
          width={24}
          height={24}
          color="grey4a"
        />
      </TouchableOpacity>
    )
  }

  private renderBookmarkFlag() {
    if (typeof BookmarkIcon !== "function") {
      return <ReactNativeSvg style={Style.BOOKMARK_FLAG} />
    }
    return (
      <BookmarkIcon
        width={24}
        height={24}
        style={Style.BOOKMARK_FLAG}
      />
    )
  }

  private renderUndo() {
    return (
      <View style={Style.RootUndo}>
        <Icon
          name="seen"
          fill={color.palette.grey9b}
          width={24}
          height={24}
        />
        <View style={Style.UndoTextWrapper}>
          <Text
            text={translate("common.unfollowSuccess", {
              creator: this.props.content.creator.displayName
            })}
            weight="600"
            color="grey9b"
            numberOfLines={1}
            ellipsizeMode="middle"
          />
        </View>
        <Button
          preset="plain"
          tx="common.undo"
          size="default"
          append={
            <Icon
              name="undo"
              width={16}
              height={16}
              fill={color.primary}
              style={Style.UndoButtonIcon}
            />
          }
          style={Style.UndoButton}
          onPress={this.onPressUndoButton}
        />
      </View>
    )
  }
}
