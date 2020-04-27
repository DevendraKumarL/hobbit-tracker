const datagridCard = document.querySelector('#datagridCard');
datagridCard.style.display = 'none';
const colors = [
    '#0779e4', '#cff800', '#d8345f',
    '#cca8e9', '#b0a160', '#40bfc1',
    '#fa744f', '#5b8c85', '#95389e',
    '#216353', '#f69d9d', '#f1c40f'
];

function drawLineChart(data = {}) {
    const ctx = document.getElementById('linechartCanvas').getContext('2d');
    const datasets = [];
    data.hobits.forEach((hobitData, index) => {
        datasets.push({
            label: hobitData.hobit + '(' + hobitData.performanceScore + ')',
            data: hobitData.points,
            borderColor: colors[index],
            backgroundColor: Array(hobitData.points.length).fill('rgba(0, 0, 0, 0)'),
            borderWidth: 1.5,
            lineTension: 0
        })
    });
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.days,
            datasets: datasets
        },
        options: {
            scales: {
                yAxes: [{
                    stacked: true
                }]
            },
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    fontColor: '#ffffff'
                }
            },
            tooltips: {
                callbacks: {
                    label: (tooltipItem, barData) => {
                        const dataset = barData.datasets[tooltipItem.datasetIndex];
                        let label = dataset.label || '';
                        if (label) {
                            let performancePoint = dataset.data[tooltipItem.index], symbol = '=';
                            if (performancePoint < 0) symbol = '↓';
                            else if (performancePoint > 0) symbol = '↑';
                            label += ': ' + symbol + performancePoint;
                        }
                        return label;
                    }
                }
            },
            plugins: {
                datalabels: {
                    display: false
                }
            }
        }
    });
}

function drawBarChart(data = {}) {
    const ctx = document.getElementById('barchartCanvas').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(stat => stat.label + '(' + stat.performanceScore + ')'),
            datasets: [{
                label: 'Hobit Performance',
                data: data.map(stat => stat.performanceScore),
                borderColor: colors,
                borderWidth: 1.5
            }]
        },
        options: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    fontColor: '#ffffff'
                }
            },
            tooltips: {
                callbacks: {
                    label: (tooltipItem, barData) => {
                        let label = barData.datasets[tooltipItem.datasetIndex].label || '';
                        if (label) label += ': ' + data[tooltipItem.index].changeScore;
                        return label;
                    }
                }
            },
            plugins: {
                datalabels: {
                    color: '#00bdaa'
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        stepSize: 1
                    }
                }]
            }
        }
    });
}

function processBarChart(data) {
    const barData = [];
    data.hobits.forEach(hobitData => {
        let performanceScore = 0;
        hobitData.points.forEach(point => {
            if (!isNaN(point)) {
                if (point > 0) performanceScore += 1;
                else if (point <= 0) performanceScore -= 1;
            }
        });
        barData.push({
            label: hobitData.hobit,
            performanceScore: performanceScore,
            changeScore: (performanceScore > 0 ? '↑' : performanceScore < 0 ? '↓' : '=') + performanceScore
        });
    });

    console.log('Bar Chart => ');
    console.log(JSON.parse(JSON.stringify(barData)));
    drawBarChart(barData);
}

function processLineChart(data) {
    const lineData = {
        days: Object.getOwnPropertyNames(data[0]).slice(1), hobits: [],
    };
    data.forEach(hobitScorings  => {
        let scorePoints = [], performanceScore = 0;
        Object.values(hobitScorings).forEach((result, index) => {
            if (index != 0) {
                let figuredScore = getScoreValue(result);
                if (scorePoints.length == 0) {
                    scorePoints.push(figuredScore == -1 ? 0 : figuredScore)
                } else {
                    if (figuredScore == 0) scorePoints.push(NaN);
                    else if (figuredScore == 1 && scorePoints[index-2] < 0) scorePoints.push(1);
                    else if (figuredScore == -1 && scorePoints[index-2] > 0) scorePoints.push(0);
                    else scorePoints.push(scorePoints[index-2] + figuredScore);
                }
                if (!isNaN(scorePoints[index-1])) {
                    if (scorePoints[index-1] > 0) performanceScore+= 1; else if (scorePoints[index-1] <= 0) performanceScore-= 1;
                }
            }
        });
        lineData.hobits.push({
            hobit: hobitScorings.hobit,
            points: scorePoints,
            performanceScore: (performanceScore > 0 ? '↑' : performanceScore < 0 ? '↓' : '=') + performanceScore
        });
    });

    console.log('Line Chart => ');
    console.log(JSON.parse(JSON.stringify(lineData)));
    drawLineChart(lineData);

    return lineData;
}

