import { TFindResult, TTestConfig, TTestsResult } from "./types";

const fs = require('fs');
const $ = require('cheerio');
const moduleName = "[Tester]"

// https://nodejs.org/api/fs.html#fs_file_system

export const tester = (configs: TTestConfig[], filePath: string): Promise<TTestsResult> => {

  return new Promise(async(resolve, reject) => {
  
    // Setup default return object and compile regex with serial number
    let res: TTestsResult = {
      items: [],
      hasPassed: true
    };



    // Ensure that if there are no tests, return fail
    if(!configs || configs.length === 0){
      res.hasPassed = false;
      resolve(res);
    }
    // Guard against invalid filepath inputs
    if(!filePath || filePath === ""){
      res.hasPassed = false;
      resolve(res);
    }



    // Get html content from file
    let html: string;
    try{ html = fs.readFileSync(filePath, {encoding:'utf8', flag:'r'}) } 
    catch (err) {
      html = "";
      console.log(err);
    }


    // Perform the tests
    for(let config of configs){



      // Guard against invalid config data
      if( !config.cssSelector || config.cssSelector === "" || !config.expected || !config.name){
        res.hasPassed = false;
        res.items.push({
          test: { ...config },
          hasPassed: false
        });
        continue;
      }
      


      // Is test pass/fail?
      let hasPassed: boolean;
      try { hasPassed = $(config.cssSelector, html)[0].children[0].data.toLowerCase() === config.expected.toLowerCase(); } 
      catch(err) {
        hasPassed = false;
        console.log(err);

      } 

      // Pack test result, Update overall pass/fail
      res.hasPassed = res.hasPassed && hasPassed;
      res.items.push({
        test: { ...config },
        hasPassed: hasPassed
      });

      
    }

    // Return 
    resolve(res);
  })
}


