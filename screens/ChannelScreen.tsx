import React, {useContext, useEffect, useRef} from 'react';
import {StyleSheet, View} from 'react-native';
import {
  Channel,
  Chat,
  MessageContent,
  MessageInput,
  MessageList,
  MessageSimple,
  Reply,
  SendRight,
  SendUp,
  Share,
  useAttachmentPickerContext,
  useMessageContext,
  useMessagesContext,
} from 'stream-chat-react-native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {useHeaderHeight} from '@react-navigation/elements';

import Swipeable from 'react-native-gesture-handler/Swipeable';

import {AppContext} from '../AppContext';
import type {StreamChatTypes, Thread} from '../types';
import {NavigationParametersList} from '../Navigation';
import {useStreamChat} from '../useStreamChat';

const CustomMessageContent = ({
  setMessageContentWidth,
}: {
  setMessageContentWidth: any;
}) => {
  const r = useRef<Swipeable | null>(null);
  const {setQuotedMessageState} = useMessagesContext();
  const {message, isMyMessage} = useMessageContext();

  if (isMyMessage) {
    return <MessageContent setMessageContentWidth={setMessageContentWidth} />;
  }

  return (
    <Swipeable
      ref={ref => (r.current = ref)}
      containerStyle={messageContentStyles.container}
      onSwipeableWillOpen={async () => {
        if (r.current !== null) {
          await new Promise(resolve => setTimeout(resolve, 350));
          setQuotedMessageState(message);
          r.current.close();
        }
      }}
      renderLeftActions={() => {
        return (
          <View style={messageContentStyles.leftSwipeContainer}>
            <SendRight />
          </View>
        );
      }}>
      <MessageContent setMessageContentWidth={setMessageContentWidth} />
    </Swipeable>
  );
};

const messageContentStyles = StyleSheet.create({
  container: {
    width: '100%',
  },
  leftSwipeContainer: {
    height: '100%',
    paddingRight: 10,
    justifyContent: 'center',
  },
});

interface ChannelScreenProps {
  navigation: StackNavigationProp<NavigationParametersList, 'Channel'>;
}

export const ChannelScreen: React.FC<ChannelScreenProps> = ({
  navigation,
}: ChannelScreenProps) => {
  const {channel, setThread, thread: selectedThread} = useContext(AppContext);
  const headerHeight = useHeaderHeight();
  const {setTopInset} = useAttachmentPickerContext();

  const {client, i18nInstance} = useStreamChat();

  useEffect(() => {
    setTopInset(headerHeight);
  }, [headerHeight, setTopInset]);

  if (channel === undefined) {
    return null;
  }

  return (
    <Chat client={client} i18nInstance={i18nInstance}>
      <Channel
        channel={channel}
        keyboardVerticalOffset={headerHeight}
        MessageContent={CustomMessageContent}
        thread={selectedThread}>
        <View style={{flex: 1}}>
          <MessageList<StreamChatTypes>
            onThreadSelect={(thread: Thread) => {
              setThread(thread);
              if (channel?.id) {
                navigation.navigate('Thread');
              }
            }}
          />
          <MessageInput />
        </View>
      </Channel>
    </Chat>
  );
};
