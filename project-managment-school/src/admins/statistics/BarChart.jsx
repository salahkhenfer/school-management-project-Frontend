import axios from "axios";
import { CategoryScale } from "chart.js";
import Chart from "chart.js/auto";
import { useEffect, useState } from "react";
import { BarChartEach } from "./BarChartEach";

Chart.register(CategoryScale);

function BarChart() {
  const threshold = 20; // ط§ظ„ط¹طھط¨ط© ظ„طھط؛ظٹظٹط± ط§ظ„ظ„ظˆظ†

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Number of Students",
        data: [],
        backgroundColor: [],
        borderColor: "black",
        borderWidth: 2,
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://api.eltatwir.com/api/students/monthly-student-count"
        );
        const data = response.data;

        const labels = data.map((item) =>
          new Date(item.month).toLocaleString("default", { month: "long" })
        );
        const studentsData = data.map((item) => item.count);
        const backgroundColors = data.map((item) =>
          item.count < threshold ? "#8196ff" : "#001a9f"
        );

        setChartData({
          labels,
          datasets: [
            {
              label: "Number of Students",
              data: studentsData,
              backgroundColor: backgroundColors,
              borderRadius: 8,
              borderWidth: 0,
              maxBarThickness: 48,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <BarChartEach chartData={chartData} />
    </div>
  );
}

export default BarChart;
