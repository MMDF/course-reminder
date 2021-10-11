import { configureStore } from "@reduxjs/toolkit"
import { useSelector } from "react-redux"
import { prevLogin } from "./prev-login"
import { tokenSlice } from "./token"

import storage from "redux-persist/lib/storage"
import { persistStore, persistCombineReducers } from "redux-persist"

const persistConfig = { key: "root", storage }

export const store = configureStore({
  reducer: persistCombineReducers(persistConfig, {
    deviceToken: tokenSlice.reducer,
    prevLoginState: prevLogin.reducer,
  }),
})
export const persistor = persistStore(store)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export const useAppSelector = <T extends unknown>(
  selector: (state: RootState) => T
): T => useSelector<RootState, T>(selector)
