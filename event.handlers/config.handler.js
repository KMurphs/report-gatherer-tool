const fs = require("fs");
const path = require("path");

const { WebSocketMessage } = require("../helpers/ws.message.helper")


const config = {

  data: null,


  handle: async function(appContext, data){


    const configFilePath = path.join(__dirname, config.file);


    // if data is null read config file
    if(!config.data){

      await fs.promises.readFile(configFilePath, { encoding: 'utf-8' })
      .catch(err => { console.error(`Could not read file '${config.file}': `, err); config.writeToFile(); })
      .then(data => config.data = data ? JSON.parse(data) : config.defaults)
      .catch(async err => { 
        console.error(`Could not convert content of file '${config.file}' to json: `, err); 
        await fs.promises.copyFile(configFilePath, configFilePath.replace(/json$/, 'backup.json'))
        config.writeToFile(); 
        config.data = config.defaults;
      })

    }
    console.log(config.data)


    // If string in data, send our config data for the project in string
    if(typeof(data) === "string") {
      const project = data;
      if(!config.data[project]){ 
        config.data[project] = config.defaults;
        config.data[project]["project_name"] = project;
      }
      await fs.promises.writeFile(configFilePath, JSON.stringify(config.data))
      return appContext.reply(config.data[project]); 
    }
    



    // else merge with our copy of config data
    const project = data["project_name"];
    if(!project) appContext.reply("'project_name' field is missing");

    for(let key in data){

      console.log(key);

      switch(key){
        case "directories_to_look_for_reports":
        case "tests_to_validate_reports":
          config.data[project][key] = [...data[key]];
          break;

        default:
          config.data[project][key] = data[key];
          break;
      }

    }
    await fs.promises.writeFile(configFilePath, JSON.stringify(config.data))
    return appContext.reply(config.data[project]); 

  },







  writeToFile: function( data = null ){
    let defaultObj = {}
    !data && (defaultObj[config.defaults.project_name] = config.defaults)

    return fs.promises.writeFile(path.join(__dirname, config.file), JSON.stringify(data || defaultObj))
             .catch(err => console.error(err))
  },
  file: "config.model.json",
  defaults: {
    "project_name": "tmp_project",
    "order_number": "12",
    "directories_to_look_for_reports": ["c:\\reports\\folder_a", "c:\\reports\\folder_b"],						
    "regex_template": "(report_file).*(!xxserial_numberxx!).*(.html)$",
    "regex_template_placeholder": "!xxserial_numberxx!",
    "tests_to_validate_reports": [	
      { 
        "test_friendly_name": "test 1",
        "test_token_html_path": "button:nth-child(2)", 
        "test_token_expected_value": "stop server" 
      }
    ]								
  }
}

module.exports = { config }