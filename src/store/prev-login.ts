import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export const prevLogin = createSlice({
  name: "prevLoginState",
  initialState: { signedIn: false } as { signedIn: boolean; uid?: string },
  reducers: {
    signIn(state, action: PayloadAction<{ uid: string }>) {
      return { signedIn: true, uid: action.payload.uid }
    },
    signOut(state) {
      return { signedIn: false }
    },
  },
})

export const { signIn, signOut } = prevLogin.actions
