import Chart from 'chart.js/auto';

// Utility function to create a line chart
export function createLineChart(ctx, data, options) {
  return new Chart(ctx, {
    type: 'line',
    data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
      ...options,
    },
  });
}

// Utility function to create a pie chart
export function createPieChart(ctx, data, options) {
  return new Chart(ctx, {
    type: 'pie',
    data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
      },
      ...options,
    },
  });
}

// Utility function to create a bar chart
export function createBarChart(ctx, data, options) {
  return new Chart(ctx, {
    type: 'bar',
    data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
      ...options,
    },
  });
}

// Utility function to create a radar chart
export function createRadarChart(ctx, data, options) {
  return new Chart(ctx, {
    type: 'radar',
    data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
      },
      ...options,
    },
  });
}

// Utility function to create a doughnut chart
export function createDoughnutChart(ctx, data, options) {
  return new Chart(ctx, {
    type: 'doughnut',
    data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
      },
      ...options,
    },
  });
}

// Utility function to update chart data
export function updateChartData(chart, newData) {
  chart.data = newData;
  chart.update();
}

// Utility function to destroy a chart
export function destroyChart(chart) {
  chart.destroy();
}

// Example usage for creating a line chart
export function createExampleLineChart(ctx) {
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [{
      label: 'My First dataset',
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      data: [65, 59, 80, 81, 56, 55, 40],
    }],
  };

  const options = {
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Month',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Value',
        },
      },
    },
  };

  return createLineChart(ctx, data, options);
}
