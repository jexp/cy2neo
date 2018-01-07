var relationshipIRI="";
var currentUserDetails={};
var allUserData = [];
var gridOptions ={};
$(document).ready(function() {

/*LENA*/					
	$("#btnSubmit").click(function (event) {

        event.preventDefault();
        $("#btnSubmit").prop("disabled", true);
        var form = $('#fileUploadForm')[0];

        var data = new FormData(form);

		      // disabled the submit button
        //$("#btnSubmit").prop("disabled", true);
        console.log(apiServer+"/DIOntoManager/api/ontology/calcdiff");
        $.ajax({
            type: "POST",
            enctype: 'multipart/form-data',
            url: apiServer+"/DIOntoManager/api/ontology/calcdiff",
            data: data,
            processData: false,
            contentType: false,
            cache: false,
            timeout: 600000,

            success: function (data) {

                console.log(data);

                if(data!=null){

                  if(data[0] == "status0") {
                    //if(index == 0) {
                      $("#recordsnum").html("No conflicts found. You can proceed with merge.");
                      $("#btnMerge").prop("disabled", false);
                    //}
                  } else if(data[0] == "status1") {
                      $("#recordsnum").html("Nothing to merge.");
                      $("#btnMerge").prop("disabled", true);
                  }
                  else {
                    $("#difftable").find("tr:gt(0)").remove();
                    var table1 = $("#difftable");
                    index = 0;
                    $.each(data, function(key,value) {

                        var valbsve = value['bsve'];
                        var valdoid = value['doid'];
                        addRow(valbsve, valdoid, index++);
                   });
                   $("#btnMerge").prop("disabled", false);
                 }

                }

                console.log("SUCCESS : ", data);
              //  $("#btnSubmit").prop("disabled", false);

            },

            error: function (e) {

                console.log("ERROR : ", e);
                //$("#btnSubmit").prop("disabled", false);

            }
        });
        $("#btnSubmit").prop("disabled", false);

    });

    $("#btnMerge").click(function(event){

        $("#btnMerge").prop("disabled", true);
        var len = $('#difftable tr').length - 1;
        var values;
        if(len > 0) {
            values = new Array(len);
            for (i = 0; i < len; i++) {
                values[i] = new Array(3);
                var valbsve = document.getElementById("tdbsve"+i);
                if(valbsve != null) valbsve = document.getElementById("tdbsve"+i).innerHTML;
                else valbsve = "";
                var valdoid = document.getElementById("tddoid"+i);
                if(valdoid != null) valdoid = document.getElementById("tddoid"+i).innerHTML;
                else valdoid = "";
                values[i][0] = valbsve;//document.getElementById("tdbsve"+i).innerHTML;
                values[i][1] = valdoid;//document.getElementById("tddoid"+i).innerHTML;
                values[i][2] = document.getElementById("selid"+i).value;
            }
        }
        else {
            values = new Array(1);
            values[0] = new Array(3);
            values[0][0] = 0;
            values[0][1] = 0;
            values[0][2] = 0;
        }

        $.ajax({
            type: 'POST',
            url: apiServer+'/DIOntoManager/api/ontology/merge',
            data: {values:values},
            success: function(data){
                if(data!=null){
                    console.log("SUCCESS : ", data);
                    ///var statusm = $message;
                    $("#mergestatus").html(data);
				    $("#merge_magic").toggle();
				    $("#ontodisplay").toggle();


                }
            },
            error: function (e) {
                console.log("ERROR : ", e);
            }
        })
        $("#btnMerge").prop("disabled", false);
	});
					
					
/*LENA*/					
    document.getElementById("term").value=getParameterByName("term");
    $("input[id=neo4jUrl]").val(apiServer + "/DIOntoManager");
    makeCy();
    $(".secondaryNode").hide();
    $("#nodeTypeSelection").hide();
    $(".relationshipControl").hide();
    $("#savenode").hide();
    $("#savenewnode").hide();
    $("#deletenodebtn").hide();
    $("#mngreltnsbtn").hide();
    $(".auditTrail").hide();
    hideUserSettings();


    $.ajax({
        url: apiServer+'/DIOntoManager/api/user/authenticate',
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
        success: function(data){

            console.log(data);
            currentUserDetails=data;
            $('#diAPILoginForm').hide();
            $('.relationshipControl').hide();
            $('#authStatus').html("Welcome " + currentUserDetails.User + " (<span onClick=\"logout()\" id=\"logout\">logout</span>)");
            $('#authStatus').show();
            if (currentUserDetails.viewnode_authorized){
                getValidNodeProperties();

                $(".ontomanage").show();
                $(".ontodisplay").width("65%");
                if (!currentUserDetails.modifynode_authorized){
                    changeToViewerUserUI();
                }
                else {
                    changeToModifierUserUI();
                    if (currentUserDetails.auditReplayRequired){
                        alert ("An update to the underlying BSVE ontology has been detected.\nPlease apply the Audit trail to bring the graph database up to date");
                    }
                    else if (currentUserDetails.doidUpdateAvailable) {
                        alert ("A DOID update has been detected and downloaded.\nPlease merge with BSVE and apply the audit trail");
                    } 
                }

            }
            else {
                $(".ontomanage").hide();
                $(".ontodisplay").width("100%");
            }
        },
        error: function(){
            $(".ontomanage").hide();
            $(".ontodisplay").width("100%");
            changeToUnAuthenticatedDisplay()
        }
    });

    var columnDefinitions = [
        {
            headerName: "Date",
            field: "date",
            editable: false,
            filter: 'date',
            minWidth: 110,
            width:110,
            filterParams:{
                comparator:function (filterLocalDateAtMidnight, cellValue){
                    var dateAsString = cellValue;
                    var dateParts  = dateAsString.split("-");
                    var cellDate = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));

                    if (filterLocalDateAtMidnight.getTime() == cellDate.getTime()) {
                        return 0
                    }

                    if (cellDate < filterLocalDateAtMidnight) {
                        return -1;
                    }

                    if (cellDate > filterLocalDateAtMidnight) {
                        return 1;
                    }
                }
            },
            suppressToolPanel: true,
            menuTabs:['filterMenuTab']
        },
        {
            headerName: "Cypher Query",
            field: "cypherquery",
            editable: false,
            filter: 'text',
            suppressToolPanel: true,
            minWidth: 200,
            width: 374,
            cellStyle: {'white-space': 'normal'},
            menuTabs:['filterMenuTab']
        },
        {
            headerName: "User", field: "user", editable: false, filter: 'text', minWidth: 70, width: 70, suppressToolPanel: true, menuTabs:['filterMenuTab']
        },
    ];
    
    gridOptions = {
        enableSorting: true,
        pagination: true,
        enableFilter: true,
        enableColResize: true,
        getRowHeight: function(params) {
            return 18 * (Math.floor(params.data.cypherquery.length / 24) + 1);
        },
        
        rowData: allUserData,
        columnDefs: columnDefinitions,
    }; 
    
    var gridDiv = $('#audittrailgrid')[0];
    new agGrid.Grid(gridDiv, gridOptions);
    
    gridOptions.api.addEventListener("gridSizeChanged", auditTrailGridSizeChangedHandler);

    var config = {}
    var connection = function() { return {url:$("#neo4jUrl").val(), user:$("#neo4jUser").val(),pass:$("#neo4jPass").val()}; }
    new Cy2NeoD3(config,"graph","datatable","cypher","execute", connection , true, false);
});

