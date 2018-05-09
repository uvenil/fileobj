console.log("fs!");

const fs = require('fs-extra');

async function copyFiles() {
  try {
    await fse.copy('pack.json', 'pack2.json')
    console.log('success!')
  } catch (err) {
    console.error(err)
  }
}

async function readJson() {
  try {
    const packObj = await fs.readJson('./pack.json')
    await fs.writeJson('./package.json', { ...packObj, name: 'fs-extra', micha: 'lieb!' })
    console.log('success!')
    console.log(packObj.version) // => 0.1.3
  } catch (err) {
    console.error(err)
  }
}

readJson()
