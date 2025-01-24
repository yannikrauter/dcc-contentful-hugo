window.onload = () => {
    /* When the user clicks on the button, 
    toggle between hiding and showing the dropdown content */

    /* Add event listeners for all of the <a> elements
   which has class .dropbtn */
    const btns = document.getElementsByClassName('dropbtn');
    for (let element of btns){
        element.addEventListener('click', showItems);
        element.parentNode.addEventListener('focusout', hideItems);
    }

    /* Call responsive table functions */
    AddTableARIA();
    ResponsiveCellHeaders("schedule-table");
    ResponsiveCellHeaders("exercise-table");
}

// Just toggle the .show class, if there appears to be dropdown content
function showItems(e){
    let parent = e.target.parentNode;
    if (parent.children.length > 1){
        parent.children[1].classList.toggle("show");
    }
}

// Hides the dropdown on unfocus
function hideItems(e){
    const target = e.target;
    const parent = target.parentNode;
    const related = e.relatedTarget;
    if (related != null && parent === related.parentNode) {
        return;
    }
    // Unfocused from dropdown header
    if (target.classList.contains("dropbtn") && (related == null || related.parentNode.parentNode !== parent)) {
        if (parent.children.length > 1) {
            parent.children[1].classList.remove("show");
        }
    } else {
        // Unfocused from dropdown link
        parent.classList.remove("show");
    }

}

function hamburgerToggle(e) {
  var items = document.getElementsByClassName("dropdown");
  for (let item of items) {
    if (item.style.display === "block") {
      item.style.display = "";
    } else {
      item.style.display = "block";
    }
  }
}

// Function required for responsive tables
function ResponsiveCellHeaders(elmID) {
    try {
      var THarray = [];
      var table = document.getElementById(elmID);
      if (table == null) {
        return;
      }
      var ths = table.getElementsByTagName("th");
      for (var i = 0; i < ths.length; i++) {
        var headingText = ths[i].innerHTML;
        THarray.push(headingText);
      }
      var styleElm = document.createElement("style"),
        styleSheet;
      document.head.appendChild(styleElm);
      styleSheet = styleElm.sheet;
      for (var i = 0; i < THarray.length; i++) {
        styleSheet.insertRule(
          "#" +
            elmID +
            " td:nth-child(" +
            (i + 1) +
            ')::before {content:"' +
            THarray[i] +
            ': ";}',
          styleSheet.cssRules.length
        );
      }
    } catch (e) {
      console.log("ResponsiveCellHeaders(): " + e);
    }
}
  
// https://adrianroselli.com/2018/02/tables-css-display-properties-and-aria.html
// https://adrianroselli.com/2018/05/functions-to-add-aria-to-tables-and-lists.html
function AddTableARIA() {
    try {
        var allTables = document.querySelectorAll('table');
        for (var i = 0; i < allTables.length; i++) {
        allTables[i].setAttribute('role','table');
        }
        var allRowGroups = document.querySelectorAll('thead, tbody, tfoot');
        for (var i = 0; i < allRowGroups.length; i++) {
        allRowGroups[i].setAttribute('role','rowgroup');
        }
        var allRows = document.querySelectorAll('tr');
        for (var i = 0; i < allRows.length; i++) {
        allRows[i].setAttribute('role','row');
        }
        var allCells = document.querySelectorAll('td');
        for (var i = 0; i < allCells.length; i++) {
        allCells[i].setAttribute('role','cell');
        }
        var allHeaders = document.querySelectorAll('th');
        for (var i = 0; i < allHeaders.length; i++) {
        allHeaders[i].setAttribute('role','columnheader');
        }
        // this accounts for scoped row headers
        var allRowHeaders = document.querySelectorAll('th[scope=row]');
        for (var i = 0; i < allRowHeaders.length; i++) {
        allRowHeaders[i].setAttribute('role','rowheader');
        }
        // caption role not needed as it is not a real role and
        // browsers do not dump their own role with display block
    } catch (e) {
        console.log("AddTableARIA(): " + e);
    }
}



// Navigation change SVG color on hover
// function mouseoverDropdown(element) {
//   element.children[0].style.display = "none";
//   element.children[1].style.display = "";
// }

// function mouseoutDropdown(element) {
//   element.children[0].style.display = "";
//   element.children[1].style.display = "none";
// }