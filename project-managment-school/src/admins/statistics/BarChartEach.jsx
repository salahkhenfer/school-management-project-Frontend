import { Bar } from "react-chartjs-2";

export const BarChartEach = ({ chartData }) => {
  return (
    <div className="w-full" style={{ height: 340 }}>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: { display: false },
            legend: { display: false },
            tooltip: {
              backgroundColor: "#111827",
              padding: 10,
              cornerRadius: 8,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0 },
              grid: { color: "#eef2f7" },
            },
            x: {
              grid: { display: false },
            },
          },
        }}
      />
    </div>
  );
};
