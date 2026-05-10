import { Button } from "@nextui-org/react";
import {
  Document,
  PDFDownloadLink,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useRef } from "react";

// Styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2 solid #000",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    color: "#666",
  },
  section: {
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    borderBottom: "1 solid #eee",
    paddingVertical: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    width: "40%",
  },
  value: {
    fontSize: 12,
    width: "60%",
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottom: "2 solid #000",
    padding: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #eee",
    padding: 8,
  },
  tableCol: {
    fontSize: 10,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#666",
    borderTop: "1 solid #eee",
    paddingTop: 10,
  },
  totalSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
  },
});

// Receipt PDF Document Component
const ReceiptDocument = ({ receiptData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Receipt</Text>
        <Text style={styles.subtitle}>School Management System</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Receipt No:</Text>
          <Text style={styles.value}>{receiptData.receiptNo}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>
            {new Date(receiptData.date).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Student Name:</Text>
          <Text style={styles.value}>{receiptData.studentName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Parent Name:</Text>
          <Text style={styles.value}>{receiptData.parentName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Payment Method:</Text>
          <Text style={styles.value}>{receiptData.paymentMethod}</Text>
        </View>
      </View>

      {receiptData.items && receiptData.items.length > 0 && (
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCol, { width: "10%" }]}>#</Text>
            <Text style={[styles.tableCol, { width: "40%" }]}>
              Subject/Course
            </Text>
            <Text style={[styles.tableCol, { width: "15%" }]}>Level</Text>
            <Text style={[styles.tableCol, { width: "15%" }]}>Classes</Text>
            <Text
              style={[styles.tableCol, { width: "20%", textAlign: "right" }]}
            >
              Amount
            </Text>
          </View>
          {receiptData.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCol, { width: "10%" }]}>
                {index + 1}
              </Text>
              <Text style={[styles.tableCol, { width: "40%" }]}>
                {item.subject}
              </Text>
              <Text style={[styles.tableCol, { width: "15%" }]}>
                {item.level}
              </Text>
              <Text style={[styles.tableCol, { width: "15%" }]}>
                {item.classes}
              </Text>
              <Text
                style={[styles.tableCol, { width: "20%", textAlign: "right" }]}
              >
                ${item.amount.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.totalSection}>
        <Text style={styles.totalText}>
          Total Amount: ${receiptData.totalAmount.toFixed(2)}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text>Thank you for your payment!</Text>
        <Text>For inquiries, please contact: info@school.com</Text>
      </View>
    </Page>
  </Document>
);

// Main Receipt Component
const ReceiptPrint = ({ receiptData, onClose }) => {
  const printRef = useRef();

  const handlePrintJsPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Payment Receipt", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("School Management System", 105, 28, { align: "center" });

    // Receipt details
    doc.setFontSize(12);
    let yPos = 45;

    doc.setFont("helvetica", "bold");
    doc.text("Receipt No:", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(receiptData.receiptNo, 70, yPos);

    yPos += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Date:", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(new Date(receiptData.date).toLocaleDateString(), 70, yPos);

    yPos += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Student Name:", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(receiptData.studentName, 70, yPos);

    yPos += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Parent Name:", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(receiptData.parentName, 70, yPos);

    yPos += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Payment Method:", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(receiptData.paymentMethod, 70, yPos);

    // Items table
    if (receiptData.items && receiptData.items.length > 0) {
      yPos += 15;

      const tableData = receiptData.items.map((item, index) => [
        (index + 1).toString(),
        item.subject,
        item.level,
        item.classes.toString(),
        `$${item.amount.toFixed(2)}`,
      ]);

      doc.autoTable({
        startY: yPos,
        head: [["#", "Subject/Course", "Level", "Classes", "Amount"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [66, 66, 66] },
      });

      yPos = doc.lastAutoTable.finalY + 10;
    }

    // Total
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Total Amount: $${receiptData.totalAmount.toFixed(2)}`,
      190,
      yPos,
      { align: "right" }
    );

    // Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for your payment!", 105, 280, { align: "center" });
    doc.text("For inquiries, please contact: info@school.com", 105, 287, {
      align: "center",
    });

    // Save PDF
    doc.save(`Receipt_${receiptData.receiptNo}.pdf`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Receipt Preview</h3>
        <div className="flex gap-2">
          <PDFDownloadLink
            document={<ReceiptDocument receiptData={receiptData} />}
            fileName={`Receipt_${receiptData.receiptNo}.pdf`}
          >
            {({ loading }) => (
              <Button color="primary" isLoading={loading}>
                Download PDF (React-PDF)
              </Button>
            )}
          </PDFDownloadLink>

          <Button color="success" onPress={handlePrintJsPDF}>
            Download PDF (jsPDF)
          </Button>

          <Button color="default" variant="light" onPress={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div
        ref={printRef}
        className="bg-white p-8 border rounded-lg shadow-lg max-w-4xl mx-auto"
      >
        <div className="border-b-2 border-black pb-4 mb-6">
          <h1 className="text-3xl font-bold text-center mb-2">
            Payment Receipt
          </h1>
          <p className="text-center text-gray-600">School Management System</p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex">
            <span className="font-bold w-40">Receipt No:</span>
            <span>{receiptData.receiptNo}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-40">Date:</span>
            <span>{new Date(receiptData.date).toLocaleDateString()}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-40">Student Name:</span>
            <span>{receiptData.studentName}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-40">Parent Name:</span>
            <span>{receiptData.parentName}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-40">Payment Method:</span>
            <span>{receiptData.paymentMethod}</span>
          </div>
        </div>

        {receiptData.items && receiptData.items.length > 0 && (
          <table className="w-full mb-6">
            <thead className="bg-gray-200 border-b-2 border-black">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Subject/Course</th>
                <th className="p-2 text-left">Level</th>
                <th className="p-2 text-left">Classes</th>
                <th className="p-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {receiptData.items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">{item.subject}</td>
                  <td className="p-2">{item.level}</td>
                  <td className="p-2">{item.classes}</td>
                  <td className="p-2 text-right">${item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="bg-gray-100 p-4 rounded">
          <p className="text-xl font-bold text-right">
            Total Amount: ${receiptData.totalAmount.toFixed(2)}
          </p>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600 border-t pt-4">
          <p>Thank you for your payment!</p>
          <p>For inquiries, please contact: info@school.com</p>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPrint;
