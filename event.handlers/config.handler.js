const fs = require("fs");
const path = require("path");



const config = {

  data: null,

  getFindFileConfig: async function(project_name){
    if(!config.data) await config.intializeData();
    const {regex_template, regex_template_placeholder, directories_to_look_for_reports} = config.data[project_name]
    return {regex_template, regex_template_placeholder, directories_to_look_for_reports}
    // return {...regex_template, ...regex_template_placeholder, ...directories_to_look_for_reports}
  },


  getTestFileConfig: async function(project_name){
    if(!config.data) await config.intializeData();
    const {tests_to_validate_reports} = config.data[project_name]
    return {tests_to_validate_reports}
  },







  // Handle all incoming messages
  handle: async function(sendMsgHelper, data){


    // absolute path of config file.
    // Ensure that config data is initialized
    const configFilePath = path.join(__dirname, config.file);
    if(!config.data) await config.intializeData();

    

    // RESPOND TO GET CONFIG COMMAND
    // service current event data. 
    if(typeof(data) !== "object") {

      // If not valid string, return error message
      const project = data;
      if(typeof(project) !== "string" || !project || project == "") return sendMsgHelper.reply("'project_name' field is invalid");
      
      // If string in data, send our config data for the project in string
      if(!config.data[project]){ 
        // we don't know about this project, create it with defaults
        config.data[project] = {...config.defaults};
        config.data[project]["project_name"] = project;
      }



      // Save current data to file and send back new project data
      await fs.promises.writeFile(configFilePath, JSON.stringify(config.data))
      return sendMsgHelper.reply(config.data[project]); 
    }
    

    
    // RESPOND TO UPDATE CONFIG COMMAND
    // Assume that data is an object
    // therefore merge it with our copy of config data

    // it is mandatory that we know which project is of interest
    const project = data["project_name"];
    if(typeof(project) !== 'string' || !project || project == "") return sendMsgHelper.reply("'project_name' field is missing or empty");


    // If unknown project name, create default
    if(!config.data[project]){ 
      // we don't know about this project, create it with defaults
      config.data[project] = {...config.defaults};
      config.data[project]["project_name"] = project;
    }


    // merge with our copy of data
    let key = null;

    // Number
    key = "order_number"
    if(key in data){
      if(typeof(data[key]) !== 'number' || !data[key] || data[key] == "") 
        return sendMsgHelper.reply(`'${key}' field is invalid`);
      config.data[project][key] = data[key];
    }

    // String
    key = "regex_template"
    if(key in data){
      if(typeof(data[key]) !== 'string' || !data[key] || data[key] == "") 
        return sendMsgHelper.reply(`'${key}' field is invalid`);
      config.data[project][key] = data[key];
    }
    key = "regex_template_placeholder"
    if(key in data){
      if(typeof(data[key]) !== 'string' || !data[key] || data[key] == "") 
        return sendMsgHelper.reply(`'${key}' field is invalid`);
      config.data[project][key] = data[key];
    }

    // Arrays
    key = "directories_to_look_for_reports"
    if(key in data){
      if(typeof(data[key]) !== 'object' || !data[key] || !data[key].length || data[key].length == 0) 
        return sendMsgHelper.reply(`'${key}' field is invalid`);
      config.data[project][key] =[...data[key]];
    }
    key = "tests_to_validate_reports"
    if(key in data){
      if(typeof(data[key]) !== 'object' || !data[key] || !data[key].length || data[key].length == 0) 
        return sendMsgHelper.reply(`'${key}' field is invalid`);
      config.data[project][key] =[...data[key]];
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
  intializeData: async function(){
    // if data is null, populate data from file or defaults


    // absolute path of config file
    const configFilePath = path.join(__dirname, config.file);

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
        name: "test 1",
        css_selector: "button:nth-child(2)", 
        expected_value: "stop server" 
      }
    ]								
  }


}

module.exports = { config }