function checkIfUserTimedOut(messageIfNot){
    $.ajax({
        url: apiServer+'/DIOntoManager/api/user/authenticate',
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
        success: function(data){

            alert(messageIfNot);
        },
        error: function(){
            $(".ontomanage").hide();
            $(".ontodisplay").width("100%");
            changeToUnAuthenticatedDisplay();
            alert("Your session has timed out, please relog in to continue");
        }
    });

}

function auditTrailGridSizeChangedHandler(){
    gridOptions.api.sizeColumnsToFit();
}

function changeToUnAuthenticatedDisplay(){
    $(".nodeControls").hide();
    $(".relationshipControl").hide();
    $("#authenticatedSearchOptions").hide();
}

function changeToViewerUserUI(){
    $(".nodeControls").hide();
    $("#savenode").hide();
    $("#deletenodebtn").hide();
    $("#mngreltnsbtn").hide();
    $(".relationshipControl").hide();
    $("#authenticatedSearchOptions").show();
    $("#primaryNodeProperties").jsGrid({
        width: "100%",
        height: "100%",

        inserting: false,
        editing: false,
        sorting: false,
        paging: false,

        data: [],
        fields: [
            { name: "Property", type: "select", items:validNodeProperties, valueField:"Name", textField:"Name" },
            { name: "Value", type: "text" },
            { type: "control", width: 50 }
        ]
    });

    $("#secondaryNodeProperties").jsGrid({
        width: "100%",
        height: "100%",
        inserting: false,
        editing: false,
        sorting: false,
        paging: false,

        data: [],
        fields: [
            { name: "Property", type: "select", items:validNodeProperties, valueField:"Name", textField:"Name" },
            { name: "Value", type: "text" },
            { type: "control", width: 50 }
        ]
    });
    
    $("#primaryNodeProperties").jsGrid("refresh");
    $("#secondaryNodeProperties").jsGrid("refresh");
    $(".secondaryNode").hide()
}

