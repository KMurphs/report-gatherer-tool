import { finder } from './finder';
import { TConfig, TFindConfig } from './types';
// import { finder } from './finder';
import { createAppFolders } from './utils';


let configFind: TFindConfig;
let serialsToFind: string[];

beforeAll(() => {
  let appFolder = createAppFolders();

  const testFolder: string = `${appFolder}\\tests`;
  var fs = require('fs');

  let fileCounter: number = 0;
  let filesPerLoc: number = 3;
  let locs = [1,2,3].map(i => `${testFolder}\\location_${i}`);
  locs.forEach(loc => {

    // Create a test location
    if (!fs.existsSync(loc)){
      fs.mkdirSync(loc);
    }

    const testFileHTML = "\
      <!DOCTYPE html>\
      <head><title>Document</title></head>\
      <body><div class=\"class1\"><div class=\"class2\"><div class=\"class3\">Some Content</div></div></div></body>\
      </html>\
    "

    // Create so many test files per test locations
    for(let i = 0; i < filesPerLoc; i++){
      fileCounter++;

      let file = `${loc}\\Dummy_Test_File_[serial_number_${fileCounter}][02 04 43 PM][2020-09-03][Passed].html`;
      fs.writeFileSync(file, testFileHTML, function (err: any) {
          if (err) console.log(err);
          // console.log(`[Test]: Created File: '${file}'`)
      })
      

    }
  })


  configFind = {
    from: [...locs],
    regexExpression: "^((Dummy_Test_File_).*(\\[{{serial_number}}\\]).*(\.html))$",
    regexPlaceholder: "{{serial_number}}"
  }

  serialsToFind = [];
  for(let i = 0 ; i < 10 ; i = i + 2){
    serialsToFind.push(`serial_number_${fileCounter}`);
  }
});













test('Can Find Reports matching Given Serial Numbers', async () => {

  const fs = require('fs');
  const now = new Date().getTime();

  for(let sn of serialsToFind){
    console.log(`[Test]: Processing '${sn}'`)
    let foundFile = await finder(configFind, sn);
    expect(foundFile === null).toBe(false);
    expect(fs.existsSync(foundFile.path)).toBe(true);
    expect(foundFile.name.indexOf(sn)).toBeGreaterThan(0);
    expect(foundFile.lastModified).toBeGreaterThan(now - 60000);
    expect(foundFile.lastModified).toBeLessThan(now);
  }
  
});














afterAll(() => {
  var rimraf = require("rimraf");
  rimraf(`${process.env.USERPROFILE}\\Documents\\report-gatherer\\tests`, function () { ; });
});