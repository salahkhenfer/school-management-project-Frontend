import {
  Button,
  Card,
  CardBody,
  Checkbox,
  CheckboxGroup,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getAllCourses } from "../../apiCalls/coursesCalls";
import { generateCombinedReceipt } from "../../apiCalls/receiptCalls";
import ReceiptPrint from "../adminsCompnents/Financialmanagement/ReceiptPrint";

const MultiSubjectRegistration = ({ studentId, isOpen, onClose }) => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSubjects();
    }
  }, [isOpen]);

  const fetchSubjects = async () => {
    try {
      const data = await getAllCourses();
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const calculateTotal = () => {
    return selectedSubjects.reduce((total, subjectId) => {
      const subject = subjects.find((s) => s.id === subjectId);
      return total + (subject?.price || 0);
    }, 0);
  };

  const handleRegister = async () => {
    if (selectedSubjects.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Subjects Selected",
        text: "Please select at least one subject to register",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await generateCombinedReceipt(
        studentId,
        selectedSubjects
      );

      // Prepare receipt data
      const receipt = {
        receiptNo: response.receiptNo || `REC-${Date.now()}`,
        date: new Date().toISOString(),
        studentName: response.studentName,
        parentName: response.parentName,
        paymentMethod: response.paymentMethod || "Cash",
        items: selectedSubjects.map((subjectId) => {
          const subject = subjects.find((s) => s.id === subjectId);
          return {
            subject: subject?.name || "Unknown",
            level: subject?.level || "N/A",
            classes: subject?.totalClasses || 0,
            amount: subject?.price || 0,
          };
        }),
        totalAmount: calculateTotal(),
      };

      setReceiptData(receipt);
      setShowReceipt(true);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Student registered for multiple subjects successfully",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to register student",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setSelectedSubjects([]);
    onClose();
  };

  if (showReceipt && receiptData) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleCloseReceipt}
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalBody className="p-6">
            <ReceiptPrint
              receiptData={receiptData}
              onClose={handleCloseReceipt}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>
          <h3 className="text-xl font-bold">Register for Multiple Subjects</h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-gray-600">
              Select multiple subjects for the student. A combined receipt will
              be generated for all selected subjects.
            </p>

            <CheckboxGroup
              value={selectedSubjects}
              onChange={setSelectedSubjects}
              label="Available Subjects"
            >
              <div className="grid grid-cols-1 gap-3">
                {subjects.map((subject) => (
                  <Card
                    key={subject.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardBody className="flex flex-row items-center gap-4">
                      <Checkbox value={subject.id} />
                      <div className="flex-grow">
                        <h4 className="font-semibold">{subject.name}</h4>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>Level: {subject.level}</span>
                          <span>Classes: {subject.totalClasses}</span>
                          <span>Duration: {subject.duration || "N/A"}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          ${subject.price?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </CheckboxGroup>

            {selectedSubjects.length > 0 && (
              <>
                <Divider />
                <Card className="bg-blue-50">
                  <CardBody>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-semibold">
                          Selected Subjects:
                        </span>
                        <span>{selectedSubjects.length}</span>
                      </div>
                      <div className="flex justify-between text-xl">
                        <span className="font-bold">Total Amount:</span>
                        <span className="font-bold text-green-600">
                          ${calculateTotal().toFixed(2)}
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
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleRegister}
            isLoading={loading}
            isDisabled={selectedSubjects.length === 0}
          >
            Register & Generate Receipt
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MultiSubjectRegistration;
