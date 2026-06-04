import {
  Button,
  Chip,
  getKeyValue,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import "jspdf-autotable";

import { useEffect, useState } from "react";
import { BiCheck } from "react-icons/bi";
import { FaCheck, FaDownload, FaPrint, FaTimes } from "react-icons/fa";
import { IoAdd } from "react-icons/io5";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { getGroupById, updateGroupStatus } from "../../apiCalls/GroupsCals";
import { getSchedule } from "../../apiCalls/scheduleCalls";
import { addSessionToGroup, getSession } from "../../apiCalls/sessionCalls";
import { deleteStudentFropmGroup } from "../../apiCalls/studentCalls";
import { getAllTeachers } from "../../apiCalls/teacherCalls";
import { font } from "../../assets/Cairo-VariableFont_slnt,wght-normal";
import LineAddTime from "../../components/adminsCompnents/groups/LineAddTime";

import pdfMake from "pdfmake/build/pdfmake";
import { format } from "date-fns/format";

// Now you can use pdfMake as usual

function TeacherGoupe() {
  const [group, setGroup] = useState({});
  const { teacherGroupsParams } = useParams();
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(group.isCompleted);
  const [schedule, setSchedule] = useState([]);

  const [lines, setLines] = useState([]);
  const [student, setStudent] = useState([]);
  const [present, setPresent] = useState([]);

  const [data, setData] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [select, setSelect] = useState([]);
  const [newSession, setNewSession] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };
  function formatDate(date) {
    if (!date || !date.year || !date.month || !date.day) return "";
    const year = date.year;
    const month = date.month.toString().padStart(2, "0"); // Ensure two-digit format
    const day = date.day.toString().padStart(2, "0"); // Ensure two-digit format
    return `${year}-${month}-${day}`;
  }

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
        { text: item.birthDay, style: "cell" },
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
            `الاستاذ  : ${group?.Teachers?.slice(-1)[0]?.name}`
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

    const response = await getGroupById(teacherGroupsParams);
    setGroup(response);
    setLines(response.schedules);
    setIsCompleted(response.isCompleted);
    console.log(response);
    setStudent(response.students);
    // setPresent(response.students);
    setLoading(false);
    response.schedules.map(async (item) => {
      const response = await getSchedule(item.id);
      setSchedule([...schedule, response]);
    });
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
  useEffect(() => {
    fatchGroup();
    fetchAllTeachers();
  }, []);

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
        "تاريخ الميلاد": item.birthDay,
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
  const handleSelectionChange = (keys) => {
    setSelectedKeys(keys);
    if (keys == "all") {
      setSelect(student.map((item) => ({ id: item.id })));
      return;
    }
    // Convert Set to Array
    const selectedKeysArray = Array.from(keys);
    // Optionally convert to an array of objects with id properties if needed
    const selectedItems = selectedKeysArray.map((id) => ({ id }));
    // Update state or handle the selected IDs
    setSelect(selectedItems);
  };
  const handlePresent = async () => {
    Swal.fire({
      position: "center",
      icon: "success",
      title: "هل انت متأكد من تسجيل الحضور؟",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "نعم, سجل الحضور",
      cancelButtonText: "الغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await addSessionToGroup(group.id, select);
        if (response) {
          fatchGroup();
          Swal.fire({
            position: "center",
            icon: "success",
            title: "تم تسجيل الحضور بنجاح",
            showConfirmButton: false,
            timer: 1500,
          });
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
  };
  // Function to handle the click event
  const handleChipClick = async (sessionId) => {
    console.log("Session keys :", selectedKeys);
    if (sessionId) {
      setNewSession(false);
      const session = await getSession(sessionId);
      // Do something with the session ID
      console.log("Session:", session);
      const studentIdsSet = new Set(
        session.session?.students.map((student) => student.id)
      );

      console.log("Session ID:", studentIdsSet);
      setSelectedKeys(studentIdsSet);
      setPresent(session.session?.students);
    } else {
      setSelectedKeys(new Set());
      setNewSession(true);
      console.log("No session for this chip.");
    }
  };
  const allKeys = new Set(student.map((student) => student.id));

  useEffect(() => {
    console.log(selectedKeys);
  }, [selectedKeys]);
  if (loading) {
    return (
      <div className="w-full h-full ">
        <Spinner className="mx-auto" />
      </div>
    );
  } else {
    return (
      <div>
        <div className="flex sticky top-0 left-0 z-30    items-center p-4 mb-4   text-red-800 border-t-4 border-red-300 bg-red-50 dark:text-red-400 dark:bg-gray-800 dark:border-red-800">
          <p className="ml-3 ">
            يسمح بتسجيل الحضور مرة واحدة في كل حصة ولا يسمح بالتعديل ولا الحذف{" "}
          </p>
        </div>
        <div className="relative">
          <div className="flex  max-md:flex-col justify-between items-center">
            <div className="text-3xl max-md:py-4 font-bold">
              الفوج {group?.name || "غير متوفر"}
            </div>
            <div className="flex  max-md:flex-col gap-3">
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
          <div className="text-xl py-3 font-bold">
            <div>توقيت الدورة:</div>
            <div className="w-full py-3 ">
              {!Array.isArray(lines) == 0 && group.schedules.length === 0 ? (
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
                      teacher={true}
                    />
                  ))
              )}
            </div>
          </div>
          <div>
            <h1> الحصص</h1>
            <div className="flex justify-start items-center flex-wrap gap-2">
              {Array.from({ length: group.numberOfSessions }).map(
                (_, index) => (
                  <div
                    className="flex justify-start items-center gap-2"
                    key={index}
                  >
                    {group?.sessions?.length > index ? (
                      // Check if the session is in the list
                      <div className="flex flex-col items-center">
                        <Chip
                          className="flex justify-start items-center p-2 cursor-pointer"
                          startContent={<BiCheck size={20} />}
                          color="success"
                          onClick={() =>
                            handleChipClick(group.sessions[index].id)
                          } // Pass the session ID
                        >
                          الحصة {index + 1}
                        </Chip>
                        {(group.sessions[index].sessionDate ||
                          group.sessions[index].sessionTime) && (
                          <span className="text-[10px] text-gray-500 mt-1">
                            {group.sessions[index].sessionDate}
                            {group.sessions[index].sessionTime
                              ? ` • ${String(
                                  group.sessions[index].sessionTime
                                ).slice(0, 5)}`
                              : ""}
                          </span>
                        )}
                      </div>
                    ) : (
                      <Chip
                        className="flex justify-start items-center p-2 cursor-pointer"
                        startContent={<BiCheck size={20} />}
                        color="error"
                        onClick={() => handleChipClick(null)} // Handle the case where there's no session ID
                      >
                        الحصة {index + 1}
                      </Chip>
                    )}
                  </div>
                )
              )}
            </div>
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
          {student?.length === 0 ? (
            <div className="text-center text-2xl font-bold text-red-500">
              لا يوجد طلاب في هذا الفوج
            </div>
          ) : (
            <Table
              isHeaderSticky
              selectionMode="multiple" // Enable multiple selection
              onSelectionChange={handleSelectionChange}
              selectedKeys={selectedKeys}
              disabledKeys={!newSession ? allKeys : []}

              // Disable selection for specific keys
            >
              <TableHeader>
                <TableColumn key="index">رقم التلميذ</TableColumn>
                <TableColumn key="id">رمز التلميذ</TableColumn>
                <TableColumn key="fullName">اسم التلميذ</TableColumn>
                <TableColumn key="birthDay">تاريخ الميلاد</TableColumn>
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
                  >
                    {(columnKey) => (
                      <TableCell className="text-right h-7">
                        {columnKey === "index" &&
                          parseInt(student.indexOf(item)) + 1}
                        {columnKey === "action" ? (
                          <div className="flex "></div>
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
          {group?.sessions?.length === group.numberOfSessions ? (
            <div className="text-center text-2xl font-bold text-red-500">
              تم اكتمال الحصص
            </div>
          ) : (
            newSession && (
              <Button
                color="success"
                className=" text-white font-bold"
                onClick={handlePresent}
              >
                تسجيل حضور
                <IoAdd />
              </Button>
            )
          )}
        </div>
      </div>
    );
  }
}

export default TeacherGoupe;
