const inquirer = require('inquirer')
const spinner = require('ora')
const getWorker = require('tesseract.js-node')
const fs = require('fs')

const fintechRegex = /([^(]+)\(([^)]+)\)/

fs.readdir('./img', async (err, files) => {
  if (err && err.code === 'ENOENT') {
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
  }, {
    type: 'list',
    name: 'output',
    message: 'What will be your output?',
    choices: ['Raw', 'JSON'],
    defaults: 'Raw'
  }]).then(async res => {
    // jsonOut will only be used when JSON is the output
    const jsonOut = []
    let selectedFiles
    // If All is selected, set all files in ./img/ to be analyzed
    if (res.file.includes('All')) { selectedFiles = files } else { selectedFiles = res.file }

    selectedFiles.forEach((file) => {
      const loadS = spinner(`Loading file ${file} ...`).start()
      const OCROutput = ocr.recognize('./img/' + file, 'ind')

      // Branching on Raw or JSON
      if (res.output === 'Raw') {
        // Selected Raw
        loadS.succeed(`Output file: ${file}\n${OCROutput}`)
      } else if (res.output === 'JSON') {
        const fintechArray = OCROutput.split('\n').filter(a => a !== '')
        fintechArray.forEach(txt => {
          const regexedTxt = fintechRegex.exec(txt)
          jsonOut.push({
            company_name: regexedTxt[1],
            platform_name: regexedTxt[2]
          })
        })
        if (loadS.isSpinning) loadS.succeed(`Added ${file} to JSON Output`)
      }
    })
    if (res.output === 'JSON') return console.log(JSON.stringify(jsonOut))
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
