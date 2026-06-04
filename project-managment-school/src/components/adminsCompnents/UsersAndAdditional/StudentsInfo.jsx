import {
  Button,
  DatePicker,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { CgAdd } from "react-icons/cg";
import { useParams } from "react-router-dom";
import { getStudentById, updateStudent } from "../../../apiCalls/studentCalls";

import { ErrorMessage, Field, Formik } from "formik";
import pdfMake from "pdfmake/build/pdfmake";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoPrint } from "react-icons/io5";
import { MdDelete, MdEdit } from "react-icons/md";
import Swal from "sweetalert2";
import * as Yup from "yup";
import {
  addParent,
  addStudentInToParent,
  deleteStudentForParent,
} from "../../../apiCalls/parentCalls";
import { font } from "../../../assets/Cairo-VariableFont_slnt,wght-normal";
import MultiSubjectRegistration from "./MultiSubjectRegistration";
import RemainingClassesCard from "../groups/RemainingClassesCard";

function StudentsInfo() {
  const [student, setStudent] = useState({});
  const [isMultiOpen, setIsMultiOpen] = useState(false);
  const { studentParams } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure(); // use onClose instead of onOpenChange
  const [parent, setParent] = useState({});
  const [isParent, setIsParent] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const validationSchema = Yup.object({
    fullName: Yup.string().trim().required("اسم التلميذ مطلوب"),
    birthDay: Yup.date().required("تاريخ الميلاد مطلوب"),
  });

  const initialValues = {
    fullName: "",
    birthDay: "",
  };
  const fetchStudent = async () => {
    const response = await getStudentById(studentParams);
    setStudent(response);
  };
  const parseDateString = (dateString) => {
    return new Date(dateString); // ISO string directly converted to Date object
  };

  useEffect(() => {
    fetchStudent();
    // parseDateString(student.birthDay);
    console.log(parseDateString(student.birthDay));
  }, [studentParams]);

  // Initialize pdfMake fonts once at component mount
  useEffect(() => {
    pdfMake.vfs = pdfMake.vfs || {};
    pdfMake.vfs["Cairo-Regular.ttf"] = font;

    pdfMake.fonts = {
      Cairo: {
        normal: "Cairo-Regular.ttf",
        bold: "Cairo-Regular.ttf",
        italics: "Cairo-Regular.ttf",
        bolditalics: "Cairo-Regular.ttf",
      },
    };
  }, []);

  const addParentApi = async (parentData) => {
    try {
      const newParent = await addParent(parentData);
      console.log("Parent added:", newParent);
    } catch (error) {
      console.error("Error adding parent:", error);
    }
  };

  const handleAddParent = async (event) => {
    event.preventDefault();

    const response = await addStudentInToParent(
      event.target.phoneNumber.value,
      studentParams
    );
    console.log(response);
    if (response.message !== "Parent") {
      fetchStudent();
      Swal.fire({
        icon: "success",
        title: "تمت الاضافة بنجاح",
        showConfirmButton: false,
        timer: 1500,
      });
      onClose();
    } else {
      setIsParent(true);
    }
    if (isParent) {
      const parentData = {
        fullName: event.target.fullName.value,
        phoneNumber: event.target.phoneNumber.value,
        email: event.target.email.value,
        password: event.target.password.value,
        studentId: studentParams,
      };
      await addParentApi(parentData);
      fetchStudent();
      Swal.fire({
        icon: "success",
        title: "تمت الاضافة بنجاح",
        showConfirmButton: false,
        timer: 1500,
      });
      onClose();
    }

    // Close the modal after submission
  };
  const deleteParent = async () => {
    console.log("student.id", student.id);
    console.log("student.parent.id", student.parent.id);
    const response = await deleteStudentForParent({
      studentId: student.id,
      parentId: student.parent.id,
    });
    console.log(response);
    fetchStudent();
  };
  const handleDeleteParent = async () => {
    Swal.fire({
      title: "هل انت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا الاجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "نعم, احذف!",
      cancelButtonText: "الغاء",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteParent();
        Swal.fire("تم الحذف!", "تم حذف الولي بنجاح.", "success");
      }
    });
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    birthDay: new Date(student.birthDay), // Assuming `student.birthDay` is a valid date string
  });

  // Close the modal
  const onEditClose = () => {
    setIsEditModalOpen(false);
  };

  // Handle form submission
  const handleEditSubmit = async (values) => {
    console.log(values);

    // Handle the form submission (e.g., update the state or make an API call)

    console.log("Form submitted:", {
      fullName: values.fullName,
      birthDay: values.birthDay,
    });
    const response = await updateStudent({
      id: student.id,
      fullName: values.fullName,
      birthDay: values.birthDay,
    });
    if (response) {
      Swal.fire({
        position: "center",
        icon: "success",
        title: "تم التعديل بنجاح",

        timer: 1500,
        confirmButtonText: "Okay",
      }).then(() => {
        fetchStudent();

        // Refresh the list of students
      });
    } else {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "حدث خطأ",
        text: " لم يتم  التعديل ",
        showConfirmButton: false,
        timer: 1500,
      });
    }

    setIsEditModalOpen(false); // Close modal after submission
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  // Function to format Arabic text for proper RTL display
  const formatArabicForPDF = (text) => {
    if (!text) return "";
    // Return text as-is for proper RTL display
    return text;
  };

  // Print Receipt Function
  const handlePrintReceipt = () => {
    if (!student || !student.group) {
      Swal.fire({
        icon: "error",
        title: "عذرا",
        text: "لا يوجد معلومات كافية لطباعة وصل الدفع",
      });
      return;
    }

    // fonts initialized on mount

    const docDefinition = {
      pageSize: {
        width: 226.77, // 80mm in points
        height: "auto",
      },
      pageMargins: [15, 15, 15, 15],
      content: [
        // School Logo
        {
          text: "🎓",
          style: "logo",
          margin: [0, 5, 0, 5],
          alignment: "center",
        },
        // School Name in Arabic
        {
          text: formatArabicForPDF("مدرسة النجاح"),
          style: "schoolName",
          margin: [0, 0, 0, 2],
          alignment: "center",
        },
        {
          text: "School of Success",
          style: "schoolNameEn",
          margin: [0, 0, 0, 8],
          alignment: "center",
        },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 0,
              x2: 196.77,
              y2: 0,
              lineWidth: 2,
            },
          ],
          margin: [0, 5, 0, 5],
        },
        // Receipt Title
        {
          text: formatArabicForPDF("وصل دفع"),
          style: "header",
          margin: [0, 5, 0, 10],
          alignment: "center",
        },
        // Receipt Number and Date
        {
          columns: [
            {
              text: formatArabicForPDF(
                `رقم: ${Math.floor(Math.random() * 10000)}`
              ),
              style: "receiptInfo",
              alignment: "right",
              width: "50%",
            },
            {
              text: `Date: ${new Date().toLocaleDateString("en-GB")}`,
              style: "receiptInfo",
              alignment: "left",
              width: "50%",
            },
          ],
          margin: [0, 0, 0, 10],
        },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 0,
              x2: 196.77,
              y2: 0,
              lineWidth: 1,
              dash: { length: 3 },
            },
          ],
          margin: [0, 5, 0, 10],
        },
        // Student Details
        {
          table: {
            widths: ["70%", "30%"],
            body: [
              [
                {
                  text: formatArabicForPDF((student.fullName || "") + " :"),
                  style: "value",
                  alignment: "left",
                },
                {
                  text: formatArabicForPDF("اسم التلميذ"),
                  style: "labelBold",
                  alignment: "right",
                },
              ],
              [
                {
                  text: formatArabicForPDF(
                    (student.birthDay?.split("T")[0] || "") + " :"
                  ),
                  style: "value",
                  alignment: "left",
                },
                {
                  text: formatArabicForPDF("تاريخ الميلاد"),
                  style: "labelBold",
                  alignment: "right",
                },
              ],
              [
                {
                  text: formatArabicForPDF(
                    (student.group?.name || "غير محدد") + " :"
                  ),
                  style: "value",
                  alignment: "left",
                },
                {
                  text: formatArabicForPDF("الفوج"),
                  style: "labelBold",
                  alignment: "right",
                },
              ],
            ],
          },
          layout: "noBorders",
          margin: [0, 0, 0, 10],
        },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 0,
              x2: 196.77,
              y2: 0,
              lineWidth: 1,
              dash: { length: 3 },
            },
          ],
          margin: [0, 5, 0, 10],
        },
        // Payment Details
        {
          table: {
            widths: ["50%", "50%"],
            body: [
              [
                {
                  text: `${student.price || student.group?.price || 0} DZD :`,
                  style: "amountValue",
                  alignment: "left",
                },
                {
                  text: formatArabicForPDF("المبلغ المدفوع"),
                  style: "amountLabel",
                  alignment: "right",
                },
              ],
            ],
          },
          layout: {
            fillColor: "#f5f5f5",
            hLineWidth: function () {
              return 1;
            },
            vLineWidth: function () {
              return 1;
            },
          },
          margin: [0, 5, 0, 10],
        },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 0,
              x2: 196.77,
              y2: 0,
              lineWidth: 2,
            },
          ],
          margin: [0, 10, 0, 10],
        },
        // Thank You Message
        {
          text: formatArabicForPDF("شكراً لثقتكم بنا"),
          style: "thankYou",
          alignment: "center",
          margin: [0, 5, 0, 5],
        },
        {
          text: "Thank you for your payment!",
          style: "thankYouEn",
          alignment: "center",
          margin: [0, 0, 0, 10],
        },
        // Contact Information
        {
          text: "Tel: 0123 45 67 89 | Email: info@school.dz",
          style: "contact",
          alignment: "center",
          margin: [0, 5, 0, 0],
        },
      ],
      styles: {
        logo: {
          fontSize: 28,
          margin: [0, 0, 0, 0],
        },
        schoolName: {
          fontSize: 18,
          bold: true,
          color: "#1a56db",
        },
        schoolNameEn: {
          fontSize: 10,
          color: "#666",
        },
        header: {
          fontSize: 16,
          bold: true,
          decoration: "underline",
        },
        receiptInfo: {
          fontSize: 9,
          color: "#666",
        },
        labelBold: {
          fontSize: 10,
          bold: true,
          alignment: "right",
          margin: [0, 3, 5, 3],
        },
        value: {
          fontSize: 10,
          alignment: "right",
          margin: [0, 3, 0, 3],
        },
        amountLabel: {
          fontSize: 12,
          bold: true,
          margin: [5, 5, 5, 5],
        },
        amountValue: {
          fontSize: 14,
          bold: true,
          color: "#1a56db",
          margin: [5, 5, 5, 5],
        },
        thankYou: {
          fontSize: 12,
          bold: true,
          color: "#16a34a",
        },
        thankYouEn: {
          fontSize: 9,
          color: "#666",
        },
        contact: {
          fontSize: 8,
          color: "#666",
          italics: true,
        },
      },
      defaultStyle: {
        font: "Cairo",
      },
    };

    pdfMake.createPdf(docDefinition).print();
  };

  return (
    <div>
      <div className="md:flex justify-start gap-10 items-start">
        <div className="md:w-1/2">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold my-5">معلومات التلميذ</h1>
            <div className="flex gap-2">
              <Button
                isIconOnly
                color="success"
                variant="light"
                onClick={handlePrintReceipt}
                className="mt-5"
              >
                <IoPrint className="text-xl" />
              </Button>
              <Button
                isIconOnly
                color="primary"
                variant="light"
                onClick={() => {
                  setEditForm({
                    fullName: student.fullName,
                    birthDay: new Date(student.birthDay),
                  });
                  setIsEditModalOpen(true);
                }}
                className="mt-5"
              >
                <MdEdit className="text-xl" />
              </Button>
            </div>
          </div>
          <div className="h-14 px-8 py-4 my-3 rounded-lg border border-black/20">
            <div className="text-right text-[#242c31] text-base font-semibold font-['Cairo'] leading-normal">
              {student?.fullName}
            </div>
          </div>
          <div className="h-14 px-8 py-4 my-5 rounded-lg border border-black/20">
            <div className="text-right text-[#242c31] text-base font-semibold font-['Cairo'] leading-normal">
              {student?.birthDay?.split("T")[0]}
            </div>
          </div>
          <div className="h-14 px-8 py-4 my-3 rounded-lg border border-black/20">
            <div className="text-right flex justify-between gap-5 items-center text-[#242c31] text-base font-semibold font-['Cairo'] leading-normal">
              {student.parent ? (
                <div>{student.parent.fullName}</div>
              ) : (
                "لا يوجد ولي أمر"
              )}
              {student.parent && (
                <div onClick={handleDeleteParent}>
                  <MdDelete className="text-red-500 text-2xl cursor-pointer bg-red-100 p-1 rounded-full w-7 h-7" />
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            {!student?.parent && (
              <Button onClick={onOpen} size="lg" color="primary">
                اضافة ولي
                <CgAdd />
              </Button>
            )}
            <Button
              onClick={handlePrintReceipt}
              size="lg"
              color="success"
              variant="flat"
            >
              طباعة وصل الدفع
              <IoPrint />
            </Button>
            <Button
              onClick={() => setIsMultiOpen(true)}
              size="lg"
              color="secondary"
              variant="flat"
            >
              تسجيل في عدة مواد
              <CgAdd />
            </Button>
          </div>

          {/* Multi-subject registration (combined receipt with paid & remaining) */}
          <MultiSubjectRegistration
            studentId={student.id}
            isOpen={isMultiOpen}
            onClose={() => setIsMultiOpen(false)}
          />
          {/* Edit Student Modal */}
          <Modal isOpen={isEditModalOpen} onClose={onEditClose}>
            <ModalContent>
              <ModalHeader className="flex flex-col gap-1">
                تعديل التلميذ
              </ModalHeader>
              <ModalBody>
                <Formik
                  initialValues={editForm}
                  onSubmit={handleEditSubmit}
                  validationSchema={validationSchema}
                >
                  {({ handleSubmit, setFieldValue }) => (
                    <form onSubmit={handleSubmit} id="editForm">
                      <Input
                        className="my-2"
                        type="text"
                        name="fullName"
                        placeholder="اسم التلميذ"
                        value={editForm.fullName}
                        onChange={handleInputChange}
                        required
                      />
                      <div className="w-fit">
                        <Field name="birthDay">
                          {({ field, form }) => (
                            <input
                              type="date"
                              label="تاريخ الميلاد"
                              aria-label="تاريخ الميلاد"
                              value={
                                field.value
                                  ? new Date(field.value)
                                      .toISOString()
                                      .split("T")[0] // Format as yyyy-MM-dd
                                  : ""
                              }
                              onChange={(e) => {
                                const selectedDate = e.target.value;
                                if (selectedDate) {
                                  const formattedDate = new Date(
                                    selectedDate
                                  ).toISOString(); // Format as ISO string
                                  form.setFieldValue(field.name, formattedDate); // Update Formik state
                                }
                              }}
                            />
                          )}
                        </Field>

                        <ErrorMessage
                          name="birthDay"
                          component="div"
                          className="text-red-500"
                        />
                      </div>
                    </form>
                  )}
                </Formik>
              </ModalBody>

              <ModalFooter>
                <Button color="danger" variant="light" onClick={onEditClose}>
                  الغاء
                </Button>
                <Button color="primary" type="submit" form="editForm">
                  حفظ
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          {/* Add Parent Modal */}
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
              <ModalHeader className="flex flex-col gap-1">
                Add Parent
              </ModalHeader>
              <ModalBody>
                <form onSubmit={handleAddParent} id="parentForm">
                  <Input
                    className="my-2"
                    type="text"
                    name="fullName"
                    placeholder="اسم الولي"
                    required
                  />
                  <Input
                    className="my-2"
                    type="text"
                    name="phoneNumber"
                    placeholder="رقم الولي"
                    required
                  />

                  {isParent && (
                    <div>
                      <div className="w-fit">
                        <Field name="birthDay">
                          {({ field }) => (
                            <DatePicker
                              label="تاريخ الميلاد"
                              aria-label=" تاريخ الميلاد"
                              selected={field.value}
                              onChange={(date) =>
                                field.onChange({
                                  target: {
                                    name: field.name,
                                    value: date,
                                  },
                                })
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
                      <Input
                        className="my-2"
                        placeholder="كلمة السر"
                        name="password"
                        type={isVisible ? "text" : "password"}
                        endContent={
                          <button
                            type="button"
                            onClick={toggleVisibility}
                            aria-label="toggle password visibility"
                          >
                            {isVisible ? (
                              <FaEye className="text-2xl text-default-400" />
                            ) : (
                              <FaEyeSlash className="text-2xl text-default-400" />
                            )}
                          </button>
                        }
                      />
                    </div>
                  )}

                  {!isParent && (
                    <Button
                      className="my-2"
                      color="primary"
                      variant="light"
                      type="button"
                      onClick={() => setIsParent(!isParent)}
                    >
                      هل الولي مسجل بالفعل؟
                    </Button>
                  )}
                </form>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onClick={onClose}>
                  الغاء
                </Button>
                <Button color="primary" type="submit" form="parentForm">
                  اضافة
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </div>
        <div>
          <h1 className="text-2xl font-bold my-5">
            الفصول التي ينتمي إليها التلميذ
          </h1>
          {student?.groups?.map((group) => (
            <div
              key={group.id}
              className="w-fit flex justify-end my-3 gap-4 items-center"
            >
              <div className="w-fit cursor-pointer hover:border-none hover:bg-slate-300 h-16 px-8 py-4 rounded-2xl border border-black justify-center items-center gap-2 inline-flex">
                <div className="text-right text-gray-800 text-2xl font-semibold font-['Cairo'] leading-9">
                  {group.name}
                </div>
              </div>
              <div className="text-right text-[#429661] text-xl font-semibold font-['Cairo'] leading-normal">
                {group.numberOfSessions} حصة
              </div>
            </div>
          ))}

          {/* Remaining classes + monthly fee after deducting absences */}
          {student?.groups?.length > 0 && student.id && (
            <div className="space-y-4 mt-4">
              {student.groups.map((group) => (
                <RemainingClassesCard
                  key={`rc-${group.id}`}
                  studentId={student.id}
                  groupId={group.id}
                  groupName={group.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentsInfo;
