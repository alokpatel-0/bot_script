/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useRef } from "react";

const Messages = ({ messages, isAuthenticated }) => {
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderMessage = (message) => {
    const Content = message?.Content;
    const Name = message?.Sender?.Name;
    return (
      <>
        {" "}
        {Name !== "Bot" && Name !== "nurse" ? (
          <div className="userDiv">
            <div className="text">{Content}</div>
            <span>
              <img
                className="userImage"
                src="https://icons.veryicon.com/png/o/internet--web/prejudice/user-128.png"
              />
            </span>
          </div>
        ) : (
          <div className="responseDiv">
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
      <div>{messages.map((m) => renderMessage(m))}</div>
      <div style={{ float: "left", clear: "both" }} ref={messagesEndRef}></div>
    </>
  );
};

export default Messages;
