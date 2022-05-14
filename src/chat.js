import React from "react";
import App from "./App";
import { AuthProvider } from "./providers/AuthProvider";
import { MessagingProvider } from "./providers/ChatMessagesProvider";

export default function Chat() {
  return (
    <React.StrictMode>
      <AuthProvider>
        <MessagingProvider>
          <App />
        </MessagingProvider>
      </AuthProvider>
    </React.StrictMode>
  );
}
