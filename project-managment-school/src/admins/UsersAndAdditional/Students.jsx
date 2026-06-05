import {
  Button,
  Modal,
  ModalContent,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
  useDisclosure,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import * as Yup from "yup";

import {
  Autocomplete,
  AutocompleteItem,
  DatePicker,
  Input,
  Radio,
  RadioGroup,
} from "@nextui-org/react"; // Adjust imports based on your setup
import { ErrorMessage, Field, Formik } from "formik";
import "jspdf-autotable";

import { format } from "date-fns/format";
import { FaSearch } from "react-icons/fa";
import { IoIosAddCircle } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { Form, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getCourses } from "../../apiCalls/coursesCalls";
import { getGroups } from "../../apiCalls/GroupsCals";
import { getAllLanguages } from "../../apiCalls/languagesCalls";
import { createReceipt } from "../../apiCalls/receiptCalls";
import { getRegistrationPrice } from "../../apiCalls/classControlCalls";
import {
  addStudent,
  addStudentToGroup,
  deleteStudent,
  getAllStudent,
  searchStudentApi,
} from "../../apiCalls/studentCalls";
import Education from "../../utils/Education";

function Students() {
  const nav = useNavigate();
  const [list, setList] = useState([]);
  const pathname = useLocation().pathname;
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [data, setData] = useState([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [student, setStudent] = useState([]);
  const [searchStudent, setSearchStudent] = useState("");
  const [languages, setLanguages] = useState([]);
  const [courses, setCourses] = useState([]);
  const [atwar, setAtwar] = useState([]);
  const [group, setGroup] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("");
  const theLevelsData = Education;
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selcetYear, setSelcetYear] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  // An already-registered student picked from the search (skip re-registering)
  const [existingStudent, setExistingStudent] = useState(null);
  // Courses chosen for this registration: [{ groupId, groupName, price }]
  const [selectedCourses, setSelectedCourses] = useState([]);
  // Pricing info for the currently selected group (remaining-sessions price)
  const [priceInfo, setPriceInfo] = useState(null);
  const level = [
    {
      id: 1,
      name: "pre A1",
    },
    {
      id: 2,
      name: "A1",
    },
    {
      id: 3,
      name: "A2",
    },
    {
      id: 4,
      name: "B1",
    },
    {
      id: 5,
      name: "B2",
    },
    {
      id: 6,
      name: "C1",
    },
    {
      id: 7,
      name: "C2",
    },
  ];
  const fetchStudents = async () => {
    setLoadingGroups(true);
    try {
      const newList = await getAllStudent();
      console.log(newList);
      // Check if newList has students property or is an array
      if (newList && newList.students) {
        setStudent(Array.isArray(newList.students) ? newList.students : []);
      } else if (Array.isArray(newList)) {
        setStudent(newList);
      } else {
        setStudent([]);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
      setStudent([]);
    }
    setLoadingGroups(false);
  };
  // function formatDate(date) {
  //   if (!date || !date.year || !date.month || !date.day) return "";
  //   const year = date.year;
  //   const month = date.month.toString().padStart(2, "0"); // Ensure two-digit format
  //   const day = date.day.toString().padStart(2, "0"); // Ensure two-digit format
  //   return `${year}-${month}-${day}`;
  // }
  // Initialize jsPDF fonts once at component mount
  useEffect(() => {
    // Font setup is handled by jsPDF
  }, []);
  
  const fetchLanguages = async () => {
    const newList = await getAllLanguages();
    setLanguages(newList);
    console.log(newList);
  };

  const fetchCourses = async () => {
    const newList = await getCourses();
    setCourses(newList);
    console.log(newList);
  };

  useEffect(() => {
    fetchStudents();
    fetchLanguages();
    fetchCourses();
  }, []);

  const initialValues = {
    studentName: "",
    birthDay: new Date(),
    ClassChoose: "",
    levels: "",
    group: {},
    theYear: "",
    theModule: "",
  };
  // Only the name is validated by Formik; courses / birthday are checked
  // manually in onSubmit so the multi-course + existing-student flow stays flexible.
  const validationSchema = Yup.object().shape({
    studentName: Yup.string().required("اسم التلميذ مطلوب"),
  });
  const deleteStudentApi = async (index, id) => {
    try {
      // Confirm deletion with the user using a more compact configuration
      const { isConfirmed } = await Swal.fire({
        title: "هل أنت متأكد؟",
        text: "هل تريد حقًا حذف هذا التلميذ؟",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "نعم",
        cancelButtonText: "إلغاء",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            await deleteStudent(id);
            setStudent((prev) => prev.filter((_, i) => i !== index));

            fetchStudents();
          } catch (error) {
            Swal.showValidationMessage(`حدث خطأ: ${error}`);
            return false;
          }
        },
        allowOutsideClick: () => !Swal.isLoading(),
      });

      if (isConfirmed) {
        // Show success toast instead of a full modal
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "تم حذف التلميذ بنجاح",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error("Failed to delete student:", err);
      // Show error toast instead of a full modal
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "حدث خطأ ما",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const fetchStudentsByPage = async (page) => {
    const response = await getAllStudent(page);
    setStudent(response);
  };
  const handleSearch = async () => {
    if (searchStudent === "") {
      return fetchStudents();
    }
    try {
      const newList = await searchStudentApi(searchStudent);
      // Check if newList is an array or has data property
      if (Array.isArray(newList)) {
        setStudent(newList);
      } else if (newList && newList.students) {
        setStudent(Array.isArray(newList.students) ? newList.students : []);
      } else if (newList && newList.data) {
        setStudent(Array.isArray(newList.data) ? newList.data : []);
      } else {
        setStudent([]);
      }
    } catch (error) {
      console.error("Failed to search students:", error);
      setStudent([]);
    }
  };
  const handlePrint = (student, payInfo = {}) => {
    console.log("Print student data:", student);
    console.log("Available groups:", group);
    const total = parseFloat(student.price) || 0;
    const paidAmount =
      payInfo.paidAmount === undefined ? total : Number(payInfo.paidAmount) || 0;
    const remainingAmount =
      payInfo.remaining === undefined
        ? Math.max(total - paidAmount, 0)
        : Number(payInfo.remaining) || 0;

    if (!student || !student.fullName) {
      Swal.fire({
        icon: "error",
        title: "عذرا",
        text: "لا يوجد معلومات لطباعة وصل الدفع",
      });
      return;
    }

    try {
      const groupObj = group.find((item) => item.id === student.groupId);
      // Prefer an explicit label (combined course names) when provided
      const groupLabel = student.groupName || groupObj?.name || "غير محدد";

      // Generate receipt number
      const receiptNumber = `${new Date().getFullYear()}-${String(
        new Date().getMonth() + 1
      ).padStart(2, "0")}-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`;

      // Format date in Arabic
      const currentDate = new Date();
      const dateArabic = currentDate.toLocaleDateString("ar-DZ", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Create print window with HTML content
      const printWindow = window.open("", "_blank");
      
      const htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>وصل تسجيل</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Cairo', Arial, sans-serif;
              direction: rtl;
              text-align: right;
              background: white;
              padding: 20px;
            }
            
            .receipt {
              max-width: 80mm;
              margin: 0 auto;
              padding: 15px;
              background: white;
            }
            
            .logo {
              text-align: center;
              font-size: 36px;
              margin-bottom: 8px;
            }
            
            .school-name {
              text-align: center;
              font-size: 20px;
              font-weight: 700;
              color: #1a56db;
              margin-bottom: 5px;
            }
            
            .school-name-en {
              text-align: center;
              font-size: 11px;
              color: #666;
              margin-bottom: 12px;
              font-family: Arial, sans-serif;
              direction: ltr;
            }
            
            .divider {
              border-top: 2px solid #000;
              margin: 10px 0;
            }
            
            .divider-dashed {
              border-top: 1px dashed #999;
              margin: 8px 0;
            }
            
            .header-title {
              text-align: center;
              font-size: 18px;
              font-weight: 700;
              text-decoration: underline;
              margin: 10px 0;
            }
            
            .receipt-info {
              display: flex;
              justify-content: space-between;
              margin: 10px 0;
              font-size: 10px;
              color: #333;
            }
            
            .receipt-info-item {
              flex: 1;
            }
            
            .info-label {
              font-size: 9px;
              color: #666;
              font-weight: 700;
              margin-bottom: 3px;
            }
            
            .info-value {
              font-size: 10px;
              color: #333;
            }
            
            .details-table {
              width: 100%;
              margin: 10px 0;
            }
            
            .details-row {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
              border-bottom: 1px solid #eee;
            }
            
            .details-label {
              font-weight: 700;
              font-size: 12px;
              color: #333;
              min-width: 100px;
            }
            
            .details-value {
              font-size: 12px;
              color: #000;
              flex: 1;
              text-align: left;
            }
            
            .amount-box {
              background: #f0f7ff;
              border: 2px solid #1a56db;
              border-radius: 5px;
              padding: 12px;
              margin: 15px 0;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            
            .amount-label {
              font-size: 14px;
              font-weight: 700;
              color: #1a56db;
            }
            
            .amount-value {
              font-size: 16px;
              font-weight: 700;
              color: #1a56db;
            }
            
            .thank-you {
              text-align: center;
              font-size: 13px;
              font-weight: 700;
              color: #16a34a;
              margin: 15px 0 5px 0;
            }
            
            .thank-you-en {
              text-align: center;
              font-size: 10px;
              color: #666;
              font-style: italic;
              margin-bottom: 12px;
              font-family: Arial, sans-serif;
              direction: ltr;
            }
            
            .contact {
              text-align: center;
              font-size: 9px;
              color: #666;
              margin-top: 10px;
            }
            
            @media print {
              body {
                padding: 0;
              }
              
              .receipt {
                max-width: 100%;
                padding: 10px;
              }
              
              @page {
                size: 80mm auto;
                margin: 5mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <!-- Logo -->
            <div class="logo">🎓</div>
            
            <!-- School Name -->
            <div class="school-name">مدرسة التطوير</div>
            <div class="school-name-en">School of Development</div>
            
            <!-- Divider -->
            <div class="divider"></div>
            
            <!-- Receipt Title -->
            <div class="header-title">وصل تسجيل</div>
            
            <!-- Receipt Number and Date -->
            <div class="receipt-info">
              <div class="receipt-info-item">
                <div class="info-label">رقم الوصل</div>
                <div class="info-value">${receiptNumber}</div>
              </div>
              <div class="receipt-info-item" style="text-align: left;">
                <div class="info-label" style="text-align: left;">التاريخ</div>
                <div class="info-value" style="text-align: left;">${dateArabic}</div>
              </div>
            </div>
            
            <!-- Dashed Divider -->
            <div class="divider-dashed"></div>
            
            <!-- Student Details -->
            <div class="details-table">
              <div class="details-row">
                <div class="details-label">اسم التلميذ</div>
                <div class="details-value">${student.fullName || ""}</div>
              </div>
              <div class="details-row">
                <div class="details-label">تاريخ الميلاد</div>
                <div class="details-value">${student.birthDay || "غير محدد"}</div>
              </div>
              <div class="details-row">
                <div class="details-label">الفوج</div>
                <div class="details-value">${groupLabel}</div>
              </div>
            </div>
            
            <!-- Dashed Divider -->
            <div class="divider-dashed"></div>
            
            <!-- Amount Box -->
            <div class="amount-box" style="flex-direction:column;align-items:stretch;gap:6px;">
              <div style="display:flex;justify-content:space-between;">
                <div class="amount-label">المبلغ الإجمالي</div>
                <div class="amount-value">${total} دج</div>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <div class="amount-label" style="color:#16a34a;">المدفوع</div>
                <div class="amount-value" style="color:#16a34a;">${paidAmount} دج</div>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <div class="amount-label" style="color:${
                  remainingAmount > 0 ? "#dc2626" : "#16a34a"
                };">الباقي</div>
                <div class="amount-value" style="color:${
                  remainingAmount > 0 ? "#dc2626" : "#16a34a"
                };">${remainingAmount} دج</div>
              </div>
            </div>
            
            <!-- Divider -->
            <div class="divider"></div>
            
            <!-- Thank You -->
            <div class="thank-you">شكراً لثقتكم بنا</div>
            <div class="thank-you-en">Thank you for trusting us!</div>
            
            <!-- Contact -->
            <div class="contact">للاستفسار: 0123 45 67 89 | info@school.dz</div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              // Close window after printing or canceling
              setTimeout(function() {
                window.close();
              }, 100);
            };
          </script>
        </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
    } catch (error) {
      console.error("Error printing receipt:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ في الطباعة",
        text: "حدث خطأ أثناء طباعة الوصل. يرجى المحاولة مرة أخرى.",
      });
    }
  };

  // Ask whether the student pays in full or partially (debt), then create one
  // combined receipt for all the chosen courses. If a balance remains, the
  // student automatically appears in the debt list.
  // `courses` = [{ groupName, price, numberOfSessions }]
  // Returns { paidAmount, remaining } so the printed receipt can reflect it.
  const askPaymentAndCreateReceipt = async (createdStudent, courses) => {
    const items = courses.map((c) => ({
      subject: c.groupName || "تسجيل",
      level: "",
      classes: c.numberOfSessions || 0,
      amount: parseFloat(c.price) || 0,
    }));
    const total = items.reduce((s, it) => s + it.amount, 0);

    const choice = await Swal.fire({
      title: "نوع الدفع",
      text: `المبلغ الإجمالي: ${total} دج`,
      icon: "question",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "دفع كامل",
      denyButtonText: "دين (دفع جزئي)",
      cancelButtonText: "تخطّي",
      confirmButtonColor: "#16a34a",
      denyButtonColor: "#d33",
    });

    // Skipped entirely
    if (choice.isDismissed && choice.dismiss === Swal.DismissReason.cancel)
      return { paidAmount: 0, remaining: total, skipped: true };

    let paidAmount = total;
    if (choice.isDenied) {
      // Partial payment -> ask how much is paid now
      const { value, isConfirmed } = await Swal.fire({
        title: "المبلغ المدفوع الآن",
        input: "number",
        inputValue: 0,
        inputAttributes: { min: 0, max: total },
        text: `المبلغ الإجمالي ${total} دج — أدخل المبلغ المدفوع`,
        showCancelButton: true,
        confirmButtonText: "تسجيل الدين",
        cancelButtonText: "إلغاء",
      });
      if (!isConfirmed) return { paidAmount: 0, remaining: total, skipped: true };
      paidAmount = Math.min(parseFloat(value) || 0, total);
    }

    try {
      const res = await createReceipt({
        studentId: createdStudent.id,
        items,
        totalAmount: total,
        paidAmount,
        paymentMethod: "cash",
      });
      const remaining =
        res?.data?.remainingAmount ?? Math.max(total - paidAmount, 0);

      if (Number(remaining) > 0) {
        await Swal.fire({
          icon: "info",
          title: "تمت إضافته إلى قائمة الديون",
          text: `المدفوع: ${paidAmount} دج — الباقي: ${Number(remaining).toFixed(
            2
          )} دج`,
        });
      } else {
        await Swal.fire({
          icon: "success",
          title: "تم الدفع كاملاً",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      return { paidAmount, remaining: Number(remaining) };
    } catch (e) {
      Swal.fire({ icon: "error", title: "خطأ", text: "فشل إنشاء الوصل" });
      return { paidAmount: 0, remaining: total, error: true };
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold my-5">التلاميذ</h1>
      </div>
      <div className="w-full max-md:flex-col flex justify-between items-center">
        <div className="w-full py-5 ">
          <Input
            classNames={{
              base: "max-w-full sm:max-w-[20rem] ",
              mainWrapper: "h-full",
              input: "text-small",
              inputWrapper:
                "h-full font-normal text-default-500 bg-default-400/50 dark:bg-default-500/20",
            }}
            placeholder=" ابحث عن تلميذ ..."
            size="lg"
            startContent={<FaSearch size={18} />}
            endContent={
              <FaSearch
                onClick={handleSearch}
                className=" h-fit cursor-pointer  w-fit p-3 text-white bg-sky-600 rounded-full  "
                size={20}
              />
            }
            onChange={(e) => setSearchStudent(e.target.value)}
            type="search"
          />
        </div>
        <Button
          onPress={onOpen}
          className="w-fit h-fit cursor-pointer mb-5  mx-auto   bg-indigo-500 rounded-2xl justify-center items-center gap-2 "
        >
          <div className="text-center text-white text-xl px-8 py-1 font-semibold font-['Cairo'] leading-9">
            اضافة تلميذ
          </div>
          <IoIosAddCircle color="white" className="w-6 h-6" />
        </Button>
      </div>
      {loadingGroups ? (
        <div className="flex justify-center items-center w-full h-full">
          <Spinner />
        </div>
      ) : (
        <div>
          {student?.length === 0 ? (
            <div className="flex min-h-[60vh] justify-center items-center w-full h-full">
              <div className="text-center text-lg text-gray-500">
                لا يوجد تلاميذ
              </div>
            </div>
          ) : (
            <Table
              className="min-h-[60vh] "
              isHeaderSticky
              aria-label="Students table"
            >
              <TableHeader>
                <TableColumn key="id">رمز التلميذ</TableColumn>
                <TableColumn key="fullName">اسم التلميذ</TableColumn>
                <TableColumn key="birthDay">تاريخ الميلاد</TableColumn>
                <TableColumn key="action">العمليات</TableColumn>
              </TableHeader>
              <TableBody
                items={Array.isArray(student) ? student : []}
                emptyContent="لا يوجد تلاميذ"
              >
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
                    onClick={() => {
                      nav(`${item.id}`);
                      console.log(item.id);
                    }}
                  >
                    {(columnKey) => (
                      <TableCell className="text-right h-7">
                        {columnKey === "group" &&
                          (item.groupId ? item.groupId : "غير معروف")}
                        {columnKey === "action" ? (
                          <div className="flex ">
                            <Button
                              color="danger"
                              startContent={<MdDelete />}
                              onClick={() =>
                                deleteStudentApi(student.indexOf(item), item.id)
                              }
                            >
                              {" "}
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
          {/* {student?.totalPages > 5 && (
            <Pagination
              total={student?.totalPages}
              initialPage={1}
              onChange={(page) => {
                // احصل على رقم الصفحة الجديد هنا
                console.log(`Page changed to: ${page}`);
                // نفذ العملية المناسبة باستخدام رقم الصفحة الجديد، مثل تحديث البيانات من الخادم
                fetchStudentsByPage(page);
              }}
            />
          )} */}
          {/* <Pagination
            total={33}
            initialPage={1}
            onChange={(page) => {
              // احصل على رقم الصفحة الجديد هنا
              console.log(`Page changed to: ${page}`);
              // نفذ العملية المناسبة باستخدام رقم الصفحة الجديد، مثل تحديث البيانات من الخادم
              fetchStudentsByPage(page);
            }}
          /> */}
        </div>
      )}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
        size="2xl"
      >
        <ModalContent className="w-full">
          {(onClose) => (
            <div className="w-full max-md:w-full h-fit md:px-12  md:py-2    bg-gray-200 rounded-3xl flex flex-col p-4">
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={async (values, { resetForm }) => {
                  const formatDate = (dateObj) => {
                    if (!dateObj) return "";
                    // NextUI CalendarDate ({year,month,day}) or a JS Date
                    if (dateObj.year && dateObj.month && dateObj.day) {
                      const day = String(dateObj.day).padStart(2, "0");
                      const month = String(dateObj.month).padStart(2, "0");
                      return `${month}-${day}-${dateObj.year}`;
                    }
                    const d = new Date(dateObj);
                    return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(
                      d.getDate()
                    ).padStart(2, "0")}-${d.getFullYear()}`;
                  };

                  const name = (values.studentName || "").trim();

                  // Build the courses to register: the list + the one currently selected
                  const courses = [...selectedCourses];
                  if (values.group && values.group.id) {
                    courses.push({
                      groupId: values.group.id,
                      groupName: values.group.name,
                      price: values.group.price,
                      numberOfSessions: values.group.numberOfSessions,
                    });
                  }

                  // Manual validation with friendly alerts
                  if (!name) {
                    Swal.fire({ icon: "warning", title: "الاسم مطلوب", text: "أدخل اسم التلميذ" });
                    return;
                  }
                  if (courses.length === 0) {
                    Swal.fire({
                      icon: "warning",
                      title: "لا توجد دورة",
                      text: 'اختر فوجاً واضغط "أضف الدورة" أولاً',
                    });
                    return;
                  }
                  if (!existingStudent && !values.birthDay) {
                    Swal.fire({
                      icon: "warning",
                      title: "تاريخ الميلاد مطلوب",
                      text: "أدخل تاريخ ميلاد التلميذ الجديد",
                    });
                    return;
                  }

                  try {
                    let studentObj = existingStudent;

                    if (existingStudent) {
                      // Existing student: just add the courses (no re-registration)
                      for (const c of courses) {
                        await addStudentToGroup(existingStudent.id, c.groupId, c.price);
                      }
                    } else {
                      // New student: create with the first course, add the rest
                      const birthDay = formatDate(values.birthDay);
                      const first = courses[0];
                      const res = await addStudent({
                        fullName: name,
                        birthDay,
                        groupId: first.groupId,
                        price: first.price,
                      });
                      if (!res || !res.student) {
                        Swal.fire({
                          icon: "error",
                          title: "خطأ",
                          text: "تعذّر تسجيل التلميذ (قد يكون مسجلاً في الفوج مسبقاً)",
                        });
                        return;
                      }
                      studentObj = res.student;
                      for (const c of courses.slice(1)) {
                        await addStudentToGroup(studentObj.id, c.groupId, c.price);
                      }
                    }

                    // One combined receipt + full/debt prompt
                    const payInfo = await askPaymentAndCreateReceipt(studentObj, courses);

                    const total = courses.reduce(
                      (s, c) => s + (parseFloat(c.price) || 0),
                      0
                    );
                    const printResult = await Swal.fire({
                      position: "center",
                      icon: "success",
                      title: "تم تسجيل التلميذ بنجاح",
                      text: "هل تريد طباعة وصل الدفع؟",
                      showCancelButton: true,
                      confirmButtonText: "نعم، اطبع الوصل",
                      cancelButtonText: "لا، شكراً",
                      confirmButtonColor: "#3085d6",
                      cancelButtonColor: "#d33",
                    });
                    if (printResult.isConfirmed) {
                      handlePrint(
                        {
                          fullName: name,
                          birthDay: existingStudent
                            ? existingStudent.birthDay
                            : formatDate(values.birthDay),
                          groupName: courses.map((c) => c.groupName).join("، "),
                          price: total,
                        },
                        payInfo
                      );
                    }

                    resetForm();
                    setSelectedCourses([]);
                    setExistingStudent(null);
                    setGroup([]);
                    setPriceInfo(null);
                    onClose();
                    fetchStudents();
                  } catch (err) {
                    console.error(err);
                    Swal.fire({
                      icon: "error",
                      title: "حدث خطأ",
                      text: "تعذّر إتمام التسجيل",
                    });
                  }

                  // Reset form after submission if needed
                }}
              >
                {({
                  handleChange,
                  handleBlur,
                  values,
                  setFieldValue,
                  handleSubmit,
                }) => (
                  <Form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="text-center text-indigo-700 text-3xl font-bold leading-10">
                      تسجيل تلميذ
                    </div>
                    <p className="text-center text-gray-600 text-sm -mt-2">
                      ابحث عن التلميذ إن كان مسجّلاً مسبقاً، أو أدخل اسماً جديداً،
                      ثم أضف الدورات.
                    </p>

                    {/* Student: search existing or type a new name */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                      <Autocomplete
                        label="اسم التلميذ"
                        aria-label="اسم التلميذ"
                        allowsCustomValue
                        defaultItems={Array.isArray(student) ? student : []}
                        inputValue={values.studentName}
                        onInputChange={(val) => {
                          setFieldValue("studentName", val);
                          // typing a (different) name means it's not the picked student
                          if (
                            existingStudent &&
                            val !== existingStudent.fullName
                          ) {
                            setExistingStudent(null);
                          }
                        }}
                        onSelectionChange={(key) => {
                          const s = (student || []).find(
                            (x) => String(x.id) === String(key)
                          );
                          if (s) {
                            setExistingStudent(s);
                            setFieldValue("studentName", s.fullName);
                          }
                        }}
                      >
                        {(item) => (
                          <AutocompleteItem key={item.id} textValue={item.fullName}>
                            {item.fullName}
                          </AutocompleteItem>
                        )}
                      </Autocomplete>
                      <ErrorMessage
                        name="studentName"
                        component="div"
                        className="text-red-500"
                      />

                      {existingStudent ? (
                        <div className="mt-2 flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-3 py-2 text-sm">
                          ✅ تلميذ مسجّل مسبقاً — لن تتم إعادة تسجيله، فقط إضافة
                          الدورات والدفع.
                        </div>
                      ) : (
                        <div className="mt-3 w-fit">
                          <Field name="birthDay">
                            {({ field }) => (
                              <DatePicker
                                label="تاريخ الميلاد (تلميذ جديد)"
                                aria-label="تاريخ الميلاد"
                                selected={field.value}
                                onChange={(date) =>
                                  setFieldValue("birthDay", date)
                                }
                              />
                            )}
                          </Field>
                          <ErrorMessage
                            name="birthDay"
                            component="div"
                            className="text-red-500"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex w-full  gap-4 justify-between items-center w-full">
                      <RadioGroup
                        className="flex w-full gap-4"
                        label="اختر  "
                        as={RadioGroup}
                        name="ClassChoose"
                        value={values.ClassChoose}
                        onChange={(e) => {
                          handleChange(e);
                          setGroup((prev) => []);
                        }}
                        onBlur={handleBlur}
                      >
                        <div className="flex gap-2">
                          <Field
                            type="radio"
                            name="Languages"
                            value="Languages"
                            as={Radio}
                            onChange={(e) => {
                              handleChange(e);
                              setGroup((prev) => []);
                            }}
                            className="cursor-pointer rounded-lg p-2 border-2 border-transparent"
                          >
                            اللغات
                          </Field>
                          <Field
                            type="radio"
                            name="Courses"
                            value="Courses"
                            onChange={(e) => {
                              handleChange(e);
                              setGroup((prev) => []);
                            }}
                            as={Radio}
                            className="cursor-pointer rounded-lg p-2 border-2 border-transparent"
                          >
                            الدورات
                          </Field>
                          <Field
                            type="radio"
                            name="levels"
                            value="levels"
                            onChange={(e) => {
                              setGroup((prev) => []);
                              handleChange(e);
                            }}
                            as={Radio}
                            className="cursor-pointer rounded-lg p-2 border-2 border-transparent"
                          >
                            المستويات
                          </Field>
                        </div>
                      </RadioGroup>
                      <ErrorMessage
                        name="ClassChoose"
                        component="div"
                        className="text-red-500"
                      />
                    </div>

                    {/* <div className="flex gap-4 justify-between items-center w-full">
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
                            label="ابحث عن استاذ"
                            aria-label="ابحث عن استاذ"
                            defaultItems={data}
                            className="max-w-xs"
                            onChange={(id) => setFieldValue("teacher", id)}
                            value={values.teacher}
                          >
                            {(item) => (
                              <AutocompleteItem
                                key={item.id}
                                onClick={() =>
                                  setFieldValue("teacher", item.id)
                                }
                                value={item.id}
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
                    </div> */}
                    {values.ClassChoose === "Languages" && (
                      <div>
                        <Field className="w-full my-2" name="Language">
                          {({ field }) => (
                            <Autocomplete
                              size="sm"
                              label="ابحث عن لغة"
                              aria-label="ابحث عن لغة"
                              defaultItems={languages}
                              className="w-full "
                              onChange={(language) =>
                                setFieldValue("language", language)
                              }
                              value={values.language}
                            >
                              {(item) => (
                                <AutocompleteItem
                                  key={item.id}
                                  onClick={() =>
                                    setFieldValue("language", item.name)
                                  }
                                  value={item.name}
                                >
                                  {item.name}
                                </AutocompleteItem>
                              )}
                            </Autocomplete>
                          )}
                        </Field>
                        <ErrorMessage
                          name="Language"
                          component="div"
                          className="text-red-500"
                        />
                        <Field className="w-full my-2" name="level">
                          {({ field }) => (
                            <Autocomplete
                              size="sm"
                              label="ابحث عن مستوى"
                              aria-label="ابحث عن مستوى"
                              defaultItems={level}
                              className="w-full my-2"
                              onChange={(level) =>
                                setFieldValue("level", level)
                              }
                            >
                              {(item) => (
                                <AutocompleteItem
                                  key={item.id}
                                  onClick={() =>
                                    setFieldValue("level", item.name)
                                  }
                                >
                                  {item.name}
                                </AutocompleteItem>
                              )}
                            </Autocomplete>
                          )}
                        </Field>
                        <ErrorMessage
                          name="level"
                          component="div"
                          className="text-red-500"
                        />
                        <Button
                          onClick={async () => {
                            try {
                              setGroup([]);
                              setLoadingSearch(true);

                              // Construct the URL with encoded components
                              const url = `/classes/Languages/${encodeURIComponent(
                                values.language
                              )}/${encodeURIComponent(values.level)}`;

                              console.log("Fetching groups with URL:", url);

                              // Fetch data from the API
                              const newList = await getGroups(url);

                              console.log("Received groups:", newList);

                              // Filter and update the state with incomplete items
                              if (
                                Array.isArray(newList) &&
                                newList.length > 0
                              ) {
                                const incompleteGroups = newList.filter(
                                  (item) => !item.isCompleted
                                );
                                setGroup(incompleteGroups);
                                console.log(
                                  "Filtered groups:",
                                  incompleteGroups
                                );
                              } else {
                                setGroup([]);
                                Swal.fire({
                                  icon: "info",
                                  title: "لا توجد مجموعات",
                                  text: "لم يتم العثور على مجموعات متاحة",
                                  timer: 2000,
                                });
                              }

                              setLoadingSearch(false);
                            } catch (error) {
                              console.error("Error fetching groups:", error);
                              setLoadingSearch(false);
                              setGroup([]);
                              Swal.fire({
                                icon: "error",
                                title: "خطأ",
                                text: "فشل في تحميل المجموعات",
                                timer: 2000,
                              });
                            }
                          }}
                          className="w-full text-center text-white text-base font-semibold bg-indigo-500 rounded-2xl px-8 py-2"
                          isLoading={loadingSearch}
                        >
                          ابحث عن فوج
                        </Button>
                      </div>
                    )}
                    {values.ClassChoose === "levels" && (
                      <form>
                        <Field name="level">
                          {({ field }) => (
                            <Select
                              label="اختر مستوى"
                              aria-label="اختر مستوى"
                              size="sm"
                              onChange={(e) => {
                                const level = e.target.value;
                                setFieldValue("level", level);
                                setSelectedLevel(level);
                                console.log(level);
                                setSelectedGroup(""); // Reset group when level changes
                              }}
                              value={values.level}
                            >
                              {Object.keys(theLevelsData).map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </Select>
                          )}
                        </Field>
                        {selectedLevel && (
                          <Field name="theYear">
                            {({ field }) => (
                              <Select
                                label="اختر السنة الدراسية"
                                aria-label="اختر السنة الدراسية"
                                size="sm"
                                onChange={(e) => {
                                  setFieldValue("theYear", e.target.value);
                                  setSelcetYear(e.target.value);
                                }}
                                value={values.theYear}
                              >
                                {Object.keys(theLevelsData[selectedLevel]).map(
                                  (theYear) => (
                                    <SelectItem key={theYear} value={theYear}>
                                      {theYear}
                                    </SelectItem>
                                  )
                                )}
                              </Select>
                            )}
                          </Field>
                        )}
                        {selcetYear && (
                          <Field name="theModule">
                            {({ field }) => (
                              <Select
                                label="اختر المادة"
                                aria-label="اختر  المادة"
                                size="sm"
                                onChange={(e) => {
                                  setFieldValue("theModule", e.target.value);
                                  setSelectedModule(e.target.value);
                                }}
                                value={values.theModule}
                              >
                                {theLevelsData[selectedLevel][selcetYear]?.map(
                                  (theModule) => (
                                    <SelectItem
                                      key={theModule}
                                      value={theModule}
                                    >
                                      {theModule}
                                    </SelectItem>
                                  )
                                )}
                              </Select>
                            )}
                          </Field>
                        )}
                        {selectedModule && (
                          <Button
                            onClick={async () => {
                              try {
                                setGroup([]);
                                setLoadingSearch(true);

                                // Construct the URL with encoded components
                                const url = `/classes/Levels/${encodeURIComponent(
                                  values.level
                                )}/${encodeURIComponent(
                                  values.theYear
                                )}/${encodeURIComponent(values.theModule)}`;

                                console.log("Fetching groups with URL:", url);

                                // Fetch data from the API
                                const newList = await getGroups(url);
                                console.log("Received groups:", newList);

                                // Filter and update the state with incomplete items
                                if (
                                  Array.isArray(newList) &&
                                  newList.length > 0
                                ) {
                                  const incompleteGroups = newList.filter(
                                    (item) => !item.isCompleted
                                  );
                                  setGroup(incompleteGroups);
                                  console.log(
                                    "Filtered groups:",
                                    incompleteGroups
                                  );
                                } else {
                                  setGroup([]);
                                  Swal.fire({
                                    icon: "info",
                                    title: "لا توجد مجموعات",
                                    text: "لم يتم العثور على مجموعات متاحة",
                                    timer: 2000,
                                  });
                                }

                                setLoadingSearch(false);
                              } catch (error) {
                                console.error("Error fetching groups:", error);
                                setLoadingSearch(false);
                                setGroup([]);
                                Swal.fire({
                                  icon: "error",
                                  title: "خطأ",
                                  text: "فشل في تحميل المجموعات",
                                  timer: 2000,
                                });
                              }
                            }}
                            className="w-full text-center text-white text-base font-semibold bg-indigo-500 rounded-2xl px-8 py-2"
                            isLoading={loadingSearch}
                          >
                            ابحث عن فوج
                          </Button>
                        )}
                      </form>
                    )}
                    {values.ClassChoose === "Courses" && (
                      <div>
                        <Field className="w-full my-2" name="Course">
                          {({ field }) => (
                            <Autocomplete
                              size="sm"
                              label="ابحث عن دورة"
                              aria-label="ابحث عن دورة"
                              defaultItems={courses}
                              className="w-full "
                              onChange={(course) =>
                                setFieldValue("course", course)
                              }
                              value={values.course}
                            >
                              {(item) => (
                                <AutocompleteItem
                                  key={item.id}
                                  onClick={() =>
                                    setFieldValue("course", item.name)
                                  }
                                  value={item.name}
                                >
                                  {item.name}
                                </AutocompleteItem>
                              )}
                            </Autocomplete>
                          )}
                        </Field>
                        <ErrorMessage
                          name="Course"
                          component="div"
                          className="text-red-500"
                        />
                        <Button
                          onClick={async () => {
                            try {
                              setGroup([]);
                              setLoadingSearch(true);

                              // Construct the URL with encoded components
                              const url = `/classes/Courses/${encodeURIComponent(
                                values.course
                              )}`;

                              console.log("Fetching groups with URL:", url);

                              // Fetch data from the API
                              const newList = await getGroups(url);

                              console.log("Received groups:", newList);

                              // Filter and update the state with incomplete items
                              if (
                                Array.isArray(newList) &&
                                newList.length > 0
                              ) {
                                const incompleteGroups = newList.filter(
                                  (item) => !item.isCompleted
                                );
                                setGroup(incompleteGroups);
                                console.log(
                                  "Filtered groups:",
                                  incompleteGroups
                                );
                              } else {
                                setGroup([]);
                                Swal.fire({
                                  icon: "info",
                                  title: "لا توجد مجموعات",
                                  text: "لم يتم العثور على مجموعات متاحة",
                                  timer: 2000,
                                });
                              }

                              setLoadingSearch(false);
                            } catch (error) {
                              console.error("Error fetching groups:", error);
                              setLoadingSearch(false);
                              setGroup([]);
                              Swal.fire({
                                icon: "error",
                                title: "خطأ",
                                text: "فشل في تحميل المجموعات",
                                timer: 2000,
                              });
                            }
                          }}
                          className="w-full text-center text-white text-base font-semibold bg-indigo-500 rounded-2xl px-8 py-2"
                          isLoading={loadingSearch}
                        >
                          ابحث عن فوج
                        </Button>
                      </div>
                    )}
                    {group.length > 0 && (
                      <div className="">
                        <Field name="group">
                          {({ field }) => (
                            <Select
                              label="اختر فوج"
                              aria-label="اختر فوج"
                              size="sm"
                              onChange={(e) => {
                                setFieldValue("group", e.target.value);
                              }}
                              value={values.group}
                            >
                              {group.map((item) => (
                                <SelectItem
                                  onClick={async () => {
                                    setFieldValue("group", item);
                                    setPriceInfo(null);
                                    try {
                                      const res = await getRegistrationPrice(
                                        item.id
                                      );
                                      const info = res?.data;
                                      if (info) {
                                        setPriceInfo(info);
                                        // Price = remaining sessions only
                                        setFieldValue(
                                          "group.price",
                                          info.registrationPrice
                                        );
                                      }
                                    } catch (e) {
                                      setPriceInfo(null);
                                    }
                                  }}
                                  key={item.id}
                                  value={item.id}
                                >
                                  {item.name}
                                </SelectItem>
                              ))}
                            </Select>
                          )}
                        </Field>
                        <div className="flex my-2  gap-4 justify-between items-center w-full">
                          <Field
                            className="w-full"
                            name="price"
                            as={Input}
                            type="number"
                            max={priceInfo?.registrationPrice}
                            label="السعر (حسب الحصص المتبقية)"
                            aria-label="السعر حسب الحصص المتبقية"
                            onChange={(e) => {
                              let v = e.target.value;
                              const max = priceInfo?.registrationPrice;
                              // Can't charge more than the remaining-sessions price
                              if (max != null && parseFloat(v) > max) {
                                v = String(max);
                              }
                              setFieldValue("group.price", v);
                            }}
                            onBlur={handleBlur}
                            value={values.group.price}
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
                        </div>
                        {priceInfo && (
                          <div className="text-xs text-gray-600 bg-amber-50 rounded-lg p-2">
                            سعر الحصة: <b>{priceInfo.pricePerSession} دج</b> — الحصص
                            المتبقية: <b>{priceInfo.remainingSessions}</b> من{" "}
                            {priceInfo.totalSessions} (أُجريت{" "}
                            {priceInfo.heldSessions}). السعر المستحق:{" "}
                            <b className="text-emerald-700">
                              {priceInfo.registrationPrice} دج
                            </b>{" "}
                            — لا يمكن تجاوزه.
                          </div>
                        )}
                        <Button
                          type="button"
                          className="w-full bg-emerald-600 text-white rounded-2xl font-semibold"
                          onClick={() => {
                            if (!values.group?.id) {
                              Swal.fire({
                                icon: "warning",
                                title: "اختر فوجاً",
                                text: "اختر الفوج أولاً",
                              });
                              return;
                            }
                            if (
                              selectedCourses.some(
                                (c) => c.groupId === values.group.id
                              )
                            ) {
                              Swal.fire({
                                icon: "info",
                                title: "مضافة مسبقاً",
                                text: "هذه الدورة مضافة بالفعل",
                              });
                              return;
                            }
                            setSelectedCourses((prev) => [
                              ...prev,
                              {
                                groupId: values.group.id,
                                groupName: values.group.name,
                                price: parseFloat(values.group.price) || 0,
                                numberOfSessions: values.group.numberOfSessions,
                              },
                            ]);
                            // reset the picker so another course can be added
                            setFieldValue("group", {});
                            setFieldValue("ClassChoose", "");
                            setGroup([]);
                            setPriceInfo(null);
                          }}
                        >
                          ➕ أضف هذه الدورة
                        </Button>
                      </div>
                    )}

                    <ErrorMessage
                      name="group"
                      component="div"
                      className="text-red-500"
                    />

                    {/* Chosen courses */}
                    {selectedCourses.length > 0 && (
                      <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <div className="font-bold mb-2">الدورات المختارة</div>
                        {selectedCourses.map((c, i) => (
                          <div
                            key={c.groupId}
                            className="flex justify-between items-center border-b py-2"
                          >
                            <span>{c.groupName}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-emerald-700">
                                {c.price} دج
                              </span>
                              <button
                                type="button"
                                className="text-red-500"
                                onClick={() =>
                                  setSelectedCourses((prev) =>
                                    prev.filter((_, idx) => idx !== i)
                                  )
                                }
                              >
                                حذف
                              </button>
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-between mt-3 font-bold text-lg">
                          <span>المجموع</span>
                          <span className="text-emerald-700">
                            {selectedCourses.reduce(
                              (s, c) => s + (parseFloat(c.price) || 0),
                              0
                            )}{" "}
                            دج
                          </span>
                        </div>
                      </div>
                    )}
                    {loadingSearch && (
                      <div className="flex justify-center items-center w-full">
                        <Spinner />
                      </div>
                    )}

                    <div className="flex w-full gap-2 justify-between items-center">
                      <Button
                        type="submit"
                        className="w-full text-center text-white text-base font-semibold bg-indigo-500 rounded-2xl px-8 py-2"
                      >
                        تسجيل ودفع
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setSelectedCourses([]);
                          setExistingStudent(null);
                          setGroup([]);
                          setPriceInfo(null);
                          onClose();
                        }}
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

export default Students;
