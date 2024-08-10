import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Select,
  SelectItem,
  Button,
  Spinner,
  Modal,
  ModalContent,
  useDisclosure,
  Pagination,
} from "@nextui-org/react";
import * as Yup from "yup";
import { Form, Link, useLocation, useNavigate } from "react-router-dom";

import { ErrorMessage, Field, Formik } from "formik";
import { Input } from "@nextui-org/react";
import Swal from "sweetalert2";
import { IoIosAddCircle } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { FaEye, FaEyeSlash, FaSearch } from "react-icons/fa";
import {
  getAllTeachers,
  addTeacherApi,
  searchTeacherApi,
} from "../../apiCalls/teacherCalls";
// import { getAllSubjects } from "../../apiCalls/subjectCalls";

function FinancialTeachers() {
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
    const newList = await getAllTeachers();
    setTeachers(newList);
    setLoadingTeachers(false);
  };

  useEffect(() => {
    fetchTeachers();
    // fetchSubjects();
  }, []);

  const handleSearch = async () => {
    if (searchTeacher === "") {
      return fetchTeachers();
    }
    const newList = await searchTeacherApi(searchTeacher);
    setTeachers(newList);
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
        <div>
          <Button
            onClick={(e) => {
              e.preventDefault();
              nav("TransitionDone");
            }}
            color="success"
            className="text-white px-3"
          >
            رؤية التحويلات النمرسلة للأستاذ
          </Button>
        </div>
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
            <Table className="min-h-[60vh] " isHeaderSticky>
              <TableHeader>
                <TableColumn key="id">رمز المعلم</TableColumn>
                <TableColumn key="fullName">اسم المعلم</TableColumn>
                <TableColumn key="phoneNumber">رقم الهاتف </TableColumn>
              </TableHeader>
              <TableBody items={teachers}>
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
                        {getKeyValue(item, columnKey)}
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

export default FinancialTeachers;
