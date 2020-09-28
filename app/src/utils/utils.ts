export const createAppFolders = ()=>{
  const appFolder: string = `${process.env.USERPROFILE}\\Documents\\report-gatherer`;
  var fs = require('fs');
  
  if (!fs.existsSync(appFolder)){
      fs.mkdirSync(appFolder);
  }
  if (!fs.existsSync(`${appFolder}\\tests`)){
      fs.mkdirSync(`${appFolder}\\tests`);
  }
  if (!fs.existsSync(`${appFolder}\\archives`)){
      fs.mkdirSync(`${appFolder}\\archives`);
  }
  if (!fs.existsSync(`${appFolder}\\current`)){
      fs.mkdirSync(`${appFolder}\\current`);
  }
  if (!fs.existsSync(`${appFolder}\\data`)){
      fs.mkdirSync(`${appFolder}\\data`);
  }
}

