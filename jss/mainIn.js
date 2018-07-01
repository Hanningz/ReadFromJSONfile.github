;
/* ================================================================
 *  浏览器调试用
 * ================================================================ */
var $debugging = $debugging ? $debugging : {};


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

        /* ================================================================
         *  defineUtils                     // 返回工具项关，本模块只放无可以单独执行的函数，不放类
         *      arrayToDictionary               // 将键值对数组转换为作为字典使用的对象
         *      pairOfArraysToDictionary        // 将一对数组转换为作为字典使用的对象，第一个数组的元素作为键，第二个数组的元素作为值
         * ================================================================ */
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
             *  pairOfArraysToDictionary        // 将一对数组转换为作为字典使用的对象，返回作为字典的对象
             *      (array                          // 输入数组，数组元素为表示键值对的对象
             *      ,keyName                        // 输入数组的元素中表示键的属性名称
             *      ,valueName)                     // 返回的对象的作为值的属性名称
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

            /* ================================================================
             *  pairOfArraysToDictionary        // 将一对数组转换为作为字典使用的对象，返回作为字典的对象
             *      (keys                           // 作为键的数组
             *      ,keyName                        // 返回的对象的作为键的属性名称
             *      ,valueName)                     // 返回的对象的作为值的属性名称
             * ================================================================ */
            function pairOfArraysToDictionary(keys, values) {
                var keyValuePairs = keys.map(function (key, i) {
                    return [key, values[i]];
                });
                return arrayToDictionary(keyValuePairs, 0, 1);
            }

            /* ================================================================
             *  findElementBy                   // 返回数组中符合 callback 执行为 true 的第一个元素
             *      this                            // 被查找的数组
             *      (callback,
             *      array)
             * ================================================================ */
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

        /* ================================================================
         *  defineOOP                       // 返回面向对象相关
         *      createClassBuilder              // 返回用来定义类的 builder
         *      createDecoratorBuilder          // 返回用来装饰对象的 builder
         *      ExclusiveActivitiesObserver     // 充当观察者的类，被观察对象的激活状态具有排他性
         * ================================================================ */
        function defineOOP() {
            var StringTemplateInterpreter = defineStringTemplateInterpreter();
            return {
                StringTemplateInterpreter: StringTemplateInterpreter
            };

            /* ================================================================
             *  defineStringTemplateInterpreter // 定义用来解释字符串模板解释器的类
             * ================================================================
             *  defineStringTemplateInterpreter() // 用来解释字符串模板解释器的类
             *    this.                           // 实例层面
             *      leftTag                         // 被替换部分的左标签
             *      rightTag                        // 被替换部分的右标签
             *    prototype.                      // 原型层面，
             *      interpret                       // 执行解释
             *          (stringTemplate, keyValueMap)
             * ================================================================ */
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


        /* ================================================================
         *  defineUI                        // 返回界面相关，本模块只放无可以单独执行的函数，不放类
         *      populateHtmlFrom                // 填充自定义 HTML 模板（常见的模板标志是 .gt-template）
         * ================================================================ */
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

                        // 判断models里面有几个值
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

                        // 获取项目路径名
                        var pathName = document.location.pathname;
                        var indexLast = pathName.lastIndexOf('/');
                        var result = pathName.substr(0,indexLast+1);

                        // 加载xml文件
                        var xmlDoc = loadXML(result + dict.url);
                        var xotree = new XML.ObjTree();
                        var xmlToJson = xotree.parseXML(xmlDoc);

                        // 把dict和xmljson合并成一个json
                        var json1 = $.extend(dict, xmlToJson.LWM2M.Object);

                        // 生成一个xml的json对象，便于插入页面中
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
                            // json文件不存在
                            isExist[0] = false;
                            IdExist[0] = "jsonPanel" + dict.id;
                        }

                        // exampleus判断是否存在
                        var exampleus = dict.exampleus;
                        if(!exampleus){
                            isExist[1] = false;
                            IdExist[1] = "exampleusPanel" + dict.id;
                        }else{
                            isExist[1] = true;
                            IdExist[1] = dict.id;
                        }

                        // codeUrl判断是否存在
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
                        tempBody[0] = '<table style="border: 1px solid royalblue; font-size: 10px ; text-align-all: center;"><tr><th style="width: 10%;">Resource</th><th style="width: 3%;">ID</th><th style="width: 7%;">Access Type</th><th style="width: 8%;">MultipleInstances</th><th style="width: 10%;">Mandatory</th><th style="width: 6%;">Type</th><th style="width: 10%;">RangeEnumeration</th><th style="width: 9%;">Units</th><th style="width: 36%;">Description</th></tr>';
                        tempBody[resourcesArray.length+2] = '</table>';
                        for(var i = 0 ; i < resourcesArray.length; i++){

                            var item = resourcesArray[i];
                            var tempTR = "<tr><td>" + item.Name + "</td><td>" + i + "</td><td>" + item.Operations + "</td><td>" + item.MultipleInstances + "</td><td>" +item.Mandatory  + "</td><td>" + item.Type + "</td><td>" + item.RangeEnumeration + "</td><td>"+ item.Units + "</td><td>" + item.Description + "</td></tr>" ;
                            tempBody[i+1] = tempTR;
                        }

                        json1["interTable"] = tempBody.join('');

                        $(interpreter.interpret(templateString, json1)).insertBefore(template);

                        // 判断模板中值是否为空，为空则隐藏div
                        for(var j = 0; j < isExist.length; j++){
                            if(!isExist[j]){
                                document.getElementById(IdExist[j]).style.display = "none";
                            }
                        }
                    });



                });
                template$.remove();
            }

            //ajax方式读取xml
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

            // ajax方法读取json
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
         *  defineServices                    // 返回服务相关
         *      getJsonOf                       // 根据 URL 获取 JSON
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
