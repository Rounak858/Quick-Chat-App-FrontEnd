import { configureStore } from "@reduxjs/toolkit";
import loaderReducer from './loaderSlice'
import userReducer from './userSlice'



const store = configureStore({
    reducer: {loaderReducer,userReducer} //in ES6 if the property name is same as the variable name then we don't need to assign explicitly
})


export default store;