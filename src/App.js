import React, { useState } from "react";
import "./App.css";
import {
  getAwsCredentialsFromCognito,
  userSignIn,
  userSignUp,
} from "./aws_auth_api";
import {
  listChannelMembershipsForAppInstanceUser,
  MessageType,
  Persistence,
  sendChannelMessage,
} from "./chimeApi";

const App = () => {
  const [isChatBoxOpen, setOpen] = useState(false);
  const [textValue, setTextValue] = useState("");
  const [isLoggedIn, setLogginStatus] = useState(false);
  const [member, setMember] = useState({ userId: null, username: null });
  const [currentChannelArn, setCurrenChannelArn] = useState(null);

  const OpenChatBox = async () => {
    userSignIn("John", "Test@1mark")
      .then(async (loggedin) => {
        console.log("this is loggedIn", loggedin);
        if (loggedin === "User does not exist.") {
          // userSignUp("Mark", "Test@1mark")
          //   .then(async (log) => {
          //     console.log("userSignUp resp", log);
          //     const userData = await getAwsCredentialsFromCognito();
          //     console.log("this is userData", userData);
          setLogginStatus(!isLoggedIn);
          //     setOpen(!isChatBoxOpen);
          //   })
          //   .catch((err) => {
          //     console.log("signUp error", err);
          //   });
        } else {
          await getCurrentUserChannelList();

          // console.log("this is login", loggedin);
          // const userData = await getAwsCredentialsFromCognito();
          // console.log("this is userData", userData);
          // setLogginStatus(!isLoggedIn);
          // setOpen(!isChatBoxOpen);
        }
      })
      .catch((err) => {
        console.log("error called");
      });
    setOpen(!isChatBoxOpen);
  };

  const getCurrentUserChannelList = async () => {
    const userId = JSON.parse(localStorage.getItem("userId"));
    setMember({ userId: userId, username: null });
    const channelList = await listChannelMembershipsForAppInstanceUser(userId);
    console.log("associated channel list", channelList);
    if (channelList && channelList.length > 0) {
      setCurrenChannelArn(channelList[0]?.ChannelSummary?.ChannelArn);
    }
  };

  const submitResponse = async () => {
    console.log("this is member value", member);
    const resp = await sendChannelMessage(
      currentChannelArn,
      textValue,
      Persistence.PERSISTENT,
      MessageType.STANDARD,
      member
    );
    console.log("sendMessage resp", resp);
  };
  const closeForm = () => {
    document.getElementById("myForm").style.display = "none";
  };

  // const setMessageInputValue = async (val) => {
  //   console.log("@@@@", val);
  //   setTextValue(val);
  // };
  return (
    <>
      <div onClick={() => OpenChatBox()} type="button" className="open-button">
        Chat
      </div>
      {isChatBoxOpen && (
        <div className="chat-popup" id="myForm">
          <form className="form-container">
            <h1>MSH Chat Window</h1>

            <label>
              <b>Message</b>
            </label>
            <textarea
              placeholder="Type message.."
              name="msg"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              required
            ></textarea>

            <div style={{ display: "flex" }}>
              <button type="button" className="btn cancel" onClick={closeForm}>
                Close
              </button>
              <button
                onClick={() => submitResponse()}
                type="button"
                className="btn"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default App;
