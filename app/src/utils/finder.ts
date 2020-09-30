import { TFindConfig, TFindResult } from "./types";

const fs = require('fs');
const path = require('path');
const moduleName = "[Finder]"


export class Finder{
  private _config: TFindConfig;


  constructor(config: TFindConfig){
    if(!config.regexExpression || config.regexExpression === "") throw new RangeError("Invalid Configuration Parameter: regexExpression");
    if(!config.regexPlaceholder || config.regexPlaceholder === "") throw new RangeError("Invalid Configuration Parameter: regexPlaceholder");
    if(!config.from || config.from.length === 0) throw new RangeError("Invalid Configuration Parameter: locations");
    this._config = {...config};
  }



  processSerialNumber(serialNumber: string): Promise<TFindResult | null>{
    return new Promise(async(resolve, reject) => {
  
      // Setup default return object 
      let res: TFindResult | null = null;

      const {regexExpression, regexPlaceholder, from} = this._config;
  
  
      // Protect against invalid input data
      if(!serialNumber || serialNumber === "") resolve(res);
      if(!regexExpression || regexExpression === "") resolve(res);
      if(!regexPlaceholder || regexPlaceholder === "") resolve(res);
      const r = new RegExp(regexExpression.replace(regexPlaceholder, serialNumber));
      
  
  
      // Visit all locations to look for file with serial number of interest
      for(let location of from){
        // console.info(`${moduleName}: Processing Location '${location}'`);
  
  
  
  
        // Read files in current location
        let files: string[] = []
        try{ files = await fs.promises.readdir(location) }
        catch(err) {
          // Could not read location. Proceed with next location
          console.log(err);
          continue;
        }
  
  
        // Use regex to test each file
        for(let file of files){
          // console.info(`${moduleName}: Processing File '${file}' vs '${r}'`)
          
  
  
  
          // We found a file matching the serial number regex
          if(r.test(file)){
            // console.log(`${moduleName}: Found File: '${file}'`)
  
  
            // Attempt to get its last modified parameter
            let stats: any 
            try { stats = await fs.promises.stat(path.join(location, file)) }
            catch(err) {
              // Could not read file last modified parameter, continue
              console.log(err);
              continue;
            }
  
  
            // Everything is in order. Pack up and return file object
            res = {
              name: file,
              path: path.join(location, file),
              lastModified: new Date(stats.mtime).getTime()
            }
            resolve(res);
  
          }
        }
      }
  
  
  
  
      // Return null
      resolve(res);
    })
  }
}





