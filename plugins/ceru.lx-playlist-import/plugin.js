exports.manifest = {
  manifestVersion: 2,
  id: "ceru.lx-playlist-import",
  name: "洛雪歌单导入",
  version: "1.0.0",
  description: "读取洛雪音乐（LX Music）导出的 .json / .lxmc 歌单文件，解析后导入澜音本地歌单",
  author: "澜音团队",
  homepage: "https://lxmusic.toside.cn/desktop",
  engines: {
    hostApi: "^2.0.0",
    logicRuntime: "ceru-js@1",
    uiSchema: "^1.0.0"
  },
  modules: {
    logic: {
      entry: "logic.main"
    },
    surfaces: [
      {
        id: "import",
        kind: "web",
        entry: "view.import",
        title: "洛雪歌单导入",
        presentation: {
          kind: "modal",
          size: 620
        }
      }
    ]
  },
  contributes: {
    commands: [
      {
        id: "import.open",
        title: "洛雪歌单导入",
        description: "打开洛雪歌单导入面板",
        action: "import.open"
      },
      {
        id: "import.pick",
        title: "选择洛雪歌单文件",
        description: "导入面板调用：选择并解析本机上的洛雪歌单文件",
        action: "import.pick"
      },
      {
        id: "import.commit",
        title: "写入澜音歌单",
        description: "导入面板调用：把解析结果写入澜音本地歌单",
        action: "import.commit"
      }
    ],
    menus: [
      {
        id: "lx-playlist-file",
        slot: "playlist.import",
        title: "从洛雪歌单文件导入",
        description: "选择洛雪导出的 .json / .lxmc 歌单文件",
        commandId: "import.open",
        icon: {
          kind: "host",
          name: "import"
        },
        when: {
          kinds: [
            "playlist"
          ]
        }
      }
    ]
  },
  permissions: [
    {
      key: "files.read",
      name: "files.read",
      optional: true,
      reason: "读取你选择的洛雪歌单文件（.json / .lxmc）"
    },
    {
      key: "library.write",
      name: "library.write",
      optional: true,
      reason: "把解析出的歌曲写入澜音本地歌单，由软件负责去重、持久化和云同步"
    }
  ],
  dataSchemas: {
    config: 1,
    state: 1
  }
};
exports.package = {
  formatVersion: 2,
  syntax: "js",
  signature: null
};
// Invisible plugin logic
const LogicMain = /* @ceru-self-contained */ async function LogicMain(ctx) {
"use strict";
const __ceru_entry = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/.pnpm/base64-js@1.5.1/node_modules/base64-js/index.js
  var require_base64_js = __commonJS({
    "node_modules/.pnpm/base64-js@1.5.1/node_modules/base64-js/index.js"(exports) {
      "use strict";
      exports.byteLength = byteLength;
      exports.toByteArray = toByteArray;
      exports.fromByteArray = fromByteArray;
      var lookup = [];
      var revLookup = [];
      var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
      var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      for (i2 = 0, len = code.length; i2 < len; ++i2) {
        lookup[i2] = code[i2];
        revLookup[code.charCodeAt(i2)] = i2;
      }
      var i2;
      var len;
      revLookup["-".charCodeAt(0)] = 62;
      revLookup["_".charCodeAt(0)] = 63;
      function getLens(b64) {
        var len2 = b64.length;
        if (len2 % 4 > 0) {
          throw new Error("Invalid string. Length must be a multiple of 4");
        }
        var validLen = b64.indexOf("=");
        if (validLen === -1) validLen = len2;
        var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
        return [validLen, placeHoldersLen];
      }
      function byteLength(b64) {
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function _byteLength(b64, validLen, placeHoldersLen) {
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function toByteArray(b64) {
        var tmp;
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
        var curByte = 0;
        var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
        var i3;
        for (i3 = 0; i3 < len2; i3 += 4) {
          tmp = revLookup[b64.charCodeAt(i3)] << 18 | revLookup[b64.charCodeAt(i3 + 1)] << 12 | revLookup[b64.charCodeAt(i3 + 2)] << 6 | revLookup[b64.charCodeAt(i3 + 3)];
          arr[curByte++] = tmp >> 16 & 255;
          arr[curByte++] = tmp >> 8 & 255;
          arr[curByte++] = tmp & 255;
        }
        if (placeHoldersLen === 2) {
          tmp = revLookup[b64.charCodeAt(i3)] << 2 | revLookup[b64.charCodeAt(i3 + 1)] >> 4;
          arr[curByte++] = tmp & 255;
        }
        if (placeHoldersLen === 1) {
          tmp = revLookup[b64.charCodeAt(i3)] << 10 | revLookup[b64.charCodeAt(i3 + 1)] << 4 | revLookup[b64.charCodeAt(i3 + 2)] >> 2;
          arr[curByte++] = tmp >> 8 & 255;
          arr[curByte++] = tmp & 255;
        }
        return arr;
      }
      function tripletToBase64(num) {
        return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
      }
      function encodeChunk(uint8, start, end) {
        var tmp;
        var output = [];
        for (var i3 = start; i3 < end; i3 += 3) {
          tmp = (uint8[i3] << 16 & 16711680) + (uint8[i3 + 1] << 8 & 65280) + (uint8[i3 + 2] & 255);
          output.push(tripletToBase64(tmp));
        }
        return output.join("");
      }
      function fromByteArray(uint8) {
        var tmp;
        var len2 = uint8.length;
        var extraBytes = len2 % 3;
        var parts = [];
        var maxChunkLength = 16383;
        for (var i3 = 0, len22 = len2 - extraBytes; i3 < len22; i3 += maxChunkLength) {
          parts.push(encodeChunk(uint8, i3, i3 + maxChunkLength > len22 ? len22 : i3 + maxChunkLength));
        }
        if (extraBytes === 1) {
          tmp = uint8[len2 - 1];
          parts.push(
            lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
          );
        } else if (extraBytes === 2) {
          tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
          parts.push(
            lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
          );
        }
        return parts.join("");
      }
    }
  });

  // node_modules/.pnpm/ieee754@1.2.1/node_modules/ieee754/index.js
  var require_ieee754 = __commonJS({
    "node_modules/.pnpm/ieee754@1.2.1/node_modules/ieee754/index.js"(exports) {
      "use strict";
      /*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
      exports.read = function(buffer, offset, isLE, mLen, nBytes) {
        var e, m;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var nBits = -7;
        var i2 = isLE ? nBytes - 1 : 0;
        var d = isLE ? -1 : 1;
        var s = buffer[offset + i2];
        i2 += d;
        e = s & (1 << -nBits) - 1;
        s >>= -nBits;
        nBits += eLen;
        for (; nBits > 0; e = e * 256 + buffer[offset + i2], i2 += d, nBits -= 8) {
        }
        m = e & (1 << -nBits) - 1;
        e >>= -nBits;
        nBits += mLen;
        for (; nBits > 0; m = m * 256 + buffer[offset + i2], i2 += d, nBits -= 8) {
        }
        if (e === 0) {
          e = 1 - eBias;
        } else if (e === eMax) {
          return m ? NaN : (s ? -1 : 1) * Infinity;
        } else {
          m = m + Math.pow(2, mLen);
          e = e - eBias;
        }
        return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
      };
      exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
        var e, m, c;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
        var i2 = isLE ? 0 : nBytes - 1;
        var d = isLE ? 1 : -1;
        var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
        value = Math.abs(value);
        if (isNaN(value) || value === Infinity) {
          m = isNaN(value) ? 1 : 0;
          e = eMax;
        } else {
          e = Math.floor(Math.log(value) / Math.LN2);
          if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
          }
          if (e + eBias >= 1) {
            value += rt / c;
          } else {
            value += rt * Math.pow(2, 1 - eBias);
          }
          if (value * c >= 2) {
            e++;
            c /= 2;
          }
          if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
          } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
          } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
          }
        }
        for (; mLen >= 8; buffer[offset + i2] = m & 255, i2 += d, m /= 256, mLen -= 8) {
        }
        e = e << mLen | m;
        eLen += mLen;
        for (; eLen > 0; buffer[offset + i2] = e & 255, i2 += d, e /= 256, eLen -= 8) {
        }
        buffer[offset + i2 - d] |= s * 128;
      };
    }
  });

  // node_modules/.pnpm/buffer@6.0.3/node_modules/buffer/index.js
  var require_buffer = __commonJS({
    "node_modules/.pnpm/buffer@6.0.3/node_modules/buffer/index.js"(exports) {
      "use strict";
      /*!
       * The buffer module from node.js, for the browser.
       *
       * @author   Feross Aboukhadijeh <https://feross.org>
       * @license  MIT
       */
      var base64 = require_base64_js();
      var ieee754 = require_ieee754();
      var customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
      exports.Buffer = Buffer3;
      exports.SlowBuffer = SlowBuffer;
      exports.INSPECT_MAX_BYTES = 50;
      var K_MAX_LENGTH = 2147483647;
      exports.kMaxLength = K_MAX_LENGTH;
      Buffer3.TYPED_ARRAY_SUPPORT = typedArraySupport();
      if (!Buffer3.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
        console.error(
          "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
        );
      }
      function typedArraySupport() {
        try {
          const arr = new Uint8Array(1);
          const proto = { foo: function() {
            return 42;
          } };
          Object.setPrototypeOf(proto, Uint8Array.prototype);
          Object.setPrototypeOf(arr, proto);
          return arr.foo() === 42;
        } catch (e) {
          return false;
        }
      }
      Object.defineProperty(Buffer3.prototype, "parent", {
        enumerable: true,
        get: function() {
          if (!Buffer3.isBuffer(this)) return void 0;
          return this.buffer;
        }
      });
      Object.defineProperty(Buffer3.prototype, "offset", {
        enumerable: true,
        get: function() {
          if (!Buffer3.isBuffer(this)) return void 0;
          return this.byteOffset;
        }
      });
      function createBuffer(length) {
        if (length > K_MAX_LENGTH) {
          throw new RangeError('The value "' + length + '" is invalid for option "size"');
        }
        const buf = new Uint8Array(length);
        Object.setPrototypeOf(buf, Buffer3.prototype);
        return buf;
      }
      function Buffer3(arg, encodingOrOffset, length) {
        if (typeof arg === "number") {
          if (typeof encodingOrOffset === "string") {
            throw new TypeError(
              'The "string" argument must be of type string. Received type number'
            );
          }
          return allocUnsafe(arg);
        }
        return from(arg, encodingOrOffset, length);
      }
      Buffer3.poolSize = 8192;
      function from(value, encodingOrOffset, length) {
        if (typeof value === "string") {
          return fromString(value, encodingOrOffset);
        }
        if (ArrayBuffer.isView(value)) {
          return fromArrayView(value);
        }
        if (value == null) {
          throw new TypeError(
            "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
          );
        }
        if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
          return fromArrayBuffer(value, encodingOrOffset, length);
        }
        if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer))) {
          return fromArrayBuffer(value, encodingOrOffset, length);
        }
        if (typeof value === "number") {
          throw new TypeError(
            'The "value" argument must not be of type number. Received type number'
          );
        }
        const valueOf = value.valueOf && value.valueOf();
        if (valueOf != null && valueOf !== value) {
          return Buffer3.from(valueOf, encodingOrOffset, length);
        }
        const b = fromObject(value);
        if (b) return b;
        if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
          return Buffer3.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
        }
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
        );
      }
      Buffer3.from = function(value, encodingOrOffset, length) {
        return from(value, encodingOrOffset, length);
      };
      Object.setPrototypeOf(Buffer3.prototype, Uint8Array.prototype);
      Object.setPrototypeOf(Buffer3, Uint8Array);
      function assertSize(size) {
        if (typeof size !== "number") {
          throw new TypeError('"size" argument must be of type number');
        } else if (size < 0) {
          throw new RangeError('The value "' + size + '" is invalid for option "size"');
        }
      }
      function alloc(size, fill, encoding) {
        assertSize(size);
        if (size <= 0) {
          return createBuffer(size);
        }
        if (fill !== void 0) {
          return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
        }
        return createBuffer(size);
      }
      Buffer3.alloc = function(size, fill, encoding) {
        return alloc(size, fill, encoding);
      };
      function allocUnsafe(size) {
        assertSize(size);
        return createBuffer(size < 0 ? 0 : checked(size) | 0);
      }
      Buffer3.allocUnsafe = function(size) {
        return allocUnsafe(size);
      };
      Buffer3.allocUnsafeSlow = function(size) {
        return allocUnsafe(size);
      };
      function fromString(string, encoding) {
        if (typeof encoding !== "string" || encoding === "") {
          encoding = "utf8";
        }
        if (!Buffer3.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: " + encoding);
        }
        const length = byteLength(string, encoding) | 0;
        let buf = createBuffer(length);
        const actual = buf.write(string, encoding);
        if (actual !== length) {
          buf = buf.slice(0, actual);
        }
        return buf;
      }
      function fromArrayLike(array) {
        const length = array.length < 0 ? 0 : checked(array.length) | 0;
        const buf = createBuffer(length);
        for (let i2 = 0; i2 < length; i2 += 1) {
          buf[i2] = array[i2] & 255;
        }
        return buf;
      }
      function fromArrayView(arrayView) {
        if (isInstance(arrayView, Uint8Array)) {
          const copy = new Uint8Array(arrayView);
          return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
        }
        return fromArrayLike(arrayView);
      }
      function fromArrayBuffer(array, byteOffset, length) {
        if (byteOffset < 0 || array.byteLength < byteOffset) {
          throw new RangeError('"offset" is outside of buffer bounds');
        }
        if (array.byteLength < byteOffset + (length || 0)) {
          throw new RangeError('"length" is outside of buffer bounds');
        }
        let buf;
        if (byteOffset === void 0 && length === void 0) {
          buf = new Uint8Array(array);
        } else if (length === void 0) {
          buf = new Uint8Array(array, byteOffset);
        } else {
          buf = new Uint8Array(array, byteOffset, length);
        }
        Object.setPrototypeOf(buf, Buffer3.prototype);
        return buf;
      }
      function fromObject(obj) {
        if (Buffer3.isBuffer(obj)) {
          const len = checked(obj.length) | 0;
          const buf = createBuffer(len);
          if (buf.length === 0) {
            return buf;
          }
          obj.copy(buf, 0, 0, len);
          return buf;
        }
        if (obj.length !== void 0) {
          if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
            return createBuffer(0);
          }
          return fromArrayLike(obj);
        }
        if (obj.type === "Buffer" && Array.isArray(obj.data)) {
          return fromArrayLike(obj.data);
        }
      }
      function checked(length) {
        if (length >= K_MAX_LENGTH) {
          throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
        }
        return length | 0;
      }
      function SlowBuffer(length) {
        if (+length != length) {
          length = 0;
        }
        return Buffer3.alloc(+length);
      }
      Buffer3.isBuffer = function isBuffer(b) {
        return b != null && b._isBuffer === true && b !== Buffer3.prototype;
      };
      Buffer3.compare = function compare(a, b) {
        if (isInstance(a, Uint8Array)) a = Buffer3.from(a, a.offset, a.byteLength);
        if (isInstance(b, Uint8Array)) b = Buffer3.from(b, b.offset, b.byteLength);
        if (!Buffer3.isBuffer(a) || !Buffer3.isBuffer(b)) {
          throw new TypeError(
            'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
          );
        }
        if (a === b) return 0;
        let x2 = a.length;
        let y = b.length;
        for (let i2 = 0, len = Math.min(x2, y); i2 < len; ++i2) {
          if (a[i2] !== b[i2]) {
            x2 = a[i2];
            y = b[i2];
            break;
          }
        }
        if (x2 < y) return -1;
        if (y < x2) return 1;
        return 0;
      };
      Buffer3.isEncoding = function isEncoding(encoding) {
        switch (String(encoding).toLowerCase()) {
          case "hex":
          case "utf8":
          case "utf-8":
          case "ascii":
          case "latin1":
          case "binary":
          case "base64":
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return true;
          default:
            return false;
        }
      };
      Buffer3.concat = function concat(list, length) {
        if (!Array.isArray(list)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        }
        if (list.length === 0) {
          return Buffer3.alloc(0);
        }
        let i2;
        if (length === void 0) {
          length = 0;
          for (i2 = 0; i2 < list.length; ++i2) {
            length += list[i2].length;
          }
        }
        const buffer = Buffer3.allocUnsafe(length);
        let pos = 0;
        for (i2 = 0; i2 < list.length; ++i2) {
          let buf = list[i2];
          if (isInstance(buf, Uint8Array)) {
            if (pos + buf.length > buffer.length) {
              if (!Buffer3.isBuffer(buf)) buf = Buffer3.from(buf);
              buf.copy(buffer, pos);
            } else {
              Uint8Array.prototype.set.call(
                buffer,
                buf,
                pos
              );
            }
          } else if (!Buffer3.isBuffer(buf)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
          } else {
            buf.copy(buffer, pos);
          }
          pos += buf.length;
        }
        return buffer;
      };
      function byteLength(string, encoding) {
        if (Buffer3.isBuffer(string)) {
          return string.length;
        }
        if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
          return string.byteLength;
        }
        if (typeof string !== "string") {
          throw new TypeError(
            'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string
          );
        }
        const len = string.length;
        const mustMatch = arguments.length > 2 && arguments[2] === true;
        if (!mustMatch && len === 0) return 0;
        let loweredCase = false;
        for (; ; ) {
          switch (encoding) {
            case "ascii":
            case "latin1":
            case "binary":
              return len;
            case "utf8":
            case "utf-8":
              return utf8ToBytes(string).length;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return len * 2;
            case "hex":
              return len >>> 1;
            case "base64":
              return base64ToBytes(string).length;
            default:
              if (loweredCase) {
                return mustMatch ? -1 : utf8ToBytes(string).length;
              }
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      }
      Buffer3.byteLength = byteLength;
      function slowToString(encoding, start, end) {
        let loweredCase = false;
        if (start === void 0 || start < 0) {
          start = 0;
        }
        if (start > this.length) {
          return "";
        }
        if (end === void 0 || end > this.length) {
          end = this.length;
        }
        if (end <= 0) {
          return "";
        }
        end >>>= 0;
        start >>>= 0;
        if (end <= start) {
          return "";
        }
        if (!encoding) encoding = "utf8";
        while (true) {
          switch (encoding) {
            case "hex":
              return hexSlice(this, start, end);
            case "utf8":
            case "utf-8":
              return utf8Slice(this, start, end);
            case "ascii":
              return asciiSlice(this, start, end);
            case "latin1":
            case "binary":
              return latin1Slice(this, start, end);
            case "base64":
              return base64Slice(this, start, end);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return utf16leSlice(this, start, end);
            default:
              if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
              encoding = (encoding + "").toLowerCase();
              loweredCase = true;
          }
        }
      }
      Buffer3.prototype._isBuffer = true;
      function swap(b, n, m) {
        const i2 = b[n];
        b[n] = b[m];
        b[m] = i2;
      }
      Buffer3.prototype.swap16 = function swap16() {
        const len = this.length;
        if (len % 2 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 16-bits");
        }
        for (let i2 = 0; i2 < len; i2 += 2) {
          swap(this, i2, i2 + 1);
        }
        return this;
      };
      Buffer3.prototype.swap32 = function swap32() {
        const len = this.length;
        if (len % 4 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 32-bits");
        }
        for (let i2 = 0; i2 < len; i2 += 4) {
          swap(this, i2, i2 + 3);
          swap(this, i2 + 1, i2 + 2);
        }
        return this;
      };
      Buffer3.prototype.swap64 = function swap64() {
        const len = this.length;
        if (len % 8 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 64-bits");
        }
        for (let i2 = 0; i2 < len; i2 += 8) {
          swap(this, i2, i2 + 7);
          swap(this, i2 + 1, i2 + 6);
          swap(this, i2 + 2, i2 + 5);
          swap(this, i2 + 3, i2 + 4);
        }
        return this;
      };
      Buffer3.prototype.toString = function toString() {
        const length = this.length;
        if (length === 0) return "";
        if (arguments.length === 0) return utf8Slice(this, 0, length);
        return slowToString.apply(this, arguments);
      };
      Buffer3.prototype.toLocaleString = Buffer3.prototype.toString;
      Buffer3.prototype.equals = function equals(b) {
        if (!Buffer3.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
        if (this === b) return true;
        return Buffer3.compare(this, b) === 0;
      };
      Buffer3.prototype.inspect = function inspect() {
        let str = "";
        const max2 = exports.INSPECT_MAX_BYTES;
        str = this.toString("hex", 0, max2).replace(/(.{2})/g, "$1 ").trim();
        if (this.length > max2) str += " ... ";
        return "<Buffer " + str + ">";
      };
      if (customInspectSymbol) {
        Buffer3.prototype[customInspectSymbol] = Buffer3.prototype.inspect;
      }
      Buffer3.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
        if (isInstance(target, Uint8Array)) {
          target = Buffer3.from(target, target.offset, target.byteLength);
        }
        if (!Buffer3.isBuffer(target)) {
          throw new TypeError(
            'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target
          );
        }
        if (start === void 0) {
          start = 0;
        }
        if (end === void 0) {
          end = target ? target.length : 0;
        }
        if (thisStart === void 0) {
          thisStart = 0;
        }
        if (thisEnd === void 0) {
          thisEnd = this.length;
        }
        if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
          throw new RangeError("out of range index");
        }
        if (thisStart >= thisEnd && start >= end) {
          return 0;
        }
        if (thisStart >= thisEnd) {
          return -1;
        }
        if (start >= end) {
          return 1;
        }
        start >>>= 0;
        end >>>= 0;
        thisStart >>>= 0;
        thisEnd >>>= 0;
        if (this === target) return 0;
        let x2 = thisEnd - thisStart;
        let y = end - start;
        const len = Math.min(x2, y);
        const thisCopy = this.slice(thisStart, thisEnd);
        const targetCopy = target.slice(start, end);
        for (let i2 = 0; i2 < len; ++i2) {
          if (thisCopy[i2] !== targetCopy[i2]) {
            x2 = thisCopy[i2];
            y = targetCopy[i2];
            break;
          }
        }
        if (x2 < y) return -1;
        if (y < x2) return 1;
        return 0;
      };
      function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
        if (buffer.length === 0) return -1;
        if (typeof byteOffset === "string") {
          encoding = byteOffset;
          byteOffset = 0;
        } else if (byteOffset > 2147483647) {
          byteOffset = 2147483647;
        } else if (byteOffset < -2147483648) {
          byteOffset = -2147483648;
        }
        byteOffset = +byteOffset;
        if (numberIsNaN(byteOffset)) {
          byteOffset = dir ? 0 : buffer.length - 1;
        }
        if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
        if (byteOffset >= buffer.length) {
          if (dir) return -1;
          else byteOffset = buffer.length - 1;
        } else if (byteOffset < 0) {
          if (dir) byteOffset = 0;
          else return -1;
        }
        if (typeof val === "string") {
          val = Buffer3.from(val, encoding);
        }
        if (Buffer3.isBuffer(val)) {
          if (val.length === 0) {
            return -1;
          }
          return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
        } else if (typeof val === "number") {
          val = val & 255;
          if (typeof Uint8Array.prototype.indexOf === "function") {
            if (dir) {
              return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
            } else {
              return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
            }
          }
          return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
        }
        throw new TypeError("val must be string, number or Buffer");
      }
      function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
        let indexSize = 1;
        let arrLength = arr.length;
        let valLength = val.length;
        if (encoding !== void 0) {
          encoding = String(encoding).toLowerCase();
          if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
            if (arr.length < 2 || val.length < 2) {
              return -1;
            }
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2;
          }
        }
        function read(buf, i3) {
          if (indexSize === 1) {
            return buf[i3];
          } else {
            return buf.readUInt16BE(i3 * indexSize);
          }
        }
        let i2;
        if (dir) {
          let foundIndex = -1;
          for (i2 = byteOffset; i2 < arrLength; i2++) {
            if (read(arr, i2) === read(val, foundIndex === -1 ? 0 : i2 - foundIndex)) {
              if (foundIndex === -1) foundIndex = i2;
              if (i2 - foundIndex + 1 === valLength) return foundIndex * indexSize;
            } else {
              if (foundIndex !== -1) i2 -= i2 - foundIndex;
              foundIndex = -1;
            }
          }
        } else {
          if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
          for (i2 = byteOffset; i2 >= 0; i2--) {
            let found = true;
            for (let j = 0; j < valLength; j++) {
              if (read(arr, i2 + j) !== read(val, j)) {
                found = false;
                break;
              }
            }
            if (found) return i2;
          }
        }
        return -1;
      }
      Buffer3.prototype.includes = function includes(val, byteOffset, encoding) {
        return this.indexOf(val, byteOffset, encoding) !== -1;
      };
      Buffer3.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
      };
      Buffer3.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
      };
      function hexWrite(buf, string, offset, length) {
        offset = Number(offset) || 0;
        const remaining = buf.length - offset;
        if (!length) {
          length = remaining;
        } else {
          length = Number(length);
          if (length > remaining) {
            length = remaining;
          }
        }
        const strLen = string.length;
        if (length > strLen / 2) {
          length = strLen / 2;
        }
        let i2;
        for (i2 = 0; i2 < length; ++i2) {
          const parsed = parseInt(string.substr(i2 * 2, 2), 16);
          if (numberIsNaN(parsed)) return i2;
          buf[offset + i2] = parsed;
        }
        return i2;
      }
      function utf8Write(buf, string, offset, length) {
        return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
      }
      function asciiWrite(buf, string, offset, length) {
        return blitBuffer(asciiToBytes(string), buf, offset, length);
      }
      function base64Write(buf, string, offset, length) {
        return blitBuffer(base64ToBytes(string), buf, offset, length);
      }
      function ucs2Write(buf, string, offset, length) {
        return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
      }
      Buffer3.prototype.write = function write(string, offset, length, encoding) {
        if (offset === void 0) {
          encoding = "utf8";
          length = this.length;
          offset = 0;
        } else if (length === void 0 && typeof offset === "string") {
          encoding = offset;
          length = this.length;
          offset = 0;
        } else if (isFinite(offset)) {
          offset = offset >>> 0;
          if (isFinite(length)) {
            length = length >>> 0;
            if (encoding === void 0) encoding = "utf8";
          } else {
            encoding = length;
            length = void 0;
          }
        } else {
          throw new Error(
            "Buffer.write(string, encoding, offset[, length]) is no longer supported"
          );
        }
        const remaining = this.length - offset;
        if (length === void 0 || length > remaining) length = remaining;
        if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
          throw new RangeError("Attempt to write outside buffer bounds");
        }
        if (!encoding) encoding = "utf8";
        let loweredCase = false;
        for (; ; ) {
          switch (encoding) {
            case "hex":
              return hexWrite(this, string, offset, length);
            case "utf8":
            case "utf-8":
              return utf8Write(this, string, offset, length);
            case "ascii":
            case "latin1":
            case "binary":
              return asciiWrite(this, string, offset, length);
            case "base64":
              return base64Write(this, string, offset, length);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return ucs2Write(this, string, offset, length);
            default:
              if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      };
      Buffer3.prototype.toJSON = function toJSON() {
        return {
          type: "Buffer",
          data: Array.prototype.slice.call(this._arr || this, 0)
        };
      };
      function base64Slice(buf, start, end) {
        if (start === 0 && end === buf.length) {
          return base64.fromByteArray(buf);
        } else {
          return base64.fromByteArray(buf.slice(start, end));
        }
      }
      function utf8Slice(buf, start, end) {
        end = Math.min(buf.length, end);
        const res = [];
        let i2 = start;
        while (i2 < end) {
          const firstByte = buf[i2];
          let codePoint = null;
          let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
          if (i2 + bytesPerSequence <= end) {
            let secondByte, thirdByte, fourthByte, tempCodePoint;
            switch (bytesPerSequence) {
              case 1:
                if (firstByte < 128) {
                  codePoint = firstByte;
                }
                break;
              case 2:
                secondByte = buf[i2 + 1];
                if ((secondByte & 192) === 128) {
                  tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                  if (tempCodePoint > 127) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 3:
                secondByte = buf[i2 + 1];
                thirdByte = buf[i2 + 2];
                if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                  tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                  if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 4:
                secondByte = buf[i2 + 1];
                thirdByte = buf[i2 + 2];
                fourthByte = buf[i2 + 3];
                if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                  tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                  if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                    codePoint = tempCodePoint;
                  }
                }
            }
          }
          if (codePoint === null) {
            codePoint = 65533;
            bytesPerSequence = 1;
          } else if (codePoint > 65535) {
            codePoint -= 65536;
            res.push(codePoint >>> 10 & 1023 | 55296);
            codePoint = 56320 | codePoint & 1023;
          }
          res.push(codePoint);
          i2 += bytesPerSequence;
        }
        return decodeCodePointsArray(res);
      }
      var MAX_ARGUMENTS_LENGTH = 4096;
      function decodeCodePointsArray(codePoints) {
        const len = codePoints.length;
        if (len <= MAX_ARGUMENTS_LENGTH) {
          return String.fromCharCode.apply(String, codePoints);
        }
        let res = "";
        let i2 = 0;
        while (i2 < len) {
          res += String.fromCharCode.apply(
            String,
            codePoints.slice(i2, i2 += MAX_ARGUMENTS_LENGTH)
          );
        }
        return res;
      }
      function asciiSlice(buf, start, end) {
        let ret = "";
        end = Math.min(buf.length, end);
        for (let i2 = start; i2 < end; ++i2) {
          ret += String.fromCharCode(buf[i2] & 127);
        }
        return ret;
      }
      function latin1Slice(buf, start, end) {
        let ret = "";
        end = Math.min(buf.length, end);
        for (let i2 = start; i2 < end; ++i2) {
          ret += String.fromCharCode(buf[i2]);
        }
        return ret;
      }
      function hexSlice(buf, start, end) {
        const len = buf.length;
        if (!start || start < 0) start = 0;
        if (!end || end < 0 || end > len) end = len;
        let out = "";
        for (let i2 = start; i2 < end; ++i2) {
          out += hexSliceLookupTable[buf[i2]];
        }
        return out;
      }
      function utf16leSlice(buf, start, end) {
        const bytes = buf.slice(start, end);
        let res = "";
        for (let i2 = 0; i2 < bytes.length - 1; i2 += 2) {
          res += String.fromCharCode(bytes[i2] + bytes[i2 + 1] * 256);
        }
        return res;
      }
      Buffer3.prototype.slice = function slice(start, end) {
        const len = this.length;
        start = ~~start;
        end = end === void 0 ? len : ~~end;
        if (start < 0) {
          start += len;
          if (start < 0) start = 0;
        } else if (start > len) {
          start = len;
        }
        if (end < 0) {
          end += len;
          if (end < 0) end = 0;
        } else if (end > len) {
          end = len;
        }
        if (end < start) end = start;
        const newBuf = this.subarray(start, end);
        Object.setPrototypeOf(newBuf, Buffer3.prototype);
        return newBuf;
      };
      function checkOffset(offset, ext, length) {
        if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
        if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
      }
      Buffer3.prototype.readUintLE = Buffer3.prototype.readUIntLE = function readUIntLE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let val = this[offset];
        let mul = 1;
        let i2 = 0;
        while (++i2 < byteLength2 && (mul *= 256)) {
          val += this[offset + i2] * mul;
        }
        return val;
      };
      Buffer3.prototype.readUintBE = Buffer3.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          checkOffset(offset, byteLength2, this.length);
        }
        let val = this[offset + --byteLength2];
        let mul = 1;
        while (byteLength2 > 0 && (mul *= 256)) {
          val += this[offset + --byteLength2] * mul;
        }
        return val;
      };
      Buffer3.prototype.readUint8 = Buffer3.prototype.readUInt8 = function readUInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        return this[offset];
      };
      Buffer3.prototype.readUint16LE = Buffer3.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] | this[offset + 1] << 8;
      };
      Buffer3.prototype.readUint16BE = Buffer3.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] << 8 | this[offset + 1];
      };
      Buffer3.prototype.readUint32LE = Buffer3.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
      };
      Buffer3.prototype.readUint32BE = Buffer3.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
      };
      Buffer3.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const lo = first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
        const hi = this[++offset] + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + last * 2 ** 24;
        return BigInt(lo) + (BigInt(hi) << BigInt(32));
      });
      Buffer3.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
        const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last;
        return (BigInt(hi) << BigInt(32)) + BigInt(lo);
      });
      Buffer3.prototype.readIntLE = function readIntLE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let val = this[offset];
        let mul = 1;
        let i2 = 0;
        while (++i2 < byteLength2 && (mul *= 256)) {
          val += this[offset + i2] * mul;
        }
        mul *= 128;
        if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer3.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let i2 = byteLength2;
        let mul = 1;
        let val = this[offset + --i2];
        while (i2 > 0 && (mul *= 256)) {
          val += this[offset + --i2] * mul;
        }
        mul *= 128;
        if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer3.prototype.readInt8 = function readInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        if (!(this[offset] & 128)) return this[offset];
        return (255 - this[offset] + 1) * -1;
      };
      Buffer3.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        const val = this[offset] | this[offset + 1] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer3.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        const val = this[offset + 1] | this[offset] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer3.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
      };
      Buffer3.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
      };
      Buffer3.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const val = this[offset + 4] + this[offset + 5] * 2 ** 8 + this[offset + 6] * 2 ** 16 + (last << 24);
        return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
      });
      Buffer3.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const val = (first << 24) + // Overflow
        this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
        return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last);
      });
      Buffer3.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, true, 23, 4);
      };
      Buffer3.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, false, 23, 4);
      };
      Buffer3.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, true, 52, 8);
      };
      Buffer3.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, false, 52, 8);
      };
      function checkInt(buf, value, offset, ext, max2, min) {
        if (!Buffer3.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
        if (value > max2 || value < min) throw new RangeError('"value" argument is out of bounds');
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
      }
      Buffer3.prototype.writeUintLE = Buffer3.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value, offset, byteLength2, maxBytes, 0);
        }
        let mul = 1;
        let i2 = 0;
        this[offset] = value & 255;
        while (++i2 < byteLength2 && (mul *= 256)) {
          this[offset + i2] = value / mul & 255;
        }
        return offset + byteLength2;
      };
      Buffer3.prototype.writeUintBE = Buffer3.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value, offset, byteLength2, maxBytes, 0);
        }
        let i2 = byteLength2 - 1;
        let mul = 1;
        this[offset + i2] = value & 255;
        while (--i2 >= 0 && (mul *= 256)) {
          this[offset + i2] = value / mul & 255;
        }
        return offset + byteLength2;
      };
      Buffer3.prototype.writeUint8 = Buffer3.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer3.prototype.writeUint16LE = Buffer3.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        return offset + 2;
      };
      Buffer3.prototype.writeUint16BE = Buffer3.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
        this[offset] = value >>> 8;
        this[offset + 1] = value & 255;
        return offset + 2;
      };
      Buffer3.prototype.writeUint32LE = Buffer3.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
        this[offset + 3] = value >>> 24;
        this[offset + 2] = value >>> 16;
        this[offset + 1] = value >>> 8;
        this[offset] = value & 255;
        return offset + 4;
      };
      Buffer3.prototype.writeUint32BE = Buffer3.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 255;
        return offset + 4;
      };
      function wrtBigUInt64LE(buf, value, offset, min, max2) {
        checkIntBI(value, min, max2, buf, offset, 7);
        let lo = Number(value & BigInt(4294967295));
        buf[offset++] = lo;
        lo = lo >> 8;
        buf[offset++] = lo;
        lo = lo >> 8;
        buf[offset++] = lo;
        lo = lo >> 8;
        buf[offset++] = lo;
        let hi = Number(value >> BigInt(32) & BigInt(4294967295));
        buf[offset++] = hi;
        hi = hi >> 8;
        buf[offset++] = hi;
        hi = hi >> 8;
        buf[offset++] = hi;
        hi = hi >> 8;
        buf[offset++] = hi;
        return offset;
      }
      function wrtBigUInt64BE(buf, value, offset, min, max2) {
        checkIntBI(value, min, max2, buf, offset, 7);
        let lo = Number(value & BigInt(4294967295));
        buf[offset + 7] = lo;
        lo = lo >> 8;
        buf[offset + 6] = lo;
        lo = lo >> 8;
        buf[offset + 5] = lo;
        lo = lo >> 8;
        buf[offset + 4] = lo;
        let hi = Number(value >> BigInt(32) & BigInt(4294967295));
        buf[offset + 3] = hi;
        hi = hi >> 8;
        buf[offset + 2] = hi;
        hi = hi >> 8;
        buf[offset + 1] = hi;
        hi = hi >> 8;
        buf[offset] = hi;
        return offset + 8;
      }
      Buffer3.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
        return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
      });
      Buffer3.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
        return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
      });
      Buffer3.prototype.writeIntLE = function writeIntLE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          const limit = Math.pow(2, 8 * byteLength2 - 1);
          checkInt(this, value, offset, byteLength2, limit - 1, -limit);
        }
        let i2 = 0;
        let mul = 1;
        let sub = 0;
        this[offset] = value & 255;
        while (++i2 < byteLength2 && (mul *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i2 - 1] !== 0) {
            sub = 1;
          }
          this[offset + i2] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength2;
      };
      Buffer3.prototype.writeIntBE = function writeIntBE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          const limit = Math.pow(2, 8 * byteLength2 - 1);
          checkInt(this, value, offset, byteLength2, limit - 1, -limit);
        }
        let i2 = byteLength2 - 1;
        let mul = 1;
        let sub = 0;
        this[offset + i2] = value & 255;
        while (--i2 >= 0 && (mul *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i2 + 1] !== 0) {
            sub = 1;
          }
          this[offset + i2] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength2;
      };
      Buffer3.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
        if (value < 0) value = 255 + value + 1;
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer3.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        return offset + 2;
      };
      Buffer3.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
        this[offset] = value >>> 8;
        this[offset + 1] = value & 255;
        return offset + 2;
      };
      Buffer3.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        this[offset + 2] = value >>> 16;
        this[offset + 3] = value >>> 24;
        return offset + 4;
      };
      Buffer3.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
        if (value < 0) value = 4294967295 + value + 1;
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 255;
        return offset + 4;
      };
      Buffer3.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
        return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
      });
      Buffer3.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
        return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
      });
      function checkIEEE754(buf, value, offset, ext, max2, min) {
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
        if (offset < 0) throw new RangeError("Index out of range");
      }
      function writeFloat(buf, value, offset, littleEndian, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 4, 34028234663852886e22, -34028234663852886e22);
        }
        ieee754.write(buf, value, offset, littleEndian, 23, 4);
        return offset + 4;
      }
      Buffer3.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
        return writeFloat(this, value, offset, true, noAssert);
      };
      Buffer3.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
        return writeFloat(this, value, offset, false, noAssert);
      };
      function writeDouble(buf, value, offset, littleEndian, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 8, 17976931348623157e292, -17976931348623157e292);
        }
        ieee754.write(buf, value, offset, littleEndian, 52, 8);
        return offset + 8;
      }
      Buffer3.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
        return writeDouble(this, value, offset, true, noAssert);
      };
      Buffer3.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
        return writeDouble(this, value, offset, false, noAssert);
      };
      Buffer3.prototype.copy = function copy(target, targetStart, start, end) {
        if (!Buffer3.isBuffer(target)) throw new TypeError("argument should be a Buffer");
        if (!start) start = 0;
        if (!end && end !== 0) end = this.length;
        if (targetStart >= target.length) targetStart = target.length;
        if (!targetStart) targetStart = 0;
        if (end > 0 && end < start) end = start;
        if (end === start) return 0;
        if (target.length === 0 || this.length === 0) return 0;
        if (targetStart < 0) {
          throw new RangeError("targetStart out of bounds");
        }
        if (start < 0 || start >= this.length) throw new RangeError("Index out of range");
        if (end < 0) throw new RangeError("sourceEnd out of bounds");
        if (end > this.length) end = this.length;
        if (target.length - targetStart < end - start) {
          end = target.length - targetStart + start;
        }
        const len = end - start;
        if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
          this.copyWithin(targetStart, start, end);
        } else {
          Uint8Array.prototype.set.call(
            target,
            this.subarray(start, end),
            targetStart
          );
        }
        return len;
      };
      Buffer3.prototype.fill = function fill(val, start, end, encoding) {
        if (typeof val === "string") {
          if (typeof start === "string") {
            encoding = start;
            start = 0;
            end = this.length;
          } else if (typeof end === "string") {
            encoding = end;
            end = this.length;
          }
          if (encoding !== void 0 && typeof encoding !== "string") {
            throw new TypeError("encoding must be a string");
          }
          if (typeof encoding === "string" && !Buffer3.isEncoding(encoding)) {
            throw new TypeError("Unknown encoding: " + encoding);
          }
          if (val.length === 1) {
            const code = val.charCodeAt(0);
            if (encoding === "utf8" && code < 128 || encoding === "latin1") {
              val = code;
            }
          }
        } else if (typeof val === "number") {
          val = val & 255;
        } else if (typeof val === "boolean") {
          val = Number(val);
        }
        if (start < 0 || this.length < start || this.length < end) {
          throw new RangeError("Out of range index");
        }
        if (end <= start) {
          return this;
        }
        start = start >>> 0;
        end = end === void 0 ? this.length : end >>> 0;
        if (!val) val = 0;
        let i2;
        if (typeof val === "number") {
          for (i2 = start; i2 < end; ++i2) {
            this[i2] = val;
          }
        } else {
          const bytes = Buffer3.isBuffer(val) ? val : Buffer3.from(val, encoding);
          const len = bytes.length;
          if (len === 0) {
            throw new TypeError('The value "' + val + '" is invalid for argument "value"');
          }
          for (i2 = 0; i2 < end - start; ++i2) {
            this[i2 + start] = bytes[i2 % len];
          }
        }
        return this;
      };
      var errors = {};
      function E(sym, getMessage, Base) {
        errors[sym] = class NodeError extends Base {
          constructor() {
            super();
            Object.defineProperty(this, "message", {
              value: getMessage.apply(this, arguments),
              writable: true,
              configurable: true
            });
            this.name = `${this.name} [${sym}]`;
            this.stack;
            delete this.name;
          }
          get code() {
            return sym;
          }
          set code(value) {
            Object.defineProperty(this, "code", {
              configurable: true,
              enumerable: true,
              value,
              writable: true
            });
          }
          toString() {
            return `${this.name} [${sym}]: ${this.message}`;
          }
        };
      }
      E(
        "ERR_BUFFER_OUT_OF_BOUNDS",
        function(name) {
          if (name) {
            return `${name} is outside of buffer bounds`;
          }
          return "Attempt to access memory outside buffer bounds";
        },
        RangeError
      );
      E(
        "ERR_INVALID_ARG_TYPE",
        function(name, actual) {
          return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
        },
        TypeError
      );
      E(
        "ERR_OUT_OF_RANGE",
        function(str, range, input) {
          let msg = `The value of "${str}" is out of range.`;
          let received = input;
          if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
            received = addNumericalSeparator(String(input));
          } else if (typeof input === "bigint") {
            received = String(input);
            if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
              received = addNumericalSeparator(received);
            }
            received += "n";
          }
          msg += ` It must be ${range}. Received ${received}`;
          return msg;
        },
        RangeError
      );
      function addNumericalSeparator(val) {
        let res = "";
        let i2 = val.length;
        const start = val[0] === "-" ? 1 : 0;
        for (; i2 >= start + 4; i2 -= 3) {
          res = `_${val.slice(i2 - 3, i2)}${res}`;
        }
        return `${val.slice(0, i2)}${res}`;
      }
      function checkBounds(buf, offset, byteLength2) {
        validateNumber(offset, "offset");
        if (buf[offset] === void 0 || buf[offset + byteLength2] === void 0) {
          boundsError(offset, buf.length - (byteLength2 + 1));
        }
      }
      function checkIntBI(value, min, max2, buf, offset, byteLength2) {
        if (value > max2 || value < min) {
          const n = typeof min === "bigint" ? "n" : "";
          let range;
          if (byteLength2 > 3) {
            if (min === 0 || min === BigInt(0)) {
              range = `>= 0${n} and < 2${n} ** ${(byteLength2 + 1) * 8}${n}`;
            } else {
              range = `>= -(2${n} ** ${(byteLength2 + 1) * 8 - 1}${n}) and < 2 ** ${(byteLength2 + 1) * 8 - 1}${n}`;
            }
          } else {
            range = `>= ${min}${n} and <= ${max2}${n}`;
          }
          throw new errors.ERR_OUT_OF_RANGE("value", range, value);
        }
        checkBounds(buf, offset, byteLength2);
      }
      function validateNumber(value, name) {
        if (typeof value !== "number") {
          throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value);
        }
      }
      function boundsError(value, length, type) {
        if (Math.floor(value) !== value) {
          validateNumber(value, type);
          throw new errors.ERR_OUT_OF_RANGE(type || "offset", "an integer", value);
        }
        if (length < 0) {
          throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
        }
        throw new errors.ERR_OUT_OF_RANGE(
          type || "offset",
          `>= ${type ? 1 : 0} and <= ${length}`,
          value
        );
      }
      var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
      function base64clean(str) {
        str = str.split("=")[0];
        str = str.trim().replace(INVALID_BASE64_RE, "");
        if (str.length < 2) return "";
        while (str.length % 4 !== 0) {
          str = str + "=";
        }
        return str;
      }
      function utf8ToBytes(string, units) {
        units = units || Infinity;
        let codePoint;
        const length = string.length;
        let leadSurrogate = null;
        const bytes = [];
        for (let i2 = 0; i2 < length; ++i2) {
          codePoint = string.charCodeAt(i2);
          if (codePoint > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
              if (codePoint > 56319) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                continue;
              } else if (i2 + 1 === length) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                continue;
              }
              leadSurrogate = codePoint;
              continue;
            }
            if (codePoint < 56320) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              leadSurrogate = codePoint;
              continue;
            }
            codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
          } else if (leadSurrogate) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189);
          }
          leadSurrogate = null;
          if (codePoint < 128) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint);
          } else if (codePoint < 2048) {
            if ((units -= 2) < 0) break;
            bytes.push(
              codePoint >> 6 | 192,
              codePoint & 63 | 128
            );
          } else if (codePoint < 65536) {
            if ((units -= 3) < 0) break;
            bytes.push(
              codePoint >> 12 | 224,
              codePoint >> 6 & 63 | 128,
              codePoint & 63 | 128
            );
          } else if (codePoint < 1114112) {
            if ((units -= 4) < 0) break;
            bytes.push(
              codePoint >> 18 | 240,
              codePoint >> 12 & 63 | 128,
              codePoint >> 6 & 63 | 128,
              codePoint & 63 | 128
            );
          } else {
            throw new Error("Invalid code point");
          }
        }
        return bytes;
      }
      function asciiToBytes(str) {
        const byteArray = [];
        for (let i2 = 0; i2 < str.length; ++i2) {
          byteArray.push(str.charCodeAt(i2) & 255);
        }
        return byteArray;
      }
      function utf16leToBytes(str, units) {
        let c, hi, lo;
        const byteArray = [];
        for (let i2 = 0; i2 < str.length; ++i2) {
          if ((units -= 2) < 0) break;
          c = str.charCodeAt(i2);
          hi = c >> 8;
          lo = c % 256;
          byteArray.push(lo);
          byteArray.push(hi);
        }
        return byteArray;
      }
      function base64ToBytes(str) {
        return base64.toByteArray(base64clean(str));
      }
      function blitBuffer(src, dst, offset, length) {
        let i2;
        for (i2 = 0; i2 < length; ++i2) {
          if (i2 + offset >= dst.length || i2 >= src.length) break;
          dst[i2 + offset] = src[i2];
        }
        return i2;
      }
      function isInstance(obj, type) {
        return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
      }
      function numberIsNaN(obj) {
        return obj !== obj;
      }
      var hexSliceLookupTable = (function() {
        const alphabet = "0123456789abcdef";
        const table = new Array(256);
        for (let i2 = 0; i2 < 16; ++i2) {
          const i16 = i2 * 16;
          for (let j = 0; j < 16; ++j) {
            table[i16 + j] = alphabet[i2] + alphabet[j];
          }
        }
        return table;
      })();
      function defineBigIntMethod(fn) {
        return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
      }
      function BufferBigIntNotDefined() {
        throw new Error("BigInt not supported");
      }
    }
  });

  // src/index.ts
  var index_exports = {};
  __export(index_exports, {
    default: () => index_default
  });

  // node_modules/.pnpm/@shiqianjiang+ceru-plugin-s_e86b412fc9f25e810f55d1459a6e2380/node_modules/@shiqianjiang/ceru-plugin-sdk/dist/index.js
  function definePlugin(entry) {
    return entry;
  }

  // src/lx.ts
  var import_buffer = __toESM(require_buffer(), 1);

  // node_modules/.pnpm/fflate@0.8.3/node_modules/fflate/esm/browser.js
  var u8 = Uint8Array;
  var u16 = Uint16Array;
  var i32 = Int32Array;
  var fleb = new u8([
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    2,
    2,
    2,
    2,
    3,
    3,
    3,
    3,
    4,
    4,
    4,
    4,
    5,
    5,
    5,
    5,
    0,
    /* unused */
    0,
    0,
    /* impossible */
    0
  ]);
  var fdeb = new u8([
    0,
    0,
    0,
    0,
    1,
    1,
    2,
    2,
    3,
    3,
    4,
    4,
    5,
    5,
    6,
    6,
    7,
    7,
    8,
    8,
    9,
    9,
    10,
    10,
    11,
    11,
    12,
    12,
    13,
    13,
    /* unused */
    0,
    0
  ]);
  var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
  var freb = function(eb, start) {
    var b = new u16(31);
    for (var i2 = 0; i2 < 31; ++i2) {
      b[i2] = start += 1 << eb[i2 - 1];
    }
    var r = new i32(b[30]);
    for (var i2 = 1; i2 < 30; ++i2) {
      for (var j = b[i2]; j < b[i2 + 1]; ++j) {
        r[j] = j - b[i2] << 5 | i2;
      }
    }
    return { b, r };
  };
  var _a = freb(fleb, 2);
  var fl = _a.b;
  var revfl = _a.r;
  fl[28] = 258, revfl[258] = 28;
  var _b = freb(fdeb, 0);
  var fd = _b.b;
  var revfd = _b.r;
  var rev = new u16(32768);
  for (i = 0; i < 32768; ++i) {
    x = (i & 43690) >> 1 | (i & 21845) << 1;
    x = (x & 52428) >> 2 | (x & 13107) << 2;
    x = (x & 61680) >> 4 | (x & 3855) << 4;
    rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
  }
  var x;
  var i;
  var hMap = (function(cd, mb, r) {
    var s = cd.length;
    var i2 = 0;
    var l = new u16(mb);
    for (; i2 < s; ++i2) {
      if (cd[i2])
        ++l[cd[i2] - 1];
    }
    var le = new u16(mb);
    for (i2 = 1; i2 < mb; ++i2) {
      le[i2] = le[i2 - 1] + l[i2 - 1] << 1;
    }
    var co;
    if (r) {
      co = new u16(1 << mb);
      var rvb = 15 - mb;
      for (i2 = 0; i2 < s; ++i2) {
        if (cd[i2]) {
          var sv = i2 << 4 | cd[i2];
          var r_1 = mb - cd[i2];
          var v = le[cd[i2] - 1]++ << r_1;
          for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
            co[rev[v] >> rvb] = sv;
          }
        }
      }
    } else {
      co = new u16(s);
      for (i2 = 0; i2 < s; ++i2) {
        if (cd[i2]) {
          co[i2] = rev[le[cd[i2] - 1]++] >> 15 - cd[i2];
        }
      }
    }
    return co;
  });
  var flt = new u8(288);
  for (i = 0; i < 144; ++i)
    flt[i] = 8;
  var i;
  for (i = 144; i < 256; ++i)
    flt[i] = 9;
  var i;
  for (i = 256; i < 280; ++i)
    flt[i] = 7;
  var i;
  for (i = 280; i < 288; ++i)
    flt[i] = 8;
  var i;
  var fdt = new u8(32);
  for (i = 0; i < 32; ++i)
    fdt[i] = 5;
  var i;
  var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
  var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
  var max = function(a) {
    var m = a[0];
    for (var i2 = 1; i2 < a.length; ++i2) {
      if (a[i2] > m)
        m = a[i2];
    }
    return m;
  };
  var bits = function(d, p, m) {
    var o = p / 8 | 0;
    return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
  };
  var bits16 = function(d, p) {
    var o = p / 8 | 0;
    return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
  };
  var shft = function(p) {
    return (p + 7) / 8 | 0;
  };
  var slc = function(v, s, e) {
    if (s == null || s < 0)
      s = 0;
    if (e == null || e > v.length)
      e = v.length;
    return new u8(v.subarray(s, e));
  };
  var ec = [
    "unexpected EOF",
    "invalid block type",
    "invalid length/literal",
    "invalid distance",
    "stream finished",
    "no stream handler",
    ,
    // determined by compression function
    "no callback",
    "invalid UTF-8 data",
    "extra field too long",
    "date not in range 1980-2099",
    "filename too long",
    "stream finishing",
    "invalid zip data"
    // determined by unknown compression method
  ];
  var err = function(ind, msg, nt) {
    var e = new Error(msg || ec[ind]);
    e.code = ind;
    if (Error.captureStackTrace)
      Error.captureStackTrace(e, err);
    if (!nt)
      throw e;
    return e;
  };
  var inflt = function(dat, st, buf, dict) {
    var sl = dat.length, dl = dict ? dict.length : 0;
    if (!sl || st.f && !st.l)
      return buf || new u8(0);
    var noBuf = !buf;
    var resize = noBuf || st.i != 2;
    var noSt = st.i;
    if (noBuf)
      buf = new u8(sl * 3);
    var cbuf = function(l2) {
      var bl = buf.length;
      if (l2 > bl) {
        var nbuf = new u8(Math.max(bl * 2, l2));
        nbuf.set(buf);
        buf = nbuf;
      }
    };
    var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
    var tbts = sl * 8;
    do {
      if (!lm) {
        final = bits(dat, pos, 1);
        var type = bits(dat, pos + 1, 3);
        pos += 3;
        if (!type) {
          var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
          if (t > sl) {
            if (noSt)
              err(0);
            break;
          }
          if (resize)
            cbuf(bt + l);
          buf.set(dat.subarray(s, t), bt);
          st.b = bt += l, st.p = pos = t * 8, st.f = final;
          continue;
        } else if (type == 1)
          lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
        else if (type == 2) {
          var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
          var tl = hLit + bits(dat, pos + 5, 31) + 1;
          pos += 14;
          var ldt = new u8(tl);
          var clt = new u8(19);
          for (var i2 = 0; i2 < hcLen; ++i2) {
            clt[clim[i2]] = bits(dat, pos + i2 * 3, 7);
          }
          pos += hcLen * 3;
          var clb = max(clt), clbmsk = (1 << clb) - 1;
          var clm = hMap(clt, clb, 1);
          for (var i2 = 0; i2 < tl; ) {
            var r = clm[bits(dat, pos, clbmsk)];
            pos += r & 15;
            var s = r >> 4;
            if (s < 16) {
              ldt[i2++] = s;
            } else {
              var c = 0, n = 0;
              if (s == 16)
                n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i2 - 1];
              else if (s == 17)
                n = 3 + bits(dat, pos, 7), pos += 3;
              else if (s == 18)
                n = 11 + bits(dat, pos, 127), pos += 7;
              while (n--)
                ldt[i2++] = c;
            }
          }
          var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
          lbt = max(lt);
          dbt = max(dt);
          lm = hMap(lt, lbt, 1);
          dm = hMap(dt, dbt, 1);
        } else
          err(1);
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
      }
      if (resize)
        cbuf(bt + 131072);
      var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
      var lpos = pos;
      for (; ; lpos = pos) {
        var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
        pos += c & 15;
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
        if (!c)
          err(2);
        if (sym < 256)
          buf[bt++] = sym;
        else if (sym == 256) {
          lpos = pos, lm = null;
          break;
        } else {
          var add = sym - 254;
          if (sym > 264) {
            var i2 = sym - 257, b = fleb[i2];
            add = bits(dat, pos, (1 << b) - 1) + fl[i2];
            pos += b;
          }
          var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
          if (!d)
            err(3);
          pos += d & 15;
          var dt = fd[dsym];
          if (dsym > 3) {
            var b = fdeb[dsym];
            dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
          }
          if (pos > tbts) {
            if (noSt)
              err(0);
            break;
          }
          if (resize)
            cbuf(bt + 131072);
          var end = bt + add;
          if (bt < dt) {
            var shift = dl - dt, dend = Math.min(dt, end);
            if (shift + bt < 0)
              err(3);
            for (; bt < dend; ++bt)
              buf[bt] = dict[shift + bt];
          }
          for (; bt < end; ++bt)
            buf[bt] = buf[bt - dt];
        }
      }
      st.l = lm, st.p = lpos, st.b = bt, st.f = final;
      if (lm)
        final = 1, st.m = lbt, st.d = dm, st.n = dbt;
    } while (!final);
    return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
  };
  var et = /* @__PURE__ */ new u8(0);
  var gzs = function(d) {
    if (d[0] != 31 || d[1] != 139 || d[2] != 8)
      err(6, "invalid gzip data");
    var flg = d[3];
    var st = 10;
    if (flg & 4)
      st += (d[10] | d[11] << 8) + 2;
    for (var zs = (flg >> 3 & 1) + (flg >> 4 & 1); zs > 0; zs -= !d[st++])
      ;
    return st + (flg & 2);
  };
  var gzl = function(d) {
    var l = d.length;
    return (d[l - 4] | d[l - 3] << 8 | d[l - 2] << 16 | d[l - 1] << 24) >>> 0;
  };
  var zls = function(d, dict) {
    if ((d[0] & 15) != 8 || d[0] >> 4 > 7 || (d[0] << 8 | d[1]) % 31)
      err(6, "invalid zlib data");
    if ((d[1] >> 5 & 1) == +!dict)
      err(6, "invalid zlib data: " + (d[1] & 32 ? "need" : "unexpected") + " dictionary");
    return (d[1] >> 3 & 4) + 2;
  };
  function inflateSync(data, opts) {
    return inflt(data, { i: 2 }, opts && opts.out, opts && opts.dictionary);
  }
  function gunzipSync(data, opts) {
    var st = gzs(data);
    if (st + 8 > data.length)
      err(6, "invalid gzip data");
    return inflt(data.subarray(st, -8), { i: 2 }, opts && opts.out || new u8(gzl(data)), opts && opts.dictionary);
  }
  function unzlibSync(data, opts) {
    return inflt(data.subarray(zls(data, opts && opts.dictionary), -4), { i: 2 }, opts && opts.out, opts && opts.dictionary);
  }
  function decompressSync(data, opts) {
    return data[0] == 31 && data[1] == 139 && data[2] == 8 ? gunzipSync(data, opts) : (data[0] & 15) != 8 || data[0] >> 4 > 7 || (data[0] << 8 | data[1]) % 31 ? inflateSync(data, opts) : unzlibSync(data, opts);
  }
  var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
  var tds = 0;
  try {
    td.decode(et, { stream: true });
    tds = 1;
  } catch (e) {
  }

  // src/platforms.ts
  var RESOLVABLE_PLATFORMS = /* @__PURE__ */ new Set(["wy", "tx", "kw", "kg", "mg"]);

  // src/lx.ts
  var ID_FIELDS = ["hash", "songmid", "copyrightId", "songId"];
  function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  }
  function asText(value) {
    if (typeof value === "string") return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    return "";
  }
  function asSongs(value) {
    if (!Array.isArray(value)) return [];
    return value.map(asRecord).filter((item) => item !== null);
  }
  function parseJson(text2) {
    try {
      return { ok: true, value: JSON.parse(text2.replace(/^\uFEFF/, "")) };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "JSON 解析失败" };
    }
  }
  function decodeFile(base64, label) {
    const bytes = import_buffer.Buffer.from(base64, "base64");
    const direct = parseJson(bytes.toString("utf8"));
    if (direct.ok) return { value: direct.value, compressed: false };
    let decompressed;
    try {
      decompressed = import_buffer.Buffer.from(decompressSync(bytes));
    } catch {
      throw new Error(`无法解析「${label}」：既不是 JSON 文本，也不是有效的 .lxmc 压缩数据`);
    }
    const parsed = parseJson(decompressed.toString("utf8"));
    if (!parsed.ok) throw new Error(`无法解析「${label}」：解压后的内容不是有效 JSON`);
    return { value: parsed.value, compressed: true };
  }
  function extractPlaylists(value, label) {
    const record = asRecord(value);
    if (record) {
      const format = asText(record.type);
      if (format === "playListPart_v2" || format === "playListPart") {
        const part = asRecord(record.data);
        if (part) {
          return {
            format,
            playlists: [{ name: asText(part.name) || label, songs: asSongs(part.list) }]
          };
        }
      }
      if (format === "playList_v2" || format === "playList") {
        const lists = Array.isArray(record.data) ? record.data : [];
        if (lists.length) {
          return {
            format,
            playlists: lists.map((item, index) => {
              const entry = asRecord(item) ?? {};
              return {
                name: asText(entry.name) || `${label} ${index + 1}`,
                songs: asSongs(entry.list)
              };
            })
          };
        }
      }
      if (Array.isArray(record.list)) {
        return {
          format: format || "list",
          playlists: [{ name: asText(record.name) || label, songs: asSongs(record.list) }]
        };
      }
    }
    if (Array.isArray(value)) {
      return { format: "array", playlists: [{ name: label, songs: asSongs(value) }] };
    }
    throw new Error(
      "无法识别的洛雪歌单格式：请选择洛雪音乐「我的列表 → 导出/备份」生成的 .json 或 .lxmc 文件"
    );
  }
  function sizeBytes(value) {
    const bytes = Number(value);
    return Number.isSafeInteger(bytes) && bytes > 0 ? bytes : void 0;
  }
  function collectQualities(song, meta) {
    const found = [];
    const push = (type, label, bytes) => {
      const name = type.trim();
      if (!name) return;
      const existing = found.find((item) => item.type === name);
      if (existing) {
        if (!existing.label && label) existing.label = label;
        if (!existing.bytes && bytes) existing.bytes = bytes;
        return;
      }
      found.push({ type: name, ...label ? { label } : {}, ...bytes ? { bytes } : {} });
    };
    const detail = (value) => {
      const entry = asRecord(value);
      if (entry) return { label: asText(entry.size) || void 0, bytes: sizeBytes(entry.sizeBytes) };
      const text2 = asText(value);
      return { label: text2 || void 0, bytes: void 0 };
    };
    for (const source of [meta.qualitys, song.qualitys, song.types]) {
      if (Array.isArray(source)) {
        for (const item of source) {
          if (typeof item === "string") push(item);
          else {
            const entry = asRecord(item);
            if (!entry) continue;
            const info = detail(entry);
            push(asText(entry.type), info.label, info.bytes);
          }
        }
      } else {
        const map = asRecord(source);
        if (!map) continue;
        for (const [type, value] of Object.entries(map)) {
          const info = detail(value);
          push(type, info.label, info.bytes);
        }
      }
    }
    for (const source of [meta._qualitys, song._types]) {
      const map = asRecord(source);
      if (!map) continue;
      for (const [type, value] of Object.entries(map)) {
        const info = detail(value);
        push(type, info.label, info.bytes);
      }
    }
    const labels = {};
    const sizes = {};
    for (const entry of found) {
      if (entry.label) labels[entry.type] = entry.label;
      if (entry.bytes) sizes[entry.type] = entry.bytes;
    }
    return { qualities: found.map((entry) => entry.type), labels, sizes };
  }
  function durationMilliseconds(interval) {
    const text2 = asText(interval);
    if (!text2) return void 0;
    const parts = text2.split(":");
    if (parts.length > 3) return void 0;
    if (parts.some((part) => !/^\d+(\.\d+)?$/.test(part.trim()))) return void 0;
    const seconds = parts.reduce((total, part) => total * 60 + Number(part), 0);
    return Number.isFinite(seconds) ? Math.round(seconds * 1e3) : void 0;
  }
  function platformId(source, song, meta) {
    for (const field of ID_FIELDS) {
      const value = asText(meta[field]) || asText(song[field]);
      if (value) return value;
    }
    const raw = asText(song.id);
    const prefix = source + "_";
    return raw.startsWith(prefix) ? raw.slice(prefix.length) : raw;
  }
  function lxSongToEntity(input, pluginId) {
    const song = asRecord(input);
    if (!song) return null;
    const meta = asRecord(song.meta) ?? {};
    const source = asText(song.source) || asText(meta.source);
    if (!source) return null;
    const id = platformId(source, song, meta);
    if (!id) return null;
    const title = asText(song.name) || asText(song.title) || id;
    const singer = asText(song.singer) || asText(meta.singer);
    const hash = asText(meta.hash) || asText(song.hash);
    const albumName = asText(meta.albumName) || asText(song.albumName);
    const albumId = asText(meta.albumId) || asText(song.albumId);
    const artworkUrl = asText(meta.picUrl) || asText(song.img);
    const durationMs = durationMilliseconds(song.interval);
    const quality = collectQualities(song, meta);
    return {
      ref: {
        // 公共平台身份：桌面端会把 pluginId 归一化掉，播放/下载按 providerId
        // 交给用户在「音源设置」里选择的实现，因此不能锁定成本插件。
        pluginId,
        providerId: source,
        kind: "track",
        id,
        scope: "provider"
      },
      title,
      ...singer ? { subtitle: singer } : {},
      playable: RESOLVABLE_PLATFORMS.has(source),
      capabilities: ["music.resolve@1", "music.lyrics@1"],
      metadata: {
        artists: singer ? singer.split("、").map((part) => part.trim()).filter(Boolean) : [],
        ...albumName || albumId ? { album: { title: albumName, ...albumId ? { id: albumId } : {} } } : {},
        ...quality.qualities.length ? { qualities: quality.qualities } : {},
        ...Object.keys(quality.labels).length ? { qualitySizeLabels: quality.labels } : {},
        ...Object.keys(quality.sizes).length ? { qualitySizes: quality.sizes } : {},
        ...hash ? { hash } : {},
        ...artworkUrl ? { artworkUrl } : {},
        ...durationMs === void 0 ? {} : { durationMs }
      }
    };
  }
  function stageFile(label, base64, pluginId) {
    const decoded = decodeFile(base64, label);
    const extracted = extractPlaylists(decoded.value, label);
    const playlists = [];
    let skipped = 0;
    let empty = 0;
    for (const playlist of extracted.playlists) {
      const items = [];
      const platforms = {};
      for (const song of playlist.songs) {
        const entity = lxSongToEntity(song, pluginId);
        if (!entity) {
          skipped++;
          continue;
        }
        items.push(entity);
        platforms[entity.ref.providerId] = (platforms[entity.ref.providerId] ?? 0) + 1;
      }
      if (!items.length) {
        empty++;
        continue;
      }
      playlists.push({ name: playlist.name, items, platforms });
    }
    return {
      label,
      format: extracted.format,
      compressed: decoded.compressed,
      playlists,
      skipped,
      empty
    };
  }

  // src/index.ts
  var SURFACE_ID = "import";
  var FILE_PERMISSION = "files.read";
  var LIBRARY_PERMISSION = "library.write";
  var BATCH_SIZE = 300;
  var SESSION_TTL_MS = 30 * 60 * 1e3;
  var MAX_SONGS_PER_SESSION = 5e4;
  var importAttempt = 0;
  function asRecord2(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }
  function text(value) {
    return typeof value === "string" ? value.trim() : "";
  }
  function summarize(session, libraryReady, theme) {
    return {
      sessionId: session.id,
      files: session.files,
      playlists: session.playlists.map((playlist, index) => ({
        index,
        name: playlist.name,
        songs: playlist.items.length,
        platforms: playlist.platforms
      })),
      totals: {
        files: session.files.length,
        playlists: session.playlists.length,
        songs: session.playlists.reduce((total, playlist) => total + playlist.items.length, 0),
        skipped: session.skipped,
        empty: session.empty
      },
      libraryReady,
      theme
    };
  }
  async function libraryWriteReady(ctx) {
    try {
      const availability = await ctx.capabilities.get("library");
      const methods = availability.methods ?? [];
      return availability.available && methods.some((method) => method.endsWith(".import"));
    } catch {
      return false;
    }
  }
  async function createProgress(ctx, title) {
    let id;
    try {
      id = (await ctx.ui.progress.create({ title, cancellable: false })).id;
    } catch {
      id = void 0;
    }
    return {
      async update(message) {
        if (!id) return;
        try {
          await ctx.ui.progress.update(id, { message });
        } catch {
          id = void 0;
        }
      },
      async close() {
        if (!id) return;
        try {
          await ctx.ui.progress.close(id);
        } catch {
        }
        id = void 0;
      }
    };
  }
  async function importItems(ctx, request) {
    let target;
    let added = 0;
    let skipped = 0;
    for (let offset = 0; offset < request.items.length; offset += BATCH_SIZE) {
      const result = await ctx.library.playlists.import({
        ...target ? { target } : {},
        suggestedName: request.name,
        items: request.items.slice(offset, offset + BATCH_SIZE),
        // 同一次点击内的同一批复用同一个 requestId（宿主据此去重）；换一次点击就换一个号。
        requestId: `lx-import:${request.attempt}:${request.slot}:${offset}`,
        permissionKey: LIBRARY_PERMISSION,
        operation: request.operation
      });
      if (result.cancelled) return { cancelled: true, added, skipped };
      target = result.target ?? target;
      added += result.added;
      skipped += result.skipped;
    }
    return { cancelled: false, added, skipped };
  }
  var index_default = definePlugin(async (ctx) => {
    const sessions = /* @__PURE__ */ new Map();
    let theme = "light";
    async function refreshTheme() {
      try {
        const info = await ctx.app.getInfo();
        theme = info.theme === "dark" ? "dark" : "light";
      } catch {
      }
    }
    try {
      ctx.effects.add(
        ctx.events.on("theme.changed", (value) => {
          theme = value?.theme === "dark" ? "dark" : "light";
          void ctx.ui.setState(SURFACE_ID, { theme });
        })
      );
    } catch {
    }
    function prune() {
      const now = Date.now();
      for (const [id, session] of sessions) {
        if (now - session.createdAt > SESSION_TTL_MS) sessions.delete(id);
      }
    }
    function nextSessionId() {
      return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
    }
    ctx.effects.add(
      ctx.actions.register("import.open", async () => {
        prune();
        await refreshTheme();
        await ctx.ui.setState(SURFACE_ID, { stage: "idle", theme });
        await ctx.ui.openView(SURFACE_ID);
        return null;
      })
    );
    ctx.effects.add(
      ctx.actions.register("import.pick", async (_input, operation) => {
        const files = await ctx.files.pick(
          {
            title: "选择洛雪歌单文件",
            extensions: ["json", "lxmc"],
            multiple: true
          },
          operation
        );
        if (!files.length) return { cancelled: true };
        const staged = [];
        let total = 0;
        for (const file of files) {
          const base64 = await ctx.files.readBase64(file, {
            operation,
            permissionKey: FILE_PERMISSION
          });
          const result = stageFile(file.name, base64, ctx.plugin.id);
          total += result.playlists.reduce((sum, playlist) => sum + playlist.items.length, 0);
          if (total > MAX_SONGS_PER_SESSION) {
            throw new Error(`一次导入的歌曲超过 ${MAX_SONGS_PER_SESSION} 首，请分次选择歌单文件`);
          }
          staged.push(result);
        }
        const session = {
          id: nextSessionId(),
          createdAt: Date.now(),
          files: staged.map((file) => ({
            label: file.label,
            format: file.format,
            compressed: file.compressed,
            playlists: file.playlists.length,
            songs: file.playlists.reduce((total2, playlist) => total2 + playlist.items.length, 0),
            skipped: file.skipped,
            empty: file.empty
          })),
          playlists: staged.flatMap(
            (file) => file.playlists.map((playlist) => ({
              name: playlist.name,
              items: playlist.items,
              platforms: playlist.platforms
            }))
          ),
          skipped: staged.reduce((total2, file) => total2 + file.skipped, 0),
          empty: staged.reduce((total2, file) => total2 + file.empty, 0),
          done: /* @__PURE__ */ new Map()
        };
        if (!session.playlists.length) {
          throw new Error("这些文件里没有可导入的歌曲，请确认选择的是洛雪「我的列表」导出的歌单文件");
        }
        prune();
        sessions.set(session.id, session);
        ctx.log.info("洛雪歌单已解析", {
          sessionId: session.id,
          files: session.files.length,
          playlists: session.playlists.length,
          skipped: session.skipped
        });
        return summarize(session, await libraryWriteReady(ctx), theme);
      })
    );
    ctx.effects.add(
      ctx.actions.register("import.commit", async (input, operation) => {
        prune();
        const request = asRecord2(input);
        const session = sessions.get(String(request.sessionId ?? ""));
        if (!session) throw new Error("解析结果已过期，请重新选择歌单文件");
        const mode = request.mode === "merge" ? "merge" : "split";
        const requested = Array.isArray(request.playlists) ? request.playlists : null;
        const picked = /* @__PURE__ */ new Map();
        for (const entry of requested ?? session.playlists.map((_, index) => index)) {
          const record = entry && typeof entry === "object" ? entry : null;
          const index = Number(record ? record.index : entry);
          if (!Number.isInteger(index) || index < 0 || index >= session.playlists.length) continue;
          const name = record ? text(record.name) : "";
          if (!picked.has(index) || name) picked.set(index, name);
        }
        if (!picked.size) throw new Error("请至少选择一个歌单");
        const indexes = [...picked.keys()].sort((a, b) => a - b);
        const nameOf = (index) => picked.get(index) || session.playlists[index].name;
        if (!await libraryWriteReady(ctx)) {
          throw new Error(
            "当前宿主没有接入歌单写入能力（开发工作台不提供歌单库），请在澜音桌面端使用本导入"
          );
        }
        await refreshTheme();
        const progress = await createProgress(
          ctx,
          mode === "merge" ? "合并导入洛雪歌单" : "导入洛雪歌单"
        );
        let added = 0;
        let skippedCount = 0;
        let cancelled = false;
        const attempt = ++importAttempt;
        const resumed = mode === "split" ? indexes.filter((index) => session.done.has(index)) : [];
        let pending = mode === "split" ? indexes.filter((index) => !session.done.has(index)) : indexes;
        if (!pending.length) {
          session.done.clear();
          pending = indexes;
          resumed.length = 0;
        }
        const batches = mode === "merge" ? [
          {
            slot: 0,
            name: text(request.name) || `${nameOf(pending[0])} 等 ${pending.length} 个歌单`,
            items: pending.flatMap((index) => session.playlists[index].items)
          }
        ] : pending.map((index) => ({
          slot: index,
          name: nameOf(index),
          items: session.playlists[index].items
        }));
        const outcomes = /* @__PURE__ */ new Map();
        for (const [order, batch] of batches.entries()) {
          await progress.update(
            batches.length > 1 ? `正在导入 ${order + 1}/${batches.length}：${batch.name}` : `正在导入：${batch.name}`
          );
          await ctx.ui.setState(SURFACE_ID, {
            stage: "importing",
            message: `正在导入 ${order + 1}/${batches.length}：${batch.name}`
          });
          const outcome = await importItems(ctx, {
            attempt,
            slot: batch.slot,
            name: batch.name,
            items: batch.items,
            operation
          });
          outcomes.set(batch.slot, outcome);
          added += outcome.added;
          skippedCount += outcome.skipped;
          if (outcome.cancelled) {
            cancelled = true;
            break;
          }
          if (mode === "split")
            session.done.set(batch.slot, { added: outcome.added, skipped: outcome.skipped });
        }
        if (!cancelled) session.done.clear();
        const report = [];
        let alreadyDone = 0;
        if (mode === "merge") {
          const outcome = outcomes.get(0);
          if (outcome)
            report.push({
              name: batches[0].name,
              songs: batches[0].items.length,
              added: outcome.added,
              skipped: outcome.skipped,
              ...outcome.cancelled ? { cancelled: true } : {}
            });
        } else {
          for (const index of indexes) {
            const outcome = outcomes.get(index);
            if (!outcome) {
              if (resumed.includes(index)) {
                alreadyDone++;
                report.push({
                  name: nameOf(index),
                  songs: session.playlists[index].items.length,
                  added: 0,
                  skipped: 0,
                  already: true
                });
              }
              continue;
            }
            report.push({
              name: nameOf(index),
              songs: session.playlists[index].items.length,
              added: outcome.added,
              skipped: outcome.skipped,
              ...outcome.cancelled ? { cancelled: true } : {}
            });
          }
        }
        await progress.close();
        await ctx.ui.setState(SURFACE_ID, {
          stage: "done",
          theme,
          report
        });
        const summaryText = `写入 ${added} 首${skippedCount ? `，跳过 ${skippedCount} 首重复` : ""}${alreadyDone ? `；${alreadyDone} 个歌单上次已导入，未重做` : ""}`;
        await ctx.ui.toast({
          message: cancelled ? `已取消：已${summaryText}` : `导入完成：${summaryText}`,
          level: cancelled ? "warning" : "success"
        });
        return {
          cancelled,
          added,
          skipped: skippedCount,
          already: alreadyDone,
          theme,
          playlists: report
        };
      })
    );
    ctx.log.info(`洛雪歌单导入 ${ctx.plugin.version} 已就绪`);
  });
  return __toCommonJS(index_exports);
})();

