
const fs = require('fs');
var path = require("path");
const moduleName = "[Mover]"
const oldFolder = ".archives"

// https://nodejs.org/api/fs.html#fs_file_system

export const mover = (projectName: string, orderName: string, archiveRepository: string, filePaths: string[]): Promise<string | null> => {

  return new Promise(async(resolve, reject) => {
  
    // Setup default return object and compile regex with serial number
    let res: string | null = null;
    let isValidRepo: boolean



    // Guard against invalid inputs
    if(!archiveRepository || archiveRepository === ""){ resolve(res); }
    if(!projectName || projectName === ""){ resolve(res); }
    if(!orderName || orderName === ""){ resolve(res); }
    if(!filePaths || filePaths === []){ resolve(res); }
    
    isValidRepo = await fs.existsSync(archiveRepository);
    if(!isValidRepo){ resolve(res); }

    
    // Ensure project folder is created
    let projectFolder = path.join(archiveRepository, projectName)
    isValidRepo = fs.existsSync(projectFolder);
    if (!isValidRepo){
        await fs.promises.mkdir(projectFolder);
    }

    // Ensure old archive folder is created
    let oldArchives = path.join(projectFolder, oldFolder)
    isValidRepo = fs.existsSync(oldArchives);
    if (!isValidRepo){
        await fs.promises.mkdir(oldArchives);
    }


    await cleanupProjectFolder(projectFolder);



    // Ensure archive folder is created
    let timestamp = `[${(new Date()).toISOString().split(".")[0].replace(/[\-:]/g, "_").replace("T", "][")}]`;
    let archiveFolder = path.join(projectFolder, `${orderName}_${timestamp}_[${projectName}]`)
    isValidRepo = await fs.existsSync(archiveFolder);
    if (!isValidRepo){
        await fs.promises.mkdir(archiveFolder);
    }



    // Copy files
    await Promise.all(filePaths.map(filePath => fs.promises.copyFile(filePath, path.join(archiveFolder, path.basename(filePath)))))
    .catch(err => console.log(err))



    // Return 
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