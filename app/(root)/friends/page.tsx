import ConversationContainer from '@/components/shared/conversation/ConversationContainer';
import ConversationFallback from '@/components/shared/conversation/ConversationFallback';
import ItemList from '@/components/shared/item-list/ItemList';
import React from 'react';

type Props = {};

const Friends = (props: Props) => {
  return (
    <>
      <ItemList title='Friends'>Friends Page</ItemList>
      <ConversationFallback />
    </>
  );
};

export default Friends;