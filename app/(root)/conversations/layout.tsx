import React from "react";

type Props = React.PropsWithChildren<{}>;

const ConversationsLayout = ({ children }: Props) => {
    return <div>{children}</div>
}

export default ConversationsLayout;