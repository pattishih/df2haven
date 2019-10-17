MissionsTable.Filter = {
    _completedFilter:()=>{
        return `<div class="filter filter-checkbox dropdown display-none" data-filter-type="button"><button type="button" class="filter-control btn btn-secondary fa fa-check" data-toggle="dropdown"></button>
        <div class="dropdown-menu">
            <button class="dropdown-item" value="0"><i class="fa fa-square fa-fw"></i> Incomplete</button>        
            <button class="dropdown-item" value="2"><i class="fa fa-check-square fa-fw"></i> Completed</button>
        </div></div>`;
    },
    _visitedFilter:()=>{
        return `<div class="filter filter-checkbox dropdown display-none" data-filter-type="button"><button type="button" class="filter-control btn btn-secondary fa fa-check" data-toggle="dropdown"></button>
        <div class="dropdown-menu">
            <button class="dropdown-item" value="0"><i class="fa fa-square fa-fw"></i> Unvisited</button>
            <button class="dropdown-item" value="1"><i class="fa fa-minus-square fa-fw"></i> Visited</button>
            <button class="dropdown-item" value="2"><i class="fa fa-check-square fa-fw"></i> Turned in</button>
        </div></div>`;
    },
    _textinputFilter:()=>{
        return '<div class="filter filter-text display-none" data-filter-type="input"><input class="filter-control form-control" type="text"></div>';
    },
    _buildingDatalistFilter:()=>{
        let html = '<div class="filter filter-text display-none" data-filter-type="input"><input type="text" class="filter-control form-control" list="buildings"><datalist id="buildings"><option></option>',
            allBuildings = [];

        for (let city in MissionsTable.cities) {
            allBuildings = allBuildings.concat(MissionsTable.cities[city]);
        }
        // get unique and sort
        let uniqBuildings = [...new Set(allBuildings)].sort();
        uniqBuildings[0] = 'Outside'; //reassign this to get rid of parentheses - "(Outside)"
        
        for (let bdg=0, numBuildings=uniqBuildings.length; bdg < numBuildings; bdg++) {
            html += "<option value='" + uniqBuildings[bdg].replace("'","&#39;") + "'>";
        }
        return html + '</datalist></div>';
    },
    _citySelectFilter:()=>{
        let html = '<div class="filter display-none" data-filter-type="select"><select class="filter-control form-control"><option></option>';
        for (let city in MissionsTable.cities) {
            html += "<option>" + city + "</option>";
        }
        return html + "</select></div>";
    },
    _missionTypeSelectFilter:()=>{
        let html = '<div class="filter display-none" data-filter-type="select"><select class="filter-control form-control"><option></option>';
        html += '<option>Blood Samples</option>';
        html += '<option>Bring Item</option>';
        html += '<option>Exterminate</option>';
        html += '<option>Find Item</option>';
        html += '<option>Find Person</option>';
        return html + "</select></div>";
    },
    _rewardNumFilter: ()=>{
        let html = `<div class="filter filter-number filter-group input-group display-none" data-filter-type="combo">
            <div class="input-group-prepend">
                <button type="button" class="filter-control btn btn-secondary fa dropdown-toggle" data-toggle="dropdown"></button>
                <div class="dropdown-menu">
                    <button class="dropdown-item" value="1"><i class="fa fa-angle-right fa-fw"></i> Greater than</button>
                    <button class="dropdown-item" value="-1"><i class="fa fa-angle-left fa-fw"></i> Less than</button>
                </div>
            </div>
            <input type="text" class="filter-control form-control">
        </div>`;
        return html;
    },
    _eraseFilters: ()=> {
        return '<div class="filter display-none">'+
        '<button id="erase_filters" title="Clear All Filters" type="button" class="filter-control btn btn-secondary fa fa-eraser"></button>'+
        '</div>';
    },
    getColumnHeaderMap: function() {
        let $filterCols = $("th[data-field]"), columnHeaderMap = {};

        for (let c=$filterCols.length; c--;) {
            columnHeaderMap[$filterCols[c].getAttribute("data-field")] = c;
        }
        this.columnHeaderMap = columnHeaderMap;
    },
    createFilters: function() {
        let $filterCols = $("th[data-field]"),
            col, columnHeaderMap = {}, colname;

        for (let c=$filterCols.length; c--;) {
            col = $filterCols[c];
            colname = col.getAttribute("data-field");
            columnHeaderMap[colname] = c;
            switch (colname) {
                case 'mission_completed':
                    col.children[1].innerHTML = this._completedFilter();
                    break;
                case 'origin_visited':
                    col.children[1].innerHTML = this._visitedFilter();
                    break;
                case 'mission_building':
                case 'origin_building':
                    col.children[1].innerHTML = this._buildingDatalistFilter();
                    break;
                case 'mission_type':
                    col.children[1].innerHTML = this._missionTypeSelectFilter();
                    break;
                case 'mission_details':
                    col.children[1].innerHTML = this._textinputFilter();
                    break;
                case 'mission_city':
                case 'origin_city':
                    col.children[1].innerHTML = this._citySelectFilter();
                    break;
                case 'reward_cash':                    
                case 'reward_exp':
                    col.children[1].innerHTML = this._rewardNumFilter();
                    break;
                case '0':
                    col.children[1].innerHTML = this._eraseFilters();
                    break;
                default:
                    col.children[1].innerHTML = '<div class="filter display-none"><div class="form-control-sm"></div></div>';
            }
        }
        this.columnHeaderMap = columnHeaderMap;
    },
    saveFilters: function() {
        let filters = {};
        for (let colname in this.columnHeaderMap) {
            switch (colname) {
                case 'mission_completed':
                case 'origin_visited':
                case 'mission_building':
                case 'origin_building':
                case 'mission_type':
                case 'mission_details':
                case 'mission_city':
                case 'origin_city':
                    filters[colname] = $("th[data-field='"+colname+"'] .filter-control").val();
                    break;
                case 'reward_cash':                    
                case 'reward_exp':
                    filters[colname] = {
                        dir: $("th[data-field='"+colname+"'] button.filter-control").val(),
                        val: $("th[data-field='"+colname+"'] input.filter-control").val()
                    };
                    break;
            }
        }
        sessionStorage.filters = JSON.stringify(filters);
    },
    setFilters: function(obs) {
        if (sessionStorage.filters && sessionStorage.filters !== "undefined") {
            let filters = JSON.parse(sessionStorage.filters);
            for (let colname in filters) {
                switch (colname) {
                    case 'mission_completed':
                    case 'origin_visited':
                        $("th[data-field='"+colname+"'] button.filter-control").val(filters[colname]).change();
                        $("th[data-field='"+colname+"'] .filter-checkbox").find(".dropdown-item[value='" + filters[colname] + "']").addClass("active");
                        break;
                    case 'mission_building':
                    case 'origin_building':
                    case 'mission_details':
                        $("th[data-field='"+colname+"'] .filter-control").val(filters[colname]).trigger("input");
                        break;             
                    case 'mission_type':           
                    case 'mission_city':
                    case 'origin_city':
                        $("th[data-field='"+colname+"'] .filter-control").val(filters[colname]).change();
                        break;
                    case 'reward_cash':                    
                    case 'reward_exp':
                        //$("th[data-field='"+colname+"'] .dropdown-item[value='"+filters[colname].dir+"']").click();
                        $("th[data-field='"+colname+"'] button.filter-control").val(filters[colname].dir).change();
                        $("th[data-field='"+colname+"'] input.filter-control").val(filters[colname].val).trigger("input");
                        break;
                }      
            }      
        }
        if (obs) this.observeTableChanges();
    },
    applyFiltersCardView: function() {
        if (sessionStorage.filtered && sessionStorage.filtered != "undefined") {
            let filtered = sessionStorage.filtered.split(',');
            for (let id = filtered.length; id--;) {
                document.getElementById(filtered[id]).classList.add("filtered-");
            }
        }
    },
    saveFiltered: function() {
        let $filteredRows = $("[class*='filtered-']"),
            filtered = [];
        for (let rows = $filteredRows.length; rows--;) {
            filtered.push($filteredRows[rows].id);
        }
        if (filtered.length > 0) sessionStorage.filtered = filtered.join(',');
        else delete sessionStorage.filtered;
    },
    showFilterTools: function() {
        if (sessionStorage.filterToggle == "true") {
            $("#filter_missions").addClass("active");
            $(".filter").removeClass("display-none");
        } else if ($("tr[class*='filtered-']").length>0) {
            $("#filter_missions").addClass("has-filters");
        } else {
            $("#filter_missions").removeClass("has-filters");
        }
    },
    toggleFilters: ()=> {
        $("#filter_missions").toggleClass("active");
        $(".filter").toggleClass("display-none");
        sessionStorage.filterToggle = document.getElementById("filter_missions").classList.contains("active");
        if ($("tr[class*='filtered-']").length>0) {
            $("#filter_missions").addClass("has-filters");
        } else {
            $("#filter_missions").removeClass("has-filters");
        }        
    },
    clearFilters: function() {
        let filters = {};
        for (let colname in this.columnHeaderMap) {
            switch (colname) {
                case 'reward_cash':                    
                case 'reward_exp':
                    filters[colname] = {dir: '', val: ''};
                    break;
                default:
                    filters[colname] = '';
            }            
        }
        sessionStorage.filters = JSON.stringify(filters);
        this.setFilters();
    },
    negCompareClasses: function(cell, targetVal) {
        if (targetVal == "") return false;
        else if (cell) return !~cell.innerText.toUpperCase().indexOf(targetVal.toUpperCase());
        else return false;
    },
    negCompareCheckboxes: function(cell, targetVal) {
        targetVal = parseInt(targetVal); //change to int so that it can be boolean-ized
        if (cell) {
            switch (targetVal) {
                case 1:
                    return !(cell.indeterminate && !cell.checked); //neg compare-->don't filter out if conditions match
                case 0:
                case 2:
                    return (cell.indeterminate == true || cell.checked == !targetVal); //filter out if opposite of target
                default:
                    return false;
            }
        }
    },
    negCompareNumber: function(cell, targetDir, targetVal) {
        if (targetVal == "") {
            return false;
        } else if (cell) {
            targetVal = parseInt(targetVal);
            cellVal = parseInt(cell.textContent);
            
            switch (targetDir) {//note that we are looking for rows to filter out, so we match for what we don't want to keep
                case "-1":
                    if (isNaN(cellVal)) return false;
                    else return cellVal > targetVal;
                case "":
                    return false; //cellVal != targetVal;
                case "1":
                    if (isNaN(cellVal)) return true;
                    else return cellVal < targetVal;
            }
        } else {
            return false;
        }
    },
    filterRows: function(that, filterType){
        let val = that.value,
        $rows = $("#missions_table tbody>tr"),
        numRows = $rows.length,
        filterOut, dir;

        if (numRows > 0) {
            let colname = that.closest("th").getAttribute("data-field"),
            numCols = $rows[0].children.length,
            targetCol = this.columnHeaderMap[colname];
            
            for (let r = numRows; r--;) {
                let classes = $rows[r].classList;
                //if (!classes.contains("hide") && 
                    //(classes.contains("filtered-" + colname) || !~classes.value.indexOf("filtered-"))) {  
                    switch (filterType) {
                        case "text":
                            filterOut = this.negCompareClasses($rows[r].children[targetCol], val);
                            break;
                        case "check":
                            if ($rows[r].children[targetCol]) {
                                filterOut = this.negCompareCheckboxes($rows[r].children[targetCol].children[0], val);
                            }
                            break;
                        case "num":
                            dir = this.getButtonNodeFromNearby(that).value;
                            filterOut = this.negCompareNumber($rows[r].children[targetCol], dir, val);
                            break;
                    }

                    if (filterOut) {
                        $rows[r].classList.add("filtered-" + colname);
                    } else {
                        $rows[r].classList.remove("filtered-" + colname);
                    }                 
                //}
            }
        }
        this.saveFilters();
        this.saveFiltered();
        MissionsTable.insertRewardSummaries();
    },
    getButtonNodeFromNearby: function(nearbyNode) {
        return nearbyNode.closest("div.filter").querySelector("button.filter-control");
    },
    getNumInputNodeFromNearby: function(nearbyNode) {
        return nearbyNode.closest("div.filter").querySelector("input.filter-control");
    },
    activateFilterToggleBtn: function(){
        $("#filter_missions").on("click", this.toggleFilters);
    },
    changeButtonIcon: function(node, addThisClass){
        node.className = "filter-control btn btn-secondary fa";
        node.classList.add(addThisClass);
    },
    activateFilterListeners: function(){
        $(".filter-text")
            .off("input", "input.filter-control")
            .on("input", "input.filter-control", (evt)=>{this.filterRows(evt.currentTarget, "text")});

        $("select.filter-control")
            .off("change")
            .on("change", (evt)=>{this.filterRows(evt.currentTarget, "text")});
        
        $(".filter-checkbox button.filter-control")
            .off("change")
            .on("change", (evt)=>{
                let that = evt.currentTarget, chgIcon,
                val = that.value;

                switch (val) {
                    case "0":
                        chgIcon = "fa-square";
                        break;
                    case "1":
                        chgIcon = "fa-minus-square";
                        break;
                    case "2":
                        chgIcon = "fa-check-square";
                        break;
                    default:
                        chgIcon = "fa-check";
                }
                this.changeButtonIcon(that, chgIcon);
                this.filterRows(that, "check")
            });

        $(".filter-checkbox")
            .off("click", ".dropdown-item")
            .on("click", ".dropdown-item", (evt)=>{
                let that = evt.currentTarget,
                val = that.value, prevSel, dropdownBtnNode;

                if (that.classList.contains("active")) {
                    that.classList.remove("active");
                    val = "";
                } else {
                    prevSel = that.parentNode.querySelector(".active");
                    if (prevSel) prevSel.classList.remove("active");
                    that.classList.add("active");
                }
                dropdownBtnNode = this.getButtonNodeFromNearby(that);
                $(dropdownBtnNode).val(val).change();
            });

        $(".filter-number button.filter-control")
            .off("change")
            .on("change", (evt)=>{
                let that = evt.currentTarget, chgIcon,
                val = that.value;

                switch (val) {
                    case "-1":
                        chgIcon = "fa-angle-left";
                        break;
                    case "":
                        chgIcon = "dropdown-toggle";
                        break;
                    case "1":
                        chgIcon = "fa-angle-right";
                        break;
                }
                this.changeButtonIcon(that, chgIcon);
                this.filterRows(this.getNumInputNodeFromNearby(that), "num");
            });        

        $(".filter-number")
            .off("click", ".dropdown-item")
            .on("click", ".dropdown-item", (evt)=>{ 
                let that = evt.currentTarget,
                val = that.value, prevSel, 
                dropdownBtnNode = this.getButtonNodeFromNearby(that);

                if (dropdownBtnNode) dropdownBtnNode.style.border = "";
                
                if (that.classList.contains("active")) {
                    that.classList.remove("active");
                    val = "";
                } else {
                    prevSel = that.parentNode.querySelector(".active");
                    if (prevSel) prevSel.classList.remove("active");
                    that.classList.add("active");
                }
                
                $(dropdownBtnNode).val(val).change();
            });           

        $(".filter-number")
            .off("input", "input.filter-control")
            .on("input", "input.filter-control", (evt)=>{
                let dropdownToggleEl = evt.currentTarget.parentNode.querySelector(".dropdown-toggle");
                if (dropdownToggleEl) {
                    if (evt.currentTarget.value.length)
                        dropdownToggleEl.style.border = "1px solid orange";
                    else 
                        dropdownToggleEl.style.border = "";
                } else {
                    this.filterRows(evt.currentTarget, "num")
                }
            });    
        
        $("#erase_filters")
            .off("click")
            .on("click", ()=>{this.clearFilters()});
    },
    observeTableChanges: function() {
        let changeCallback = (mutations, observer)=>{
            observer.disconnect(); //disconnect for when we change table elements... reconnect later.
            //if ($("div.filter").length === 0) {
                //this.createFilters();
                //this.activateFilterListeners();
                //this.showFilterTools();
                //MissionsTable.Help.abbrev();
            //}
            this.setFilters(observer);
            //console.log('Dom Changed');
        }
        // create an observer instance
        let observer = new MutationObserver(changeCallback);
                
        // pass in the currentTarget node, as well as the observer options
        observer.observe(document.querySelector("#missions_table>tbody"), 
            { attributes: true, childList: true, characterData: false, subtree: false, attributeFilter: ["id", "colspan"] });
    },    
    init: function() {//note: these functions are order-sensitive
        this.createFilters();
        this.activateFilterListeners();
        this.setFilters();
        this.showFilterTools();        
        //this.observeTableChanges();

        /*$(".fa-align-left").on("click", (evt)=>{
            let that = evt.currentTarget;
            if (that.classList.contains("active"))
                this.applyFiltersCardView();
        });*/        
        
    }
};