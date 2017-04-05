var fs = require('fs');
var request = require('request');
var Table = require('cli-table');
var sync = require('sync-request');
var contents = fs.readFileSync('logs.txt', 'utf8');
var clib = JSON.parse(fs.readFileSync('./countrylib.json').toString());

function getParsedLog() {
    var table = new Table({
        head: ['IP', 'DATE', 'RESPONSE', 'USER-AGENT'],
        colWidths: [20, 30, 55, 200]
    });
    var lines = contents.split(/\r\n|\n\r|\r|\n/),
        length = lines.length,
        splitbyrows,
        splittedrow,
        extractIpDate,
        i = 0;

    while (length--) {
        splitbyrows = lines[i];
        splittedrow = splitbyrows.split('"');
        extractIpDate = splittedrow[0].split(' ');
        table.push(
            [extractIpDate[0], extractIpDate[3].substring(1), splittedrow[1].substring(4), splittedrow[5]]
        );
        i++;

    }

return table;
}

function getFirstConnections() {
    var table1 = new Table({
        head: ['IP', 'DATE', 'RESPONSE', 'USER-AGENT'],
        colWidths: [20, 30, 55, 200]
    });
    var table = getParsedLog(),
        length = table.length,
        i = 0;

    while (length--) {
        if (table[i][2].search(/\/books\//) !== -1) {
          table1.push([table[i][0], table[i][1],table[i][2],table[i][3]]);
        }
        i++;

    }

    return table1;
}

function getUsersWithoutBots() {
    var table1 = new Table({
        head: ['IP', 'DATE', 'RESPONSE', 'USER-AGENT'],
        colWidths: [20, 30, 55, 200]
    });
    var table = getFirstConnections(),
        length = table.length,
        i = 0;

    while (length--) {
        if (table[i][3].search(/bot|mediapartners-google|\/slurp|\/crawler.php|ias_crawler|\/spider.php/i) === -1) {
            table1.push([table[i][0], table[i][1],table[i][2],table[i][3]]);
        }
        i++;

    }

    return table1;
}

function getUserAgents() {
    var table1 = new Table({
        head: ['IP', 'DATE', 'RESPONSE', 'USER-AGENT', 'BROWSER'],
        colWidths: [20, 30, 55, 200, 60]
    });
    var table =  getUsersWithoutBots(),
        length = table.length,
        browser_splitting,
        split_length,
        extractBrowser,
        i = 0;

    while (length--) {
    browser_splitting = table[i][3].split(' ');
    split_length = browser_splitting.length - 1;
    extractBrowser = browser_splitting[split_length];
    table1.push(
        [table[i][0], table[i][1],table[i][2],table[i][3],extractBrowser]);
        i++;

    }

return table1;
}

function getOS() {
    var table1 = new Table({
        head: ['IP', 'DATE', 'RESPONSE', 'USER-AGENT', 'OS'],
        colWidths: [20, 30, 55, 200, 70]
    });
    var os_dic = ['Windows NT 6.1','Windows NT 10.0','Mac OS X','Windows NT 6.0','Windows NT 6.2',
        'Windows NT 6.3','Windows NT 5.1','Android 4','Android 5','Android 6'];
    var table =  getUsersWithoutBots(),
        length = table.length,
        i = 0,
        os_length = os_dic.length,
        regexp;

    while (length--) {
        for (var j = 0; j < os_length; j++) {
            regexp = new RegExp(os_dic[j],"i");

        if (table[i][3].search(regexp) !== -1) {
            table1.push([table[i][0], table[i][1],table[i][2],table[i][3],os_dic[j]]);
            break;
            }
        }
    i++;

    }

return table1;
}

function getCountriesByIpSync() {
    var table = getUsersWithoutBots(),
        length = table.length,
        i = 0,
        query_result,
        countryname;

    while (length--) {
        query_result = sync('GET','http://freegeoip.net/json/'+table[i][0]);
        countryname = JSON.parse(query_result.getBody('utf8')).country_name;

        if (!clib.hasOwnProperty(countryname)) {
            clib[countryname] = 1;
            fs.writeFile('countrylib.json', JSON.stringify(clib));

        } else {
            clib[countryname] += 1;
            fs.writeFile('countrylib.json', JSON.stringify(clib));
        }
        i++;

    }
}

function getCountriesByIpAsync() {
    var table = getUsersWithoutBots(),
        length = table.length-1,
        i = 0;

    do  {
        request('http://freegeoip.net/json/'+table[i][0],callbackForAsync);

        i++;
    } while (length--)

}

function callbackForAsync(error, response, body) {
    var countryname;

    if (!error && response.statusCode === 200) {
        countryname = JSON.parse(body).country_name;

        if (!clib.hasOwnProperty(countryname)) {
            clib[countryname] = 1;
            fs.writeFile('countrylib.json', JSON.stringify(clib));

        } else {
            clib[countryname] += 1;
            fs.writeFile('countrylib.json', JSON.stringify(clib));
        }
    }

}

//<======================================================>

//USAGE:
//console.log(getParsedLog().toString());
//console.log(getFirstConnections().toString());
//console.log(getUsersWithoutBots().toString());
//console.log(getUserAgents().toString());
//console.log(getOS().toString());
//getCountriesByIpSync(); //Need to init (clear) countrylib.json before using like: {}
//getCountriesByIpAsync(); //Need to init (clear) countrylib.json before using like: {}

//<......................................................>

