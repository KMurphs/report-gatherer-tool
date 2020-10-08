const fs = require("fs");
const path = require("path");

const { WebSocketMessage } = require("../helpers/ws.message.helper")


const config = {

  data: null,

  // Handle all incoming messages
  handle: async function(sendMsgHelper, data){

    // absolute path of config file
    const configFilePath = path.join(__dirname, config.file);

    // if data is null, populate data from file or defaults
    if(!config.data){


      // File does not exists, write defaults
      if(!fs.existsSync(configFilePath) || !(await fs.promises.lstat(configFilePath)).isFile()){
        config.writeToFile(); 
      }

      // Read config file
      await fs.promises.readFile(configFilePath, { encoding: 'utf-8' })

      // cannot read file, backup existing file, write defaults
      .catch(async err => { 
        console.error(`Could not read file '${config.file}': `, err); 

        // backup existing file
        try { await fs.promises.copyFile(configFilePath, configFilePath.replace(/json$/, 'backup.json')) }
        catch(err) { console.error(`Could not make a copy of '${config.file}': `, err) }
        
        // write defaults
        config.writeToFile(); 
      })

      // Successfully read file. Convert content to json.
      .then(data => config.data = data ? JSON.parse(data) : config.defaults)

      // Could not convert to json, backup existing file, write defaults 
      .catch(async err => { 
        console.error(`Could not convert content of file '${config.file}' to json: `, err); 

        // backup existing file
        await fs.promises.copyFile(configFilePath, configFilePath.replace(/json$/, 'backup.json'))

        // write defaults
        config.writeToFile(); 
        config.data = config.defaults;
      })


      // data field is populated
      console.log(config.data)
    }



    // service current event data
    if(typeof(data) !== "object") {

      // If not valid string, return error message
      const project = data;
      if(typeof(project) !== "string" || !project || project == "") return sendMsgHelper.reply("'project_name' field is invalid");

      // If string in data, send our config data for the project in string
      if(!config.data[project]){ 
        // we don't know about this project, create it with defaults
        config.data[project] = config.defaults;
        config.data[project]["project_name"] = project;
      }


      // Save current data to file and send back new project data
      await fs.promises.writeFile(configFilePath, JSON.stringify(config.data))
      return sendMsgHelper.reply(config.data[project]); 
    }
    

    

    // Assume that data is an object
    // therefore merge it with our copy of config data

    // it is mandatory that we know which project is of interest
    const project = data["project_name"];
    if(!project || project == "") return sendMsgHelper.reply("'project_name' field is missing or empty");


    // If unknown project name, create default
    if(!config.data[project]){ 
      // we don't know about this project, create it with defaults
      config.data[project] = config.defaults;
      config.data[project]["project_name"] = project;
    }


    // merge with our copy of data
    for(let key in data){


      switch(key){
        // Arrays
        case "directories_to_look_for_reports":
        case "tests_to_validate_reports":
          config.data[project][key] = [...data[key]];
          break;

        // strings 
        default:
          config.data[project][key] = data[key];
          break;
      }

    }

    // Save updated data to file and send back new project data
    await fs.promises.writeFile(configFilePath, JSON.stringify(config.data))
    return sendMsgHelper.reply(config.data[project]); 

  },







  writeToFile: function( data ){

    // In case data is null, prepare the object with default values
    let defaultObj = {}
    !data && (defaultObj[config.defaults.project_name] = config.defaults)

    // write
    return fs.promises.writeFile(path.join(__dirname, config.file), JSON.stringify(data || defaultObj))
             .catch(err => console.error(err))
  },



  // defaults
  file: "config.model.json",
  defaults: {
    project_name: "tmp_project",
    order_number: 12,
    directories_to_look_for_reports: ["c:\\reports\\folder_a", "c:\\reports\\folder_b"],						
    regex_template: "(report_file).*(!xxserial_numberxx!).*(.html)$",
    regex_template_placeholder: "!xxserial_numberxx!",
    tests_to_validate_reports: [	
      { 
        friendly_name: "test 1",
        css_selector: "button:nth-child(2)", 
        expected_value: "stop server" 
      }
    ]								
  }


}

module.exports = { config }