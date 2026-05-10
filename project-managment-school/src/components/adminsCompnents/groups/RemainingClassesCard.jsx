import { Card, CardBody, Chip, Progress } from "@nextui-org/react";
import { useEffect, useState } from "react";
import {
  getRemainingClasses,
  getStudentClassCount,
} from "../../apiCalls/classControlCalls";
import { getActivePeriod } from "../../apiCalls/periodCalls";

const RemainingClassesCard = ({ studentId }) => {
  const [remaining, setRemaining] = useState(null);
  const [total, setTotal] = useState(0);
  const [attended, setAttended] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRemainingClasses();
  }, [studentId]);

  const fetchRemainingClasses = async () => {
    try {
      setLoading(true);
      const activePeriod = await getActivePeriod();

      if (activePeriod) {
        const remainingData = await getRemainingClasses(
          studentId,
          activePeriod.id
        );
        const countData = await getStudentClassCount(
          studentId,
          activePeriod.id
        );

        setRemaining(remainingData.remaining);
        setTotal(remainingData.total);
        setAttended(countData.attended || 0);
      }
    } catch (error) {
      console.error("Error fetching remaining classes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardBody>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardBody>
      </Card>
    );
  }

  const percentage = total > 0 ? (attended / total) * 100 : 0;
  const remainingPercentage = total > 0 ? (remaining / total) * 100 : 0;

  return (
    <Card className="w-full">
      <CardBody className="gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Class Attendance</h3>
          <Chip
            color={
              remaining > 5 ? "success" : remaining > 0 ? "warning" : "danger"
            }
            variant="flat"
          >
            {remaining} Classes Left
          </Chip>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Attended: {attended}</span>
            <span>Total: {total}</span>
          </div>
          <Progress
            value={percentage}
            color={
              percentage < 50
                ? "success"
                : percentage < 80
                ? "warning"
                : "danger"
            }
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-green-50 p-2 rounded">
            <p className="text-xs text-gray-600">Attended</p>
            <p className="text-lg font-bold text-green-600">{attended}</p>
          </div>
          <div className="bg-blue-50 p-2 rounded">
            <p className="text-xs text-gray-600">Remaining</p>
            <p className="text-lg font-bold text-blue-600">{remaining}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-xs text-gray-600">Total</p>
            <p className="text-lg font-bold text-gray-600">{total}</p>
          </div>
        </div>

        {remaining <= 3 && remaining > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 p-2 rounded">
            <p className="text-sm text-yellow-800">
              ⚠️ Warning: Only {remaining} classes remaining this period
            </p>
          </div>
        )}

        {remaining === 0 && (
          <div className="bg-red-50 border border-red-200 p-2 rounded">
            <p className="text-sm text-red-800">
              ❌ No remaining classes. Please contact administration for
              re-registration.
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default RemainingClassesCard;
