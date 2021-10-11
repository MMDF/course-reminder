import { FirebaseApp } from "@firebase/app"
import { getAuth, User } from "@firebase/auth"
import { Firestore, getFirestore } from "firebase/firestore"
import { createContext, useContext, useEffect, useMemo, useState } from "react"

export const useAuth = () => {
  const [auth, setAuth] = useState<User | null>(getAuth().currentUser)
  useEffect(() => {
    const sub = getAuth().onIdTokenChanged((user) => {
      setAuth(user)
    })

    return () => sub?.()
  }, [])
  return auth
}

export const useApp = (): FirebaseApp => {
  return useContext(AppContext).app
}
export const useFirestore = (): Firestore => {
  const app = useApp()
  return useMemo(() => getFirestore(app), [app])
}
export const AppContext = createContext({
  app: undefined as unknown as FirebaseApp,
})
