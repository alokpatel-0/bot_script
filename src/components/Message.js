/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect } from "react";

const Messages = ({ messages }) => {
  const scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    console.log("this is message component", messages);
  }, [messages]);

  const renderMessage = (message) => {
    const { Content } = message;
    const { Name } = message.Sender;
    console.log("...........", message, Name);
    return (
      <>
        {" "}
        {Name !== "Bot" && Name !== "nurse" ? (
          <div className="userDiv">
            <div className="text">{Content}</div>
            <span>
              <img className="userImage" src="download.jpeg" />
            </span>
          </div>
        ) : (
          <div className="responseDiv">
            <span>
              <img className="profileImage" src="download.jpeg" />
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
      <div
        style={{ float: "left", clear: "both" }}
        ref={(el) => scrollToBottom}
      ></div>
    </>
  );
};

export default Messages;
