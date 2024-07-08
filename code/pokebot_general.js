
// To slice by phase, allPhaseData.slice(x,y), returns the chunk of phases x-(y-1)

// Below are functions specifically for one chart, on the general page
// This function will likely become main
async function main() {
    // Get all the data so it can be passed into any function to create data/plot graphs     
    var allPhaseData = await fetchAllData();

    createTabs(allPhaseData);

    // Create front page contents
    createGeneralTabContent(allPhaseData);


    const routeCounts = countOccurrences(allPhaseData, "metLocationName");
    const routes = Object.keys(routeCounts);

    routes.forEach(route => {
        const slicedData = sliceByRoute(allPhaseData, route);
        createRouteContent(route, slicedData);
    })

    // Add event listner for seedot page
    document.getElementById('CI').addEventListener('change', updateCI)
    // Initial call
    updateCI();
}

function updateCI() {

    const CI = Number($('#CI').val());
    noEvents = oddsOf1Event(1 / 819200, CI);
    noHours = noEvents / 276;
    noDays = Math.ceil(noHours / 24);
    // console.log(noDays);

    // Define the start date
    const startDate = new Date("2023-08-27");
    // console.log("Start Date:", startDate.toDateString());

    // Calculate the end date
    const endDate = new Date(startDate); // Create a new Date object based on the start date
    endDate.setDate(startDate.getDate() + noDays); // Modify the end date
    // console.log("End Date:", endDate.toDateString());
    $('#CIOutput').empty()
    $('#CIOutput').append(`<strong>` + endDate.toDateString() + `</strong>.`)
}


function createGeneralTabContent(allPhaseData) {

    // create div to shove all the content in for formatting
    $('#generalTab').append('<div id = "general" class="tabContent"></div>')

    $('#general').append(`<div class = "title-row">
    <h2>Page visualises ${allPhaseData.length.toLocaleString()} phases, totalling ${getNumberOfEncounters(allPhaseData).toLocaleString()} Pokémon encounters</h2>
    <img src="code/images/Littleroot Town.png" alt="Map of Hoenn" class="right-aligned-image">
    </div>`)



    // Create Shiny rate plots data 
    const [allDates, shinyRateMap, statistics, areaChartSeries, shinyDates, psp] = createShinyRateData(allPhaseData);
    const shinyRateContainerNames = ['shinyRateChartContainer', 'shinyProportionAreaChartContainer']
    $('#general').append('<div class="grid-item chartContainer" id="' + shinyRateContainerNames[0] + '" style="width: 600px; height: 400px;"></div>');
    drawShinyRateChart(shinyRateContainerNames[0], allDates, shinyRateMap);
    $('#general').append('<div class="grid-item chartContainer" id="' + shinyRateContainerNames[1] + '" style="width: 600px; height: 400px;"></div>');
    drawShinyProportionAreaChart(shinyRateContainerNames[1], shinyDates, areaChartSeries);


    // $('#general').append('<div class="grid-item description">This chart displays the number of shinies caught per day</div>')
    // $('#general').append('<div class="grid-item description">This chart breaks down the proportion of shiny Pokémon caught</div>')


    // $('#general').append('<div class = "title-row">Description</div>')

    // Create streak plots data
    const [streakNums, streakNames] = createStreakData(allPhaseData);
    // Create container for the chart, the populate the container
    const streakContainerNames = ['streakBarContainer', 'streakPieContainer']
    $('#general').append('<div class="grid-item chartContainer" id="' + streakContainerNames[0] + '" style="width: 600px; height: 400px;"></div>');
    drawStreakBarChart(streakContainerNames[0], streakNames, streakNums);
    $('#general').append('<div class="grid-item chartContainer" id="' + streakContainerNames[1] + '" style="width: 600px; height: 400px;"></div>');
    drawStreakPieChart(streakContainerNames[1], streakNames, allPhaseData.length);


    // $('#general').append('<div class="grid-item description">This chart displays the number of pokemon in the longest streak for each phase</div>')
    // $('#general').append('<div class="grid-item description">This chart shows the proportion of Pokémon appearing in the longest streak</div>')






    // Create encounter rate plots data
    const [dates, pokemonNoDataObject] = createEncounterData(allPhaseData);
    const encounterRateContainerNames = ['encounterRateAreaChartContainer', 'encounterPieChartContainer']
    $('#general').append('<div class="grid-item chartContainer" id="' + encounterRateContainerNames[0] + '" style="width: 600px; height: 400px;"></div>');
    drawPokemonEncounterAreaChart(encounterRateContainerNames[0], dates, pokemonNoDataObject);
    $('#general').append('<div class="grid-item chartContainer" id="' + encounterRateContainerNames[1] + '" style="width: 600px; height: 400px;"></div>');
    drawPokemonEncounterPieChart(encounterRateContainerNames[1], pokemonNoDataObject)

    // Create pokemon IV sum distribution plots
    // const IVSumData = createIVSumData(allPhaseData);
    // console.log(IVSumData);
    // drawIVSumBoxPlot('chartContainer7', IVSumData);

    const pspContainerNames = ['pspContainer', 'pspChartContainer']
    $('#general').append('<div class="title-row ChartAndOptionsContainer" id="' + pspContainerNames[0] + '"></div>');
    $('#' + pspContainerNames[0]).append('<div id="' + pspContainerNames[1] + '" style="width: 600px; height: 400px;"></div>');
    $('#' + pspContainerNames[0]).append(`<div class="sliderControls">
    <label for="generalMovingAverageSlider">Moving Average smoothness:</label>
    <div class="sliderContainer">
        <span class="sliderLabel">Least</span>
        <input type="range" min="1" max="50" value="10" id="generalMovingAverageSlider">
        <span class="sliderLabel">Most</span>
    </div>
    </div>`);
    drawPspChart(pspContainerNames[1], psp, 'general');

    // $('#general').append('<div class="grid-item description">This chart displays the phase shiny percentage</div>')


    // Append a title row
    $('#general').append('<div class = "title-row" id="IVTitle"><hr><h2>IV Data</h2><hr></div>')

    // Create IVSum distribution chart
    const IVSumContainerNames = ['IVSumOptionsContainer', 'IVSumChartContainer']
    $('#general').append('<div class="grid-item ChartAndOptionsContainer" id="' + IVSumContainerNames[0] + '" ></div> ');
    // Append the chart to the container
    $('#' + IVSumContainerNames[0]).append('<div class="chartContainer" id="' + IVSumContainerNames[1] + '" style="width: 600px; height: 400px;"></div>');
    // Append the controls to the container
    $('#' + IVSumContainerNames[0]).append(`
    <div class="controls-container">
    <div class="left-controls">
        <div class="control-group">
            <label for="generalDataRange">Percentage of data to visualize:</label>
            <select name="generalDataRange" id="generalDataRange">
                <option value="0.001">0.01%</option>
                <option value="0.005">0.05%</option>
                <option value="0.01">1%</option>
                <option value="0.05">5%</option>
                <option value="0.1">10%</option>
                <option value="0.5">50%</option>
                <option value="1" selected>100%</option>
            </select>
        </div>
        <div class="control-group">
            <label for="generalPokemonChoice">Choose specific Pokémon:</label>
            <select name="generalPokemonChoice" id="generalPokemonChoice">
        <option value = "All" selected > All Pokemon</option >
                </select >
            </div >
        </div >
            <div class="right-controls">
                <div class="control-info">
                    <p id="generalSampleSize"></p>
                    <p id="generalIVStats"></p>
                </div>
            </div>
    </div>`)
    // Populate the chart
    drawIVSumBellCurve(IVSumContainerNames[1], allPhaseData, "general");

    // Create IV Distrubution chart
    const IVDistContainerNames = ['IVDistOptionsContainer', 'IVDistContainer'];
    $('#general').append('<div class="grid-item ChartAndOptionsContainer" id="' + IVDistContainerNames[0] + '"></div> ');
    $('#' + IVDistContainerNames[0]).append('<div id="' + IVDistContainerNames[1] + '" style="width: 600px; height: 400px;"></div>');
    $('#' + IVDistContainerNames[0]).append(`<div class="controls">
        <label for = "generalStatisticChoice">Statistic to compare to:</label>
        <select name = "generalStatisticChoice" id="generalStatisticChoice">
            <option value="mean">Mean</option>
            <option value="mode">Mode</option>
            <option value="median">Median</option>
        </select>
    </div > `)
    const [lowestIVSumStats, highestIVSumStats, lowestName, highestName] = getMinMaxIVDistributions(allPhaseData);
    // Populate the chart
    drawRadarChart(IVDistContainerNames[1], highestIVSumStats, highestName, lowestIVSumStats, lowestName, allPhaseData, "general");

    return
}

