console.log("fs!");

const fs = require('fs-extra');

async function rwJson() {
  try {
    const packObj = await fs.readJson('./pack.json')
    await fs.writeJson('./package.json', { ...packObj, name: 'fs-extra', micha: 'lieb!' })
    console.log('success!')
  } catch (err) {
    console.error(err)
  }
}

rwJson()
