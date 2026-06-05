import { Button, Card, CardBody, Spinner } from "@nextui-org/react";
import { useEffect, useMemo, useState } from "react";
import { FaPrint } from "react-icons/fa";
import { getWeeklySchedule } from "../../apiCalls/scheduleCalls";

// Algerian school week order (matches the labels used when adding a schedule)
const DAYS = [
  "السبت",
  "الاحد",
  "الاثنين",
  "الثلاثاء",
  "الاربعاء",
  "الخميس",
  "الجمعة",
];

const LevelSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const data = await getWeeklySchedule();
      setSchedule(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  // Distinct time slots present in the data, sorted by start time
  const timeSlots = useMemo(() => {
    const set = [...new Set(schedule.map((s) => s.timeSlot))];
    return set.sort((a, b) =>
      (a.split(" - ")[0] || "").localeCompare(b.split(" - ")[0] || "")
    );
  }, [schedule]);

  // Days that actually appear (keep the known order, then any extras)
  const days = useMemo(() => {
    const present = new Set(schedule.map((s) => s.day));
    const ordered = DAYS.filter((d) => present.has(d));
    const extras = [...present].filter((d) => !DAYS.includes(d));
    return ordered.length || extras.length ? [...ordered, ...extras] : DAYS;
  }, [schedule]);

  const cellSessions = (day, timeSlot) =>
    schedule.filter((s) => s.day === day && s.timeSlot === timeSlot);

  const handlePrint = () => window.print();

  return (
    <div className="p-6" dir="rtl">
      <div className="flex justify-between items-center mb-6 no-print">
        <h2 className="text-2xl font-bold">الجدول الأسبوعي للحصص</h2>
        <Button color="primary" startContent={<FaPrint />} onPress={handlePrint}>
          طباعة الجدول
        </Button>
      </div>

      <style>
        {`@media print { .no-print { display: none !important; } @page { size: A4 landscape; margin: 1cm; } }`}
      </style>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : schedule.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center text-gray-500 py-6">
              لا توجد حصص محجوزة بعد. أضف توقيتاً للفوج من صفحة الفوج.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-2 border-gray-400 text-center">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-2 w-32">التوقيت</th>
                {days.map((day) => (
                  <th key={day} className="border border-gray-400 p-2">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((timeSlot) => (
                <tr key={timeSlot}>
                  <td className="border border-gray-400 p-2 font-semibold bg-gray-50">
                    {timeSlot}
                  </td>
                  {days.map((day) => {
                    const sessions = cellSessions(day, timeSlot);
                    return (
                      <td
                        key={`${day}-${timeSlot}`}
                        className="border border-gray-400 p-1 align-top"
                      >
                        {sessions.length === 0 ? (
                          <span className="text-gray-300">-</span>
                        ) : (
                          sessions.map((s) => (
                            <div
                              key={s.id}
                              className="bg-blue-50 border border-blue-300 rounded p-2 mb-1 text-right"
                            >
                              <p className="font-semibold text-sm text-blue-800">
                                {s.groupName}
                              </p>
                              <p className="text-xs text-gray-700">
                                الأستاذ: {s.teacher}
                              </p>
                              <p className="text-xs text-gray-600">
                                القاعة: {s.room}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                {s.timeSlot}
                              </p>
                            </div>
                          ))
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LevelSchedule;
