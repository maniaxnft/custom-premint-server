import axios from "axios";

const baseURL = process.env.REACT_APP_BACKEND_URL;

export const mainInstance = axios.create({
  baseURL,
});

export const isAuthenticated = async () => {
  try {
    const res = await mainInstance.get("/auth/isAuthenticated", {
      withCredentials: true,
    });
    return res?.data?.keyIdentifier;
  } catch (e) {
    return false;
  }
};

export const logout = async () => {
  try {
    await mainInstance.get("/auth/logout", {
      withCredentials: true,
    });
    return true;
  } catch (e) {
    return false;
  }
};

export const getNonce = async ({ evmAddress }) => {
  try {
    const res = await mainInstance.post("/auth/login/metamask", { evmAddress });
    if (res?.data?.nonce) {
      return res?.data?.nonce;
    } else {
      throw new Error("Something went wrong");
    }
  } catch (e) {
    throw new Error(e.message);
  }
};

export const validateSignature = async ({ evmAddress, nonce, signature }) => {
  try {
    const res = await mainInstance.post(
      "/auth/login/validateSignature",
      {
        evmAddress,
        nonce,
        signature,
      },
      { withCredentials: true }
    );
    if (res?.data) {
      return res?.data;
    } else {
      throw new Error("Something went wrong");
    }
  } catch (e) {
    throw new Error(e.message);
  }
};
