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
  updateGroup,
  updateGroupStatus,
} from "../../apiCalls/GroupsCals";
import { getSchedule } from "../../apiCalls/scheduleCalls";
import { deleteStudentFropmGroup } from "../../apiCalls/studentCalls";
import { getAllTeachers } from "../../apiCalls/teacherCalls";
import LineAddTime from "../../components/adminsCompnents/groups/LineAddTime";
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
  const pathname = useLocation().pathname;

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
                        <div className="flex ">
                          <Button
                            color="danger"
                            startContent={<MdDelete />}
                            onClick={() =>
                              deleteStudentApi(student.indexOf(item), item.id)
                            }
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
