import { TFindConfig, TFindResult } from "./types";

const fs = require('fs');
const moduleName = "[Finder]"
export const finder = (config: TFindConfig, serialNumber: string): Promise<TFindResult | null> => {

  return new Promise(async (resolve, reject) => {
  
    // Setup default return object and compile regex with serial number
    let res: TFindResult | null = null;
    const r = new RegExp(config.regexExpression.replace(config.regexPlaceholder, serialNumber));
    
    // Visit all locations to look for file with serial number of interest
    for(let location of config.from){
      console.log(`${moduleName}: Processing Location '${location}'`);

      // Read files in current location
      let files: string[] = fs.readdirSync(location)






      // Use regex to test each file
      files.forEach(async file => {
        console.log(`${moduleName}: Processing File '${file}'`)
        
        // We found a file matching the serial number regex
        if(r.test(file)){

          // Attempt to get its last modified parameter
          await getFileLastModified(`${location}//${file}`)
          .then(mtime => {

            // Everything is in order. Pack up and return file object
            res = {
              name: file,
              path: `${location}//${file}`,
              lastModified: mtime
            }
            resolve(res);
          })
          .catch(err => {}) // Could not get last modified. Move on
          
        }

      })





    }
  })
}



const getFileLastModified = async (filePath: string): Promise<number> => {
  return new Promise((resolve, reject) => {

    const fs = require('fs');
    fs.stat(filePath, (err: any, stats: any) => {
      if(err) reject(err);
      resolve((stats.mtime as Date).getTime()); // File Data Last Modified
      // resolve(stats.ctime); // File Status Last Modified
    });


  })
}