function changeToModifierUserUI(){
    $(".nodeControls").show();
    $("#authenticatedSearchOptions").show();
}

function initManageRelationshipControls(){
    $("#relationshipDropdown").width("100%");
    $(".secondaryNode").show();
    $(".primaryNode").show();

    $("#relationshipDropdown").select2({
		    tags: true,
		    ajax: {
  		    url: apiServer+'/DIOntoManager/api/neo4j/relationship/find',
  		    type: 'GET',
  		    dataType: 'json',
  		    xhrFields: {
    		  withCredentials: true
  		    },
  		    data: function (params) {
  			   console.log(params);
  			   var query = {
    	           relationshipName: params.term,
  			   }
               return query;
            },
  		    processResults: function(data, params){
  			   return {
  				  results: data
  			   }
  		    }
        }
    });
    // $('#relationshipDropdown').select2().val(selectedRelationshipId).trigger('change.select2');
    $(".relationshipControl").show();
}

function getValidNodeProperties(){
    $.ajax({
        url: apiServer+'/DIOntoManager/api/neo4j/node/properties/getall',
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
        success: function(data){
            validNodeProperties=JSON.parse(data);
        },

        error: function(err) {
            checkIfUserTimedOut(err.status);
            
        }
    });
}

function logout(){
    $.ajax({
        url: apiServer+'/DIOntoManager/api/user/logout',
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
        success: function(data){
            alert(data);
            $('#authStatus').hide();
            $('#diAPILoginForm').show();
            $(".ontomanage").hide();
            $(".ontodisplay").width("100%");
            changeToUnAuthenticatedDisplay();
        },

        error: function(err) {
            alert (err.status);
            $(".ontomanage").hide();
            $(".ontodisplay").width("100%");
            changeToUnAuthenticatedDisplay();
        }
    });
};

function displayCreateRelationshipControls(){
    closeAuditTrailBtnPressed();
    if($("#savenode").is(":visible")){
        initManageRelationshipControls();
        $(".secondaryNode").show();
        $("#createrelationship").show();
        $("#modifyrelationship").hide();
        $("#deleterelationship").hide();
        $("#savenode").hide();
        $("#deletenodebtn").hide();
        $("#mngreltnsbtn").hide();
        $(".primaryNode").height('40%');
        $(".secondaryNode").height('40%');
    }
    else {
	  alert("Please select a subject node for the relationship");
   }
}

