
let selectedFile;
let gst_object;
let books_object;

var _table_ = document.createElement('table'),
    _tr_ = document.createElement('tr'),
    _th_ = document.createElement('th'),
    _td_ = document.createElement('td');
_table_.className = "table table-bordered"
// Builds the HTML Table out of myList json data from Ivy restful service.
function buildHtmlTable(arr, title) {
    let cnt = document.createElement('div')
    let h3 = document.createElement('h3')
    h3.innerHTML = title;
    cnt.appendChild(h3)
    var table = _table_.cloneNode(false),
        columns = addAllColumnHeaders(arr, table);
    for (var i = 0, maxi = arr.length; i < maxi; ++i) {
        var tr = _tr_.cloneNode(false);
        for (var j = 0, maxj = columns.length; j < maxj; ++j) {
            var td = _td_.cloneNode(false);
            cellValue = arr[i][columns[j]];
            td.appendChild(document.createTextNode(arr[i][columns[j]] || ''));
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    cnt.appendChild(table)
    return cnt;
}

// Adds a header row to the table and returns the set of columns.
// Need to do union of keys from all records as some records may not contain
// all records
function addAllColumnHeaders(arr, table) {
    var columnSet = [],
        tr = _tr_.cloneNode(false);
    for (var i = 0, l = arr.length; i < l; i++) {
        for (var key in arr[i]) {
            if (arr[i].hasOwnProperty(key) && columnSet.indexOf(key) === -1) {
                columnSet.push(key);
                var th = _th_.cloneNode(false);
                th.appendChild(document.createTextNode(key));
                tr.appendChild(th);
            }
        }
    }
    table.appendChild(tr);
    return columnSet;
}

document
    .getElementById("fileUpload_gst")
    .addEventListener("change", function (event) {
        selectedFile = event.target.files[0];
        if (selectedFile) {
            let fileReader = new FileReader();
            fileReader.onload = function (event) {
                let data = event.target.result;

                let workbook = XLSX.read(data, {
                    type: "binary"
                });
                workbook.SheetNames.forEach(sheet => {
                    gst_object = XLSX.utils.sheet_to_row_object_array(
                        workbook.Sheets[sheet]
                    );
                });
            };
            fileReader.readAsBinaryString(selectedFile);
        }
    });


document
    .getElementById("fileUpload_books")
    .addEventListener("change", function (event) {
        selectedFile = event.target.files[0];
        if (selectedFile) {
            let fileReader = new FileReader();
            fileReader.onload = function (event) {
                let data = event.target.result;

                let workbook = XLSX.read(data, {
                    type: "binary"
                });
                workbook.SheetNames.forEach(sheet => {
                    books_object = XLSX.utils.sheet_to_row_object_array(
                        workbook.Sheets[sheet]
                    );
                });
            };
            fileReader.readAsBinaryString(selectedFile);
        }
    });

function find_entity() {
    let gst_entity = Object.keys(gst_object[0]);
    let books_entity = Object.keys(books_object[0]);
    let ulG = document.createElement('ul');
    ulG.className = 'list-group'
    ulG.id = "gst_list";
    
    let select = document.createElement('select')
    select.className = "custom-select";
    let optionDef = document.createElement('option');
    optionDef.value = "none";
    optionDef.text = "none";
    select.appendChild(optionDef);
    for (let i = 0; i < books_entity.length; i++) {
    let option = document.createElement('option');
    option.value = books_entity[i];
    option.text = books_entity[i];
    select.appendChild(option);
    }
    

    for (let i = 0; i < gst_entity.length; i++) {
       let selectElm = select.cloneNode(true);
        let li = document.createElement('li');
        let label = document.createElement('span');
        label.innerHTML = gst_entity[i];
        let iconSel = document.createElement("span");
        iconSel.innerHTML = "=";
        iconSel.className = "equal-sign";
        let container = document.createElement('div');
        container.className = 'cnt';
        container.appendChild(iconSel);
        container.appendChild(selectElm)
        container.setAttribute('data-label', gst_entity[i]);
        li.appendChild(label);
        li.appendChild(container);
        li.className = 'list-group-item'
        ulG.appendChild(li);
    }
    
    document.getElementById('list-cnt').innerHTML = '';
    let h3 = document.createElement('h3');
    h3.className = 'header-title'
    h3.innerHTML = 'Select Entity to Match';
    document.getElementById('list-cnt').appendChild(h3);
    document.getElementById('list-cnt').appendChild(ulG);

    let compute = document.createElement('button');
    compute.className = "btn btn-primary";
    compute.innerHTML = "Compute"
    compute.id = "compute-data"
    document.getElementById('list-cnt').appendChild(compute);
    document.getElementById('compute-data').addEventListener('click', function (event) {
        document.getElementById('table-container').innerHTML = '';
     let selected_Entity = [];
     let select_box = document.getElementsByClassName('custom-select');
        for(let j=0;j<select_box.length;j++) {
            if(select_box[j].selectedIndex > 0) {
                let tmp = {};
                tmp['gst_label'] = select_box[j].parentElement.getAttribute('data-label')
                tmp['books_label'] = select_box[j].value;
                selected_Entity.push(tmp);
            }
        }
        console.log(selected_Entity)
        find_diff(selected_Entity);
    })
}

function find_diff(selected_Entity) {
    let gst_object_decorate = {};
    let books_object_decorate = {};
    let matched = [];
    let inGst = [];
    let inBooks = [];
    for (let i = 0; i < gst_object.length; i++) {
        gst_object_decorate[gst_object[i]['Invoice Number']] = gst_object[i];
    }
    for (let i = 0; i < books_object.length; i++) {
        books_object_decorate[books_object[i]['Invoice Number']] = books_object[i];
    }
    console.log(gst_object_decorate)
    console.log(books_object_decorate)
    for (let key in gst_object_decorate) {
        if (books_object_decorate.hasOwnProperty(key)) {
            matched.push(gst_object_decorate[key])
        }
        else {
            inGst.push(gst_object_decorate[key])
        }
    }
    for (let key in books_object_decorate) {
        if (!gst_object_decorate.hasOwnProperty(key)) {
            inBooks.push(books_object_decorate[key])
        }

    }
    document.getElementById('table-container').appendChild(buildHtmlTable(matched, "Matched"));
    document.getElementById('table-container').appendChild(buildHtmlTable(inGst, "In GST"));
    document.getElementById('table-container').appendChild(buildHtmlTable(inBooks, "In Books"));

}

document.getElementById('compare').addEventListener('click', function (event) {
    document.getElementById('table-container').innerHTML = '';
    find_entity();
})