if (typeof __ceru_entry.default !== "function") throw new Error("Entry must default-export a function");
return __ceru_entry.default(ctx);
};

// Visible plugin surface: import
const ViewImportSurface = /* @ceru-self-contained */ async function ViewImportSurface(ctx) {
"use strict";
const __ceru_entry = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/view.ts
  var view_exports = {};
  __export(view_exports, {
    default: () => view_default
  });

  // node_modules/.pnpm/@shiqianjiang+ceru-plugin-s_e86b412fc9f25e810f55d1459a6e2380/node_modules/@shiqianjiang/ceru-plugin-sdk/dist/index.js
  function defineSurface(entry) {
    return entry;
  }

  // src/platforms.ts
  var LX_PLATFORM_NAMES = {
    wy: "网易云音乐",
    tx: "QQ音乐",
    kw: "酷我音乐",
    kg: "酷狗音乐",
    mg: "咪咕音乐",
    local: "本地文件",
    git: "曲库目录"
  };
  var LX_PLATFORM_SHORT_NAMES = {
    wy: "网易云",
    tx: "QQ音乐",
    kw: "酷我",
    kg: "酷狗",
    mg: "咪咕",
    local: "本地",
    git: "曲库"
  };
  function describePlatforms(platforms, limit = 3) {
    const entries = Object.entries(platforms);
    const names = entries.slice(0, limit).map(([source]) => LX_PLATFORM_SHORT_NAMES[source] ?? source);
    const rest = entries.length - names.length;
    return names.join(" · ") + (rest > 0 ? ` +${rest}` : "");
  }
  function describePlatformsDetailed(platforms) {
    return Object.entries(platforms).map(([source, count]) => `${LX_PLATFORM_NAMES[source] ?? source} ${count}`).join(" · ");
  }

  // src/view.ts
  var STYLE = `
  :root {
    --canvas: #f5f5f7; --surface: #fff; --pearl: #fafafc;
    --ink: #1d1d1f; --muted: #7a7a7a; --hairline: #e0e0e0; --hover: rgba(0, 0, 0, .035);
    --brand: #0066cc; --brand-focus: #0071e3; --brand-tint: rgba(0, 102, 204, .07);
    --ok: #1a7f4b; --warn: #a4570a; --err: #c7362b;
    color-scheme: light;
  }
  :root[data-theme='dark'] {
    --canvas: #1d1d1f; --surface: #272729; --pearl: #2a2a2c;
    --ink: #f5f5f7; --muted: #a1a1a6; --hairline: rgba(255, 255, 255, .14);
    --hover: rgba(255, 255, 255, .05);
    --brand: #0071e3; --brand-focus: #2997ff; --brand-tint: rgba(41, 151, 255, .14);
    --ok: #4fbf8b; --warn: #e0a05a; --err: #e5736b;
    color-scheme: dark;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; background: transparent; }
  body {
    font: 15px/1.47 -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', 'PingFang SC',
      'Microsoft YaHei', system-ui, sans-serif;
    letter-spacing: -0.1px;
    color: var(--ink);
    background: var(--canvas);
    -webkit-font-smoothing: antialiased;
  }
  button { font: inherit; color: inherit; }
  :focus-visible { outline: 2px solid var(--brand-focus); outline-offset: 2px; }

  main {
    display: flex; flex-direction: column; gap: 16px; padding: 20px 20px 0;
    animation: panel-in .24s cubic-bezier(.4, 0, .2, 1) both;
  }
  /* 空态钉在宿主导入窗的默认内容高度（360px），否则对话框会先按 360px 画一遍再收缩，
     看上去像“没有打开动画”。多出来的高度让选择区吃掉，顺便得到一个够大的投放区。 */
  main.empty { min-height: min(360px, calc(100dvh - 200px)); }
  main.empty .dropzone { flex: 1; }
  @keyframes panel-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: none; }
  }
  @keyframes rise {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: none; }
  }

  .lede { margin: 0; color: var(--muted); font-size: 14px; }

  /* —— 选择文件：白色卡片，整块可点，右侧胶囊只是视觉锚点 —— */
  .dropzone {
    display: flex; align-items: center; gap: 16px; width: 100%; text-align: left;
    padding: 18px 20px; border: 1px solid var(--hairline); border-radius: 18px;
    background: var(--surface); cursor: pointer;
    transition: background .16s ease, border-color .16s ease, transform .16s ease;
  }
  .dropzone:hover:not(:disabled) { border-color: var(--brand); }
  .dropzone:active:not(:disabled) { transform: scale(.99); }
  .dropzone:disabled { cursor: progress; opacity: .6; }
  .dropzone .icon { display: flex; color: var(--brand); }
  .dropzone svg { width: 26px; height: 26px; }
  .dropzone .text { flex: 1; min-width: 0; }
  .dropzone b { display: block; font-size: 19px; font-weight: 600; letter-spacing: -0.2px; }
  .dropzone small { display: block; margin-top: 3px; color: var(--muted); }
  .dropzone .pill {
    flex: none; padding: 9px 20px; border-radius: 9999px;
    background: var(--brand); color: #fff; font-size: 15px;
  }

  .steps {
    display: flex; flex-direction: column; gap: 6px; margin: 0; padding-left: 20px;
    color: var(--muted); font-size: 14px;
  }
  .steps[hidden] { display: none; }

  /* —— 卡片：羊皮纸底上的白色面，1px 发丝线，18px 圆角，无阴影 —— */
  .card {
    display: flex; flex-direction: column;
    border: 1px solid var(--hairline); border-radius: 18px; background: var(--surface);
    animation: rise .24s cubic-bezier(.4, 0, .2, 1) both;
  }
  .card[hidden] { display: none; }
  .head { display: flex; align-items: baseline; gap: 8px; padding: 14px 20px 2px; }
  .head h2 { margin: 0; font-size: 13px; font-weight: 600; letter-spacing: 0; }
  .head .meta { color: var(--muted); font-size: 13px; }
  .head .action {
    margin-left: auto; padding: 0; border: 0; background: none; cursor: pointer;
    color: var(--brand); font-size: 13px;
  }
  .head .action[hidden] { display: none; }
  .head .action:hover { text-decoration: underline; }

  .chips { display: flex; flex-wrap: wrap; gap: 8px; padding: 10px 20px 16px; }
  .chip {
    display: inline-flex; align-items: center; gap: 6px; max-width: 100%;
    padding: 6px 12px; border: 1px solid var(--hairline); border-radius: 9999px;
    background: var(--pearl); font-size: 13px;
  }
  .chip b { font-weight: 400; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .chip span { color: var(--muted); white-space: nowrap; }

  /* —— 列表行：发丝线分隔，行内可点 —— */
  .list { margin: 0 0 6px; padding: 0; list-style: none; }
  .list.scroll { max-height: 212px; overflow: auto; }
  .list li { transition: opacity .16s ease, background .16s ease; }
  .list li + li { border-top: 1px solid var(--hairline); }
  .list li.off { opacity: .4; }
  .list label {
    display: flex; align-items: center; gap: 12px; padding: 11px 20px; cursor: pointer;
  }
  .list li:hover { background: var(--hover); }
  .list input[type='checkbox'] {
    flex: none; margin: 0; width: 16px; height: 16px; accent-color: var(--brand);
  }
  .list .name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .list .platforms, .list .count { color: var(--muted); font-size: 13px; white-space: nowrap; }
  .list .count { margin-left: auto; }

  /* 逐个导入时行内直接改名：这个名字会预填到澜音的目标选择框里。 */
  .name-input {
    display: none; flex: 1; min-width: 0; padding: 5px 8px;
    border: 1px solid transparent; border-radius: 6px; background: transparent;
    color: inherit; font: inherit; transition: border-color .16s ease, background .16s ease;
  }
  .list.rename .name { display: none; }
  .list.rename .name-input { display: block; }
  .name-input:hover { border-color: var(--hairline); }
  .name-input:focus { border-color: var(--brand); background: var(--surface); outline: none; }

  .note { margin: 0 20px 14px; color: var(--warn); font-size: 13px; }
  .note[hidden] { display: none; }

  /* —— 导入方式：同一张卡里的两个单选项 —— */
  .choices { display: flex; flex-direction: column; }
  .choice {
    display: flex; align-items: flex-start; gap: 12px; padding: 11px 20px; cursor: pointer;
    transition: background .16s ease;
  }
  .choice + .choice { border-top: 1px solid var(--hairline); }
  .choice:hover { background: var(--hover); }
  .choice:has(input:checked) { background: var(--brand-tint); }
  .choice input { flex: none; margin: 3px 0 0; width: 16px; height: 16px; accent-color: var(--brand); }
  .choice b { display: block; font-weight: 400; }
  .choice small { display: block; margin-top: 2px; color: var(--muted); font-size: 13px; }

  /* 「合并为一个歌单」时的目标名。 */
  .field {
    display: flex; align-items: center; gap: 12px; padding: 11px 20px;
    border-top: 1px solid var(--hairline);
  }
  .field[hidden] { display: none; }
  .field span { color: var(--muted); font-size: 13px; white-space: nowrap; }
  .field input {
    flex: 1; min-width: 0; padding: 6px 10px; border: 1px solid var(--hairline);
    border-radius: 8px; background: var(--pearl); color: inherit; font: inherit;
  }
  .field input:focus { border-color: var(--brand); outline: none; }

  /* —— 底栏：粘住底部，半透明 + 背景模糊 —— */
  .bar {
    position: sticky; bottom: 0; display: flex; align-items: center; gap: 16px;
    margin-top: auto; padding: 14px 0 16px;
    border-top: 1px solid var(--hairline);
    background: var(--canvas);
    animation: rise .24s cubic-bezier(.4, 0, .2, 1) both;
  }
  @supports (backdrop-filter: blur(1px)) {
    .bar {
      background: color-mix(in srgb, var(--canvas) 82%, transparent);
      backdrop-filter: saturate(180%) blur(20px);
    }
  }
  .status { flex: 1; min-width: 0; color: var(--muted); font-size: 13px; }
  .status.ok { color: var(--ok); }
  .status.warn { color: var(--warn); }
  .status.error { color: var(--err); }

  button.primary {
    flex: none; padding: 10px 22px; border: 0; border-radius: 9999px; cursor: pointer;
    background: var(--brand); color: #fff; font-size: 15px;
    transition: background .16s ease, transform .16s ease, opacity .16s ease;
  }
  button.primary:hover:not(:disabled) { background: var(--brand-focus); }
  button.primary:active:not(:disabled) { transform: scale(.95); }
  button.primary:disabled { opacity: .35; cursor: not-allowed; }

  /* 跟随系统的“减少动态效果”。 */
  @media (prefers-reduced-motion: reduce) {
    main, .card, .bar, .dropzone, .choice, .list li, button.primary { animation: none; transition: none; }
  }
`;
  var ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5v10" /><path d="m7.8 9.6 4.2 4.4 4.2-4.4" /><path d="M4.5 16.5v2A2.5 2.5 0 0 0 7 21h10a2.5 2.5 0 0 0 2.5-2.5v-2" /></svg>`;
  var view_default = defineSurface((ctx) => {
    const el = (tag, text) => {
      const element = document.createElement(tag);
      if (text) element.textContent = text;
      return element;
    };
    const style = el("style");
    style.textContent = STYLE;
    let summary;
    let busy = false;
    const selected = /* @__PURE__ */ new Set();
    let mergeNameTouched = false;
    const lede = el(
      "p",
      "选择洛雪音乐导出的歌单文件，解析后写入澜音本地歌单；文件只在本机解析，不会上传。"
    );
    lede.className = "lede";
    const dropzone = el("button");
    dropzone.type = "button";
    dropzone.className = "dropzone";
    const icon = el("span");
    icon.className = "icon";
    icon.innerHTML = ICON;
    const dropzoneText = el("span");
    dropzoneText.className = "text";
    dropzoneText.append(el("b", "洛雪歌单文件"), el("small", "支持 .json / .lxmc，可多选"));
    const dropzonePill = el("span", "选择文件");
    dropzonePill.className = "pill";
    dropzone.append(icon, dropzoneText, dropzonePill);
    dropzone.onclick = () => void run(pickFiles);
    const steps = el("ol");
    steps.className = "steps";
    for (const text of [
      "在洛雪音乐里打开「我的列表」，导出或备份歌单，得到一个 .json 或 .lxmc 文件",
      "在这里选择文件，勾选要导入的歌单，再选择导入方式和目标歌单",
      "播放需要已启用同平台音源（如「洛雪兼容环境」或「聆澜音源」）"
    ])
      steps.append(el("li", text));
    const head = (title, actionLabel = "") => {
      const meta = el("span");
      meta.className = "meta";
      const action = el("button", actionLabel);
      action.type = "button";
      action.className = "action";
      action.hidden = !actionLabel;
      const wrapper = el("div");
      wrapper.className = "head";
      wrapper.append(el("h2", title), meta, action);
      return { wrapper, meta, action };
    };
    const filesHead = head("来源文件");
    const chips = el("div");
    chips.className = "chips";
    const filesSection = el("section");
    filesSection.className = "card";
    filesSection.hidden = true;
    filesSection.append(filesHead.wrapper, chips);
    const listHead = head("待导入歌单", "取消全选");
    const list = el("ul");
    list.className = "list scroll";
    const note = el("p");
    note.className = "note";
    note.hidden = true;
    const emptyNote = el("p", "请至少勾选一个歌单");
    emptyNote.className = "note";
    emptyNote.hidden = true;
    const playlistsSection = el("section");
    playlistsSection.className = "card";
    playlistsSection.hidden = true;
    playlistsSection.append(listHead.wrapper, list, note, emptyNote);
    const choice = (label, hint, checked) => {
      const input = el("input");
      input.type = "radio";
      input.name = "lx-import-mode";
      input.checked = checked;
      const text = el("span");
      text.append(el("b", label), el("small", hint));
      const wrapper = el("label");
      wrapper.className = "choice";
      wrapper.append(input, text);
      return wrapper;
    };
    const splitChoice = choice(
      "每个歌单各建一个本地歌单",
      "选中的歌单逐个写入；每个新歌单在澜音的弹窗里确认一次，名字已按左边填好的预填",
      true
    );
    const mergeChoice = choice(
      "合并为一个歌单",
      "把选中的歌单里的歌曲写进同一个歌单，只需确认一次目标",
      false
    );
    const split = splitChoice.querySelector("input");
    const merge = mergeChoice.querySelector("input");
    split.onchange = merge.onchange = () => updateSelection();
    const mergeName = el("input");
    mergeName.type = "text";
    mergeName.maxLength = 60;
    mergeName.id = "lx-merge-name";
    mergeName.setAttribute("aria-label", "合并后的歌单名");
    mergeName.oninput = () => {
      mergeNameTouched = true;
    };
    const mergeField = el("label");
    mergeField.className = "field";
    mergeField.append(el("span", "歌单名"), mergeName);
    mergeField.hidden = true;
    const choices = el("div");
    choices.className = "choices";
    choices.append(splitChoice, mergeChoice);
    const modesSection = el("section");
    modesSection.className = "card";
    modesSection.hidden = true;
    modesSection.append(head("导入方式").wrapper, choices, mergeField);
    const status = el("span");
    status.className = "status";
    status.textContent = "请选择洛雪歌单文件";
    const commit = el("button", "开始导入");
    commit.type = "button";
    commit.className = "primary";
    commit.disabled = true;
    commit.onclick = () => void run(commitImport);
    listHead.action.onclick = () => toggleAll();
    const bar = el("footer");
    bar.className = "bar";
    bar.append(status, commit);
    const main = el("main");
    main.className = "empty";
    main.append(lede, dropzone, steps, filesSection, playlistsSection, modesSection, bar);
    ctx.root.replaceChildren(style, main);
    function applyTheme(value) {
      if (value !== "dark" && value !== "light") return;
      document.documentElement.dataset.theme = value;
    }
    function setBusy(next) {
      busy = next;
      dropzone.disabled = next;
      commit.disabled = next || !summary?.libraryReady || selected.size === 0;
      split.disabled = next;
      merge.disabled = next;
    }
    function updateSelection() {
      const total = summary?.playlists.length ?? 0;
      const count = selected.size;
      const isSplit = !merge.checked;
      commit.textContent = count ? `导入选中的 ${count} 个歌单` : "开始导入";
      commit.disabled = busy || !summary?.libraryReady || count === 0;
      listHead.meta.textContent = count === total ? `${total} 个` : `已选 ${count}/${total}`;
      listHead.action.textContent = count === total ? "取消全选" : "全选";
      emptyNote.hidden = count > 0;
      modesSection.hidden = count <= 1;
      if (count <= 1) split.checked = true;
      list.classList.toggle("rename", !merge.checked);
      mergeField.hidden = merge.checked === false;
      if (!mergeNameTouched) mergeName.value = defaultMergeName();
    }
    function defaultMergeName() {
      if (!summary) return "";
      const picked = summary.playlists.filter((playlist) => selected.has(playlist.index));
      const first = picked[0] ?? summary.playlists[0];
      if (!first) return "";
      return picked.length > 1 ? `${first.name} 等 ${picked.length} 个歌单` : first.name;
    }
    function playlistNameOf(index) {
      const input = list.querySelector(`.name-input[data-index="${index}"]`);
      return input?.value.trim() || summary?.playlists.find((item) => item.index === index)?.name || "";
    }
    function toggleAll() {
      if (!summary) return;
      const clear = selected.size === summary.playlists.length;
      selected.clear();
      if (!clear) for (const playlist of summary.playlists) selected.add(playlist.index);
      for (const checkbox of Array.from(list.querySelectorAll("input"))) {
        checkbox.checked = !clear;
        checkbox.closest("li")?.classList.toggle("off", clear);
      }
      updateSelection();
    }
    function setStatus(text, kind = "") {
      status.textContent = text;
      status.className = "status" + (kind ? " " + kind : "");
    }
    async function run(task) {
      if (busy) return;
      try {
        await task();
      } catch (error) {
        setStatus(error instanceof Error ? error.message : String(error), "error");
      } finally {
        setBusy(false);
      }
    }
    function renderSummary(next) {
      summary = next;
      applyTheme(next.theme);
      main.className = "";
      steps.hidden = true;
      chips.replaceChildren(
        ...next.files.map((file) => {
          const chip = el("span");
          chip.className = "chip";
          chip.append(
            el("b", `${file.label}.${file.compressed ? "lxmc" : "json"}`),
            el("span", `${file.songs} 首${file.compressed ? " · 已解压" : ""}`)
          );
          chip.title = `${file.format} · ${file.playlists} 个歌单 · ${file.songs} 首`;
          return chip;
        })
      );
      filesHead.meta.textContent = [
        `${next.totals.files} 个文件`,
        `${next.totals.playlists} 个歌单`,
        `${next.totals.songs} 首歌曲`
      ].join(" · ");
      listHead.meta.textContent = `${next.totals.playlists} 个`;
      selected.clear();
      for (const playlist of next.playlists) selected.add(playlist.index);
      mergeNameTouched = false;
      list.replaceChildren(
        ...next.playlists.map((playlist) => {
          const item = el("li");
          const checkbox = el("input");
          checkbox.type = "checkbox";
          checkbox.checked = true;
          checkbox.dataset.index = String(playlist.index);
          checkbox.onchange = () => {
            if (checkbox.checked) selected.add(playlist.index);
            else selected.delete(playlist.index);
            item.classList.toggle("off", !checkbox.checked);
            updateSelection();
          };
          const name = el("span", playlist.name);
          name.className = "name";
          name.title = playlist.name;
          const nameInput = el("input");
          nameInput.type = "text";
          nameInput.className = "name-input";
          nameInput.value = playlist.name;
          nameInput.maxLength = 60;
          nameInput.dataset.index = String(playlist.index);
          nameInput.setAttribute("aria-label", "导入后的歌单名");
          const platforms = el("span", describePlatforms(playlist.platforms));
          platforms.className = "platforms";
          platforms.title = describePlatformsDetailed(playlist.platforms);
          const count = el("span", `${playlist.songs} 首`);
          count.className = "count";
          const label = el("label");
          label.append(checkbox, name, nameInput, platforms, count);
          item.append(label);
          return item;
        })
      );
      const notes = [];
      if (next.totals.skipped) notes.push(`${next.totals.skipped} 条歌曲缺少平台信息，已跳过`);
      if (next.totals.empty) notes.push(`${next.totals.empty} 个歌单为空，已跳过`);
      note.textContent = notes.join("；");
      note.hidden = !notes.length;
      filesSection.hidden = false;
      playlistsSection.hidden = false;
      setStatus(
        next.libraryReady ? `解析完成，共 ${next.totals.songs} 首，可以开始导入` : "当前宿主没有接入歌单写入能力：请在澜音桌面端使用本导入功能",
        next.libraryReady ? "ok" : "warn"
      );
      updateSelection();
    }
    async function pickFiles() {
      setBusy(true);
      setStatus("正在读取并解析文件…");
      const result = await ctx.invoke("import.pick", {});
      if (!result || result.cancelled || !("sessionId" in result)) {
        setStatus("已取消选择");
        if (!summary) {
          main.className = "empty";
          steps.hidden = false;
        }
        return;
      }
      renderSummary(result);
    }
    async function commitImport() {
      if (!summary || !selected.size) return;
      const mode = merge.checked ? "merge" : "split";
      const indexes = [...selected].sort((a, b) => a - b);
      setBusy(true);
      setStatus("正在写入澜音歌单…");
      const result = await ctx.invoke("import.commit", {
        sessionId: summary.sessionId,
        mode,
        // 名字在面板里一次改好，逐个导入时预填到澜音的目标选择框。
        playlists: indexes.map((index) => ({ index, name: playlistNameOf(index) })),
        ...mode === "merge" && mergeName.value.trim() ? { name: mergeName.value.trim() } : {}
      });
      applyTheme(result.theme);
      const detail = result.playlists.map(
        (item) => item.already ? `${item.name}：上次已导入` : `${item.name}：写入 ${item.added} 首${item.skipped ? `，跳过 ${item.skipped}` : ""}`
      ).join("；");
      const tail = result.already ? `（${result.already} 个歌单上次已导入，未重做）` : "";
      setStatus(
        result.cancelled ? `已取消：已写入 ${result.added} 首${tail}。${detail}` : `导入完成：写入 ${result.added} 首${result.skipped ? `，跳过 ${result.skipped} 首重复` : ""}${tail}。${detail}`,
        result.cancelled ? "warn" : "ok"
      );
    }
    const unsubscribe = ctx.subscribe((state) => {
      applyTheme(state.theme);
      if (busy && state.stage === "importing" && typeof state.message === "string")
        setStatus(state.message);
    });
    return () => {
      unsubscribe();
      ctx.root.replaceChildren();
    };
  });
  return __toCommonJS(view_exports);
})();

if (typeof __ceru_entry.default !== "function") throw new Error("Entry must default-export a function");
return __ceru_entry.default(ctx);
};

const surfaces = {
"import": ViewImportSurface
};

// Embedded static resources
const resources = {};

// Public plugin exports

exports.activate = LogicMain;

exports.surfaces = surfaces;

exports.resources = resources;
