var test;
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/FileSystemClient.js":
/*!*********************************!*\
  !*** ./src/FileSystemClient.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RemoteFile": () => (/* binding */ RemoteFile),
/* harmony export */   "FileSystemClient": () => (/* binding */ FileSystemClient)
/* harmony export */ });
/* harmony import */ var _VerifyClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./VerifyClient */ "./src/VerifyClient.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./src/utils.js");
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }



var RemoteFile = /*#__PURE__*/function () {
  function RemoteFile(id, fileSystemClient) {
    _classCallCheck(this, RemoteFile);

    _defineProperty(this, "id", null);

    _defineProperty(this, "_idBytes", null);

    _defineProperty(this, "fileSystemClient", null);

    this.fileSystemClient = fileSystemClient;
    this.id = id;
    this._idBytes = RemoteFile._enc.encode(id);
    this._idBytes = new Uint8Array([this._idBytes.byteLength].concat(_toConsumableArray(this._idBytes)));
  }

  _createClass(RemoteFile, [{
    key: "_pushOperationBuffer",
    value: function _pushOperationBuffer(list) {
      RemoteFile.operationBuffer.push(list);
      if (RemoteFile.operationBuffer.length >= 250) this.flush();
    }
  }, {
    key: "_futureData",
    value: function _futureData() {
      var _this = this;

      if (RemoteFile.isFlushed == true) {
        RemoteFile.flushTimeout = setTimeout(function () {
          _this.flush();
        }, 200);
      }

      RemoteFile.isFlushed = false;
      return new Promise(function (resolve, reject) {
        RemoteFile.resolveList.push(resolve);
        RemoteFile.rejectList.push(reject);
      });
    }
  }, {
    key: "_readAll",
    value: function _readAll() {
      this._pushOperationBuffer([RemoteFile.OPERATION_READ_ALL, this._idBytes.slice()]);
    }
  }, {
    key: "_readRange",
    value: function _readRange(position, length) {
      this._pushOperationBuffer([RemoteFile.OPERATION_READ_RANGE, this._idBytes.slice(), (0,_utils__WEBPACK_IMPORTED_MODULE_1__.longToByteArray)(position), (0,_utils__WEBPACK_IMPORTED_MODULE_1__.longToByteArray)(length)]);
    }
  }, {
    key: "_transferRange",
    value: function _transferRange(destIdBytes, srcPosition, destPosition, length) {
      this._pushOperationBuffer([RemoteFile.OPERATION_TRANSFER_RANGE, this._idBytes.slice(), destIdBytes, (0,_utils__WEBPACK_IMPORTED_MODULE_1__.longToByteArray)(srcPosition), (0,_utils__WEBPACK_IMPORTED_MODULE_1__.longToByteArray)(destPosition), (0,_utils__WEBPACK_IMPORTED_MODULE_1__.longToByteArray)(length)]);
    }
  }, {
    key: "_writeAll",
    value: function _writeAll(data) {
      this._pushOperationBuffer([RemoteFile.OPERATION_OVERWRITE_ALL, this._idBytes.slice(), (0,_utils__WEBPACK_IMPORTED_MODULE_1__.longToByteArray)(data.byteLength), data]);
    }
  }, {
    key: "_writeRange",
    value: function _writeRange(position, data) {
      this._pushOperationBuffer([RemoteFile.OPERATION_OVERWRITE_RANGE, this._idBytes.slice(), (0,_utils__WEBPACK_IMPORTED_MODULE_1__.longToByteArray)(position), (0,_utils__WEBPACK_IMPORTED_MODULE_1__.longToByteArray)(data.byteLength), data]);
    }
  }, {
    key: "_appendAll",
    value: function _appendAll(data) {
      this._pushOperationBuffer([RemoteFile.OPERATION_APPEND, this._idBytes.slice(), (0,_utils__WEBPACK_IMPORTED_MODULE_1__.longToByteArray)(data.byteLength), data]);
    }
    /**
    * Read a section of data and write it to other file.
    * @param {RemoteFile} destFile File to write.
    * @param {number} srcPosition Start position in file that is to be read.
    * @param {number} destPosition Position which data will be write, which in file that is to be write.
    * @param {number} length Length of data to be read and write.
    * @returns Length of bytes transferred.
    */

  }, {
    key: "transferTo",
    value: function transferTo(destFile, srcPosition, destPosition, length) {
      this._transferRange(destFile._idBytes, srcPosition, destPosition, length);

      return this._futureData();
    }
    /**
     * Write a section of data that read from other file.
     * @param {RemoteFile} srcFile File to read.
     * @param {number} srcPosition Start position in file that is to be read.
     * @param {number} destPosition Position which data will be write, which in file that is to be write.
     * @param {number} length Length of data to be read and write.
     * @returns Length of bytes transferred.
     */

  }, {
    key: "transferFrom",
    value: function transferFrom(srcFile, srcPosition, destPosition, length) {
      srcFile._transferRange(this._idBytes, srcPosition, destPosition, length);

      return this._futureData();
    }
    /**
     * Read section of data from the file. If both position and length are null, then read entire file.
     * @param {number} position Position where data will be read.
     * @param {number} length Length of data to be read.
     * @returns {Promise<Uint8Array>}
     */

  }, {
    key: "read",
    value: function read() {
      var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      if (position == null && length == null) this._readAll();else this._readRange(position, length);
      this.flush();
      return this._futureData();
    }
    /**
     * Write data to the file. If position not specified, then position will be zero.
     * @param {Uint8Array} data 
     * @param {number} position The number of bytes from the beginning of the file which data will be write. 
     * @returns {Promise<number>} Length of bytes written.
     */

  }, {
    key: "write",
    value: function write(data) {
      var position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      if (position == null) this._writeAll(data);else this._writeRange(position, data);
      return this._futureData();
    }
    /**
     * Write data to the end of file.
     * @param {Uint8Array} data
     * @returns {Promise<number>} Length of bytes written.
     */

  }, {
    key: "append",
    value: function append(data) {
      this._appendAll(data);

      return this._futureData();
    }
    /**
     * While write or transfer data to the server, these operations will be blocked in
     * buffer. After period of time or specific number of operations, buffer will 
     * automatically flush and send these operations to server.
     * If flush, close or read called, buffer will flush immediately.
     * 
     * @returns {Promise<number>} Number of flushed operations.
     */

  }, {
    key: "flush",
    value: function flush() {
      return RemoteFile.flush(this.fileSystemClient);
    }
    /**
     * Close RemoteFile.
     * @returns {Promise<null>}
     */

  }, {
    key: "close",
    value: function close() {
      return this.fileSystemClient.closeFile(this);
    }
  }], [{
    key: "flush",
    value: // static OPEN_MODE_APPEND = 4;
    // static OPERATION_TRANSFER_ALL = 7;

    /**
     * While write or transfer data to the server, these operations will be blocked in
     * buffer. After period of time or specific number of operations, buffer will 
     * automatically flush and send these operations to server.
     * If RemoteFile.flush called, buffer will flush immediately.
     * @param {FileSystemClient} fileSystemClient 
     * @returns {Promise<number>} Number of flushed operations.
     */
    function flush(fileSystemClient) {
      if (RemoteFile.isFlushed === true) return;
      RemoteFile.isFlushed = true;
      clearTimeout(RemoteFile.flushTimeout);

      var payload = RemoteFile._compileOperation();

      return fileSystemClient._fileOp.apply(fileSystemClient, _toConsumableArray(payload)).then(function (arr) {
        var payloadList = RemoteFile._splitResponsePayload(arr);

        for (var i = 0; i < RemoteFile.resolveList.length; i++) {
          if (payloadList[i][0] === 0) RemoteFile.resolveList[i](payloadList[i][2]);else RemoteFile.rejectList[i](payloadList[i][1]);
        }

        RemoteFile.resolveList = [];
        RemoteFile.rejectList = [];
        return payloadList.length;
      });
    }
  }, {
    key: "_compileOperation",
    value: function _compileOperation() {
      var _iterator = _createForOfIteratorHelper(RemoteFile.operationBuffer),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var op = _step.value;
          op[0] = new Uint8Array([op[0]]);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      var result = RemoteFile.operationBuffer.flat();
      RemoteFile.operationBuffer = [];
      return result;
    }
  }, {
    key: "_splitResponsePayload",
    value: function _splitResponsePayload(arr) {
      var payloadList = [];
      var i = 0;
      var mode;
      var payload;

      while (i < arr.byteLength) {
        mode = arr[i++];

        switch (mode) {
          case RemoteFile.OPERATION_READ_ALL: // should be end of list.

          case RemoteFile.OPERATION_READ_RANGE:
            var readLen = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.byteArrayToLong)(arr.subarray(arr.byteLength - 8, arr.byteLength));
            var readData = arr.subarray(i, i + readLen);
            i += readLen;
            payload = FileSystemClient._solveFileResult(arr.subarray(i), true);
            payload[2] = readData;
            payloadList.push(payload); // note that i is not yet reach arr.byteLength

            return payloadList;

          case RemoteFile.OPERATION_OVERWRITE_ALL:
          case RemoteFile.OPERATION_OVERWRITE_RANGE:
          case RemoteFile.OPERATION_TRANSFER_RANGE:
          case RemoteFile.OPERATION_APPEND:
            payload = FileSystemClient._solveFileResult(arr.subarray(i), true);
            i += 2 + payload[1].length + 8;
            payload[2] = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.byteArrayToLong)(payload[2]);
            payloadList.push(payload);
            i += 8;
            break;

          default:
            throw 'invalid code: ' + mode;
            break;
        }
      }

      return payloadList;
    }
  }]);

  return RemoteFile;
}();

_defineProperty(RemoteFile, "OPEN_MODE_READ", 1);

_defineProperty(RemoteFile, "OPEN_MODE_WRITE", 2);

_defineProperty(RemoteFile, "OPEN_MODE_CREATE", 8);

_defineProperty(RemoteFile, "OPEN_MODE_CREATE_IF_NOT_EXISTS", 16);

_defineProperty(RemoteFile, "OPEN_MODE_DELETE_ON_CLOSE", 32);

_defineProperty(RemoteFile, "TRUNCATE_EXISTING", 64);

_defineProperty(RemoteFile, "OPERATION_READ_ALL", 2);

_defineProperty(RemoteFile, "OPERATION_READ_RANGE", 3);

_defineProperty(RemoteFile, "OPERATION_OVERWRITE_ALL", 4);

_defineProperty(RemoteFile, "OPERATION_OVERWRITE_RANGE", 5);

_defineProperty(RemoteFile, "OPERATION_APPEND", 6);

_defineProperty(RemoteFile, "OPERATION_TRANSFER_RANGE", 8);

_defineProperty(RemoteFile, "operationBuffer", []);

_defineProperty(RemoteFile, "resolveList", []);

_defineProperty(RemoteFile, "rejectList", []);

_defineProperty(RemoteFile, "flushTimeout", null);

_defineProperty(RemoteFile, "isFlushed", true);

_defineProperty(RemoteFile, "_enc", new TextEncoder());

_defineProperty(RemoteFile, "_dec", new TextDecoder());

