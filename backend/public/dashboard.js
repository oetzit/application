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