async function createRouteContent(tabName, slicedPhaseData) {

    // Get rid of spaces in tab name
    const truncatedTabName = tabName.replace(/\s+/g, '');
    $('#' + truncatedTabName + 'Tab').append('<div id = "' + truncatedTabName + '" class="tabContent"></div>')

    $('#' + truncatedTabName).append(`<div class = "title-row">
    <h2>Page visualises ${getNumberOfNonEmptyPhases(slicedPhaseData).toLocaleString()} phases, totalling ${getNumberOfEncounters(slicedPhaseData).toLocaleString()} Pokémon encounters</h2>
    <img src="code/images/${tabName}.png" alt="Map of Hoenn" class="right-aligned-image">
    </div>`)
    // $('#' + tabName.replace(/\s+/g, '')).append()

    // Create Shiny rate plots data 
    const [allDates, shinyRateMap, statistics, areaChartSeries, shinyDates, psp] = createShinyRateData(slicedPhaseData);
    const shinyRateContainerNames = [truncatedTabName + 'shinyRateChartContainer', truncatedTabName + 'shinyProportionAreaChartContainer']
    $('#' + truncatedTabName).append('<div class="grid-item chartContainer" id="' + shinyRateContainerNames[0] + '" style="width: 600px; height: 400px;"></div>');
    drawShinyRateChart(shinyRateContainerNames[0], allDates, shinyRateMap);
    $('#' + truncatedTabName).append('<div class="grid-item chartContainer" id="' + shinyRateContainerNames[1] + '" style="width: 600px; height: 400px;"></div>');
    drawShinyProportionAreaChart(shinyRateContainerNames[1], shinyDates, areaChartSeries);



    // Create encounter rate plots data
    const [dates, pokemonNoDataObject] = createEncounterData(slicedPhaseData);
    const encounterRateContainerNames = [truncatedTabName + 'encounterRateAreaChartContainer', truncatedTabName + 'encounterPieChartContainer']
    // $('#' + truncatedTabName).append('<div id="' + encounterRateContainerNames[0] + '" style="width: 600px; height: 400px;"></div>');
    // drawPokemonEncounterAreaChart(encounterRateContainerNames[0], dates, pokemonNoDataObject);
    $('#' + truncatedTabName).append('<div class="grid-item chartContainer" id="' + encounterRateContainerNames[1] + '" style="width: 600px; height: 400px;"></div>');
    drawPokemonEncounterPieChart(encounterRateContainerNames[1], pokemonNoDataObject)

    // Create expected shinies chart
    const expectedShiniesContainerNames = [truncatedTabName + 'expectedShiniesContainer']
    $('#' + truncatedTabName).append('<div class="grid-item chartContainer" id="' + expectedShiniesContainerNames[0] + '" style="width: 600px; height: 400px;"></div>')
    routeCounts = countOccurrences(slicedPhaseData, "metLocationName");
    const expectedShiniesData = await createExpectedShiniesData(areaChartSeries, tabName, routeCounts[tabName]);
    drawExpectedShiniesChart(expectedShiniesContainerNames[0], expectedShiniesData);

    const pspContainerNames = [truncatedTabName + 'pspContainer', truncatedTabName + 'pspChartContainer']
    $('#' + truncatedTabName).append('<div class="title-row ChartAndOptionsContainer" id="' + pspContainerNames[0] + '"></div>');
    $('#' + pspContainerNames[0]).append('<div id="' + pspContainerNames[1] + '" style="width: 600px; height: 400px;"></div>');
    $('#' + pspContainerNames[0]).append(`<div class="sliderControls">
    <label for="`+ truncatedTabName + `MovingAverageSlider">Moving Average smoothness:</label>
    <div class="sliderContainer">
    <span class="sliderLabel">Least</span>
    <input type="range" min="1" max="50" value="10" id="`+ truncatedTabName + `MovingAverageSlider">
    <span class="sliderLabel">Most</span>
    </div>
    </div>`);
    drawPspChart(pspContainerNames[1], psp, truncatedTabName);

    $('#' + truncatedTabName).append('<div class = "title-row" id="IVTitle"><hr><h2>IV Data</h2><hr></div>')

    // Create IVSum distribution chart
    const IVSumContainerNames = [truncatedTabName + 'IVSumOptionsContainer', truncatedTabName + 'IVSumChartContainer']
    $('#' + truncatedTabName).append('<div class="grid-item ChartAndOptionsContainer" id="' + IVSumContainerNames[0] + '" ></div > ');
    // Append the chart to the container
    $('#' + IVSumContainerNames[0]).append('<div class="centered-div" id="' + IVSumContainerNames[1] + '" style="width: 600px; height: 400px;"></div>');
    // Append the controls to the container
    $('#' + IVSumContainerNames[0]).append(`
    <div class= "controls-container" >
    <div class="left-controls">
        <div class="control-group">
            <label for="`+ truncatedTabName + `DataRange">Percentage of data to visualize:</label>
            <select name="`+ truncatedTabName + `DataRange" id="` + truncatedTabName + `DataRange">
                <option value="0.001">0.01%</option>    
                <option value="0.005">0.05%</option>
                <option value="0.01">1%</option>
                <option value="0.05">5%</option>
                <option value="0.1">10%</option>
                <option value="0.5">50%</option>
                <option value="1" selected>100%</option>
            </select>
        </div>
        <div class="control-group">
            <label for="`+ truncatedTabName + `PokemonChoice">Choose specific Pokémon:</label>
            <select name="`+ truncatedTabName + `PokemonChoice" id="` + truncatedTabName + `PokemonChoice">
                <option value="All" selected>All Pokemon</option>
            </select>
        </div>
    </div>
    <div class="right-controls">
        <div class="control-info">
            <p id="`+ truncatedTabName + `SampleSize"></p>
            <p id="`+ truncatedTabName + `IVStats"></p>
        </div>
    </div>
</div > `)
    // Populate the chart
    drawIVSumBellCurve(IVSumContainerNames[1], slicedPhaseData, truncatedTabName);

    // Create IV Distrubution chart
    const IVDistContainerNames = [truncatedTabName + 'IVDistOptionsContainer', truncatedTabName + 'IVDistContainer'];
    $('#' + truncatedTabName).append('<div class="grid-item ChartAndOptionsContainer" id="' + IVDistContainerNames[0] + '" ></div> ');
    $('#' + IVDistContainerNames[0]).append('<div id="' + IVDistContainerNames[1] + '" style="width: 600px; height: 400px;"></div>');
    $('#' + IVDistContainerNames[0]).append(`<div class= "controls">
        <label for = "`+ truncatedTabName + `StatisticChoice">Statistic to compare to:</label>
        <select name = "`+ truncatedTabName + `StatisticChoice" id="` + truncatedTabName + `StatisticChoice">
            <option value="mean">Mean</option>
            <option value="mode">Mode</option>
            <option value="median">Median</option>
        </select>
    </div > `)
    const [lowestIVSumStats, highestIVSumStats, lowestName, highestName] = getMinMaxIVDistributions(slicedPhaseData);
    // Populate the chart
    drawRadarChart(IVDistContainerNames[1], highestIVSumStats, highestName, lowestIVSumStats, lowestName, slicedPhaseData, truncatedTabName);



    return

}

