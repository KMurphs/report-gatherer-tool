const navClasses = ["navbar", "navbar-expand-lg", "navbar-light", "bg-light", "mb-4"]
const navHTML = "\
<a class=\"navbar-brand\" href=\"#\">Report Gatherer Tool: Report</a>\
<button class=\"navbar-toggler\" type=\"button\" data-toggle=\"collapse\" data-target=\"#navbarText\" aria-controls=\"navbarText\" aria-expanded=\"false\" aria-label=\"Toggle navigation\">\
  <span class=\"navbar-toggler-icon\"></span>\
</button>\
<div class=\"collapse navbar-collapse\" id=\"navbarText\">\
  <ul class=\"navbar-nav ml-auto\">\
    <li class=\"nav-item mr-2\">\
      <a class=\"nav-link text-info\" id=\"freeze-report\" href=\"#\">Freeze HTML Report</a>\
    </li>\
    <li class=\"nav-item\">\
      <a class=\"nav-link text-danger\" id=\"stop-server\" href=\"#\">Stop Server</a>\
    </li>\
  </ul>\
</div>\
"

const snTable = "\
<div class=\"container table-responsive sn-table\">\
<table class=\"table table-striped table-hover table-bordered\">\
  <thead>\
    <tr>\
      <th class=\"row no-gutters text-center\">\
        <div class=\"col-6 text-left\">Serial Number</div>\
        <div class=\"col-2\">Found</div>\
        <div class=\"col-2\">Test</div>\
        <div class=\"col-2\">Copy</div>\
      </th>\
    </tr>\
  </thead>\
  <tbody class=\"sn-entries-container\">\
  </tbody>\
</table>\
</div>\
"

const snEntryClasses = ["table-primary", "d-flex", "flex-column", "[xxSerialNumberxx]-row"]
const snEntryHeader = "\n\
  <td >\
    <label class=\"row no-gutters text-center toggler-label\" for=\"[xxSerialNumberxx]-toggler\">\
      <div class=\"col-6 text-left\">\
        <span class=\"btn btn-default btn-sm font-weight-bold\">\
          <i class=\"fa fa-angle-right\"></i>\
          [xxSerialNumberxx]\
        </span>\
      </div>\
      <div class=\"col-2\"><span class=\"btn btn-[xxFoundColorxx] btn-sm font-weight-bold\">[xxFoundStatusxx]</span></div>\
      <div class=\"col-2\"><span class=\"btn btn-[xxTestedColorxx] btn-sm font-weight-bold\">[xxTestedStatusxx]</span></div>\
      <div class=\"col-2\"><span class=\"btn btn-[xxCopiedColorxx] btn-sm font-weight-bold\">[xxCopiedStatusxx]</span></div>\
    </label>\
</tr>\n\
"
const snEntryBody = "\
  <td class=\"toggling-content-container\">\
  <input type=\"checkbox\" id=\"[xxSerialNumberxx]-toggler\" class=\"toggler d-none\">\
  <div class=\"details\">\
    <ul class=\"list-unstyled pl-4 mb-2\">\
\
\
      <li class=\"details-section-header\"><em>Report File</em></li>\
      <li>\
        <ul class=\"list-unstyled pl-4 mb-2\">\
          <li class=\"row\">\
            <span class=\"col-3 details-item-title\"><em>Path</em></span>\
            <span class=\"col-9\">[xxSerialNumberxx--file-path]</span>\
          </li>\
          <li class=\"row\">\
            <span class=\"col-3 details-item-title\"><em>Modified</em></span>\
            <span class=\"col-9\">[xxSerialNumberxx--file-last-modified]</span>\
          </li>\
        </ul>\
      </li>\
\
\
      <li class=\"details-section-header\"><em>Report Tests</em></li>\
      <li>\
        <ul class=\"list-unstyled pl-4 mb-2\">\
          <li class=\"row pt-1 pr-2\">\
            <span class=\"col-4 details-item-title\"><em>Test Name</em></span>\
            <span class=\"col-3 details-item-title\"><em>expected: </em></span>\
            <span class=\"col-3 details-item-title\"><em>actual: </em></span>\
            <span class=\"col-2 details-item-title\"></span>\
          </li>\
          [xxSerialNumberxx--Tests]\
        </ul>\
      </li>\
      <li></li>\
\
\
      <li class=\"details-section-header\"><em>Report Copy</em></li>\
      <li>\
        <ul class=\"list-unstyled pl-4 mb-2\">\
          <li class=\"row \">\
            <span class=\"col-3 details-item-title\"><em>Path</em></span>\
            <span class=\"col-9\">[xxSerialNumberxx--copied-file-path]</span></li>\
        </ul>\
      </li>\
\
\
    </ul>\
  </div>\
  </td>\
"

const snEntryTest = "\
<li class=\"row pt-1 pr-2\">\
  <span class=\"col-4\">[xxSerialNumberxx--ith-test-name]</span>\
  <span class=\"col-3\">[xxSerialNumberxx--ith-expected-value]</span>\
  <span class=\"col-3\">[xxSerialNumberxx--ith-actual-value]</span>\
  <span class=\"col-2 btn btn-[xxSerialNumberxx--ith-pass-fail-color] btn-sm font-weight-bold\">[xxSerialNumberxx--ith-pass-fail]</span>\
</li>\
"