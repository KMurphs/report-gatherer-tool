const fs = require("fs")
const path = require("path")
const $ = require('cheerio');


const { config } = require("./config.handler")

const testFile = {
  config: {},

  handle: async function(sendMsgHelper, {project_name, file_path}){

    // Ensure inputs are okay
    if(typeof(project_name) !== "string" || !project_name || project_name == "") 
      return sendMsgHelper.reply("No Project Name was provided. Project Name Invalid");

    if(typeof(file_path) !== "string" || !file_path || file_path == "") 
      return sendMsgHelper.reply("No File Path provided. File Path Invalid");
    
    if( !fs.existsSync(file_path) || !(await fs.promises.stat(file_path)).isFile() )
      return sendMsgHelper.reply("No File Path provided. File Path Invalid");
 

    // Ensure we have config data for current project of interest
    if(!testFile.config[project_name]){

      // Get data
      const { tests_to_validate_reports } = await config.getTestFileConfig(project_name);
      
      if(!tests_to_validate_reports || tests_to_validate_reports.length == 0)
        return sendMsgHelper.reply("No Tests provided. Tests are Invalid");


      // Cache data
      testFile.config[project_name] = {
        tests: JSON.parse(JSON.stringify(tests_to_validate_reports))
      };

    }



    const configData = testFile.config[project_name];


    // Ensure cached data is valid
    if(!configData.tests || configData.tests.length == 0)
      return sendMsgHelper.reply("No Tests provided. Tests are Invalid");
    

    configData.tests.forEach((test, index)=>{

      if(!test || !test.css_selector || test.css_selector == "")
        return sendMsgHelper.reply(`Invalid Test Item ${index}: Invalid 'css_selector'`);
      
      if(!test || !test.expected_value || test.expected_value == "")
        return sendMsgHelper.reply(`Invalid Test Item ${index}: Invalid 'expected_value'`);
      
      if(!test || !test.name || test.name == "")
        test.name = `Test Item ${index}`

    });

    // Get html content from file
    let html = null;
    try{ html = await fs.promises.readFile(file_path, {encoding:'utf8', flag:'r'}) } 
    catch (err) {
      html = "";
      return sendMsgHelper.reply(`File '${file_path}' could not be read`);
    }

    // Ensure Content is not empty
    if(!html || html == "")
      return sendMsgHelper.reply(`File Content of '${file_path}' is empty`);
  

    // Notify the client that server is processing request
    sendMsgHelper.reply("processing");
    await new Promise(resolve => {
      setTimeout(()=>resolve())
    }, 200)





    let results = {
      items: [],
      hasPassed: true
    }


    // Perform the tests
    for(let test of configData.tests){
  
      // Is test pass/fail?
      let hasPassed;
      try { 
        const actual_value = $(test.css_selector, html)[0].children[0].data.toLowerCase();
        const expected_value = test.expected_value.toLowerCase();
        hasPassed = (actual_value === expected_value);
        test.actual_value = actual_value;
      } catch(err) {
        hasPassed = false;
        console.log(err);
      } 
  

      // Pack test result, Update overall pass/fail
      results.hasPassed = results.hasPassed && hasPassed;
      results.items.push({
        test: { ...test },
        hasPassed: hasPassed
      });

    }
    

      
    return sendMsgHelper.push(null, results);
  }


}

module.exports = { testFile }