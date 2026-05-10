import {
  Button,
  Card,
  CardBody,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  useDisclosure,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  getAllRegiments,
  getClassroomAvailability,
  reserveClassroom,
} from "../../apiCalls/scheduleCalls";

const ClassroomAvailability = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [regiments, setRegiments] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [reservationData, setReservationData] = useState({
    startTime: "",
    endTime: "",
    day: "",
    purpose: "",
    groupId: "",
  });

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ];

  useEffect(() => {
    fetchClassrooms();
    fetchRegiments();
  }, [selectedDate]);

  const fetchClassrooms = async () => {
    setLoading(true);
    try {
      const data = await getClassroomAvailability(selectedDate);
      setClassrooms(data);
    } catch (error) {
      console.error("Error fetching classroom availability:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegiments = async () => {
    try {
      const data = await getAllRegiments();
      setRegiments(data || []);
    } catch (error) {
      console.error("Error fetching regiments:", error);
    }
  };

  const handleReserve = (classroom) => {
    setSelectedClassroom(classroom);
    onOpen();
  };

  const handleSubmitReservation = async () => {
    try {
      await reserveClassroom(selectedClassroom.id, reservationData);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Classroom reserved successfully",
      });
      onClose();
      fetchClassrooms();
      setReservationData({
        startTime: "",
        endTime: "",
        day: "",
        purpose: "",
        groupId: "",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to reserve classroom",
      });
    }
  };

  const getAvailabilityStatus = (classroom) => {
    const totalSlots = 10; // Assuming 10 time slots per day
    const reservedSlots = classroom.reservations?.length || 0;
    const availableSlots = totalSlots - reservedSlots;
    const percentage = (availableSlots / totalSlots) * 100;

    if (percentage === 100)
      return { color: "success", text: "Fully Available" };
    if (percentage >= 50)
      return { color: "warning", text: "Partially Available" };
    if (percentage > 0) return { color: "danger", text: "Mostly Reserved" };
    return { color: "default", text: "Fully Booked" };
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Classroom Availability</h2>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classrooms.map((classroom) => {
            const status = getAvailabilityStatus(classroom);
            return (
              <Card
                key={classroom.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardBody>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{classroom.name}</h3>
                      <p className="text-sm text-gray-600">
                        Capacity: {classroom.capacity} students
                      </p>
                    </div>
                    <Chip color={status.color} variant="flat">
                      {status.text}
                    </Chip>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm">
                      <strong>Location:</strong> {classroom.location || "N/A"}
                    </p>
                    <p className="text-sm">
                      <strong>Facilities:</strong>{" "}
                      {classroom.facilities?.join(", ") || "Standard"}
                    </p>
                  </div>

                  {classroom.reservations &&
                    classroom.reservations.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold mb-2">
                          Today's Schedule:
                        </p>
                        <div className="space-y-1">
                          {classroom.reservations
                            .slice(0, 3)
                            .map((reservation, idx) => (
                              <div
                                key={idx}
                                className="text-xs bg-gray-100 p-2 rounded flex justify-between"
                              >
                                <span>{reservation.timeSlot}</span>
                                <span className="text-gray-600">
                                  {reservation.purpose}
                                </span>
                              </div>
                            ))}
                          {classroom.reservations.length > 3 && (
                            <p className="text-xs text-gray-500 text-center">
                              +{classroom.reservations.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                  <Button
                    color="primary"
                    className="w-full"
                    onPress={() => handleReserve(classroom)}
                    isDisabled={status.text === "Fully Booked"}
                  >
                    Reserve Classroom
                  </Button>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {classrooms.length === 0 && !loading && (
        <Card>
          <CardBody>
            <p className="text-center text-gray-500">No classrooms available</p>
          </CardBody>
        </Card>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            Reserve Classroom: {selectedClassroom?.name}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Select
                label="Day of Week"
                placeholder="Select day"
                value={reservationData.day}
                onChange={(e) =>
                  setReservationData({
                    ...reservationData,
                    day: e.target.value,
                  })
                }
              >
                {daysOfWeek.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Start Time"
                placeholder="Select start time"
                value={reservationData.startTime}
                onChange={(e) =>
                  setReservationData({
                    ...reservationData,
                    startTime: e.target.value,
                  })
                }
              >
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="End Time"
                placeholder="Select end time"
                value={reservationData.endTime}
                onChange={(e) =>
                  setReservationData({
                    ...reservationData,
                    endTime: e.target.value,
                  })
                }
              >
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </Select>

              <Input
                label="Purpose/Group"
                placeholder="Enter purpose or group name"
                value={reservationData.purpose}
                onChange={(e) =>
                  setReservationData({
                    ...reservationData,
                    purpose: e.target.value,
                  })
                }
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSubmitReservation}>
              Reserve
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ClassroomAvailability;