var FileSystemClient = /*#__PURE__*/function () {
  // static TERMINATE_SERVER = 13;
  function FileSystemClient() {
    _classCallCheck(this, FileSystemClient);

    _defineProperty(this, "verifyClient", new _VerifyClient__WEBPACK_IMPORTED_MODULE_0__.VerifyClient());

    _defineProperty(this, "connectContext", null);

    _defineProperty(this, "_enc", new TextEncoder());

    _defineProperty(this, "_dec", new TextDecoder());
  }
  /**
   * Connect to server.
   * 
   * @param {string} host Host of server.
   * @param {string} token Token generated by server.
   * @param {boolean} secure If true, the data will be encrypted.
   * @returns {Promise<undefined>}
   */


  _createClass(FileSystemClient, [{
    key: "connect",
    value: function connect(host, token) {
      var _this2 = this;

      var secure = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

      if (secure) {
        return this.verifyClient.establishSecureConnect(host, token).then(function (context) {
          _this2.connectContext = context;
        });
      } else {
        return this.verifyClient.establishNormalConnect(host, token).then(function (context) {
          _this2.connectContext = context;
        });
      }
    }
  }, {
    key: "_parseFileAttr",
    value: function _parseFileAttr(list) {
      return;
    }
  }, {
    key: "_send",
    value: function _send(code) {
      var result;

      for (var _len = arguments.length, body = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        body[_key - 1] = arguments[_key];
      }

      if (body.length == 0) result = this.connectContext.request([new Uint8Array([code])]);else result = this.connectContext.request([new Uint8Array([code])].concat(body));
      return result.then(function (arr) {
        return FileSystemClient._solveFileResult(arr)[2];
      });
    }
    /**
     * Get current working directory.
     * @returns {Promise<string>}
     */

  }, {
    key: "cwd",
    value: function cwd() {
      var _this3 = this;

      return this._send(FileSystemClient.CWD).then(function (arr) {
        return _this3._dec.decode(arr);
      });
    }
    /**
     * Change current working directory.
     * @param {string} path Directory to change.
     * @returns {Promise<null>}
     */

  }, {
    key: "chdir",
    value: function chdir(path) {
      return this._send(FileSystemClient.CHDIR, this._enc.encode(path)).then(function (arr) {
        return null;
      });
    }
    /**
     * Directory listing.
     * @param {string} path Directory to list. If path is empty, then list current working directory.
     * @returns {Promise<RemoteFileAttribute[]>}
     */

  }, {
    key: "listdir",
    value: function listdir() {
      var _this4 = this;

      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var result;
      if (path == null) result = this._send(FileSystemClient.LISTDIR);else result = this._send(FileSystemClient.LISTDIR, this._enc.encode(path));
      return result.then(function (arr) {
        return _this4._dec.decode(arr);
      }).then(function (str) {
        return JSON.parse(str);
      }).then(function (arr) {
        return arr.map(function (e) {
          return new RemoteFileAttribute(e);
        });
      });
      ;
    }
    /**
     * Remove file or directory.
     * @param {string} path File or directory to remove.
     * @returns {Promise<null>}
     */

  }, {
    key: "remove",
    value: function remove(path) {
      return this._send(FileSystemClient.REMOVE, this._enc.encode(path)).then(function (arr) {
        return null;
      });
    }
    /**
     * Remove directory recursively.
     * @param {string} path Directory to remove.
     * @returns {Promise<null>}
     */

  }, {
    key: "removeRecursively",
    value: function removeRecursively(path) {
      return this._send(FileSystemClient.RMDIR, this._enc.encode(path)).then(function (arr) {
        return null;
      });
    }
    /**
     * Create directory.
     * @param {string} path Directory to create.
     * @returns {Promise<null>}
     */

  }, {
    key: "mkdir",
    value: function mkdir(path) {
      return this._send(FileSystemClient.MKDIR, this._enc.encode(path)).then(function (arr) {
        return null;
      });
    }
    /**
     * Create file.
     * @param {string} path File to create.
     * @returns {Promise<null>}
     */

  }, {
    key: "createFile",
    value: function createFile(path) {
      return this._send(FileSystemClient.MKFILE, this._enc.encode(path)).then(function (arr) {
        return null;
      });
    }
    /**
     * Move file or directory.
     * @param {string} from Source path to move.
     * @param {string} to Destination path to move. 
     * @returns {Promise<null>}
     */

  }, {
    key: "move",
    value: function move(from, to) {
      return this._send(FileSystemClient.MOVE, this._enc.encode(from + "|" + to)).then(function (arr) {
        return null;
      });
    }
    /**
     * Get some attribute of file or directory, for example, is exists, is readable, etc.
     * @param {string} path Path of file.
     * @param {boolean} verbose If true, returns a verbose result. Default value is false.
     * @returns {Promise<RemoteFileAttribute>}
     */

  }, {
    key: "getFileState",
    value: function getFileState(path) {
      var _this5 = this;

      var verbose = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var mode = verbose ? FileSystemClient.FILE_STATE : FileSystemClient.FILE_STATE_SIMPLE;
      return this._send(mode, path).then(function (arr) {
        return _this5._dec.decode(arr);
      }).then(function (str) {
        return JSON.parse(str);
      }).then(function (list) {
        return new RemoteFileAttribute(list);
      });
    }
    /**
     * Open a file in server, and returns RemoteFile for operation,
     * @param {string} path File to open.
     * @param {number} mode Open mode defined in RemoteFile, OPEN_MODE_READ, OPEN_MODE_WRITE, etc.
     * @returns {Promise<RemoteFile>}
     */

  }, {
    key: "openFile",
    value: function openFile(path) {
      var _this6 = this;

      var mode = 0;

      for (var _len2 = arguments.length, modes = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        modes[_key2 - 1] = arguments[_key2];
      }

      for (var _i = 0, _modes = modes; _i < _modes.length; _i++) {
        var m = _modes[_i];
        mode |= m;
      }

      var futureId = this._send(FileSystemClient.OPEN_FILE, new Uint8Array([mode]), this._enc.encode(path)).then(function (arr) {
        return _this6._dec.decode(arr);
      });

      return futureId.then(function (id) {
        return new RemoteFile(id, _this6);
      });
    }
    /**
     * Close RemoteFile.
     * @param {RemoteFile} file File to close.
     * @returns {Promise<null>}
     */

  }, {
    key: "closeFile",
    value: function closeFile(file) {
      RemoteFile.flush(this);
      return this._send(FileSystemClient.CLOSE_FILE, this._enc.encode(file.id)).then(function (arr) {
        return null;
      });
    }
  }, {
    key: "_fileOp",
    value: function _fileOp() {
      for (var _len3 = arguments.length, payload = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        payload[_key3] = arguments[_key3];
      }

      return this.connectContext.request([new Uint8Array([FileSystemClient.FILE_OP])].concat(payload));
    }
    /**
     * Download and save files from url.
     * @param  {...{fileName:string, url:string, opt?: {method:string, body:Uint8Array | string, headers:{[key:string]: string}}}} downloadOpts 
     * @returns {Promise<Promise<{url: string,fileName: string, contentLength:number}>[]>} Response list of downloaded files.
     */

  }, {
    key: "curl",
    value: function curl() {
      var _this7 = this;

      var req = [];

      for (var _len4 = arguments.length, downloadOpts = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        downloadOpts[_key4] = arguments[_key4];
      }

      var requestNumbers = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.shortToByteArray)(downloadOpts.length);
      req.push(requestNumbers); // var i=0;

      for (var _i2 = 0, _downloadOpts = downloadOpts; _i2 < _downloadOpts.length; _i2++) {
        var _opt, _opt$body$length, _opt$body;

        var _downloadOpts$_i = _downloadOpts[_i2],
            fileName = _downloadOpts$_i.fileName,
            url = _downloadOpts$_i.url,
            opt = _downloadOpts$_i.opt;
        var fn = fileName;
        var opt = (_opt = opt) !== null && _opt !== void 0 ? _opt : (0,_utils__WEBPACK_IMPORTED_MODULE_1__.getDefaultHttpRequest)(url);

        var _buildHttpRequest = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.buildHttpRequest)(url, opt),
            _buildHttpRequest2 = _slicedToArray(_buildHttpRequest, 2),
            headers = _buildHttpRequest2[0],
            body = _buildHttpRequest2[1];

        var urlLen = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.shortToByteArray)(url.length);
        var fnLen = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.shortToByteArray)(fn.length);
        var bodyLen = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.longToByteArray)((_opt$body$length = (_opt$body = opt.body) === null || _opt$body === void 0 ? void 0 : _opt$body.length) !== null && _opt$body$length !== void 0 ? _opt$body$length : 0);
        req.push(urlLen);
        req.push(this._enc.encode(url));
        req.push(fnLen);
        req.push(this._enc.encode(fn));
        req.push(bodyLen);
        req.push(this._enc.encode(headers));
        req.push(body); // i++;
      }

      return this.connectContext.request([new Uint8Array([FileSystemClient.CURL])].concat(req)).then(function (arr) {
        var i = 0;
        var result = [];

        while (i < arr.byteLength) {
          result.push(new Promise(function (resolve, reject) {
            var payload = FileSystemClient._solveFileResult(arr.subarray(i), true);

            i += 2 + payload[1].length + 8 + payload[2].length;
            var fnLen = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.byteArrayToShort)(arr.subarray(i, i + 2));
            i += 2;
            var fileName = arr.subarray(i, i + fnLen);
            i += fnLen;
            var contentLength = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.byteArrayToLong)(arr.subarray(i, i + 8));
            i += 8;
            if (payload[0] === 0) resolve({
              url: _this7._dec.decode(payload[2]),
              fileName: _this7._dec.decode(fileName),
              contentLength: contentLength
            });else reject(payload[1]);
          }));
        }

        return result;
      });
    }
    /**
     * Fetch url and get it's headers, body, etc.
     * @param {string} url 
     * @param {{method:string, body:Uint8Array | string, headers:{[key:string]: string}}} opt Information of headers and body.
     * @returns {Promise<{httpVersion:string, statusCode:number, reasonPhrase:string, headers:{[key:string]: string}, body:Uint8Array}>}
     */

  }, {
    key: "fetch",
    value: function fetch(url) {
      var _opt$body$length2, _opt$body2;

      var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (0,_utils__WEBPACK_IMPORTED_MODULE_1__.getDefaultHttpRequest)(url);
      var req = [];
      var headers = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.buildHttpRequest)(url, opt);
      var urlLen = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.shortToByteArray)(url.length);
      var bodyLen = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.longToByteArray)((_opt$body$length2 = (_opt$body2 = opt.body) === null || _opt$body2 === void 0 ? void 0 : _opt$body2.length) !== null && _opt$body$length2 !== void 0 ? _opt$body$length2 : 0);
      return this.connectContext.request([new Uint8Array([FileSystemClient.FETCH]), urlLen, this._enc.encode(url), bodyLen, this._enc.encode(headers)]).then(function (arr) {
        var contentLength = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.byteArrayToLong)(arr.subarray(arr.byteLength - 8, arr.byteLength));

        var payload = FileSystemClient._solveFileResult(arr.subarray(contentLength));

        var responseObj = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.parseHttpResponse)(arr.subarray(0, contentLength)); // var dblCRLF = 0;
        // var [i1, i2, i3, i4] = [arr[0], arr[1], arr[2], arr[3]];
        // for(var i = 3; i<arr.byteLength; i++){
        //     i4 = arr[i];
        //     if(i1 === 13 && i2 === 10 && i3 === 13 && i4 === 10) dblCRLF = i+1;
        //     [i1, i2, i3] = [i2, i3, i4];
        // }
        // var payload = FileSystemClient._solveFileResult(arr.subarray(dblCRLF + contentLength));

        return responseObj;
      });
    }
    /**
     * Set read-only, last modified time, last access time and create time of file or directory.
     * @param {string} path 
     * @param {{readOnly?:boolean, lastModifiedTime?:number, lastAccessTime?:number, createTime?:number}} attr 
     * @returns {Promise<null>}
     */

  }, {
    key: "setAttribute",
    value: function setAttribute(path) {
      var attr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var readOnly = new Uint8Array(2);
      var toSetTime = new Uint8Array(3);
      var lastModifiedTime = new Uint8Array(8);
      var lastAccessTime = new Uint8Array(8);
      var createTime = new Uint8Array(8);

      if (attr.readOnly != null) {
        readOnly[0] = 1; // to setReadOnly

        readOnly[1] = attr.readOnly ? 1 : 0;
      }

      if (attr.lastModifiedTime != null) {
        toSetTime[0] = 1;
        lastModifiedTime = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.longToByteArray)(attr.lastModifiedTime);
      }

      if (attr.lastAccessTime != null) {
        toSetTime[1] = 1;
        lastAccessTime = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.longToByteArray)(attr.lastAccessTime);
      }

      if (attr.createTime != null) {
        toSetTime[2] = 1;
        createTime = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.longToByteArray)(attr.createTime);
      }

      return this._send(FileSystemClient.SET_ATTRIBUTE, (0,_utils__WEBPACK_IMPORTED_MODULE_1__.shortToByteArray)(path.length), this._enc.encode(path), readOnly, toSetTime, lastModifiedTime, lastAccessTime, createTime).then(function (arr) {
        return null;
      });
    }
  }, {
    key: "test",
    value: function test(path) {
      var _this8 = this;

      return this._send(0, new Uint8Array([55, 56, 57])).then(function (arr) {
        return _this8._dec.decode(arr);
      });
    }
  }], [{
    key: "_solveFileResult",
    value: function _solveFileResult(arr) {
      var suppress = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var errorCode = arr[0];
      var messageLen = arr[1];
      var message = arr.subarray(2, 2 + messageLen);
      var payloadLen = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.byteArrayToLong)(arr.subarray(2 + messageLen, 2 + messageLen + 8));
      var payload = arr.subarray(2 + messageLen + 8, 2 + messageLen + 8 + payloadLen);
      message = RemoteFile._dec.decode(message);
      if (errorCode !== 0 && !suppress) throw message;
      return [errorCode, message, payload];
    }
  }]);

  return FileSystemClient;
}();

_defineProperty(FileSystemClient, "CWD", 2);

_defineProperty(FileSystemClient, "CHDIR", 3);

_defineProperty(FileSystemClient, "LISTDIR", 4);

_defineProperty(FileSystemClient, "REMOVE", 5);

_defineProperty(FileSystemClient, "RMDIR", 6);

_defineProperty(FileSystemClient, "MKDIR", 7);

_defineProperty(FileSystemClient, "MKFILE", 8);

_defineProperty(FileSystemClient, "MOVE", 9);

_defineProperty(FileSystemClient, "OPEN_FILE", 10);

_defineProperty(FileSystemClient, "CLOSE_FILE", 11);

_defineProperty(FileSystemClient, "FILE_OP", 12);

_defineProperty(FileSystemClient, "FILE_STATE", 14);

_defineProperty(FileSystemClient, "FILE_STATE_SIMPLE", 15);

_defineProperty(FileSystemClient, "CURL", 16);

_defineProperty(FileSystemClient, "FETCH", 17);

_defineProperty(FileSystemClient, "SET_ATTRIBUTE", 18);

var RemoteFileAttribute = /*#__PURE__*/function () {
  function RemoteFileAttribute() {
    var list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    _classCallCheck(this, RemoteFileAttribute);

    _defineProperty(this, "_list", void 0);

    this._list = list.map(function (e) {
      return e == null ? null : e;
    });
  }

  _createClass(RemoteFileAttribute, [{
    key: "isExists",
    get: function get() {
      return this._list[0] === 1;
    }
  }, {
    key: "fileName",
    get: function get() {
      return this._list[1];
    }
  }, {
    key: "isDirectory",
    get: function get() {
      return this._list[2] === "d";
    }
  }, {
    key: "isRegularFile",
    get: function get() {
      return this._list[2] === "-";
    }
  }, {
    key: "isSymbolicLink",
    get: function get() {
      return this._list[2] === "l";
    }
  }, {
    key: "isReadable",
    get: function get() {
      return (this._list[3] & 4) !== 0;
    }
  }, {
    key: "isWritable",
    get: function get() {
      return (this._list[3] & 2) !== 0;
    }
  }, {
    key: "isExecutable",
    get: function get() {
      return (this._list[3] & 1) !== 0;
    }
  }, {
    key: "size",
    get: function get() {
      return this._list[4];
    }
  }, {
    key: "owner",
    get: function get() {
      return this._list[5];
    }
  }, {
    key: "isHidden",
    get: function get() {
      return this._list[6] === 1;
    }
  }, {
    key: "creationTime",
    get: function get() {
      return this._list[7];
    }
  }, {
    key: "lastAccessTime",
    get: function get() {
      return this._list[8];
    }
  }, {
    key: "lastModifiedTime",
    get: function get() {
      return this._list[9];
    }
  }, {
    key: "toString",
    value: function toString() {
      var r = '-',
          w = '-',
          x = '-';
      if (this.isReadable) r = 'r';
      if (this.isWritable) w = 'w';
      if (this.isExecutable) x = 'x';
      var result = "".concat(this._list[2]).concat(r).concat(w).concat(x);
      if (this.isExists === null || this.isExists === false) return result + "\r\nExists: false";
      result += "\r\nExists: true";
      if (this.fileName != null) result += "\r\nFile Name: ".concat(this.fileName);
      if (this.size != null) result += "\r\nSize: ".concat(this.size);
      if (this.owner != null) result += "\r\nOwner: ".concat(this.owner);
      if (this.isHidden != null) result += "\r\nHidden: ".concat(this.isHidden);
      if (this.creationTime != null) result += "\r\nCreation Time: ".concat(new Date(this.creationTime).toString());
      if (this.lastAccessTime != null) result += "\r\nLast Access Time: ".concat(new Date(this.lastAccessTime).toString());
      if (this.lastModifiedTime != null) result += "\r\nLast Modified Time: ".concat(new Date(this.lastModifiedTime).toString());
      return result;
    }
  }]);

  return RemoteFileAttribute;
}();

/***/ }),

/***/ "./src/VerifyClient.js":
/*!*****************************!*\
  !*** ./src/VerifyClient.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ConnectContext": () => (/* binding */ ConnectContext),
/* harmony export */   "VerifyClient": () => (/* binding */ VerifyClient)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./src/utils.js");
/* harmony import */ var _crypto_RSA__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./crypto/RSA */ "./src/crypto/RSA.js");
/* harmony import */ var _crypto_AesCtr__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./crypto/AesCtr */ "./src/crypto/AesCtr.js");
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }




