import {
  Autocomplete,
  AutocompleteItem,
  Button,
  getKeyValue,
  Input,
  Modal,
  ModalContent,
  Radio,
  RadioGroup,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import "jspdf-autotable";

import { useEffect, useState } from "react";
import { FaCheck, FaDownload, FaPrint, FaTimes } from "react-icons/fa";
import { IoAdd } from "react-icons/io5";
import { MdDelete, MdEdit } from "react-icons/md";
import { useLocation, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import * as Yup from "yup";
import {
  deleteGroup,
  getGroupById,
  reopenGroup,
  updateGroup,
  updateGroupStatus,
} from "../../apiCalls/GroupsCals";
import { addInstallment, getDebts } from "../../apiCalls/receiptCalls";
import { getSchedule } from "../../apiCalls/scheduleCalls";
import { deleteStudentFropmGroup } from "../../apiCalls/studentCalls";
import { getAllTeachers } from "../../apiCalls/teacherCalls";
import {
  addSessionToGroup,
  setSessionAttendance,
} from "../../apiCalls/sessionCalls";
import LineAddTime from "../../components/adminsCompnents/groups/LineAddTime";
import AttendanceList from "../../components/adminsCompnents/groups/AttendanceList";
import { font } from "../../assets/Cairo-VariableFont_slnt,wght-normal";

import pdfMake from "pdfmake/build/pdfmake";
import { format, formatDate } from "date-fns/format";

// Rest of your component code...
function Group() {
  const [group, setGroup] = useState({});
  const { groupParams } = useParams();
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(group.isCompleted);
  const [schedule, setSchedule] = useState([]);

  const [lines, setLines] = useState([]);
  const [student, setStudent] = useState([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("1");
  const [addGroup, setAddGroup] = useState(false);
  const [data, setData] = useState([]);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  // attendance matrix: { [sessionId]: Set(studentId) }
  const [attendance, setAttendance] = useState({});
  // payment-from-list state
  const [payStudent, setPayStudent] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [payDebts, setPayDebts] = useState([]);
  const [paying, setPaying] = useState(false);
  // Set of student IDs that currently owe money (have a remaining balance)
  const [debtStudentIds, setDebtStudentIds] = useState(new Set());
  // attendance-history table filters
  const [filterCycle, setFilterCycle] = useState("all");
  const [filterSession, setFilterSession] = useState("all");
  const [filterStudent, setFilterStudent] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const pathname = useLocation().pathname;

  // Load which students have an outstanding debt so we only show "دفع" for them
  const fetchDebtStudents = async () => {
    try {
      const res = await getDebts();
      const ids = new Set(
        (res?.data || [])
          .filter((d) => (parseFloat(d.remainingAmount) || 0) > 0)
          .map((d) => d.student?.id)
          .filter(Boolean)
      );
      setDebtStudentIds(ids);
    } catch (e) {
      setDebtStudentIds(new Set());
    }
  };

  // Build the attendance map whenever the group's sessions change
  useEffect(() => {
    if (group?.sessions) {
      const map = {};
      group.sessions.forEach((s) => {
        map[s.id] = new Set((s.students || []).map((st) => st.id));
      });
      setAttendance(map);
    }
  }, [group?.sessions]);

  const toggleAttendance = async (sessionId, studentId) => {
    const isPresent = attendance[sessionId]?.has(studentId);
    const next = !isPresent;

    // Ask for confirmation when marking a student ABSENT
    if (!next) {
      const result = await Swal.fire({
        title: "تأكيد الغياب",
        text: "هل أنت متأكد من تسجيل هذا التلميذ كغائب؟",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "نعم، غائب",
        cancelButtonText: "إلغاء",
        confirmButtonColor: "#dc2626",
      });
      if (!result.isConfirmed) return;
    }

    // optimistic update
    setAttendance((prev) => {
      const set = new Set(prev[sessionId] || []);
      if (next) set.add(studentId);
      else set.delete(studentId);
      return { ...prev, [sessionId]: set };
    });

    try {
      await setSessionAttendance(sessionId, studentId, next);
    } catch (e) {
      // revert on failure
      setAttendance((prev) => {
        const set = new Set(prev[sessionId] || []);
        if (next) set.delete(studentId);
        else set.add(studentId);
        return { ...prev, [sessionId]: set };
      });
      Swal.fire({ icon: "error", title: "خطأ", text: "فشل تحديث الحضور" });
    }
  };

  const handleAddSession = async () => {
    try {
      await addSessionToGroup(group.id, []); // create an empty session to fill in
      await fatchGroup();
    } catch (e) {
      Swal.fire({ icon: "error", title: "خطأ", text: "فشل إضافة الحصة" });
    }
  };

  // Reopen the finished course for the same students (adds them to the debt list)
  const handleReopenGroup = async () => {
    const result = await Swal.fire({
      title: "إعادة فتح الفوج؟",
      text: "سيُعاد فتح الفوج بنفس التلاميذ، وتُضاف مستحقاتهم إلى قائمة الديون.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "نعم، أعد الفتح",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#16a34a",
    });
    if (!result.isConfirmed) return;
    try {
      const res = await reopenGroup(group.id);
      setIsCompleted(false);
      await fatchGroup();
      fetchDebtStudents();
      Swal.fire({
        icon: "success",
        title: "تم إعادة فتح الفوج",
        text: `تمت إضافة ${res?.debtsCreated || 0} تلميذ إلى قائمة الديون`,
      });
    } catch (e) {
      Swal.fire({ icon: "error", title: "خطأ", text: "فشل إعادة فتح الفوج" });
    }
  };

  // Open the payment dialog for a student and load their outstanding debts.
  // Prefill the amount with the full outstanding so paying it clears the debt.
  const openPayModal = async (st) => {
    setPayStudent(st);
    setPayAmount("");
    setPayDebts([]);
    try {
      const res = await getDebts(st.id);
      const debts = res?.data || [];
      setPayDebts(debts);
      const out = debts.reduce(
        (sum, d) => sum + (parseFloat(d.remainingAmount) || 0),
        0
      );
      if (out > 0) setPayAmount(out.toFixed(2));
    } catch (e) {
      setPayDebts([]);
    }
  };

  const outstanding = payDebts.reduce(
    (sum, d) => sum + (parseFloat(d.remainingAmount) || 0),
    0
  );

  const handlePayFromList = async () => {
    let amount = parseFloat(payAmount);
    if (!amount || amount <= 0) {
      Swal.fire({ icon: "warning", title: "مبلغ غير صالح", text: "أدخل مبلغاً موجباً" });
      return;
    }

    const openDebts = payDebts
      .filter((d) => (parseFloat(d.remainingAmount) || 0) > 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // oldest first

    // No debt -> nothing to pay (the button shouldn't even be shown)
    if (openDebts.length === 0) {
      Swal.fire({ icon: "info", title: "لا يوجد دين", text: "هذا التلميذ ليس عليه دين" });
      setPayStudent(null);
      return;
    }

    // Never allow paying more than the outstanding debt
    if (amount > outstanding) {
      amount = outstanding;
    }

    setPaying(true);
    try {
      // Spread the (capped) payment across the student's open debts (oldest first)
      let remainingToApply = amount;
      for (const d of openDebts) {
        if (remainingToApply <= 0) break;
        const due = parseFloat(d.remainingAmount) || 0;
        const pay = Math.min(due, remainingToApply);
        await addInstallment(d.id, { amount: pay, method: "cash" });
        remainingToApply -= pay;
      }

      Swal.fire({
        icon: "success",
        title: "تم تسجيل الدفع",
        text: `المبلغ المسجّل: ${amount.toFixed(2)} دج`,
        timer: 1600,
        showConfirmButton: false,
      });
      setPayStudent(null);
      setPayAmount("");
      await fetchDebtStudents();
    } catch (e) {
      Swal.fire({ icon: "error", title: "خطأ", text: "فشل تسجيل الدفع" });
    } finally {
      setPaying(false);
    }
  };

  // Print the attendance list as an Arabic document.
  // If the current cycle has sessions, prints a matrix (students x sessions);
  // otherwise prints a clean student list with a blank attendance column.
  const handlePrintAttendance = () => {
    if (student.length === 0) {
      Swal.fire({
        icon: "error",
        title: "عذرا",
        text: "لا يوجد تلاميذ في هذا الفوج",
      });
      return;
    }

    const cycle = group?.currentCycle || 1;
    const sessions = [...(group?.sessions || [])]
      .filter((s) => (s.cycle || 1) === cycle)
      .sort((a, b) => a.sessionNumber - b.sessionNumber);
    const hasSessions = sessions.length > 0;
    const teacherName = group?.teachers?.slice(-1)[0]?.fullName || "";

    const headerCols = hasSessions
      ? sessions
          .map(
            (s) =>
              `<th>الحصة ${s.sessionNumber}<br/><span class="sub">${
                s.sessionDate || ""
              }${
                s.sessionTime ? " " + String(s.sessionTime).slice(0, 5) : ""
              }</span></th>`
          )
          .join("")
      : `<th>الحضور</th>`;

    const bodyRows = student
      .map((st, i) => {
        const cells = hasSessions
          ? sessions
              .map((s) => {
                const present = attendance[s.id]?.has(st.id);
                return `<td class="${present ? "p" : "a"}">${
                  present ? "✓" : "✗"
                }</td>`;
              })
              .join("")
          : `<td></td>`;
        return `<tr><td class="idx">${i + 1}</td><td class="name">${
          st.fullName
        }</td>${cells}</tr>`;
      })
      .join("");

    const totalsRow = hasSessions
      ? `<tr><td></td><td class="name">حاضر / المجموع</td>${sessions
          .map(
            (s) =>
              `<td class="tot">${attendance[s.id]?.size || 0} / ${
                student.length
              }</td>`
          )
          .join("")}</tr>`
      : "";

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8" />
        <title>قائمة الحضور والغياب</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
          * { font-family: 'Cairo', Arial, sans-serif; }
          body { padding: 16px; }
          h1 { text-align: center; margin: 0 0 4px; font-size: 22px; }
          .meta { text-align: center; color: #444; margin-bottom: 12px; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #555; padding: 6px; text-align: center; font-size: 12px; }
          th { background: #e5e7eb; }
          .sub { font-weight: normal; font-size: 9px; color: #555; }
          .name { text-align: right; font-weight: 600; }
          .idx { width: 28px; }
          .p { color: #16a34a; font-weight: bold; }
          .a { color: #dc2626; font-weight: bold; }
          .tot { background: #f3f4f6; font-weight: 700; }
          @page { size: A4 landscape; margin: 1cm; }
        </style>
      </head>
      <body>
        <h1>قائمة الحضور والغياب</h1>
        <div class="meta">
          الفوج: ${group?.name || ""} &nbsp;|&nbsp; الأستاذ: ${teacherName} &nbsp;|&nbsp;
          عدد التلاميذ: ${student.length} &nbsp;|&nbsp; التاريخ: ${new Date().toLocaleDateString()}
        </div>
        <table>
          <thead>
            <tr><th class="idx">#</th><th class="name">التلميذ</th>${headerCols}</tr>
          </thead>
          <tbody>
            ${bodyRows}
            ${totalsRow}
          </tbody>
        </table>
        <script>
          window.onload = function () {
            window.print();
            setTimeout(function () { window.close(); }, 100);
          };
        </script>
      </body>
      </html>`;

    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  };

  const handlePaymentMethodChange = (event) => {
    console.log(event.target.value);
    setSelectedPaymentMethod(event.target.value);
  };
  pdfMake.vfs = {
    ...pdfMake.vfs,
    "Cairo-Regular.ttf": font,
  };

  pdfMake.fonts = {
    Cairo: {
      normal: "Cairo-Regular.ttf",
      bold: "Cairo-Regular.ttf",
    },
  };
  const handelCancel = () => {
    setAddGroup(false);
  };
  const initialValues = group
    ? {
        groupName: group.name,
        // startDate: new Date(group.startDate), // Convert to Date object
        // endDate: new Date(group.endDate),
        studentCount: group.maxStudents,
        teacher:
          group?.Teachers?.length > 0
            ? parseInt(group?.Teachers?.slice(-1)[0]?.id)
            : "", // Fallback to an empty string if no teacher
        paymentMethod: group.paymentMethod === "session" ? "1" : "2",
        paymentPerSession: group.paymentMethod === "session" ? group.type : "",
        paymentPercentage:
          group.paymentMethod === "percentage" ? group.type : "",
        price: group.price,
        numberOfSessions: group.numberOfSessions,
        type: group.type,
      }
    : {
        groupName: "",
        // startDate: "",
        // endDate: "",
        studentCount: "",
        teacher: "",
        paymentMethod: "",
        paymentPerSession: "",
        paymentPercentage: "",
        price: "",
        numberOfSessions: "",
        type: "",
      };

  const validationSchema = Yup.object({
    groupName: Yup.string().required("اسم الفوج مطلوب"),

    studentCount: Yup.number()
      .required("عدد التلاميذ في الفوج مطلوب")
      .positive("يجب أن يكون رقماً إيجابياً"),
    teacher: Yup.number().required("ابحث عن استاذ مطلوب"),
    paymentMethod: Yup.string().required("اختر طريقة الدفع مطلوب"),
    paymentPerSession: Yup.number().when("paymentMethod", {
      is: "perSession",
      then: Yup.number()
        .required("سعر الحصة مطلوب")
        .positive("يجب أن يكون رقماً إيجابياً"),
    }),
    paymentPercentage: Yup.number().when("paymentMethod", {
      is: "percentage",
      then: Yup.number()
        .required("نسبة الدفع مطلوب")
        .min(0, "Minimum value is 0")
        .max(100, "Maximum value is 100"),
    }),
    price: Yup.number(),
    numberOfSessions: Yup.number().required("عدد الحصص مطلوب"),
  });

  // const transformValues = (values) => {
  //   console.log(values);

  //   return {
  //     ...values,
  //     id: group.id,
  //   };
  // };
  const transformValues = (values) => {
    const paymentMethod =
      values.paymentMethod == "1" ? "session" : "percentage";
    const type =
      values.paymentMethod !== "1"
        ? values.paymentPercentage
        : values.paymentPerSession;
    console.log(type);
    return {
      id: group.id,
      type: type,
      paymentMethod: paymentMethod,
      price: values.price,
      numberOfSessions: values.numberOfSessions,
      maxStudents: values.studentCount,
      teacher: values.teacher,
      name: values.groupName,
    };
  };
  // function formatDate(date) {
  //   if (!date || !date.year || !date.month || !date.day) return "";
  //   const year = date.year;
  //   const month = date.month.toString().padStart(2, "0"); // Ensure two-digit format
  //   const day = date.day.toString().padStart(2, "0"); // Ensure two-digit format
  //   return `${year}-${month}-${day}`;
  // }

  const fetchAllTeachers = async () => {
    try {
      const response = await getAllTeachers();
      console.log(response);

      if (response) {
        console.log(response);
        setData(() =>
          response.map((teacher) => ({
            id: teacher.id,
            label: teacher.fullName,
          }))
        );
      } else {
        console.log("Failed to fetch teachers");
      }
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
    }
  };
  const addLine = async () => {
    setLines([...lines, { id: null }]);
  };

  const removeLine = async (index) => {
    await Swal.fire({
      position: "center",
      icon: "success",
      title: "تم الحذف التوقيت بنجاح",
      showConfirmButton: false,
      timer: 1500,
    });
    setLines(lines.filter((_, i) => i !== index));
  };

  const handlePrint = () => {
    if (student.length === 0) {
      Swal.fire({
        icon: "error",
        title: "عذرا",
        text: "لا يوجد طلاب لطباعتهم",
      });
      return;
    }

    const convertTextToRtl = (text) => {
      return text.split(" ").reverse().join("  ");
    };

    const tableBody = [
      [
        { text: convertTextToRtl("تاريخ الميلاد"), style: "tableHeader" },
        { text: convertTextToRtl("اسم التلميذ"), style: "tableHeader" },
        { text: convertTextToRtl("رمز التلميذ"), style: "tableHeader" },
        { text: convertTextToRtl("رقم التلميذ"), style: "tableHeader" },
      ],
      ...student.map((item, index) => [
        { text: formatDate(item.birthDay, "yyyy-MM-dd"), style: "cell" },
        { text: convertTextToRtl(item.fullName), style: "cell" },
        { text: item.id.toString(), style: "cell" },
        { text: (index + 1).toString(), style: "cell" },
      ]),
    ];

    const docDefinition = {
      content: [
        { text: convertTextToRtl("قائمة الطلاب"), style: "header" },
        {
          text: convertTextToRtl(
            `الاستاذ  : ${group?.teachers?.slice(-1)[0]?.fullName}`
          ),
          style: {
            fontSize: 14,
            bold: true,
            alignment: "right",
            margin: [0, 0, 0, 20],
          },
        },
        {
          text: convertTextToRtl(`عدد الطلاب : ${group.maxStudents}`),
          style: {
            fontSize: 14,
            bold: true,
            alignment: "right",
            margin: [0, 0, 0, 20],
          },
        },
        {
          text: convertTextToRtl(
            `تاريخ البداية : ${formatDate(group.startDate, "yyyy-MM-dd")}`
          ),
          style: {
            fontSize: 14,
            bold: true,
            alignment: "right",
            margin: [0, 0, 0, 20],
          },
        },
        {
          text: convertTextToRtl(
            `تاريخ النهاية : ${formatDate(group.endDate, "yyyy-MM-dd")}`
          ),
          style: {
            fontSize: 14,
            bold: true,
            alignment: "right",
            margin: [0, 0, 0, 20],
          },
        },

        {
          table: {
            headerRows: 1,
            widths: ["*", "*", "*", "*"],
            body: tableBody,
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return rowIndex % 2 === 0 ? "#f3f3f3" : null;
            },
            hLineWidth: function (i, node) {
              return 1;
            },
            vLineWidth: function (i, node) {
              return 1;
            },
            hLineColor: function (i, node) {
              return "#ccc";
            },
            vLineColor: function (i, node) {
              return "#ccc";
            },
            paddingLeft: function (i, node) {
              return 8;
            },
            paddingRight: function (i, node) {
              return 8;
            },
            paddingTop: function (i, node) {
              return 4;
            },
            paddingBottom: function (i, node) {
              return 4;
            },
          },
        },
      ],
      styles: {
        header: {
          fontSize: 20,
          bold: true,
          alignment: "right",
          margin: [0, 0, 0, 20],
        },
        schedule: {
          fontSize: 14,
          bold: true,
          margin: [0, 0, 0, 10],
          alignment: "right",
        },
        tableHeader: {
          bold: true,
          fontSize: 14,
          color: "white",
          fillColor: "#4caf50",
          alignment: "right",
        },
        cell: {
          fontSize: 12,
          alignment: "right",
        },
      },
      defaultStyle: {
        font: "Cairo",
        alignment: "right",
      },
    };

    pdfMake.createPdf(docDefinition).open();
  };

  const fatchGroup = async () => {
    setLoading(true);

    const response = await getGroupById(groupParams);
    setGroup(response);
    setLines(response.schedules);
    setIsCompleted(response.isCompleted);
    console.log(response);
    setStudent(response.students);
    setLoading(false);
    response.schedules.map(async (item) => {
      const response = await getSchedule(item.id);
      setSchedule([...schedule, response]);
    });
  };

  useEffect(() => {
    fatchGroup();
    fetchAllTeachers();
    fetchDebtStudents();
  }, []);

  const deleteGroupApi = async () => {
    await Swal.fire({
      title: "هل انت متأكد من حذف الفوج؟",
      text: "لن تتمكن من استرجاع الفوج بعد الحذف",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "نعم, احذف الفوج",
      cancelButtonText: "الغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await deleteGroup(groupParams);
        console.log(response);

        await Swal.fire("تم الحذف!", "تم حذف الفوج بنجاح", "success");
        window.history.back();
      }
    });
  };

  const handleCompleted = async () => {
    try {
      const response = await updateGroupStatus(group.id, !group.isCompleted);
      console.log(response);
      if (response) {
        setIsCompleted(!isCompleted);
        await Swal.fire("تم الانتهاء!", "تم   بنجاح", "success");
      }
    } catch (error) {
      console.log(error);
      await Swal.fire("حدث خطأ!", "حدث خطأ ما", "error");
    }
  };
  const handleDowanload = () => {
    if (student.length === 0) {
      Swal.fire({
        icon: "error",

        title: "عذرا",
        text: "لا يوجد طلاب لتحميلهم",
      });
      return;
    }
    const ws = XLSX.utils.json_to_sheet(
      student.map((item, index) => ({
        "رقم التلميذ": index,
        "رمز التلميذ": item.id,
        "اسم التلميذ": item.fullName,
        "تاريخ الميلاد": formatDate(item.birthDay, "yyyy-MM-dd"),
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1" || "SheetJS");
    XLSX.writeFile(wb, `${group.name}.xlsx`);
  };
  const deleteStudentApi = async (index, id) => {
    try {
      Swal.fire({
        position: "center",
        icon: "success",
        title: "هل انت متأكد من حذف التلميذ؟",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "نعم, احذف التلميذ",
        cancelButtonText: "الغاء",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const response = await deleteStudentFropmGroup(id, group.id);
          if (response) {
            Swal.fire({
              position: "center",
              icon: "success",
              title: "تم الحذف بنجاح",
              showConfirmButton: false,
              timer: 1500,
            });
            setStudent(student.filter((_, i) => i !== index));
          } else {
            Swal.fire({
              position: "center",
              icon: "error",
              title: "حدث خطأ",
              showConfirmButton: false,
              timer: 1500,
            });
          }
        }
      });
    } catch (err) {
      console.error("Failed to delete student:", err);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "حدث خطأ",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };
  if (loading) {
    return (
      <div className="w-full h-full ">
        <Spinner className="mx-auto" />
      </div>
    );
  } else {
    return (
      <div>
        <div className="flex  max-md:flex-col justify-between items-center">
          <div className="text-3xl max-md:py-4 font-bold">
            الفوج {group?.name || "غير متوفر"}
          </div>
          <div className="flex  max-md:flex-col gap-3">
            <Button onClick={onOpen} color="default" startContent={<MdEdit />}>
              تعديل الفوج
            </Button>
            <Button
              onClick={deleteGroupApi}
              color="danger"
              startContent={<MdDelete />}
            >
              حذف الفوج
            </Button>
            <Button
              // onClick={handlePrint}
              onClick={handlePrint}
              color="primary"
              startContent={<FaPrint />}
            >
              طباعة الفوج
            </Button>
            <Button
              // onClick={handlePrint}
              onClick={handleDowanload}
              color="secondary"
              startContent={<FaDownload />}
            >
              تحميل القائمة
            </Button>
            <Button
              className="text-white"
              color={!isCompleted ? "success" : "default"} // Adjust color based on status
              variant="solid"
              onClick={handleCompleted}
              startContent={!isCompleted ? <FaCheck /> : <FaTimes />} // Change icon based on status
            >
              {isCompleted ? "تم الانتهاء من الفوج" : "اضغط للإنهاء الفوج"}
            </Button>
            {isCompleted && (
              <Button
                className="text-white"
                color="warning"
                variant="solid"
                onClick={handleReopenGroup}
                startContent={<IoAdd />}
              >
                إعادة فتح بنفس التلاميذ (ديون)
              </Button>
            )}
          </div>
        </div>
        <div className="text-xl">
          <div>
            اسم الاستاذ:{" "}
            <span>
              {group?.teachers?.slice(-1)[0]?.fullName || "غير متوفر"}
            </span>
          </div>
          <div>
            عدد الطلاب: <span>{group?.maxStudents || "غير متوفر"}</span>
          </div>
        </div>
        <div className="text-xl py-3 font-bold">
          <div>توقيت الدورة:</div>
          <div>
            من {group?.startDate.toString().split("T")[0]} الى{" "}
            {group?.endDate.toString().split("T")[0]}
          </div>
          <div className="w-full py-3 ">
            {!Array.isArray(lines?.schedules) &&
            !group?.schedules?.length === 0 ? (
              <div className="text-center text-xl text-gray-500">
                حاليا لا يوجد توقيت
              </div>
            ) : (
              Array.isArray(lines) &&
              lines
                ?.reverse()
                .map((line, index) => (
                  <LineAddTime
                    groupID={group.id}
                    id={line.id}
                    key={line.id}
                    index={index}
                    onRemove={removeLine}
                    startDate={group.startDate}
                    endDate={group.endDate}
                    fatchGroup={fatchGroup}
                    setGroup={setGroup}
                    group={group}
                    lines={lines}
                    setLines={setLines}
                  />
                ))
            )}
          </div>
          <Button color="primary" startContent={<IoAdd />} onClick={addLine}>
            اضافة توقيت
          </Button>
        </div>
        <div className="flex my-10  justify-between w-full items-center">
          <div
            className="
      font-bold
      text-3xl
      text-right
      "
          >
            قائمة الطلاب
          </div>
        </div>
        {student.length === 0 ? (
          <div className="text-center text-2xl font-bold text-red-500">
            لا يوجد طلاب في هذا الفوج
          </div>
        ) : (
          <Table isHeaderSticky>
            <TableHeader>
              <TableColumn key="index">رقم التلميذ</TableColumn>
              <TableColumn key="id">رمز التلميذ</TableColumn>
              <TableColumn key="fullName">اسم التلميذ</TableColumn>
              <TableColumn key="birthDay">تاريخ الميلاد</TableColumn>
              <TableColumn key="action">العمليات</TableColumn>
            </TableHeader>
            <TableBody items={student}>
              {(item) => (
                <TableRow
                  className="
          hover:bg-gray-100
          border-b-2
          border-gray-200
          transition-all
          duration-200
          ease-in-out
          h-4
          cursor-pointer
        "
                  key={item.id}
                >
                  {(columnKey) => (
                    <TableCell className="text-right h-7">
                      {columnKey === "index" &&
                        parseInt(student.indexOf(item)) + 1}
                      {columnKey === "action" ? (
                        <div className="flex gap-2">
                          {debtStudentIds.has(item.id) && (
                            <Button
                              color="success"
                              className="text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                openPayModal(item);
                              }}
                            >
                              دفع
                            </Button>
                          )}
                          <Button
                            color="danger"
                            startContent={<MdDelete />}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteStudentApi(student.indexOf(item), item.id);
                            }}
                          >
                            {" "}
                            <div className="max-md:hidden">
                              حذف التلميذ من القائمة{" "}
                            </div>
                          </Button>
                        </div>
                      ) : columnKey === "birthDay" ? (
                        format(new Date(item[columnKey]), "yyyy-MM-dd")
                      ) : (
                        // getKeyValue(index, columnKey)
                        getKeyValue(item, columnKey)
                      )}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {/* Sessions & attendance matrix (check present / absent) */}
        <div className="my-10" dir="rtl">
          <div className="flex justify-between items-center mb-4">
            <div className="font-bold text-3xl text-right">الحضور والغياب</div>
            <div className="flex gap-2">
              <Button color="primary" startContent={<IoAdd />} onClick={handleAddSession}>
                إضافة حصة
              </Button>
              <Button
                color="warning"
                className="text-white"
                startContent={<FaDownload />}
                onClick={() => setIsAttendanceOpen(true)}
              >
                تصدير القائمة
              </Button>
              <Button
                color="success"
                className="text-white"
                startContent={<FaPrint />}
                onClick={handlePrintAttendance}
              >
                طباعة القائمة
              </Button>
            </div>
          </div>

          {student.length === 0 ? (
            <div className="text-center text-lg text-gray-500">
              لا يوجد طلاب في هذا الفوج
            </div>
          ) : (
            (() => {
              const existing = [...group.sessions]
                .filter((s) => (s.cycle || 1) === (group.currentCycle || 1))
                .sort((a, b) => a.sessionNumber - b.sessionNumber);
              const planned = parseInt(group?.numberOfSessions) || 0;
              const totalCols = Math.max(planned, existing.length);
              // Every planned slot; null means "not recorded yet"
              const columns = Array.from(
                { length: totalCols },
                (_, i) => existing[i] || null
              );

              if (totalCols === 0) {
                return (
                  <div className="text-center text-lg text-gray-500">
                    حدّد عدد الحصص للفوج أولاً
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto">
                  <table className="border-collapse border-2 border-gray-400 text-center text-sm">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border border-gray-400 p-2 sticky right-0 bg-gray-200 min-w-[160px]">
                          التلميذ
                        </th>
                        {columns.map((s, i) => (
                          <th
                            key={`col-${i}`}
                            className={`border border-gray-400 p-2 min-w-[90px] ${
                              s ? "" : "bg-gray-100"
                            }`}
                          >
                            <div>الحصة {i + 1}</div>
                            {s ? (
                              <>
                                <div className="text-[10px] font-normal text-gray-600">
                                  {s.sessionDate || ""}
                                </div>
                                <div className="text-[10px] font-normal text-gray-600">
                                  {s.sessionTime
                                    ? String(s.sessionTime).slice(0, 5)
                                    : ""}
                                </div>
                              </>
                            ) : (
                              <div className="text-[10px] font-normal text-gray-400">
                                لم تُسجّل
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {student.map((st) => (
                        <tr key={st.id} className="hover:bg-gray-50">
                          <td className="border border-gray-400 p-2 text-right font-semibold sticky right-0 bg-white">
                            {st.fullName}
                          </td>
                          {columns.map((s, i) => {
                            if (!s) {
                              return (
                                <td
                                  key={`empty-${i}-${st.id}`}
                                  className="border border-gray-400 p-2 bg-gray-50 text-gray-300"
                                  title="لم تُسجّل هذه الحصة بعد"
                                >
                                  —
                                </td>
                              );
                            }
                            const present = attendance[s.id]?.has(st.id);
                            return (
                              <td
                                key={`${s.id}-${st.id}`}
                                className={`border border-gray-400 p-2 cursor-pointer select-none ${
                                  present ? "bg-green-50" : "bg-red-50"
                                }`}
                                onClick={() => toggleAttendance(s.id, st.id)}
                                title={present ? "حاضر" : "غائب"}
                              >
                                {present ? (
                                  <span className="text-green-600 font-bold">✓</span>
                                ) : (
                                  <span className="text-red-400 font-bold">✗</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      {/* Totals row */}
                      <tr className="bg-gray-100 font-semibold">
                        <td className="border border-gray-400 p-2 text-right sticky right-0 bg-gray-100">
                          حاضر / المجموع
                        </td>
                        {columns.map((s, i) => (
                          <td
                            key={`total-${i}`}
                            className="border border-gray-400 p-2"
                          >
                            {s ? (
                              `${attendance[s.id]?.size || 0} / ${student.length}`
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                  <p className="text-xs text-gray-500 mt-2">
                    اضغط على الخانة لتبديل الحضور (✓) / الغياب (✗). الحصص "لم
                    تُسجّل" تظهر للمعاينة، وتصبح قابلة للتعليم بعد إضافتها بزر
                    "إضافة حصة".
                  </p>
                </div>
              );
            })()
          )}
        </div>

        {/* Full attendance history (filterable table) */}
        {(group?.sessions || []).length > 0 && student.length > 0 && (
          <div className="my-10" dir="rtl">
            <div className="font-bold text-2xl text-right mb-4">
              سجل الحضور الكامل
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
              <select
                value={filterCycle}
                onChange={(e) => setFilterCycle(e.target.value)}
                className="border rounded-lg p-2 bg-white"
              >
                <option value="all">كل الدورات</option>
                {[...new Set(group.sessions.map((s) => s.cycle || 1))]
                  .sort((a, b) => a - b)
                  .map((c) => (
                    <option key={c} value={c}>
                      الدورة {c}
                    </option>
                  ))}
              </select>
              <select
                value={filterSession}
                onChange={(e) => setFilterSession(e.target.value)}
                className="border rounded-lg p-2 bg-white"
              >
                <option value="all">كل الحصص</option>
                {[...new Set(group.sessions.map((s) => s.sessionNumber))]
                  .sort((a, b) => a - b)
                  .map((n) => (
                    <option key={n} value={n}>
                      الحصة {n}
                    </option>
                  ))}
              </select>
              <select
                value={filterStudent}
                onChange={(e) => setFilterStudent(e.target.value)}
                className="border rounded-lg p-2 bg-white"
              >
                <option value="all">كل التلاميذ</option>
                {student.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.fullName}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border rounded-lg p-2 bg-white"
              >
                <option value="all">الكل</option>
                <option value="present">حاضر</option>
                <option value="absent">غائب</option>
              </select>
            </div>

            {(() => {
              const rows = [];
              group.sessions.forEach((s) => {
                const presentIds = new Set(
                  (s.students || []).map((x) => x.id)
                );
                student.forEach((st) => {
                  rows.push({
                    cycle: s.cycle || 1,
                    num: s.sessionNumber,
                    date: s.sessionDate || "",
                    time: s.sessionTime
                      ? String(s.sessionTime).slice(0, 5)
                      : "",
                    sid: st.id,
                    name: st.fullName,
                    present: presentIds.has(st.id),
                  });
                });
              });

              const filtered = rows
                .filter(
                  (r) =>
                    (filterCycle === "all" ||
                      String(r.cycle) === String(filterCycle)) &&
                    (filterSession === "all" ||
                      String(r.num) === String(filterSession)) &&
                    (filterStudent === "all" ||
                      String(r.sid) === String(filterStudent)) &&
                    (filterStatus === "all" ||
                      (filterStatus === "present" ? r.present : !r.present))
                )
                .sort(
                  (a, b) =>
                    a.cycle - b.cycle ||
                    a.num - b.num ||
                    a.name.localeCompare(b.name)
                );

              return (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-400 text-center text-sm">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border border-gray-400 p-2">الدورة</th>
                        <th className="border border-gray-400 p-2">الحصة</th>
                        <th className="border border-gray-400 p-2">التاريخ</th>
                        <th className="border border-gray-400 p-2">الوقت</th>
                        <th className="border border-gray-400 p-2">التلميذ</th>
                        <th className="border border-gray-400 p-2">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-4 text-gray-500">
                            لا توجد نتائج
                          </td>
                        </tr>
                      ) : (
                        filtered.map((r, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="border border-gray-400 p-2">
                              {r.cycle}
                            </td>
                            <td className="border border-gray-400 p-2">
                              {r.num}
                            </td>
                            <td className="border border-gray-400 p-2">
                              {r.date}
                            </td>
                            <td className="border border-gray-400 p-2">
                              {r.time}
                            </td>
                            <td className="border border-gray-400 p-2 text-right">
                              {r.name}
                            </td>
                            <td
                              className={`border border-gray-400 p-2 font-bold ${
                                r.present ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {r.present ? "حاضر" : "غائب"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  <p className="text-xs text-gray-500 mt-2">
                    عدد النتائج: {filtered.length}
                  </p>
                </div>
              );
            })()}
          </div>
        )}

        {/* Pay from the course list */}
        <Modal
          isOpen={Boolean(payStudent)}
          onClose={() => setPayStudent(null)}
        >
          <ModalContent>
            <div className="p-6 flex flex-col gap-4" dir="rtl">
              <h3 className="text-xl font-bold">
                تسجيل دفع {payStudent ? `- ${payStudent.fullName}` : ""}
              </h3>
              <div className="text-sm">
                <p>
                  إجمالي الدين المستحق:{" "}
                  <strong className="text-red-600">
                    {outstanding.toFixed(2)} دج
                  </strong>
                </p>
              </div>
              <Input
                type="number"
                min={0}
                max={outstanding}
                label="المبلغ المدفوع الآن"
                value={payAmount}
                onValueChange={(v) => {
                  // Never let the entered amount exceed the outstanding debt
                  const n = parseFloat(v);
                  if (!isNaN(n) && n > outstanding) {
                    setPayAmount(outstanding.toFixed(2));
                  } else {
                    setPayAmount(v);
                  }
                }}
              />
              <p className="text-xs text-gray-500">
                لا يمكن دفع أكثر من الدين المستحق. سيُخصم المبلغ من دين التلميذ.
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  color="danger"
                  variant="light"
                  onClick={() => setPayStudent(null)}
                >
                  إلغاء
                </Button>
                <Button color="primary" isLoading={paying} onClick={handlePayFromList}>
                  تسجيل الدفع
                </Button>
              </div>
            </div>
          </ModalContent>
        </Modal>

        {/* Attendance list (printable + Excel/Word export) */}
        <Modal
          isOpen={isAttendanceOpen}
          onClose={() => setIsAttendanceOpen(false)}
          size="5xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            <div className="p-4">
              <AttendanceList
                groupData={{
                  name: group?.name,
                  teacher: group?.teachers?.slice(-1)[0]?.fullName || "",
                  subject: group?.name,
                  startTime: "",
                  endTime: "",
                  room: group?.location || "",
                }}
                students={student}
                date={new Date()}
              />
            </div>
          </ModalContent>
        </Modal>

        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          scrollBehavior="inside"
        >
          <ModalContent className="w-full">
            {(onClose) => (
              <div className="w-full max-md:w-full h-fit md:px-12  md:py-2    bg-gray-200 rounded-3xl flex flex-col p-4">
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={async (values, { resetForm }) => {
                    // Handle form submission
                    const transformedValues = transformValues(values);
                    const response = await updateGroup(transformedValues);
                    if (response) {
                      fatchGroup();
                      Swal.fire({
                        icon: "success",
                        title: "تمت العملية بنجاح",
                        showConfirmButton: false,
                        timer: 1500,
                      });
                    } else {
                      console.log("Failed to add group  " + response);
                      Swal.fire({
                        icon: "error",
                        title: "حدث خطأ ما",
                        showConfirmButton: false,
                        timer: 1500,
                      });
                    }
                    // Reset form after submission if needed
                    // resetForm();
                    onClose();
                    // setAddGroup(false);
                  }}
                >
                  {({
                    handleChange,
                    handleBlur,
                    values,
                    setFieldValue,
                    handleSubmit,
                  }) => (
                    <Form
                      className="flex flex-col gap-4"
                      onSubmit={handleSubmit}
                    >
                      <div className="text-center text-gray-800 text-3xl font-semibold leading-10">
                        إضافة فوج
                      </div>

                      <Field
                        className="w-full"
                        name="groupName"
                        type="text"
                        as={Input}
                        label="اسم الفوج"
                        aria-label=" اسم الفوج"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.groupName}
                      />
                      <ErrorMessage
                        name="groupName"
                        component="div"
                        className="text-red-500"
                      />
                      {/* <div className="flex gap-4 justify-between items-center w-full">
                        <div className="w-fit">
                          <Field name="startDate">
                            {({ field, form: { setFieldValue } }) => (
                              <DatePicker
                                label="تاريخ البدأ"
                                aria-label="تاريخ البدأ"
                                // Convert field.value to a Date object or null
                                selected={
                                  field.value ? new Date(field.value) : null
                                }
                                onChange={(date) =>
                                  setFieldValue("startDate", date)
                                }
                                dateFormat="yyyy-MM-dd"
                              />
                            )}
                          </Field>
                          <ErrorMessage
                            name="startDate"
                            component="div"
                            className="text-red-500"
                          />
                        </div>
                        <div className="w-full">
                          <Field name="endDate">
                            {({ field }) => (
                              <DatePicker
                                label="تاريخ الانتهاء"
                                aria-label="تاريخ الانتهاء"
                                selected={field.value}
                                onChange={(date) =>
                                  setFieldValue("endDate", date)
                                }
                              />
                            )}
                          </Field>
                          <ErrorMessage
                            name="endDate"
                            component="div"
                            className="text-red-500"
                          />
                        </div>
                      </div> */}

                      <div className="flex w-full  gap-4 justify-between items-center w-full">
                        <div className="w-full">
                          <Field
                            name="studentCount"
                            as={Input}
                            type="number"
                            label="عدد التلاميذ في الفوج"
                            aria-label="عدد التلاميذ في الفوج"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.studentCount}
                          />
                          <ErrorMessage
                            name="studentCount"
                            component="div"
                            className="text-red-500"
                          />
                        </div>
                        <div className="w-full">
                          <Field
                            name="numberOfSessions"
                            as={Input}
                            type="number"
                            label="   عدد الحصص"
                            aria-label="عدد الحصص"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.numberOfSessions}
                          />
                          <ErrorMessage
                            name="numberOfSessions"
                            component="div"
                            className="text-red-500"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 justify-between items-center w-full">
                        <Field
                          className="w-full"
                          name="price"
                          as={Input}
                          type="Price"
                          label=" السعر  التلميذ"
                          aria-label=" السعر الاجمالي للحصة"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.price}
                          endContent={
                            <div className="pointer-events-none flex items-center">
                              <span className="text-default-400 text-small">
                                DZD
                              </span>
                            </div>
                          }
                        />
                        <ErrorMessage
                          name="price"
                          component="div"
                          className="text-red-500"
                        />
                        <Field name="teacher">
                          {({ field }) => (
                            <Autocomplete
                              size="sm"
                              label={
                                data?.find((item) => item.id === field.value)
                                  ?.label
                              }
                              aria-label="ابحث عن استاذ"
                              defaultItems={data}
                              className="max-w-xs"
                              selectedKey={field.value}
                              onSelectionChange={(item) =>
                                setFieldValue("teacher", item.id)
                              }
                            >
                              {(item) => (
                                <AutocompleteItem
                                  key={item.id}
                                  onClick={() => {
                                    setFieldValue("teacher", item.id);
                                  }}
                                >
                                  {item.label}
                                </AutocompleteItem>
                              )}
                            </Autocomplete>
                          )}
                        </Field>

                        <ErrorMessage
                          name="teacher"
                          component="div"
                          className="text-red-500"
                        />
                      </div>
                      <div className="flex gap-4 justify-between items-center w-full">
                        <RadioGroup
                          className="flex w-full gap-4"
                          label="اختر طريقة الدفع"
                          as={RadioGroup}
                          name="paymentMethod"
                          value={values.paymentMethod}
                          onChange={(e) => {
                            handleChange(e);
                          }}
                          onBlur={handleBlur}
                        >
                          <div className="flex gap-2">
                            <Field
                              type="radio"
                              name="paymentMethod"
                              value="1"
                              as={Radio}
                              defaultChecked={values.paymentMethod}
                              onChange={(e) => {
                                handleChange(e);
                                handlePaymentMethodChange(e);
                              }}
                              className="cursor-pointer rounded-lg p-2 border-2 border-transparent"
                            >
                              دفع بالحصة
                            </Field>
                            <Field
                              type="radio"
                              name="paymentMethod"
                              value="2"
                              onChange={(e) => {
                                handleChange(e);
                                handlePaymentMethodChange(e);
                              }}
                              defaultChecked={values.paymentMethod}
                              as={Radio}
                              className="cursor-pointer rounded-lg p-2 border-2 border-transparent"
                            >
                              دفع بالنسبة
                            </Field>
                          </div>
                        </RadioGroup>
                        <ErrorMessage
                          name="paymentMethod"
                          component="div"
                          className="text-red-500"
                        />

                        {values.paymentMethod === "1" && (
                          <Field
                            className="w-full"
                            name="paymentPerSession"
                            as={Input}
                            type="Price"
                            label="سعر الحصة"
                            aria-label="سعر الحصة"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            defaultValue={values.paymentPerSession}
                            endContent={
                              <div className="pointer-events-none flex items-center">
                                <span className="text-default-400 text-small">
                                  DZD
                                </span>
                              </div>
                            }
                          />
                        )}
                        {values.paymentMethod === "2" && (
                          <Field
                            className="w-full"
                            name="paymentPercentage"
                            as={Input}
                            type="number"
                            label="نسبة الدفع"
                            aria-label="نسبة الدفع"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            defaultValue={values.paymentPercentage}
                            // value={values.price}
                            min={0}
                            max={100}
                            endContent={
                              <div className="pointer-events-none flex items-center">
                                <span className="text-default-600 text-xl font-bold">
                                  %
                                </span>
                              </div>
                            }
                          />
                        )}
                      </div>

                      <div className="flex w-full gap-2 justify-between items-center">
                        <Button
                          type="submit"
                          className="w-full text-center text-white text-base font-semibold bg-indigo-500 rounded-2xl px-8 py-2"
                        >
                          اضافة
                        </Button>
                        <Button
                          type="button"
                          onClick={handelCancel}
                          onPress={onClose}
                          className="w-full text-center text-white text-base font-semibold bg-red-600 rounded-2xl px-8 py-2"
                        >
                          الغاء
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            )}
          </ModalContent>
        </Modal>{" "}
      </div>
    );
  }
}

export default Group;
