import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  token: null,
  userData: null,
  didTryAutoLogin: false,
  //   inputValues: {
  //     firstName: '',
  //     lastName: '',
  //     email: '',
  //     password: '',
  //   },
  //   inputValidities: {
  //     firstName: false,
  //     lastName: false,
  //     email: false,
  //     password: false,
  //   },
  //   formIsValid: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authenticate: (state, action) => {
      const { payload } = action;
      state.token = payload.token;
      state.userData = payload.userData;
      state.didTryAutoLogin = true;
    },
    setDidTryAutoLogin: (state, action) => {
      state.didTryAutoLogin = true;
    },
    logout: (state, action) => {
      state.token = null;
      state.userData = null;
      state.didTryAutoLogin = false;
    },
    updateSignInUserData: (state, action) => {
      state.userData = { ...initialState.userData, ...action.payload.newData };
    },
  },
});

export const {
  authenticate,
  setDidTryAutoLogin,
  logout,
  updateSignInUserData: updateLoggedInUserData,
} = authSlice.actions;
export default authSlice.reducer;