function applyAuditTrailBtnPressed(){
    $.ajax({
        url: apiServer+'/DIOntoManager/api/neo4j/audittrail/apply',
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
        success: function(data){
            alert(data);
            //alert(JSON.stringify(JSON.parse(data), null, 4));
        },

        error: function(err) {
            checkIfUserTimedOut(err.status);
            
        }
    });
}

function hideUserSettings(){
    $(".usersettings").hide();
}

function downloadAuditTrailBtnPressed(){
    window.open(apiServer+'/DIOntoManager/api/neo4j/audittraillog/download');
    
}

function saveNode(){
    var primaryNodeProperties = $("#primaryNodeProperties").jsGrid("option", "data");
    var requestBodyString="";
    for (var i=0; i<primaryNodeProperties.length; i++){
        var primaryNodeProperty = primaryNodeProperties[i];
        for (var key in primaryNodeProperty){
            if (key==="Property"){
                requestBodyString=requestBodyString+primaryNodeProperty[key]+"=";
            }
            else {
                requestBodyString=requestBodyString+primaryNodeProperty[key]+"&";
            }
        }
    }
    requestBodyString=requestBodyString+"iri="+$("#primaryiriannunciator").html().substring(15)+"&";
    requestBodyString=requestBodyString+"nodetype="+$('#nodeTypeSelectionDropdown option:selected').text();
    $.ajax({
        url: apiServer+'/DIOntoManager/api/neo4j/node/modify',
        type: 'POST',
        data: requestBodyString,
        xhrFields: {
            withCredentials: true
        },
        success: function(data){
            alert(data);
            var config = {}
            var connection = function() { return {url:$("#neo4jUrl").val(), user:$("#neo4jUser").val(),pass:$("#neo4jPass").val()}; }
            new Cy2NeoD3(config,"graph","datatable","cypher","execute", connection , true, false);
        },
        error: function(xhr, status, error){
            checkIfUserTimedOut(err.status);
            //alert(xhr.statusText);
            //console.log(xhr.statusText);
            //var err =JSON.parse(xhr.responseText);
            //alert(err.Message);
        }
    })
    console.log(requestBodyString);
}

function saveNewNode(){
    var primaryNodeProperties = $("#primaryNodeProperties").jsGrid("option", "data");
    var requestBodyString="";
    console.log(primaryNodeProperties);
    for (var i=0; i<primaryNodeProperties.length; i++){
        var primaryNodeProperty = primaryNodeProperties[i];
        for (var key in primaryNodeProperty){
            if (key==="Property"){
                requestBodyString=requestBodyString+primaryNodeProperty[key]+"=";
            }
            else {
                requestBodyString=requestBodyString+primaryNodeProperty[key]+"&";
            }
        }
    }
    requestBodyString=requestBodyString+"nodetype="+$('#nodeTypeSelectionDropdown option:selected').text();
    //requestBodyString=requestBodyString;
    console.log("Request body is " + requestBodyString);
    if (requestBodyString.trim()!==""){
        $.ajax({
            url: apiServer+'/DIOntoManager/api/neo4j/node/create',
            type: 'POST',
            data: requestBodyString,
            xhrFields: {
                withCredentials: true
            },
            success: function(data){
                alert(data);
                console.log(data);
                var config = {}
                var connection = function() { return {url:$("#neo4jUrl").val(), user:$("#neo4jUser").val(),pass:$("#neo4jPass").val()}; }
                new Cy2NeoD3(config,"graph","datatable","cypher","execute", connection , true, false);
                console.log("Create node query is " + requestBodyString);
            },
            error: function(xhr, status, error){
                checkIfUserTimedOut(error.status);
                //alert(xhr.statusText);
                //console.log(xhr.statusText + xhr.status);
                //var err =JSON.parse(xhr.responseText);
                //alert(err.Message);
            }
        })
    }
    else {
        alert("All created nodes must have a \"label\" parameter")
    }

}

