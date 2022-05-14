import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

import * as AWS from "aws-sdk";

import { Amplify } from "aws-amplify";
import awsExports from "./aws-exports";
import configureAmplify from "./config/amplify_config";
import Chat from "./chat";
import appConfig from "./config/aws_config";
Amplify.configure(awsExports);

AWS.config.update({
  region: appConfig.region,
  // apiVersion: appConfig.apiVersion,
  credentials: {
    accessKeyId: appConfig.accessKeyId,
    secretAccessKey: appConfig.secretAccessKey,
  },
});

configureAmplify();

// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById("root-cra")
// );

document.addEventListener("DOMContentLoaded", (_event) => {
  ReactDOM.render(<Chat />, document.getElementById("root"));
});
// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById("root")
// );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
