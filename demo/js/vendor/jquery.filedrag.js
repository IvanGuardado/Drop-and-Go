;(function($){
    var isDragging = false;
    
    $.extend({
        filedragstart: function(callback){
            $(window).bind('dragover', function(e){
                if(!isDragging){
                    callback();
                    isDragging = true;
                }
	            e.preventDefault();
	        });
        },
        
        filedragend: function(callback){
            $(window).bind('dragleave dragexit', function(e){
                /*clearInterval(timer);
	            timer = setInterval(function(){
	                cokidoo.AJAXUploader.$UIContainer.hide();
	                clearInterval(timer);
	            }, 700);*/
	            if(e.originalEvent.pageX == 0){
	                isDragging = false;
	                callback();
	            }
    	    });
        }
    });
})(jQuery);
