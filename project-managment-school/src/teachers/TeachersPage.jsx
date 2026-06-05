import React, { useEffect } from "react";
import TeacherGroups from "./TeacherGroups/TeacherGroups";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import Header from "../components/adminsCompnents/navbar/Header";
import TeacherSideBar from "../components/teachersComponents/TeacherSideBar";
import { checkauthApi } from "../apiCalls/authCalls";
import { useDispatch, useSelector } from "react-redux";
import { checkauth, selectAuth } from "../Redux/slices/authSlice";
import { getTeacherWithUser } from "../apiCalls/teacherCalls";
import LoadingFirstPage from "../components/loading/LoadingFirstPage";

function TeachersPage() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const { user } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const nav = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        // Restore the session from the cookie if Redux was reset (page reload)
        let current = user;
        if (!current) {
          const data = await checkauthApi();
          if (data && data.user) {
            current = data.user;
            dispatch(checkauth(current));
          } else {
            nav("/login");
            return;
          }
        }
        // Enrich with the teacher profile
        const newList = await getTeacherWithUser(current);
        if (newList) {
          dispatch(
            checkauth({
              id: newList.id,
              role: "teacher",
              phone: newList.phoneNumber,
              email: newList.email,
              name: newList.fullName,
              ...newList,
            })
          );
        }
      } catch (error) {
        console.error("Error initializing teacher page:", error);
        nav("/login");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return <LoadingFirstPage />;
  }

  return (
    <div className="font-cairo">
      <Header isOpen={isOpen} setIsOpen={() => setIsOpen(!isOpen)} />
      <div className="flex">
        <TeacherSideBar isOpen={isOpen} setIsOpen={setIsOpen} />
        <div
          className="pt-20 
          h-[calc(100vh-1rem)]
          overflow-y-scroll w-full px-4 "
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default TeachersPage;