function drawPspChart(renderTo, pspData, tabName) {

    var array = [...Array(250).keys()];
    const phaseNumbers = array.map(element => element + 126);



    // Calculate mean to plot it on the graph too
    var mean = calculateMean(pspData);

    // Determine the range to plot on the x axis, using the first and last non-zero entries in pspData - in general this should be 126-375, but for routes it should be smaller
    let firstIndex = -1;
    let lastIndex = -1;

    for (let i = 0; i < pspData.length; i++) {
        // There's some garbage in there giving psp values of 0.012 to I'm fudging a bit here
        if (pspData[i] > 0.1) {
            if (firstIndex === -1) {
                firstIndex = i;
            }
            lastIndex = i;
        }
    }

    // Highcharts configuration
    const chart = Highcharts.chart(renderTo, {
        chart: {
            type: 'spline',
            backgroundColor: '#f4f4f4',
            borderRadius: 10,
            shadow: true
        },
        title: {
            text: 'Phase Shiny Probability'
        },
        subtitle: {
            text: "at time of shiny encounter"
        },
        xAxis: {
            categories: phaseNumbers,
            title: {
                text: 'Phase Number'
            },
            min: firstIndex,
            max: lastIndex
        },
        yAxis: {
            title: {
                text: 'Phase Shiny Percentage'
            },
            labels: {
                formatter: function () {
                    return this.value + '%'; // Display y-axis values as percentages
                }
            },
            gridLineWidth: 1, // Add horizontal grid lines
            max: 100, // Set a maximum value for the y-axis

            // // Add the horizontal line at the mean
            // plotLines: [{
            //     value: mean,
            //     color: 'green',
            //     dashStyle: 'Dash',
            //     width: 2,
            //     zIndex: 4, // Randomly guess the zIndex to make it look good
            //     label: {
            //         text: 'Mean',
            //         align: 'right',
            //         x: 10, // Offset label to the left
            //         style: {
            //             color: 'green'
            //         }
            //     }
            // }]
        },
        tooltip: {
            shared: true,
        },
        plotOptions: {
            spline: {
                marker: {
                    enabled: false, // Disable markers for all points by default
                    states: {
                        hover: {
                            enabled: true // Enable markers on hover
                        }
                    }
                },

            },
            line: {
                opacity: 0.6, // Lower opacity for the line series
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                },
                dataLabels: {
                    enabled: true,
                    // no idea how I got this working 
                    formatter: function () {
                        const max = Math.max(...this.series.yData);
                        const min = Math.min(...this.series.yData);
                        if (this.y === max) {
                            return 'Max: ' + this.y + '%';
                        } else if (this.y === min) {
                            return 'Min: ' + this.y + '%';
                        }
                        return null;
                    }
                },
            }
        },
        series: [{
            name: 'Phase shiny percentage',
            type: 'line',
            data: pspData,
            // dashStyle: "ShortDash",
            // color: 'blue' 
        }, {
            name: 'Moving Average',
            data: [],
            color: 'red',
            dashStyle: 'ShortDash',
            marker: {
                enabled: false
            }
        }]
    });

    function updateMovingAverage() {
        // Calculate moving average
        var windowSize = Number($('#' + tabName + 'MovingAverageSlider').val());
        $('#' + tabName + 'SliderValue').empty();
        $('#' + tabName + 'SliderValue').append(windowSize);
        var movingAvg = movingAverage(pspData, windowSize);
        // Align moving average data with the original phase numbers
        var leadingNulls = Math.floor((windowSize - 1) / 2);
        var trailingNulls = windowSize - 1 - leadingNulls;
        var alignedMovingAvg = new Array(leadingNulls).fill(null).concat(movingAvg).concat(new Array(trailingNulls).fill(null));

        chart.series[1].setData(alignedMovingAvg)
    }

    document.getElementById(tabName + "MovingAverageSlider").addEventListener("change", updateMovingAverage)
    updateMovingAverage();
}

