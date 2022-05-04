import axios from "axios";

const baseURL = process.env.REACT_APP_BACKEND_URL;

export const mainInstance = axios.create({
  baseURL,
});

export const isAuthenticated = async () => {
  try {
    const res = await mainInstance.get("/isAuthenticated", {
      withCredentials: true,
    });
    return res?.data?.keyIdentifier;
  } catch (e) {
    return false;
  }
};

export const logout = async () => {
  try {
    await mainInstance.get("/logout", {
      withCredentials: true,
    });
    return true;
  } catch (e) {
    return false;
  }
};

export const getNonce = async ({ walletAddress }) => {
  try {
    const res = await mainInstance.post("/nonce", { walletAddress });
    console.log(res);
    if (res?.data?.nonce) {
      return res?.data?.nonce;
    } else {
      throw new Error("Something went wrong");
    }
  } catch (e) {
    throw new Error(e.message);
  }
};

export const validateSignature = async ({
  walletAddress,
  nonce,
  signature,
}) => {
  try {
    const res = await mainInstance.post(
      "/validate_signature",
      {
        walletAddress,
        nonce,
        signature,
      },
      { withCredentials: true }
    );
    return res?.data;
  } catch (e) {
    throw new Error(e.message);
  }
};
