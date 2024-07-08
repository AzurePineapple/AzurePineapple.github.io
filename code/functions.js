// Below are general functions that will be used in other files

// Function to read and parse CSV data
function parseCSV(csv, phaseNumber) {
    // Split the CSV into lines
    var lines = csv.split('\n');
    var data = [];

    // Iterate over lines and split each line into array of values
    count = 0
    lines.forEach(function (line) {
        var values = line.split(',');
        // Add row to table if there are the expected number of entries
        if (values.length === 65) {
            data.push(values)
        }
        else if (values.length === 1) {
            //pass
        }
        else {
            console.log("Problem parsing row from csv " + phaseNumber + ", incorrect number of columns detected in row " + count);
            console.log(values.length);
        }
        count += 1;
    });

    return data;
}

// Get column index from the name of the column
function getColumnIntFromName(column) {
    titles = ["IVSum", "ability", "altAbility", "attack", "attackEV", "attackIV", "date", "defense", "defenseEV", "defenseIV", "experience", "friendship", "hasSpecies", "heldItem", "hiddenPowerType", "hp", "hpEV", "hpIV", "isBadEgg", "isEgg", "itemName", "language", "level", "magicWord", "mail", "markings", "maxHP", "metGame", "metLevel", "metLocation", "metLocationName", "move_1", "move_1_pp", "move_2", "move_2_pp", "move_3", "move_3_pp", "move_4", "move_4_pp", "name", "nature", "otGender", "otId", "personality", "pokeball", "pokerus", "pokerusStatus", "ppBonuses", "shiny", "shinyValue", "spAttack", "spAttackEV", "spAttackIV", "spDefense", "spDefenseEV", "spDefenseIV", "species", "speed", "speedEV", "speedIV", "status", "time", "type_1", "type_2", "zeroPadNumber"];
    return titles.indexOf(column);
}

// Get the data from a given column, can take string or index input
function getColumnData(data, column) {
    try {
        if (typeof column === 'string') {
            column = getColumnIntFromName(column)
        }
        if (!(column >= 0 && column <= 65)) {
            throw new Error("Input is not a valid column");
        }

        // Get the data from the column where the first element matches the input parameter "column"
        var columnData = data
            // The filter filters out rows where the pokerusStatus is infected or cured, as I have noticed these entries have some false metLocation entries
            .filter(function (row) { return row[getColumnIntFromName("pokerusStatus")] === "none"; })
            // These filters sanity check the IV values as a few rogue entries were leaking through
            .filter(function (row) { return (0 <= parseInt(row[getColumnIntFromName("attackIV")])) && (parseInt(row[getColumnIntFromName("attackIV")]) <= 31); })
            .filter(function (row) { return (0 <= parseInt(row[getColumnIntFromName("defenseIV")])) && (parseInt(row[getColumnIntFromName("defenseIV")]) <= 31); })
            .filter(function (row) { return (0 <= parseInt(row[getColumnIntFromName("hpIV")])) && (parseInt(row[getColumnIntFromName("hpIV")]) <= 31); })
            .filter(function (row) { return (0 <= parseInt(row[getColumnIntFromName("spAttackIV")])) && (parseInt(row[getColumnIntFromName("spAttackIV")]) <= 31); })
            .filter(function (row) { return (0 <= parseInt(row[getColumnIntFromName("spDefenseIV")])) && (parseInt(row[getColumnIntFromName("spDefenseIV")]) <= 31); })
            .filter(function (row) { return (0 <= parseInt(row[getColumnIntFromName("speedIV")])) && (parseInt(row[getColumnIntFromName("speedIV")]) <= 31); })
            // This returns the column of the filtered rows
            .map(function (row) { return row[column]; });
        // Removes the first element of that column, which is the title of the column (if present), so the return contains just data
        if (titles.includes(columnData[0])) {
            columnData.shift();
        }

        return columnData;
    }
    catch (error) {
        console.error(error)
    }
}

