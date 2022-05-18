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
import { handleSendMessageToPatient } from "./api/api";

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
  const [slots, setSlots] = useState({ phoneNumber: "", Otp: "" });

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
    if (isAuthenticated) {
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
    }
  };

  const onSendMessage = async (newMessage) => {
    if (isAuthenticated) {
      console.log("lksajdlkaslkja", activeChannel, activeCurrentChannel);
      console.log(newMessage, member);
      await sendChannelMessage(
        activeChannel.ChannelArn,
        newMessage.Content,
        Persistence.PERSISTENT,
        MessageType.STANDARD,
        member
      );
      // setMessagesList([...messagesList, newMessage]);
      // .then((resp) => {})
      // .catch((err) => {
      //   console.log(err);
      // });
    } else {
      setMessagesList([...messagesList, newMessage]);
      getUserDtails(newMessage);
    }

    // body: {
    //   patientId: this.props.activePatient,
    //   message: this.state.currentMessage,
    //   userEmail,
    // },
  };

  const getChannelMessage = async (channelArn) => {
    if (isAuthenticated) {
      listChannelMessages(channelArn, member.userId)
        .then((channelMessage) => {
          setMessagesList(channelMessage.Messages);
        })
        .catch((err) => {
          console.log("error", err);
        });
    }
  };

  useEffect(() => {
    // userSignOut();
    console.log("apappapa", isChatBoxOpen, isAuthenticated, member);
    // userSignOut();
    if (isAuthenticated) {
      // getUserDtails();
      // onUserSignIn();
      getChannel();
    } else {
      getUserDtails(null);
    }
    setupClient();
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      setMessagesList([...messagesList, messages.pop()]);
    }
  }, [messages]);

  const getUserDtails = async (message) => {
    const body = {
      message: message && message.Content ? message.Content : "Initiate Auth",
    };
    handleSendMessageToPatient(body)
      .then((resp) => {
        console.log("bot resp ", resp);
        if (message && message.Content) {
          setMessagesList([
            ...messagesList,
            message,
            {
              Content: resp?.data?.botResponse?.message,
              Sender: { Name: "Bot" },
            },
          ]);
        } else {
          setMessagesList([
            ...messagesList,
            {
              Content: resp?.data?.botResponse?.message,
              Sender: { Name: "Bot" },
            },
          ]);
        }

        if (resp?.data?.botResponse?.dialogState === "ReadyForFulfillment") {
          console.log(resp?.data?.botResponse?.slots);
          setSlots(resp?.data?.botResponse?.slots);
          onUserSignIn(
            resp.data.botResponse.slots.phoneNumber,
            resp.data.botResponse.slots.Otp
          );
        }
      })
      .catch((err) => {
        console.log("bot err", err);
      });
  };

  const onUserSignIn = async (userName, password) => {
    password = "@1aT" + password;
    console.log("signin", userName, password);
    userSignIn(userName, password)
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
    if (isAuthenticated) {
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
    }
  };

  const channelIdChangeHandler = async (channelArn) => {
    if (isAuthenticated) {
      if (activeCurrentChannel.ChannelArn === channelArn) return;
      const newMessages = await listChannelMessages(channelArn, member.userId);
      const channel = await describeChannel(channelArn, member.userId);
      // setMessagesList(newMessages.Messages);
      setActiveCurrentChannel(channel);
      setActiveChannel(channel);
    }
  };

  const openChatBox = async (modalStatus) => {
    setOpen(modalStatus);
    if (isAuthenticated) {
      getChannel();
    } else {
      getUserDtails();
    }
  };

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
          onClick={() => openChatBox(true)}
          alt="no image"
        />
      )}
      {isChatBoxOpen && (
        <div className="App">
          <div className="App-header">
            <h1>Msh Chat</h1>
          </div>
          <div className="chatMessages">
            <Messages
              isAuthenticated={isAuthenticated}
              messages={messagesList}
            />
          </div>
          <Input onSendMessage={onSendMessage} />
        </div>
      )}
    </div>
  );
};

export default App;
