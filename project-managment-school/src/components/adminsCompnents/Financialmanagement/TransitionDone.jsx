import {
  CheckboxIcon,
  Chip,
  getKeyValue,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getAllPaymentsTeacher,
  getPaymentByTeacher,
} from "../../../apiCalls/PaymentsTeacher";
import { format, formatDate } from "date-fns";
import { BiCheck } from "react-icons/bi";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../Redux/slices/authSlice";

function TransitionDone() {
  const [paymentTeacher, setPaymentTeacher] = useState([]);

  const { FinancialTeachersParams } = useParams();
  const { user } = useSelector(selectAuth);

  const getTeacherPayment = async () => {
    if (FinancialTeachersParams) {
      const paymentTeacherApi = await getPaymentByTeacher({
        teacherId: FinancialTeachersParams || user.id,
      });
      setPaymentTeacher(paymentTeacherApi.reverse());
    } else {
      const paymentTeacherApi = await getAllPaymentsTeacher();
      setPaymentTeacher(paymentTeacherApi.reverse());
      console.log(paymentTeacher);
    }
  };

  useEffect(() => {
    getTeacherPayment();
  }, []);

  return (
    <div>
      <h1
        style={{
          textAlign: "center",
          fontSize: "30px",
          color: "rgb(0, 0, 0)",
          fontWeight: "bold",
          marginBottom: "20px",
        }}
      >
        {" "}
        التحويلات المرسلة{" "}
      </h1>

      <div>
        <Table className="min-h-[60vh]" isHeaderSticky>
          <TableHeader>
            <TableColumn key="id">رمز الدفع</TableColumn>
            <TableColumn key="teacher">اسم الاستاذ</TableColumn>
            <TableColumn key="amount">مبلغ (دج)</TableColumn>
            <TableColumn key="createdAt">التاريخ </TableColumn>
            <TableColumn key="isPaid"> حالة الدفع </TableColumn>
          </TableHeader>
          <TableBody items={paymentTeacher}>
            {(item) => (
              <TableRow
                className="hover:bg-gray-100 border-b-2 border-gray-200 transition-all duration-200 ease-in-out cursor-pointer"
                key={item.id}
              >
                {(columnKey) => (
                  <TableCell className="text-right">
                    {columnKey === "createdAt"
                      ? formatDate(item[columnKey], " yyyy-MM-dd HH:mm:ss")
                      : getKeyValue(item, columnKey)}

                    {columnKey === "teacher" &&
                      getKeyValue(
                        item.paymentTeacherTeacher.fullName,
                        columnKey
                      )}
                    {columnKey === "isPaid" && (
                      <Chip
                        startContent={<BiCheck size={18} />}
                        variant="faded"
                        color="success"
                      >
                        تم الدفع
                      </Chip>
                    )}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default TransitionDone;
