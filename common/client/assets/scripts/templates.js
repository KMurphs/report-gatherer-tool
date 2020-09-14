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
            <span class=\"col-1 details-item-title\"><em>Path</em></span>\
            <span class=\"col-11\">[xxSerialNumberxx--file-path]</span>\
          </li>\
          <li class=\"row\">\
            <span class=\"col-1 details-item-title\"><em>Modified</em></span>\
            <span class=\"col-11\">[xxSerialNumberxx--file-last-modified]</span>\
          </li>\
        </ul>\
      </li>\
\
\
      <li class=\"details-section-header\"><em>Report Tests</em></li>\
      <li>\
        <ul class=\"list-unstyled pl-4 mb-2\">\
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
            <span class=\"col-1 details-item-title\"><em>Path</em></span>\
            <span class=\"col-11\">[xxSerialNumberxx--copied-file-path]</span></li>\
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
  <!--<span class=\"col-1 d-none d-lg-inline details-item-title\"><em>Test: </em></span>-->\
  <span class=\"col-3\">[xxSerialNumberxx--ith-test-name]</span>\
\
\
  <span class=\"col-1 col-md-2 col-lg-1\">\
    <span class=\"d-none d-md-inline details-item-title\"><em>expected: </em></span>\
    <span class=\"d-inline d-md-none details-item-title\"><em>exp: </em></span>\
  </span>\
  <span class=\"col-3\">[xxSerialNumberxx--ith-expected-value]</span>\
\
\
  <span class=\"col-1\">\
    <span class=\"d-none d-md-inline details-item-title\"><em>actual: </em></span>\
    <span class=\"d-inline d-md-none details-item-title\"><em>act: </em></span>\
  </span>\
  <span class=\"col-3\">[xxSerialNumberxx--ith-actual-value]</span>\
\
\
  <span class=\"col-1 btn btn-[xxSerialNumberxx--ith-pass-fail-color] btn-sm font-weight-bold\">[xxSerialNumberxx--ith-pass-fail]</span>\
</li>\
"
