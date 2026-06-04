import { Button } from "@nextui-org/react";
import { useRef } from "react";
import schoolInfo from "../../../config/schoolInfo";

// Safe number formatting helper
const money = (v) => `${(Number(v) || 0).toFixed(2)} ${schoolInfo.currency}`;

// Derive paid / remaining from receiptData with sensible fallbacks
const deriveAmounts = (r) => {
  const total = Number(r.totalAmount) || 0;
  const paid = r.paidAmount === undefined || r.paidAmount === null ? total : Number(r.paidAmount) || 0;
  const remaining =
    r.remainingAmount === undefined || r.remainingAmount === null
      ? Math.max(total - paid, 0)
      : Number(r.remainingAmount) || 0;
  return { total, paid, remaining };
};

// Main Receipt Component
const ReceiptPrint = ({ receiptData, onClose }) => {
  const printRef = useRef();
  const { total, paid, remaining } = deriveAmounts(receiptData);

  const handlePrint = () => window.print();

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex justify-between items-center mb-4 no-print">
        <h3 className="text-xl font-bold">معاينة الوصل</h3>
        <div className="flex gap-2">
          <Button color="primary" onPress={handlePrint}>
            طباعة / حفظ PDF
          </Button>
          <Button color="default" variant="light" onPress={onClose}>
            إغلاق
          </Button>
        </div>
      </div>

      {/* Printable Content */}
      <div
        ref={printRef}
        className="bg-white p-8 border rounded-lg shadow-lg max-w-4xl mx-auto print:shadow-none print:border-0"
      >
        <style>
          {`@media print { .no-print { display: none !important; } @page { size: A4; margin: 1cm; } }`}
        </style>

        {/* School header with logo */}
        <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
          <img
            src={schoolInfo.logo}
            alt="logo"
            className="h-20 w-20 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="text-center flex-grow">
            <h1 className="text-2xl font-bold">{schoolInfo.name}</h1>
            <p className="text-sm text-gray-600">{schoolInfo.address}</p>
            <p className="text-sm text-gray-600">
              {schoolInfo.phones.join(" / ")}
            </p>
            {schoolInfo.email && (
              <p className="text-sm text-gray-600">{schoolInfo.email}</p>
            )}
          </div>
          <div className="h-20 w-20" />
        </div>

        <h2 className="text-xl font-bold text-center mb-4">وصل دفع</h2>

        <div className="space-y-3 mb-6">
          <div className="flex">
            <span className="font-bold w-40">رقم الوصل:</span>
            <span>{receiptData.receiptNo}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-40">التاريخ:</span>
            <span>{new Date(receiptData.date).toLocaleDateString()}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-40">اسم التلميذ:</span>
            <span>{receiptData.studentName}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-40">اسم الولي:</span>
            <span>{receiptData.parentName}</span>
          </div>
          {receiptData.parentPhone && (
            <div className="flex">
              <span className="font-bold w-40">هاتف الولي:</span>
              <span>{receiptData.parentPhone}</span>
            </div>
          )}
          <div className="flex">
            <span className="font-bold w-40">طريقة الدفع:</span>
            <span>{receiptData.paymentMethod}</span>
          </div>
        </div>

        {receiptData.items && receiptData.items.length > 0 && (
          <table className="w-full mb-6">
            <thead className="bg-gray-200 border-b-2 border-black">
              <tr>
                <th className="p-2 text-right">#</th>
                <th className="p-2 text-right">المادة</th>
                <th className="p-2 text-right">المستوى</th>
                <th className="p-2 text-right">الحصص</th>
                <th className="p-2 text-left">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {receiptData.items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">{item.subject}</td>
                  <td className="p-2">{item.level}</td>
                  <td className="p-2">{item.classes}</td>
                  <td className="p-2 text-left">{money(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="bg-gray-100 p-4 rounded space-y-1">
          <p className="flex justify-between text-lg">
            <span className="font-semibold">المجموع:</span>
            <span className="font-bold">{money(total)}</span>
          </p>
          <p className="flex justify-between text-lg">
            <span className="font-semibold">المدفوع:</span>
            <span className="font-bold text-green-600">{money(paid)}</span>
          </p>
          <p className="flex justify-between text-lg">
            <span className="font-semibold">الباقي:</span>
            <span
              className={`font-bold ${
                remaining > 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {money(remaining)}
            </span>
          </p>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600 border-t pt-4">
          <p>شكراً لثقتكم بنا</p>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPrint;
