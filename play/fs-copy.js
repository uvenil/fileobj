console.log("fs!");

const fse = require('fs-extra');

async function copyFiles() {
  try {
    await fse.copy('pack.json', 'pack2.json')
    console.log('success!')
  } catch (err) {
    console.error(err)
  }
}

copyFiles()