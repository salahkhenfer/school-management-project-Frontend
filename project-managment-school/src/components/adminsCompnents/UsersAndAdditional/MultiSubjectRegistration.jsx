import {
  Button,
  Card,
  CardBody,
  Checkbox,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getCourses } from "../../../apiCalls/coursesCalls";
import { generateCombinedReceipt } from "../../../apiCalls/receiptCalls";
import ReceiptPrint from "../Financialmanagement/ReceiptPrint";

const MultiSubjectRegistration = ({ studentId, isOpen, onClose }) => {
  const [subjects, setSubjects] = useState([]);
  // selected: { [courseId]: { amount, classes } }
  const [selected, setSelected] = useState({});
  const [paidAmount, setPaidAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSubjects();
      setSelected({});
      setPaidAmount("");
      setShowReceipt(false);
      setReceiptData(null);
    }
  }, [isOpen]);

  const fetchSubjects = async () => {
    try {
      const data = await getCourses();
      // getCourses returns the array directly (may be undefined on error)
      setSubjects(Array.isArray(data) ? data : data?.courses || data?.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const toggleSubject = (course, checked) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (checked) {
        next[course.id] = { amount: course.price || "", classes: course.totalClasses || 0 };
      } else {
        delete next[course.id];
      }
      return next;
    });
  };

  const setAmount = (courseId, amount) => {
    setSelected((prev) => ({
      ...prev,
      [courseId]: { ...prev[courseId], amount },
    }));
  };

  const selectedIds = Object.keys(selected);
  const calculateTotal = () =>
    selectedIds.reduce((t, id) => t + (parseFloat(selected[id].amount) || 0), 0);

  const buildSubjectsPayload = () =>
    selectedIds.map((id) => {
      const course = subjects.find((s) => String(s.id) === String(id));
      return {
        subject: course?.name || "Unknown",
        level: course?.level || "",
        classes: selected[id].classes || 0,
        amount: parseFloat(selected[id].amount) || 0,
      };
    });

  const handleRegister = async () => {
    if (selectedIds.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "لم يتم اختيار أي مادة",
        text: "يرجى اختيار مادة واحدة على الأقل للتسجيل",
      });
      return;
    }

    const total = calculateTotal();
    const paid = paidAmount === "" ? total : parseFloat(paidAmount) || 0;

    setLoading(true);
    try {
      const subjectsPayload = buildSubjectsPayload();
      const response = await generateCombinedReceipt(studentId, subjectsPayload, {
        paymentMethod: "cash",
        paidAmount: paid,
      });

      const r = response.data || response;
      const receipt = {
        receiptNo: r.receiptNo,
        date: r.date || new Date().toISOString(),
        studentName: r.student?.fullName || "N/A",
        parentName: r.parent?.fullName || "N/A",
        paymentMethod: r.paymentMethod || "cash",
        items: r.items || subjectsPayload,
        totalAmount: r.totalAmount ?? total,
        paidAmount: r.paidAmount ?? paid,
        remainingAmount: r.remainingAmount ?? Math.max(total - paid, 0),
        status: r.status,
      };

      setReceiptData(receipt);
      setShowReceipt(true);

      Swal.fire({
        icon: "success",
        title: "تم بنجاح!",
        text: "تم تسجيل التلميذ في المواد المختارة",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: error.response?.data?.message || "فشل تسجيل التلميذ",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setSelected({});
    setPaidAmount("");
    onClose();
  };

  if (showReceipt && receiptData) {
    return (
      <Modal isOpen={isOpen} onClose={handleCloseReceipt} size="5xl" scrollBehavior="inside">
        <ModalContent>
          <ModalBody className="p-6">
            <ReceiptPrint receiptData={receiptData} onClose={handleCloseReceipt} />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  const total = calculateTotal();
  const paidPreview = paidAmount === "" ? total : parseFloat(paidAmount) || 0;
  const remainingPreview = Math.max(total - paidPreview, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent dir="rtl">
        <ModalHeader>
          <h3 className="text-xl font-bold">التسجيل في عدة مواد</h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-gray-600">
              اختر المواد (مثل العربية، الفرنسية، الإنجليزية، الرياضيات)، وحدد مبلغ كل
              مادة، ثم أدخل المبلغ المدفوع الآن. سيتم إنشاء وصل واحد يوضح المبلغ المدفوع
              والباقي.
            </p>

            <div className="grid grid-cols-1 gap-3">
              {subjects.map((subject) => {
                const isChecked = Boolean(selected[subject.id]);
                return (
                  <Card key={subject.id} className="hover:shadow-md transition-shadow">
                    <CardBody className="flex flex-row items-center gap-4">
                      <Checkbox
                        isSelected={isChecked}
                        onValueChange={(checked) => toggleSubject(subject, checked)}
                      />
                      <div className="flex-grow">
                        <h4 className="font-semibold">{subject.name}</h4>
                        {subject.level && (
                          <span className="text-sm text-gray-600">Level: {subject.level}</span>
                        )}
                      </div>
                      <Input
                        type="number"
                        min={0}
                        label="المبلغ"
                        className="w-36"
                        isDisabled={!isChecked}
                        value={isChecked ? String(selected[subject.id].amount) : ""}
                        onValueChange={(v) => setAmount(subject.id, v)}
                      />
                    </CardBody>
                  </Card>
                );
              })}
            </div>

            {selectedIds.length > 0 && (
              <>
                <Divider />
                <Input
                  type="number"
                  min={0}
                  label="المدفوع الآن (اتركه فارغاً للدفع كاملاً)"
                  placeholder={String(total)}
                  value={paidAmount}
                  onValueChange={setPaidAmount}
                />
                <Card className="bg-blue-50">
                  <CardBody>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-semibold">المبلغ الإجمالي:</span>
                        <span className="font-bold">{total.toFixed(2)} DA</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">المدفوع:</span>
                        <span className="font-bold text-green-600">
                          {paidPreview.toFixed(2)} DA
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">الباقي:</span>
                        <span
                          className={`font-bold ${
                            remainingPreview > 0 ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {remainingPreview.toFixed(2)} DA
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            إلغاء
          </Button>
          <Button
            color="primary"
            onPress={handleRegister}
            isLoading={loading}
            isDisabled={selectedIds.length === 0}
          >
            تسجيل وإصدار الوصل
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MultiSubjectRegistration;
