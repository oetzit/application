//=[ Games by date ]============================================================

const gamesByDateData = JSON.parse(
  document.getElementById("gamesByDateData").textContent,
).filter((item) => item.date != null);

const gamesByDateConfig = {
  type: "bar",
  data: {
    datasets: [
      {
        data: gamesByDateData.filter((item) => !item.ended),
        label: "Interrupted",
        backgroundColor: "red",
      },
      {
        data: gamesByDateData.filter((item) => item.ended),
        label: "Ended",
        backgroundColor: "green",
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
);

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
