import React from "react";
import { Line } from "react-chartjs-2";
// import {CategoryScale} from 'chart.js'; 


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  } from 'chart.js';
  


const LineChart = ({ chartData }) => {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
    );
  return (
    <div>
      <Line
        datasetIdKey="id"
        data={{
          labels: ["Jun", "Jul", "Aug"],
          datasets: [{
            label: 'My First Dataset',
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }],
        }}
      />
      {/* <Line
        datasetIdKey="id"
        data={{
          labels: ["Jun", "Jul", "Aug"],
          datasets: [
            {
              id: 1,
              label: "",
              data: [5, 6, 7],
            },
            {
              id: 2,
              label: "",
              data: [3, 2, 1],
            },
          ],
        }}
      /> */}
    </div>
  );
};

export default LineChart;