var ConnectContext = /*#__PURE__*/function () {
  function ConnectContext() {
    _classCallCheck(this, ConnectContext);

    _defineProperty(this, "id", null);

    _defineProperty(this, "url", "");

    _defineProperty(this, "rsa", null);

    _defineProperty(this, "aesEncrypt", null);

    _defineProperty(this, "aesDecrypt", null);

    _defineProperty(this, "isSecure", false);

    _defineProperty(this, "_idBytes", null);
  }

  _createClass(ConnectContext, [{
    key: "_endEstablish",
    value: function _endEstablish() {
      var host = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
      var token = arguments.length > 1 ? arguments[1] : undefined;
      var paramObj = {};
      paramObj[VerifyClient.QUERY_NAME_TOKEN] = token;
      paramObj[VerifyClient.QUERY_NAME_SECURE] = String(this.isSecure);
      paramObj[VerifyClient.QUERY_NAME_ESTABLISH] = "false";
      var queryString = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.toQueryString)(paramObj);
      this.url = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.joinHostQuery)(host, queryString);
      this._idBytes = new TextEncoder().encode(this.id);
    }
    /**
     * 
     * @param {Uint8Array[]} bytesList List of data to send.
     * @param {boolean} copyContent Whether to copy the bytesList.
     * @returns {Promise<Uint8Array>}
     */

  }, {
    key: "request",
    value: function request(bytesList) {
      var _this = this;

      var copyContent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var id = this._idBytes.slice();

      if (this.isSecure) {
        id = this.aesEncrypt.encrypt(id, copyContent);

        for (var i = 0; i < bytesList.length; i++) {
          bytesList[i] = this.aesEncrypt.encrypt(bytesList[i], copyContent);
        }
      }

      var postBody = new Blob([new Uint8Array([id.length]), id].concat(_toConsumableArray(bytesList)));
      return fetch(this.url, {
        method: "POST",
        body: postBody,
        mode: "cors"
      }).then(function (r) {
        return r.arrayBuffer();
      }).then(function (buf) {
        return new Uint8Array(buf);
      }).then(function (arr) {
        return _this.isSecure ? _this.aesDecrypt.decrypt(arr, false) : arr;
      });
    }
  }]);

  return ConnectContext;
}();
var VerifyClient = /*#__PURE__*/function () {
  function VerifyClient() {
    _classCallCheck(this, VerifyClient);

    _defineProperty(this, "publicKeyList", []);

    _defineProperty(this, "contextMap", new Map());
  }

  _createClass(VerifyClient, [{
    key: "_splitSecureData",
    value: function _splitSecureData(bytes, n) {
      var result = {};
      var count = 0;
      var lastOffset = 0;
      var lastEqualOffset = 0;
      var decoder = new TextDecoder();

      for (var i = 1; i < bytes.length; i++) {
        if (bytes[i] == 61) {
          // "="
          lastEqualOffset = i;
        } else if (bytes[i - 1] == 13 && bytes[i] == 10) {
          // "\r\n"
          result[decoder.decode(bytes.subarray(lastOffset, lastEqualOffset))] = decoder.decode(bytes.slice(lastEqualOffset + 1, i - 1));
          count++;
          lastOffset = i + 1;
          if (count >= n) break;
        }
      }

      for (var i = lastOffset; i < bytes.length; i++) {
        if (bytes[i] == 61) {
          // "="
          lastEqualOffset = i;
          result[decoder.decode(bytes.subarray(lastOffset, lastEqualOffset))] = bytes.slice(lastEqualOffset + 1, bytes.length);
          break;
        }
      }

      return result;
    }
  }, {
    key: "_joinSecureData",
    value: function _joinSecureData(keys, vals, data) {
      // [id, pubkey]  [fdkbcds]  pubkey
      var encoder = new TextEncoder();
      var totalLen = data.length + keys[keys.length - 1].length + 1;

      for (var i = 0; i < vals.length; i++) {
        totalLen += keys[i].length + vals[i].length + 3;
      }

      var result = new Uint8Array(totalLen);
      var offset = 0;

      for (var i = 0; i < vals.length; i++) {
        var s = keys[i] + "=" + vals[i] + "\r\n";
        result.set(encoder.encode(s), offset);
        offset += s.length;
      }

      var s = keys[keys.length - 1] + "=";
      result.set(encoder.encode(s), offset);
      offset += s.length;
      result.set(data, offset);
      return result;
    }
  }, {
    key: "_checkPublicKey",
    value: function _checkPublicKey(rsa) {
      if (this.publicKeyList.length === 0) return;
      var pubkey = rsa.publicKey;
      var result = [];

      var _iterator = _createForOfIteratorHelper(this.publicKeyList),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var publicKey = _step.value;
          var ok = publicKey.length !== 0 && publicKey.length === pubkey.length;

          for (var i = 0; i < publicKey.length; i++) {
            if (pubkey[i] !== publicKey[i]) {
              ok = false;
              break;
            }
          }

          result.push(ok);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      result = result.some(function (e) {
        return e;
      });
      if (!result) throw "Public key unmatch.";
    }
    /**
     * Without security.
     * @param {string} host Host of server.
     * @param {string} token Token generated by server.
     * @returns {Promise<ConnectContext>}
     */

  }, {
    key: "establishNormalConnect",
    value: function establishNormalConnect(host, token) {
      var _this2 = this;

      var paramObj = {};
      paramObj[VerifyClient.QUERY_NAME_TOKEN] = token;
      paramObj[VerifyClient.QUERY_NAME_SECURE] = "false";
      paramObj[VerifyClient.QUERY_NAME_ESTABLISH] = "true";
      var queryString = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.toQueryString)(paramObj);
      var context = new ConnectContext();
      return fetch((0,_utils__WEBPACK_IMPORTED_MODULE_0__.joinHostQuery)(host, queryString), {
        mode: "cors"
      }).then(function (r) {
        if (r.status != 200) throw "Status code: ".concat(r.status, " ").concat(r.statusText);
        return r;
      }).then(function (r) {
        return r.arrayBuffer();
      }).then(function (buf) {
        return new Uint8Array(buf);
      }).then(function (arr) {
        var idMap = _this2._splitSecureData(arr, 1);

        context.id = idMap["id"];

        _this2.contextMap.set(context.id, context);

        context._endEstablish(host, token);

        return context;
      });
    }
    /**
     * Using rsa and aes to establish connection.
     * If required public key not in publicKeyList, the throws exception.
     * @param {string} host Host of server.
     * @param {string} token Token generated by server.
     * @returns {Promise<ConnectContext>}
     */

  }, {
    key: "establishSecureConnect",
    value: function establishSecureConnect(host, token) {
      var _this3 = this;

      var paramObj = {};
      paramObj[VerifyClient.QUERY_NAME_TOKEN] = token;
      paramObj[VerifyClient.QUERY_NAME_SECURE] = "true";
      paramObj[VerifyClient.QUERY_NAME_ESTABLISH] = "true";
      var queryString = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.toQueryString)(paramObj);
      var context = new ConnectContext();
      return fetch((0,_utils__WEBPACK_IMPORTED_MODULE_0__.joinHostQuery)(host, queryString), {
        mode: "cors"
      }).then(function (r) {
        if (r.status != 200) throw "Status code: ".concat(r.status, " ").concat(r.statusText);
        return r;
      }).then(function (r) {
        return r.arrayBuffer();
      }).then(function (buf) {
        return new Uint8Array(buf);
      }).then(function (arr) {
        return _this3._splitSecureData(arr, 1);
      }).then(function (rsaMap) {
        context.isSecure = true;
        context.id = rsaMap["id"];
        var rsa = new _crypto_RSA__WEBPACK_IMPORTED_MODULE_1__.RSA();
        rsa.publicKey = rsaMap["pubkey"]; //id=[id]\r\npubkey=

        context.rsa = rsa; //check public key is correct if necessary

        _this3._checkPublicKey(rsa);

        var aesKey = crypto.getRandomValues(new Uint8Array(32));
        var aesEncrypt = new _crypto_AesCtr__WEBPACK_IMPORTED_MODULE_2__.AesCtr(aesKey);
        var aesDecrypt = new _crypto_AesCtr__WEBPACK_IMPORTED_MODULE_2__.AesCtr(aesKey);
        context.aesEncrypt = aesEncrypt;
        context.aesDecrypt = aesDecrypt;

        _this3.contextMap.set(context.id, context);

        var encryptedAesKey = rsa.encrypt(aesKey);
        return _this3._joinSecureData(["id", "aesKey"], [context.id], encryptedAesKey);
      }).then(function (key) {
        return fetch((0,_utils__WEBPACK_IMPORTED_MODULE_0__.joinHostQuery)(host, queryString), {
          method: "POST",
          body: new Blob([key.buffer])
        });
      }).then(function (r) {
        return r.arrayBuffer();
      }).then(function (buf) {
        return new Uint8Array(buf);
      }).then(function (arr) {
        return context.aesDecrypt.decrypt(arr);
      }).then(function (arr) {
        return _this3._splitSecureData(arr, 2);
      }).then(function (newIdMap) {
        _this3.contextMap["delete"](newIdMap["id"]);

        context.id = newIdMap["newid"];

        _this3.contextMap.set(newIdMap["newid"], context);

        context._endEstablish(host, token);

        return context;
      });
    }
  }]);

  return VerifyClient;
}();

_defineProperty(VerifyClient, "QUERY_NAME_TOKEN", "token");

_defineProperty(VerifyClient, "QUERY_NAME_SECURE", "secure");

_defineProperty(VerifyClient, "QUERY_NAME_ESTABLISH", "establish");

/***/ }),

/***/ "./src/crypto/AesCtr.js":
/*!******************************!*\
  !*** ./src/crypto/AesCtr.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AesCtr": () => (/* binding */ AesCtr)
/* harmony export */ });
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// Number of rounds by keysize
function numberOfRounds(n) {
  return (n >> 2) + 6;
} // Round constant words


var rcon = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c, 0xd8, 0xab, 0x4d, 0x9a, 0x2f, 0x5e, 0xbc, 0x63, 0xc6, 0x97, 0x35, 0x6a, 0xd4, 0xb3, 0x7d, 0xfa, 0xef, 0xc5, 0x91]; // S-box and Inverse S-box (S is for Substitution)

var S = [0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76, 0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0, 0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15, 0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75, 0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84, 0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf, 0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8, 0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2, 0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73, 0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb, 0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79, 0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08, 0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a, 0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e, 0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf, 0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16]; // Transformations for encryption

