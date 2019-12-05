const fs = require('fs')
const path = require('path')
const { Transform } = require('stream')

const dataFileName = path.join(__dirname, 'file.txt')
const numbersFileName = path.join(__dirname, 'numbers.txt')

function createFile() {
    const writeStream = fs.createWriteStream(dataFileName)
    for (let i = 0; i < 10000; i++) {
        writeStream.write('Data for writing.\n')
    }
    writeStream.end()
}

function addDataToFile() {
    const writeStream = fs.createWriteStream(dataFileName, {flags: 'a'})
    writeStream.write(`Additional data.\n`)
    writeStream.end()
}

function readFile() {
    const readStream = fs.createReadStream(dataFileName)
    readStream.on('data', (chunk) => console.log(chunk.toString()))
}

fs.stat(dataFileName, (err) => {
    if (err) {
        createFile()
    }
    readFile()
    addDataToFile()
})

const upperCaseTransform = new Transform({
    transform(chunk, encoding, callback) {
        this.push(chunk.toString().toUpperCase())
        callback()
    }
})

const deleteNumbersTransform = new Transform({
    transform(chunk, encoding, callback) {
        const str = chunk.toString()
        const numbers = str.match(/\d/g)
        if (numbers) {
            writeNumbersToFile(numbers.join(','))
        }
        this.push(str.replace(/\d/g, ''))
        callback()
    }
})

function writeNumbersToFile(numbers) {
    const data = {
        numbers: numbers,
        date: new Date().toISOString(),
        name: 'Yana'
    }
    const writeStream = fs.createWriteStream(numbersFileName, {flags: 'a'})
    writeStream.write(JSON.stringify(data) + '\n')
    writeStream.end()
}

const textTransform = new Transform({
    transform(chunk, encoding, callback) {
        const str = chunk.toString().toLowerCase()
        this.push(str.charAt(0).toUpperCase() + str.slice(1))
        callback()
    }
})

process.stdin.pipe(upperCaseTransform).pipe(process.stdout)
process.stdin.pipe(deleteNumbersTransform).pipe(process.stdout)
process.stdin.pipe(textTransform).pipe(process.stdout)
