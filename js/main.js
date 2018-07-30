

var $main = [[
     jQuery, $gtMap.$ui, $gtMap.$services
]].map(function () {
    return (function ( $, $ui, $services) {
        'use strict';
        var populateHtmlFrom = $ui.populateHtmlFrom;
        var getJsonOf = $services.getJsonOf;
        var initConfiguration = getJsonOf("data_objects.json");
        initiateUI(initConfiguration);

        return {
            initConfiguration: initConfiguration
        };


        function initiateUI(initConfiguration) {
            fillTemplatesInHomePage();

            function fillTemplatesInHomePage() {
                debugger;
                populateHtmlFrom($(".gt-template[id^=li-]"), initConfiguration.objects);
            }

        }

    }).apply(null, arguments[0]);
})[0];


function downLoadXML(idStr){

    
    var pathName = document.location.pathname;
    var index = pathName.indexOf("index_1.html");
    var result = pathName.substr(0,index);

    
    var tempUrl = "";
    var configurationTemp = $main.initConfiguration.objects;
    
  
    configurationTemp.map(function (item) {
        if(Number(idStr.substr(4, idStr.length-4)) === item.id){
            if(idStr.substr(0,4) === "_xml"){
                tempUrl = item.url;
            }else{
                tempUrl = item.ifjson;
            }
        }

    });

    var urlTemp = result + tempUrl;

    downloadFile(urlTemp);

}

window.downloadFile = function (sUrl) {

    
    if (/(iP)/g.test(navigator.userAgent)) {
        alert('Your device does not support files downloading. Please try again in desktop browser.');
        return false;
    }

    //If in Chrome or Safari - download via virtual link click
    if (window.downloadFile.isChrome || window.downloadFile.isSafari) {
        //Creating new link node.
        var link = document.createElement('a');
        link.href = sUrl;

        if (link.download !== undefined) {
            //Set HTML5 download attribute. This will prevent file from opening if supported.
            var fileName = sUrl.substring(sUrl.lastIndexOf('/') + 1, sUrl.length);
            link.download = fileName;
        }

        //Dispatching click event.
        if (document.createEvent) {
            var e = document.createEvent('MouseEvents');
            e.initEvent('click', true, true);
            link.dispatchEvent(e);
            return true;
        }
    }

    // Force file download (whether supported by server).
    if (sUrl.indexOf('?') === -1) {
        sUrl += '?download';
    }

    window.open(sUrl, '_self');
    return true;
}

window.downloadFile.isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
window.downloadFile.isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;
