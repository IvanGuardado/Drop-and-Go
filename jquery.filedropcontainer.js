(function($){
  
var defaultOptions = {
    'allowedExtensions': null, //todo
    'maxFileSize': null, //todo
    'maxQueueSize': null, //todo
    'autostart': true,
    'serverScript': 'upload.php',
    'onFileDragEnter': $.noop,
    'onFileDragLeave': $.noop,
    'onUploadSuccess': $.noop,
    'onUploadError': $.noop,
    'onFileDropped': $.noop,
    'onFileUploadStart': $.noop,
    'onUploadComplete': $.noop //todo
};
  
var Container = function($container, options){
    var me = this;
    var $container = $container;
    var isRunning = false;
    var fileItemList = [];
    bindEvents();
    
    function bindEvents()
    {
        $.filedragstart(function(){
            options.onFileDragEnter.call($container);
        });
        $.filedragend(function(){
            options.onFileDragLeave.call($container);
        });
		$container.bind('drop', onDropEvent);
    }
    
    function onDropEvent(event)
    {
        options.onFileDragLeave.call($container);
        var data = event.originalEvent.dataTransfer;
		for (var i = 0; i < data.files.length; i++) {
			var file = data.files[i];
			if(!me.isFileAdded(file.name)){
			    var fileId = me.getTotalFiles()+1;
				var fileItem = new FileItem(fileId, file);
				options.onFileDropped.call($container, fileItem);
				fileItemList.push(fileItem);
			}
		}
		if(options.autostart){
			me.start();
		}
		return false;
    }
        
    this.isFileAdded = function (fileName)
	{
	    for(var i=0; i<me.getTotalFiles(); i++){
			if(fileItemList[i].name == fileName){
				return true;
			}
		}
		return false;
	};
	
	this.start = function()
	{
	    if(isRunning){
			return;
		}
		if(fileItemList.length > 0){
			for(var i=0; i < fileItemList.length; i++){
				var fileItem = fileItemList[i];
				if(sendFile(fileItem)){
				    options.onFileUploadStart.call($container, fileItem);
				    break;
				}
			}
		}
	};
	
	function sendFile(fileItem){
        if(!fileItem.getIsSent()){
            isRunning = true;
		    fileItem.send(me);
		    return true;
	    }
	    return false;
	}
	
	this.getTotalFiles = function()
	{
        return fileItemList.length;
	};
	
	this.onServerResponse = function(responseText, fileItem) {
	    if(!responseText){
	        options.onUploadError.call($container, fileItem);
	    }
	    else {
            var response = eval("("+responseText+")");
            if(response.status == true){
	            options.onUploadSuccess.call($container, fileItem);
            }else{
	            options.onUploadError.call($container, fileItem);
            }
        }
        next();
    };
    
    this.getServerScript = function(){
        return options.serverScript;
    };
    
    function next()
	{
	    isRunning = false;
		me.start();
	}
};

var FileItem = function(id, file){
	this.id = id;
	this.name = file.name;
	this.content;
	var sent = false;
	var me = this;
	var boundary;
	
	
	function prepareData(callback) 
	{
	    var dashdash = '--';
		var crlf     = '\r\n';
		var builder = '';
	    var reader = new FileReader();
        reader.onload = function(evt) {
	        me.content = evt.target.result;
	        builder += dashdash;
		    builder += getBoundary();
		    builder += crlf;

		    builder += 'Content-Disposition: form-data; name="user_file"';
		    if (me.name) {
		      builder += '; filename="' + me.name + '"';
		    }
		    builder += crlf;

		    builder += 'Content-Type: application/octet-stream';
		    builder += crlf;
		    builder += crlf; 

		    //Append binary data.
		    builder += me.content;
		    builder += crlf;

		    //Write boundary
		    builder += dashdash;
		    builder += getBoundary();
		    builder += dashdash;
		    builder += crlf;
		    
		    callback(builder);
        };
        reader.onerror = function(){
            callback();
        };
        reader.readAsBinaryString(file);
	}
	
	function getBoundary()
	{
	    if(!boundary){
	        boundary = '------multipartformboundary' + (new Date).getTime();
	    }
	    return boundary;
	}
	
	this.getIsSent = function()
	{
		return sent;
	};
	
	this.send = function(manager)
	{
		prepareData(function(data) {
		    if(!data){
		        manager.onServerResponse(undefined, me);
		    }else{
		        var xhr = new XMLHttpRequest();
		        xhr.open("POST", manager.getServerScript(), true);
		        xhr.setRequestHeader('content-type', 'multipart/form-data; boundary=' + getBoundary());
		        xhr.send(data);
		        xhr.onload = function(){
		            manager.onServerResponse(xhr.responseText, me);
	            }
	        }
		    sent = true;
		});
	};
};

$.fn.fileDropContainer = function(options){
    var mergedOptions = {};
    $.extend(mergedOptions, defaultOptions, options);
    return new Container(this, mergedOptions);
}

})(jQuery);
