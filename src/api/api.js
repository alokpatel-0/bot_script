import axios from "axios";
import { endPoints } from "../config/appConfig";

export const handleSendMessageToPatient = async (data) => {
  console.log("handleSendMessageToPatient", data);
  try {
    const response = await axios.post(
      endPoints.apiUrl + `/daffo/dispatch/userResponse`,
      data
    );
    return response;
  } catch (error) {
    return error && error.response;
  }
};

export const getPatientSchedule = async (data) => {
  try {
    const response = await axios.post(
      endPoints.apiUrl + "/daffo/dispatch/getPatientSchedule",
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    console.log("error", JSON.stringify(error));
    return error && error.response;
  }
};
