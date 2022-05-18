import axios from "axios";
import { endPoints } from "../config/appConfig";

export const handleSendMessageToPatient = async (data) => {
  console.log("handleSendMessageToPatient", data);
  try {
    const response = await axios.post(
      endPoints.apiUrl + `/daffo/dispatch/userResponse`,
      data
      // {
      //   headers: {
      //     "Content-Type": "application/json",
      //     //   Authorization: `Bearer ${data.token}`,
      //   },
      // }
    );
    return response;
  } catch (error) {
    return error && error.response;
  }
};
