import { ACTIONS } from "./actions";

const initialState = {
  loading: false,
  isMetamaskPresent: true,
  walletAddress: "",
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING: {
      return {
        ...state,
        loading: action.payload.data,
      };
    }

    case ACTIONS.IS_METAMASK_PRESENT: {
      return {
        ...state,
        isMetamaskPresent: action.payload.data,
      };
    }

    case ACTIONS.SET_WALLET_ADDRESS: {
      return {
        ...state,
        walletAddress: action.payload.data,
      };
    }

    case ACTIONS.SET_DISCORD_NAME: {
      return {
        ...state,
        discordName: action.payload.data,
      };
    }

    case ACTIONS.SET_TWITTER_NAME: {
      return {
        ...state,
        twitterName: action.payload.data,
      };
    }

    default:
      return {
        ...state,
      };
  }
};

export default reducer;