var T1 = [0xc66363a5, 0xf87c7c84, 0xee777799, 0xf67b7b8d, 0xfff2f20d, 0xd66b6bbd, 0xde6f6fb1, 0x91c5c554, 0x60303050, 0x02010103, 0xce6767a9, 0x562b2b7d, 0xe7fefe19, 0xb5d7d762, 0x4dababe6, 0xec76769a, 0x8fcaca45, 0x1f82829d, 0x89c9c940, 0xfa7d7d87, 0xeffafa15, 0xb25959eb, 0x8e4747c9, 0xfbf0f00b, 0x41adadec, 0xb3d4d467, 0x5fa2a2fd, 0x45afafea, 0x239c9cbf, 0x53a4a4f7, 0xe4727296, 0x9bc0c05b, 0x75b7b7c2, 0xe1fdfd1c, 0x3d9393ae, 0x4c26266a, 0x6c36365a, 0x7e3f3f41, 0xf5f7f702, 0x83cccc4f, 0x6834345c, 0x51a5a5f4, 0xd1e5e534, 0xf9f1f108, 0xe2717193, 0xabd8d873, 0x62313153, 0x2a15153f, 0x0804040c, 0x95c7c752, 0x46232365, 0x9dc3c35e, 0x30181828, 0x379696a1, 0x0a05050f, 0x2f9a9ab5, 0x0e070709, 0x24121236, 0x1b80809b, 0xdfe2e23d, 0xcdebeb26, 0x4e272769, 0x7fb2b2cd, 0xea75759f, 0x1209091b, 0x1d83839e, 0x582c2c74, 0x341a1a2e, 0x361b1b2d, 0xdc6e6eb2, 0xb45a5aee, 0x5ba0a0fb, 0xa45252f6, 0x763b3b4d, 0xb7d6d661, 0x7db3b3ce, 0x5229297b, 0xdde3e33e, 0x5e2f2f71, 0x13848497, 0xa65353f5, 0xb9d1d168, 0x00000000, 0xc1eded2c, 0x40202060, 0xe3fcfc1f, 0x79b1b1c8, 0xb65b5bed, 0xd46a6abe, 0x8dcbcb46, 0x67bebed9, 0x7239394b, 0x944a4ade, 0x984c4cd4, 0xb05858e8, 0x85cfcf4a, 0xbbd0d06b, 0xc5efef2a, 0x4faaaae5, 0xedfbfb16, 0x864343c5, 0x9a4d4dd7, 0x66333355, 0x11858594, 0x8a4545cf, 0xe9f9f910, 0x04020206, 0xfe7f7f81, 0xa05050f0, 0x783c3c44, 0x259f9fba, 0x4ba8a8e3, 0xa25151f3, 0x5da3a3fe, 0x804040c0, 0x058f8f8a, 0x3f9292ad, 0x219d9dbc, 0x70383848, 0xf1f5f504, 0x63bcbcdf, 0x77b6b6c1, 0xafdada75, 0x42212163, 0x20101030, 0xe5ffff1a, 0xfdf3f30e, 0xbfd2d26d, 0x81cdcd4c, 0x180c0c14, 0x26131335, 0xc3ecec2f, 0xbe5f5fe1, 0x359797a2, 0x884444cc, 0x2e171739, 0x93c4c457, 0x55a7a7f2, 0xfc7e7e82, 0x7a3d3d47, 0xc86464ac, 0xba5d5de7, 0x3219192b, 0xe6737395, 0xc06060a0, 0x19818198, 0x9e4f4fd1, 0xa3dcdc7f, 0x44222266, 0x542a2a7e, 0x3b9090ab, 0x0b888883, 0x8c4646ca, 0xc7eeee29, 0x6bb8b8d3, 0x2814143c, 0xa7dede79, 0xbc5e5ee2, 0x160b0b1d, 0xaddbdb76, 0xdbe0e03b, 0x64323256, 0x743a3a4e, 0x140a0a1e, 0x924949db, 0x0c06060a, 0x4824246c, 0xb85c5ce4, 0x9fc2c25d, 0xbdd3d36e, 0x43acacef, 0xc46262a6, 0x399191a8, 0x319595a4, 0xd3e4e437, 0xf279798b, 0xd5e7e732, 0x8bc8c843, 0x6e373759, 0xda6d6db7, 0x018d8d8c, 0xb1d5d564, 0x9c4e4ed2, 0x49a9a9e0, 0xd86c6cb4, 0xac5656fa, 0xf3f4f407, 0xcfeaea25, 0xca6565af, 0xf47a7a8e, 0x47aeaee9, 0x10080818, 0x6fbabad5, 0xf0787888, 0x4a25256f, 0x5c2e2e72, 0x381c1c24, 0x57a6a6f1, 0x73b4b4c7, 0x97c6c651, 0xcbe8e823, 0xa1dddd7c, 0xe874749c, 0x3e1f1f21, 0x964b4bdd, 0x61bdbddc, 0x0d8b8b86, 0x0f8a8a85, 0xe0707090, 0x7c3e3e42, 0x71b5b5c4, 0xcc6666aa, 0x904848d8, 0x06030305, 0xf7f6f601, 0x1c0e0e12, 0xc26161a3, 0x6a35355f, 0xae5757f9, 0x69b9b9d0, 0x17868691, 0x99c1c158, 0x3a1d1d27, 0x279e9eb9, 0xd9e1e138, 0xebf8f813, 0x2b9898b3, 0x22111133, 0xd26969bb, 0xa9d9d970, 0x078e8e89, 0x339494a7, 0x2d9b9bb6, 0x3c1e1e22, 0x15878792, 0xc9e9e920, 0x87cece49, 0xaa5555ff, 0x50282878, 0xa5dfdf7a, 0x038c8c8f, 0x59a1a1f8, 0x09898980, 0x1a0d0d17, 0x65bfbfda, 0xd7e6e631, 0x844242c6, 0xd06868b8, 0x824141c3, 0x299999b0, 0x5a2d2d77, 0x1e0f0f11, 0x7bb0b0cb, 0xa85454fc, 0x6dbbbbd6, 0x2c16163a];
var T2 = [0xa5c66363, 0x84f87c7c, 0x99ee7777, 0x8df67b7b, 0x0dfff2f2, 0xbdd66b6b, 0xb1de6f6f, 0x5491c5c5, 0x50603030, 0x03020101, 0xa9ce6767, 0x7d562b2b, 0x19e7fefe, 0x62b5d7d7, 0xe64dabab, 0x9aec7676, 0x458fcaca, 0x9d1f8282, 0x4089c9c9, 0x87fa7d7d, 0x15effafa, 0xebb25959, 0xc98e4747, 0x0bfbf0f0, 0xec41adad, 0x67b3d4d4, 0xfd5fa2a2, 0xea45afaf, 0xbf239c9c, 0xf753a4a4, 0x96e47272, 0x5b9bc0c0, 0xc275b7b7, 0x1ce1fdfd, 0xae3d9393, 0x6a4c2626, 0x5a6c3636, 0x417e3f3f, 0x02f5f7f7, 0x4f83cccc, 0x5c683434, 0xf451a5a5, 0x34d1e5e5, 0x08f9f1f1, 0x93e27171, 0x73abd8d8, 0x53623131, 0x3f2a1515, 0x0c080404, 0x5295c7c7, 0x65462323, 0x5e9dc3c3, 0x28301818, 0xa1379696, 0x0f0a0505, 0xb52f9a9a, 0x090e0707, 0x36241212, 0x9b1b8080, 0x3ddfe2e2, 0x26cdebeb, 0x694e2727, 0xcd7fb2b2, 0x9fea7575, 0x1b120909, 0x9e1d8383, 0x74582c2c, 0x2e341a1a, 0x2d361b1b, 0xb2dc6e6e, 0xeeb45a5a, 0xfb5ba0a0, 0xf6a45252, 0x4d763b3b, 0x61b7d6d6, 0xce7db3b3, 0x7b522929, 0x3edde3e3, 0x715e2f2f, 0x97138484, 0xf5a65353, 0x68b9d1d1, 0x00000000, 0x2cc1eded, 0x60402020, 0x1fe3fcfc, 0xc879b1b1, 0xedb65b5b, 0xbed46a6a, 0x468dcbcb, 0xd967bebe, 0x4b723939, 0xde944a4a, 0xd4984c4c, 0xe8b05858, 0x4a85cfcf, 0x6bbbd0d0, 0x2ac5efef, 0xe54faaaa, 0x16edfbfb, 0xc5864343, 0xd79a4d4d, 0x55663333, 0x94118585, 0xcf8a4545, 0x10e9f9f9, 0x06040202, 0x81fe7f7f, 0xf0a05050, 0x44783c3c, 0xba259f9f, 0xe34ba8a8, 0xf3a25151, 0xfe5da3a3, 0xc0804040, 0x8a058f8f, 0xad3f9292, 0xbc219d9d, 0x48703838, 0x04f1f5f5, 0xdf63bcbc, 0xc177b6b6, 0x75afdada, 0x63422121, 0x30201010, 0x1ae5ffff, 0x0efdf3f3, 0x6dbfd2d2, 0x4c81cdcd, 0x14180c0c, 0x35261313, 0x2fc3ecec, 0xe1be5f5f, 0xa2359797, 0xcc884444, 0x392e1717, 0x5793c4c4, 0xf255a7a7, 0x82fc7e7e, 0x477a3d3d, 0xacc86464, 0xe7ba5d5d, 0x2b321919, 0x95e67373, 0xa0c06060, 0x98198181, 0xd19e4f4f, 0x7fa3dcdc, 0x66442222, 0x7e542a2a, 0xab3b9090, 0x830b8888, 0xca8c4646, 0x29c7eeee, 0xd36bb8b8, 0x3c281414, 0x79a7dede, 0xe2bc5e5e, 0x1d160b0b, 0x76addbdb, 0x3bdbe0e0, 0x56643232, 0x4e743a3a, 0x1e140a0a, 0xdb924949, 0x0a0c0606, 0x6c482424, 0xe4b85c5c, 0x5d9fc2c2, 0x6ebdd3d3, 0xef43acac, 0xa6c46262, 0xa8399191, 0xa4319595, 0x37d3e4e4, 0x8bf27979, 0x32d5e7e7, 0x438bc8c8, 0x596e3737, 0xb7da6d6d, 0x8c018d8d, 0x64b1d5d5, 0xd29c4e4e, 0xe049a9a9, 0xb4d86c6c, 0xfaac5656, 0x07f3f4f4, 0x25cfeaea, 0xafca6565, 0x8ef47a7a, 0xe947aeae, 0x18100808, 0xd56fbaba, 0x88f07878, 0x6f4a2525, 0x725c2e2e, 0x24381c1c, 0xf157a6a6, 0xc773b4b4, 0x5197c6c6, 0x23cbe8e8, 0x7ca1dddd, 0x9ce87474, 0x213e1f1f, 0xdd964b4b, 0xdc61bdbd, 0x860d8b8b, 0x850f8a8a, 0x90e07070, 0x427c3e3e, 0xc471b5b5, 0xaacc6666, 0xd8904848, 0x05060303, 0x01f7f6f6, 0x121c0e0e, 0xa3c26161, 0x5f6a3535, 0xf9ae5757, 0xd069b9b9, 0x91178686, 0x5899c1c1, 0x273a1d1d, 0xb9279e9e, 0x38d9e1e1, 0x13ebf8f8, 0xb32b9898, 0x33221111, 0xbbd26969, 0x70a9d9d9, 0x89078e8e, 0xa7339494, 0xb62d9b9b, 0x223c1e1e, 0x92158787, 0x20c9e9e9, 0x4987cece, 0xffaa5555, 0x78502828, 0x7aa5dfdf, 0x8f038c8c, 0xf859a1a1, 0x80098989, 0x171a0d0d, 0xda65bfbf, 0x31d7e6e6, 0xc6844242, 0xb8d06868, 0xc3824141, 0xb0299999, 0x775a2d2d, 0x111e0f0f, 0xcb7bb0b0, 0xfca85454, 0xd66dbbbb, 0x3a2c1616];
var T3 = [0x63a5c663, 0x7c84f87c, 0x7799ee77, 0x7b8df67b, 0xf20dfff2, 0x6bbdd66b, 0x6fb1de6f, 0xc55491c5, 0x30506030, 0x01030201, 0x67a9ce67, 0x2b7d562b, 0xfe19e7fe, 0xd762b5d7, 0xabe64dab, 0x769aec76, 0xca458fca, 0x829d1f82, 0xc94089c9, 0x7d87fa7d, 0xfa15effa, 0x59ebb259, 0x47c98e47, 0xf00bfbf0, 0xadec41ad, 0xd467b3d4, 0xa2fd5fa2, 0xafea45af, 0x9cbf239c, 0xa4f753a4, 0x7296e472, 0xc05b9bc0, 0xb7c275b7, 0xfd1ce1fd, 0x93ae3d93, 0x266a4c26, 0x365a6c36, 0x3f417e3f, 0xf702f5f7, 0xcc4f83cc, 0x345c6834, 0xa5f451a5, 0xe534d1e5, 0xf108f9f1, 0x7193e271, 0xd873abd8, 0x31536231, 0x153f2a15, 0x040c0804, 0xc75295c7, 0x23654623, 0xc35e9dc3, 0x18283018, 0x96a13796, 0x050f0a05, 0x9ab52f9a, 0x07090e07, 0x12362412, 0x809b1b80, 0xe23ddfe2, 0xeb26cdeb, 0x27694e27, 0xb2cd7fb2, 0x759fea75, 0x091b1209, 0x839e1d83, 0x2c74582c, 0x1a2e341a, 0x1b2d361b, 0x6eb2dc6e, 0x5aeeb45a, 0xa0fb5ba0, 0x52f6a452, 0x3b4d763b, 0xd661b7d6, 0xb3ce7db3, 0x297b5229, 0xe33edde3, 0x2f715e2f, 0x84971384, 0x53f5a653, 0xd168b9d1, 0x00000000, 0xed2cc1ed, 0x20604020, 0xfc1fe3fc, 0xb1c879b1, 0x5bedb65b, 0x6abed46a, 0xcb468dcb, 0xbed967be, 0x394b7239, 0x4ade944a, 0x4cd4984c, 0x58e8b058, 0xcf4a85cf, 0xd06bbbd0, 0xef2ac5ef, 0xaae54faa, 0xfb16edfb, 0x43c58643, 0x4dd79a4d, 0x33556633, 0x85941185, 0x45cf8a45, 0xf910e9f9, 0x02060402, 0x7f81fe7f, 0x50f0a050, 0x3c44783c, 0x9fba259f, 0xa8e34ba8, 0x51f3a251, 0xa3fe5da3, 0x40c08040, 0x8f8a058f, 0x92ad3f92, 0x9dbc219d, 0x38487038, 0xf504f1f5, 0xbcdf63bc, 0xb6c177b6, 0xda75afda, 0x21634221, 0x10302010, 0xff1ae5ff, 0xf30efdf3, 0xd26dbfd2, 0xcd4c81cd, 0x0c14180c, 0x13352613, 0xec2fc3ec, 0x5fe1be5f, 0x97a23597, 0x44cc8844, 0x17392e17, 0xc45793c4, 0xa7f255a7, 0x7e82fc7e, 0x3d477a3d, 0x64acc864, 0x5de7ba5d, 0x192b3219, 0x7395e673, 0x60a0c060, 0x81981981, 0x4fd19e4f, 0xdc7fa3dc, 0x22664422, 0x2a7e542a, 0x90ab3b90, 0x88830b88, 0x46ca8c46, 0xee29c7ee, 0xb8d36bb8, 0x143c2814, 0xde79a7de, 0x5ee2bc5e, 0x0b1d160b, 0xdb76addb, 0xe03bdbe0, 0x32566432, 0x3a4e743a, 0x0a1e140a, 0x49db9249, 0x060a0c06, 0x246c4824, 0x5ce4b85c, 0xc25d9fc2, 0xd36ebdd3, 0xacef43ac, 0x62a6c462, 0x91a83991, 0x95a43195, 0xe437d3e4, 0x798bf279, 0xe732d5e7, 0xc8438bc8, 0x37596e37, 0x6db7da6d, 0x8d8c018d, 0xd564b1d5, 0x4ed29c4e, 0xa9e049a9, 0x6cb4d86c, 0x56faac56, 0xf407f3f4, 0xea25cfea, 0x65afca65, 0x7a8ef47a, 0xaee947ae, 0x08181008, 0xbad56fba, 0x7888f078, 0x256f4a25, 0x2e725c2e, 0x1c24381c, 0xa6f157a6, 0xb4c773b4, 0xc65197c6, 0xe823cbe8, 0xdd7ca1dd, 0x749ce874, 0x1f213e1f, 0x4bdd964b, 0xbddc61bd, 0x8b860d8b, 0x8a850f8a, 0x7090e070, 0x3e427c3e, 0xb5c471b5, 0x66aacc66, 0x48d89048, 0x03050603, 0xf601f7f6, 0x0e121c0e, 0x61a3c261, 0x355f6a35, 0x57f9ae57, 0xb9d069b9, 0x86911786, 0xc15899c1, 0x1d273a1d, 0x9eb9279e, 0xe138d9e1, 0xf813ebf8, 0x98b32b98, 0x11332211, 0x69bbd269, 0xd970a9d9, 0x8e89078e, 0x94a73394, 0x9bb62d9b, 0x1e223c1e, 0x87921587, 0xe920c9e9, 0xce4987ce, 0x55ffaa55, 0x28785028, 0xdf7aa5df, 0x8c8f038c, 0xa1f859a1, 0x89800989, 0x0d171a0d, 0xbfda65bf, 0xe631d7e6, 0x42c68442, 0x68b8d068, 0x41c38241, 0x99b02999, 0x2d775a2d, 0x0f111e0f, 0xb0cb7bb0, 0x54fca854, 0xbbd66dbb, 0x163a2c16];
var T4 = [0x6363a5c6, 0x7c7c84f8, 0x777799ee, 0x7b7b8df6, 0xf2f20dff, 0x6b6bbdd6, 0x6f6fb1de, 0xc5c55491, 0x30305060, 0x01010302, 0x6767a9ce, 0x2b2b7d56, 0xfefe19e7, 0xd7d762b5, 0xababe64d, 0x76769aec, 0xcaca458f, 0x82829d1f, 0xc9c94089, 0x7d7d87fa, 0xfafa15ef, 0x5959ebb2, 0x4747c98e, 0xf0f00bfb, 0xadadec41, 0xd4d467b3, 0xa2a2fd5f, 0xafafea45, 0x9c9cbf23, 0xa4a4f753, 0x727296e4, 0xc0c05b9b, 0xb7b7c275, 0xfdfd1ce1, 0x9393ae3d, 0x26266a4c, 0x36365a6c, 0x3f3f417e, 0xf7f702f5, 0xcccc4f83, 0x34345c68, 0xa5a5f451, 0xe5e534d1, 0xf1f108f9, 0x717193e2, 0xd8d873ab, 0x31315362, 0x15153f2a, 0x04040c08, 0xc7c75295, 0x23236546, 0xc3c35e9d, 0x18182830, 0x9696a137, 0x05050f0a, 0x9a9ab52f, 0x0707090e, 0x12123624, 0x80809b1b, 0xe2e23ddf, 0xebeb26cd, 0x2727694e, 0xb2b2cd7f, 0x75759fea, 0x09091b12, 0x83839e1d, 0x2c2c7458, 0x1a1a2e34, 0x1b1b2d36, 0x6e6eb2dc, 0x5a5aeeb4, 0xa0a0fb5b, 0x5252f6a4, 0x3b3b4d76, 0xd6d661b7, 0xb3b3ce7d, 0x29297b52, 0xe3e33edd, 0x2f2f715e, 0x84849713, 0x5353f5a6, 0xd1d168b9, 0x00000000, 0xeded2cc1, 0x20206040, 0xfcfc1fe3, 0xb1b1c879, 0x5b5bedb6, 0x6a6abed4, 0xcbcb468d, 0xbebed967, 0x39394b72, 0x4a4ade94, 0x4c4cd498, 0x5858e8b0, 0xcfcf4a85, 0xd0d06bbb, 0xefef2ac5, 0xaaaae54f, 0xfbfb16ed, 0x4343c586, 0x4d4dd79a, 0x33335566, 0x85859411, 0x4545cf8a, 0xf9f910e9, 0x02020604, 0x7f7f81fe, 0x5050f0a0, 0x3c3c4478, 0x9f9fba25, 0xa8a8e34b, 0x5151f3a2, 0xa3a3fe5d, 0x4040c080, 0x8f8f8a05, 0x9292ad3f, 0x9d9dbc21, 0x38384870, 0xf5f504f1, 0xbcbcdf63, 0xb6b6c177, 0xdada75af, 0x21216342, 0x10103020, 0xffff1ae5, 0xf3f30efd, 0xd2d26dbf, 0xcdcd4c81, 0x0c0c1418, 0x13133526, 0xecec2fc3, 0x5f5fe1be, 0x9797a235, 0x4444cc88, 0x1717392e, 0xc4c45793, 0xa7a7f255, 0x7e7e82fc, 0x3d3d477a, 0x6464acc8, 0x5d5de7ba, 0x19192b32, 0x737395e6, 0x6060a0c0, 0x81819819, 0x4f4fd19e, 0xdcdc7fa3, 0x22226644, 0x2a2a7e54, 0x9090ab3b, 0x8888830b, 0x4646ca8c, 0xeeee29c7, 0xb8b8d36b, 0x14143c28, 0xdede79a7, 0x5e5ee2bc, 0x0b0b1d16, 0xdbdb76ad, 0xe0e03bdb, 0x32325664, 0x3a3a4e74, 0x0a0a1e14, 0x4949db92, 0x06060a0c, 0x24246c48, 0x5c5ce4b8, 0xc2c25d9f, 0xd3d36ebd, 0xacacef43, 0x6262a6c4, 0x9191a839, 0x9595a431, 0xe4e437d3, 0x79798bf2, 0xe7e732d5, 0xc8c8438b, 0x3737596e, 0x6d6db7da, 0x8d8d8c01, 0xd5d564b1, 0x4e4ed29c, 0xa9a9e049, 0x6c6cb4d8, 0x5656faac, 0xf4f407f3, 0xeaea25cf, 0x6565afca, 0x7a7a8ef4, 0xaeaee947, 0x08081810, 0xbabad56f, 0x787888f0, 0x25256f4a, 0x2e2e725c, 0x1c1c2438, 0xa6a6f157, 0xb4b4c773, 0xc6c65197, 0xe8e823cb, 0xdddd7ca1, 0x74749ce8, 0x1f1f213e, 0x4b4bdd96, 0xbdbddc61, 0x8b8b860d, 0x8a8a850f, 0x707090e0, 0x3e3e427c, 0xb5b5c471, 0x6666aacc, 0x4848d890, 0x03030506, 0xf6f601f7, 0x0e0e121c, 0x6161a3c2, 0x35355f6a, 0x5757f9ae, 0xb9b9d069, 0x86869117, 0xc1c15899, 0x1d1d273a, 0x9e9eb927, 0xe1e138d9, 0xf8f813eb, 0x9898b32b, 0x11113322, 0x6969bbd2, 0xd9d970a9, 0x8e8e8907, 0x9494a733, 0x9b9bb62d, 0x1e1e223c, 0x87879215, 0xe9e920c9, 0xcece4987, 0x5555ffaa, 0x28287850, 0xdfdf7aa5, 0x8c8c8f03, 0xa1a1f859, 0x89898009, 0x0d0d171a, 0xbfbfda65, 0xe6e631d7, 0x4242c684, 0x6868b8d0, 0x4141c382, 0x9999b029, 0x2d2d775a, 0x0f0f111e, 0xb0b0cb7b, 0x5454fca8, 0xbbbbd66d, 0x16163a2c]; // Transformations for decryption
// Transformations for decryption key expansion