function drawExpectedShiniesChart(renderTo, expectedShiniesData) {
    // Prepare the series data
    const categories = expectedShiniesData.map(item => item.name);
    const noShinyEncountersSeries = {
        name: 'No Shiny Encounters',
        data: expectedShiniesData.map(item => ({ y: item.noShinyEncounters, color: getPokemonColour(item.name) })),
        pointPlacement: -0.15,
        borderWidth: 1,
        borderColor: '#000000'
    };
    const expectedNoShinyEncountersSeries = {
        name: 'Expected No Shiny Encounters',
        data: expectedShiniesData.map(item => ({ y: item.expectedNoShinyEncounters })),
        pointPlacement: 0.15,
        borderWidth: 1,
        borderColor: '#000000'
    };

    // Create the Highcharts chart
    Highcharts.chart(renderTo, {
        chart: {
            type: 'bar',
            backgroundColor: '#f4f4f4',
            borderRadius: 10,
            shadow: true,
        },
        title: {
            text: 'Number of shiny pokemon encountered/expected'
        },
        xAxis: {
            categories: categories,
            crosshair: true,
            reversed: true // Reverses the xAxis to align categories vertically
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Number of Encounters'
            },
            allowDecimals: false
        },
        plotOptions: {
            bar: {
                grouping: false,
                shadow: false,
                borderWidth: 0,
                pointPadding: 0,
                groupPadding: 0.4
            }
        },
        series: [noShinyEncountersSeries, expectedNoShinyEncountersSeries]
    });
}


async function createExpectedShiniesData(areaChartSeries, tabName, noDataEntries) {
    // Get the final number of shinies for each pokemon
    Object.keys(areaChartSeries).forEach(key => {
        arrLastElement = areaChartSeries[key][areaChartSeries[key].length - 1]
        areaChartSeries[key] = arrLastElement;
    })
    // console.log(areaChartSeries);

    var rateFilePath = "../data/Encounter Rates/" + tabName + ".csv";
    // console.log(rateFilePath);
    const response = await fetch(rateFilePath);
    if (!response.ok) {
        throw new Error("Failed to load csv");
    }
    const csv = await response.text();
    var lines = csv.split('\n');
    var data = [];
    lines.forEach(function (line) {
        line = line.replace(/\r/g, '');
        var values = line.split(',');
        data.push(values)
    });
    // Remove the first row
    data.shift()

    const shinyRate = 1 / 8192;
    const series = [];

    // Add a series for the total number of shinies/expected
    totalObj = {
        name: "Total",
        noShinyEncounters: Object.values(areaChartSeries).reduce((sum, value) => sum + value, 0),
        expectedNoShinyEncounters: Math.round(shinyRate * noDataEntries * 100) / 100
    }

    series.push(totalObj);

    Object.keys(areaChartSeries).forEach(key => {
        const pokeRate = Number(data.find(row => row[0] === key)[1]);

        obj = {
            name: key,
            noShinyEncounters: areaChartSeries[key],
            expectedNoShinyEncounters: Math.round(shinyRate * noDataEntries * pokeRate * 100) / 100,
            color: getPokemonColour(key)
        }
        series.push(obj)
    })

    return series;

}

function drawRadarChart(renderTo, maxIVDistribution, maxName, minIVDistribution, minName, allPhaseData, tab) {
    const chart = Highcharts.chart(renderTo, {
        chart: {
            polar: true,
            type: 'area',
            backgroundColor: '#f4f4f4',
            borderRadius: 10,
            shadow: true
        },
        title: {
            text: 'IV Distribution'
        },
        pane: {
            size: '80%',
            startAngle: 0,
            endAngle: 360
        },
        xAxis: {
            categories: ['Attack', 'Defense', 'HP', 'Special Attack', 'Special Defense', 'Speed'],
            tickmarkPlacement: 'on',
            lineWidth: 0,
            gridLineInterpolation: 'polygon' // Ensure the xAxis is polygon
        },
        yAxis: {
            gridLineInterpolation: 'polygon', // Ensure the yAxis is polygon
            min: 0,
            max: 31,
            tickInterval: 1,
            title: {
                text: 'IV Value',
                color: "#ffffff"
            },
            endOnTick: false,
            maxPadding: 0
        },
        tooltip: {
            shared: true,
            pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}</b><br/>'
        },
        legend: {
            align: 'right',
            verticalAlign: 'middle',
            layout: 'vertical'
        },
        series: [{
            name: "Highest IV Total: " + maxName,
            pointPlacement: 'off',
            color: getPokemonColour(maxName),
            data: maxIVDistribution // Set initial data
        }, {
            name: $('#' + tab + "StatisticChoice").val() + " IV Values",
            pointPlacement: 'off',
            dashStyle: "ShortDash",
            data: [] // Empty initial data for the second series
        }, {
            name: "Lowest IV Total: " + minName,
            pointPlacement: 'off',
            color: getPokemonColour(minName),
            data: minIVDistribution
        }],
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        layout: 'horizontal'
                    },
                    pane: {
                        size: '70%'
                    }
                }
            }]
        }
    });

    // Listener to update the avg type
    document.getElementById(tab + "StatisticChoice").addEventListener('change', updateRadarChart);

    // Initial call to set the data
    updateRadarChart();

    function updateRadarChart() {
        const avgIVStats = getAvgIVDistribution(allPhaseData, tab);

        chart.series[0].setData(maxIVDistribution);
        chart.series[2].setData(minIVDistribution);
        chart.series[1].setData(avgIVStats);
        chart.series[1].update({ name: $('#' + tab + "StatisticChoice").val() + " IV Values" });
    }

    return chart;
}


