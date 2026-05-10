import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import * as Yup from "yup";
import {
  createPeriod,
  getActivePeriod,
  getAllPeriods,
} from "../../apiCalls/periodCalls";

const PeriodManagement = () => {
  const [periods, setPeriods] = useState([]);
  const [activePeriod, setActivePeriod] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string().required("Period name is required"),
    startDate: Yup.date().required("Start date is required"),
    endDate: Yup.date()
      .required("End date is required")
      .min(Yup.ref("startDate"), "End date must be after start date"),
    totalClasses: Yup.number()
      .required("Total classes is required")
      .min(1, "Must be at least 1 class"),
  });

  useEffect(() => {
    fetchPeriods();
    fetchActivePeriod();
  }, []);

  const fetchPeriods = async () => {
    try {
      const data = await getAllPeriods();
      setPeriods(data);
    } catch (error) {
      console.error("Error fetching periods:", error);
    }
  };

  const fetchActivePeriod = async () => {
    try {
      const data = await getActivePeriod();
      setActivePeriod(data);
    } catch (error) {
      console.error("Error fetching active period:", error);
    }
  };

  const handleCreatePeriod = async (values, { resetForm }) => {
    setLoading(true);
    try {
      await createPeriod(values);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Period created successfully",
      });
      resetForm();
      setIsOpen(false);
      fetchPeriods();
      fetchActivePeriod();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to create period",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClosePeriodAndStartNew = async () => {
    const result = await Swal.fire({
      title: "Close Current Period?",
      text: "This will close the current period and create a new one. Students can be re-registered.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, proceed",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setIsOpen(true);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Period Management</h2>
        <div className="flex gap-2">
          <Button color="primary" onPress={() => setIsOpen(true)}>
            New Period
          </Button>
          {activePeriod && (
            <Button color="warning" onPress={handleClosePeriodAndStartNew}>
              Close Period & Start New
            </Button>
          )}
        </div>
      </div>

      {activePeriod && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">Active Period</h3>
          <p>
            <strong>Name:</strong> {activePeriod.name}
          </p>
          <p>
            <strong>Duration:</strong>{" "}
            {new Date(activePeriod.startDate).toLocaleDateString()} -{" "}
            {new Date(activePeriod.endDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Total Classes:</strong> {activePeriod.totalClasses}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {periods.map((period) => (
          <div
            key={period.id}
            className={`p-4 rounded-lg border ${
              period.isActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
          >
            <h4 className="font-semibold">{period.name}</h4>
            <p className="text-sm text-gray-600">
              {new Date(period.startDate).toLocaleDateString()} -{" "}
              {new Date(period.endDate).toLocaleDateString()}
            </p>
            <p className="text-sm">Classes: {period.totalClasses}</p>
            {period.isActive && (
              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded mt-2 inline-block">
                Active
              </span>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="2xl">
        <ModalContent>
          <Formik
            initialValues={{
              name: "",
              startDate: "",
              endDate: "",
              totalClasses: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleCreatePeriod}
          >
            {({ errors, touched, setFieldValue, values }) => (
              <Form>
                <ModalHeader>Create New Period</ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    <Field name="name">
                      {({ field }) => (
                        <Input
                          {...field}
                          label="Period Name"
                          placeholder="e.g., January 2025"
                          isInvalid={errors.name && touched.name}
                          errorMessage={errors.name}
                        />
                      )}
                    </Field>

                    <Field name="startDate">
                      {({ field }) => (
                        <Input
                          {...field}
                          type="date"
                          label="Start Date"
                          isInvalid={errors.startDate && touched.startDate}
                          errorMessage={errors.startDate}
                        />
                      )}
                    </Field>

                    <Field name="endDate">
                      {({ field }) => (
                        <Input
                          {...field}
                          type="date"
                          label="End Date"
                          isInvalid={errors.endDate && touched.endDate}
                          errorMessage={errors.endDate}
                        />
                      )}
                    </Field>

                    <Field name="totalClasses">
                      {({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          label="Total Classes"
                          placeholder="Enter number of classes"
                          isInvalid={
                            errors.totalClasses && touched.totalClasses
                          }
                          errorMessage={errors.totalClasses}
                        />
                      )}
                    </Field>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="light"
                    onPress={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button color="primary" type="submit" isLoading={loading}>
                    Create Period
                  </Button>
                </ModalFooter>
              </Form>
            )}
          </Formik>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default PeriodManagement;