var U1 = [0x00000000, 0x0e090d0b, 0x1c121a16, 0x121b171d, 0x3824342c, 0x362d3927, 0x24362e3a, 0x2a3f2331, 0x70486858, 0x7e416553, 0x6c5a724e, 0x62537f45, 0x486c5c74, 0x4665517f, 0x547e4662, 0x5a774b69, 0xe090d0b0, 0xee99ddbb, 0xfc82caa6, 0xf28bc7ad, 0xd8b4e49c, 0xd6bde997, 0xc4a6fe8a, 0xcaaff381, 0x90d8b8e8, 0x9ed1b5e3, 0x8ccaa2fe, 0x82c3aff5, 0xa8fc8cc4, 0xa6f581cf, 0xb4ee96d2, 0xbae79bd9, 0xdb3bbb7b, 0xd532b670, 0xc729a16d, 0xc920ac66, 0xe31f8f57, 0xed16825c, 0xff0d9541, 0xf104984a, 0xab73d323, 0xa57ade28, 0xb761c935, 0xb968c43e, 0x9357e70f, 0x9d5eea04, 0x8f45fd19, 0x814cf012, 0x3bab6bcb, 0x35a266c0, 0x27b971dd, 0x29b07cd6, 0x038f5fe7, 0x0d8652ec, 0x1f9d45f1, 0x119448fa, 0x4be30393, 0x45ea0e98, 0x57f11985, 0x59f8148e, 0x73c737bf, 0x7dce3ab4, 0x6fd52da9, 0x61dc20a2, 0xad766df6, 0xa37f60fd, 0xb16477e0, 0xbf6d7aeb, 0x955259da, 0x9b5b54d1, 0x894043cc, 0x87494ec7, 0xdd3e05ae, 0xd33708a5, 0xc12c1fb8, 0xcf2512b3, 0xe51a3182, 0xeb133c89, 0xf9082b94, 0xf701269f, 0x4de6bd46, 0x43efb04d, 0x51f4a750, 0x5ffdaa5b, 0x75c2896a, 0x7bcb8461, 0x69d0937c, 0x67d99e77, 0x3daed51e, 0x33a7d815, 0x21bccf08, 0x2fb5c203, 0x058ae132, 0x0b83ec39, 0x1998fb24, 0x1791f62f, 0x764dd68d, 0x7844db86, 0x6a5fcc9b, 0x6456c190, 0x4e69e2a1, 0x4060efaa, 0x527bf8b7, 0x5c72f5bc, 0x0605bed5, 0x080cb3de, 0x1a17a4c3, 0x141ea9c8, 0x3e218af9, 0x302887f2, 0x223390ef, 0x2c3a9de4, 0x96dd063d, 0x98d40b36, 0x8acf1c2b, 0x84c61120, 0xaef93211, 0xa0f03f1a, 0xb2eb2807, 0xbce2250c, 0xe6956e65, 0xe89c636e, 0xfa877473, 0xf48e7978, 0xdeb15a49, 0xd0b85742, 0xc2a3405f, 0xccaa4d54, 0x41ecdaf7, 0x4fe5d7fc, 0x5dfec0e1, 0x53f7cdea, 0x79c8eedb, 0x77c1e3d0, 0x65daf4cd, 0x6bd3f9c6, 0x31a4b2af, 0x3fadbfa4, 0x2db6a8b9, 0x23bfa5b2, 0x09808683, 0x07898b88, 0x15929c95, 0x1b9b919e, 0xa17c0a47, 0xaf75074c, 0xbd6e1051, 0xb3671d5a, 0x99583e6b, 0x97513360, 0x854a247d, 0x8b432976, 0xd134621f, 0xdf3d6f14, 0xcd267809, 0xc32f7502, 0xe9105633, 0xe7195b38, 0xf5024c25, 0xfb0b412e, 0x9ad7618c, 0x94de6c87, 0x86c57b9a, 0x88cc7691, 0xa2f355a0, 0xacfa58ab, 0xbee14fb6, 0xb0e842bd, 0xea9f09d4, 0xe49604df, 0xf68d13c2, 0xf8841ec9, 0xd2bb3df8, 0xdcb230f3, 0xcea927ee, 0xc0a02ae5, 0x7a47b13c, 0x744ebc37, 0x6655ab2a, 0x685ca621, 0x42638510, 0x4c6a881b, 0x5e719f06, 0x5078920d, 0x0a0fd964, 0x0406d46f, 0x161dc372, 0x1814ce79, 0x322bed48, 0x3c22e043, 0x2e39f75e, 0x2030fa55, 0xec9ab701, 0xe293ba0a, 0xf088ad17, 0xfe81a01c, 0xd4be832d, 0xdab78e26, 0xc8ac993b, 0xc6a59430, 0x9cd2df59, 0x92dbd252, 0x80c0c54f, 0x8ec9c844, 0xa4f6eb75, 0xaaffe67e, 0xb8e4f163, 0xb6edfc68, 0x0c0a67b1, 0x02036aba, 0x10187da7, 0x1e1170ac, 0x342e539d, 0x3a275e96, 0x283c498b, 0x26354480, 0x7c420fe9, 0x724b02e2, 0x605015ff, 0x6e5918f4, 0x44663bc5, 0x4a6f36ce, 0x587421d3, 0x567d2cd8, 0x37a10c7a, 0x39a80171, 0x2bb3166c, 0x25ba1b67, 0x0f853856, 0x018c355d, 0x13972240, 0x1d9e2f4b, 0x47e96422, 0x49e06929, 0x5bfb7e34, 0x55f2733f, 0x7fcd500e, 0x71c45d05, 0x63df4a18, 0x6dd64713, 0xd731dcca, 0xd938d1c1, 0xcb23c6dc, 0xc52acbd7, 0xef15e8e6, 0xe11ce5ed, 0xf307f2f0, 0xfd0efffb, 0xa779b492, 0xa970b999, 0xbb6bae84, 0xb562a38f, 0x9f5d80be, 0x91548db5, 0x834f9aa8, 0x8d4697a3];
var U2 = [0x00000000, 0x0b0e090d, 0x161c121a, 0x1d121b17, 0x2c382434, 0x27362d39, 0x3a24362e, 0x312a3f23, 0x58704868, 0x537e4165, 0x4e6c5a72, 0x4562537f, 0x74486c5c, 0x7f466551, 0x62547e46, 0x695a774b, 0xb0e090d0, 0xbbee99dd, 0xa6fc82ca, 0xadf28bc7, 0x9cd8b4e4, 0x97d6bde9, 0x8ac4a6fe, 0x81caaff3, 0xe890d8b8, 0xe39ed1b5, 0xfe8ccaa2, 0xf582c3af, 0xc4a8fc8c, 0xcfa6f581, 0xd2b4ee96, 0xd9bae79b, 0x7bdb3bbb, 0x70d532b6, 0x6dc729a1, 0x66c920ac, 0x57e31f8f, 0x5ced1682, 0x41ff0d95, 0x4af10498, 0x23ab73d3, 0x28a57ade, 0x35b761c9, 0x3eb968c4, 0x0f9357e7, 0x049d5eea, 0x198f45fd, 0x12814cf0, 0xcb3bab6b, 0xc035a266, 0xdd27b971, 0xd629b07c, 0xe7038f5f, 0xec0d8652, 0xf11f9d45, 0xfa119448, 0x934be303, 0x9845ea0e, 0x8557f119, 0x8e59f814, 0xbf73c737, 0xb47dce3a, 0xa96fd52d, 0xa261dc20, 0xf6ad766d, 0xfda37f60, 0xe0b16477, 0xebbf6d7a, 0xda955259, 0xd19b5b54, 0xcc894043, 0xc787494e, 0xaedd3e05, 0xa5d33708, 0xb8c12c1f, 0xb3cf2512, 0x82e51a31, 0x89eb133c, 0x94f9082b, 0x9ff70126, 0x464de6bd, 0x4d43efb0, 0x5051f4a7, 0x5b5ffdaa, 0x6a75c289, 0x617bcb84, 0x7c69d093, 0x7767d99e, 0x1e3daed5, 0x1533a7d8, 0x0821bccf, 0x032fb5c2, 0x32058ae1, 0x390b83ec, 0x241998fb, 0x2f1791f6, 0x8d764dd6, 0x867844db, 0x9b6a5fcc, 0x906456c1, 0xa14e69e2, 0xaa4060ef, 0xb7527bf8, 0xbc5c72f5, 0xd50605be, 0xde080cb3, 0xc31a17a4, 0xc8141ea9, 0xf93e218a, 0xf2302887, 0xef223390, 0xe42c3a9d, 0x3d96dd06, 0x3698d40b, 0x2b8acf1c, 0x2084c611, 0x11aef932, 0x1aa0f03f, 0x07b2eb28, 0x0cbce225, 0x65e6956e, 0x6ee89c63, 0x73fa8774, 0x78f48e79, 0x49deb15a, 0x42d0b857, 0x5fc2a340, 0x54ccaa4d, 0xf741ecda, 0xfc4fe5d7, 0xe15dfec0, 0xea53f7cd, 0xdb79c8ee, 0xd077c1e3, 0xcd65daf4, 0xc66bd3f9, 0xaf31a4b2, 0xa43fadbf, 0xb92db6a8, 0xb223bfa5, 0x83098086, 0x8807898b, 0x9515929c, 0x9e1b9b91, 0x47a17c0a, 0x4caf7507, 0x51bd6e10, 0x5ab3671d, 0x6b99583e, 0x60975133, 0x7d854a24, 0x768b4329, 0x1fd13462, 0x14df3d6f, 0x09cd2678, 0x02c32f75, 0x33e91056, 0x38e7195b, 0x25f5024c, 0x2efb0b41, 0x8c9ad761, 0x8794de6c, 0x9a86c57b, 0x9188cc76, 0xa0a2f355, 0xabacfa58, 0xb6bee14f, 0xbdb0e842, 0xd4ea9f09, 0xdfe49604, 0xc2f68d13, 0xc9f8841e, 0xf8d2bb3d, 0xf3dcb230, 0xeecea927, 0xe5c0a02a, 0x3c7a47b1, 0x37744ebc, 0x2a6655ab, 0x21685ca6, 0x10426385, 0x1b4c6a88, 0x065e719f, 0x0d507892, 0x640a0fd9, 0x6f0406d4, 0x72161dc3, 0x791814ce, 0x48322bed, 0x433c22e0, 0x5e2e39f7, 0x552030fa, 0x01ec9ab7, 0x0ae293ba, 0x17f088ad, 0x1cfe81a0, 0x2dd4be83, 0x26dab78e, 0x3bc8ac99, 0x30c6a594, 0x599cd2df, 0x5292dbd2, 0x4f80c0c5, 0x448ec9c8, 0x75a4f6eb, 0x7eaaffe6, 0x63b8e4f1, 0x68b6edfc, 0xb10c0a67, 0xba02036a, 0xa710187d, 0xac1e1170, 0x9d342e53, 0x963a275e, 0x8b283c49, 0x80263544, 0xe97c420f, 0xe2724b02, 0xff605015, 0xf46e5918, 0xc544663b, 0xce4a6f36, 0xd3587421, 0xd8567d2c, 0x7a37a10c, 0x7139a801, 0x6c2bb316, 0x6725ba1b, 0x560f8538, 0x5d018c35, 0x40139722, 0x4b1d9e2f, 0x2247e964, 0x2949e069, 0x345bfb7e, 0x3f55f273, 0x0e7fcd50, 0x0571c45d, 0x1863df4a, 0x136dd647, 0xcad731dc, 0xc1d938d1, 0xdccb23c6, 0xd7c52acb, 0xe6ef15e8, 0xede11ce5, 0xf0f307f2, 0xfbfd0eff, 0x92a779b4, 0x99a970b9, 0x84bb6bae, 0x8fb562a3, 0xbe9f5d80, 0xb591548d, 0xa8834f9a, 0xa38d4697];
var U3 = [0x00000000, 0x0d0b0e09, 0x1a161c12, 0x171d121b, 0x342c3824, 0x3927362d, 0x2e3a2436, 0x23312a3f, 0x68587048, 0x65537e41, 0x724e6c5a, 0x7f456253, 0x5c74486c, 0x517f4665, 0x4662547e, 0x4b695a77, 0xd0b0e090, 0xddbbee99, 0xcaa6fc82, 0xc7adf28b, 0xe49cd8b4, 0xe997d6bd, 0xfe8ac4a6, 0xf381caaf, 0xb8e890d8, 0xb5e39ed1, 0xa2fe8cca, 0xaff582c3, 0x8cc4a8fc, 0x81cfa6f5, 0x96d2b4ee, 0x9bd9bae7, 0xbb7bdb3b, 0xb670d532, 0xa16dc729, 0xac66c920, 0x8f57e31f, 0x825ced16, 0x9541ff0d, 0x984af104, 0xd323ab73, 0xde28a57a, 0xc935b761, 0xc43eb968, 0xe70f9357, 0xea049d5e, 0xfd198f45, 0xf012814c, 0x6bcb3bab, 0x66c035a2, 0x71dd27b9, 0x7cd629b0, 0x5fe7038f, 0x52ec0d86, 0x45f11f9d, 0x48fa1194, 0x03934be3, 0x0e9845ea, 0x198557f1, 0x148e59f8, 0x37bf73c7, 0x3ab47dce, 0x2da96fd5, 0x20a261dc, 0x6df6ad76, 0x60fda37f, 0x77e0b164, 0x7aebbf6d, 0x59da9552, 0x54d19b5b, 0x43cc8940, 0x4ec78749, 0x05aedd3e, 0x08a5d337, 0x1fb8c12c, 0x12b3cf25, 0x3182e51a, 0x3c89eb13, 0x2b94f908, 0x269ff701, 0xbd464de6, 0xb04d43ef, 0xa75051f4, 0xaa5b5ffd, 0x896a75c2, 0x84617bcb, 0x937c69d0, 0x9e7767d9, 0xd51e3dae, 0xd81533a7, 0xcf0821bc, 0xc2032fb5, 0xe132058a, 0xec390b83, 0xfb241998, 0xf62f1791, 0xd68d764d, 0xdb867844, 0xcc9b6a5f, 0xc1906456, 0xe2a14e69, 0xefaa4060, 0xf8b7527b, 0xf5bc5c72, 0xbed50605, 0xb3de080c, 0xa4c31a17, 0xa9c8141e, 0x8af93e21, 0x87f23028, 0x90ef2233, 0x9de42c3a, 0x063d96dd, 0x0b3698d4, 0x1c2b8acf, 0x112084c6, 0x3211aef9, 0x3f1aa0f0, 0x2807b2eb, 0x250cbce2, 0x6e65e695, 0x636ee89c, 0x7473fa87, 0x7978f48e, 0x5a49deb1, 0x5742d0b8, 0x405fc2a3, 0x4d54ccaa, 0xdaf741ec, 0xd7fc4fe5, 0xc0e15dfe, 0xcdea53f7, 0xeedb79c8, 0xe3d077c1, 0xf4cd65da, 0xf9c66bd3, 0xb2af31a4, 0xbfa43fad, 0xa8b92db6, 0xa5b223bf, 0x86830980, 0x8b880789, 0x9c951592, 0x919e1b9b, 0x0a47a17c, 0x074caf75, 0x1051bd6e, 0x1d5ab367, 0x3e6b9958, 0x33609751, 0x247d854a, 0x29768b43, 0x621fd134, 0x6f14df3d, 0x7809cd26, 0x7502c32f, 0x5633e910, 0x5b38e719, 0x4c25f502, 0x412efb0b, 0x618c9ad7, 0x6c8794de, 0x7b9a86c5, 0x769188cc, 0x55a0a2f3, 0x58abacfa, 0x4fb6bee1, 0x42bdb0e8, 0x09d4ea9f, 0x04dfe496, 0x13c2f68d, 0x1ec9f884, 0x3df8d2bb, 0x30f3dcb2, 0x27eecea9, 0x2ae5c0a0, 0xb13c7a47, 0xbc37744e, 0xab2a6655, 0xa621685c, 0x85104263, 0x881b4c6a, 0x9f065e71, 0x920d5078, 0xd9640a0f, 0xd46f0406, 0xc372161d, 0xce791814, 0xed48322b, 0xe0433c22, 0xf75e2e39, 0xfa552030, 0xb701ec9a, 0xba0ae293, 0xad17f088, 0xa01cfe81, 0x832dd4be, 0x8e26dab7, 0x993bc8ac, 0x9430c6a5, 0xdf599cd2, 0xd25292db, 0xc54f80c0, 0xc8448ec9, 0xeb75a4f6, 0xe67eaaff, 0xf163b8e4, 0xfc68b6ed, 0x67b10c0a, 0x6aba0203, 0x7da71018, 0x70ac1e11, 0x539d342e, 0x5e963a27, 0x498b283c, 0x44802635, 0x0fe97c42, 0x02e2724b, 0x15ff6050, 0x18f46e59, 0x3bc54466, 0x36ce4a6f, 0x21d35874, 0x2cd8567d, 0x0c7a37a1, 0x017139a8, 0x166c2bb3, 0x1b6725ba, 0x38560f85, 0x355d018c, 0x22401397, 0x2f4b1d9e, 0x642247e9, 0x692949e0, 0x7e345bfb, 0x733f55f2, 0x500e7fcd, 0x5d0571c4, 0x4a1863df, 0x47136dd6, 0xdccad731, 0xd1c1d938, 0xc6dccb23, 0xcbd7c52a, 0xe8e6ef15, 0xe5ede11c, 0xf2f0f307, 0xfffbfd0e, 0xb492a779, 0xb999a970, 0xae84bb6b, 0xa38fb562, 0x80be9f5d, 0x8db59154, 0x9aa8834f, 0x97a38d46];
var U4 = [0x00000000, 0x090d0b0e, 0x121a161c, 0x1b171d12, 0x24342c38, 0x2d392736, 0x362e3a24, 0x3f23312a, 0x48685870, 0x4165537e, 0x5a724e6c, 0x537f4562, 0x6c5c7448, 0x65517f46, 0x7e466254, 0x774b695a, 0x90d0b0e0, 0x99ddbbee, 0x82caa6fc, 0x8bc7adf2, 0xb4e49cd8, 0xbde997d6, 0xa6fe8ac4, 0xaff381ca, 0xd8b8e890, 0xd1b5e39e, 0xcaa2fe8c, 0xc3aff582, 0xfc8cc4a8, 0xf581cfa6, 0xee96d2b4, 0xe79bd9ba, 0x3bbb7bdb, 0x32b670d5, 0x29a16dc7, 0x20ac66c9, 0x1f8f57e3, 0x16825ced, 0x0d9541ff, 0x04984af1, 0x73d323ab, 0x7ade28a5, 0x61c935b7, 0x68c43eb9, 0x57e70f93, 0x5eea049d, 0x45fd198f, 0x4cf01281, 0xab6bcb3b, 0xa266c035, 0xb971dd27, 0xb07cd629, 0x8f5fe703, 0x8652ec0d, 0x9d45f11f, 0x9448fa11, 0xe303934b, 0xea0e9845, 0xf1198557, 0xf8148e59, 0xc737bf73, 0xce3ab47d, 0xd52da96f, 0xdc20a261, 0x766df6ad, 0x7f60fda3, 0x6477e0b1, 0x6d7aebbf, 0x5259da95, 0x5b54d19b, 0x4043cc89, 0x494ec787, 0x3e05aedd, 0x3708a5d3, 0x2c1fb8c1, 0x2512b3cf, 0x1a3182e5, 0x133c89eb, 0x082b94f9, 0x01269ff7, 0xe6bd464d, 0xefb04d43, 0xf4a75051, 0xfdaa5b5f, 0xc2896a75, 0xcb84617b, 0xd0937c69, 0xd99e7767, 0xaed51e3d, 0xa7d81533, 0xbccf0821, 0xb5c2032f, 0x8ae13205, 0x83ec390b, 0x98fb2419, 0x91f62f17, 0x4dd68d76, 0x44db8678, 0x5fcc9b6a, 0x56c19064, 0x69e2a14e, 0x60efaa40, 0x7bf8b752, 0x72f5bc5c, 0x05bed506, 0x0cb3de08, 0x17a4c31a, 0x1ea9c814, 0x218af93e, 0x2887f230, 0x3390ef22, 0x3a9de42c, 0xdd063d96, 0xd40b3698, 0xcf1c2b8a, 0xc6112084, 0xf93211ae, 0xf03f1aa0, 0xeb2807b2, 0xe2250cbc, 0x956e65e6, 0x9c636ee8, 0x877473fa, 0x8e7978f4, 0xb15a49de, 0xb85742d0, 0xa3405fc2, 0xaa4d54cc, 0xecdaf741, 0xe5d7fc4f, 0xfec0e15d, 0xf7cdea53, 0xc8eedb79, 0xc1e3d077, 0xdaf4cd65, 0xd3f9c66b, 0xa4b2af31, 0xadbfa43f, 0xb6a8b92d, 0xbfa5b223, 0x80868309, 0x898b8807, 0x929c9515, 0x9b919e1b, 0x7c0a47a1, 0x75074caf, 0x6e1051bd, 0x671d5ab3, 0x583e6b99, 0x51336097, 0x4a247d85, 0x4329768b, 0x34621fd1, 0x3d6f14df, 0x267809cd, 0x2f7502c3, 0x105633e9, 0x195b38e7, 0x024c25f5, 0x0b412efb, 0xd7618c9a, 0xde6c8794, 0xc57b9a86, 0xcc769188, 0xf355a0a2, 0xfa58abac, 0xe14fb6be, 0xe842bdb0, 0x9f09d4ea, 0x9604dfe4, 0x8d13c2f6, 0x841ec9f8, 0xbb3df8d2, 0xb230f3dc, 0xa927eece, 0xa02ae5c0, 0x47b13c7a, 0x4ebc3774, 0x55ab2a66, 0x5ca62168, 0x63851042, 0x6a881b4c, 0x719f065e, 0x78920d50, 0x0fd9640a, 0x06d46f04, 0x1dc37216, 0x14ce7918, 0x2bed4832, 0x22e0433c, 0x39f75e2e, 0x30fa5520, 0x9ab701ec, 0x93ba0ae2, 0x88ad17f0, 0x81a01cfe, 0xbe832dd4, 0xb78e26da, 0xac993bc8, 0xa59430c6, 0xd2df599c, 0xdbd25292, 0xc0c54f80, 0xc9c8448e, 0xf6eb75a4, 0xffe67eaa, 0xe4f163b8, 0xedfc68b6, 0x0a67b10c, 0x036aba02, 0x187da710, 0x1170ac1e, 0x2e539d34, 0x275e963a, 0x3c498b28, 0x35448026, 0x420fe97c, 0x4b02e272, 0x5015ff60, 0x5918f46e, 0x663bc544, 0x6f36ce4a, 0x7421d358, 0x7d2cd856, 0xa10c7a37, 0xa8017139, 0xb3166c2b, 0xba1b6725, 0x8538560f, 0x8c355d01, 0x97224013, 0x9e2f4b1d, 0xe9642247, 0xe0692949, 0xfb7e345b, 0xf2733f55, 0xcd500e7f, 0xc45d0571, 0xdf4a1863, 0xd647136d, 0x31dccad7, 0x38d1c1d9, 0x23c6dccb, 0x2acbd7c5, 0x15e8e6ef, 0x1ce5ede1, 0x07f2f0f3, 0x0efffbfd, 0x79b492a7, 0x70b999a9, 0x6bae84bb, 0x62a38fb5, 0x5d80be9f, 0x548db591, 0x4f9aa883, 0x4697a38d]; // function convertToInt32(bytes) {
//     var result = new Uint32Array(bytes.length>>2);
//     for (var i = 0; i < bytes.length; i += 4) {
//         result[i>>2] = 
//             (bytes[i    ] << 24) |
//             (bytes[i + 1] << 16) |
//             (bytes[i + 2] <<  8) |
//             bytes[i + 3]
//         ;
//     }
//     return result;
// }