function getAvgIVDistribution(allPhaseData, tab) {

    attackIVs = [];
    defenseIVs = [];
    hpIVs = [];
    spAttackIVs = [];
    spDefenseIVs = [];
    speedIVs = [];

    for (let i = 0; i < allPhaseData.length; i++) {
        const phaseData = allPhaseData[i];
        // So much unpacking I'm basically moving house
        attackIVs.push(...getColumnData(phaseData, "attackIV").map(function (x) { return parseInt(x) }))
        defenseIVs.push(...getColumnData(phaseData, "defenseIV").map(function (x) { return parseInt(x) }))
        hpIVs.push(...getColumnData(phaseData, "hpIV").map(function (x) { return parseInt(x) }))
        spAttackIVs.push(...getColumnData(phaseData, "spAttackIV").map(function (x) { return parseInt(x) }))
        spDefenseIVs.push(...getColumnData(phaseData, "spDefenseIV").map(function (x) { return parseInt(x) }))
        speedIVs.push(...getColumnData(phaseData, "speedIV").map(function (x) { return parseInt(x) }))
    }


    if ($('#' + tab + 'StatisticChoice').val() === "mean") {
        attackAvg = calculateMean(attackIVs);
        defenseAvg = calculateMean(defenseIVs);
        hpAvg = calculateMean(hpIVs);
        spAttackAvg = calculateMean(spAttackIVs);
        spDefenseAvg = calculateMean(spDefenseIVs);
        speedAvg = calculateMean(speedIVs);
    } else if ($('#' + tab + 'StatisticChoice').val() === "mode") {
        attackAvg = calculateMode(attackIVs);
        defenseAvg = calculateMode(defenseIVs);
        hpAvg = calculateMode(hpIVs);
        spAttackAvg = calculateMode(spAttackIVs);
        spDefenseAvg = calculateMode(spDefenseIVs);
        speedAvg = calculateMode(speedIVs);
    } else if ($('#' + tab + 'StatisticChoice').val() === "median") {
        attackAvg = calculateMedian(attackIVs);
        defenseAvg = calculateMedian(defenseIVs);
        hpAvg = calculateMedian(hpIVs);
        spAttackAvg = calculateMedian(spAttackIVs);
        spDefenseAvg = calculateMedian(spDefenseIVs);
        speedAvg = calculateMedian(speedIVs);
    }

    return [attackAvg, defenseAvg, hpAvg, spAttackAvg, spDefenseAvg, speedAvg]
}

function getMinMaxIVDistributions(allPhaseData) {

    // Set max and min starting values to be compared against, using the range of possible values
    let MaxIVSum = 0;
    let MinIVSum = 186;
    let MaxRow;
    let MinRow;

    // Iterate over the rows of the data and identify the highest and lowest IVSum rows
    for (let i = 0; i < allPhaseData.length; i++) {
        const phaseData = allPhaseData[i];
        for (let j = 1; j < phaseData.length; j++) {
            const row = phaseData[j];

            let rowIVSum = parseInt(row[getColumnIntFromName("IVSum")]);
            if (rowIVSum > MaxIVSum) {
                MaxIVSum = rowIVSum;
                MaxRow = row;
            }
            if (rowIVSum < MinIVSum) {
                MinIVSum = rowIVSum;
                MinRow = row;
            }
        }
    }
    [minRowDistribution, lowestName] = getIVValues(MinRow);
    [maxRowDistribution, highestName] = getIVValues(MaxRow);

    return [minRowDistribution, maxRowDistribution, lowestName, highestName]
}

// Must ALWAYS be supplied allPhaseData
function drawIVSumBellCurve(renderTo, allPhaseData, tab) {

    const chart = Highcharts.chart(renderTo, {
        title: {
            text: 'IV Sum distribution'
        },
        chart: {
            backgroundColor: '#f4f4f4',
            borderRadius: 10,
            shadow: true
        },
        xAxis: {
            title: {
                text: 'IV Sum Value'
            },
            min: 0,
            max: 186
        },
        yAxis: {
            title: {
                text: 'Frequency (Normalised)'
            },
            max: 1.2,
            endOnTick: false
        },
        series: [{
            name: 'Computed Guassian of IV Sum values',
            // data: normalisedBellCurve,
            type: 'line',
            marker: {
                enabled: false
            },
            dashStyle: "ShortDash"
        }, {
            name: '(Relative) Frequency of occurance',
            type: 'scatter',
            // data: scatterData,
            marker: {
                symbol: 'circle'
            }
        }]
    });

    names = getUniqueValues(allPhaseData, "name")

    // Add names to options
    names.forEach(pokeName => {
        $('#' + tab + 'PokemonChoice').append("<option value='" + pokeName + "'>" + pokeName + " </option>")
    })

    // Add event listener to fire the update whenever the options are changed
    document.getElementById('' + tab + 'DataRange').addEventListener('change', updateChart);
    document.getElementById('' + tab + 'PokemonChoice').addEventListener('change', updateChart);

    updateChart();

    function updateChart() {
        let phaseData = []

        if (!($('#' + tab + 'PokemonChoice').val() === "All")) {
            for (let i = 0; i < allPhaseData.length; i++) {
                let matchingRows = getSpecificPokemonRows(allPhaseData[i], $('#' + tab + 'PokemonChoice').val())
                phaseData.push(matchingRows);
            }
        } else {
            phaseData = allPhaseData;
        }

        // Prepare the data
        var IVSumData = [];

        for (let i = 0; i < phaseData.length; i++) {
            const IVSumColumn = getColumnData(phaseData[i], "IVSum")
            IVSumData.push(...IVSumColumn);
        }
        // Convert strings to ints
        IVSumData = IVSumData.map(Number);

        // Get the range of data desired
        var inputValue = Number(document.getElementById('' + tab + 'DataRange').value);
        IVSumDataSlice = IVSumData.slice(0, inputValue * IVSumData.length);

        // IVSum possible ranges
        const min = 0;
        const max = 187;
        const mean = calculateMean(IVSumData);
        const stdDev = calculateStdDeviation(IVSumData, mean);

        guassianCurvePoints = []
        for (let i = min; i < max; i++) {
            guassianCurvePoints.push([i, calculateGuassian(i, mean, stdDev)])
        }

        // Normalise bell curve data
        const maxBellCurveY = Math.max(...guassianCurvePoints.map(point => point[1]));
        const normalisedBellCurve = guassianCurvePoints.map(point => [point[0], point[1] / maxBellCurveY]);


        // Count frequencies of each value in the original data
        const frequencyCounts = {};
        IVSumDataSlice.forEach(value => {
            if (frequencyCounts[value]) {
                frequencyCounts[value]++;
            } else {
                frequencyCounts[value] = 1;
            }
        });

        // Normalise frequency data
        const maxFrequency = Math.max(...Object.values(frequencyCounts));
        const scatterData = Object.keys(frequencyCounts).map(value => [parseInt(value), frequencyCounts[value] / maxFrequency]);

        const sampleSize = IVSumDataSlice.length
        $('#' + tab + 'SampleSize').empty()
        $('#' + tab + 'SampleSize').append("Size of selected sample: " + sampleSize)
        const boxPlotStats = getBoxPlotValues(IVSumDataSlice);
        $('#' + tab + 'IVStats').empty();
        $('#' + tab + 'IVStats').append("\nMin IV value: " + boxPlotStats[0] + "<br>Median IV value: " + boxPlotStats[2] + "<br>Max IV value: " + boxPlotStats[4]);


        // Update chart series
        chart.series[0].setData(normalisedBellCurve);
        chart.series[1].setData(scatterData);
    }

}

