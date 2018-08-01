;
/* ================================================================
 *  for debugging
 * ================================================================ */
var $debugging = $debugging ? $debugging : {};


var xmlhttp;
var isExist = new Array(6);
var IdExist = new Array(6);

var $gtMap = [[
    window.SuperMap || null,
    window.jQuery || null
]].map(function () {
    return (function ($superMap, $) {
        'use strict';
        var $oop = defineOOP();
        var $utils = defineUtils();
        var $gis = $superMap;
        var $ui = defineUI();
        var $services = defineServices();
        return {
            $oop: $oop,
            $gis: $gis,
            $ui: $ui,
            $utils: $utils,
            $services: $services
        };

        function defineUtils() {
            Object.defineProperty(Array.prototype, "justFindOne", {
                value: findElementBy,
                writable: false,
                enumerable: false,
                configurable: true
            });

            return {
                arrayToDictionary: arrayToDictionary,
                pairOfArraysToDictionary: pairOfArraysToDictionary
            };

            function arrayToDictionary(array, keyName, valueName) {
                var dictionary = {};
                for (var i = array.length; --i >= 0;) {
                    var item = array[i];
                    dictionary[item[keyName == null ? 0 : keyName]] =
                        valueName == null ? item : item[valueName];
                }
                return dictionary;
            }

            function pairOfArraysToDictionary(keys, values) {
                var keyValuePairs = keys.map(function (key, i) {
                    return [key, values[i]];
                });
                return arrayToDictionary(keyValuePairs, 0, 1);
            }


            function findElementBy(callback, array) {
                var thisArray = array === undefined ? this : array;
                var ret = null;
                if (thisArray != null) {
                    for (var i = 0, length = thisArray.length; i < length; i++) {
                        if (callback.call(thisArray, thisArray[i], i)) {
                            ret = thisArray[i];
                            break;
                        }
                    }
                }
                return ret;
            }
        }


        function defineOOP() {
            var StringTemplateInterpreter = defineStringTemplateInterpreter();
            return {
                StringTemplateInterpreter: StringTemplateInterpreter
            };

            function defineStringTemplateInterpreter() {
                StringTemplateInterpreter.prototype.interpret = interpret;
                return StringTemplateInterpreter;

                function StringTemplateInterpreter(openTag, closeTag) {
                    if (!(this instanceof StringTemplateInterpreter)) {
                        return new StringTemplateInterpreter(openTag, closeTag);
                    }
                    this.leftTag = openTag ? openTag : '{{';
                    this.rightTag = closeTag ? closeTag : (openTag ? openTag : '}}');
                    return this;
                }

                function interpret(stringTemplate, keyValueMap) {
                    var thisInterpreter = this;
                    var tokens = [].concat.apply([],
                        stringTemplate.split(thisInterpreter.leftTag).map(function (token) {
                            return token.split(thisInterpreter.rightTag)
                        })).map(function (token, i) {
                        return i % 2 ? keyValueMap[token] : token;
                    }).join('');
                    return tokens;
                }
            }
        }

        function defineUI() {

            return {
                populateHtmlFrom: populateHtmlFrom
            };

            function populateHtmlFrom(template$, dictionaries, openTag, closeTag) {
                closeTag = closeTag || openTag || '}}';
                openTag = openTag || '{{';
                var interpreter = new $oop.StringTemplateInterpreter(openTag, closeTag);
                template$.each(function (_, template) {
                    var templateString = template.outerHTML;
                    dictionaries.forEach(function (dict) {

                        
                        var modelsTemp = dict.models;
                        if(!modelsTemp || modelsTemp.length === 0){
                            isExist[3] = false;
                            isExist[4] = false;

                            IdExist[3] = "lwm2m" + dict.id;
                            IdExist[4] = "uci" + dict.id;
                        }else if(modelsTemp.length === 1){
                            var temp = dict.models[0]
                            if(temp === "LWM2M"){
                                dict["modelsLwm2m"] = temp;
                                isExist[3] = true;
                                isExist[4] = false;

                                IdExist[3] = dict.id;
                                IdExist[4] = "uci" + dict.id;
                            }else{
                                dict["modelsUCI"] = temp;
                                isExist[3] = false;
                                isExist[4] = true;

                                IdExist[3] = "lwm2m" + dict.id;
                                IdExist[4] = dict.id;
                            }
                        }else{
                            dict["modelsLwm2m"] = dict.models[0];
                            dict["modelsUCI"] = dict.models[1];

                            isExist[3] = true;
                            isExist[4] = true;

                            IdExist[3] = dict.id;
                            IdExist[4] = dict.id;

                        }

                        
                        var pathName = document.location.pathname;
                        var indexLast = pathName.lastIndexOf('/');
                        var result = pathName.substr(0,indexLast+1);

                       
                        var xmlDoc = loadXML(result + dict.url);
                        var xotree = new XML.ObjTree();
                        var xmlToJson = xotree.parseXML(xmlDoc);

                        
                        var json1 = $.extend(dict, xmlToJson.LWM2M.Object);

                        
                        var xmlDoc2 = xmlDoc.replace(new RegExp("<","gmi"), "&lt;").replace(new RegExp(">","gmi"), '&gt;\n').replace(new RegExp('"',"gmi"),'&quot;').replace(new RegExp(/\n/g,"gmi"),'<br/>');
                        json1["interXML"] = xmlDoc2;


                        var jsonUrl = dict.ifjson;
                        if(!!jsonUrl){
                            var tempJson = loadJson(result + jsonUrl);
                            var tempStr = JSON.stringify(tempJson, null, 4);
                            var temp1 = tempStr.replace(/\n/g,'<br/>').replace(" ","&nbsp;");
                            json1["interJson"] = temp1;
                            isExist[0] = true;
                            IdExist[0] = dict.id;
                        }else{
                            
                            isExist[0] = false;
                            IdExist[0] = "jsonPanel" + dict.id;
                        }

                        // only for reading data from UCI json file
                       
                         isExist[5] = true;
                         IdExist[5] = dict.id;
                         if(isExist[4]){

                            
                            var uciJson = dict.UCIJson;
                            if(!!uciJson){
                                var tempJson = loadJson(result + uciJson);

                              
                                var uciUrl = tempJson.UCI.URL;
                                if(!!uciUrl){
                                    json1["uciChildOneValue"] = uciUrl;
                                }

                               
                                if(dict.id === 1){

                                    json1["uciChildTwoKey"] = "System";
                                    var uciSystemDes = tempJson.UCI.System.Des;
                                    var uciSystemDesOne = "Option Fields";
                                    var uciSysDes = [];
                                    uciSysDes = tempJson.UCI.System.OptionFields;
                                    var tempBody = new Array(uciSysDes.length+2);
                                    tempBody[0] = '<div class ="table-responsivetable"><table class="table table-bordered table-hover" rules="all" style="text-align-all: center;"><tr><th style="width: 2%;">Name</th><th style="width: 2%;">Type</th><th style="width: 2%;">Required</th><th style="width: 3%;">Default</th><th style="width: 10%;">Description</th></tr>';
                                    tempBody[uciSysDes.length+2] = '</table></div>';
                                    for(var i = 0 ; i < uciSysDes.length; i++){

                                        var item = uciSysDes[i];
                                        var tempTR = "<tr><td>" + item.Name + "</td><td>" + item.Type + "</td><td>" + item.Required + "</td><td>" +item.Default  + "</td><td>" + item.Description + "</td></tr>" ;
                                        tempBody[i+1] = tempTR;
                                    }

                                    var uciSystem = uciSystemDes + "<br><div style='margin-top: 20px; font-weight: bold; font-size: 14px;'>" + uciSystemDesOne + "<br></div><br>" +  tempBody.join('');
                                    json1["uciChildTwoValue"] = uciSystem;

                                    // Timeserver
                                    json1["uciChildThreeKey"] = "Timeserver";
                                    var uciTimeServerDes = tempJson.UCI.Timeserver.Des;
                                    var uciTimeServerOne = "List Fields";
                                    var uciTSOne =[];
                                    uciTSOne = tempJson.UCI.Timeserver.ListFields;
                                    var tempBodyuciTSOne = new Array(uciTSOne.length+2);
                                    tempBodyuciTSOne[0] = '<div class ="table-responsivetable"><table class="table table-bordered table-hover" rules="all" style="text-align-all: center;"><tr><th style="width: 2%;">Name</th><th style="width: 2%;">Type</th><th style="width: 2%;">Required</th><th style="width: 3%;">Default</th><th style="width: 10%;">Description</th></tr>';
                                    tempBodyuciTSOne[uciTSOne.length+2] = '</table></div>';
                                    for(var i = 0 ; i < uciTSOne.length; i++){

                                        var item = uciTSOne[i];
                                        var tempTR = "<tr><td>" + item.Name + "</td><td>" + item.Type + "</td><td>" + item.Required + "</td><td>" +item.Default  + "</td><td>" + item.Description + "</td></tr>" ;
                                        tempBodyuciTSOne[i+1] = tempTR;
                                    }

                                    var uciTimeServerTwo = "Option Fields";
                                    var uciTSTwo =[];
                                    uciTSTwo = tempJson.UCI.Timeserver.OptionFields;
                                    var tempBodyuciTSTwo = new Array(uciTSTwo.length+2);
                                    tempBodyuciTSTwo[0] = '<div class ="table-responsivetable"><table class="table table-bordered table-hover" rules="all" style="text-align-all: center;"><tr><th style="width: 4%;">Name</th><th style="width: 2%;">Type</th><th style="width: 2%;">Required</th><th style="width: 3%;">Default</th><th style="width: 10%;">Description</th></tr>';
                                    tempBodyuciTSTwo[uciTSTwo.length+2] = '</table></div>';
                                    for(var i = 0 ; i < uciTSTwo.length; i++){

                                        var item = uciTSTwo[i];
                                        var tempTR = "<tr><td>" + item.Name + "</td><td>" + item.Type + "</td><td>" + item.Required + "</td><td>" +item.Default  + "</td><td>" + item.Description + "</td></tr>" ;
                                        tempBodyuciTSTwo[i+1] = tempTR;
                                    }

                                      
				   var uciTimeServer = uciTimeServerDes + "<br><div style='margin-top: 20px; font-weight: bold; font-size: 14px;'>" + uciTimeServerOne + "</div><br>" +  tempBodyuciTSOne.join('') + "<div style='margin-top: 30px; font-size: 14px; font-weight: bold;'>" + uciTimeServerTwo + "</div><br>" + tempBodyuciTSTwo.join('') ;
                                   json1["uciChildThreeValue"] = uciTimeServer;

                                }

                                
                                if(dict.id === 2){
                                    json1["uciChildTwoKey"] = "Wifi-iface";
                                    var uciWifiIfaceDes = tempJson.UCI.WifiIface.Des;
                                    var uciWifiIfaceDesOne = "Option-fields";
                                    var uciWifiDes = [];
                                    uciWifiDes = tempJson.UCI.WifiIface.OptionFields;
                                    var tempBodyWifi = new Array(uciWifiDes.length+2);
                                    tempBodyWifi[0] = '<table class="table-responsivetable table-bordered table-hover" rules="all" style="text-align-all: center;"><thead><tr><th style="width: 2%;">Name</th><th style="width: 2%;">Type</th><th style="width: 2%;">Required</th><th style="width: 3%;">Default</th><th style="width: 10%;">Description</th></tr>';
                                    tempBodyWifi[uciWifiDes.length+2] = '</table>';
                                    for(var i = 0 ; i < uciWifiDes.length; i++){

                                        var item = uciWifiDes[i];
                                        var tempTR = "<tr><td>" + item.Name + "</td><td>" + item.Type + "</td><td>" + item.Required + "</td><td>" +item.Default  + "</td><td>" + item.Description + "</td></tr>" ;
                                        tempBodyWifi[i+1] = tempTR;
                                    }

                                    var uciWifitem = uciWifiIfaceDes + "<br><div style='margin-top: 20px; font-weight: bold; font-size: 14px;'>" + uciWifiIfaceDesOne + "</span><br></div><br>" +  tempBodyWifi.join('');
                                    json1["uciChildTwoValue"] = uciWifitem;

                                    var threeKeyUci = "uciChildThreeKey" + dict.id;

                                    isExist[5] = false;
                                    IdExist[5] = threeKeyUci;

                                }

                            }

                        }



                        // if exampleus exists 
                        var exampleus = dict.exampleus;
                        if(!exampleus){
                            isExist[1] = false;
                            IdExist[1] = "exampleusPanel" + dict.id;
                        }else{
                            isExist[1] = true;
                            IdExist[1] = dict.id;
                        }

                        // if codeurl exists
                        var codeUrl = dict.codeUrl;
                        if(!codeUrl){
                            isExist[2] = false;
                            IdExist[2] = "codePanel"+ dict.id;
                        }else{
                            isExist[2] = true;
                            IdExist[2] = dict.id;
                        }

                        // resources filed
                        var resourcesArray = [];
                        resourcesArray = json1.Resources.Item;
                        var tempBody = new Array(resourcesArray.length+2);
                        tempBody[0] = '<div class ="table-responsivetable"><table class="table table-bordered table-hover"><tr><th style="width: 12%;">Resource</th><th>ID</th><th>Access Type</th><th style="width: 14%;">MultipleInstances</th><th style="width: 13%;">Mandatory</th><th style="width: 8%;">Type</th><th>RangeEnumeration</th><th style="width: 10%;">Units</th><th>Description</th></tr>';
                        tempBody[resourcesArray.length+2] = '</table></div>';

                        for(var i = 0 ; i < resourcesArray.length; i++){

                            var item = resourcesArray[i];
                            var tempTR = "<tr><td>" + item.Name + "</td><td>" + i + "</td><td>" + item.Operations + "</td><td>" + item.MultipleInstances + "</td><td>" +item.Mandatory  + "</td><td>" + item.Type + "</td><td>" + item.RangeEnumeration + "</td><td>"+ item.Units + "</td><td>" + item.Description + "</td></tr></tbody>" ;
                            tempBody[i+1] = tempTR;
                        }

                        json1["interTable"] = tempBody.join('');

                        $(interpreter.interpret(templateString, json1)).insertBefore(template);

                        
                        for(var j = 0; j < isExist.length; j++){
                            if(!isExist[j]){
                                document.getElementById(IdExist[j]).style.display = "none";
                            }
                        }
                    });



                });
                template$.remove();
            }

            //ajax read xml
            function loadXML(fileName) {

                if (window.XMLHttpRequest)
                {// code for IE7+, Firefox, Chrome, Opera, Safari
                    xmlhttp=new XMLHttpRequest();
                }
                else
                {// code for IE6, IE5
                    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
                }
                xmlhttp.open("GET",fileName,false);
                xmlhttp.send();
                return xmlhttp.responseText;

            }

            // ajax read json
            function loadJson(jsonUrl) {
                var json = null;
                try {
                    $.ajaxSettings.async = false;
                    $.getJSON(jsonUrl, function (database) {
                        json = database;
                    });
                } catch (e) {
                    console.log(e);
                } finally {
                    $.ajaxSettings.async = true;
                }
                return json;
            }

        }

        function defineServices() {
            return {
                getJsonOf : getJsonOf
            };

            function getJsonOf(jsonUrl) {
                var json = null;
                try {
                    $.ajaxSettings.async = false;
                    $.getJSON(jsonUrl, function (database) {
                        json = database;
                    });
                } catch (e) {
                    console.log(e);
                } finally {
                    $.ajaxSettings.async = true;
                }
                return json;
            }
        }
    }).apply(null, arguments[0]);
})[0];
