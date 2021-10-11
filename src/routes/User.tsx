import { doc } from "@firebase/firestore";
import { getDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { useFirestore } from "../util/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth } from "firebase/auth";
import { useAppSelector } from "../store";

export const User: React.FC = () => {
  const fs = useFirestore();
  const auth = getAuth();
  const [user, setUser] = useState(null);
  useEffect(() => {
    getDoc(doc(fs, `users/${auth.currentUser.uid}`)).then((s): void =>
      setUser(s.data())
    );
  }, [auth.currentUser?.uid, fs]);
  const devices = user?.devices;
  const token = useAppSelector((s) => s.deviceToken);
  const addThisDevice = useCallback(
    () => httpsCallable(getFunctions(), "addDevice")({ token }),
    [token]
  );

  return (
    <div className="relative flex-row container z-10 bg-white text-black flex font-semibold rounded-lg border shadow-lg px-10 py-8 m-20">
      <div className="flex-[2] flex flex-col items-start">
        <h1 className="mb-4 text-lg font-semibold">Seçtiğiniz dersler:</h1>
        {devices?.map((device: { name: string; token: string }) => (
          <div key={device.token} className="relative font-bold text-xl group">
            {device.name}{" "}
            {token === device.token ? (
              <div className="text-blue-800">(Bu cihaz)</div>
            ) : null}
          </div>
        ))}
        {!devices || devices.length === 0 ? (
          <div>
            Hiçbir cihaz bulunamadı, bu cihazı eklemek için{" "}
            <button
              className="inline underline font-bold cursor-pointer"
              onClick={addThisDevice}
            >
              {" "}
              buraya tıkla.
            </button>
          </div>
        ) : null}
        {devices &&
        devices.findIndex((d: { token: string }) => d.token === token) ===
          -1 ? (
          <div>
            Bu cihaz bulunamadı. Bu cihazı eklemek için{" "}
            <button
              className="inline underline font-bold cursor-pointer"
              onClick={addThisDevice}
            >
              {" "}
              buraya tıkla.
            </button>
          </div>
        ) : null}
        <div className="flex-1" />
      </div>
    </div>
  );
};