function createIVSumData(phaseData) {
    // Data needs to look like
    // data = [
    //     { name: 'Poochyena', values: [5, 7, 8, 9, 10] },
    //     { name: 'Wurmple', values: [3, 5, 6, 8, 9] },
    //   ];

    // I need the name of each pokemon and it's IV sum value

    const IVSumObj = {};

    for (let i = 0; i < phaseData.length; i++) {
        const nameColumn = getColumnData(phaseData[i], "name");
        const IVSumColumn = getColumnData(phaseData[i], "IVSum");

        for (let j = 0; j < nameColumn.length; j++) {
            const name = nameColumn[j];
            const IVSum = IVSumColumn[j];
            console.log(IVSum);
            if (IVSum === "2") {
                console.log("Phase " + indexToPhaseNum(i) + ", row " + j);
            }
            if (IVSumObj.hasOwnProperty(name)) {
                IVSumObj[name].push(parseInt(IVSum));
            }
            else {
                IVSumObj[name] = [parseInt(IVSum)];
            }
        }
    }
    // Filter out some of the garbage values - Redundant but doesn't hurt
    for (const [key, value] of Object.entries(IVSumObj)) {
        if (value.length === 1) {
            delete IVSumObj[key];
        }
    }

    // Create new object for storing box plot data
    const IVSumDataObj = {};
    // Iterate through IVSum object and populate data object
    for ([key, value] of Object.entries(IVSumObj)) {
        IVSumDataObj[key] = getBoxPlotValues(value);
    }

    return IVSumDataObj
}

// Redundant
function drawIVSumBoxPlot(renderTo, IVSumData) {
    // FIXME: AHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH
    var pokemonData = [];
    for (const [key, value] of Object.entries(IVSumData)) {
        var dataEntry = {
            x: key,
            low: value[0],
            q1: value[1],
            median: value[2],
            q3: value[3],
            high: value[4],
            fillColor: getPokemonColour(key)
        };
        pokemonData.push(dataEntry);
    }

    const pokemonNames = Object.keys(IVSumData); // Extract Pokémon names
    // console.log("Pokémon Names:", pokemonNames);
    // console.log("Pokémon Data:", pokemonData);

    // Highcharts configuration
    Highcharts.chart(renderTo, {
        chart: {
            type: 'boxplot'
        },
        title: {
            text: 'Pokémon IV Box and Whisker Plot'
        },
        legend: {
            enabled: true
        },
        xAxis: {
            categories: pokemonNames, // Set categories to Pokémon names
            title: {
                text: 'Pokémon'
            }
        },
        yAxis: {
            title: {
                text: 'IV Values'
            }
        },
        series: pokemonData
    });

}

function createEncounterData(phaseData) {

    // Convert 2D to 3D array if 2D is supplied
    if (!Array.isArray(phaseData[0][0])) {
        phaseData = [phaseData];
    }

    // Create a map to store counts of names for each date
    const pokemonCountMap = new Map();


    // Get an array of the unique dates in the data, leveraging the Set's no duplicates property. Does the same for names.
    var allDatesSet = new Set();
    var allNamesSet = new Set();
    for (let i = 0; i < phaseData.length; i++) {
        var dateColumn = getColumnData(phaseData[i], "date");
        var nameColumn = getColumnData(phaseData[i], "name");

        allDatesSet.add(...dateColumn);
        allNamesSet.add(...nameColumn);

        // Populate the pokemon count map

        // Iterate through the dates and names arrays
        for (let i = 0; i < dateColumn.length; i++) {
            const date = dateColumn[i];
            const name = nameColumn[i];

            // Get or set the map for the current date
            if (!pokemonCountMap.has(date)) {
                pokemonCountMap.set(date, new Map());
            }
            const nameCountMap = pokemonCountMap.get(date);

            // Get or set the count for the current name
            if (!nameCountMap.has(name)) {
                nameCountMap.set(name, 0);
            }
            nameCountMap.set(name, nameCountMap.get(name) + 1);
        }
    }

    // Convert nameCountMap to show cumilitive counts rather than daily counts
    // Get and sort the dates
    const dates = Array.from(pokemonCountMap.keys()).sort();

    // Iterate through the sorted dates
    for (let i = 1; i < dates.length; i++) {
        const currentDate = dates[i];
        const previousDate = dates[i - 1];

        const currentCountMap = pokemonCountMap.get(currentDate);
        const previousCountMap = pokemonCountMap.get(previousDate);

        // Update the current count map with cumulative values
        for (const [name, count] of previousCountMap.entries()) {
            if (currentCountMap.has(name)) {
                currentCountMap.set(name, currentCountMap.get(name) + count);
            } else {
                currentCountMap.set(name, count);
            }
        }
    }

    const pokemonCountObject = Object.fromEntries(pokemonCountMap);

    // Maps are inconvenient, and don't work with highcharts so we convert to an object containing arrays for each pokemon across all the data
    // Step one is get all the names of all the pokemon that appear
    allPokemonNames = new Set();
    Object.values(pokemonCountObject).forEach(day => {
        for (const key of day.keys()) {
            allPokemonNames.add(key);
        }
    })
    // Step two we initialise the object and assign an empty array to each pokemon
    const pokemonNoDataObject = {};
    for (const key of allPokemonNames) {
        pokemonNoDataObject[key] = [];
    }
    // Step three we populate the array with the values in the maps, adding 0 if the pokemon has no mention in the map (i.e they've swapped routes and are getting new mons)
    Object.values(pokemonCountObject).forEach(day => {
        for (const name of allPokemonNames) {
            pokemonNoDataObject[name].push(day.get(name) || 0);
        }
    })
    // Finally pokemonNoDataObject is of a form we can convert to highcharts data easily (using shiny caught logic)
    return [dates, pokemonNoDataObject];
}

