import { ACTIONS } from "./actions";

const initialState = {
  loading: false,
  isMetamaskPresent: true,
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

    default:
      return {
        ...state,
      };
  }
};

export default reducer;
