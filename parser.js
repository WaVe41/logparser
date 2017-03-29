var fs = require('fs');
var request = require('request');
var Table = require('cli-table');
var sync = require('sync-request');
var contents = fs.readFileSync('logs.txt', 'utf8');
var clib = JSON.parse(fs.readFileSync('./clib.json').toString());

function splittingText () {
    var table = new Table({
        head: ['IP', 'DATE', 'RESPONSE', 'USER-AGENT'],
        colWidths: [20, 30, 55, 200]
    });
    var lines = contents.split(/\r\n|\n\r|\r|\n/),
        length = lines.length,
        splitbyrows,
        splitedrow,
        extractIpDate,
        i = 0;
    //console.log("Length: " + length);
    while (length--) {
        splitbyrows = lines[i];
        splitedrow = splitbyrows.split('"');
        extractIpDate = splitedrow[0].split(' ');
        table.push(
            [extractIpDate[0], extractIpDate[3].substring(1), splitedrow[1].substring(4), splitedrow[5]]
        );
        i++;
    }
return table;
}

function numUsers () {
    var table = splittingText(),
        length = table.length,
        i = 0;
    var table1 = new Table({
        head: ['IP', 'DATE', 'RESPONSE', 'USER-AGENT'],
        colWidths: [20, 30, 55, 200]
    });
    while (length--) {
        if (table[i][2].search(/\/books\//) !== -1) {
          table1.push([table[i][0], table[i][1],table[i][2],table[i][3]]);

        }
        i++;
    }
    console.log("Total users today with bots: "+table1.length);

    return table1;
}

function withoutBots () {
    var table = numUsers(),
        length = table.length,
        i = 0;
    var table1 = new Table({
        head: ['IP', 'DATE', 'RESPONSE', 'USER-AGENT'],
        colWidths: [20, 30, 55, 200]
    });
    while (length--) {
        if (table[i][3].search(/bot|mediapartners-google|\/slurp|\/crawler.php|ias_crawler|\/spider.php/i) === -1) {
            table1.push([table[i][0], table[i][1],table[i][2],table[i][3]]);
        }
        i++;
    }
    console.log("Total users today WITHOUT bots: "+table1.length);
    return table1;

}

function userAgents () {
    var table = withoutBots(),
        browser_splitting,
        length = table.length,
        together,
        split_length,
        i = 0;
    var table1 = new Table({
        head: ['IP', 'DATE', 'RESPONSE', 'USER-AGENT', 'BROWSER'],
        colWidths: [20, 30, 55, 200, 60]
    });

    while (length--) {
    browser_splitting = table[i][3].split(' ');
    split_length = browser_splitting.length - 1;
    together = browser_splitting[split_length];
    table1.push([table[i][0], table[i][1],table[i][2],table[i][3],together]);
        i++;
    }
return table1;
}

function os () {
    var os_dic = ['Windows NT 6.1','Windows NT 10.0','Mac OS X','Windows NT 6.0','Windows NT 6.2',
        'Windows NT 6.3','Windows NT 5.1','Android 4','Android 5','Android 6'];
    var table1 = new Table({
        head: ['IP', 'DATE', 'RESPONSE', 'USER-AGENT', 'OS'],
        colWidths: [20, 30, 55, 200, 70]
    });
    var table = withoutBots(),
        length = table.length,
        i = 0,
        os_length = os_dic.length,
        regexp;


    while (length--) {
        for (var j = 0; j < os_length; j++) {
            regexp = new RegExp(os_dic[j],"i");
            //console.log(regexp);
        if (table[i][3].search(regexp) !== -1) {
            table1.push([table[i][0], table[i][1],table[i][2],table[i][3],os_dic[j]]);
            break;
            }
        }
    i++;
    }
    console.log("Num OS detected: "+table1.length);
return table1;
}

function syncCountryIp () {
    var table = withoutBots(),
        length = table.length,
        i = 0,
        res,
        temp;

    while (length--) {
        res = sync('GET','http://freegeoip.net/json/'+table[i][0]);
        temp = JSON.parse(res.getBody('utf8')).country_name;
        if (!clib.hasOwnProperty(temp)) {
            clib[temp] = 1;
            fs.writeFile('clib.json', JSON.stringify(clib));

        } else {
            clib[temp] += 1;
            fs.writeFile('clib.json', JSON.stringify(clib));
        }
        i++;
    }

}

function asynCountryIP () {
    var table = withoutBots(),
        length = table.length-1,
        i = 0;
    do  {
        request('http://freegeoip.net/json/'+table[i][0],callback);

        i++;
    } while (length--)
}

function callback(error, response, body) {
    var temp;
    if (!error && response.statusCode === 200) {
        temp = JSON.parse(body).country_name;
        if (!clib.hasOwnProperty(temp)) {
            clib[temp] = 1;
            fs.writeFile('clib.json', JSON.stringify(clib));
        } else {
            clib[temp] += 1;
            fs.writeFile('clib.json', JSON.stringify(clib));
        }
    }

}

//<======================================================>

//console.log(splittingText().toString());
//console.log(numUsers().toString());
//console.log(withoutBots().toString());
//console.log(userAgents().toString());
//console.log(os().toString());
//asynCountryIP();
//syncCountryIp();

//<......................................................>

