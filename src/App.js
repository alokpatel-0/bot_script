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
import { getPatientSchedule, handleSendMessageToPatient } from "./api/api";

const App = () => {
  let _identityClient;
  let usertoBeadded;
  const { member, isAuthenticated, userSignIn, userSignOut } = useAuthContext();
  const { messages } = useChatMessagingState();
  const { activeChannel, setActiveChannel } = useChatChannelState();
  const [isChatBoxOpen, setOpen] = useState(false);
  const [messagesList, setMessagesList] = useState([]);
  const [currentChannelList, setCurrentChannelList] = useState([]);
  const [activeCurrentChannel, setActiveCurrentChannel] = useState([]);
  const [userlist, setUserList] = useState([]);
  const [reLogin, setReLogin] = useState(false);
  const [nextToken, setNextToken] = useState("");
  const [scrollEnable, setScrollEnable] = useState(true);
  const [slots, setSlots] = useState({ phoneNumber: "", Otp: "" });
  const [patientData, setPatientData] = useState();

  let tempArray = [];

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

  const getChannelMessage = async (channelArn) => {
    if (isAuthenticated) {
      listChannelMessages(channelArn, member.userId)
        .then((channelMessage) => {
          console.log("channelMessagechannelMessage", channelMessage);
          setNextToken(channelMessage.NextToken);
          setMessagesList([...messagesList, ...channelMessage.Messages]);
        })
        .catch((err) => {
          console.log("error", err);
        });
    }
  };

  window.onbeforeunload = (e) => {
    localStorage.removeItem("usercred");
    return;
  };
  useEffect(() => {
    const userCred = JSON.parse(localStorage.getItem("usercred"));
    const userDetails = JSON.parse(localStorage.getItem("userId"));

    if (isAuthenticated && userDetails.username) {
      getPatientSchedule({ mobileNumber: userDetails.username })
        .then((user) => {
          if (user && user.data !== "No data found") {
            setPatientData(user.data.patient);
          } else {
            setPatientData({});
          }
        })
        .catch((err) => {
          console.log("this is error", err);
        });
    }
    if (!userCred) {
      localStorage.setItem(
        "usercred",
        JSON.stringify({ username: null, otp: null })
      );
    }
    if (isAuthenticated) {
      getChannel();
    } else {
      // getUserDtails(null);
    }
    setupClient();
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      setMessagesList([...messagesList, messages.pop()]);
    }
  }, [messages]);

  const onSendMessage = async (newMessage) => {
    setScrollEnable(true);
    if (newMessage.Content) {
      tempArray = [...messagesList];
      if (isAuthenticated) {
        let userData = null;
        if (patientData && patientData.patientDetails) {
          userData = {
            Metadata: JSON.stringify({
              isMeetingInfo: false,
              patientDetails: {
                ...patientData.patientDetails,
                _id: patientData._id,
              },
            }),
          };
        }
        await sendChannelMessage(
          activeChannel.ChannelArn,
          newMessage.Content,
          Persistence.PERSISTENT,
          MessageType.STANDARD,
          member,
          userData
        );
      } else {
        const userCred = JSON.parse(localStorage.getItem("usercred"));
        tempArray.push(newMessage);
        console.log("555555555", tempArray);
        if (tempArray.length > 1 && !reLogin) {
          if (!userCred.username) {
            if (/^[6-9]\d{9}$/.test(newMessage.Content)) {
              userCred.username = newMessage.Content;
              const body = {
                message: {
                  Content: "Please enter OTP",
                  Sender: { Name: "Bot" },
                },
              };
              localStorage.setItem("usercred", JSON.stringify(userCred));
              tempArray.push(body.message);
            } else {
              const body = {
                message: {
                  Content: "Please enter valid phone number",
                  Sender: { Name: "Bot" },
                },
              };
              tempArray.push(body.message);
            }
          } else if (!userCred.otp) {
            if (/^[0-9]{1,6}$/.test(newMessage.Content)) {
              userCred.otp = newMessage.Content;
              localStorage.setItem("usercred", JSON.stringify(userCred));
            } else {
              const body = {
                message: {
                  Content: "Please enter valid OTP",
                  Sender: { Name: "Bot" },
                },
              };
              tempArray.push(body.message);
            }
          }
        } else {
          setReLogin(false);
          const userCred = JSON.parse(localStorage.getItem("usercred"));
          if (userCred && !userCred.username) {
            const body = {
              message: {
                Content: "Please Enter Phone number",
                Sender: { Name: "Bot" },
              },
            };
            tempArray.push(body.message);
          }
        }
        setMessagesList(tempArray);
        if (userCred && userCred.username && userCred.otp) {
          onUserSignIn(userCred.username, userCred.otp);
        }
      }
    }
  };

  const onUserSignIn = async (userName, password) => {
    password = "@1aT" + password;
    console.log("signin", userName, password);
    await userSignIn(userName, password)
      .then((resp) => {
        if (resp === "Invalid username or password") {
          const messageData = {
            Content: "Incorrect username or password",
            Sender: { Name: "Bot" },
          };
          tempArray.push(messageData);
          const body = {
            message: {
              Content: "Please Enter Phone number",
              Sender: { Name: "Bot" },
            },
          };
          tempArray.push(body.message);
          setMessagesList([...tempArray]);
          localStorage.setItem(
            "usercred",
            JSON.stringify({ username: null, otp: null })
          );
        } else if (resp === "User does not exist") {
          const messageData = {
            Content: "User does not exist.",
            Sender: { Name: "Bot" },
          };
          tempArray.push(messageData);
          const body = {
            message: {
              Content: "Please Enter Phone number",
              Sender: { Name: "Bot" },
            },
          };
          tempArray.push(body.message);
          setMessagesList([...tempArray]);
        } else {
          getChannel();
          localStorage.removeItem("usercred");
        }
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
    console.log("createchannel", member);
    if (!isAuthenticated) return;
    const channelArn = await createChannel(
      appConfig.appInstanceArn,
      null,
      member.username,
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
    }
  };

  const clearStates = async () => {
    tempArray = [];
    setMessagesList([]);
    setCurrentChannelList([]);
    setActiveCurrentChannel([]);
    setUserList([]);
    // setActiveChannel();
    setSlots([]);
  };

  const handleSignOut = async () => {
    // setOpen(false);
    await userSignOut();
    setReLogin(true);
    window.localStorage.clear();
    localStorage.setItem(
      "usercred",
      JSON.stringify({ username: null, otp: null })
    );
    clearStates();
    const logOutMessage = {
      Content: "User Logout Successfully",
      Sender: { Name: "Bot" },
    };
    setMessagesList([logOutMessage]);
    console.log("logout called", messagesList);
  };

  const loadMoreChat = async (params) => {
    if (!isAuthenticated) return;
    setScrollEnable(params.isLoadMore);
    console.log("load chat called");
    if (nextToken == null) {
      console.log("No new messages");
      return;
    }

    const oldMessages = await listChannelMessages(
      activeChannel.ChannelArn,
      member.userId,
      nextToken
    );
    setNextToken(oldMessages.NextToken);
    const newMessages = [...oldMessages.Messages, ...messagesList];

    setMessagesList(newMessages);
  };

  return (
    <div className="main">
      {isChatBoxOpen ? (
        <img
          className="open-button"
          src="https://cdn1.iconfinder.com/data/icons/social-messaging-ui-color-round-1/254000/45-512.png"
          onClick={() => setOpen(false)}
          alt="no image"
        />
      ) : (
        <img
          className="open-button"
          src="https://static.vecteezy.com/system/resources/previews/000/425/269/non_2x/vector-chat-icon.jpg"
          onClick={() => openChatBox(true)}
          alt="no image"
        />
      )}
      {isChatBoxOpen && (
        <div className="App">
          <div className="App-header">
            <div></div>
            <h1>MSH</h1>
            {isAuthenticated ? (
              <div
                onClick={handleSignOut}
                style={{
                  color: "#fff",
                  paddingRight: "10px",
                  cursor: "pointer",
                  fontSize: "15px",
                }}
              >
                Logout
              </div>
            ) : (
              <div></div>
            )}
          </div>
          <div className="chatMessages">
            <Messages
              scrollEnable={scrollEnable}
              nextToken={nextToken}
              loadMoreChat={loadMoreChat}
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