function proccesLegendGrid(legendsData) {
    const table = document.createElement('table');
    table.setAttribute('class', 'table');
    const tbody = table.createTBody();
    const row = tbody.insertRow();

    legendsData.forEach((legend, index)  => {
        const cell = row.insertCell();
        cell.innerHTML = legend;
        cell.style.color = colors[index];
    });

    const legendgrid = document.querySelector('#legendgrid');
    legendgrid.innerHTML = "";
    legendgrid.append(table);
}

function proccesGrid(data) {
    const table = document.createElement('table');
    table.setAttribute('class', 'table');
    const theader = table.createTHead();
    const theaderRow = theader.insertRow(0);
    const tbody = table.createTBody();

    Object.getOwnPropertyNames(data[0]).forEach(col => {
        const th = document.createElement('th');
        th.innerHTML = col;
        theaderRow.appendChild(th);
    });

    const gridLegends = [];

    data.forEach((rowData, index2)  => {
        const row = tbody.insertRow();
        let performanceScore = 0, hobit = '';
        Object.values(rowData).forEach((rowCell, index) => {
            if (index != 0) {
                let point = getScoreValue(rowCell);
                if (point > 0) performanceScore+= 1; else if (point < 0) performanceScore-= 1;
                row.insertCell().innerHTML = rowCell;
            } else if (index == 0) {
                hobit = rowCell;
                const cell = row.insertCell();
                cell.innerHTML = rowCell;
                cell.style.color = colors[index2];
            }
        });
        gridLegends.push(hobit + ' (' + (performanceScore > 0 ? '↑' : performanceScore < 0 ? '↓' : '=') + performanceScore + ')');
    });

    const mygrid = document.querySelector('#mygrid');
    mygrid.innerHTML = "";
    mygrid.append(table);

    datagridCard.style.display = 'block';

    proccesLegendGrid(gridLegends)
}

fetch('http://localhost:4000/gsheets').then(response => {
    return response.json();
}).then(data => {
    proccesGrid(data);
    const chartData = processLineChart(data);
    processBarChart(chartData);
});

function getScoreValue(figure) {
    switch(figure) {
        case "✓":
            return 1;
        case "×":
            return -1;
        default:
            return 0;
    }
}

function hideTabs() {
    document.querySelector('#gridPanel').setAttribute('aria-hidden', 'true');
    document.querySelector('#grid').setAttribute('class', 'btn btn-link nav-link');
    document.querySelector('#lineChartPanel').setAttribute('aria-hidden', 'true');
    document.querySelector('#linechart').setAttribute('class', 'btn btn-link nav-link');
    document.querySelector('#barChartPanel').setAttribute('aria-hidden', 'true');
    document.querySelector('#barchart').setAttribute('class', 'btn btn-link nav-link');
}

function switchTab(tab) {
    hideTabs();
    switch(tab) {
        case 'grid':
            document.querySelector('#gridPanel')
                .removeAttribute('aria-hidden');
            document.querySelector('#grid')
                .setAttribute('class', 'btn btn-link nav-link active');
            break;
        case 'linechart':
            document.querySelector('#lineChartPanel')
                .removeAttribute('aria-hidden');
            document.querySelector('#linechart')
                .setAttribute('class', 'btn btn-link nav-link active');
            break;
        case 'barchart':
            document.querySelector('#barChartPanel')
                .removeAttribute('aria-hidden');
            document.querySelector('#barchart')
                .setAttribute('class', 'btn btn-link nav-link active');
            break;
    }
}