import {
  Button,
  getKeyValue,
  Modal,
  ModalContent,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { Form, useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";

import { Input } from "@nextui-org/react";
import { ErrorMessage, Field, Formik } from "formik";
import { FaEye, FaEyeSlash, FaSearch } from "react-icons/fa";
import { IoIosAddCircle } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import {
  addTeacherApi,
  deleteTeacherApi,
  getAllTeachers,
  searchTeacherApi,
} from "../../apiCalls/teacherCalls";
// import { getAllSubjects } from "../../apiCalls/subjectCalls";

function Teachers() {
  const nav = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const pathname = useLocation().pathname;
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [searchTeacher, setSearchTeacher] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const newList = await getAllTeachers();
      // Check if newList is an array or an object with data property
      if (Array.isArray(newList)) {
        setTeachers(newList);
      } else if (newList && newList.data) {
        setTeachers(newList.data);
      } else {
        setTeachers([]);
      }
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
      setTeachers([]);
    }
    setLoadingTeachers(false);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const initialValues = {
    teacherName: "",
    email: "",
    phone: "",
    password: "",
  };

  const validationSchema = Yup.object({
    teacherName: Yup.string().required("الاسم الكامل مطلوب"),
    email: Yup.string()
      .email("البريد الإلكتروني غير صالح")
      .required("البريد الإلكتروني مطلوب"),
    phone: Yup.string().required("رقم الهاتف مطلوب"),
    password: Yup.string().required("كلمة المرور مطلوبة"),
  });

  const deleteTeacher = async (index, id) => {
    try {
      const result = await Swal.fire({
        title: "هل أنت متأكد؟",
        text: "هل تريد حقًا حذف هذا المعلم؟ لا يمكن التراجع عن هذا الإجراء",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "نعم، قم بالحذف",
        cancelButtonText: "إلغاء",
      });

      if (result.isConfirmed) {
        await deleteTeacherApi(id);

        Swal.fire({
          position: "center",
          icon: "success",
          title: "تم حذف المعلم بنجاح",
          timer: 1500,
          confirmButtonText: "حسنًا",
        }).then(() => {
          fetchTeachers();
        });

        setTeachers((prevList) => prevList.filter((_, i) => i !== index));
      }
    } catch (err) {
      console.error("Failed to delete teacher:", err);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "حدث خطأ ما، يرجى المحاولة مرة أخرى",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const handleSearch = async () => {
    if (searchTeacher === "") {
      return fetchTeachers();
    }
    try {
      const newList = await searchTeacherApi(searchTeacher);
      // Check if newList is an array or an object with data property
      if (Array.isArray(newList)) {
        setTeachers(newList);
      } else if (newList && newList.data) {
        setTeachers(newList.data);
      } else {
        setTeachers([]);
      }
    } catch (error) {
      console.error("Failed to search teachers:", error);
      setTeachers([]);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold my-5">الأساتذة</h1>
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
            placeholder=" ابحث عن معلم ..."
            size="lg"
            startContent={<FaSearch size={18} />}
            endContent={
              <FaSearch
                onClick={handleSearch}
                className=" h-fit cursor-pointer w-fit p-3 text-white bg-sky-600 rounded-full"
                size={20}
              />
            }
            onChange={(e) => setSearchTeacher(e.target.value)}
            type="search"
          />
        </div>
        <Button
          onPress={onOpen}
          className="w-fit h-fit cursor-pointer mb-5 mx-auto bg-indigo-500 rounded-2xl justify-center items-center gap-2 "
        >
          <div className="text-center text-white text-xl px-8 py-1 font-semibold font-['Cairo'] leading-9">
            إضافة معلم
          </div>
          <IoIosAddCircle color="white" className="w-6 h-6" />
        </Button>
      </div>
      {loadingTeachers ? (
        <div className="flex justify-center items-center w-full h-full">
          <Spinner />
        </div>
      ) : (
        <div>
          {teachers.length === 0 ? (
            <div className="flex min-h-[60vh] justify-center items-center w-full h-full">
              <div className="text-center text-lg text-gray-500">
                لا يوجد معلمين
              </div>
            </div>
          ) : (
            <Table
              className="min-h-[60vh] "
              isHeaderSticky
              aria-label="Teachers table"
            >
              <TableHeader>
                <TableColumn key="id">رمز المعلم</TableColumn>
                <TableColumn key="fullName">اسم المعلم</TableColumn>
                <TableColumn key="phoneNumber">رقم الهاتف </TableColumn>
                <TableColumn key="action">العمليات</TableColumn>
              </TableHeader>
              <TableBody
                items={Array.isArray(teachers) ? teachers : []}
                emptyContent="لا يوجد معلمين"
              >
                {(item) => (
                  <TableRow
                    className="hover:bg-gray-100 border-b-2 border-gray-200 transition-all duration-200 ease-in-out h-4 cursor-pointer"
                    key={item.id}
                    onClick={() => {
                      nav(`${item.id}`);
                    }}
                  >
                    {(columnKey) => (
                      <TableCell className="text-right h-7">
                        {columnKey === "action" ? (
                          <div className="flex ">
                            <Button
                              color="danger"
                              startContent={<MdDelete />}
                              onClick={() =>
                                deleteTeacher(teachers.indexOf(item), item.id)
                              }
                            >
                              {" "}
                            </Button>
                          </div>
                        ) : (
                          getKeyValue(item, columnKey)
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
          {teachers.totalPages > 1 && (
            <Pagination
              total={teachers.totalPages}
              initialPage={1}
              onChange={(page) => {
                console.log(`Page changed to: ${page}`);
                fetchTeachers(page);
              }}
            />
          )}
        </div>
      )}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent className="w-full">
          {(onClose) => (
            <div className="w-full max-md:w-full h-fit md:px-12 md:py-2 bg-gray-200 rounded-3xl flex flex-col p-4">
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={async (values, { resetForm }) => {
                  console.log(values);

                  const newTeacher = {
                    fullName: values.teacherName,
                    email: values.email,
                    phoneNumber: values.phone,
                    password: values.password,
                  };
                  console.log(newTeacher);
                  const response = await addTeacherApi(newTeacher);
                  if (response.status === 201) {
                    Swal.fire({
                      position: "center",
                      icon: "success",
                      title: "تمت إضافة المعلم بنجاح",
                      timer: 1500,
                      confirmButtonText: "حسنًا",
                    }).then(() => {
                      resetForm();
                      onClose();
                      fetchTeachers();
                    });
                  } else if (response.status === 409) {
                    Swal.fire({
                      icon: "info",
                      title: "الاستاذ موجود بالفعل",
                      text: "تم العثور على الاستاذ في قاعدة البيانات",
                      showConfirmButton: false,
                      timer: 1500,
                    });
                  } else {
                    Swal.fire({
                      position: "center",
                      icon: "error",
                      title: "حدث خطأ",
                      text: "المعلم موجود بالفعل",
                      showConfirmButton: false,
                      timer: 1500,
                    });
                  }
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
                      إضافة معلم
                    </div>

                    <Field
                      name="teacherName"
                      type="text"
                      as={Input}
                      label="الاسم الكامل للمعلم"
                      aria-label="الاسم الكامل للمعلم"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.teacherName}
                    />
                    <ErrorMessage
                      name="teacherName"
                      component="div"
                      className="text-red-500"
                    />

                    <Field
                      name="email"
                      type="email"
                      as={Input}
                      label="البريد الإلكتروني"
                      aria-label="البريد الإلكتروني"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.email}
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500"
                    />

                    <Field
                      name="phone"
                      type="tel"
                      as={Input}
                      label="رقم الهاتف"
                      aria-label="رقم الهاتف"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.phone}
                    />
                    <ErrorMessage
                      name="phone"
                      component="div"
                      className="text-red-500"
                    />
                    <div
                      className="
                    flex
                    relative
                    w-full
                    justify-between
                    items-center
                    
                    "
                    >
                      <Field
                        name="password"
                        type={showPassword ? "text" : "password"}
                        as={Input}
                        label="   كلمة المرور"
                        aria-label="  كلمة المرور"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.password}
                        endContent={
                          <button
                            className="focus:outline-none"
                            type="button"
                            onClick={togglePasswordVisibility}
                            aria-label="toggle password visibility"
                          >
                            {showPassword ? (
                              <FaEyeSlash className="text-2xl text-default-400 pointer-events-none" />
                            ) : (
                              <FaEye className="text-2xl text-default-400 pointer-events-none" />
                            )}
                          </button>
                        }
                      />

                      <ErrorMessage
                        name="password"
                        component="div"
                        className="text-red-500"
                      />
                    </div>

                    <div className="flex w-full gap-2 justify-between items-center">
                      <Button
                        type="submit"
                        className="w-full text-center text-white text-base font-semibold bg-indigo-500 rounded-2xl px-8 py-2"
                      >
                        إضافة
                      </Button>
                      <Button
                        type="button"
                        onClick={onClose}
                        onPress={onClose}
                        className="w-full text-center text-white text-base font-semibold bg-red-600 rounded-2xl px-8 py-2"
                      >
                        إلغاء
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default Teachers;
