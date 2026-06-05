import React, { useEffect, useState } from "react";
import {
  FaChalkboardTeacher,
  FaMoneyBillWave,
  FaUserGraduate,
  FaUsers,
} from "react-icons/fa";
import BarChart from "./BarChart";
import CardStatictc from "./CardStatictc";
import { countStudents } from "../../apiCalls/studentCalls";
import { countTeachers } from "../../apiCalls/teacherCalls";
import { countParentsApi } from "../../apiCalls/parentCalls";
import { getDebts } from "../../apiCalls/receiptCalls";

function Statistics() {
  const [Students, setStudents] = useState(0);
  const [Teachers, setTeachers] = useState(0);
  const [Parents, setParents] = useState(0);
  const [debt, setDebt] = useState({ count: 0, totalDebt: "0.00" });

  const getCountStudents = async () => {
    const response = await countStudents();
    if (response) setStudents(response);
  };

  const getCountTeachers = async () => {
    const response = await countTeachers();
    if (response) setTeachers(response);
  };

  const getCountParents = async () => {
    const response = await countParentsApi();
    if (response) setParents(response.count);
  };

  const getDebtSummary = async () => {
    try {
      const res = await getDebts();
      if (res?.summary) setDebt(res.summary);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    getCountStudents();
    getCountTeachers();
    getCountParents();
    getDebtSummary();
  }, []);

  return (
    <div dir="rtl" className="p-2 md:p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">الإحصائيات</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardStatictc
          text="عدد التلاميذ"
          value={Students}
          icon={<FaUserGraduate />}
          gradient="bg-gradient-to-br from-indigo-500 to-indigo-700"
        />
        <CardStatictc
          text="عدد الأساتذة"
          value={Teachers}
          icon={<FaChalkboardTeacher />}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
        />
        <CardStatictc
          text="عدد الأولياء"
          value={Parents}
          icon={<FaUsers />}
          gradient="bg-gradient-to-br from-sky-500 to-sky-700"
        />
        <CardStatictc
          text={`إجمالي الديون (${debt.count})`}
          value={`${Number(debt.totalDebt).toLocaleString()} دج`}
          icon={<FaMoneyBillWave />}
          gradient="bg-gradient-to-br from-rose-500 to-rose-700"
        />
      </div>

      {/* Chart */}
      <div className="mt-8 bg-white rounded-2xl shadow-md p-5">
        <h2 className="text-xl font-bold mb-4 text-gray-700">
          عدد التلاميذ المسجَّلين شهرياً
        </h2>
        <BarChart />
      </div>
    </div>
  );
}

export default Statistics;
