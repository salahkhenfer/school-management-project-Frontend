import { Card, CardBody, Chip, Progress } from "@nextui-org/react";
import { useEffect, useState } from "react";
import {
  getFeeAdjustment,
  getRemainingClasses,
} from "../../../apiCalls/classControlCalls";

const RemainingClassesCard = ({ studentId, groupId, groupName }) => {
  const [data, setData] = useState(null);
  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId && groupId) fetchData();
  }, [studentId, groupId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [remainingRes, feeRes] = await Promise.all([
        getRemainingClasses(studentId, groupId),
        getFeeAdjustment(studentId, groupId),
      ]);
      setData(remainingRes?.data || null);
      setFee(feeRes?.data || null);
    } catch (error) {
      console.error("Error fetching class data:", error);
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

  if (!data) {
    return (
      <Card className="w-full">
        <CardBody>
          <p className="text-sm text-gray-500">
            لا توجد فترة نشطة أو بيانات لهذا الفوج
          </p>
        </CardBody>
      </Card>
    );
  }

  const total = Number(data.totalClasses) || 0;
  const attended = Number(data.attendedClasses) || 0;
  const remaining = Number(data.remainingClasses) || 0;
  const percentage = total > 0 ? (attended / total) * 100 : 0;

  return (
    <Card className="w-full">
      <CardBody className="gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {groupName ? `${groupName} — ` : ""}الحصص
          </h3>
          <Chip
            color={remaining > 5 ? "success" : remaining > 0 ? "warning" : "danger"}
            variant="flat"
          >
            {remaining} حصة متبقية
          </Chip>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>حضر: {attended}</span>
            <span>المجموع: {total}</span>
          </div>
          <Progress value={percentage} className="w-full" />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-green-50 p-2 rounded">
            <p className="text-xs text-gray-600">حضر</p>
            <p className="text-lg font-bold text-green-600">{attended}</p>
          </div>
          <div className="bg-blue-50 p-2 rounded">
            <p className="text-xs text-gray-600">متبقي</p>
            <p className="text-lg font-bold text-blue-600">{remaining}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-xs text-gray-600">المجموع</p>
            <p className="text-lg font-bold text-gray-600">{total}</p>
          </div>
        </div>

        {/* Fee after deducting missed sessions (feature 7) */}
        {fee && (
          <div className="border-t pt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>المبلغ الشهري:</span>
              <span className="font-semibold">{fee.monthlyAmount} DA</span>
            </div>
            <div className="flex justify-between">
              <span>حصص فائتة (غياب):</span>
              <span className="font-semibold">{fee.missedSessions}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>الخصم:</span>
              <span className="font-semibold">- {fee.deduction} DA</span>
            </div>
            <div className="flex justify-between text-green-700 text-base">
              <span className="font-bold">المبلغ بعد الخصم:</span>
              <span className="font-bold">{fee.adjustedAmount} DA</span>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default RemainingClassesCard;
