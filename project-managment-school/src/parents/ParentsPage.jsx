import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkauth, selectAuth } from "../Redux/slices/authSlice";
import { getParentWithUser } from "../apiCalls/parentCalls";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "../components/adminsCompnents/navbar/Header";
import { checkauthApi } from "../apiCalls/authCalls";
import LoadingFirstPage from "../components/loading/LoadingFirstPage";

function ParentsPage() {
  const { user } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
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
        const parentData = await getParentWithUser(current);
        if (parentData) {
          dispatch(
            checkauth({
              id: parentData.id,
              role: "parent",
              phone: parentData.phoneNumber,
              email: parentData.email,
              name: parentData.fullName,
              ...parentData,
            })
          );
        }
      } catch (error) {
        console.error("Error initializing parent page:", error);
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
        <div className="pt-20 h-[calc(100vh-1rem)] overflow-y-scroll w-full px-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default ParentsPage;
