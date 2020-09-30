var AdmZip = require('adm-zip');
var fs = require('fs');
var path = require('path');

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






const oldFolder = ".archives"
export const prepareArchiveFolder = async (appFolder: string, projectName: string, orderName: string): Promise<string>=>{
  
  return new Promise(async(resolve, reject)=>{

    let projectFolder = path.join(appFolder, projectName);
    let isValidRepo: boolean;


    // Ensure App Folder exists
    isValidRepo = await fs.existsSync(appFolder);
    if(!isValidRepo){ reject(new ReferenceError(`Reference Folder does not exists: '${appFolder}'`)); }



    // Ensure project folder is created
    try{
      isValidRepo = fs.existsSync(projectFolder);
      if (!isValidRepo){
          await fs.promises.mkdir(projectFolder);
      }
    } catch(err) {
      reject(err)
    }



    // Ensure old archive folder is created
    try{
      let oldArchives = path.join(projectFolder, oldFolder)
      isValidRepo = fs.existsSync(oldArchives);
      if (!isValidRepo){
          await fs.promises.mkdir(oldArchives);
      }
    } catch(err) {
      reject(err)
    }


    // Move everything to old archive dir
    await cleanupProjectFolder(projectFolder);



    // Ensure new archive folder is created
    let timestamp = `[${(new Date()).toISOString().split(".")[0].replace(/[\-:]/g, "_").replace("T", "][")}]`;
    let archiveFolder = path.join(projectFolder, `${orderName}_${timestamp}_[${projectName}]`)
    try {
      isValidRepo = await fs.existsSync(archiveFolder);
      if (!isValidRepo){
          await fs.promises.mkdir(archiveFolder);
      }
    } catch(err) {
      reject(err)
    }

    // Return where to copy files to 
    resolve(archiveFolder);
  })
}










const cleanupProjectFolder = async (projectFolder: string)=>{
  return new Promise(async(resolve, reject)=>{


    // Read files in projectFolder location
    let files: string[] = []
    try{ files = await fs.promises.readdir(projectFolder) }
    catch(err) {
      // Could not read location. Proceed with next location
      console.log(err);
    }



    // if zip file, move to .archives
    // if file, erase
    // if dir, erase
    try{
      for(let file of files){

        let r = new RegExp("^.*(.zip)$");
        let filePath = path.join(projectFolder, file)
        let fileStat = await fs.promises.lstat(filePath)
        
        // if zip file, move to .archives
        if(r.test(filePath)){
          let newPath = path.join(oldFolder, file);
          await fs.promises.copyFile(filePath, path.join(projectFolder, newPath))
          await fs.promises.unlink(filePath)
    
        // if .archive, skip
        } else if(file === oldFolder){
          // Do nothing
    
        // if dir, erase
        } else if(fileStat.isFile()){
          await fs.promises.unlink(filePath)

        // if file, erase
        } else if(fileStat.isDirectory()){
          var rimraf = require("rimraf");
          await new Promise(resolve => {
            rimraf(filePath, function () { resolve(); });
          })
          
    
        } else{
          throw new Error(`Dealing with unknown entity at '${filePath}'`);
        }
      }

    } catch(err) {
      console.log(err);
    }


    resolve();
  })
}












export const finalizeArchiveFolder = (src: string): Promise<any> =>{

  return new Promise(async (resolve) => {
    const archive = new AdmZip();

    // Get copied files 
    let files = await fs.promises.readdir(src);
    
    // Add copies to archive
    for(let file of files){
      archive.addLocalFile(path.join(src, file), "reports");
    }
    
    // Write archive to file system
    await fs.promises.writeFile(`${src}.zip`, archive.toBuffer());

    // Return
    resolve();
  })

}
