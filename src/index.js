var express = require('express')
var request = require('request')
var process = require('process')
var AWS = require('aws-sdk')

var app = express()
var ec2 = new AWS.EC2({apiVersion: '2016-11-15'})
var expressWs = require('express-ws')(app)
let privateIp
let serverInfo
getServerInfo()

var serverId = Math.floor(Math.random()*100000)

app.use(express.static('public'))

app.get('/server', function(req, res){
  res.send(serverInfo)
});

app.get('/health', function(req, res){
  res.send('I am Alive!!')
});

app.ws('/bar', function(ws, req) {
  var i = 0
  ws.on('message', function(msg) {
    console.log('received message', msg);
    setTimeout(() => {
      if (ws.readyState !== 1) {
        console.log('The socket was dead')
        return
      }
      ws.send(`server id:${serverId} i:${i++}`)
    }, 500)
  })
  console.log('socket', req.testing)
})

process.on('SIGINT', () => {
  console.info("Interrupted")
  process.exit(0)
})

app.listen(80)
console.log('Listening on 80')

function getServerInfo() {
  request(process.env.ECS_CONTAINER_METADATA_URI, {json: true}, (err, res, body) => {
    if (err) {
      console.log(err)
      serverInfo = `Error|${err}`
    } else {
      console.log(body)
      privateIp = body.Networks[0].IPv4Addresses[0]

      const params = {
        Filters: [
          {
            Name: 'addresses.private-ip-address',
            Values: [privateIp]
          }
        ]
      }
      ec2.describeNetworkInterfaces(params, function(err, data) {
         if (err) {
           console.log('describeNetworkInterfaces error', err, err.stack)
         } else {
           console.log('describeNetworkInterfaces:', data.NetworkInterfaces[0].Association.PublicIp)
           serverInfo = data.NetworkInterfaces[0].Association.PublicIp
         }
      })
    }
  });
}
