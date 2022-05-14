// import { Auth } from "@aws-amplify/auth";
// import appConfig from "../config/aws_config";
// import AWS from "aws-sdk";

// const userSignOut = async () => {
//   try {
//     await Auth.signOut();
//     //   setIsAuthenticated(false);
//   } catch (error) {
//     console.log(`error signing out ${error}`);
//   }
// };

// const userSignUp = async (username = "mark1", password = "Test@1mark1") => {
//   try {
//     await Auth.signUp({
//       username,
//       password,
//       attributes: {
//         // TODO: Utilize input field for email that way we can then have users self confirm after reg.
//         email: "email@me.com",
//         profile: "none",
//       },
//     });
//   } catch (error) {
//     console.log("error signing up:", error);
//   }
// };

// const updateUserAttributes = async (userId) => {
//   try {
//     const user = await Auth.currentAuthenticatedUser();

//     await Auth.updateUserAttributes(user, {
//       profile: userId,
//     });
//   } catch (err) {
//     console.log(err);
//   }
// };

// const getAwsCredentialsFromCognito = async () => {
//   const creds = await Auth.currentCredentials();
//   const essentialCreds = await Auth.essentialCredentials(creds);
//   AWS.config.region = appConfig.region;
//   AWS.config.credentials = essentialCreds;
//   console.log("getAwsCreadentialsFromCognito", essentialCreds);
//   localStorage.setItem("user", JSON.stringify(essentialCreds));

//   return essentialCreds;
// };

// const setAuthenticatedUserFromCognito = async () => {
//   // setUseCognitoIdp(true);
//   console.log("setAthFromCognito called");
//   Auth.currentUserInfo()
//     .then((curUser) => {
//       console.log("setAthFromCognito called", curUser /*  */);
//       localStorage.setItem("userId", JSON.stringify(curUser));
//       return curUser;
//     })
//     .catch((err) => {
//       console.log(`Failed to set authenticated user! ${err}`);
//       return err;
//     });
//   getAwsCredentialsFromCognito();
// };

// const userSignIn = async (username, password) => {
//   console.log("SignInCalled", username, password);
//   return Auth.signIn({ username, password })
//     .then(
//       setAuthenticatedUserFromCognito().then((val) => {
//         return val;
//       })
//     )
//     .catch((err) => {
//       console.log("step 1", err);
//       return err;
//     });
// };

// const setAuthenticatedUserFromCredentialExchangeService = (response) => {
//   // setUseCognitoIdp(false);
//   const stsCredentials = response.ChimeCredentials;
//   updateUserAttributes(response.ChimeUserId);
//   AWS.config.region = appConfig.region;
//   AWS.config.credentials = {
//     accessKeyId: stsCredentials.AccessKeyId,
//     secretAccessKey: stsCredentials.SecretAccessKey,
//     sessionToken: stsCredentials.SessionToken,
//   };

//   // setIsAuthenticated(true);
// };

// // Credential Exchange Service Code.  Set Access Token on Authorization header using Bearer type.
// const userExchangeTokenForAwsCreds = (accessToken) => {
//   fetch(`${appConfig.apiGatewayInvokeUrl}creds`, {
//     method: "POST",
//     credentials: "include",
//     headers: new Headers({
//       Authorization: `Bearer ${btoa(accessToken)}`,
//     }),
//   })
//     .then((response) => response.json())
//     .then((data) => setAuthenticatedUserFromCredentialExchangeService(data))
//     .catch((err) => {
//       console.log(err);
//     });
// };

// export {
//   userSignIn,
//   userSignUp,
//   getAwsCredentialsFromCognito,
//   userSignOut,
//   userExchangeTokenForAwsCreds,
// };
