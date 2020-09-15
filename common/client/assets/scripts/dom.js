let isConnectedToBackend = false
let snRepo = {}
let snDomEntriesContainer = null


const domHandleSerialNumber = (snID, snEvent, snData) => {
  
  let snEntry
  if(Object.keys(snRepo).indexOf(snID) == -1){
    snEntry = document.createElement('tr')
    templates.snEntryClasses.forEach(cls => snEntry.classList.add(cls.replace(/\[xxSerialNumberxx\]/g, snID)));
    snDomEntriesContainer.appendChild(snEntry)

  }else{
    snEntry = document.querySelector(`.${snID}-row`)
  }

  snRepo[snID] = snData;
  snRepo[snID].was_found = snData.file.path ? true : false

  let header = templates.snEntryHeader
                        .replace(/\[xxFoundStatusxx\]/g, snRepo[snID].was_found ? "PASS" : "FAIL")
                        .replace(/\[xxFoundColorxx\]/g, snRepo[snID].was_found ? "success" : "danger")
                        .replace(/\[xxTestedStatusxx\]/g, snRepo[snID].has_passed_tests ? "PASS" : "FAIL")
                        .replace(/\[xxTestedColorxx\]/g, snRepo[snID].has_passed_tests ? "success" : "danger")
                        .replace(/\[xxCopiedStatusxx\]/g, snRepo[snID].was_copied ? "PASS" : "FAIL")
                        .replace(/\[xxCopiedColorxx\]/g, snRepo[snID].was_copied ? "success" : "danger")
                        .replace(/\[xxSerialNumberxx\]/g, snID)
  let tests = snRepo[snID]["testers"].reduce((str, item) => {
    let tmp = templates.snEntryTest
                        .replace(/\[xxSerialNumberxx--ith-test-name\]/g, item.result.name)
                        .replace(/\[xxSerialNumberxx--ith-actual-value\]/g, escapeHtml(item.result.actual_value))
                        .replace(/\[xxSerialNumberxx--ith-expected-value\]/g, item.result.expected_value)
                        .replace(/\[xxSerialNumberxx--ith-pass-fail\]/g, item.result.is_pass ? "PASS" : "FAIL")
                        .replace(/\[xxSerialNumberxx--ith-pass-fail-color\]/g, item.result.is_pass ? "success" : "danger")
    return `${str}\n${tmp}\n`
  }, "")
  let body = templates.snEntryBody
                      .replace(/\[xxSerialNumberxx--file-path\]/g, snRepo[snID].file.path)
                      .replace(/\[xxSerialNumberxx--file-last-modified\]/g, new Date(snRepo[snID].file.last_modified).toString().split(" (")[0])
                      .replace(/\[xxSerialNumberxx--Tests\]/g, tests)
                      .replace(/\[xxSerialNumberxx--copied-file-path\]/g, snRepo[snID].copy_file_path)
                      .replace(/\[xxSerialNumberxx]/g, snID)



  snEntry.innerHTML = `${header}\n\n${body}`
  snRepo[snID].domNode = snEntry;
  setTimeout(()=>{
    document.querySelector(`.${snID}-row .toggler`).addEventListener('change', (evt)=>{
      evt.target.checked && document.querySelector(`.${snID}-row .toggler-label .fa`).classList.add("fa--rotated")
      !evt.target.checked && document.querySelector(`.${snID}-row .toggler-label .fa`).classList.remove("fa--rotated")
    })
  }, 250)

}






document.addEventListener('DOMContentLoaded', ()=>{


  const nav = document.querySelector("nav")
  nav.innerHTML = templates.nav
  templates.navClasses.forEach(cls => nav.classList.add(cls));


  document.querySelector("#app-root").innerHTML = templates.snTable
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

  const filterControls = [
    {'css_selector': '.filter-control.filter-control--sn', 'repo_selector': 'id'},
    {'css_selector': '.filter-control.filter-control--found', 'repo_selector': 'was_found'},
    {'css_selector': '.filter-control.filter-control--test', 'repo_selector': 'has_passed_tests'},
    {'css_selector': '.filter-control.filter-control--copy', 'repo_selector': 'was_copied'}
  ].forEach((filter)=>{

    document.querySelector(filter.css_selector).addEventListener('click', (evt)=>{

      if(evt.target.classList.contains('sorted-asc')){

        evt.target.classList.add('sorted-desc')
        evt.target.classList.remove('sorted-asc')

        // Get serial numbers, sort by some field, then for each sn => remove existing html node of sn and re-append
        Object.keys(snRepo).sort((a,b) => snRepo[a][filter.repo_selector] > snRepo[b][filter.repo_selector]).forEach(sn => {
          snDomEntriesContainer.removeChild(snRepo[sn].domNode)
          snDomEntriesContainer.appendChild(snRepo[sn].domNode)
        })

      }else{

        evt.target.classList.remove('sorted-desc')
        evt.target.classList.add('sorted-asc')
        
        // Get serial numbers, sort by some field, then for each sn => remove existing html node of sn and re-append
        Object.keys(snRepo).sort((a,b) => snRepo[a][filter.repo_selector] < snRepo[b][filter.repo_selector]).forEach(sn => {
          snDomEntriesContainer.removeChild(snRepo[sn].domNode)
          snDomEntriesContainer.appendChild(snRepo[sn].domNode)
        })

      }
  
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





function escapeHtml (string) {

  var htmlSpecialCharsEncoding = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  return String(string).replace(/[&<>"'`=\/]/g, function (s) {
    return htmlSpecialCharsEncoding[s];
  });
}

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









