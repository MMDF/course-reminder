import { doc } from "@firebase/firestore";
import { getDoc } from "firebase/firestore";
import Fuse from "fuse.js";
import { useEffect, useRef, useState } from "react";
import { useFirestore } from "../util/firebase";
import { Course } from "../types/Course";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth } from "firebase/auth";
import { Link } from "react-router-dom";
import MdAdd from "../assets/add_black_24dp.svg";
const getFn = (Fuse as any).config.getFn;
type CourseWithKey = Course & { key: string };
interface Semester {
  courses: { [key: string]: Course };
}

const options = {
  isCaseSensitive: false,
  // includeScore: false,
  // shouldSort: true,
  // includeMatches: false,
  // findAllMatches: false,
  // minMatchCharLength: 1,
  // location: 0,
  threshold: 0.4,
  // distance: 100,
  // useExtendedSearch: false,
  // ignoreLocation: false,
  // ignoreFieldNorm: false,
  getFn: (
    obj: { name: string; code: string; instructor: string },
    path: string | string[]
  ) =>
    path === "instructor"
      ? getFn(obj, path).toLocaleLowerCase("tr")
      : getFn(obj, path),
  keys: [
    { name: "name", weight: 0.4 },
    { name: "code", weight: 0.4 },
    { name: "instructor", weight: 0.2 },
  ],
};
export const CoursePicker = () => {
  const fs = useFirestore();
  const [numResults, setNumResults] = useState(20);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Fuse.FuseResult<CourseWithKey>[]>([]);
  const fuseRef = useRef<Fuse<any>>(null);
  const semesterRef = useRef<Semester>(null);
  const auth = getAuth();
  const [hydrateComplete, setHydrateComplete] = useState(false);

  useEffect(() => {
    getDoc(doc(fs, `users/${auth.currentUser?.uid}`)).then((snap) => {
      if (snap.exists()) {
        setSelected(
          Object.fromEntries(
            (snap.get("courses") ?? []).map((course: string) => [course, true])
          )
        );
      }
      setHydrateComplete(true);
    });
    getDoc(doc(fs, "semesters/2021-2022-1")).then((res) => {
      semesterRef.current = res.data() as any;
      fuseRef.current = new Fuse(
        Object.entries(res.data()?.courses).map(([key, entry]) => ({
          key,
          ...(entry as any),
        })),
        options
      );
    });
  }, []);

  useEffect(() => {
    const res = fuseRef?.current?.search?.(search.toLocaleLowerCase("tr"), {
      limit: numResults,
    });
    if (res) setResults(res);
  }, [numResults, search]);
  const [selected, setSelected] = useState({});

  useEffect(() => {
    if (hydrateComplete)
      httpsCallable(
        getFunctions(),
        "setMyCourses"
      )({
        courses: Object.keys(selected).filter(
          (k) => selected[k as keyof typeof selected]
        ),
      });
  }, [selected, hydrateComplete]);
  const toggleCourse = (key: string) => {
    setSelected((s) => ({ ...s, [key]: !s[key as keyof typeof s] }));
  };

  return (
    <div className="relative flex-row container z-10 bg-white text-black flex font-semibold rounded-lg border shadow-lg px-10 py-8 m-20">
      <div className="flex-[2] flex flex-col items-start">
        <h1 className="mb-4 text-lg font-semibold">Seçtiğiniz dersler:</h1>
        {Object.keys(selected)
          .filter((k) => selected[k as keyof typeof selected])
          .map((key) => (
            <div
              key={key}
              className="relative font-bold cursor-pointer text-xl group"
              onClick={() =>
                setSelected((s) => ({ ...s, [key]: !s[key as keyof typeof s] }))
              }
            >
              <div className="h-[2px] w-0 transition-all group-hover:w-[110%] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500" />
              {key}
            </div>
          ))}
        <div className="flex-1" />
        <Link
          to="/remindertimes"
          className="px-4 py-2 dev rounded-lg self-center mt-6 border-2 mt-4 border-gray-700"
        >
          Hatırlatma zamanlarını seç
        </Link>
      </div>
      <div className="flex-1 flex flex-col h-[70vh] ">
        <h1 className="mb-4">Ders seç</h1>
        <input
          placeholder="Ders Arama"
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 mb-2 border-2 rounded-md border-gray-300 focus::border-gray-400 transition-all"
          onKeyPress={(e) =>
            e.key === "Enter" &&
            results.length === 1 &&
            toggleCourse(results[0].item.key)
          }
          value={search}
        />
        <div className="overflow-y-scroll flex-1 flex flex-col">
          {results.length === 0 ? (
            <span className="mt-8 text-gray-500 text-center text-sm font-light self-center">
              {search.length === 0
                ? "Arama çubuğuna bir şeyler yaz ve terime yakın olan dersleri burada gör."
                : "Bu arama ile uyuşan hiçbir ders bulamadık :("}
            </span>
          ) : (
            results.map((res) => {
              const key = res.item.key;
              const courseAdded = selected[key as keyof typeof selected];
              return (
                <div
                  key={key}
                  className="relative flex justify-between py-2 border-b border-gray-400 mx-2"
                >
                  <div className="flex z-10 flex-col">
                    <h3 className="font-bold text-gray-800 text-lg">
                      {res.item.code}
                    </h3>
                    <h6 className="font-semibold text-gray-800 text-base">
                      {res.item.name}
                    </h6>
                    <span className="font-normal text-gray-600 text-sm">
                      {res.item.instructor}
                    </span>
                    <span>{key}</span>
                  </div>
                  <div className="absolute flex overflow-hidden justify-end inset-0 inset-x-[-4px]">
                    <div className="mr-2 flex-col flex justify-center">
                      <button
                        onClick={() =>
                          setSelected((selected) => ({
                            ...selected,
                            [key]: !selected[key as keyof typeof selected],
                          }))
                        }
                        className="text-xl relative rounded-full transition-all group flex w-10 h-10 "
                      >
                        <div
                          className={
                            "relative flex justify-center rounded-full items-center w-full h-full transition-all transform z-10 " +
                            (courseAdded
                              ? "rotate-45 hover:bg-red-500"
                              : "hover:bg-green-200")
                          }
                        >
                          <img src={MdAdd} />
                        </div>
                        <div
                          onClick={(e) => courseAdded && e.stopPropagation()}
                          className={
                            "absolute transform bg-green-200 hover:opacity-100 opacity-0 scale-100 duration-500 group-hover:opacity-100 inset-0 transition-all ease-in-out rounded-full " +
                            (courseAdded
                              ? "scale-[80] opacity-100"
                              : "hover:bg-green-200")
                          }
                        ></div>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {results.length === numResults && (
            <span className="mt-4 mb-4 text-gray-500 text-center text-sm font-light self-center">
              Performans için arama sonuçları {numResults} taneye kısıtlandı. 20
              arttırmak için{" "}
              <button
                onClick={() => setNumResults(numResults + 20)}
                className="inline underline font-normal"
              >
                buraya tıkla.
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