function initializeCreateNodeControls(){
    $("#savenode").hide();
    $("#nodeTypeSelection").show();
   
    $("#nodeTypeSelectionDropdown").select2({
        tags: true,
        ajax: {
            url: apiServer+'/DIOntoManager/api/neo4j/node/types/get',
            type: 'GET',
            dataType: 'json',
            xhrFields: {
              withCredentials: true
            },
            data: function (params) {
               console.log(params);
               var query = {
                   typeName: params.term,
               }
               return query;
            },
            processResults: function(data, params){
                
               return {
                  results: data
               }
            }
        }
    });
    $("#deletenodebtn").hide();
    $("#mngreltnsbtn").hide();
    $("#savenewnode").show();
    $(".secondaryNode").hide();
    $(".relationshipControl").hide();
    $("#primaryiriannunciator").html("");
    $("#primaryNodeProperties").jsGrid("refresh");
    $(".primaryNode").show();
}

function showUserSettingsBtnPressed(){
   // $(".ontomanage").hide();
    $(".relationshipVisibilitySettings").html("Loading settings...");
    $(".usersettingsbtns").hide();
    $(".usersettings").show();

    $.ajax({
        url: apiServer+'/DIOntoManager/api/neo4j/settings/get',
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
        success: function(data){
            var userOptions = JSON.parse(data);
            console.log(userOptions);
            var userSettingsHTML = '<h4>Show Relationships</h4>';
            for (var i=0; i<userOptions.length; i++){
                var checked = "";
                if (userOptions[i].visible){
                    checked = " checked";
                }
                
                userSettingsHTML = userSettingsHTML + '<input type="checkbox" name="'+userOptions[i].relationship +'" value="'+userOptions[i].relationship +'"' + checked +'> &nbsp;' +userOptions[i].relationship + ' <br>';
                //$(".usersettings").html('<input type="checkbox" name="'+userOptions[i].relationship +'" value="'+userOptions[i].relationship +' ' + checked +'">' +userOptions[i].relationship + ' <br>');
            }
            console.log(userSettingsHTML + '</form>');
            $(".relationshipVisibilitySettings").html(userSettingsHTML);
             $(".usersettingsbtns").show();
            //console.log("Create node query is " + requestBodyString);
                    //$("#secondaryiriannunciator").html("");
        },
        error: function(xhr, status, error){
            checkIfUserTimedOut(error.status);
            //alert(xhr.statusText);
            //console.log(xhr.statusText + xhr.status);
            //var err =JSON.parse(xhr.responseText);
            //alert(err.Message);
        }
    })
}

function saveUserSettingsBtnPressed(){
    var visibibleRelationships = "";
    $(".relationshipVisibilitySettings :input").each(function (index, data){
        console.log(data);
        if(data['checked']){
            visibibleRelationships =visibibleRelationships + '`'+data.value + '`' + "|";
        }
    })

    $.ajax({
        url: apiServer+'/DIOntoManager/api/neo4j/settings/save',
        type: 'POST',
        data: 'visibleRelationships='+visibibleRelationships+"&",
        xhrFields: {
            withCredentials: true
        },
        success: function(data){
           alert(data);
            //console.log("Create node query is " + requestBodyString);
                    //$("#secondaryiriannunciator").html("");
        },
        error: function(xhr, status, error){
            checkIfUserTimedOut(error.status);
            //alert(xhr.statusText);
            //console.log(xhr.statusText + xhr.status);
            //var err =JSON.parse(xhr.responseText);
            //alert(err.Message);
        }
    });
}

