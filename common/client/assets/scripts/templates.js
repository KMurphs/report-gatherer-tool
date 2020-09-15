const templates = {
  navClasses: ["navbar", "navbar-expand-lg", "navbar-light", "bg-light", "mb-4"],
  nav: "\
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
  ",
  snTable: "\
<div class=\"container table-responsive sn-table\">\
<table class=\"table table-striped table-hover table-bordered\">\
  <thead>\
    <tr>\
      <th class=\"row no-gutters text-center p-0\">\
        <div class=\"col-6 cursor-pointer position-relative filter-control filter-control--sn\">Serial Number<i class=\"fa fa-sort filter-icon\"></i></div>\
        <div class=\"col-2 cursor-pointer position-relative filter-control filter-control--found\">Found<i class=\"fa fa-sort filter-icon\"></i></div>\
        <div class=\"col-2 cursor-pointer position-relative filter-control filter-control--test\">Test<i class=\"fa fa-sort filter-icon\"></i></div>\
        <div class=\"col-2 cursor-pointer position-relative filter-control filter-control--copy\">Copy<i class=\"fa fa-sort filter-icon\"></i></div>\
      </th>\
    </tr>\
  </thead>\
  <tbody class=\"sn-entries-container\">\
  </tbody>\
</table>\
</div>\
",
  snEntryClasses: ["table-primary--", "d-flex", "flex-column", "[xxSerialNumberxx]-row"],
  snEntryHeader: "\n\
  <td >\
    <label class=\"row no-gutters text-center toggler-label\" for=\"[xxSerialNumberxx]-toggler\">\
      <div class=\"col-6 text-left text-serial-number\">\
        <span class=\"font-weight-bold\">\
          <i class=\"fa fa-angle-right\"></i>\
          [xxSerialNumberxx]\
        </span>\
      </div>\
      <div class=\"col-2 bg-[xxFoundColorxx] font-weight-bold text-white border-left-0 d-flex align-items-center justify-content-center text-found\"><span>[xxFoundStatusxx]</span></div>\
      <div class=\"col-2 bg-[xxTestedColorxx] font-weight-bold text-white border-left-0 d-flex align-items-center justify-content-center text-test\"><span>[xxTestedStatusxx]</span></div>\
      <div class=\"col-2 bg-[xxCopiedColorxx] font-weight-bold text-white border-left-0 d-flex align-items-center justify-content-center text-copy\"><span>[xxCopiedStatusxx]</span></div>\
    </label>\
</tr>\n\
",
  snEntryTest: "\
<li class=\"row pt-1 pr-2\">\
  <span class=\"col-4\"><em>[xxSerialNumberxx--ith-test-name]</em></span>\
  <span class=\"col-3\">[xxSerialNumberxx--ith-expected-value]</span>\
  <span class=\"col-3\">[xxSerialNumberxx--ith-actual-value]</span>\
  <span class=\"col-2 bg-[xxSerialNumberxx--ith-pass-fail-color] font-weight-bold d-flex justify-content-center align-items-center text-white p-2\">[xxSerialNumberxx--ith-pass-fail]</span>\
</li>\
",
  snEntryBody: "\
  <td class=\"toggling-content-container\">\
  <input type=\"checkbox\" id=\"[xxSerialNumberxx]-toggler\" class=\"toggler d-none\">\
  <div class=\"details\">\
    <ul class=\"list-unstyled pl-4 mb-2\">\
\
\
      <li class=\"details-section-header\"><em>Report File</em></li>\
      <li>\
        <ul class=\"list-unstyled pl-4 mb-2\">\
          <li class=\"row editable-path\">\
            <span class=\"col-3 my-2 details-item-title\"><em>Path</em></span>\
            <span class=\"col-9 my-2 text-break\">[xxSerialNumberxx--file-path]<i class=\"ml-4 fa fa-edit edit-icon\"></i></span>\
          </li>\
          <li class=\"row\">\
            <span class=\"col-3 my-2 details-item-title\"><em>Modified</em></span>\
            <span class=\"col-9 my-2\">[xxSerialNumberxx--file-last-modified]</span>\
          </li>\
        </ul>\
      </li>\
\
\
      <li class=\"details-section-header\"><em>Report Tests</em></li>\
      <li>\
        <ul class=\"list-unstyled pl-4 mb-2\">\
          <li class=\"row pt-1 pr-2\">\
            <span class=\"col-4 my-2 details-item-title\"><em>Test Name</em></span>\
            <span class=\"col-3 my-2 details-item-title\"><em>expected: </em></span>\
            <span class=\"col-3 my-2 details-item-title\"><em>actual: </em></span>\
            <span class=\"col-2 my-2 details-item-title\"></span>\
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
            <span class=\"col-3 my-2 details-item-title\"><em>Path</em></span>\
            <span class=\"col-9 my-2 text-break\">[xxSerialNumberxx--copied-file-path]</span></li>\
        </ul>\
      </li>\
\
\
    </ul>\
  </div>\
  </td>\
"
}


