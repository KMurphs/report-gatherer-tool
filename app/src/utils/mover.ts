
const fs = require('fs');
var path = require("path");
const moduleName = "[Mover]"


// https://nodejs.org/api/fs.html#fs_file_system
export class Mover{

  private _destinationFolder: string;

  constructor(destinationFolder: string){
    if(!destinationFolder || destinationFolder === "") throw new RangeError("Invalid Configuration Parameter: archiveFolder");
    this._destinationFolder = destinationFolder;

  }


  process(filePath: string): Promise<string | null>{
    return new Promise(async(resolve, reject) => {
  
      // Setup default return object and compile regex with serial number
      let res: string | null = null;

      // Guard against invalid inputs
      if(!this._destinationFolder || this._destinationFolder === ""){ resolve(res); }

      // Copy files
      let newFilePath = path.join(this._destinationFolder, path.basename(filePath))
      await fs.promises.copyFile(filePath, newFilePath)
      .catch((err: any) => reject(err))
  
      // Return 
      resolve(newFilePath);
    })
  }
}