function drawPokemonEncounterAreaChart(renderTo, dates, pokemonNoDataObject) {

    var highchartsData = [];
    Object.keys(pokemonNoDataObject).forEach(key => {
        let dataEntry = {
            name: key,
            data: pokemonNoDataObject[key],
            color: getPokemonColour(key)
        };
        highchartsData.push(dataEntry);
    })
    // Get rid of garbage in the data
    const filteredData = highchartsData.filter(pokemon => pokemon.data[pokemon.data.length - 1] > 1);


    Highcharts.chart(renderTo, {
        chart: {
            type: 'area',
            backgroundColor: '#f4f4f4',
            borderRadius: 10,
            shadow: true
        },
        title: {
            text: 'Total pokemon encountered'
        },
        xAxis: {
            categories: dates,
            title: {
                text: 'Date'
            }
        },
        yAxis: {
            title: {
                enabled: false
            },
            labels: {
                format: '{value}%'
            }
        },
        series: filteredData,
        legend: {
            enabled: true
        },
        plotOptions: {
            area: {
                stacking: 'percent',
                marker: { enabled: false },
                pointPlacement: "on"
            },
        },

    });
}

function drawPokemonEncounterPieChart(renderTo, pokemonNoDataObject) {
    // Convert frequency map into array of data points
    const chartData = [];

    Object.keys(pokemonNoDataObject).forEach(key => {
        pokemonData = {
            name: key,
            y: pokemonNoDataObject[key][pokemonNoDataObject[key].length - 1],
            color: getPokemonColour(key)
        }
        chartData.push(pokemonData)
    })

    // Get rid of garbage in the data 
    const filteredData = chartData.filter(pokemon => pokemon.y > 1);


    Highcharts.chart(renderTo, {
        chart: {
            type: 'pie',
            backgroundColor: '#f4f4f4', // Light grey background
            borderRadius: 10, // Rounded corners
            shadow: true // Add a shadow for depth
        },
        title: {
            text: 'Number of encounters'
        },
        plotOptions: {
            series: {
                allowPointSelect: true,
                dataLabels: [{
                    enabled: true,
                    distance: 20
                }, {
                    enabled: true,
                    distance: -40,
                    format: '{point.percentage:.1f}%',
                    style: {
                        fontSize: '1.2em',
                        textOutline: 'none',
                        opacity: 0.7
                    },
                    filter: {
                        operator: '>=',
                        property: 'percentage',
                        value: 10
                    }
                }]
            },
        },
        series: [{
            name: 'Number of encounters',
            data: filteredData
        }
        ]
    });
}

// Function to detect longest streak (designed for names, works on anything)
function getLongestStreak(data) {
    var longestStreak = 0;
    var longestStreakValue;

    counter = 0;
    for (let i = 0; i < data.length; i++) {
        // Check if next row has the same entry in it
        if (data[i] === data[i + 1]) {
            counter++;
        }
        else {
            // Strict greater than, so that new streak of the same length doesn't overwrite previous
            if (counter > longestStreak) {
                longestStreak = counter;
                longestStreakValue = data[i];
            }
            counter = 0
        }
    }
    // Return the longest streak with a + 1 for fudge, as well as the name of the pokemon in the streak
    var longest = [longestStreak + 1, longestStreakValue];
    return longest;
}

// Returns the longest streak and pokemon of said streak per phase
function createStreakData(phaseData) {

    let streakDataNums = [];
    let streakDataNames = [];
    // Iterate through all the phase data
    // I first wrote this function to always expect a 3D array, this is a fudge that converts a supplied 2D array to a 3D so it still works - I don't actually know if I'll need this use case but I'm doing tidying now because I need to settle into the rhythm
    if (!Array.isArray(phaseData[0][0])) {
        phaseData = [phaseData];
    }


    for (let i = 0; i < phaseData.length; i++) {
        let streak = getLongestStreak(getColumnData(phaseData[i], "name"));

        streakDataNums.push(streak[0]);
        streakDataNames.push(streak[1]);
    }

    return [streakDataNums, streakDataNames];
}

// Draws the streak bar chart
function drawStreakBarChart(renderTo, streakNames, streakNums) {
    // X data names
    var array = [...Array(250).keys()];
    const phaseNumbers = array.map(element => element + 126);

    // Y data points
    let chartData = [];
    for (let i = 0; i < streakNums.length; i++) {
        let dataPoint = {
            y: streakNums[i],
            name: "Phase " + indexToPhaseNum(i) + ", " + streakNames[i],
            color: getPokemonColour(streakNames[i])
        }
        chartData.push(dataPoint);
    }


    Highcharts.chart(renderTo, {
        chart: {
            type: 'column',
            backgroundColor: '#f4f4f4',
            borderRadius: 10,
            shadow: true
        },
        title: {
            text: 'Longest Streak per phase'
        },
        xAxis: {
            title: {
                text: "Phase Number"
            },
            categories: phaseNumbers
        },
        yAxis: {
            title: {
                text: "Number of pokemon in longest streak"
            }
        },
        series: [{
            name: 'Number of pokemon in streak',
            data: chartData,
            dataLabels: {
                enabled: true,
                formatter: function () {
                    const max = Math.max(...this.series.yData);
                    const min = Math.min(...this.series.yData);
                    if (this.y === max) {
                        return 'Max: ' + this.y;
                    } else if (this.y === min) {
                        return 'Min: ' + this.y;
                    }
                    return null;
                }
            }
        }],
        legend: {
            enabled: false
        },
    });
}