// Function to fetch CSV file - Redundant
async function fetchPhaseData(phaseNumber) {
    // Path to your local CSV file
    var csvFilePath = '../data/Individual Phase Data/Phase ' + phaseNumber + ' Encounters.csv';

    const response = await fetch(csvFilePath);
    if (!response.ok) {
        throw new Error("Failed to load csv");
    }
    const csv = await response.text();

    var phaseData = parseCSV(csv);
    return phaseData;
}

// Fetches ALL phase csv files and compiles into one 3D array for manipulation
async function fetchAllData() {
    // Set to 250 to use all phases of data, limit to smaller amount (20) for testing
    onlyUseThisManyPhases = 250;


    // Create some fun garbage for a loading bar
    const totalSteps = onlyUseThisManyPhases;
    const progressIncrement = 100 / totalSteps;

    // Hide the page contents
    const pageContainer = document.getElementById("tabs");
    pageContainer.classList.add("hidden");
    // const title = document.getElementById("title");
    // title.classList.add("hidden");

    // Unhide the loading bar
    const progressContainer = document.getElementById('loading-bar-container');
    progressContainer.classList.remove("hidden");

    // Create an array containing values 0-250
    var array = [...Array(onlyUseThisManyPhases).keys()];
    // Add 126 to that array so i have an array of the phase numbers
    const phaseNumbers = array.map(element => element + 126);

    let allPhaseData = [];
    for (let i = 0; i < phaseNumbers.length; i++) {
        var phaseNumber = phaseNumbers[i];
        var csvFilePath = '../data/Individual Phase Data/Phase ' + phaseNumber + ' Encounters.csv';
        const response = await fetch(csvFilePath);
        if (!response.ok) {
            throw new Error("Failed to load csv");
        }
        const csv = await response.text();

        var phaseData = parseCSV(csv, phaseNumber);
        allPhaseData.push(phaseData)
        // console.log(phaseData[1][getColumnIntFromName("name")]);

        // Increment the progress bar
        const progressBar = document.getElementById('progress-bar');
        progressBar.style.width = `${progressIncrement * i}%`;
    }

    // Remove the progress bar from the page
    progressContainer.classList.add("hidden");
    // Hide the page contents
    pageContainer.classList.remove("hidden");
    // title.classList.remove("hidden");
    // Return the Beeg array
    return allPhaseData;
}

// Function to create tab for each route in the data
function createTabs(allPhaseData) {

    routeCounts = countOccurrences(allPhaseData, "metLocationName");

    Object.keys(routeCounts).forEach(key => {
        $('#generalTabLabel').after('<li class="tabLabel"><a href="#' + key.replace(/\s+/g, '') + 'Tab">' + key + '</a></li>')
        $('#generalTab').after('<div id="' + key.replace(/\s+/g, '') + 'Tab" class="tab"></div>')
        // $('#' + key.replace(/\s+/g, '')).append('<span>Number of data entries: ' + routeCounts[key] + '</span')
    })
    $('#tabs').tabs('refresh');
}

function phaseNumToIndex(phaseNumber) {
    return phaseNumber - 126;
}

function indexToPhaseNum(index) {
    return index + 126;
}

// Ensures consistent pokemon colours throughout
function getPokemonColour(pokemon) {
    const PokemonColours = {
        Grey: "#808080",
        Brown: "#8B4513",
        Blue: "#1e29ff",
        Green: "#228B22",
        Purple: "#800080",
        Red: "#FF6347",
        Yellow: "#f6cb65",
        Tan: "#D2B48C",
        LightBlue: "#ADD8E6",
        Orange: "#FFA500",
        Pink: "#FFC0CB",
        Lime: "#00FF00",
        Teal: "#008080",
        Lavender: "#E6E6FA",
        Salmon: "#FA8072",
        Gold: "#FFD700"
    };
    // There's probably a better way to do this but w/e
    switch (pokemon) {
        case "Wurmple":
            return PokemonColours.Purple;
        case "Zigzagoon":
            return PokemonColours.Grey;
        case "Lotad":
            return PokemonColours.Blue;
        case "Ralts":
            return PokemonColours.Green;
        case "Poochyena":
            return PokemonColours.Yellow;
        case "Seedot":
            return PokemonColours.Tan;
        case "Unown":
            return PokemonColours.Red;
        case "Whismur":
            return PokemonColours.Lavender;
        case "Wingull":
            return PokemonColours.LightBlue;
        case "Nincada":
            return PokemonColours.Brown;
        case "Marill":
            return PokemonColours.Blue;
        case "Taillow":
            return PokemonColours.Lime;
        case "Shroomish":
            return PokemonColours.Green;
        case "Abra":
            return PokemonColours.Pink;
        case "Slakoth":
            return PokemonColours.Tan;
        case "Skitty":
            return PokemonColours.Salmon;
        default:
            console.log("Colour requested for " + pokemon + ", no colour defined.");
            return null;
    }
}

