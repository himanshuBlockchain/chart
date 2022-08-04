import React, { useEffect, useState, useRef } from "react";
import { createChart } from "lightweight-charts";
import axios from "axios";
import moment from "moment";
const Chart = ({ stock }) => {
  const [chartData, setChartData] = useState([]);
  const chartRef = useRef();

  useEffect(() => {
    var getERC20CoinChartInfo = async () => {
      let contractAddress = "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a";
      let url = `https://api.coingecko.com/api/v3/coins/polygon-pos/contract/0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a/market_chart/?vs_currency=usd&days=365`;
      try {
        const response = await axios.get(url);
        let prices = response.data.prices;
        // console.log(response.data.prices);
        let x1 = [
          [1659534964126, 1.4616444709414644],
          [1659535245478, 1.4683396305536591],
          [1658535533783, 1.4664803016726566],
          [1659535853406, 1.4631840145666726],
        ];

        var someDate = new Date(1659534964126);
        console.log(moment(someDate).format("YYYY-MM-DD"));

        let obj = [];
        console.log("PRICES", prices);
        prices.forEach((element) => {
          let formattedTime = moment(element[0]).format("YYYY-MM-DD");
          let formattedTime1 = formattedTime.toString();
          if (formattedTime == null) {
            console.log("NULL;;;;;;;;;;;;;;;;;;;;;", formattedTime);
          }
          if (element[1] == null) {
            console.log("NULL;;;;;;;;;;;;;;;;;;;;;", formattedTime);
          }

          prices.forEach((element1) => {
            let count = 0;
            if (element[0] == element1[0]) {
              count += 1;
              // console.log("REPEATED")
            }
            if (count > 1) {
              console.log("REPEATED");
            }
          });

          //  console.log( formattedTime1)
          obj.push({
            time: String(formattedTime1),
            value: parseFloat(element[1]),
          });
        });

        obj.pop();

        console.log("OBJ", obj);
        // console.log("OBJ", obj[0]);
        let x = [
          { time: "2019-04-11", value: 80.01 },
          { time: "2019-04-12", value: 96.63 },
          { time: "2019-04-13", value: 76.64 },
          { time: "2019-04-14", value: 81.89 },
          { time: "2019-04-15", value: 74.43 },
          { time: "2019-04-16", value: 80.01 },
          { time: "2019-04-17", value: 96.63 },
          { time: "2019-04-18", value: 76.64 },
          { time: "2019-04-19", value: 81.89 },
          { time: "2019-04-20", value: 74.43 },
        ];
        console.error(x);

        const chart = createChart(chartRef.current, {
          width: 500,
          height: 400,
        });
        const lineSeries = chart.addLineSeries();
        lineSeries.setData(obj);
        chart.timeScale().fitContent();
      } catch (error) {
        console.error(error);
      }
    };
    getERC20CoinChartInfo();
  });

  useEffect(() => {
    // const chart = createChart(chartRef.current, { width: 500, height: 400 });
    // const lineSeries = chart.addLineSeries();
    // lineSeries.setData([
    //   { time: "2019-04-11", value: 80.01 },
    //   { time: "2019-04-12", value: 96.63 },
    //   { time: "2019-04-13", value: 76.64 },
    //   { time: "2019-04-14", value: 81.89 },
    //   { time: "2019-04-15", value: 74.43 },
    //   { time: "2019-04-16", value: 80.01 },
    //   { time: "2019-04-17", value: 96.63 },
    //   { time: "2019-04-18", value: 76.64 },
    //   { time: "2019-04-19", value: 81.89 },
    //   { time: "2019-04-20", value: 74.43 },
    // ]);
    // chart.timeScale().fitContent();
  }, []);

  return (
    <div className="chart-container">
      <h2>Interactive 5 Years Historical Daily Chart</h2>
      <div ref={chartRef} />
    </div>
  );
};
export default Chart;
