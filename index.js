const inquirer = require('inquirer')
const spinner = require('ora')
const getWorker = require('tesseract.js-node')
const fs = require('fs')

fs.readdir('./img', async (err, files) => {
  if (err.code === 'ENOENT') {
    fs.mkdirSync('./img')
    exitWithError('Folder not found. Put your pictures to process in ./img/')
  }
  if (files.length === 0) exitWithError('No images found on ./img/')

  const ocr = await getWorker({
    tessdata: './tessdata/',
    languages: ['ind']
  })

  const promptFiles = ['All', ...files]

  inquirer.prompt([{
    type: 'checkbox',
    name: 'file',
    message: 'Which files to process?',
    choices: promptFiles,
    default: 0
  }]).then(async res => {
    let selectedFiles
    if (res.file.includes('All')) { selectedFiles = files } else { selectedFiles = res.file }

    selectedFiles.forEach((file) => {
      const loadS = spinner(`Loading file ${file} ...`).start()
      const text = ocr.recognize('./img/' + file, 'ind')
      loadS.succeed(`Output file: ${file}\n${text}`)
    })
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