function calculateMapStatistics(inputMap) {
    // Extract values from the map
    let values = Array.from(inputMap.values());

    // Calculate the number of data points
    let n = values.length;

    if (n === 0) {
        console.log("No data points found.");
        return;
    }

    // Calculate the sum of values without a for loop, still don't really understand reduce but it's cool
    let sum = values.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // Calculate the mean 
    let mean = sum / n;

    // Calculate the sum of squared differences from the mean
    let sumOfSquaredDifferences = values.reduce((accumulator, currentValue) => {
        return accumulator + Math.pow(currentValue - mean, 2);
    }, 0);

    // Calculate the variance
    let variance = sumOfSquaredDifferences / (n - 1);

    // Calculate the standard deviation
    let standardDeviation = Math.sqrt(variance);


    let min = Math.min(...values);
    let max = Math.max(...values);

    // Prepare the statistics object to return
    let statistics = {
        sum: sum,
        mean: mean,
        variance: variance,
        standardDeviation: standardDeviation,
        min: min,
        max: max,
        expectedDaysForShiny: 1 / mean
    };

    return statistics;
}

function countUniqueItems(arr) {
    let uniqueItems = new Set(arr);
    return uniqueItems.size;
}

// Function to return the data that takes place on a specific route
function sliceByRoute(allPhaseData, route) {
    var filteredPhaseData = [];
    // Add the title row from any phase in allPhaseData
    // filteredPhaseData.push(allPhaseData[0][0]);

    for (let i = 0; i < allPhaseData.length; i++) {
        const phaseData = allPhaseData[i];
        // Return the array with only rows where row matches the desired route
        const routePhaseData = phaseData.filter(function (row) { return row[getColumnIntFromName("metLocationName")] === route })

        // Add the title row back in just in case
        routePhaseData.unshift(allPhaseData[0][0])

        filteredPhaseData.push(routePhaseData)

    }

    return filteredPhaseData;
}


// FIXME: Needs to be repaired in the same manner as sliceByRoute - Redundant
function sliceByDate(allPhaseData, start, end) {
    var filteredPhaseData = [];
    // Add the title row from any phase in allPhaseData
    filteredPhaseData.push(allPhaseData[0][0]);

    // Reformat date string to gross American way
    var parts = start.split('-')
    const startMDY = parts[1] + "-" + parts[0] + "-" + parts[2];
    parts = end.split('-')
    const endMDY = parts[1] + "-" + parts[0] + "-" + parts[2];

    const startDate = new Date(startMDY);
    const endDate = new Date(endMDY);
    // Add 1 to end date as comparisons below are non inclusive for some reason despite being <=, definite fudge
    endDate.setDate(endDate.getDate() + 1);

    if (!(endDate >= startDate)) {
        throw new Error("Invalid date range given")
    }


    for (let i = 0; i < allPhaseData.length; i++) {
        for (let row = 0; row < allPhaseData[i].length; row++) {
            // For each row in each phase check if the location matches the desired date range
            // For some reason these are already in American format? Despite the data having it in UK. Weird.
            var rowDate = allPhaseData[i][row][getColumnIntFromName("date")]
            // console.log(rowDate);

            // Skip the row if it is the title row of a phase data sheet
            if (rowDate === "date") {
                continue
            }
            else {
                rowDateObject = new Date(rowDate);
                // console.log(startDate);
                // console.log(rowDateObject < endDate);

                if ((startDate <= rowDateObject) && (rowDateObject <= endDate)) {
                    filteredPhaseData.push(allPhaseData[i][row]);
                }
            }
        }
    }
    return filteredPhaseData;
}

