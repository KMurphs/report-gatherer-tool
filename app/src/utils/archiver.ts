var AdmZip = require('adm-zip');
var fs = require('fs');
var path = require('path');


export const archiver = (src: string): Promise<any> =>{

  return new Promise(async (resolve) => {
    const archive = new AdmZip();

    let files = await fs.promises.readdir(src);
    
    // archive.addFolder('reports');
    for(let file of files){
      archive.addLocalFile(path.join(src, file), "reports");
    }
    
    await fs.promises.writeFile(`${src}.zip`, archive.toBuffer());

    resolve();
  })

}


