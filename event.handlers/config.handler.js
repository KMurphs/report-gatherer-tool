const fs = require("fs");
const path = require("path");

const { WebSocketMessage } = require("../helpers/ws.message.helper")


const config = {

  data: null,


  handle: async function(appContext, data){

    // if data is null read config file
    if(!config.data){

      const configFilePath = path.join(__dirname, config.file);

      await fs.promises.readFile(configFilePath, { encoding: 'utf-8' })
      .catch(err => { console.error(`Could not read file '${config.file}': `, err); config.writeToFile(); })
      .then(data => config.data = JSON.parse(data))
      .catch(async err => { 
        console.error(`Could not convert content of file '${config.file}' to json: `, err); 
        await fs.promises.copyFile(configFilePath, configFilePath.replace(/json$/, 'backup.json'))
        config.writeToFile(); 
      })

    }


    // If nothing in data, send our config data
    if(!data) { return appContext.reply(config.data); }
    

    // else merge with our copy of config data
    appContext.reply(config.data);
  },







  writeToFile: function(data = null){
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