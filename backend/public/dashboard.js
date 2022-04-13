//=[ Games by date ]============================================================

const gamesByDateData = JSON.parse(
  document.getElementById("gamesByDateData").textContent,
).filter((item) => item.date != null);

const devicesByDateData = JSON.parse(
  document.getElementById("devicesByDateData").textContent,
).filter((item) => item.date != null);

const gamesByDateConfig = {
  type: "bar",
  data: {
    datasets: [
      {
        data: gamesByDateData.filter((item) => !item.ended),
        label: "Interrupted games",
        backgroundColor: "red",
        yAxisID: "y",
        order: 1,
      },
      {
        data: gamesByDateData.filter((item) => item.ended),
        label: "Finished games",
        backgroundColor: "green",
        yAxisID: "y",
        order: 1,
      },
      {
        data: devicesByDateData
          .filter((item) => !item.ended)
          .sort((a, b) => (a.date > b.date ? -1 : 1)),
        label: "Unique devices",
        borderColor: "blue",
        backgroundColor: "blue",
        type: "line",
        yAxisID: "y2",
        order: 0,
      },
    ],
  },
  options: {
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
        },
        stacked: true,
      },
      y: {
        stacked: true,
      },
      y2: {
        type: "linear",
        position: "right",
        grid: { drawOnChartArea: false },
      },
    },
    parsing: {
      xAxisKey: "date",
      yAxisKey: "count",
    },
  },
};

new Chart(document.getElementById("gamesByDateChart"), gamesByDateConfig);

//=[ Shots by duration ]========================================================

const shotsByDurationData = JSON.parse(
  document.getElementById("shotsByDurationData").textContent,
).filter((item) => item.bucket != null);

const shotsByDurationConfig = {
  type: "bar",
  data: {
    datasets: [
      {
        data: shotsByDurationData,
        backgroundColor: "blue",
      },
    ],
  },
  options: {
    scales: {
      x: {
        type: "linear",
        min: 0,
      },
      y: {},
    },
    plugins: {
      legend: { display: false },
    },
    parsing: {
      xAxisKey: "bucket",
      yAxisKey: "count",
    },
  },
};

new Chart(
  document.getElementById("shotsByDurationChart"),
  shotsByDurationConfig,
);

//=[ Devices behaviour ]========================================================

const devicesBehaviourData = JSON.parse(
  document.getElementById("devicesBehaviourData").textContent,
)
  .filter((item) => item.device_id)
  .map((item) => [
    item.ended_count,
    item.interrupted_count,
    parseFloat((item.time_spent / 100000).toFixed(2)),
  ]);

console.log(devicesBehaviourData);

const devicesBehaviourConfig = {
  type: "bubble",
  data: {
    datasets: [
      {
        data: devicesBehaviourData,
        backgroundColor: "blue",
      },
    ],
  },
  options: {
    // maintainAspectRatio: true,
    // aspectRatio: 1,
    scales: {
      x: {
        type: "logarithmic",
        title: {
          display: true,
          text: "Finished games",
        },
      },
      y: {
        type: "logarithmic",
        title: {
          display: true,
          text: "Interrupted games",
        },
      },
    },
    plugins: {
      legend: { display: false },
    },
  },
};

new Chart(
  document.getElementById("devicesBehaviourChart"),
  devicesBehaviourConfig,
);
