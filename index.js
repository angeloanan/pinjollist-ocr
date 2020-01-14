const getWorker = require('tesseract.js-node')
const fs = require('fs')

fs.readdir('./img', async (err, files) => {
  if (err.code === 'ENOENT') {
    fs.mkdirSync('./img')
    exitWithError('Folder not found. Put your pictures to process in ./img/')
  }
  if (files.length === 0) exitWithError('No images found on ./img/')

  console.log('Processing...')

  const ocr = await getWorker({
    tessdata: './tessdata/',
    languages: ['ind']
  })

  files.forEach(async (file) => {
    const text = await ocr.recognize('./img/' + file, 'ind')
    console.log(text)
  })
})

/**
 * Exit the process with an error
 * @param {String} msg Error message
 * @param {Number} [code] Error code
 */
function exitWithError (msg, code) {
  console.error(msg)
  process.exit(code || 1)
}
