/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { useEffect, useState } from "react";
import "./App.css";
import Auth from "@aws-amplify/auth";
import * as AWS from "aws-sdk";
import Messages from "./components/Message";
import Input from "./components/Input";
import appConfig from "./config/aws_config";
import {
  createChannel,
  createChannelMembership,
  describeChannel,
  getChannelMessage,
  listChannelMembershipsForAppInstanceUser,
  listChannelMessages,
  MessageType,
  Persistence,
  sendChannelMessage,
} from "./api/chimeApi";
import { useAuthContext } from "./providers/AuthProvider";
import {
  useChatChannelState,
  useChatMessagingState,
} from "./providers/ChatMessagesProvider";

const App = () => {
  let _identityClient;
  let usertoBeadded;
  const { member, isAuthenticated, userSignIn } = useAuthContext();
  const { messages } = useChatMessagingState();
  const { activeChannel, setActiveChannel } = useChatChannelState();
  const [isChatBoxOpen, setOpen] = useState(false);
  const [messagesList, setMessagesList] = useState([]);
  const [currentChannelList, setCurrentChannelList] = useState([]);
  const [activeCurrentChannel, setActiveCurrentChannel] = useState([]);
  const [userlist, setUserList] = useState([]);

  const setupClient = async () => {
    const creds = await Auth.currentCredentials();
    if (!creds) return;

    _identityClient = new AWS.CognitoIdentityServiceProvider({
      region: appConfig.region,
      credentials: Auth.essentialCredentials(creds),
    });
    if (_identityClient) {
      getUsers();
    }
  };

  const getUsers = async (limit = 6000) => {
    try {
      const users = await _identityClient
        .listUsers({
          UserPoolId: appConfig.cognitoUserPoolId,
        })
        .promise();

      usertoBeadded = [];
      users.Users.map((ele) => {
        if (ele.Username === "Bot" || ele.Username === "nurse") {
          usertoBeadded.push(ele);
          setUserList([...userlist, ele]);
        }
      });
      return users.Users;
    } catch (err) {
      throw new Error(err);
    }
  };

  const onSendMessage = async (newMessage) => {
    console.log("lksajdlkaslkja", activeChannel, activeCurrentChannel);
    console.log(newMessage, member);
    await sendChannelMessage(
      activeChannel.ChannelArn,
      newMessage.Content,
      Persistence.PERSISTENT,
      MessageType.STANDARD,
      member
    )
      .then((resp) => {
        setMessagesList([...messagesList, newMessage]);
        // setMessagesList([]);
        // getChannelMessage(activeChannel.ChannelArn);
      })
      .catch((err) => {
        console.log(err);
      });
    // userSignOut();

    // body: {
    //   patientId: this.props.activePatient,
    //   message: this.state.currentMessage,
    //   userEmail,
    // },
  };

  const getChannelMessage = async (channelArn) => {
    listChannelMessages(channelArn, member.userId)
      .then((channelMessage) => {
        setMessagesList(channelMessage.Messages);
      })
      .catch((err) => {
        console.log("error", err);
      });
  };

  useEffect(() => {
    console.log("apappapa", isChatBoxOpen, isAuthenticated, member);
    // userSignOut();
    if (!isAuthenticated) {
      onUserSignIn();
    } else {
      getChannel();
    }
    setupClient();
  }, [isAuthenticated]);

  useEffect(() => {
    // console.log("recevied message", messages);
    setMessagesList([...messagesList, ...messages]);
  }, [messages]);

  const onUserSignIn = async () => {
    userSignIn("John", "@1Testmark")
      .then((resp) => {
        console.log("user SignIn resp", member, resp);
        getChannel();
      })
      .catch((err) => {
        console.log("user signIn error", err);
      });
  };

  const getChannel = async () => {
    console.log("getchannel called", member);
    if (!isAuthenticated) return;
    listChannelMembershipsForAppInstanceUser(member.userId)
      .then(async (userChannel) => {
        console.log("channel name r", userChannel);
        if (userChannel.length === 0) {
          onCreateChannel();
        } else {
          userChannel = userChannel.map(
            (channelMembership) => channelMembership.ChannelSummary
          );
          setCurrentChannelList([...currentChannelList, userChannel]);
          setActiveChannel(...userChannel);
          await getChannelMessage(userChannel[0].ChannelArn);
          console.log("channel state", currentChannelList);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onCreateChannel = async () => {
    const channelArn = await createChannel(
      appConfig.appInstanceArn,
      null,
      "Test Channels Name",
      "UNRESTRICTED",
      "PRIVATE",
      member.userId
    );
    console.log("channel created", channelArn);
    if (channelArn) {
      const channel = await describeChannel(channelArn, member.userId);
      console.log("describe Channel", channel);
      if (channel) {
        setCurrentChannelList(channel);
        setActiveCurrentChannel(channel);
        setActiveChannel(channel);
        joinChannel(channelArn);
        // await getChannelMessage(channelArn);
      }
    }
  };

  const joinChannel = async (channelArn) => {
    console.log("user list", userlist);
    usertoBeadded.map(async (ele) => {
      const userid = ele.Attributes.filter((e) => e.Name === "profile");
      console.log("user list", userid);
      const membership = await createChannelMembership(
        channelArn,
        `${appConfig.appInstanceArn}/user/${userid[0].Value}`,
        member.userId
      );
      console.log("join channel called", membership);
      if (membership) {
        channelIdChangeHandler(activeCurrentChannel.ChannelArn);
      }
    });
  };

  const channelIdChangeHandler = async (channelArn) => {
    if (activeCurrentChannel.ChannelArn === channelArn) return;
    const newMessages = await listChannelMessages(channelArn, member.userId);
    const channel = await describeChannel(channelArn, member.userId);
    setMessagesList(newMessages.Messages);
    setActiveCurrentChannel(channel);
    setActiveChannel(channel);
  };

  // const createdummyChannel = () => {
  //   let userId = JSON.parse(localStorage.getItem("user"));
  //   userId = userId.identityId;
  //   console.log("userId", userId);
  //   createChannel(
  //     appConfig.appInstanceArn,
  //     null,
  //     "Test Dummay channel",
  //     "UNRESTRICTED",
  //     "PRIVATE",
  //     userId
  //   )
  //     .then((res) => {
  //       console.log("channel created safal", res);
  //     })
  //     .catch((err) => {
  //       console.log("channel creation filed", err);
  //     });
  // };
  return (
    <div className="main">
      {isChatBoxOpen ? (
        <img
          className="open-button"
          src="/cancle.png"
          onClick={() => setOpen(false)}
          alt="no image"
        />
      ) : (
        <img
          className="open-button"
          src="/chat.jpeg"
          onClick={() => setOpen(true)}
          alt="no image"
        />
      )}
      {isChatBoxOpen && (
        <div className="App">
          <div className="App-header">
            <h1>Msh Chat</h1>
          </div>
          <div className="chatMessages">
            <Messages messages={messagesList} />
          </div>
          <Input onSendMessage={onSendMessage} />
        </div>
      )}
    </div>
  );
};

export default App;