var AES = /*#__PURE__*/function () {
  /**
   * 
   * @param {Array | Uint8Array} key 
   */
  function AES(key) {
    _classCallCheck(this, AES);

    if (key.length < 16) key = pkcs7pad(key, 16);else if (key.length % 8 !== 0) key = pkcs7pad(key, 8);
    this.key = new Uint8Array(key.slice()); //copy array

    this._prepare();
  }

  _createClass(AES, [{
    key: "_prepare",
    value: function _prepare() {
      var rounds = numberOfRounds(this.key.length);

      if (rounds == null) {
        throw new Error('invalid key size (must be 16, 24 or 32 bytes)');
      } // encryption round keys


      this._Ke = new Array(rounds); // decryption round keys

      this._Kd = new Array(rounds);

      for (var i = 0; i <= rounds; i++) {
        this._Ke[i] = new Int32Array(4);
        this._Kd[i] = new Int32Array(4);
      }

      var roundKeyCount = (rounds + 1) * 4;
      var KC = this.key.length / 4; // convert the key into ints

      var tk = new Int32Array(this.key.buffer); //convertToInt32(this.key);
      // copy values into round key arrays

      var index;

      for (var i = 0; i < KC; i++) {
        index = i >> 2;
        this._Ke[index][i % 4] = tk[i];
        this._Kd[rounds - index][i % 4] = tk[i];
      } // key expansion (fips-197 section 5.2)


      var rconpointer = 0;
      var t = KC,
          tt;

      while (t < roundKeyCount) {
        tt = tk[KC - 1];
        tk[0] ^= S[tt >> 16 & 0xFF] << 24 ^ S[tt >> 8 & 0xFF] << 16 ^ S[tt & 0xFF] << 8 ^ S[tt >> 24 & 0xFF] ^ rcon[rconpointer] << 24;
        rconpointer += 1; // key expansion (for non-256 bit)

        if (KC != 8) {
          for (var i = 1; i < KC; i++) {
            tk[i] ^= tk[i - 1];
          } // key expansion for 256-bit keys is "slightly different" (fips-197)

        } else {
          for (var i = 1; i < KC / 2; i++) {
            tk[i] ^= tk[i - 1];
          }

          tt = tk[KC / 2 - 1];
          tk[KC / 2] ^= S[tt & 0xFF] ^ S[tt >> 8 & 0xFF] << 8 ^ S[tt >> 16 & 0xFF] << 16 ^ S[tt >> 24 & 0xFF] << 24;

          for (var i = KC / 2 + 1; i < KC; i++) {
            tk[i] ^= tk[i - 1];
          }
        } // copy values into round key arrays


        var i = 0,
            r,
            c;

        while (i < KC && t < roundKeyCount) {
          r = t >> 2;
          c = t % 4;
          this._Ke[r][c] = tk[i];
          this._Kd[rounds - r][c] = tk[i++];
          t++;
        }
      } // inverse-cipher-ify the decryption round key (fips-197 section 5.3)


      for (var r = 1; r < rounds; r++) {
        for (var c = 0; c < 4; c++) {
          tt = this._Kd[r][c];
          this._Kd[r][c] = U1[tt >> 24 & 0xFF] ^ U2[tt >> 16 & 0xFF] ^ U3[tt >> 8 & 0xFF] ^ U4[tt & 0xFF];
        }
      }
    }
  }, {
    key: "encrypt",
    value: function encrypt(plaintext) {
      plaintext = new Uint8Array(plaintext);

      if (plaintext.length != 16) {
        throw new Error('invalid plaintext size (must be 16 bytes)');
      }

      var rounds = this._Ke.length - 1;
      var a = new Int32Array(4); // convert plaintext to (ints ^ key)

      var t = new Int32Array(plaintext.buffer); //convertToInt32(plaintext);

      for (var i = 0; i < 4; i++) {
        t[i] ^= this._Ke[0][i];
      } // apply round transforms


      for (var r = 1; r < rounds; r++) {
        for (var i = 0; i < 4; i++) {
          a[i] = T1[t[i] >> 24 & 0xff] ^ T2[t[(i + 1) % 4] >> 16 & 0xff] ^ T3[t[(i + 2) % 4] >> 8 & 0xff] ^ T4[t[(i + 3) % 4] & 0xff] ^ this._Ke[r][i];
        }

        t = a.slice();
      } // the last round is special


      var result = new Uint8Array(16),
          tt;

      for (var i = 0; i < 4; i++) {
        tt = this._Ke[rounds][i];
        result[4 * i] = (S[t[i] >> 24 & 0xff] ^ tt >> 24) & 0xff;
        result[4 * i + 1] = (S[t[(i + 1) % 4] >> 16 & 0xff] ^ tt >> 16) & 0xff;
        result[4 * i + 2] = (S[t[(i + 2) % 4] >> 8 & 0xff] ^ tt >> 8) & 0xff;
        result[4 * i + 3] = (S[t[(i + 3) % 4] & 0xff] ^ tt) & 0xff;
      }

      return result;
    }
  }]);

  return AES;
}();
/**
 *  Counter object for CTR common mode of operation
 */


var Counter = /*#__PURE__*/function () {
  function Counter(initialValue) {
    _classCallCheck(this, Counter);

    // We allow 0, but anything false-ish uses the default 5
    if (initialValue !== 0 && !initialValue) {
      initialValue = 5;
    }

    if (typeof initialValue === 'number') {
      this._counter = new Uint8Array(16);
      this.setValue(initialValue);
    } else {
      this.setBytes(initialValue);
    }
  }

  _createClass(Counter, [{
    key: "setValue",
    value: function setValue(value) {
      if (typeof value !== 'number' || parseInt(value) != value) {
        throw new Error('invalid counter value (must be an integer)');
      } // We cannot safely handle numbers beyond the safe range for integers


      if (value > Number.MAX_SAFE_INTEGER) {
        throw new Error('integer value out of safe range');
      }

      for (var index = 15; index >= 0; --index) {
        this._counter[index] = value % 256;
        value = Math.floor(value / 256);
      }
    }
  }, {
    key: "setBytes",
    value: function setBytes(bytes) {
      bytes = bytes.slice(); //coerceArray(bytes, true);

      if (bytes.length != 16) {
        throw new Error('invalid counter bytes size (must be 16 bytes)');
      }

      this._counter = bytes;
    }
  }, {
    key: "increment",
    value: function increment() {
      for (var i = 15; i >= 0; i--) {
        if (this._counter[i] === 255) {
          this._counter[i] = 0;
        } else {
          this._counter[i]++;
          break;
        }
      }
    }
  }]);

  return Counter;
}();
/**
 *  Mode Of Operation - Counter (CTR)
 */


var AesCtr = /*#__PURE__*/function () {
  function AesCtr(key) {
    var counter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;

    _classCallCheck(this, AesCtr);

    this.description = "Counter";
    this.name = "ctr";

    if (!(counter instanceof Counter)) {
      counter = new Counter(counter);
    }

    this._counter = counter;
    this._remainingCounter = null;
    this._remainingCounterIndex = 16;
    this._aes = new AES(key);
  }

  _createClass(AesCtr, [{
    key: "encrypt",
    value: function encrypt(plaintext) {
      var copy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var encrypted;
      encrypted = copy ? plaintext.slice() : plaintext; //coerceArray(plaintext, true);

      for (var i = 0; i < encrypted.length; i++) {
        if (this._remainingCounterIndex === 16) {
          this._remainingCounter = this._aes.encrypt(this._counter._counter);
          this._remainingCounterIndex = 0;

          this._counter.increment();
        }

        encrypted[i] ^= this._remainingCounter[this._remainingCounterIndex++];
      }

      return encrypted;
    } // Decryption is symetric

  }, {
    key: "decrypt",
    value: function decrypt(plaintext) {
      var copy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var encrypted;
      encrypted = copy ? plaintext.slice() : plaintext; //coerceArray(plaintext, true);

      for (var i = 0; i < encrypted.length; i++) {
        if (this._remainingCounterIndex === 16) {
          this._remainingCounter = this._aes.encrypt(this._counter._counter);
          this._remainingCounterIndex = 0;

          this._counter.increment();
        }

        encrypted[i] ^= this._remainingCounter[this._remainingCounterIndex++];
      }

      return encrypted;
    }
  }]);

  return AesCtr;
}(); ///////////////////////
// Padding
// See:https://tools.ietf.org/html/rfc2315

function pkcs7pad(data, n) {
  var padder = n - data.length % n;
  var result = new Uint8Array(data.length + padder);
  result.set(data);

  for (var i = data.length; i < result.length; i++) {
    result[i] = padder;
  }

  return result;
} // function pkcs7strip(data) {
//     var padder = data[data.length - 1];
//     var length = data.length - padder;
//     return data.slice(0, length);
// }

/***/ }),

/***/ "./src/crypto/RSA.js":
/*!***************************!*\
  !*** ./src/crypto/RSA.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RSA": () => (/* binding */ RSA)
/* harmony export */ });
/* harmony import */ var _SHA256__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SHA256 */ "./src/crypto/SHA256.js");
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