// Draws the streak pie chart
function drawStreakPieChart(renderTo, streakNames, noEncounters) {

    // Fuck it create the data points in here
    const frequencyMap = {}

    streakNames.forEach(str => {
        if (frequencyMap[str]) {
            frequencyMap[str] += 1;
        } else {
            frequencyMap[str] = 1;
        }
    });

    // Convert frequency map into array of data points
    const chartData = [];
    for (const key in frequencyMap) {
        if (frequencyMap.hasOwnProperty(key)) {
            chartData.push({
                // Each point should contain pokemon name, % of times it showed up, and it's associated colour
                name: key,
                y: frequencyMap[key],
                color: getPokemonColour(key)
            });
        }
    }



    Highcharts.chart(renderTo, {
        chart: {
            type: 'pie',
            backgroundColor: '#f4f4f4',
            borderRadius: 10,
            shadow: true
        },
        title: {
            text: 'Pokemon in longest streak'
        },
        plotOptions: {
            series: {
                allowPointSelect: true,
                dataLabels: [{
                    enabled: true,
                    distance: 20
                }, {
                    enabled: true,
                    distance: -40,
                    format: '{point.percentage:.1f}%',
                    style: {
                        fontSize: '1.2em',
                        textOutline: 'none',
                        opacity: 0.7
                    },
                    filter: {
                        operator: '>=',
                        property: 'percentage',
                        value: 10
                    }
                }]
            },
        },
        series: [{
            name: 'Number of longest streak occurrences',
            data: chartData
        }
        ]
    });
}

// Returns information about the shiny pokemon encountered in the phase
function createShinyRateData(phaseData) {

    // Not sure we're going to use the names for anything but can't hurt to have them ready
    var dates = []
    var names = []
    // Create a set of all dates in the data
    var mapDates = new Set();

    // Get psp for each phase
    phaseShinyProbabilities = [];

    // I first wrote this function to always expect a 3D array, this is a fudge that converts a supplied 2D array to a 3D so it still works - I don't actually know if I'll need this use case but I'm doing tidying now because I need to settle into the rhythm
    if (!Array.isArray(phaseData[0][0])) {
        phaseData = [phaseData];
    }

    for (let i = 0; i < phaseData.length; i++) {
        // The last element of every 2d array in phaseData is the shiny row, so access it's date
        var shinyDate = standardiseDate(phaseData[i][phaseData[i].length - 1][getColumnIntFromName("date")]);
        var shinyName = phaseData[i][phaseData[i].length - 1][getColumnIntFromName("name")];

        // Filtering out any pokemon with a goofy pokerus status, it fucks with all the data and the entry is unreliable
        var shinyPokerusStatus = phaseData[i][phaseData[i].length - 1][getColumnIntFromName("pokerusStatus")];
        if (shinyPokerusStatus == "none") {
            dates.push(shinyDate);
            names.push(shinyName);
        }

        for (let j = 0; j < phaseData[i].length; j++) {
            mapDates.add(standardiseDate(phaseData[i][j][getColumnIntFromName("date")]))
        }

        // Push psp to array (remember to -1 for the title row)
        phaseShinyProbabilities.push(binomialProbability(phaseData[i].length - 1, 1 / 8192));

    }
    mapDates.delete("date")

    // Initialise the map to have a 0 value for all dates
    var shinyRateMap = new Map();
    mapDates.forEach(date => {
        shinyRateMap.set(date, 0);
    })



    // Increment the map for dates where shinies occured
    for (let i = 0; i < dates.length; i++) {
        var currentValue = shinyRateMap.get(dates[i]);
        shinyRateMap.set(dates[i], currentValue + 1);
    }

    // Creating the data series for proportion of shinies for the area chart
    var namesSet = new Set(names);

    // Create an array for each unique shiny that has been found, set the first value to 0
    let series = {};
    namesSet.forEach(pokemonName => {
        series[`${pokemonName}`] = [0];
    })

    // Iterate over all the found shiny's names, increment the value of the last value of the array in the found shiny's array, duplicate all others
    for (let i = 0; i < names.length; i++) {
        // Incrementing the found shiny's array's last entry
        arrLength = series[names[i]].length
        series[names[i]].push(parseInt(series[names[i]][arrLength - 1]) + 1)

        // Duplicating the last entry of the other arrays
        Object.keys(series).forEach(key => {
            if (key != names[i]) {
                series[key].push(parseInt(series[key][arrLength - 1]));
            }
        })

    }
    // Delete the starting 0
    Object.values(series).forEach(arr => {
        arr.shift();
    })

    // Compute statistics for the shiny rate map
    let statistics = calculateMapStatistics(shinyRateMap);


    const mapDatesArr = Array.from(mapDates)
    return [mapDatesArr, shinyRateMap, statistics, series, dates, phaseShinyProbabilities];
}

function drawShinyRateChart(renderTo, dates, chartDataMap) {
    // Convert Map data to an array of [x, y] pairs for Highcharts
    const chartData = Array.from(chartDataMap, ([date, value]) => ({ name: date, y: value }));

    Highcharts.chart(renderTo, {
        chart: {
            type: 'column',
            backgroundColor: '#f4f4f4',
            borderRadius: 10,
            shadow: true,
        },
        title: {
            text: 'Number of shinies per day'
        },
        xAxis: {
            categories: dates,
            title: {
                text: 'Date'
            }
        },
        yAxis: {
            title: {
                text: 'Shinies caught'
            }
        },
        series: [{
            name: 'Number of shinies caught',
            data: chartData,
            borderWidth: 1,
            borderColor: '#000000',
            color: "#3ad6bc"
        }],
        legend: {
            enabled: false
        }
    });
};

function drawShinyProportionAreaChart(renderTo, dates, chartData) {

    let highchartsData = [];

    Object.keys(chartData).forEach(key => {
        let dataEntry = {
            name: key,
            data: chartData[key],
            color: getPokemonColour(key)
        };
        highchartsData.push(dataEntry);
    })

    Highcharts.chart(renderTo, {
        chart: {
            type: 'area',
            backgroundColor: '#f4f4f4',
            borderRadius: 10,
            shadow: true
        },
        title: {
            text: 'Shinies caught'
        },
        xAxis: {
            categories: dates,
            title: {
                text: 'Date'
            }
        },
        yAxis: {
            title: {
                enabled: false
            },
            labels: {
                format: '{value}%'
            }
        },
        series: highchartsData,
        legend: {
            enabled: true
        },
        plotOptions: {
            area: {
                stacking: 'percent',
                marker: { enabled: false },
                pointPlacement: "on"
            },
        },

    });
}

main();