function showAuditTrailBtnPressed(){
    $(".primaryNode").hide();
    $("#cancelnewrelations").click();
    hideUserSettings();
    
    $(".auditTrail").show();
    $.ajax({
        url: apiServer+'/DIOntoManager/api/neo4j/audittrail/view',
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
        success: function(data){
            gridOptions.api.setRowData(JSON.parse(data));
            //console.log("Create node query is " + requestBodyString);
                    //$("#secondaryiriannunciator").html("");
        },
        error: function(xhr, status, error){
            checkIfUserTimedOut(error.status);
            //alert(xhr.statusText);
            //console.log(xhr.statusText + xhr.status);
            //var err =JSON.parse(xhr.responseText);
            //alert(err.Message);
        }
    });
}

function closeAuditTrailBtnPressed(){
    $(".auditTrail").hide();
}

function deleteNodeBtnPressed(){
    closeAuditTrailBtnPressed();
    if($("#savenode").is(":visible")){
        if (confirm("Please confirm deletion of " + $("#primaryiriannunciator").html().substring(15)) == true) {
            //alert ("we will delete " + $("#primaryiriannunciator").html().substring(15));
            var requestBodyString="nodeIRI="+$("#primaryiriannunciator").html().substring(15)+"&";
 
            $.ajax({
                url: apiServer+'/DIOntoManager/api/neo4j/node/delete',
                type: 'POST',
                data: requestBodyString,
                xhrFields: {
                    withCredentials: true
                },
                success: function(data){
                    alert(JSON.stringify(data));
                    var config = {};
                    var connection = function() { return {url:$("#neo4jUrl").val(), user:$("#neo4jUser").val(),pass:$("#neo4jPass").val()}; }
                    new Cy2NeoD3(config,"graph","datatable","cypher","execute", connection , true, false);
                    //console.log("Create node query is " + requestBodyString);
                    //$("#secondaryiriannunciator").html("");
                },
                error: function(xhr, status, error){
                    checkIfUserTimedOut(error.status);
      		        //alert(xhr.statusText);
                    //console.log(xhr.statusText + xhr.status);
                    //var err =JSON.parse(xhr.responseText);
                    //alert(err.Message);
                }
            });
        }
        else {
            alert("Cancelled Deletion");
        }
    }
    else{
		    alert("Please select a node to delete");
    }
}

function createNodeBtnPressed(){
    initializeCreateNodeControls();
    closeAuditTrailBtnPressed();
    hideUserSettings();
    
    $("#primaryNodeProperties").jsGrid({
        width: "100%",
        height: "100%",

        inserting: true,
        editing: true,
        sorting: false,
        paging: false,

        data: [],
        fields: [
            { name: "Property", type: "select", items:validNodeProperties, valueField:"Name", textField:"Name" },
            { name: "Value", type: "text" },
            { type: "control", deleteButton: false, width: 50 }
        ]
    });
}

function getlastindex(){
    $.ajax({
        url: apiServer+'/DIOntoManager/api/neo4j/getlastindex',
        xhrFields: {
            withCredentials: true
        },
        success: function(data){
            $("#primaryNodeProperties").jsGrid({
                width: "100%",
                height: "100%",

                inserting: true,
                editing: true,
                sorting: false,
                paging: false,
                data: [],
                fields: [
                    { name: "Property", type: "text" },
                    { name: "Value", type: "text" },
                    { type: "control", width: 50 }
                ]
            });
            $("#savenode").hide();
            $("#deletenodebtn").hide();
            $("#mngreltnsbtn").hide();
            $("#savenewnode").show();
            $(".secondaryNode").hide();
            $(".relationshipControl").hide();
            var lastIRIi=parseInt(data);
            lastIRIi=lastIRIi+1;
            $("#primaryiriannunciator").html("Properties for http://purl.obolibrary.org/obo/BSVE_" +lastIRIi);
            $("#primaryNodeProperties").jsGrid("refresh");
        },
        error: function(xhr, status, error){
            checkIfUserTimedOut(error.status);
            //alert(xhr.statusText);
            //var err =JSON.parse(xhr.responseText);
            //alert(err.Message);
        }
    })

};

