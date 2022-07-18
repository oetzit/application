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

//=[ Clues by duration ]========================================================

const cluesByDurationData = JSON.parse(
  document.getElementById("cluesByDurationData").textContent,
).filter((item) => item.bucket != null);

const cluesByDurationConfig = {
  type: "bar",
  data: {
    datasets: [
      {
        data: cluesByDurationData,
        backgroundColor: [
          ...Array(cluesByDurationData.length - 1).fill("blue"),
          "red",
        ],
      },
    ],
  },
  options: {
    scales: {
      x: {
        type: "linear",
        min: 0,
        max: 15000,
      },
      y: {},
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Clues screen time [ms] distribution",
      },

      subtitle: {
        display: true,
        text: "Bins are 150ms wide, labeled by upper bound; clues >15s are lumped in the last bar.",
      },
    },
    parsing: {
      xAxisKey: "bucket",
      yAxisKey: "count",
    },
  },
};

new Chart(
  document.getElementById("cluesByDurationChart"),
  cluesByDurationConfig,
);

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
        backgroundColor: [
          ...Array(shotsByDurationData.length - 1).fill("blue"),
          "red",
        ],
      },
    ],
  },
  options: {
    scales: {
      x: {
        type: "linear",
        min: 0,
        max: 10000,
      },
      y: {},
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Shots duration [ms] distribution",
      },

      subtitle: {
        display: true,
        text: "Bins are 100ms wide, labeled by upper bound; shots >10s are lumped in the last bar.",
      },
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

//=[ Shots by similarity ]======================================================

const shotsBySimilarityData = JSON.parse(
  document.getElementById("shotsBySimilarityData").textContent,
).filter((item) => item.bucket != null);

const shotsBySimilarityConfig = {
  type: "bar",
  data: {
    datasets: [
      {
        data: shotsBySimilarityData,
        backgroundColor: [
          "red",
          ...Array(shotsBySimilarityData.length - 1).fill("blue"),
        ],
      },
    ],
  },
  options: {
    scales: {
      x: {
        type: "linear",
      },
      y: {
        type: "logarithmic",
      },
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Shots similarity distribution",
      },

      subtitle: {
        display: true,
        text: "Bins are 0.1 wide, labeled by upper bound; unmatched shots are lumped in the first bar.",
      },
    },
    parsing: {
      xAxisKey: "bucket",
      yAxisKey: "count",
    },
  },
};

new Chart(
  document.getElementById("shotsBySimilarityChart"),
  shotsBySimilarityConfig,
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

//=[ Words performance ]========================================================

const wordsPerformanceData = JSON.parse(
  document.getElementById("wordsPerformanceData").textContent,
);

const wordsPerformanceConfig = {
  type: "scatter",
  data: {
    datasets: [
      {
        data: wordsPerformanceData,
        backgroundColor: "blue",
      },
    ],
  },
  pointDot: true,
  options: {
    maintainAspectRatio: true,
    aspectRatio: 1,
    scales: {
      x: {
        title: {
          display: true,
          text: "OCR confidence",
        },
      },
      y: {
        title: {
          display: true,
          text: "Avg shot similarity",
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `[${context.raw.ocr_transcript}](${context.parsed.x.toFixed(
              2,
            )};${context.parsed.y.toFixed(2)})`;
          },
        },
      },
    },
    parsing: {
      xAxisKey: "ocr_confidence",
      yAxisKey: "avg_similarity",
    },
  },
};

new Chart(
  document.getElementById("wordsPerformanceChart"),
  wordsPerformanceConfig,
);
