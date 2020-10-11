const fs = require("fs")
const path = require("path")
const $ = require('cheerio');


const { config } = require("./config.handler")
const { prepareArchiveFolder, finalizeArchiveFolder } = require("../helpers/app.file.system.helper");
const { resolve } = require("path");

const archiver = {
  config: {},


  prepare: async function(sendMsgHelper, appFolder, {project_name}){

    // Ensure inputs are okay
    if(typeof(project_name) !== "string" || !project_name || project_name == "") 
      return sendMsgHelper.push(null, "No Project Name was provided. Project Name Invalid");

    // Ensure we have config data for current project of interest
    if(!archiver.config[project_name]){

      // Get data
      const { order_number } = await config.getArchiverConfig(project_name);
      
      if(typeof(order_number) !== "number" || !order_number || order_number <= 0)
        return sendMsgHelper.push(null, "No Order Number was provided. Order Number Invalid");


      // Cache data
      archiver.config[project_name] = {
        order_number: order_number,
        destination_folder: null
      };

    }
    await new Promise(resolve => {
      setTimeout(resolve, 200);
    })

    const configData = archiver.config[project_name];
    try{
      configData.destination_folder = await prepareArchiveFolder(appFolder, project_name, configData.order_number);
    }catch(err){
      return sendMsgHelper.push(null, {message: `Project '${project_name}' was not configured successfully for Archiving.`, error: err.message});
    }

    
    
    return sendMsgHelper.push(null, {destination: configData.destination_folder});

  },



  move: async function(sendMsgHelper, {project_name, file_path}){


    // Ensure inputs are okay
    if(typeof(project_name) !== "string" || !project_name || project_name == "") 
      return sendMsgHelper.reply("No Project Name was provided. Project Name Invalid");

    if(typeof(file_path) !== "string" || !file_path || file_path == "") 
      return sendMsgHelper.reply("No File Path provided. File Path Invalid");
    
    if( !fs.existsSync(file_path) || !(await fs.promises.stat(file_path)).isFile() )
      return sendMsgHelper.reply("No File Path provided. File Path Invalid");

    
    
    const configData = archiver.config[project_name];


    // Ensure we have config data for current project of interest
    if(!configData){
      return sendMsgHelper.reply(`No Record of Project '${project_name}' ever configured for Archiving.`);
    }
    if(!configData.destination_folder || !fs.existsSync(configData.destination_folder) || !(await fs.promises.stat(configData.destination_folder)).isDirectory()){
      return sendMsgHelper.reply(`Project '${project_name}' was not configured successfully for Archiving.`);
    }

    
      

    // Copy files
    let newFilePath = path.join(configData.destination_folder, path.basename(file_path))
    
    try{
      await fs.promises.copyFile(file_path, newFilePath)
    } catch (err) {
      return sendMsgHelper.reply(`Error Copying File '${file_path}' to '${newFilePath}'`);
    }


    return sendMsgHelper.reply({new_file_path: newFilePath});
  },



  finalize: async function(sendMsgHelper, {project_name}){

    // Ensure inputs are okay
    if(typeof(project_name) !== "string" || !project_name || project_name == "") 
      return sendMsgHelper.reply("No Project Name was provided. Project Name Invalid");

    // Ensure we have config data for current project of interest
    if(!archiver.config[project_name]){
      return sendMsgHelper.reply(`No Record of Project '${project_name}' ever configured for Archiving.`);
    }

    const configData = archiver.config[project_name];

    if(!configData.destination_folder || !fs.existsSync(configData.destination_folder) || !(await fs.promises.stat(configData.destination_folder)).isDirectory()){
      return sendMsgHelper.reply(`Project '${project_name}' was not configured successfully for Archiving.`);
    }

    await finalizeArchiveFolder(configData.destination_folder);

    return sendMsgHelper.reply({message: "Repository Archived", zip_file_path: `${configData.destination_folder}.zip`});
  },



}

module.exports = { archiver }