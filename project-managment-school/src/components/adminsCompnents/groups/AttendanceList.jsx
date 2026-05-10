import { Button } from "@nextui-org/react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useRef } from "react";

const AttendanceList = ({ groupData, students, date }) => {
  const printRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Attendance List", 105, 20, { align: "center" });

    // Group Information
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Group: ${groupData.name}`, 20, 35);
    doc.text(`Teacher: ${groupData.teacher}`, 20, 42);
    doc.text(`Subject: ${groupData.subject}`, 20, 49);
    doc.text(`Date: ${new Date(date).toLocaleDateString()}`, 20, 56);
    doc.text(`Time: ${groupData.startTime} - ${groupData.endTime}`, 20, 63);

    // Attendance Table
    const tableData = students.map((student, index) => [
      (index + 1).toString(),
      student.fullName || student.name,
      student.studentId || student.id,
      "", // Present checkbox
      "", // Absent checkbox
      "", // Late checkbox
      "", // Notes
    ]);

    doc.autoTable({
      startY: 75,
      head: [
        [
          "#",
          "Student Name",
          "Student ID",
          "Present",
          "Absent",
          "Late",
          "Notes",
        ],
      ],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [66, 66, 66],
        fontSize: 10,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
        3: { cellWidth: 18 },
        4: { cellWidth: 18 },
        5: { cellWidth: 18 },
        6: { cellWidth: 45 },
      },
      margin: { left: 10, right: 10 },
    });

    // Footer with signature lines
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.text("Teacher Signature: ___________________", 20, finalY);
    doc.text("Date: ___________________", 20, finalY + 10);

    // Summary
    doc.text(`Total Students: ${students.length}`, 120, finalY);
    doc.text("Present: _______", 120, finalY + 10);
    doc.text("Absent: _______", 120, finalY + 20);

    // Save PDF
    doc.save(
      `Attendance_${groupData.name}_${new Date(date)
        .toLocaleDateString()
        .replace(/\//g, "-")}.pdf`
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4 no-print">
        <h3 className="text-xl font-bold">Attendance List</h3>
        <div className="flex gap-2">
          <Button color="primary" onPress={handleDownloadPDF}>
            Download PDF
          </Button>
          <Button color="success" onPress={handlePrint}>
            Print
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
          <h1 className="text-3xl font-bold mb-2">Attendance List</h1>
          <p className="text-sm text-gray-600">School Management System</p>
        </div>

        {/* Group Information */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p>
              <strong>Group:</strong> {groupData.name}
            </p>
            <p>
              <strong>Teacher:</strong> {groupData.teacher}
            </p>
            <p>
              <strong>Subject:</strong> {groupData.subject}
            </p>
          </div>
          <div>
            <p>
              <strong>Date:</strong> {new Date(date).toLocaleDateString()}
            </p>
            <p>
              <strong>Time:</strong> {groupData.startTime} - {groupData.endTime}
            </p>
            <p>
              <strong>Room:</strong> {groupData.room || "N/A"}
            </p>
          </div>
        </div>

        {/* Attendance Table */}
        <table className="w-full border-collapse border-2 border-black">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-2 text-left w-10">#</th>
              <th className="border border-black p-2 text-left">
                Student Name
              </th>
              <th className="border border-black p-2 text-left w-24">
                Student ID
              </th>
              <th className="border border-black p-2 text-center w-16">
                Present
              </th>
              <th className="border border-black p-2 text-center w-16">
                Absent
              </th>
              <th className="border border-black p-2 text-center w-16">Late</th>
              <th className="border border-black p-2 text-left w-32">Notes</th>
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
        <div className="mt-8 grid grid-cols-2 gap-8">
          <div>
            <p className="mb-2">
              <strong>Teacher Signature:</strong>
            </p>
            <div className="border-b-2 border-black w-48 mb-4"></div>
            <p className="mb-2">
              <strong>Date:</strong>
            </p>
            <div className="border-b-2 border-black w-48"></div>
          </div>
          <div>
            <p className="mb-2">
              <strong>Summary:</strong>
            </p>
            <div className="space-y-2">
              <p>
                Total Students: <strong>{students.length}</strong>
              </p>
              <p>Present: __________</p>
              <p>Absent: __________</p>
              <p>Late: __________</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-600 border-t pt-4">
          <p>This is an official attendance document</p>
          <p>Please ensure all fields are completed accurately</p>
        </div>
      </div>
    </div>
  );
};

export default AttendanceList;
