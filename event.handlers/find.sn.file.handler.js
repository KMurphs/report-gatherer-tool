const fs = require("fs")
const path = require("path")

const { config } = require("./config.handler")

const findFile = {
  config: {},

  handle: async function(sendMsgHelper, {project_name, serial_number}){

    // Ensure inputs are okay
    if(typeof(project_name) !== "string" || !project_name || project_name == "") 
      return sendMsgHelper.reply("No Project Name was provided. Project Name Invalid");

    if(typeof(serial_number) !== "string" || !serial_number || serial_number == "") 
      return sendMsgHelper.reply("No Serial Number provided. Serial Number Invalid");
 
    // Ensure we have config data for current project of interest
    if(!findFile.config[project_name]){

      // Get data
      const {regex_template, regex_template_placeholder, directories_to_look_for_reports} = await config.getFindFileConfig(project_name);

      // Cache data
      findFile.config[project_name] = {
        regexTemplate: regex_template,
        regexPlaceholder: regex_template_placeholder,
        fromLocations: [...directories_to_look_for_reports]
      }

    }



    const configData = findFile.config[project_name];


    // Ensure cached data is valid
    if(!configData.regexTemplate || configData.regexTemplate == "")
      return sendMsgHelper.reply("No Regex Template provided. Regex Template Invalid");
    
    if(!configData.regexPlaceholder || configData.regexPlaceholder == "")
      return sendMsgHelper.reply("No Regex Placeholder provided. Regex Placeholder Invalid");
    
    if(!configData.fromLocations || configData.fromLocations.length == 0)
      return sendMsgHelper.reply("No Search Locations provided. Search Locations Invalid");
       

    // Notify the client that server is processing request
    sendMsgHelper.reply("processing");
    await new Promise(resolve => {
      setTimeout(()=>resolve())
    }, 200)






    const r = new RegExp(
      configData.regexTemplate.replace(
        configData.regexPlaceholder, 
        serial_number
      )
    );
      
    for(let location of configData.fromLocations){

      // Read files in current location
      let files = []
      try{ files = await fs.promises.readdir(location) }
      catch(err) {
        // Could not read location. Proceed with next location
        console.log(err);
        continue;
      }


      // Use regex to test each file
      for(let file of files){  

        // We found a file matching the serial number regex
        if(r.test(file)){

          // Attempt to get its last modified parameter
          try { 
            let stats = await fs.promises.stat(path.join(location, file)) 


            // Everything is in order. Pack up and return file object
            const data = {
              name: file,
              path: path.join(location, file),
              lastModified: new Date(stats.mtime).getTime()
            }
            console.log("\n\n**************", data)
            return sendMsgHelper.push(null, data);

          }

          catch(err) {
            // Could not read file last modified parameter, continue
            console.log(err);
            continue;
          }
        }
      }
    }


    return sendMsgHelper.push(null, null);
  }


}

module.exports = { findFile }