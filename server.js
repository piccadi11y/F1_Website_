var cache = []
var ip_log = []

const HTTP = require('http')
const URL = require('url')
const FS = require('fs')
const PATH = require('path')

const hostname = '127.0.0.1'
//const hostname = '192.168.178.169'
const port = 8080
//const port = 80

const mimeType = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
	'.json': 'application/json',
  	'.css': 'text/css',
  	'.png': 'image/png',
  	'.jpg': 'image/jpeg'
}

const server = HTTP.createServer((request, response) => {
    let statusCode = 0
    
    console.log(`Request | Method: ${request.method}`)
    console.log(`Request | URL: ${request.url}`)
	console.log(`Request | IP: ${request.connection.remoteAddress}`)
    
	logIP(request.connection.remoteAddress)
    
    switch (request.method) {
        case 'GET':
			let parsedUrl = URL.parse(request.url)
			let sanatisedPath = PATH.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '')
			let pathName = PATH.join(__dirname, sanatisedPath)
			let errorPath = PATH.join(__dirname, 'HTML/404.html')
            // Check to see if the file exists.
            FS.exists(pathName, exists => {
                if (!exists) statusCode = 404
            })
            
            // If path is valid folder, use index (only works for root dir).
            try {
                if (FS.statSync(pathName).isDirectory()) pathName += '/index.html'
            } catch(err) {
                console.log(err)
                statusCode = 404
            }
            
            // Send user 404 error if anything has failed before this point.
            if (statusCode === 404) pathName = errorPath
            
            FS.readFile(pathName, (err, data) => {
                if (err) {
                    response.statusCode = 500
                    response.end(`Error getting the file: ${err}`)
                } else {
                    let ext = PATH.parse(pathName).ext
                    response.statusCode = 200
                    response.setHeader('Content-Type', mimeType[ext] || 'text/plain')
                    response.end(data)
                }
            })
            break
        case 'POST':
            let body = ''
            request.on('data', chunk => {
                body += chunk
                if (body.length > 1e6) {
                    body = ''
                    response.setHeader('Content-Type', 'text/plain')
                    response.statusCode = 413
                    response.end()
                }
            })
            request.on('end', () => {
                //console.log(JSON.parse(body))
                
            response.statusCode = 200
            response.setHeader('Content-Type', 'application/json')
            parseRequestBody(body)
                .then(d => {
                    //console.log(`d.type: ${d.type}`)
                    if (d.type == 'url') {
                        makeErgastRequest(d.output).then(u => response.end(u))
                    } else if (d.type == 'command') {
                        handleCommand(d.output)
                        response.end('')
                    }
                })
                    
            })
            break
        default: break
    }
}).listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
})

function parseRequestBody (data) {
    //console.log(data)
    return new Promise(r => {
        let parsedData = JSON.parse(data)
        if (parsedData.type == 'url') {
            let output = `${parsedData.base}/${parsedData.series}/${parsedData.body}.${parsedData.format}`
            let multipleParam = false
            if (parsedData.limit || parsedData.offset) {
                output += '?'
                if (parsedData.limit) {
                    output += `limit=${parsedData.limit}`
                    multipleParam = true
                }
                if (parsedData.offset) {
                    if (multipleParam) output += '&'
                    output += `offset=${parsedData.offset}`
                }
            } 
            r({type: 'url', output: output})
        } else if (parsedData.type == 'command') {
            r({type: 'command', output: parsedData.command})
        }
    })
}

function makeErgastRequest (input) {
	console.log(`Outgoing Request | URL: ${input}`)
	
	return new Promise(r => {
        let cacheSearch = -1
        if (cache[0]) cacheSearch = cache.findIndex(element => {
            //console.log(`Element.url: ${element.url}\ninput: ${input}`)
            return element.url == input
        })
        console.log(`cacheSearch: ${cacheSearch}`)
        if (cacheSearch != -1) {
            console.log('Data retrieved from cache')
            r(cache[cacheSearch].data)
        } else {
            let data = ''
            HTTP.get(input, e_res => {
                e_res.on('data', chunk => {
				    data += chunk
                })
                e_res.on('end', () => {
				    console.log('Ergast Request Complete')
                    cacheData(input, data)
				    r(data)
                })
            })
        }
	})
}

function cacheData (url, data) {
    cache.push({'url': url, 'data': data})
    console.log('Data Cached')
    //console.log(cache)
}

function handleCommand (input) {
    console.log(`>${input}`)
    
    switch (input) {
        case 'displayCache url': {
            if (cache.length == 0) console.log('Cache Empty')
            else for (let x in cache) console.log(`${x}: ${cache[x].url}`)
            break
        }
        case 'emptyCache': {
            cache.length = 0
            console.log('Cache Emptied')
            break
        }
		case 'displayAccessLog': {
			if (ip_log.length == 0) console.log('Log Empty')
			else for (let i in ip_log) console.log(`${i}: ${ip_log[i].time}\t${ip_log[i].address}`)
			break
		}
		case 'emptyAccessLog': {
			ip_log.length = 0
			console.log('Log Emptied')
			break
		}
        default: {
            console.log(`"${input}" is an invalid command.`)
            break
        }
    }
}

function logIP (ip) {
	ip_log.push({time: new Date(), address: ip})
}