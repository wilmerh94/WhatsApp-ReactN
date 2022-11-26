import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  storedUsers: {},
};

export const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setStoredUsers: (state, action) => {
      const newUsers = action.payload.newUsers;
      const existingUsers = state.storedUsers;

      const usersArray = Object.values(newUsers);
      for (let i = 0; i < usersArray.length; i++) {
        const userData = usersArray[i];
        existingUsers[userData.userId] = userData;
      }
      state.storedUsers = existingUsers;
    },
  },
});

export const { setStoredUsers } = userSlice.actions;
export default userSlice.reducer;
