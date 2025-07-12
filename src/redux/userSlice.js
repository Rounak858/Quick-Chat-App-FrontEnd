import { createSlice } from "@reduxjs/toolkit"

const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: null,
        AllUsers: [],
        allChats: [],
        selectedChat: null
    },
    reducers: {
        setUser: (state, actions) => { state.user = actions.payload },
        setAllUser: (state, actions) => { state.AllUsers = actions.payload },
        seeAllChats: (state, actions) => { state.allChats = actions.payload },
        setSelectedChat: (state, actions) => { state.selectedChat = actions.payload }
    }
})

export const { setUser, setAllUser, seeAllChats, setSelectedChat } = userSlice.actions;
export default userSlice.reducer;