var RSA = /*#__PURE__*/function () {
  function RSA() {
    _classCallCheck(this, RSA);

    _defineProperty(this, "_privateKey", void 0);

    _defineProperty(this, "_publicKey", void 0);
  }

  _createClass(RSA, [{
    key: "publicKey",
    get: function get() {
      return this._serializeKey(this._publicKey);
    },
    set: function set(pubkey) {
      this._publicKey = this._deserializeKey(pubkey);
    }
  }, {
    key: "privateKey",
    get: function get() {
      var _this$_privateKey = _slicedToArray(this._privateKey, 7),
          d = _this$_privateKey[0],
          n = _this$_privateKey[1],
          p = _this$_privateKey[2],
          q = _this$_privateKey[3],
          dmp1 = _this$_privateKey[4],
          dmq1 = _this$_privateKey[5],
          coeff = _this$_privateKey[6];

      return this._serializeKey([p, q, d]);
    },
    set: function set(prikey) {
      var _this$_deserializeKey = this._deserializeKey(prikey),
          _this$_deserializeKey2 = _slicedToArray(_this$_deserializeKey, 3),
          p = _this$_deserializeKey2[0],
          q = _this$_deserializeKey2[1],
          d = _this$_deserializeKey2[2];

      var _this$_factorPrivate = this._factorPrivate(p, q, d),
          _this$_factorPrivate2 = _slicedToArray(_this$_factorPrivate, 3),
          dmp1 = _this$_factorPrivate2[0],
          dmq1 = _this$_factorPrivate2[1],
          coeff = _this$_factorPrivate2[2];

      var n = p * q;
      this._privateKey = [d, n, p, q, dmp1, dmq1, coeff];
    }
  }, {
    key: "generateKeyPair",
    value: function generateKeyPair() {
      var bits = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2048n;
      var checkCorrect = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      bits = BigInt(bits);

      var _this$_getTwoPrimes = this._getTwoPrimes(bits),
          _this$_getTwoPrimes2 = _slicedToArray(_this$_getTwoPrimes, 2),
          p = _this$_getTwoPrimes2[0],
          q = _this$_getTwoPrimes2[1];

      var n = p * q;
      var lambda_n = RSA.lcm(p - 1n, q - 1n);

      var e = this._getE(lambda_n, p, q);

      var _this$_extendedEuclid = this._extendedEuclidean(lambda_n, e),
          _this$_extendedEuclid2 = _slicedToArray(_this$_extendedEuclid, 3),
          k = _this$_extendedEuclid2[0],
          d = _this$_extendedEuclid2[1],
          r = _this$_extendedEuclid2[2]; // if(r !== 1n) return generateKeyPair(bits); //throw 'extendedEuclidean fall.';


      if (!this._isKeyPairSafe(p, q, n, e, d, bits)) return this.generateKeyPair(bits, checkCorrect); //throw 'the keypair are not safe.';

      var _this$_factorPrivate3 = this._factorPrivate(p, q, d),
          _this$_factorPrivate4 = _slicedToArray(_this$_factorPrivate3, 3),
          dmp1 = _this$_factorPrivate4[0],
          dmq1 = _this$_factorPrivate4[1],
          coeff = _this$_factorPrivate4[2];

      this._publicKey = [e, n];
      this._privateKey = [d, n, p, q, dmp1, dmq1, coeff];
      if (checkCorrect && !this.checkKeyPairCorrectness()) return this.generateKeyPair(bits, checkCorrect);
      return this;
    }
  }, {
    key: "encrypt",
    value: function encrypt(M) {
      return this._encrypt(M, false, this._publicKey);
    }
  }, {
    key: "decrypt",
    value: function decrypt(C) {
      return this._decrypt(C, true, this._privateKey);
    }
  }, {
    key: "sign",
    value: function sign(M) {
      M = RSA.HASH_FUNCTION(M);
      return this._encrypt(M, true, this._privateKey);
    }
  }, {
    key: "verify",
    value: function verify(S, M) {
      var C = this._decrypt(S, false, this._publicKey);

      M = RSA.HASH_FUNCTION(M);

      for (var i = 0; i < M.length; i++) {
        if (M[i] !== C[i]) return false;
      }

      return true;
    }
  }, {
    key: "checkKeyPairCorrectness",
    value: function checkKeyPairCorrectness() {
      var iter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var data, encrypted, decrypted, signData;

      for (var i = 0; i < iter; i++) {
        data = this._bint2arr(RSA.randint(1n << 511n, 1n << 512n));
        signData = this._bint2arr(RSA.randint(1n << 511n, 1n << 512n));
        encrypted = this.encrypt(data);
        decrypted = this.decrypt(encrypted);

        for (var j = 0; j < data.length; j++) {
          if (data[j] !== decrypted[j]) return false;
        }

        if (!(this.verify(this.sign(data), data) && !this.verify(this.sign(signData), data))) return false;
      }

      return true;
    }
  }, {
    key: "_encrypt",
    value: function _encrypt(M) {
      var privateMod = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var key = arguments.length > 2 ? arguments[2] : undefined;
      var C;
      var n = key[1]; // find log256(n)

      var ln2 = n.toString(2).length;
      var ln256 = Math.floor(ln2 / 8);
      if ((ln2 & 7) !== 0) ln256++;
      M = this._pkcs7pad(M);
      M = this._paddingSplit(M);
      M = this._splitByN(M, n);

      var _len;

      _len = M.length, C = Array(_len);

      for (var i = 0; i < _len; i++) {
        var m, c;
        m = M[i];
        m = this._arr2bint(m);
        c = privateMod ? this._chineseRemainder(m, key[2], key[3], key[4], key[5], key[6]) : RSA.modExp(m, key[0], key[1]);
        c = this._bint2arr(c, ln256); // chunk size is ln256

        C[i] = c;
      }

      C = this._flatArray(C);
      return C;
    }
  }, {
    key: "_decrypt",
    value: function _decrypt(C) {
      var privateMod = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var key = arguments.length > 2 ? arguments[2] : undefined;
      var M;
      var n = key[1];
      var chunkSize;

      var _len; // find log256(n)


      var ln2 = n.toString(2).length;
      var ln256 = ln2 >> 3;
      if ((ln2 & 7) !== 0) ln256++;
      chunkSize = ln256;
      C = this._splitByN(C, n, chunkSize);
      _len = C.length, M = Array(_len);

      for (var i = 0; i < _len; i++) {
        var m, c;
        c = C[i];
        c = this._arr2bint(c);
        m = privateMod ? this._chineseRemainder(c, key[2], key[3], key[4], key[5], key[6]) : RSA.modExp(c, key[0], key[1]);
        m = this._bint2arr(m);
        M[i] = m;
      }

      M = this._flatArray(M);
      M = this._unpaddingSplit(M);
      M = this._pkcs7strip(M);
      return M;
    }
  }, {
    key: "_factorPrivate",
    value: function _factorPrivate(p, q, d) {
      var _this$_extendedEuclid3 = this._extendedEuclidean(p, q),
          _this$_extendedEuclid4 = _slicedToArray(_this$_extendedEuclid3, 3),
          k = _this$_extendedEuclid4[0],
          coeff = _this$_extendedEuclid4[1],
          r = _this$_extendedEuclid4[2];

      var dmp1 = d % (p - 1n),
          dmq1 = d % (q - 1n);
      return [dmp1, dmq1, coeff];
    }
    /** modify from https://github.com/travist/jsencrypt*/

  }, {
    key: "_chineseRemainder",
    value: function _chineseRemainder(x, p, q, dmp1, dmq1, coeff) {
      // TODO: re-calculate any missing CRT params
      var xp = RSA.modExp(x % p, dmp1, p);
      var xq = RSA.modExp(x % q, dmq1, q);

      while (xp < xq) {
        xp += p;
      }

      return (xp - xq) * coeff % p * q + xq;
    }
  }, {
    key: "_splitByN",
    value: function _splitByN(arr, n) {
      var chunkSize = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      // 0 <= m < n
      var x = n.toString(2).length - 1;
      if (n % (1n << BigInt(x)) === 0n) x++;
      if (chunkSize === null) chunkSize = x >> 3; //must less than n, hence can not + 1;

      var arrLength = arr.length;
      var len = Math.floor(arrLength / chunkSize);
      if (arrLength % chunkSize !== 0) len++;
      var result = Array(len);

      for (var i = 0; i < len; i++) {
        result[i] = arr.slice(i * chunkSize, (i + 1) * chunkSize);
      }

      return result;
    }
  }, {
    key: "_serializeKey",
    value: function _serializeKey(k) {
      // k is array of bigint
      var chunkSize = RSA.PADDING_N;
      var nKeys = k.length;
      var resLenArr = new Uint8Array(nKeys);
      var totalLen = 0;

      var _arr = Array(nKeys);

      for (var i = 0; i < nKeys; i++) {
        var _tmp = k[i];
        _tmp = this._bint2arr(_tmp);
        _tmp = this._pkcs7pad(_tmp);
        _tmp = this._paddingSplit(_tmp);
        _arr[i] = _tmp;
        totalLen += _tmp.length;
        resLenArr[i] = Math.floor(_tmp.length / chunkSize);
      }

      totalLen = totalLen + nKeys;
      var resArr = new Uint8Array(totalLen); //[e.length, e.arr, n.arr]

      var offset = 0;
      resArr[offset++] = nKeys; // set number of components

      for (var j = 0; j < nKeys - 1; j++) {
        // set length of key components
        resArr[offset++] = resLenArr[j];
      }

      for (var j = 0; j < nKeys; j++) {
        // set values to resArr
        var _tmp = _arr[j];

        for (var _i = 0; _i < _tmp.length; _i++) {
          resArr[offset++] = _tmp[_i];
        }
      }

      return resArr;
    }
  }, {
    key: "_deserializeKey",
    value: function _deserializeKey(k) {
      var chunkSize = RSA.PADDING_N;
      var offset = 0;
      var nKeys = k[offset++];
      var lenArr = new Uint8Array(nKeys);
      var totalLen;
      var _tmp = 0;

      for (var i = 0; i < nKeys - 1; i++) {
        lenArr[i] = k[offset++];
        _tmp += lenArr[i];
      }

      totalLen = k.length - offset;
      lenArr[nKeys - 1] = totalLen - _tmp;
      var resArr = Array(nKeys);

      for (var i = 0; i < nKeys; i++) {
        var _k;

        var size = lenArr[i] * chunkSize;
        _k = k.slice(offset, offset + size);
        _k = this._unpaddingSplit(_k);
        _k = this._pkcs7strip(_k);
        _k = this._arr2bint(_k);
        resArr[i] = _k;
        offset += size;
      }

      return resArr;
    }
  }, {
    key: "_paddingSplit",
    value: function _paddingSplit(message) {
      //split array to 24 length, because some array may to long.
      var n = RSA.PADDING_N,
          k0 = RSA.PADDING_K0,
          k1 = RSA.PADDING_K1;
      var inc = n - k0 - k1;
      var iter = Math.floor(message.length / inc);
      if (message.length % inc !== 0) iter++;
      var result = Array(iter);

      for (var i = 0, offset = 0; i < iter; i++, offset += inc) {
        var m = message.slice(offset, offset + inc); // if(m.length <= inc){
        //     m = this._paddingZeros(m, inc - m.length);
        // }

        result[i] = this._padding(m);
      }

      return this._flatArray(result);
    }
  }, {
    key: "_unpaddingSplit",
    value: function _unpaddingSplit(message) {
      //
      var chunkSize = RSA.PADDING_N;
      if (message.length % chunkSize !== 0) message = this._paddingZeros(message, chunkSize - message.length % chunkSize); //padding zeros

      var iter = Math.floor(message.length / chunkSize);
      var result = Array(iter);

      for (var i = 0, offset = 0; i < iter; i++, offset += chunkSize) {
        var R = message.slice(offset, offset + chunkSize);
        result[i] = this._unpadding(R);
      }

      return this._flatArray(result);
    }
  }, {
    key: "_pkcs7pad",
    value: function _pkcs7pad(data) {
      var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : RSA.PADDING_N - RSA.PADDING_K0 - RSA.PADDING_K1;
      var padder = n - data.length % n;
      var result = new Uint8Array(data.length + padder);
      result.set(data);

      for (var i = data.length; i < result.length; i++) {
        result[i] = padder;
      }

      return result;
    }
  }, {
    key: "_pkcs7strip",
    value: function _pkcs7strip(data) {
      var padder = data[data.length - 1];
      var length = data.length - padder;
      return data.slice(0, length);
    }
  }, {
    key: "_padding",
    value: function _padding(m) {
      //required length: n-k0-k1 = 24, output length: n = 64
      var n = RSA.PADDING_N,
          k0 = RSA.PADDING_K0,
          k1 = RSA.PADDING_K1;
      var _ref = [RSA.HASH_FUNCTION_G, RSA.HASH_FUNCTION_H],
          G = _ref[0],
          H = _ref[1];
      m = this._paddingZeros(m, k1); // padding k1 zeros

      var r = crypto.getRandomValues(new Uint8Array(k0));

      var X = this._xorArray(m, G(r)); //assert X.length === n - k0;


      var Y = this._xorArray(r, H(X));

      return this._concatArray(X, Y);
    }
  }, {
    key: "_unpadding",
    value: function _unpadding(R) {
      //output length: 24
      var n = RSA.PADDING_N,
          k0 = RSA.PADDING_K0,
          k1 = RSA.PADDING_K1;
      var _ref2 = [RSA.HASH_FUNCTION_G, RSA.HASH_FUNCTION_H],
          G = _ref2[0],
          H = _ref2[1];
      var _ref3 = [R.slice(0, n - k0), R.slice(n - k0, n)],
          X = _ref3[0],
          Y = _ref3[1];

      var r = this._xorArray(Y, H(X));

      var mZeros = this._xorArray(X, G(r));

      return mZeros.slice(0, n - k0 - k1);
    }
  }, {
    key: "_xorArray",
    value: function _xorArray(a, b) {
      var result = new Uint8Array(a.length);

      for (var i = 0; i < a.length; i++) {
        result[i] = a[i] ^ b[i];
      }

      return result;
    }
  }, {
    key: "_paddingZeros",
    value: function _paddingZeros(arr, numOfZeros) {
      numOfZeros = Number(numOfZeros);
      var len = arr.length + numOfZeros;
      var result = new Uint8Array(len);

      for (var i = 0; i < arr.length; i++) {
        result[i] = arr[i];
      }

      for (var i = arr.length; i < len; i++) {
        result[i] = 0;
      }

      return result;
    }
  }, {
    key: "_flatArray",
    value: function _flatArray(arr) {
      // two dim array required
      var len = 0;

      for (var i = 0; i < arr.length; i++) {
        len += arr[i].length;
      }

      var result = new Uint8Array(len);
      var offset = 0;

      for (var i = 0; i < arr.length; i++) {
        for (var j = 0; j < arr[i].length; j++) {
          result[offset++] = arr[i][j];
        }
      }

      return result;
    }
  }, {
    key: "_concatArray",
    value: function _concatArray(A, B) {
      var al = A.length,
          len = al + B.length;
      var result = new Uint8Array(len);

      for (var i = 0; i < al; i++) {
        result[i] = A[i];
      }

      for (var i = 0, j = al; j < len; i++, j++) {
        result[j] = B[i];
      }

      return result;
    }
  }, {
    key: "_arr2bint",
    value: function _arr2bint(arr) {
      var len = arr.length;
      var bint = 0n;

      for (var i = 0; i < len; i++) {
        bint += BigInt(arr[i]) << (BigInt(i) << 3n);
      }

      return bint;
    }
  }, {
    key: "_bint2arr",
    value: function _bint2arr(bint) {
      var len = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      if (len === null) {
        var ln2 = bint.toString(2).length;
        len = Math.floor(ln2 / 8);
        if ((ln2 & 7) !== 0) len++;
      }

      var buffer = new Uint8Array(len);

      for (var i = 0; i < len; i++) {
        buffer[i] = Number(bint % 256n);
        bint >>= 8n;
      }

      return buffer;
    }
  }, {
    key: "_isKeyPairSafe",
    value: function _isKeyPairSafe(p, q, n, e, d, bits) {
      if (p < q << 1n && p > q && d < (1n << bits / 4n) / 3n) return false;
      return true;
    }
  }, {
    key: "_getTwoPrimes",
    value: function _getTwoPrimes(bits) {
      /** p - q should larger than 2n^{1/4}*/
      var pBits = bits >> 1n;
      var range = [(1n << pBits - 1n) + 1n, (1n << pBits) - 1n];
      var step = range[1] - range[0];
      var dist = 1n << (bits >> 2n) + 2n;
      return [this._generatePrimeNumberByProbability(range[1] + dist, range[1] + dist + step), this._generatePrimeNumberByProbability(range[0], range[1])];
    }
    /** modify from https://github.com/travist/jsencrypt*/

  }, {
    key: "_getLowLevelPrime",
    value: function _getLowLevelPrime(n0, n1) {
      var LOW_PRIME_LIST = RSA.FITST_PRIMES_LIST;
      var LOW_PRIME_LENGTH = LOW_PRIME_LIST.length;
      var BIG_LOW_PRIME = RSA.FITST_PRIMES_LIST[LOW_PRIME_LENGTH - 1];
      var lplim = (1n << 26n) / BIG_LOW_PRIME + 1n;

      while (true) {
        // Obtain a random number
        var x = RSA.randint(n0, n1);
        if ((x & 1n) === 0n) x = x + 1n;

        if (x < 1n << 28n && x <= BIG_LOW_PRIME) {
          // check if x is prime that in list "LOW_PRIME_LIST"
          for (var i = 1; i < LOW_PRIME_LENGTH; i++) {
            // not including 2
            if (x === LOW_PRIME_LIST[i]) {
              return x;
            }
          }

          continue;
        }

        var i = 1;
        var _notPrime = false;

        while (i < LOW_PRIME_LENGTH) {
          var m = LOW_PRIME_LIST[i];
          var j = i + 1;

          while (j < LOW_PRIME_LENGTH && m < lplim) {
            m *= LOW_PRIME_LIST[j++];
          }

          m = x % m;

          while (i < j) {
            if (m % LOW_PRIME_LIST[i++] === 0n) {
              _notPrime = true;
              break;
            }
          }

          if (_notPrime) break;
        }

        if (_notPrime) continue;
        return x;
      }
    }
    /** modify from https://github.com/travist/jsencrypt*/

  }, {
    key: "_MillerRabinPrimalityTest",
    value: function _MillerRabinPrimalityTest(n) {
      var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;
      var LOW_PRIME_LIST = RSA.FITST_PRIMES_LIST;
      var LOW_PRIME_LENGTH = LOW_PRIME_LIST.length;
      var n1 = n - 1n;
      var k = 0;

      while (true) {
        if ((n1 & 1n << BigInt(k)) !== 0n) break;
        k++;
      }

      if (k <= 0) {
        return false;
      }

      var r = n1 >> BigInt(k);
      t = t + 1 >> 1;

      if (t > LOW_PRIME_LENGTH) {
        t = LOW_PRIME_LENGTH;
      }

      var count = Number(RSA.randint(0n, BigInt(LOW_PRIME_LENGTH)));

      for (var i = 0; i < t; ++i, count = (count + 1) % LOW_PRIME_LENGTH) {
        // Pick bases at random, instead of starting at 2
        var a = LOW_PRIME_LIST[count];
        var y = RSA.modExp(a, r, n);

        if (y !== 1n && y !== n1) {
          var j = 1;

          while (j++ < k && y !== n1) {
            y = y * y % n;

            if (y === 1n) {
              return false;
            }
          }

          if (y !== n1) {
            return false;
          }
        }
      }

      return true;
    }
  }, {
    key: "_extendedEuclidean",
    value: function _extendedEuclidean(a, b) {
      var old_s = 1n,
          s = 0n;
      var old_t = 0n,
          t = 1n;
      var old_r = a,
          r = b;
      if (b === 0n) return [1n, 0n, a];else {
        while (r !== 0n) {
          var q = old_r / r;
          var _ref4 = [r, old_r - q * r];
          old_r = _ref4[0];
          r = _ref4[1];
          var _ref5 = [s, old_s - q * s];
          old_s = _ref5[0];
          s = _ref5[1];
          var _ref6 = [t, old_t - q * t];
          old_t = _ref6[0];
          t = _ref6[1];
        }
      }

      if (old_t < 0n) {
        old_t = old_t % a;
        old_t += a;
      }

      return [old_s, old_t, old_r];
    }
  }, {
    key: "_generatePrimeNumberByProbability",
    value: function _generatePrimeNumberByProbability(n0, n1) {
      var maxIter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10000;

      for (var i = 0; i < maxIter; i++) {
        var prime_candidate = this._getLowLevelPrime(n0, n1);

        if (!this._MillerRabinPrimalityTest(prime_candidate)) continue;else return prime_candidate;
      }

      throw 'can not find prime number';
    }
  }, {
    key: "_getE",
    value: function _getE(lambda_n, p, q) {
      //method 1: use 2^16 + 1, ...
      var e_list1_pre = [65537n, 257n, 17n];

      for (var i = 0; i < e_list1_pre.length; i++) {
        var e = e_list1_pre[i];
        if (1n < e && e < lambda_n && lambda_n % e !== 0n
        /*since e is prime*/
        ) return e;
      } //method 2: use prime number.


      var a = RSA.gcd(p - 1n, q - 1n);
      var b = p - 1n / a;
      var c = q - 1n / a;
      var maxVal = a > b ? a : b;
      maxVal = maxVal > c ? maxVal : c;

      for (var i = 0; i < 100; i++) {
        var prime = this._getLowLevelPrime(65536n, maxVal);

        if (this._MillerRabinPrimalityTest(prime) && prime < lambda_n && lambda_n % prime !== 0n
        /*since e is prime*/
        ) {
          return prime;
        }
      } //method 3:　force.


      var e = lambda_n - 1n;

      while (e > 65536n) {
        if (RSA.gcd(e, lambda_n) === 1n) {
          return e;
        }

        e--;
      }

      throw 'can not find e.';
    }
  }], [{
    key: "randint",
    value: function randint(start, end) {
      var range = end - start;
      var ln2 = range.toString(2).length;
      var len = ln2 >> 3;
      if ((ln2 & 7) !== 0) len++;
      var randArr = crypto.getRandomValues(new Uint8Array(len));
      var bint = 0n;

      for (var i = 0; i < len; i++) {
        bint += BigInt(randArr[i]) << (BigInt(i) << 3n);
      }

      bint = range * bint / (1n << (BigInt(len) << 3n)) + start;
      return bint;
    }
  }, {
    key: "gcd",
    value: function gcd(a, b) {
      //Greatest Common Divisor Generator (Euclidean Algorithm)
      while (b !== 0n) {
        var _ref7 = [b, a % b];
        a = _ref7[0];
        b = _ref7[1];
      }

      return a;
    }
  }, {
    key: "lcm",
    value: function lcm(a, b) {
      return a * b / RSA.gcd(a, b);
    }
  }, {
    key: "log",
    value: function log(n) {
      var _ln = BigInt(n.toString(2).length - 1);

      return (_ln << 16n) / 94548n;
    }
  }, {
    key: "modExp",
    value: function modExp(x, e, m) {
      var X = x,
          E = e,
          Y = 1n;

      while (E > 0n) {
        if ((E & 1n) === 0n) {
          X = X * X % m;
          E = E >> 1n;
        } else {
          Y = X * Y % m;
          E = E - 1n;
        }
      }

      return Y;
    }
  }]);

  return RSA;
}();

