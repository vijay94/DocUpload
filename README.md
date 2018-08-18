# DocUpload

A simple Multi Document Upload Library

Fully Customizable and easy to modify to fit your needs

Advantages:
- Super simple to install, and works with jquery and lightweight


## Version

1.1.1

## License

MIT Licence

### Dependencies
- [jquery.js](https://code.jquery.com/jquery-3.3.1.min.js)

### Basic usage

- JavaScript

```javascript
    uploader = $(".uploader").Uploader({
      required : 1,
      max: 5,
      list : '<li><p><span class="file-name"></span><span><a class="pd-lt-10 icon-delete" href="#">delete</a></span></p></li>',
      deleteFileClass : "icon-delete",
      uploadUrl : "upload.php",
      uploadCallback : addItem,
      deleteCallback : updateItem,
    });
```


## Contribute

You're more than welcome to contribute to this project. 

The library is written jquery.

Enjoy!


## Developer

Developed by S. Vijay

