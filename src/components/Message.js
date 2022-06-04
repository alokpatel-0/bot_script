/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useRef } from "react";

const Messages = ({
  messages,
  loadMoreChat,
  nextToken,
  scrollEnable,
  isAuthenticated,
}) => {
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (scrollEnable) {
      scrollToBottom();
    }
  }, [messages]);

  const loadMore = async () => {
    loadMoreChat({ isLoadMore: false });
  };

  const renderMessage = (message) => {
    const messageId = message?.MessageId;
    const Content = message?.Content;
    const Name = message?.Sender?.Name;
    return (
      <>
        {" "}
        {Name !== "Bot" && Name !== "nurse" ? (
          <div key={messageId} className="userDiv">
            <div className="text">{Content}</div>
            <span>
              <img
                className="userImage"
                src="https://icons.veryicon.com/png/o/internet--web/prejudice/user-128.png"
              />
            </span>
          </div>
        ) : (
          <div key={messageId} className="responseDiv">
            <span>
              <img
                className="profileImage"
                src="https://icons.veryicon.com/png/o/internet--web/prejudice/user-128.png"
              />
            </span>
            <div className="bottext">{Content}</div>
          </div>
        )}
      </>
    );
  };
  return (
    <>
      {isAuthenticated && nextToken && (
        <div onClick={loadMore}>
          <button className="onload">Load more</button>
        </div>
      )}
      <div>{messages.map((m) => renderMessage(m))}</div>
      <div style={{ float: "left", clear: "both" }} ref={messagesEndRef}></div>
    </>
  )
}

export default Messages;
