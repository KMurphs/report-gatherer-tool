import { TFindConfig, TFindResult } from "./types";

const fs = require('fs');

export const finder = (config: TFindConfig, serialNumber: string): TFindResult | null => {
  
  // Setup default return object and compile regex with serial number
  let res: TFindResult | null = null;
  const r = new RegExp(config.regexExpression.replace(config.regexPlaceholder, serialNumber));
  
  // Visit all locations to look for file with serial number of interest
  for(let location of config.from){

    // Read files in current location
    fs.readdir(location, (err: any, files: string[]) => {
      if(err) {}; // On error, move on

      // Use regex to test each file
      files.forEach(file => {

        // We found a file matching the serial number regex
        if(r.test(file)){

          // Attempt to get its last modified parameter
          getFileLastModified(`${location}//${file}`)
          .then(mtime => {

            // Everything is in order. Pack up and return file object
            res = {
              name: file,
              path: `${location}//${file}`,
              lastModified: mtime
            }
            return res;
          })

          // Could not get last modified. Move on
          .catch(err => {})

        }
      });
    

    });
  }

  return res;
}



const getFileLastModified = (filePath: string): Promise<number> => {
  return new Promise((resolve, reject) => {

    const fs = require('fs');
    fs.stat(filePath, (err: any, stats: any) => {
      if(err) reject(err);
      resolve(stats.mtime); // File Data Last Modified
      // resolve(stats.ctime); // File Status Last Modified
    });


  })
}

