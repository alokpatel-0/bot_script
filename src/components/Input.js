import { Component, useState } from "react";
import React from "react";

const Input = ({ onSendMessage }) => {
  const [messageVal, setMessageVal] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    onSendMessage({
      Content: messageVal,
      Sender: { Name: "nurse" },
    });
    setMessageVal("");
  };

  return (
    <div className="Input">
      <form
        onSubmit={(e) => onSubmit(e)}
        style={{ position: "relative", top: 0 }}
      >
        <input
          className="textInput"
          onChange={(e) => setMessageVal(e.target.value)}
          value={messageVal}
          type="text"
          placeholder="Enter your message"
          autoFocus={true}
        />
        <input
          className="sendbutton"
          type="image"
          src="blue.png"
          alt="Submit"
        />
      </form>
    </div>
  );
};

export default Input;
