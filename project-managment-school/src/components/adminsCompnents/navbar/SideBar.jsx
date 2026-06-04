import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { getUserByIdApi } from "../../../apiCalls/authCalls";
import { selectAuth } from "../../../Redux/slices/authSlice";

function SideBar({ isOpen, setIsOpen }) {
  const [userNew, setUserNew] = useState(null);
  const { user } = useSelector(selectAuth);

  const fetchUser = async () => {
    try {
      const userData = await getUserByIdApi(user.id);
      setUserNew(userData);
      console.log(userData);
    } catch (err) {
      console.error("Error checking authentication status:", err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const checkPermission = (permissionType) =>
    userNew?.permissions.some(
      (perm) => perm.permissionType === permissionType
    ) || userNew?.role === "admin";

  const hasClassPermission = checkPermission("classes");
  const hasAdditionalPermission = checkPermission("users");
  const hasFinancialPermission = checkPermission("financial");

  const NavLinkWrapper = ({ to, children }) => (
    <NavLink
      to={to}
      onClick={() => setIsOpen(false)}
      className={({ isActive }) =>
        `px-4 py-1 rounded-lg cursor-pointer ${
          isActive ? "bg-gray-300" : "hover:bg-gray-200"
        }`
      }
    >
      {children}
    </NavLink>
  );

  return (
    <div
      className={`w-80 
        ${isOpen ? "max-md:translate-x-0" : "max-md:translate-x-full"}
        duration-200 bg-white z-40 max-md:fixed min-h-screen h-fit pt-14 p-10 shadow-xl`}
    >
      <div className="font-bold rounded-lg">الصفحة الرئيسة</div>
      <div className="w-full flex flex-col">
        <NavLinkWrapper to="/">الاحصائيات</NavLinkWrapper>
      </div>

      {hasClassPermission && (
        <div className="flex flex-col">
          <div className="font-bold py-2">الاقسام والدورات</div>
          <NavLinkWrapper to="classes/Languages">اللغات</NavLinkWrapper>
          <NavLinkWrapper to="classes/Courses">الدورات</NavLinkWrapper>
          <NavLinkWrapper to="classes/Levels">المستويات</NavLinkWrapper>
          <NavLinkWrapper to="/admin/schedule/levels">
            جداول الحصص
          </NavLinkWrapper>
        </div>
      )}

      {hasAdditionalPermission && (
        <div className="flex flex-col">
          <div className="font-bold py-2">المستخدمين والإضافات</div>
          <NavLinkWrapper to="/additional/Students">التلاميذ</NavLinkWrapper>
          <NavLinkWrapper to="/additional/Teachers">الأساتذة</NavLinkWrapper>
          <NavLinkWrapper to="/additional/Parents">
            أولياء التلاميذ
          </NavLinkWrapper>
        </div>
      )}

      {hasFinancialPermission && (
        <div className="flex flex-col">
          <div className="font-bold py-2">التسيير المالي</div>
          <NavLinkWrapper to="/Financialmanagement">الأستاذ</NavLinkWrapper>
          <NavLinkWrapper to="/FinancialEmployer">العمال</NavLinkWrapper>
          <NavLinkWrapper to="/debts">قائمة الديون</NavLinkWrapper>
        </div>
      )}

      {user.role === "admin" && (
        <div className="flex flex-col">
          <div className="font-bold px-2">التحكم في الموقع</div>
          <NavLinkWrapper to="/Permission">تحديد الصلاحيات</NavLinkWrapper>
          <NavLinkWrapper to="/additionalWebSite">إضافات الموقع</NavLinkWrapper>
          <NavLinkWrapper to="/admin/periods">
            إدارة الفترات الدراسية
          </NavLinkWrapper>
        </div>
      )}
    </div>
  );
}

export default SideBar;
