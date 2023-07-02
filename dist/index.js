"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
var _express = _interopRequireDefault(require("express"));
var _multer = _interopRequireDefault(require("multer"));
var _cors = _interopRequireDefault(require("cors"));
var _colors = _interopRequireDefault(require("colors"));
var _path = _interopRequireWildcard(require("path"));
var _http = _interopRequireDefault(require("http"));
var _helmet = _interopRequireDefault(require("helmet"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _uuid = require("uuid");
var _url = require("url");
var _fs = _interopRequireDefault(require("fs"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var app = (0, _express["default"])();
var server = _http["default"].createServer(app);
app.use(_express["default"].json({
  limit: '50mb'
}));
app.use(_express["default"].urlencoded({
  limit: '50mb',
  extended: true
}));
app.use(_helmet["default"].contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"]
  }
}));
_dotenv["default"].config();
var allowedOrigin = 'https://cezi-image-uploader.vercel.app/';
app.use((0, _cors["default"])({
  origin: '*'
}));
var _filename = (0, _url.fileURLToPath)(import.meta.url);
var _dirname = (0, _path.dirname)(_filename);

// to serve images inside public folder

app.use(_express["default"]["static"](_path["default"].join(_dirname, './public')));
console.log(_dirname);

////////  set a storage ////////

var storage = _multer["default"].diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, './public');
  },
  filename: function filename(req, file, cb) {
    console.log(file);
    var uniqueFileName = "".concat(Date.now(), "-").concat((0, _uuid.v4)(), "-").concat(file.originalname);
    cb(null, uniqueFileName);
  }
});
// to upload images
var upload = (0, _multer["default"])({
  storage: storage
});
////// response server 
app.get('/', function (req, res) {
  res.send('hello');
});

//// to upload single image
app.post('/single', upload.single('image'), function (req, res, err) {
  if (req.file) {
    console.log(req.file);
    res.send('ok');
  } else {
    res.status(400).send('image not found');
  }
});

//// delete file
app["delete"]('/single/:filename', function (req, res) {
  var imageName = req.params.filename;
  var imagePath = "./public/".concat(imageName);

  // check if image exists

  if (_fs["default"].existsSync(imagePath)) {
    // remove image
    _fs["default"].unlinkSync(imagePath);
    res.send('Image deleted successfully.');
  } else {
    res.status(404).send('Image not found.');
  }
});

////////// load all files from the public folder
app.get('/public', function (req, res) {
  var publicFolderPath = _path["default"].join(_dirname, 'public');
  _fs["default"].readdir(publicFolderPath, function (err, files) {
    if (err) {
      console.error(err);
      res.status(500).send('bad read request');
      return;
    }

    // process file
    var fileContents = [];
    files.forEach(function (file) {
      var filePath = _path["default"].join(publicFolderPath, file);
      var data = _fs["default"].readFileSync(filePath);
      var content = data.toString('base64');
      fileContents.push({
        fileName: file,
        content: content
      });
    });

    // return file contents
    res.send(fileContents);
  });
});
var PORT = process.env.PORT;
app.listen(PORT, function () {
  console.log("Server is running on port ".concat(PORT).yellow.bold);
});