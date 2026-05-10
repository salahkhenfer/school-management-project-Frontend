import {
  Card,
  CardBody,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { getCourses } from "../../apiCalls/coursesCalls";
import { getLevelSchedule } from "../../apiCalls/scheduleCalls";

const LevelSchedule = () => {
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

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
    "08:00 - 09:00",
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 13:00",
    "13:00 - 14:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
    "16:00 - 17:00",
    "17:00 - 18:00",
  ];

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      const data = await getCourses();
      console.log("Fetched levels:", data);
      if (Array.isArray(data)) {
        setLevels(data);
      } else {
        console.error("Expected array but got:", data);
        setLevels([]);
      }
    } catch (error) {
      console.error("Error fetching levels:", error);
      setLevels([]);
    }
  };

  const fetchSchedule = async (levelId) => {
    setLoading(true);
    try {
      const data = await getLevelSchedule(levelId);
      setSchedule(data);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLevelChange = (value) => {
    const levelId = value.currentKey || value;
    setSelectedLevel(levelId);
    if (levelId) {
      fetchSchedule(levelId);
    }
  };

  const getScheduleForSlot = (day, timeSlot) => {
    return schedule.find(
      (item) => item.day === day && item.timeSlot === timeSlot
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Class Schedule by Level</h2>

      <Card className="mb-6">
        <CardBody>
          <Select
            label="Select Level"
            placeholder="Choose a level to view schedule"
            selectedKeys={selectedLevel ? [selectedLevel] : []}
            onSelectionChange={handleLevelChange}
            className="max-w-xs"
          >
            {Array.isArray(levels) && levels.length > 0 ? (
              levels.map((level) => (
                <SelectItem key={level._id} value={level._id}>
                  {level.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem key="no-data" isDisabled>
                No levels available
              </SelectItem>
            )}
          </Select>
        </CardBody>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : selectedLevel && schedule.length > 0 ? (
        <div className="overflow-x-auto">
          <Table aria-label="Class schedule table" className="min-w-full">
            <TableHeader>
              <TableColumn className="bg-gray-200 font-bold">Time</TableColumn>
              {daysOfWeek.map((day) => (
                <TableColumn
                  key={day}
                  className="bg-gray-200 font-bold text-center"
                >
                  {day}
                </TableColumn>
              ))}
            </TableHeader>
            <TableBody>
              {timeSlots.map((timeSlot) => (
                <TableRow key={timeSlot}>
                  <TableCell className="font-semibold bg-gray-50">
                    {timeSlot}
                  </TableCell>
                  {daysOfWeek.map((day) => {
                    const scheduleItem = getScheduleForSlot(day, timeSlot);
                    return (
                      <TableCell
                        key={`${day}-${timeSlot}`}
                        className="text-center"
                      >
                        {scheduleItem ? (
                          <div className="bg-blue-100 p-2 rounded border border-blue-300">
                            <p className="font-semibold text-sm">
                              {scheduleItem.subject}
                            </p>
                            <p className="text-xs text-gray-600">
                              {scheduleItem.teacher}
                            </p>
                            <p className="text-xs text-gray-500">
                              Room: {scheduleItem.room}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : selectedLevel ? (
        <Card>
          <CardBody>
            <p className="text-center text-gray-500">
              No schedule available for this level
            </p>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody>
            <p className="text-center text-gray-500">
              Please select a level to view the schedule
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default LevelSchedule;