$("#deleterelationship").click(function(){
    //alert("cancelling");
    //alert ("an ajax call to create the relationship will be sent to the back end");
    var requestBodyString="subject="+$("#primaryiriannunciator").html().substring(15)+"&";
    requestBodyString=requestBodyString+"object="+$("#secondaryiriannunciator").html().substring(15)+"&";
    requestBodyString=requestBodyString+"relationship="+relationshipIRI;
    $.ajax({
        url: apiServer+'/DIOntoManager/api/neo4j/nodes/relationship/delete',
        type: 'POST',
        data: requestBodyString,
        xhrFields: {
            withCredentials: true
        },
        success: function(data){
            alert(data);
            console.log(data);
            var config = {}
            var connection = function() { return {url:$("#neo4jUrl").val(), user:$("#neo4jUser").val(),pass:$("#neo4jPass").val()}; }
            new Cy2NeoD3(config,"graph","datatable","cypher","execute", connection , true, false);
            $("#cancelnewrelations").click();
            //console.log("Create node query is " + requestBodyString);
            //$("#secondaryiriannunciator").html("");
        },
        error: function(xhr, status, error){
            checkIfUserTimedOut(error.status);
            //alert(xhr.statusText);
            //console.log(xhr.statusText + xhr.status);
            //var err =JSON.parse(xhr.responseText);
            //alert(err.Message);
        }
    });
});

$("#modifyrelationship").click(function(){
    //alert("we will create a relationship of" + $('#relationshipDropdown option:selected').text());
    var requestBodyString="subject="+$("#primaryiriannunciator").html().substring(15)+"&";
    requestBodyString=requestBodyString+"object="+$("#secondaryiriannunciator").html().substring(15)+"&";
    requestBodyString=requestBodyString+"oldrelationship="+relationshipIRI+"&";
    requestBodyString=requestBodyString+"newrelationship="+$('#relationshipDropdown option:selected').text();
    //console.log(requestBodyString);
    $.ajax({
        url: apiServer+'/DIOntoManager/api/neo4j/nodes/relationship/modify',
        type: 'POST',
        data: requestBodyString,
        xhrFields: {
            withCredentials: true
        },
        success: function(data){
            alert(data);
            console.log(data);
            var config = {}
            var connection = function() { return {url:$("#neo4jUrl").val(), user:$("#neo4jUser").val(),pass:$("#neo4jPass").val()}; }
            new Cy2NeoD3(config,"graph","datatable","cypher","execute", connection , true, false);
            $("#cancelnewrelations").click();
            //console.log("Create node query is " + requestBodyString);
       
        },
        error: function(xhr, status, error){
            checkIfUserTimedOut(error.status);
            //alert(xhr.statusText);
            //console.log(xhr.statusText + xhr.status);
            //var err =JSON.parse(xhr.responseText);
            //alert(err.Message);
        }
    });
});