_defineProperty(RSA, "FITST_PRIMES_LIST", [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997].map(function (n) {
  return BigInt(n);
}));

_defineProperty(RSA, "PADDING_K0", 32);

_defineProperty(RSA, "PADDING_K1", 8);

_defineProperty(RSA, "PADDING_N", 64);

_defineProperty(RSA, "HASH_FUNCTION", _SHA256__WEBPACK_IMPORTED_MODULE_0__.SHA256.instance.encode.bind(_SHA256__WEBPACK_IMPORTED_MODULE_0__.SHA256.instance));

_defineProperty(RSA, "HASH_FUNCTION_G", RSA.HASH_FUNCTION);

_defineProperty(RSA, "HASH_FUNCTION_H", RSA.HASH_FUNCTION);

/***/ }),

/***/ "./src/crypto/SHA256.js":
/*!******************************!*\
  !*** ./src/crypto/SHA256.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SHA256": () => (/* binding */ SHA256)
/* harmony export */ });
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Modify from https://geraintluff.github.io/sha256/
 */
var SHA256 = /*#__PURE__*/function () {
  function SHA256() {
    _classCallCheck(this, SHA256);

    _defineProperty(this, "MAX_WORD", 4294967296);

    _defineProperty(this, "HASH", new Int32Array(64));

    _defineProperty(this, "K", new Int32Array(64));

    var primeCounter = 0;
    var isComposite = new Uint16Array(313);
    var hash = this.HASH;
    var k = this.K;
    var maxWord = this.MAX_WORD;

    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (var i = 0; i < 313; i += candidate) {
          isComposite[i] = candidate;
        }

        hash[primeCounter] = Math.pow(candidate, 0.5) * maxWord | 0;
        k[primeCounter++] = Math.pow(candidate, 1 / 3) * maxWord | 0;
      }
    }
  }

  _createClass(SHA256, [{
    key: "_rightRotate",
    value: function _rightRotate(value, amount) {
      return value >>> amount | value << 32 - amount;
    }
  }, {
    key: "encode",
    value: function encode(byteArr) {
      var hash = this.HASH;
      var k = this.K;
      var maxWord = this.MAX_WORD;
      var words;
      var byteArrLength;
      var byteArrBitLength = byteArr.length * 8;
      var result = new Uint8Array(32);

      var _remainder = (byteArr.length + 1) % 64;

      if (_remainder > 56) _remainder = 64 - _remainder + 56;else _remainder = 56 - _remainder;

      var _tempByteArr = new Uint8Array(byteArr.length + 1 + _remainder);

      var _offset = 0;

      for (var i = 0; i < byteArr.length; i++, _offset++) {
        _tempByteArr[_offset] = byteArr[i];
      }

      _tempByteArr[_offset++] = 0x80;

      for (var i = 0; i < _remainder; i++, _offset++) {
        _tempByteArr[_offset] = 0;
      }

      byteArr = _tempByteArr;
      byteArrLength = byteArr.length;

      var _preWordLength = (byteArrLength >> 2) + 2;

      words = new Int32Array(_preWordLength);

      for (var i = 0; i < byteArrLength; i++) {
        var j = byteArr[i];
        if (j >> 8) throw 'only accept number in range 0-255'; // ASCII check: only accept characters in range 0-255

        words[i >> 2] |= j << (3 - i) % 4 * 8;
      }

      words[byteArrLength >> 2] = byteArrBitLength / maxWord | 0;
      words[(byteArrLength >> 2) + 1] = byteArrBitLength; // process each chunk

      for (var j = 0; j < words.length;) {
        var w = words.slice(j, j += 16); // The message is expanded into 64 words as part of the iteration

        var _arr = new Int32Array(64);

        for (var i = 0; i < w.length; i++) {
          _arr[i] = w[i];
        }

        w = _arr;
        var oldHash = hash; // This is now the undefinedworking hash", often labelled as variables a...g
        // (we have to truncate as well, otherwise extra entries at the end accumulate

        hash = hash.slice(0, 8);
        _arr = new Int32Array(72);

        for (var i = 64; i < 72; i++) {
          _arr[i] = hash[i - 64];
        }

        hash = _arr;

        for (var i = 0; i < 64; i++) {
          var i2 = i + j;
          var iHash = 64 - i; // Expand the message into 64 words
          // Used below if 
          // Iterate

          var a = hash[0 + iHash],
              e = hash[4 + iHash];

          var _num1 = this._rightRotate(e, 6) ^ this._rightRotate(e, 11) ^ this._rightRotate(e, 25); // S1


          var _num2 = e & hash[5 + iHash] ^ ~e & hash[6 + iHash]; // ch


          if (i >= 16) {
            // Expand the message schedule if needed
            var w15 = w[i - 15],
                w2 = w[i - 2];

            var _num11 = this._rightRotate(w15, 7) ^ this._rightRotate(w15, 18) ^ w15 >>> 3; // s0


            var _num12 = this._rightRotate(w2, 17) ^ this._rightRotate(w2, 19) ^ w2 >>> 10; // s1


            w[i] = w[i - 16] + _num11 + w[i - 7] + _num12 | 0;
          }

          var temp1 = hash[7 + iHash] + _num1 + _num2 + k[i] + w[i]; // This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble

          var _num3 = this._rightRotate(a, 2) ^ this._rightRotate(a, 13) ^ this._rightRotate(a, 22); // S0


          var _num4 = a & hash[1 + iHash] ^ a & hash[2 + iHash] ^ hash[1 + iHash] & hash[2 + iHash]; // maj


          var temp2 = _num3 + _num4; // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()

          hash[iHash - 1] = temp1 + temp2 | 0;
          iHash--;
          hash[4 + iHash] = hash[4 + iHash] + temp1 | 0;
        }

        for (var i = 0; i < 8; i++) {
          hash[i] = hash[i] + oldHash[i] | 0;
        }
      }

      var offset = 0;

      for (var i = 0; i < 8; i++) {
        for (var j = 3; j + 1; j--) {
          var b = hash[i] >> j * 8 & 255;
          result[offset++] = b;
        }
      }

      return result;
    }
  }], [{
    key: "instance",
    get: function get() {
      if (SHA256._instance == null) {
        SHA256._instance = new SHA256();
      }

      return SHA256._instance;
    }
  }]);

  return SHA256;
}();

_defineProperty(SHA256, "_instance", void 0);

/***/ }),

/***/ "./src/utils.js":
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "fromQueryString": () => (/* binding */ fromQueryString),
/* harmony export */   "toQueryString": () => (/* binding */ toQueryString),
/* harmony export */   "joinHostQuery": () => (/* binding */ joinHostQuery),
/* harmony export */   "buildHttpRequest": () => (/* binding */ buildHttpRequest),
/* harmony export */   "parseHttpResponse": () => (/* binding */ parseHttpResponse),
/* harmony export */   "getDefaultHttpRequest": () => (/* binding */ getDefaultHttpRequest),
/* harmony export */   "byteArrayToLong": () => (/* binding */ byteArrayToLong),
/* harmony export */   "longToByteArray": () => (/* binding */ longToByteArray),
/* harmony export */   "byteArrayToShort": () => (/* binding */ byteArrayToShort),
/* harmony export */   "shortToByteArray": () => (/* binding */ shortToByteArray)
/* harmony export */ });
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var encoder = new TextEncoder();
function fromQueryString(str) {
  var result = {};
  var lineList = str.split("&");

  var _iterator = _createForOfIteratorHelper(lineList),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var line = _step.value;

      var _line$split = line.split("="),
          _line$split2 = _slicedToArray(_line$split, 2),
          name = _line$split2[0],
          value = _line$split2[1];

      if (name != null) result[name] = value !== null && value !== void 0 ? value : "";
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return result;
}
function toQueryString(obj) {
  var result = "";
  var arr = Object.entries(obj);
  var name, value;

  if (arr.length > 0) {
    var _arr$ = _slicedToArray(arr[0], 2);

    name = _arr$[0];
    value = _arr$[1];
    result += name + "=" + value;
  }

  for (var i = 1; i < arr.length; i++) {
    var _arr$i = _slicedToArray(arr[i], 2);

    name = _arr$i[0];
    value = _arr$i[1];
    if (value == null || value === "") result += "&" + name;else result += "&" + name + "=" + value;
  }

  return result;
}
function joinHostQuery(host, queryString) {
  if (!host.endsWith("/")) host += "/";
  if (!host.endsWith("?")) host += "?";
  return host + queryString;
}
function buildHttpRequest(url, obj) {
  var _obj$method, _obj$body;

  var method = (_obj$method = obj.method) !== null && _obj$method !== void 0 ? _obj$method : "GET";
  var requestTarget = "/" + url.split("/").splice(3).join("/");
  var startLine = "".concat(method, " ").concat(requestTarget, " HTTP/2\r\n");
  var headers = "";

  for (var _i2 = 0, _Object$entries = Object.entries((_obj$headers = obj.headers) !== null && _obj$headers !== void 0 ? _obj$headers : {}); _i2 < _Object$entries.length; _i2++) {
    var _obj$headers;

    var _Object$entries$_i = _slicedToArray(_Object$entries[_i2], 2),
        key = _Object$entries$_i[0],
        val = _Object$entries$_i[1];

    if (val instanceof Array) {
      var _iterator2 = _createForOfIteratorHelper(val),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var v = _step2.value;
          headers += "".concat(key, ":").concat(v, "\r\n");
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    } else headers += "".concat(key, ":").concat(val, "\r\n");
  }

  var body = (_obj$body = obj.body) !== null && _obj$body !== void 0 ? _obj$body : "";
  if (typeof body === "string") body = encoder.encode(body);
  return [startLine + headers + "\r\n", body];
}
function parseHttpResponse(arr) {
  var len = arr.length;
  var result = {
    httpVersion: null,
    statusCode: null,
    reasonPhrase: null,
    headers: {},
    body: null
  };
  var decoder = new TextDecoder();
  var lineList = [];
  var lastCRLFIndex = 0;

  for (var i = 1; i < len; i++) {
    if (arr[i] === 10 && arr[i - 1] === 13) {
      // if requestData[i-1:i+1] = "\r\n"
      if (i - 1 === lastCRLFIndex) {
        // if duplicate \r\n occur, then split headers and body
        lastCRLFIndex = i + 1;
        result.body = arr.subarray(lastCRLFIndex, len);
        break;
      }

      var tmpBytes = arr.subarray(lastCRLFIndex, i - 1);
      lineList.push(decoder.decode(tmpBytes));
      lastCRLFIndex = i + 1;
    }
  } //parse start line


  var startLine = lineList.shift().split(" ");
  result.httpVersion = startLine[0].split("/")[1];
  result.statusCode = Number.parseInt(startLine[1]);
  result.reasonPhrase = startLine[2]; //parse headers

  var headers = result.headers;

  for (var _i3 = 0, _lineList = lineList; _i3 < _lineList.length; _i3++) {
    var line = _lineList[_i3];
    line = line.split(":");

    if (line.length === 2) {
      var _headers$key;

      var _line = line,
          _line2 = _slicedToArray(_line, 2),
          key = _line2[0],
          val = _line2[1];

      headers[key] = (_headers$key = headers[key]) !== null && _headers$key !== void 0 ? _headers$key : [];
      headers[key].push(val);
    } else if (line.length === 1) {
      var _headers$line$;

      headers[line[0]] = (_headers$line$ = headers[line[0]]) !== null && _headers$line$ !== void 0 ? _headers$line$ : [];
    }
  }

  return result;
}
function getDefaultHttpRequest(url) {
  return {
    method: "GET",
    headers: {
      "Host": url.split("/")[2],
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "zh-TW,zh;q=0.8,en-US;q=0.5,en;q=0.3",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0"
    }
  };
}
function byteArrayToLong(arr) {
  return Number(new BigInt64Array(arr.slice().buffer)[0]);
}
function longToByteArray(num) {
  return new Uint8Array(new BigInt64Array([BigInt(num)]).buffer);
}
function byteArrayToShort(arr) {
  return new Uint16Array(arr.slice().buffer)[0];
}
function shortToByteArray(num) {
  return new Uint8Array(new Uint16Array([num]).buffer);
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!***********************!*\
  !*** ./test/index.js ***!
  \***********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "server": () => (/* binding */ server),
/* harmony export */   "test": () => (/* binding */ test)
/* harmony export */ });
/* harmony import */ var _src_FileSystemClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../src/FileSystemClient */ "./src/FileSystemClient.js");

var server = new _src_FileSystemClient__WEBPACK_IMPORTED_MODULE_0__.FileSystemClient();
function test(token) {
  var port = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "1234";
  var secure = arguments.length > 2 ? arguments[2] : undefined;
  return server.connect("http://localhost:" + port, token, secure);
}
})();

test = __webpack_exports__;
/******/ })()
;