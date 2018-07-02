;

var xmlhttp;
var isExist = new Array(5);
var IdExist = new Array(5);
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

            /* ================================================================
             *  pairOfArraysToDictionary        
             *      (array                          
             *      ,keyName                        
             *      ,valueName)                     
             * ================================================================ */
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
                            if(temp === "lwm2m"){
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

                       
                        var exampleus = dict.exampleus;
                        if(!exampleus){
                            isExist[1] = false;
                            IdExist[1] = "exampleusPanel" + dict.id;
                        }else{
                            isExist[1] = true;
                            IdExist[1] = dict.id;
                        }

                       
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
                        tempBody[0] = '<table class="table-responsive table table-bordered table-hover"><tr><th style="width: 10%;">Resource</th><th style="width: 3%;">ID</th><th style="width: 7%;">Access Type</th><th style="width: 8%;">MultipleInstances</th><th style="width: 10%;">Mandatory</th><th style="width: 6%;">Type</th><th style="width: 10%;">RangeEnumeration</th><th style="width: 9%;">Units</th><th style="width: 36%;">Description</th></tr>';
                        tempBody[resourcesArray.length+2] = '</table>';
                        for(var i = 0 ; i < resourcesArray.length; i++){

                            var item = resourcesArray[i];
                            var tempTR = "<tr><td>" + item.Name + "</td><td>" + i + "</td><td>" + item.Operations + "</td><td>" + item.MultipleInstances + "</td><td>" +item.Mandatory  + "</td><td>" + item.Type + "</td><td>" + item.RangeEnumeration + "</td><td>"+ item.Units + "</td><td>" + item.Description + "</td></tr>" ;
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

        /* ================================================================
         *  defineServices                    
         *      getJsonOf                       
         * ================================================================ */
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