function getBoxPlotValues(arr) {
    // Sort the array in ascending order
    arr.sort((a, b) => a - b);

    function median(values) {
        // Sort again just in case
        values.sort((a, b) => a - b);
        const len = values.length;
        const halfIndex = Math.floor(len / 2);

        if (len % 2 === 0) {
            return (values[halfIndex - 1] + values[halfIndex]) / 2.0;
        }
        else {
            return values[halfIndex];
        }
    }

    // Get the various bits from the sorted array
    const min = arr[0];
    const max = arr[arr.length - 1];
    const medianValue = median(arr);
    // Split the data in half, find the median of each half to find the quartiles
    const lowerHalf = arr.slice(0, Math.floor(arr.length / 2));
    const upperHalf = arr.slice(Math.ceil(arr.length / 2));
    const q1 = median(lowerHalf);
    const q3 = median(upperHalf);


    return [min, q1, medianValue, q3, max]
}

// Helper function to calculate the mean of an array
function calculateMean(arr) {
    if (arr.length === 0) return null; // Return null for an empty array

    let sum = 0;

    // Calculate the sum of all elements in the array
    for (const num of arr) {
        sum += num;
    }

    return sum / arr.length;
}

// Returns highest modal value
function calculateMode(arr) {
    if (arr.length === 0) return null; // Return null for an empty array

    const frequencyMap = new Map();
    let maxFrequency = 0;
    let mode = [];

    // Calculate the frequency of each element in the array
    for (const num of arr) {
        const frequency = (frequencyMap.get(num) || 0) + 1;
        frequencyMap.set(num, frequency);
        if (frequency > maxFrequency) {
            maxFrequency = frequency;
        }
    }

    // Find all elements that have the maximum frequency
    for (const [num, frequency] of frequencyMap.entries()) {
        if (frequency === maxFrequency) {
            mode.push(num);
        }
    }

    return mode[0];
}


function calculateMedian(arr) {
    if (arr.length === 0) return null; // Return null for an empty array

    // Sort the array
    const sortedArr = arr.slice().sort((a, b) => a - b);

    const mid = Math.floor(sortedArr.length / 2);

    // Check if the length of the array is even or odd
    if (sortedArr.length % 2 === 0) {
        // If even, average the two middle numbers
        return (sortedArr[mid - 1] + sortedArr[mid]) / 2;
    } else {
        // If odd, return the middle number
        return sortedArr[mid];
    }
}

// Helper function to calculate the SD of an array
function calculateStdDeviation(arr, mean) {
    const variance = arr.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / arr.length;
    return Math.sqrt(variance);
}

// Helper function to calculate the value of a guassian at a point given a mean and stdDeviation
function calculateGuassian(x, mean, stdDev) {
    return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
}

// Utlity function to get all rows of pokemon name, accepts 2D array
function getSpecificPokemonRows(phaseData, name) {
    let matchingRows = []
    for (let i = 0; i < phaseData.length; i++) {
        let rowName = phaseData[i][getColumnIntFromName("name")];
        if (rowName === name) {
            matchingRows.push(phaseData[i])
        }
    }
    return matchingRows
}

// Takes allPhaseData, produces an array of every unique value in it
function getUniqueValues(allPhaseData, column) {
    let valueCounts = new Map();
    let uniqueVals = new Set();

    // Count the frequency of each value
    for (let i = 0; i < allPhaseData.length; i++) {
        let desiredCol = getColumnData(allPhaseData[i], column);
        desiredCol.forEach(value => {
            if (valueCounts.has(value)) {
                valueCounts.set(value, valueCounts.get(value) + 1);
            } else {
                valueCounts.set(value, 1);
            }
        });
    }

    // Add to uniqueVals only if the value appears more than once
    valueCounts.forEach((count, value) => {
        if (count > 1) {
            uniqueVals.add(value);
        }
    });

    return uniqueVals;
}

