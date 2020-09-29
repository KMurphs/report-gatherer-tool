import { finder } from './finder';
import { tester } from './tester';
import { TConfig, TFindConfig, TFindResult, TTestConfig, TTestsResult } from './types';
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
      <body><div class=\"class1\"><div class=\"class2\"><div class=\"class3\">Some Content</div><div class=\"class4\">Some Other Content</div></div></div></body>\
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









describe("Finder Module Functionality", ()=>{
  it("Will find reports matching some given serial number", async () => {

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
  })


  it('Will return null if report is not found', async () => {
    let sn = "serial_number_0";
    let foundFile = await finder(configFind, sn);
    expect(foundFile === null).toBe(true);
  })

  it('Will gracefully handle invalid input data', async () => {
    let sn = "serial_number_1";

    let configInvalid: TFindConfig 
    let foundFile: TFindResult

    configInvalid = {...configFind}
    configInvalid.from = []
    foundFile = await finder(configInvalid, sn);
    expect(foundFile === null).toBe(true);

    configInvalid = {...configFind}
    configInvalid.regexExpression = ""
    foundFile = await finder(configInvalid, sn);
    expect(foundFile === null).toBe(true);
    
    configInvalid = {...configFind}
    configInvalid.regexPlaceholder = ""
    foundFile = await finder(configInvalid, sn);
    expect(foundFile === null).toBe(true);
    
    foundFile = await finder(configFind, "");
    expect(foundFile === null).toBe(true);
  })

})





describe("Tester Module Functionality", ()=>{

  it('Can test html reports againt test items', async () => {

    let testResults: TTestsResult;
    let configTests: TTestConfig[] = [];
    let tests: TTestConfig[] = []
    tests.push({cssSelector: "div > div.class3", name: "Test 1", expected: "SOME Content"});
    tests.push({cssSelector: "div > div.class4", name: "Test 2", expected: "SOME Other Content"});

    configTests = [...tests]
  
    for(let sn of serialsToFind){
      console.log(`[Test]: Processing '${sn}'`);
  
      let foundFile = await finder(configFind, sn);
      expect(foundFile === null).toBe(false);
  
      testResults = await tester(configTests, foundFile.path);
      expect(testResults.hasPassed).toBe(true);

      expect(testResults.items[0].hasPassed).toBe(true);
      expect(testResults.items[0].test.cssSelector).toBe(tests[0].cssSelector);
      expect(testResults.items[0].test.name).toBe(tests[0].name);
      expect(testResults.items[0].test.expected).toBe(tests[0].expected);

      expect(testResults.items[1].hasPassed).toBe(true);
      expect(testResults.items[1].test.cssSelector).toBe(tests[1].cssSelector);
      expect(testResults.items[1].test.name).toBe(tests[1].name);
      expect(testResults.items[1].test.expected).toBe(tests[1].expected);
    }
    
  });


  it('Will gracefully handle invalid inputs', async () => {

    let testResults: TTestsResult;
    let configTests: TTestConfig[] = [];
    configTests.push({cssSelector: "div > div.class3", name: "Test 1", expected: "SOME Content"})
    configTests.push({cssSelector: "div > div.class4", name: "Test 2", expected: "SOME Other Content"})
    configTests.push({cssSelector: "div > div.class4", name: "Test 3", expected: "SOME Other Different Content"})
    configTests.push({cssSelector: "", name: "Test 4", expected: "SOME Other Content"})
    configTests.push({cssSelector: "div > div.class4", name: "Test 5", expected: null})
    

    let sn = "serial_number_1";
    let foundFile = await finder(configFind, sn);
    expect(foundFile === null).toBe(false);

    testResults = await tester(configTests, foundFile.path);
    expect(testResults.hasPassed).toBe(false);
    expect(testResults.items[0].hasPassed).toBe(true);
    expect(testResults.items[1].hasPassed).toBe(true);
    expect(testResults.items[2].hasPassed).toBe(false);
    expect(testResults.items[3].hasPassed).toBe(false);
    expect(testResults.items[4].hasPassed).toBe(false);

    
  });

})













afterAll(() => {
  var rimraf = require("rimraf");
  rimraf(`${process.env.USERPROFILE}\\Documents\\report-gatherer\\tests`, function () { ; });
});