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
  Input,
  Button,
  ModalContent,
  Modal,
  useDisclosure,
} from "@nextui-org/react";
import React, { useEffect, useState } from "react";

import { BiCheck } from "react-icons/bi";
import { formatDate } from "date-fns";
import {
  addPaymentEmployer,
  getEmployerFinancials,
  searchEmployerPayment,
} from "../../apiCalls/FinancialEmployerCalls";
import { FaSearch } from "react-icons/fa";

function FinancialEmployer() {
  const [paymentTeacher, setPaymentTeacher] = useState([]);
  const [searchTeacher, setSearchTeacher] = useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [payment, setPayment] = useState({
    employerId: "",
    amount: "",
  });

  const getTeacherPayment = async () => {
    const paymentTeacherApi = await getEmployerFinancials();
    setPaymentTeacher(paymentTeacherApi.reverse());
    console.log(paymentTeacher);
  };

  useEffect(() => {
    getTeacherPayment();
  }, []);

  const handleSearch = async () => {
    const search = await searchEmployerPayment(searchTeacher);
    if (search) {
      setPaymentTeacher(search);
    } else {
      setPaymentTeacher([]);
    }
  };

  const handleAdd = () => {
    onOpenChange();
    const addPayment = async () => {
      const response = await addPaymentEmployer(
        payment.employerId,
        payment.amount
      );
      console.log(response);
      getTeacherPayment();
    };
    addPayment();
  };

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
      <div className="w-full flex justify-between items-center py-5 ">
        <Input
          classNames={{
            base: "max-w-full sm:max-w-[20rem] ",
            mainWrapper: "h-full",
            input: "text-small",
            inputWrapper:
              "h-full font-normal text-default-500 bg-default-400/50 dark:bg-default-500/20",
          }}
          placeholder=" ابحث عن عامل ..."
          size="lg"
          startContent={<FaSearch size={18} />}
          defaultValue=""
          endContent={
            <FaSearch
              onClick={handleSearch}
              className=" h-fit cursor-pointer w-fit p-3 text-white bg-sky-600 rounded-full"
              size={20}
            />
          }
          onChange={(e) => setSearchTeacher(e.target.value)}
          type="search"
        />
        <Button onPress={onOpen} className="mt-5" color="primary" size="small">
          اضافة دفع للعامل
        </Button>
      </div>
      <div>
        {!paymentTeacher.length == 0 ? (
          <Table className="min-h-[60vh]" isHeaderSticky>
            <TableHeader>
              <TableColumn key="id">رمز الدفع</TableColumn>
              <TableColumn key="employerName">اسم العاملي</TableColumn>
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
                        ? getKeyValue(
                            formatDate(item[columnKey], " yyyy-MM-dd HH:mm:ss"),
                            columnKey
                          )
                        : getKeyValue(item, columnKey)}

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
        ) : (
          <div className="text-center text-2xl font-bold text-red-500">
            لا يوجد نتائج للبحث
          </div>
        )}
      </div>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent className="w-fit">
          {(onClose) => (
            <div className="md:w-fit max-md:w-full p-4 h-fit md:px-12  md:py-2   bg-gray-200 rounded-3xl justify-start items-center inline-flex">
              <div className="max-md:w-full self-stretch flex-col justify-start items-end gap-4 inline-flex">
                <div className="self-stretch text-center text-gray-800 text-3xl font-semibold font-['Cairo'] leading-10">
                  إضافة دفع للعامل
                </div>
                <Input
                  placeholder="اسم العامل"
                  size="lg"
                  defaultValue=""
                  onChange={(e) =>
                    setPayment({ ...payment, employerId: e.target.value })
                  }
                  type="text"
                />
                <Input
                  placeholder="المبلغ"
                  size="lg"
                  defaultValue=""
                  onChange={(e) =>
                    setPayment({ ...payment, amount: e.target.value })
                  }
                  type="number"
                  endContent={
                    <div className="text-gray-500 text-lg font-semibold font-['Cairo']">
                      دج
                    </div>
                  }
                />

                <Button
                  onClick={handleAdd}
                  className="self-stretch cursor-pointer px-8 py-2 bg-indigo-500 rounded-2xl justify-center items-center gap-2 inline-flex"
                >
                  <div className="text-right text-white text-base font-semibold font-['Cairo'] leading-normal">
                    اضافة
                  </div>
                </Button>
                <Button
                  onPress={onClose}
                  className="self-stretch cursor-pointer px-8 py-2 bg-red-600 rounded-2xl justify-center items-center gap-2 inline-flex"
                >
                  <div className="text-right text-white text-base font-semibold font-['Cairo'] leading-normal">
                    الغاء
                  </div>
                </Button>
              </div>
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default FinancialEmployer;