$("#createrelationship").click(function(){
    //alert("cancelling");
    //alert ("an ajax call to create the relationship will be sent to the back end");
    var requestBodyString="subject="+$("#primaryiriannunciator").html().substring(15)+"&";
    requestBodyString=requestBodyString+"object="+$("#secondaryiriannunciator").html().substring(15)+"&";
    requestBodyString=requestBodyString+"relationship="+$('#relationshipDropdown option:selected').text();
    $.ajax({
        url: apiServer+'/DIOntoManager/api/neo4j/nodes/relationship/create',
        type: 'POST',
        data: requestBodyString,
        xhrFields: {
            withCredentials: true
        },
        success: function(data){
            alert(data);
            console.log(data);
            var config = {}
            var connection = function() { return {url:$("#neo4jUrl").val(), user:$("#neo4jUser").val(),pass:$("#neo4jPass").val()}; }
            new Cy2NeoD3(config,"graph","datatable","cypher","execute", connection , true, false);
            //console.log("Create node query is " + requestBodyString);
            //$("#secondaryiriannunciator").html("");
        },
        error: function(xhr, status, error){
            checkIfUserTimedOut(error.status);
            //alert(xhr.statusText);
            //console.log(xhr.statusText + xhr.status);
            //var err =JSON.parse(xhr.responseText);
            //alert(err.Message);
        }
    });

    $("#secondaryNodeProperties").jsGrid({
        width: "100%",
        height: "100%",

        inserting: true,
        editing: true,
        sorting: false,
        paging: false,

        data: [],
        fields: [
            { name: "Property", type: "select", items:validNodeProperties, valueField:"Name", textField:"Name" },
            { name: "Value", type: "text" },
            { type: "control", width: 50 }
        ]
    });
    
    $(".primaryNode").height('100%');
    $(".secondaryNode").hide();
    $(".relationshipControl").hide();
    $("#savenode").show();
    $("#deletenodebtn").show();
    $("#mngreltnsbtn").show();
    $("#secondaryNodeProperties").jsGrid("refresh");
});

$("#cancelnewrelations").click(function(){
    //alert("cancelling");
    $("#secondaryNodeProperties").jsGrid({
        width: "100%",
        height: "100%",

        inserting: true,
        editing: true,
        sorting: false,
        paging: false,

        data: [],
        fields: [
            { name: "Property", type: "select", items:validNodeProperties, valueField:"Name", textField:"Name" },
            { name: "Value", type: "text" },
            { type: "control", width: 50 }
        ]
    });
    $(".primaryNode").height('100%');
    $(".secondaryNode").hide();
    $(".relationshipControl").hide();
    if(currentUserDetails.modifynode_authorized){
        $("#savenode").show();
        $("#deletenodebtn").show();
        $("#mngreltnsbtn").show();

    }
    else{
        $("#savenode").hide();
        $("#deletenodebtn").hide();
        $("#mngreltnsbtn").hide();
    }
    $("#secondaryNodeProperties").jsGrid("refresh");
    $("#secondaryiriannunciator").html("");
});

$("#diAPILoginForm").submit(function(e){
    $.ajax({
        url: apiServer+'/DIOntoManager/api/user/login',
        type: 'POST',
        data: $('#diAPILoginForm').serialize(),
        xhrFields: {
            withCredentials: true
        },
        success: function(data){
            var inCorrectCredentials = "Incorrect Username or Password";
            if(!data.Authenticated){
                alert("Incorrect Username or Password");
                changeToUnAuthenticatedDisplay();
            }
            else {
                //getValidNodeProperties();
                hideUserSettings();
                currentUserDetails=data;
     
                $('#diAPILoginForm').hide();
                $('#authStatus').html("<font size=\"1\">Welcome " + currentUserDetails.User + " (<span onClick=\"logout()\" id=\"logout\">logout</span>)</font>");
                $('#authStatus').show();
                if (currentUserDetails.viewnode_authorized || currentUserDetails.modifynode_authorized){
                    getValidNodeProperties();
                    $(".ontomanage").show();
                    $(".ontodisplay").width("65%");
                    if(currentUserDetails.modifynode_authorized){
      		            changeToModifierUserUI();
                        if (currentUserDetails.doidUpdateAvailable) {
                            alert ("A DOID update has been detected and downloaded.\nPlease merge with BSVE and apply the audit trail");
                        }
                        else if (currentUserDetails.auditReplayRequired){
                            alert ("An update to the underlying BSVE ontology has been detected.\nPlease apply the Audit trail to bring the graph database up to date");
                        }
                    }
                    else{
                        changeToViewerUserUI();
                    }
                }
            }
        },
        error: function(err) {
            alert (err.status)
        }
    });
    e.preventDefault();
})