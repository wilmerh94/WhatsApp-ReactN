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
  },
});

export const { setChatsData } = chatSlice.actions;
export default chatSlice.reducer;
