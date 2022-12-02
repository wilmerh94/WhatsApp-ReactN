import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userChatData: {},
};

export const chatSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setChatsData: (state, action) => {
      state.userChatData = { ...action.payload.chatsData };
    },
    clearData: (state, action) => {
      state.userChatData = {};
    },
  },
});

export const { setChatsData, clearData } = chatSlice.actions;
export default chatSlice.reducer;
