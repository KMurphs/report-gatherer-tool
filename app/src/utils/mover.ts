
const fs = require('fs');
var path = require("path");
const moduleName = "[Mover]"

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
    
    isValidRepo = await fs.promises.exists(archiveRepository);
    if(!isValidRepo){ resolve(res); }

    
    // Ensure project folder is created
    let projectFolder = path.join(archiveRepository, projectName)
    isValidRepo = await fs.promises.exists(projectFolder);
    if (!isValidRepo){
        await fs.promises.mkdir(projectFolder);
    }


    // Ensure archive folder is created
    let timestamp = `[${(new Date()).toISOString().split(".")[0].replace(/[\-:]/g, "_").replace("T", "][")}]`;
    let archiveFolder = path.join(projectFolder, `${orderName}_${timestamp}_[${projectName}]`)
    isValidRepo = await fs.promises.exists(archiveFolder);
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


