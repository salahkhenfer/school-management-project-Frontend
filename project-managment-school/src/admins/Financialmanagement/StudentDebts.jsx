import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  addInstallment,
  getDebts,
  getReceiptById,
} from "../../apiCalls/receiptCalls";
import ReceiptPrint from "../../components/adminsCompnents/Financialmanagement/ReceiptPrint";

const money = (v) => `${(Number(v) || 0).toFixed(2)} DA`;

const StudentDebts = () => {
  const [debts, setDebts] = useState([]);
  const [summary, setSummary] = useState({ count: 0, totalDebt: "0.00" });
  const [loading, setLoading] = useState(true);

  // installment modal
  const [payTarget, setPayTarget] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [paying, setPaying] = useState(false);

  // receipt preview
  const [receiptData, setReceiptData] = useState(null);

  const fetchDebts = async () => {
    setLoading(true);
    try {
      const res = await getDebts();
      setDebts(res?.data || []);
      setSummary(res?.summary || { count: 0, totalDebt: "0.00" });
    } catch (error) {
      console.error("Error fetching debts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  const handlePay = async () => {
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) {
      Swal.fire({ icon: "warning", title: "مبلغ غير صالح", text: "أدخل مبلغاً موجباً" });
      return;
    }
    setPaying(true);
    try {
      await addInstallment(payTarget.id, { amount, method: "cash" });
      Swal.fire({ icon: "success", title: "تم التسجيل", text: "تم تسجيل الدفعة" });
      setPayTarget(null);
      setPayAmount("");
      fetchDebts();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: error.response?.data?.message || "فشل تسجيل الدفعة",
      });
    } finally {
      setPaying(false);
    }
  };

  const handlePrint = async (receiptId) => {
    try {
      const res = await getReceiptById(receiptId); // hits /receipts/detail/:id
      setReceiptData(res?.data || res);
    } catch (error) {
      Swal.fire({ icon: "error", title: "خطأ", text: "فشل تحميل الوصل" });
    }
  };

  if (receiptData) {
    return (
      <Modal isOpen onClose={() => setReceiptData(null)} size="5xl" scrollBehavior="inside">
        <ModalContent>
          <ModalBody className="p-6">
            <ReceiptPrint receiptData={receiptData} onClose={() => setReceiptData(null)} />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <div className="p-6" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">قائمة الديون</h2>
        <div className="bg-red-50 px-4 py-2 rounded-lg">
          <span className="text-sm text-gray-600">إجمالي الديون: </span>
          <span className="font-bold text-red-600">{money(summary.totalDebt)}</span>
          <span className="text-sm text-gray-500"> ({summary.count})</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : debts.length === 0 ? (
        <p className="text-center text-gray-500 py-10">لا توجد ديون مستحقة 🎉</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-right">الوصل</th>
                <th className="p-3 text-right">التلميذ</th>
                <th className="p-3 text-right">هاتف الولي</th>
                <th className="p-3 text-left">المجموع</th>
                <th className="p-3 text-left">المدفوع</th>
                <th className="p-3 text-left">الباقي</th>
                <th className="p-3 text-center">العمليات</th>
              </tr>
            </thead>
            <tbody>
              {debts.map((d) => (
                <tr key={d.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{d.receiptNo}</td>
                  <td className="p-3">{d.student?.fullName || "غير متوفر"}</td>
                  <td className="p-3">{d.student?.parent?.phoneNumber || "-"}</td>
                  <td className="p-3 text-left">{money(d.totalAmount)}</td>
                  <td className="p-3 text-left text-green-600">{money(d.paidAmount)}</td>
                  <td className="p-3 text-left text-red-600 font-bold">
                    {money(d.remainingAmount)}
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <Button
                      size="sm"
                      color="primary"
                      className="ml-2"
                      onPress={() => {
                        setPayTarget(d);
                        setPayAmount("");
                      }}
                    >
                      دفع قسط
                    </Button>
                    <Button size="sm" variant="bordered" onPress={() => handlePrint(d.id)}>
                      طباعة
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Installment modal */}
      <Modal isOpen={Boolean(payTarget)} onClose={() => setPayTarget(null)}>
        <ModalContent dir="rtl">
          <ModalHeader>
            دفع قسط {payTarget ? `- ${payTarget.receiptNo}` : ""}
          </ModalHeader>
          <ModalBody>
            {payTarget && (
              <div className="space-y-3">
                <p>
                  الباقي:{" "}
                  <strong className="text-red-600">{money(payTarget.remainingAmount)}</strong>
                </p>
                <Input
                  type="number"
                  min={0}
                  label="المبلغ المراد دفعه الآن"
                  value={payAmount}
                  onValueChange={setPayAmount}
                />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" color="danger" onPress={() => setPayTarget(null)}>
              إلغاء
            </Button>
            <Button color="primary" onPress={handlePay} isLoading={paying}>
              تسجيل الدفعة
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default StudentDebts;
