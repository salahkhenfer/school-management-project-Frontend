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
import {
  addStudent,
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
  const validationSchema = Yup.object().shape({
    studentName: Yup.string().required("اسم التلميذ مطلوب"),
    birthDay: Yup.date().required("تاريخ الميلاد مطلوب"),
    ClassChoose: Yup.string().required("اختر نوع الفصل"),
    group: Yup.object().shape({
      id: Yup.number().required("اختر الفوج"),
      price: Yup.number().required("السعر مطلوب"),
    }),
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
  const handlePrint = (student) => {
    console.log("Print student data:", student);
    console.log("Available groups:", group);

    if (!student || !student.fullName) {
      Swal.fire({
        icon: "error",
        title: "عذرا",
        text: "لا يوجد معلومات لطباعة وصل الدفع",
      });
      return;
    }

    try {
      const groupName = group.find((item) => item.id === student.groupId);
      console.log("Found group:", groupName);

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
                <div class="details-value">${groupName?.name || "غير محدد"}</div>
              </div>
            </div>
            
            <!-- Dashed Divider -->
            <div class="divider-dashed"></div>
            
            <!-- Amount Box -->
            <div class="amount-box">
              <div class="amount-label">المبلغ المدفوع</div>
              <div class="amount-value">${student.price || 0} دج</div>
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
      >
        <ModalContent className="w-full">
          {(onClose) => (
            <div className="w-full max-md:w-full h-fit md:px-12  md:py-2    bg-gray-200 rounded-3xl flex flex-col p-4">
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={async (values, { resetForm }) => {
                  console.log(values);
                  // Handle form submission
                  const formatDate = (dateObj) => {
                    const day = String(dateObj.day).padStart(2, "0");
                    const month = String(dateObj.month).padStart(2, "0");
                    const year = dateObj.year;
                    return `${month}-${day}-${year}`;
                  };
                  const newStudent = {
                    fullName: values.studentName.trim(),
                    birthDay: formatDate(values.birthDay),
                    groupId: values.group.id,
                    price: values.group.price,
                  };

                  console.log(newStudent);

                  const response = await addStudent(newStudent);
                  if (response) {
                    Swal.fire({
                      position: "center",
                      icon: "success",
                      title: "تمت إضافة التلميذ بنجاح",
                      text: "هل تريد طباعة وصل الدفع؟",
                      showCancelButton: true,
                      confirmButtonText: "نعم، اطبع الوصل",
                      cancelButtonText: "لا، شكراً",
                      confirmButtonColor: "#3085d6",
                      cancelButtonColor: "#d33",
                    }).then((result) => {
                      if (result.isConfirmed) {
                        handlePrint(newStudent);
                      }
                      resetForm();
                      onClose();
                      fetchStudents(); // Refresh the list of students
                    });
                  } else {
                    Swal.fire({
                      position: "center",
                      icon: "error",
                      title: "حدث خطأ",
                      text: " التلميذ موجود بالفعل في  الفوج",
                      showConfirmButton: false,
                      timer: 1500,
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
                    <div className="text-center text-gray-800 text-3xl font-semibold leading-10">
                      إضافة تلميذ
                    </div>

                    <div className="flex justify-between items-center w-full">
                      <div className="w-fit">
                        <Field
                          className="w-fit"
                          name="studentName"
                          type="text"
                          as={Input}
                          label="الاسم الكامل لتلميذ"
                          aria-label=" الاسم الكامل للتلميذ"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.studentName}
                        />
                        <ErrorMessage
                          name="studentName"
                          component="div"
                          className="text-red-500"
                        />
                      </div>
                      <div className="w-fit">
                        <Field name="birthDay">
                          {({ field }) => (
                            <DatePicker
                              label="تاريخ الميلاد"
                              aria-label=" تاريخ الميلاد"
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
                                  onClick={() => setFieldValue("group", item)}
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
                            type="Price"
                            label=" السعر  التلميذ"
                            aria-label=" السعر الاجمالي للحصة"
                            onChange={(e) => {
                              setFieldValue("group.price", e.target.value);
                            }} // handleChange
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
                      </div>
                    )}

                    <ErrorMessage
                      name="group"
                      component="div"
                      className="text-red-500"
                    />
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
                        اضافة
                      </Button>
                      <Button
                        type="button"
                        onClick={onClose}
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

export default Students;
