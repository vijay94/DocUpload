/*
Copyright 2018 Vijay s
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE
*/
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  window.Class = function(){};

  // Create a new Class that inherits from this class
  Class.extend = function caller(prop) {
    var _super = this.prototype;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;

    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;

            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];

            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);
            this._super = tmp;

            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }

    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }

    // Populate our constructed prototype object
    Class.prototype = prototype;

    // Enforce the constructor to be what we expect
    Class.constructor = Class;

    // And make this class extendable
    Class.extend = caller;

    return Class;
  };
})();

var Uploader = Class.extend({
  element : '',
  deletingElement : '',
  options:{
    required : 0,
    buttonText : "Upload",
    buttonClass : "btn btn-primary",
    buttonAddMoreClass : "btn btn-default",
    buttonAddMore : "Add File",
    list : "<li><li>",
    uploadUrl : "upload.php",
    deleteUrl : "delete.php",
    fileNameClass : "file-name",
    deleteFileClass : "icon-delete",
    allow : ['pdf'],
    maxFileSize : 2,
    max: 2,
    allowUpload : true,
    uploadCallback : function (response) {
      this.addItem(response);
    },
    deleteCallback : function (response) {
      this.updateItem(response);
    }
  },

  init: function(element, option){
    this.element = element;
    $.extend( this.options, option );
    this.create();
  },

  create : function () {
    this.element.append("<button id='uploader-btn' class='"+this.options.buttonClass+"'>"
                        +"<span>"+this.options.buttonText+"</span><input type='file'/></button>"
                        +"<span class='uploader-error'></span><span class='uploader-success'></span>")
    this.element.append("<ul></ul>");
    this.initListeners();
  },

  initListeners : function () {
    var self = this ;
    $(this.element).on('change','input[type="file"]',function (e) {
      if (e.target.files.length > 0 && self.canUploadMore() && self.isValidFile(e) && self.options.allowUpload) {
        self.disableButton(1);
        var formData = new FormData();
        formData.append("file",self.element.find("button#uploader-btn>input[type='file']")[0].files[0]);
        self.ajaxCall(self.options.uploadUrl, formData, self.options.uploadCallback);
      }
      $(this).val('');
    });

    $(this.element).on('click', 'ul li .'+this.options.deleteFileClass, function (e) {
      var formData = new FormData();
      formData.append("id",$(this).parents("li").data("id"));
      self.deletingElement = $(this);
      self.ajaxCall(self.options.deleteUrl, formData, self.options.deleteCallback);
    });
  },

  updateItem : function (response) {
      $(this.deletingElement).parents("li").remove();
      this.enableButton();
  },

  isValidFile : function (e){
    var fileSize = e.target.files[0].size / 1024 / 1024; // in MB
    if (fileSize > this.options.maxFileSize) {
      this.element.find('.uploader-error').html("File cannot be bigger than "+this.options.maxFileSize+"MB");
      return false;
    }

    if (!this.hasExtension(e.target.files[0].name)) {
      this.element.find('.uploader-error').html("File extension not supported");
      return false;
    }

    this.element.find('.uploader-error').html("");
    return true;
  },

  hasExtension : function(fileName) {
    if (this.options.allow.length == 0) {
      return true;
    }
    return (new RegExp('(' + this.options.allow.join('|').replace(/\./g, '\\.') + ')$')).test(fileName);
  },

  getList : function (response) {
    var list = $(this.options.list);
    list.attr("data-id",response.id);
    list.find("."+this.options.fileNameClass).html(response.fileName);
    return list;
  },

  addItem : function (response) {
    var canUpload = this.canUploadMore();
    if( canUpload !== false ) {
      this.element.find("ul").append(this.getList(response));
      this.disableButton(0);
    }
  },

  canUploadMore : function (){
    if (this.options.max >= (this.element.find("ul li").length + 1) ) {
      return true;
    }
    return false;
  },

  disableButton : function (increment) {
    if (this.options.max == (this.element.find("ul li").length + increment) ) {
      this.element.find("button#uploader-btn").prop("disabled",true);
      this.element.find("button#uploader-btn>input[type='file']").prop("disabled",true);
    }
  },

  enableButton : function () {
    if (this.options.max >= this.element.find("ul li").length) {
      this.element.find("button#uploader-btn").prop("disabled","");
      this.element.find("button#uploader-btn>input[type='file']").prop("disabled","");
    }
  },

  ajaxCall : function (url, formData, callback)  {
      $.ajax({
        url: url,
        method: "POST",
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
          if (typeof callback === "function")
            callback(response);
        },
        error: function(err) {
          if (typeof callback === "function")
            callback(err.responseText);  
        },
      });
  },
});

$.fn.Uploader = function(option){
    return new Uploader(this,option);
};
