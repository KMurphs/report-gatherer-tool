let isConnectedToBackend = false
let snRepo = {}
let snDomEntriesContainer = null


const domHandleSerialNumber = (snID, snEvent, snData) => {
  
  let snEntry
  if(Object.keys(snRepo).indexOf(snID) == -1){

    snRepo[snID] = snData;
    snEntry = document.createElement('tr')
    snEntryClasses.forEach(cls => snEntry.classList.add(cls.replace(/\[xxSerialNumberxx\]/g, snID)));
    snDomEntriesContainer.appendChild(snEntry)

  }else{
    snEntry = document.querySelector(`.${snID}-row`)
  }

  

  let header = snEntryHeader.replace(/\[xxFoundStatusxx\]/g, snData.file.path ? "PASS" : "FAIL")
                            .replace(/\[xxFoundColorxx\]/g, snData.file.path ? "success" : "danger")
                            .replace(/\[xxTestedStatusxx\]/g, snData.has_passed_tests ? "PASS" : "FAIL")
                            .replace(/\[xxTestedColorxx\]/g, snData.has_passed_tests ? "success" : "danger")
                            .replace(/\[xxCopiedStatusxx\]/g, snData.was_copied ? "PASS" : "FAIL")
                            .replace(/\[xxCopiedColorxx\]/g, snData.was_copied ? "success" : "danger")
                            .replace(/\[xxSerialNumberxx\]/g, snID)
  let tests = snData["testers"].reduce((str, item) => {
    let tmp = snEntryTest.replace(/\[xxSerialNumberxx--ith-test-name\]/g, item.result.name)
                          .replace(/\[xxSerialNumberxx--ith-actual-value\]/g, item.result.expected_value)
                          .replace(/\[xxSerialNumberxx--ith-expected-value\]/g, item.result.actual_value)
                          .replace(/\[xxSerialNumberxx--ith-pass-fail\]/g, item.result.is_pass ? "PASS" : "FAIL")
                          .replace(/\[xxSerialNumberxx--ith-pass-fail-color\]/g, item.result.is_pass ? "success" : "danger")
    return `${str}\n${tmp}\n`
  }, "")
  let body = snEntryBody.replace(/\[xxSerialNumberxx--file-path\]/g, snData.file.path)
                        .replace(/\[xxSerialNumberxx--file-last-modified\]/g, new Date(snData.file.last_modified).toISOString())
                        .replace(/\[xxSerialNumberxx--Tests\]/g, tests)
                        .replace(/\[xxSerialNumberxx--copied-file-path\]/g, snData.copy_file_path)
                        .replace(/\[xxSerialNumberxx]/g, snID)



  snEntry.innerHTML = `${header}\n\n${body}`
  setTimeout(()=>{
    document.querySelector(`.${snID}-row .toggler`).addEventListener('change', (evt)=>{
      evt.target.checked && document.querySelector(`.${snID}-row .toggler-label .fa`).classList.add("fa--rotated")
      !evt.target.checked && document.querySelector(`.${snID}-row .toggler-label .fa`).classList.remove("fa--rotated")
    })
  }, 250)

}


document.addEventListener('DOMContentLoaded', ()=>{
  

  // setTimeout(()=>{
  //   domHandleSerialNumber("serial_number_1", "on_found", {
  //     "id": "serial_number_1", "was_copied": true, "has_passed_tests": true, "was_processed": true,
  //     "copy_file_path": "c\\report\\to\\some\\other\\path",
  //     "file": {"path": "path:\\to\\file", "last_modified": new Date().getTime()},
  //     "testers": [
  //       {
  //         "definition": {"name": "test name", "css_selector": "span>span", "expected_value": "Value"}, 
  //         "result": {"name": "test name", "actual_value": "Values", "expected_value": "Value", "is_pass": false}
  //       },
  //       {
  //         "definition": {"name": "test name", "css_selector": "span>span", "expected_value": "Value"}, 
  //         "result": {"name": "test name", "actual_value": "Values", "expected_value": "Value", "is_pass": false}
  //       }
  //     ]
  //   })
  // }, 1000)

  const nav = document.querySelector("nav")
  nav.innerHTML = navHTML
  navClasses.forEach(cls => nav.classList.add(cls));


  document.querySelector("#app-root").innerHTML = snTable
  snDomEntriesContainer = document.querySelector(".sn-entries-container")


  document.getElementById("freeze-report").addEventListener('click', ()=>{
    let html = `${document.head.outerHTML}\n\n${document.body.outerHTML}`
    sendMessage("/save", html)
    .then(res => console.log(res))
    .catch(err => console.log(err))
  })
  
  
  
  document.getElementById("stop-server").addEventListener('click', ()=>{
    sendMessage("/stop")
    .then(res => {
      console.log(res)
      window.close()
    })
    .catch(err => {
      console.log(err)
      // window.close()
    })
  })


  setInterval(() => {
    console.log("[Client]: PING")
    sendMessage("/ping", "", true)
    .then(res => {
      if(!isConnectedToBackend){
        startProcessingSerialNumbers()
        isConnectedToBackend = true
      }
      console.log(res)
    })
    .catch(err => console.log(err))
  }, 1000);


})













