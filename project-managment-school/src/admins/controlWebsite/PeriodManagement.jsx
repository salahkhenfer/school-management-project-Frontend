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
  autoRenewPeriod,
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
    name: Yup.string().required("اسم الفترة مطلوب"),
    startDate: Yup.date().required("تاريخ البداية مطلوب"),
    endDate: Yup.date()
      .required("تاريخ النهاية مطلوب")
      .min(Yup.ref("startDate"), "يجب أن يكون تاريخ النهاية بعد تاريخ البداية"),
    totalClasses: Yup.number()
      .required("عدد الحصص مطلوب")
      .min(1, "يجب أن تكون حصة واحدة على الأقل"),
  });

  useEffect(() => {
    fetchPeriods();
    fetchActivePeriod();
  }, []);

  const fetchPeriods = async () => {
    try {
      const res = await getAllPeriods();
      // API returns { success, data: [...] }
      setPeriods(Array.isArray(res) ? res : res?.data || []);
    } catch (error) {
      console.error("Error fetching periods:", error);
    }
  };

  const fetchActivePeriod = async () => {
    try {
      const res = await getActivePeriod();
      setActivePeriod(res?.data || res || null);
    } catch (error) {
      // 404 means no active period yet; not a real error
      setActivePeriod(null);
    }
  };

  const handleAutoRenew = async () => {
    const result = await Swal.fire({
      title: "تجديد الفترة الآن؟",
      text: "سيتم إغلاق الفترة الحالية وفتح فترة الشهر التالي مباشرةً.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "نعم, جدّد الآن",
      cancelButtonText: "إلغاء",
    });
    if (!result.isConfirmed) return;

    try {
      const res = await autoRenewPeriod({ force: true });
      if (res?.success) {
        Swal.fire({
          icon: "success",
          title: "تم التجديد",
          text: `الفترة النشطة الجديدة: ${res.data?.newPeriod?.name || ""}`,
        });
        fetchPeriods();
        fetchActivePeriod();
      } else {
        Swal.fire({ icon: "info", title: "تنبيه", text: res?.message || "لا يوجد ما يُجدَّد" });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: error.response?.data?.message || "فشل تجديد الفترة",
      });
    }
  };

  const handleCreatePeriod = async (values, { resetForm }) => {
    setLoading(true);
    try {
      await createPeriod(values);
      Swal.fire({
        icon: "success",
        title: "تم بنجاح!",
        text: "تم إنشاء الفترة بنجاح",
      });
      resetForm();
      setIsOpen(false);
      fetchPeriods();
      fetchActivePeriod();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: error.response?.data?.message || "فشل إنشاء الفترة",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClosePeriodAndStartNew = async () => {
    const result = await Swal.fire({
      title: "إغلاق الفترة الحالية؟",
      text: "سيؤدي هذا إلى إغلاق الفترة الحالية وإنشاء فترة جديدة. يمكن إعادة تسجيل التلاميذ.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم, متابعة",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      setIsOpen(true);
    }
  };

  return (
    <div className="p-6" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">إدارة الفترات الدراسية</h2>
        <div className="flex gap-2">
          <Button color="primary" onPress={() => setIsOpen(true)}>
            فترة جديدة
          </Button>
          {activePeriod && (
            <Button color="warning" className="text-white" onPress={handleClosePeriodAndStartNew}>
              إغلاق الفترة وبدء جديدة
            </Button>
          )}
          {activePeriod && (
            <Button color="success" className="text-white" onPress={handleAutoRenew}>
              تجديد تلقائي (الشهر التالي)
            </Button>
          )}
        </div>
      </div>

      {activePeriod && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">الفترة النشطة</h3>
          <p>
            <strong>الاسم:</strong> {activePeriod.name}
          </p>
          <p>
            <strong>المدة:</strong>{" "}
            {new Date(activePeriod.startDate).toLocaleDateString()} -{" "}
            {new Date(activePeriod.endDate).toLocaleDateString()}
          </p>
          <p>
            <strong>عدد الحصص:</strong> {activePeriod.totalClasses}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {periods.map((period) => (
          <div
            key={period.id}
            className={`p-4 rounded-lg border ${
              period.status === "active"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300"
            }`}
          >
            <h4 className="font-semibold">{period.name}</h4>
            <p className="text-sm text-gray-600">
              {new Date(period.startDate).toLocaleDateString()} -{" "}
              {new Date(period.endDate).toLocaleDateString()}
            </p>
            <p className="text-sm">الحصص: {period.totalClasses}</p>
            <span
              className={`text-xs px-2 py-1 rounded mt-2 inline-block ${
                period.status === "active"
                  ? "bg-blue-500 text-white"
                  : period.status === "closed"
                  ? "bg-gray-400 text-white"
                  : "bg-yellow-400 text-black"
              }`}
            >
              {period.status}
            </span>
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
                <ModalHeader>إنشاء فترة جديدة</ModalHeader>
                <ModalBody>
                  <div className="space-y-4" dir="rtl">
                    <Field name="name">
                      {({ field }) => (
                        <Input
                          {...field}
                          label="اسم الفترة"
                          placeholder="مثال: جانفي 2025"
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
                          label="تاريخ البداية"
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
                          label="تاريخ النهاية"
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
                          label="عدد الحصص"
                          placeholder="أدخل عدد الحصص"
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
                    إلغاء
                  </Button>
                  <Button color="primary" type="submit" isLoading={loading}>
                    إنشاء الفترة
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
