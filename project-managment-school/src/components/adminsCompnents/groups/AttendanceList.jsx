import { Button } from "@nextui-org/react";
import { useRef } from "react";
import * as XLSX from "xlsx";

const AttendanceList = ({ groupData, students, date }) => {
  const printRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  const dateLabel = new Date(date).toLocaleDateString().replace(/\//g, "-");

  // Translate the stored status to a readable label (used for export)
  const statusLabel = (s) =>
    ({ present: "حاضر", absent: "غائب", late: "متأخر", excused: "بعذر" }[s] || "");

  // Export the attendance list to an Excel (.xlsx) file
  const handleExportExcel = () => {
    const rows = students.map((student, index) => ({
      "#": index + 1,
      "اسم التلميذ": student.fullName || student.name,
      "رمز التلميذ": student.studentId || student.id,
      "الحالة": statusLabel(student.status),
      "ملاحظات": student.notes || "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    // Header info rows above the table
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [`الفوج: ${groupData?.name || ""}`],
        [`الأستاذ: ${groupData?.teacher || ""}`],
        [`المادة: ${groupData?.subject || ""}`],
        [`التاريخ: ${new Date(date).toLocaleDateString()}`],
        [
          `التوقيت: ${groupData?.startTime || ""} - ${groupData?.endTime || ""}`,
        ],
        [],
      ],
      { origin: "A1" }
    );
    // Push the table down below the header info (rewrite table at row 7)
    XLSX.utils.sheet_add_json(ws, rows, { origin: "A7" });
    ws["!cols"] = [{ wch: 5 }, { wch: 30 }, { wch: 14 }, { wch: 12 }, { wch: 30 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `Attendance_${groupData?.name || "group"}_${dateLabel}.xlsx`);
  };

  // Export the attendance list to a Word (.doc) file using an HTML document
  const handleExportWord = () => {
    const tableRows = students
      .map(
        (student, index) =>
          `<tr>
            <td>${index + 1}</td>
            <td>${student.fullName || student.name || ""}</td>
            <td>${student.studentId || student.id || ""}</td>
            <td>${statusLabel(student.status)}</td>
            <td>${student.notes || ""}</td>
          </tr>`
      )
      .join("");

    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>قائمة الحضور</title></head>
      <body dir='rtl'>
        <h2 style="text-align:center;">قائمة الحضور والغياب</h2>
        <p><strong>الفوج:</strong> ${groupData?.name || ""}<br/>
           <strong>الأستاذ:</strong> ${groupData?.teacher || ""}<br/>
           <strong>المادة:</strong> ${groupData?.subject || ""}<br/>
           <strong>التاريخ:</strong> ${new Date(date).toLocaleDateString()}<br/>
           <strong>التوقيت:</strong> ${groupData?.startTime || ""} - ${groupData?.endTime || ""}</p>
        <table border='1' cellspacing='0' cellpadding='5' style="border-collapse:collapse;width:100%;" dir='rtl'>
          <thead>
            <tr style="background:#e5e7eb;">
              <th>#</th><th>اسم التلميذ</th><th>رمز التلميذ</th><th>الحالة</th><th>ملاحظات</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body></html>`;

    const blob = new Blob(["﻿", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Attendance_${groupData?.name || "group"}_${dateLabel}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4 no-print" dir="rtl">
        <h3 className="text-xl font-bold">قائمة الحضور والغياب</h3>
        <div className="flex gap-2">
          <Button color="secondary" onPress={handleExportExcel}>
            تصدير Excel
          </Button>
          <Button color="warning" className="text-white" onPress={handleExportWord}>
            تصدير Word
          </Button>
          <Button color="success" onPress={handlePrint}>
            طباعة / حفظ PDF
          </Button>
        </div>
      </div>

      {/* Printable Content */}
      <div ref={printRef} className="bg-white p-8 print:p-0">
        <style>
          {`
            @media print {
              .no-print {
                display: none !important;
              }
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              @page {
                size: A4;
                margin: 1cm;
              }
            }
          `}
        </style>

        {/* Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-3xl font-bold mb-2">قائمة الحضور والغياب</h1>
          <p className="text-sm text-gray-600">نظام إدارة المدرسة</p>
        </div>

        {/* Group Information */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm" dir="rtl">
          <div>
            <p>
              <strong>الفوج:</strong> {groupData.name}
            </p>
            <p>
              <strong>الأستاذ:</strong> {groupData.teacher}
            </p>
            <p>
              <strong>المادة:</strong> {groupData.subject}
            </p>
          </div>
          <div>
            <p>
              <strong>التاريخ:</strong> {new Date(date).toLocaleDateString()}
            </p>
            <p>
              <strong>التوقيت:</strong> {groupData.startTime} - {groupData.endTime}
            </p>
            <p>
              <strong>القاعة:</strong> {groupData.room || "غير محدد"}
            </p>
          </div>
        </div>

        {/* Attendance Table */}
        <table className="w-full border-collapse border-2 border-black" dir="rtl">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-2 text-right w-10">#</th>
              <th className="border border-black p-2 text-right">
                اسم التلميذ
              </th>
              <th className="border border-black p-2 text-right w-24">
                رمز التلميذ
              </th>
              <th className="border border-black p-2 text-center w-16">
                حاضر
              </th>
              <th className="border border-black p-2 text-center w-16">
                غائب
              </th>
              <th className="border border-black p-2 text-center w-16">متأخر</th>
              <th className="border border-black p-2 text-right w-32">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="border border-black p-2 text-center">
                  {index + 1}
                </td>
                <td className="border border-black p-2">
                  {student.fullName || student.name}
                </td>
                <td className="border border-black p-2 text-center">
                  {student.studentId || student.id}
                </td>
                <td className="border border-black p-2">
                  <div className="w-4 h-4 border-2 border-black mx-auto"></div>
                </td>
                <td className="border border-black p-2">
                  <div className="w-4 h-4 border-2 border-black mx-auto"></div>
                </td>
                <td className="border border-black p-2">
                  <div className="w-4 h-4 border-2 border-black mx-auto"></div>
                </td>
                <td className="border border-black p-2"></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary and Signature Section */}
        <div className="mt-8 grid grid-cols-2 gap-8" dir="rtl">
          <div>
            <p className="mb-2">
              <strong>إمضاء الأستاذ:</strong>
            </p>
            <div className="border-b-2 border-black w-48 mb-4"></div>
            <p className="mb-2">
              <strong>التاريخ:</strong>
            </p>
            <div className="border-b-2 border-black w-48"></div>
          </div>
          <div>
            <p className="mb-2">
              <strong>الملخص:</strong>
            </p>
            <div className="space-y-2">
              <p>
                مجموع التلاميذ: <strong>{students.length}</strong>
              </p>
              <p>الحاضرون: __________</p>
              <p>الغائبون: __________</p>
              <p>المتأخرون: __________</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-600 border-t pt-4">
          <p>هذه وثيقة حضور رسمية</p>
          <p>يرجى التأكد من ملء جميع الحقول بدقة</p>
        </div>
      </div>
    </div>
  );
};

export default AttendanceList;
