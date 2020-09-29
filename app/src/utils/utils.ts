export const createAppFolders = (): string => {
  var fs = require('fs');
  var path = require('path');

  let tmp = process.env.USERPROFILE
  tmp = path.join(tmp, "Documents");
  tmp = path.join(tmp, "report-gatherer");;

  const appFolder: string = tmp;
  
  
  if (!fs.existsSync(appFolder)){
      fs.mkdirSync(appFolder);
  }
  // if (!fs.existsSync(path.join(appFolder, "tests"))){
  //     fs.mkdirSync(path.join(appFolder, "tests"));
  // }
  // if (!fs.existsSync(path.join(appFolder, "archives"))){
  //     fs.mkdirSync(path.join(appFolder, "archives"));
  // }
  // if (!fs.existsSync(path.join(appFolder, "current"))){
  //     fs.mkdirSync(path.join(appFolder, "current"));
  // }
  // if (!fs.existsSync(path.join(appFolder, "data"))){
  //     fs.mkdirSync(path.join(appFolder, "data"));
  // }

  return appFolder;
}