// Returns a map of the unique occurances in supplied column in data, value is the number of occurrences
function countOccurrences(allPhaseData, column) {
    const occurrenceObj = {}

    for (let i = 0; i < allPhaseData.length; i++) {
        let columnData = getColumnData(allPhaseData[i], column);

        for (let j = 0; j < columnData.length; j++) {
            const element = columnData[j];

            if (occurrenceObj.hasOwnProperty(element)) {
                occurrenceObj[element] += 1;
            } else {
                occurrenceObj[element] = 1;
            }
        }
    }
    return occurrenceObj;
}

function getIVValues(row) {
    // Ensure title row isn't being accessed
    if (row[getColumnIntFromName("attackIV")] === "attackIV") {
        throw new Error("Accessing title row, start loop from i=1");
    }

    let attackIV = parseInt(row[getColumnIntFromName("attackIV")]);
    let defenseIV = parseInt(row[getColumnIntFromName("defenseIV")]);
    let hpIV = parseInt(row[getColumnIntFromName("hpIV")]);
    let spAttackIV = parseInt(row[getColumnIntFromName("spAttackIV")]);
    let spDefenseIV = parseInt(row[getColumnIntFromName("spDefenseIV")]);
    let speedIV = parseInt(row[getColumnIntFromName("speedIV")]);

    let IVs = [attackIV, defenseIV, hpIV, spAttackIV, spDefenseIV, speedIV];
    let pokemonName = row[getColumnIntFromName("name")];
    return [IVs, pokemonName];
}

function standardiseDate(dateString) {
    // Check if the date is in "dd/mm/yyyy" format
    if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // If the date is already in "yyyy-mm-dd" format, return it as is
    if (dateString.includes('-')) {
        return dateString;
    }

    // Return the title column, this is dealt with elsewhere
    if (dateString === "date") {
        return dateString
    }

    // Handle invalid date formats
    throw new Error(`Invalid date format: ${dateString}`);
}
// Use the binomial formula to return odds of an event happening at least once, rounded to 2 dp
function binomialProbability(n, odds) {
    const probZeroSuccess = Math.pow(1 - odds, n);
    const probMinOneSuccess = 1 - probZeroSuccess;
    successPercentage = Math.round((probMinOneSuccess * 100) * 1000) / 1000;

    return successPercentage
}

// return a moving average over an array of data
function movingAverage(data, windowSize) {
    // Throw an error if the window size is less than or equal to 0
    if (windowSize <= 0) {
        throw new Error("Window size must be greater than 0");
    }

    let result = []; // Array to store the moving averages
    let sum = 0; // Variable to store the sum of the current window

    for (let i = 0; i < data.length; i++) {
        sum += data[i]; // Add the current element to the sum

        // If the current index is greater than or equal to the window size, subtract the element that is now outside the window
        if (i >= windowSize) {
            sum -= data[i - windowSize];
        }

        // If the current index is greater than or equal to windowSize - 1, calculate the average and add it to the result array
        if (i >= windowSize - 1) {
            result.push(Math.round(sum / windowSize) * 100 / 100);
        }
    }

    return result; // Return the array of moving averages
}

// Takes the odds of an event happening, and a desired confidence interval, and determines how many events (encounters) are required before you are CI% sure the event has occured
// Invert, work out number of times event has to not happen before you are 1-CI% sure it has happened
function oddsOf1Event(odds, confidenceInterval) {
    // Math.pow((1-odds),n) <= 1-confidenceInterval;

    n = Math.log(1 - confidenceInterval) / Math.log(1 - odds)
    return n
}

function getNumberOfEncounters(allPhaseData) {
    var sum = 0;
    for (let i = 0; i < allPhaseData.length; i++) {
        const phaseData = allPhaseData[i];
        sum += phaseData.length - 1; //Subtract one for the title row
    }
    return sum;
}

function getNumberOfNonEmptyPhases(allPhaseData) {
    var sum = 0
    for (let i = 0; i < allPhaseData.length; i++) {
        const phaseData = allPhaseData[i];
        if (phaseData.length > 1) {
            sum += 1;
        }
    }
    return sum
}



// Call the function to fetch data and draw chart when the page loads
// document.addEventListener('DOMContentLoaded', fetchPhaseData(163));

