const fs = require('fs');
const http = require('http');
const csv = require('csv-parser');

var parameterList = [];
var hostname;

const get_parameter_info = new Promise((resolve, reject)=> {
    fs.createReadStream('../parameter/parameter.csv')
    .pipe(csv())
    .on('data', function (row) { 
      if(row.notification != 0){
        if(row.name == 'host'){
            hostname = row.value;
        }else{
            let parameter ={
                parameter_name: row.name,
                parameter_value: row.value,
                parameter_parent: row.parameter
              }
              console.log(JSON.stringify(parameter))
              parameterList.push(parameter);
        }
      }
    })
    .on('end', () => {
      resolve()
    });
  });

async function send_host_info(){
    var options = {
      host: '192.168.33.10',
      path: '/inform/2',
      //since we are listening on a custom port, we need to specify it by hand 192.168.33.10
      port: '5001',
      //This is what changes the request to a POST request
      method: 'POST'
    };
  
    callback = function(response) {
      var str = ''
      response.on('data', function (chunk) {
        str += chunk;
      });
    
      response.on('end', function () {
        console.log(str);
      });
    }
    get_parameter_info.then(()=>{
        var req = http.request(options, callback);
        let body = JSON.stringify({
          parameter: parameterList,
          hostname: hostname
        });
        console.log(body);
        req.write(body);
        req.end();
      }).catch((err) => {
        console.log(err)
        console.log("failed to get parameter info");
    })
    
  }

setInterval(send_host_info, 300000);