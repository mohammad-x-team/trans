
// Compiles a dart2wasm-generated main module from `source` which can then
// instantiatable via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(
      await WebAssembly.compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm modules from `bytes` which is then
// instantiatable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

// DEPRECATED: Please use `compile` or `compileStreaming` to get a compiled app,
// use `instantiate` method to get an instantiated app and then call
// `invokeMain` to invoke the main function.
export async function instantiate(modulePromise, importObjectPromise) {
  var moduleOrCompiledApp = await modulePromise;
  if (!(moduleOrCompiledApp instanceof CompiledApp)) {
    moduleOrCompiledApp = new CompiledApp(moduleOrCompiledApp);
  }
  const instantiatedApp = await moduleOrCompiledApp.instantiate(await importObjectPromise);
  return instantiatedApp.instantiatedModule;
}

// DEPRECATED: Please use `compile` or `compileStreaming` to get a compiled app,
// use `instantiate` method to get an instantiated app and then call
// `invokeMain` to invoke the main function.
export const invoke = (moduleInstance, ...args) => {
  moduleInstance.exports.$invokeMain(args);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredWasm` is a JS function that takes a module name matching a
  //   wasm file produced by the dart2wasm compiler and returns the bytes to
  //   load the module. These bytes can be in either a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  async instantiate(additionalImports, {loadDeferredWasm} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + js;
    }

    // Converts a Dart List to a JS array. Any Dart objects will be converted, but
    // this will be cheap for JSValues.
    function arrayFromDartList(constructor, list) {
      const exports = dartInstance.exports;
      const read = exports.$listRead;
      const length = exports.$listLength(list);
      const array = new constructor(length);
      for (let i = 0; i < length; i++) {
        array[i] = read(list, i);
      }
      return array;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {

      _1: (x0,x1,x2) => x0.set(x1,x2),
      _2: (x0,x1,x2) => x0.set(x1,x2),
      _6: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._6(f,arguments.length,x0) }),
      _7: x0 => new window.FinalizationRegistry(x0),
      _8: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      _9: (x0,x1) => x0.unregister(x1),
      _10: (x0,x1,x2) => x0.slice(x1,x2),
      _11: (x0,x1) => x0.decode(x1),
      _12: (x0,x1) => x0.segment(x1),
      _13: () => new TextDecoder(),
      _14: x0 => x0.buffer,
      _15: x0 => x0.wasmMemory,
      _16: () => globalThis.window._flutter_skwasmInstance,
      _17: x0 => x0.rasterStartMilliseconds,
      _18: x0 => x0.rasterEndMilliseconds,
      _19: x0 => x0.imageBitmaps,
      _192: x0 => x0.select(),
      _193: (x0,x1) => x0.append(x1),
      _194: x0 => x0.remove(),
      _197: x0 => x0.unlock(),
      _202: x0 => x0.getReader(),
      _211: x0 => new MutationObserver(x0),
      _222: (x0,x1,x2) => x0.addEventListener(x1,x2),
      _223: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      _226: x0 => new ResizeObserver(x0),
      _229: (x0,x1) => new Intl.Segmenter(x0,x1),
      _230: x0 => x0.next(),
      _231: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      _316: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._316(f,arguments.length,x0) }),
      _317: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._317(f,arguments.length,x0) }),
      _318: (x0,x1) => ({addView: x0,removeView: x1}),
      _319: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._319(f,arguments.length,x0) }),
      _320: f => finalizeWrapper(f, function() { return dartInstance.exports._320(f,arguments.length) }),
      _321: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      _322: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._322(f,arguments.length,x0) }),
      _323: x0 => ({runApp: x0}),
      _324: x0 => new Uint8Array(x0),
      _326: x0 => x0.preventDefault(),
      _327: x0 => x0.stopPropagation(),
      _328: (x0,x1) => x0.addListener(x1),
      _329: (x0,x1) => x0.removeListener(x1),
      _330: (x0,x1) => x0.prepend(x1),
      _331: x0 => x0.remove(),
      _332: x0 => x0.disconnect(),
      _333: (x0,x1) => x0.addListener(x1),
      _334: (x0,x1) => x0.removeListener(x1),
      _335: x0 => x0.blur(),
      _336: (x0,x1) => x0.append(x1),
      _337: x0 => x0.remove(),
      _338: x0 => x0.stopPropagation(),
      _342: x0 => x0.preventDefault(),
      _343: (x0,x1) => x0.append(x1),
      _344: x0 => x0.remove(),
      _345: x0 => x0.preventDefault(),
      _350: (x0,x1) => x0.removeChild(x1),
      _351: (x0,x1) => x0.appendChild(x1),
      _352: (x0,x1,x2) => x0.insertBefore(x1,x2),
      _353: (x0,x1) => x0.appendChild(x1),
      _354: (x0,x1) => x0.transferFromImageBitmap(x1),
      _356: (x0,x1) => x0.append(x1),
      _357: (x0,x1) => x0.append(x1),
      _358: (x0,x1) => x0.append(x1),
      _359: x0 => x0.remove(),
      _360: x0 => x0.remove(),
      _361: x0 => x0.remove(),
      _362: (x0,x1) => x0.appendChild(x1),
      _363: (x0,x1) => x0.appendChild(x1),
      _364: x0 => x0.remove(),
      _365: (x0,x1) => x0.append(x1),
      _366: (x0,x1) => x0.append(x1),
      _367: x0 => x0.remove(),
      _368: (x0,x1) => x0.append(x1),
      _369: (x0,x1) => x0.append(x1),
      _370: (x0,x1,x2) => x0.insertBefore(x1,x2),
      _371: (x0,x1) => x0.append(x1),
      _372: (x0,x1,x2) => x0.insertBefore(x1,x2),
      _373: x0 => x0.remove(),
      _374: (x0,x1) => x0.append(x1),
      _375: x0 => x0.remove(),
      _376: (x0,x1) => x0.append(x1),
      _377: x0 => x0.remove(),
      _378: x0 => x0.remove(),
      _379: x0 => x0.getBoundingClientRect(),
      _380: x0 => x0.remove(),
      _393: (x0,x1) => x0.append(x1),
      _394: x0 => x0.remove(),
      _395: (x0,x1) => x0.append(x1),
      _396: (x0,x1,x2) => x0.insertBefore(x1,x2),
      _397: x0 => x0.preventDefault(),
      _398: x0 => x0.preventDefault(),
      _399: x0 => x0.preventDefault(),
      _400: x0 => x0.preventDefault(),
      _401: (x0,x1) => x0.observe(x1),
      _402: x0 => x0.disconnect(),
      _403: (x0,x1) => x0.appendChild(x1),
      _404: (x0,x1) => x0.appendChild(x1),
      _405: (x0,x1) => x0.appendChild(x1),
      _406: (x0,x1) => x0.append(x1),
      _407: x0 => x0.remove(),
      _408: (x0,x1) => x0.append(x1),
      _410: (x0,x1) => x0.appendChild(x1),
      _411: (x0,x1) => x0.append(x1),
      _412: x0 => x0.remove(),
      _413: (x0,x1) => x0.append(x1),
      _414: x0 => x0.remove(),
      _418: (x0,x1) => x0.appendChild(x1),
      _419: x0 => x0.remove(),
      _978: () => globalThis.window.flutterConfiguration,
      _979: x0 => x0.assetBase,
      _984: x0 => x0.debugShowSemanticsNodes,
      _985: x0 => x0.hostElement,
      _986: x0 => x0.multiViewEnabled,
      _987: x0 => x0.nonce,
      _989: x0 => x0.fontFallbackBaseUrl,
      _995: x0 => x0.console,
      _996: x0 => x0.devicePixelRatio,
      _997: x0 => x0.document,
      _998: x0 => x0.history,
      _999: x0 => x0.innerHeight,
      _1000: x0 => x0.innerWidth,
      _1001: x0 => x0.location,
      _1002: x0 => x0.navigator,
      _1003: x0 => x0.visualViewport,
      _1004: x0 => x0.performance,
      _1007: (x0,x1) => x0.dispatchEvent(x1),
      _1008: (x0,x1) => x0.matchMedia(x1),
      _1010: (x0,x1) => x0.getComputedStyle(x1),
      _1011: x0 => x0.screen,
      _1012: (x0,x1) => x0.requestAnimationFrame(x1),
      _1013: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1013(f,arguments.length,x0) }),
      _1018: (x0,x1) => x0.warn(x1),
      _1021: () => globalThis.window,
      _1022: () => globalThis.Intl,
      _1023: () => globalThis.Symbol,
      _1026: x0 => x0.clipboard,
      _1027: x0 => x0.maxTouchPoints,
      _1028: x0 => x0.vendor,
      _1029: x0 => x0.language,
      _1030: x0 => x0.platform,
      _1031: x0 => x0.userAgent,
      _1032: x0 => x0.languages,
      _1033: x0 => x0.documentElement,
      _1034: (x0,x1) => x0.querySelector(x1),
      _1038: (x0,x1) => x0.createElement(x1),
      _1039: (x0,x1) => x0.execCommand(x1),
      _1042: (x0,x1) => x0.createTextNode(x1),
      _1043: (x0,x1) => x0.createEvent(x1),
      _1047: x0 => x0.head,
      _1048: x0 => x0.body,
      _1049: (x0,x1) => x0.title = x1,
      _1052: x0 => x0.activeElement,
      _1054: x0 => x0.visibilityState,
      _1056: x0 => x0.hasFocus(),
      _1057: () => globalThis.document,
      _1058: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      _1059: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      _1062: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1062(f,arguments.length,x0) }),
      _1063: x0 => x0.target,
      _1065: x0 => x0.timeStamp,
      _1066: x0 => x0.type,
      _1068: x0 => x0.preventDefault(),
      _1070: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      _1077: x0 => x0.firstChild,
      _1082: x0 => x0.parentElement,
      _1084: x0 => x0.parentNode,
      _1088: (x0,x1) => x0.removeChild(x1),
      _1089: (x0,x1) => x0.removeChild(x1),
      _1090: x0 => x0.isConnected,
      _1091: (x0,x1) => x0.textContent = x1,
      _1095: (x0,x1) => x0.contains(x1),
      _1101: x0 => x0.firstElementChild,
      _1103: x0 => x0.nextElementSibling,
      _1104: x0 => x0.clientHeight,
      _1105: x0 => x0.clientWidth,
      _1106: x0 => x0.offsetHeight,
      _1107: x0 => x0.offsetWidth,
      _1108: x0 => x0.id,
      _1109: (x0,x1) => x0.id = x1,
      _1112: (x0,x1) => x0.spellcheck = x1,
      _1113: x0 => x0.tagName,
      _1114: x0 => x0.style,
      _1115: (x0,x1) => x0.append(x1),
      _1117: (x0,x1) => x0.getAttribute(x1),
      _1118: x0 => x0.getBoundingClientRect(),
      _1121: (x0,x1) => x0.closest(x1),
      _1124: (x0,x1) => x0.querySelectorAll(x1),
      _1126: x0 => x0.remove(),
      _1127: (x0,x1,x2) => x0.setAttribute(x1,x2),
      _1128: (x0,x1) => x0.removeAttribute(x1),
      _1129: (x0,x1) => x0.tabIndex = x1,
      _1132: (x0,x1) => x0.focus(x1),
      _1133: x0 => x0.scrollTop,
      _1134: (x0,x1) => x0.scrollTop = x1,
      _1135: x0 => x0.scrollLeft,
      _1136: (x0,x1) => x0.scrollLeft = x1,
      _1137: x0 => x0.classList,
      _1138: (x0,x1) => x0.className = x1,
      _1144: (x0,x1) => x0.getElementsByClassName(x1),
      _1146: x0 => x0.click(),
      _1147: (x0,x1) => x0.hasAttribute(x1),
      _1150: (x0,x1) => x0.attachShadow(x1),
      _1155: (x0,x1) => x0.getPropertyValue(x1),
      _1157: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      _1159: (x0,x1) => x0.removeProperty(x1),
      _1161: x0 => x0.offsetLeft,
      _1162: x0 => x0.offsetTop,
      _1163: x0 => x0.offsetParent,
      _1165: (x0,x1) => x0.name = x1,
      _1166: x0 => x0.content,
      _1167: (x0,x1) => x0.content = x1,
      _1185: (x0,x1) => x0.nonce = x1,
      _1191: x0 => x0.now(),
      _1193: (x0,x1) => x0.width = x1,
      _1195: (x0,x1) => x0.height = x1,
      _1199: (x0,x1) => x0.getContext(x1),
      _1275: (x0,x1) => x0.fetch(x1),
      _1276: x0 => x0.status,
      _1278: x0 => x0.body,
      _1279: x0 => x0.arrayBuffer(),
      _1285: x0 => x0.read(),
      _1286: x0 => x0.value,
      _1287: x0 => x0.done,
      _1290: x0 => x0.x,
      _1291: x0 => x0.y,
      _1294: x0 => x0.top,
      _1295: x0 => x0.right,
      _1296: x0 => x0.bottom,
      _1297: x0 => x0.left,
      _1306: x0 => x0.height,
      _1307: x0 => x0.width,
      _1308: (x0,x1) => x0.value = x1,
      _1310: (x0,x1) => x0.placeholder = x1,
      _1311: (x0,x1) => x0.name = x1,
      _1312: x0 => x0.selectionDirection,
      _1313: x0 => x0.selectionStart,
      _1314: x0 => x0.selectionEnd,
      _1317: x0 => x0.value,
      _1319: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      _1322: x0 => x0.readText(),
      _1323: (x0,x1) => x0.writeText(x1),
      _1324: x0 => x0.altKey,
      _1325: x0 => x0.code,
      _1326: x0 => x0.ctrlKey,
      _1327: x0 => x0.key,
      _1328: x0 => x0.keyCode,
      _1329: x0 => x0.location,
      _1330: x0 => x0.metaKey,
      _1331: x0 => x0.repeat,
      _1332: x0 => x0.shiftKey,
      _1333: x0 => x0.isComposing,
      _1334: (x0,x1) => x0.getModifierState(x1),
      _1336: x0 => x0.state,
      _1337: (x0,x1) => x0.go(x1),
      _1339: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      _1341: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      _1342: x0 => x0.pathname,
      _1343: x0 => x0.search,
      _1344: x0 => x0.hash,
      _1348: x0 => x0.state,
      _1356: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1356(f,arguments.length,x0,x1) }),
      _1358: (x0,x1,x2) => x0.observe(x1,x2),
      _1361: x0 => x0.attributeName,
      _1362: x0 => x0.type,
      _1363: x0 => x0.matches,
      _1366: x0 => x0.matches,
      _1368: x0 => x0.relatedTarget,
      _1369: x0 => x0.clientX,
      _1370: x0 => x0.clientY,
      _1371: x0 => x0.offsetX,
      _1372: x0 => x0.offsetY,
      _1375: x0 => x0.button,
      _1376: x0 => x0.buttons,
      _1377: x0 => x0.ctrlKey,
      _1378: (x0,x1) => x0.getModifierState(x1),
      _1381: x0 => x0.pointerId,
      _1382: x0 => x0.pointerType,
      _1383: x0 => x0.pressure,
      _1384: x0 => x0.tiltX,
      _1385: x0 => x0.tiltY,
      _1386: x0 => x0.getCoalescedEvents(),
      _1388: x0 => x0.deltaX,
      _1389: x0 => x0.deltaY,
      _1390: x0 => x0.wheelDeltaX,
      _1391: x0 => x0.wheelDeltaY,
      _1392: x0 => x0.deltaMode,
      _1398: x0 => x0.changedTouches,
      _1400: x0 => x0.clientX,
      _1401: x0 => x0.clientY,
      _1403: x0 => x0.data,
      _1406: (x0,x1) => x0.disabled = x1,
      _1407: (x0,x1) => x0.type = x1,
      _1408: (x0,x1) => x0.max = x1,
      _1409: (x0,x1) => x0.min = x1,
      _1410: (x0,x1) => x0.value = x1,
      _1411: x0 => x0.value,
      _1412: x0 => x0.disabled,
      _1413: (x0,x1) => x0.disabled = x1,
      _1414: (x0,x1) => x0.placeholder = x1,
      _1415: (x0,x1) => x0.name = x1,
      _1416: (x0,x1) => x0.autocomplete = x1,
      _1417: x0 => x0.selectionDirection,
      _1418: x0 => x0.selectionStart,
      _1419: x0 => x0.selectionEnd,
      _1423: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      _1428: (x0,x1) => x0.add(x1),
      _1432: (x0,x1) => x0.noValidate = x1,
      _1433: (x0,x1) => x0.method = x1,
      _1434: (x0,x1) => x0.action = x1,
      _1459: x0 => x0.orientation,
      _1460: x0 => x0.width,
      _1461: x0 => x0.height,
      _1462: (x0,x1) => x0.lock(x1),
      _1478: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1478(f,arguments.length,x0,x1) }),
      _1489: x0 => x0.length,
      _1491: (x0,x1) => x0.item(x1),
      _1492: x0 => x0.length,
      _1493: (x0,x1) => x0.item(x1),
      _1494: x0 => x0.iterator,
      _1495: x0 => x0.Segmenter,
      _1496: x0 => x0.v8BreakIterator,
      _1499: x0 => x0.done,
      _1500: x0 => x0.value,
      _1501: x0 => x0.index,
      _1505: (x0,x1) => x0.adoptText(x1),
      _1506: x0 => x0.first(),
      _1507: x0 => x0.next(),
      _1508: x0 => x0.current(),
      _1522: x0 => x0.hostElement,
      _1523: x0 => x0.viewConstraints,
      _1525: x0 => x0.maxHeight,
      _1526: x0 => x0.maxWidth,
      _1527: x0 => x0.minHeight,
      _1528: x0 => x0.minWidth,
      _1529: x0 => x0.loader,
      _1530: () => globalThis._flutter,
      _1531: (x0,x1) => x0.didCreateEngineInitializer(x1),
      _1532: (x0,x1,x2) => x0.call(x1,x2),
      _1533: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1533(f,arguments.length,x0,x1) }),
      _1534: x0 => new Promise(x0),
      _1537: x0 => x0.length,
      _1632: x0 => new Array(x0),
      _1634: x0 => x0.length,
      _1636: (x0,x1) => x0[x1],
      _1637: (x0,x1,x2) => x0[x1] = x2,
      _1640: (x0,x1,x2) => new DataView(x0,x1,x2),
      _1642: x0 => new Int8Array(x0),
      _1643: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      _1644: x0 => new Uint8Array(x0),
      _1652: x0 => new Int32Array(x0),
      _1654: x0 => new Uint32Array(x0),
      _1656: x0 => new Float32Array(x0),
      _1658: x0 => new Float64Array(x0),
      _1659: (o, t) => typeof o === t,
      _1660: (o, c) => o instanceof c,
      _1664: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1664(f,arguments.length,x0) }),
      _1665: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1665(f,arguments.length,x0) }),
      _1690: (decoder, codeUnits) => decoder.decode(codeUnits),
      _1691: () => new TextDecoder("utf-8", {fatal: true}),
      _1692: () => new TextDecoder("utf-8", {fatal: false}),
      _1693: x0 => new WeakRef(x0),
      _1694: x0 => x0.deref(),
      _1700: Date.now,
      _1702: s => new Date(s * 1000).getTimezoneOffset() * 60,
      _1703: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      _1704: () => {
        let stackString = new Error().stack.toString();
        let frames = stackString.split('\n');
        let drop = 2;
        if (frames[0] === 'Error') {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      _1705: () => typeof dartUseDateNowForTicks !== "undefined",
      _1706: () => 1000 * performance.now(),
      _1707: () => Date.now(),
      _1708: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      _1709: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      _1710: () => new WeakMap(),
      _1711: (map, o) => map.get(o),
      _1712: (map, o, v) => map.set(o, v),
      _1713: () => globalThis.WeakRef,
      _1724: s => JSON.stringify(s),
      _1725: s => printToConsole(s),
      _1726: a => a.join(''),
      _1727: (o, a, b) => o.replace(a, b),
      _1729: (s, t) => s.split(t),
      _1730: s => s.toLowerCase(),
      _1731: s => s.toUpperCase(),
      _1732: s => s.trim(),
      _1733: s => s.trimLeft(),
      _1734: s => s.trimRight(),
      _1736: (s, p, i) => s.indexOf(p, i),
      _1737: (s, p, i) => s.lastIndexOf(p, i),
      _1738: (s) => s.replace(/\$/g, "$$$$"),
      _1739: Object.is,
      _1740: s => s.toUpperCase(),
      _1741: s => s.toLowerCase(),
      _1742: (a, i) => a.push(i),
      _1746: a => a.pop(),
      _1747: (a, i) => a.splice(i, 1),
      _1749: (a, s) => a.join(s),
      _1750: (a, s, e) => a.slice(s, e),
      _1752: (a, b) => a == b ? 0 : (a > b ? 1 : -1),
      _1753: a => a.length,
      _1755: (a, i) => a[i],
      _1756: (a, i, v) => a[i] = v,
      _1758: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      _1759: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      _1760: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      _1761: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      _1762: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      _1763: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      _1764: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      _1765: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      _1767: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      _1768: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      _1769: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      _1770: (t, s) => t.set(s),
      _1771: l => new DataView(new ArrayBuffer(l)),
      _1772: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      _1773: o => o.byteLength,
      _1774: o => o.buffer,
      _1775: o => o.byteOffset,
      _1776: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      _1777: (b, o) => new DataView(b, o),
      _1778: (b, o, l) => new DataView(b, o, l),
      _1779: Function.prototype.call.bind(DataView.prototype.getUint8),
      _1780: Function.prototype.call.bind(DataView.prototype.setUint8),
      _1781: Function.prototype.call.bind(DataView.prototype.getInt8),
      _1782: Function.prototype.call.bind(DataView.prototype.setInt8),
      _1783: Function.prototype.call.bind(DataView.prototype.getUint16),
      _1784: Function.prototype.call.bind(DataView.prototype.setUint16),
      _1785: Function.prototype.call.bind(DataView.prototype.getInt16),
      _1786: Function.prototype.call.bind(DataView.prototype.setInt16),
      _1787: Function.prototype.call.bind(DataView.prototype.getUint32),
      _1788: Function.prototype.call.bind(DataView.prototype.setUint32),
      _1789: Function.prototype.call.bind(DataView.prototype.getInt32),
      _1790: Function.prototype.call.bind(DataView.prototype.setInt32),
      _1793: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      _1794: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      _1795: Function.prototype.call.bind(DataView.prototype.getFloat32),
      _1796: Function.prototype.call.bind(DataView.prototype.setFloat32),
      _1797: Function.prototype.call.bind(DataView.prototype.getFloat64),
      _1798: Function.prototype.call.bind(DataView.prototype.setFloat64),
      _1811: () => new XMLHttpRequest(),
      _1812: (x0,x1,x2) => x0.open(x1,x2),
      _1813: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      _1814: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      _1815: x0 => x0.abort(),
      _1816: x0 => x0.abort(),
      _1817: x0 => x0.abort(),
      _1818: x0 => x0.abort(),
      _1819: (x0,x1) => x0.send(x1),
      _1820: x0 => x0.send(),
      _1822: x0 => x0.getAllResponseHeaders(),
      _1823: (o, t) => o instanceof t,
      _1825: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1825(f,arguments.length,x0) }),
      _1826: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1826(f,arguments.length,x0) }),
      _1827: o => Object.keys(o),
      _1828: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      _1829: (handle) => clearTimeout(handle),
      _1830: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      _1831: (handle) => clearInterval(handle),
      _1832: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      _1833: () => Date.now(),
      _1837: x0 => new URL(x0),
      _1838: (x0,x1) => new URL(x0,x1),
      _1839: (x0,x1) => globalThis.fetch(x0,x1),
      _1841: x0 => ({initial: x0}),
      _1842: x0 => new WebAssembly.Memory(x0),
      _1843: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1843(f,arguments.length,x0) }),
      _1844: f => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return dartInstance.exports._1844(f,arguments.length,x0,x1,x2,x3,x4) }),
      _1845: f => finalizeWrapper(f, function(x0,x1,x2) { return dartInstance.exports._1845(f,arguments.length,x0,x1,x2) }),
      _1846: f => finalizeWrapper(f, function(x0,x1,x2,x3) { return dartInstance.exports._1846(f,arguments.length,x0,x1,x2,x3) }),
      _1847: f => finalizeWrapper(f, function(x0,x1,x2,x3) { return dartInstance.exports._1847(f,arguments.length,x0,x1,x2,x3) }),
      _1848: f => finalizeWrapper(f, function(x0,x1,x2) { return dartInstance.exports._1848(f,arguments.length,x0,x1,x2) }),
      _1849: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1849(f,arguments.length,x0,x1) }),
      _1850: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1850(f,arguments.length,x0,x1) }),
      _1851: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1851(f,arguments.length,x0) }),
      _1852: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1852(f,arguments.length,x0) }),
      _1853: f => finalizeWrapper(f, function(x0,x1,x2,x3) { return dartInstance.exports._1853(f,arguments.length,x0,x1,x2,x3) }),
      _1854: f => finalizeWrapper(f, function(x0,x1,x2,x3) { return dartInstance.exports._1854(f,arguments.length,x0,x1,x2,x3) }),
      _1855: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1855(f,arguments.length,x0,x1) }),
      _1856: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1856(f,arguments.length,x0,x1) }),
      _1857: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1857(f,arguments.length,x0,x1) }),
      _1858: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1858(f,arguments.length,x0,x1) }),
      _1859: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1859(f,arguments.length,x0,x1) }),
      _1860: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1860(f,arguments.length,x0,x1) }),
      _1861: f => finalizeWrapper(f, function(x0,x1,x2) { return dartInstance.exports._1861(f,arguments.length,x0,x1,x2) }),
      _1862: f => finalizeWrapper(f, function(x0,x1,x2) { return dartInstance.exports._1862(f,arguments.length,x0,x1,x2) }),
      _1863: f => finalizeWrapper(f, function(x0,x1,x2) { return dartInstance.exports._1863(f,arguments.length,x0,x1,x2) }),
      _1864: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1864(f,arguments.length,x0) }),
      _1865: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1865(f,arguments.length,x0) }),
      _1866: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1866(f,arguments.length,x0) }),
      _1867: f => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return dartInstance.exports._1867(f,arguments.length,x0,x1,x2,x3,x4) }),
      _1868: f => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return dartInstance.exports._1868(f,arguments.length,x0,x1,x2,x3,x4) }),
      _1869: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1869(f,arguments.length,x0) }),
      _1870: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1870(f,arguments.length,x0) }),
      _1871: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1871(f,arguments.length,x0,x1) }),
      _1874: (x0,x1,x2,x3,x4) => x0.call(x1,x2,x3,x4),
      _1875: (x0,x1,x2) => x0.postMessage(x1,x2),
      _1877: (x0,x1) => x0.error(x1),
      _1878: () => new MessageChannel(),
      _1879: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1879(f,arguments.length,x0) }),
      _1880: (x0,x1,x2) => x0.postMessage(x1,x2),
      _1881: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1881(f,arguments.length,x0) }),
      _1882: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1882(f,arguments.length,x0) }),
      _1883: (x0,x1) => new SharedWorker(x0,x1),
      _1884: x0 => new Worker(x0),
      _1885: x0 => x0.continue(),
      _1886: () => globalThis.indexedDB,
      _1888: x0 => x0.arrayBuffer(),
      _1903: (x0,x1) => globalThis.IDBKeyRange.bound(x0,x1),
      _1904: (x0,x1,x2) => x0.open(x1,x2),
      _1905: x0 => ({autoIncrement: x0}),
      _1906: (x0,x1,x2) => x0.createObjectStore(x1,x2),
      _1907: x0 => ({unique: x0}),
      _1908: (x0,x1,x2,x3) => x0.createIndex(x1,x2,x3),
      _1909: (x0,x1) => x0.createObjectStore(x1),
      _1910: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1910(f,arguments.length,x0) }),
      _1912: (x0,x1,x2) => x0.transaction(x1,x2),
      _1915: (x0,x1) => x0.objectStore(x1),
      _1916: (x0,x1) => x0.index(x1),
      _1917: x0 => x0.openKeyCursor(),
      _1918: (x0,x1) => x0.objectStore(x1),
      _1919: (x0,x1) => x0.index(x1),
      _1920: (x0,x1) => x0.getKey(x1),
      _1921: (x0,x1) => x0.objectStore(x1),
      _1922: (x0,x1) => ({name: x0,length: x1}),
      _1923: (x0,x1) => x0.put(x1),
      _1924: (x0,x1) => x0.objectStore(x1),
      _1925: (x0,x1) => x0.get(x1),
      _1926: (x0,x1) => x0.objectStore(x1),
      _1927: (x0,x1) => x0.openCursor(x1),
      _1929: (x0,x1) => x0.objectStore(x1),
      _1930: x0 => globalThis.IDBKeyRange.only(x0),
      _1931: (x0,x1,x2) => x0.put(x1,x2),
      _1932: (x0,x1) => x0.update(x1),
      _1933: (x0,x1) => x0.objectStore(x1),
      _1934: (x0,x1) => x0.update(x1),
      _1935: (x0,x1) => x0.objectStore(x1),
      _1936: (x0,x1) => x0.objectStore(x1),
      _1937: (x0,x1) => x0.delete(x1),
      _1938: (x0,x1) => x0.update(x1),
      _1939: (x0,x1) => x0.objectStore(x1),
      _1940: (x0,x1) => x0.delete(x1),
      _1941: (x0,x1) => x0.objectStore(x1),
      _1942: (x0,x1) => x0.delete(x1),
      _1945: x0 => x0.name,
      _1946: x0 => x0.length,
      _1960: x0 => globalThis.BigInt(x0),
      _1961: x0 => globalThis.Number(x0),
      _1964: x0 => globalThis.Object.keys(x0),
      _1969: (x0,x1) => globalThis.WebAssembly.instantiateStreaming(x0,x1),
      _1970: x0 => x0.call(),
      _1971: x0 => x0.exports,
      _1972: x0 => x0.instance,
      _1976: x0 => x0.buffer,
      _1977: () => globalThis.WebAssembly.Global,
      _1997: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1997(f,arguments.length,x0) }),
      _1998: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1998(f,arguments.length,x0) }),
      _1999: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      _2000: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      _2021: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      _2022: (x0,x1) => x0.exec(x1),
      _2023: (x0,x1) => x0.test(x1),
      _2024: (x0,x1) => x0.exec(x1),
      _2025: (x0,x1) => x0.exec(x1),
      _2026: x0 => x0.pop(),
      _2028: o => o === undefined,
      _2047: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      _2049: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      _2050: o => o instanceof RegExp,
      _2051: (l, r) => l === r,
      _2052: o => o,
      _2053: o => o,
      _2054: o => o,
      _2055: b => !!b,
      _2056: o => o.length,
      _2059: (o, i) => o[i],
      _2060: f => f.dartFunction,
      _2061: l => arrayFromDartList(Int8Array, l),
      _2062: l => arrayFromDartList(Uint8Array, l),
      _2063: l => arrayFromDartList(Uint8ClampedArray, l),
      _2064: l => arrayFromDartList(Int16Array, l),
      _2065: l => arrayFromDartList(Uint16Array, l),
      _2066: l => arrayFromDartList(Int32Array, l),
      _2067: l => arrayFromDartList(Uint32Array, l),
      _2068: l => arrayFromDartList(Float32Array, l),
      _2069: l => arrayFromDartList(Float64Array, l),
      _2070: x0 => new ArrayBuffer(x0),
      _2071: (data, length) => {
        const getValue = dartInstance.exports.$byteDataGetUint8;
        const view = new DataView(new ArrayBuffer(length));
        for (let i = 0; i < length; i++) {
          view.setUint8(i, getValue(data, i));
        }
        return view;
      },
      _2072: l => arrayFromDartList(Array, l),
      _2073: () => ({}),
      _2074: () => [],
      _2075: l => new Array(l),
      _2076: () => globalThis,
      _2077: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      _2078: (o, p) => p in o,
      _2079: (o, p) => o[p],
      _2080: (o, p, v) => o[p] = v,
      _2081: (o, m, a) => o[m].apply(o, a),
      _2083: o => String(o),
      _2084: (p, s, f) => p.then(s, f),
      _2085: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        return 17;
      },
      _2086: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _2087: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _2090: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _2091: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _2092: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _2093: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _2094: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _2095: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _2096: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      _2099: x0 => x0.index,
      _2104: x0 => x0.flags,
      _2105: x0 => x0.multiline,
      _2106: x0 => x0.ignoreCase,
      _2107: x0 => x0.unicode,
      _2108: x0 => x0.dotAll,
      _2109: (x0,x1) => x0.lastIndex = x1,
      _2110: (o, p) => p in o,
      _2111: (o, p) => o[p],
      _2112: (o, p, v) => o[p] = v,
      _2131: x0 => globalThis.Object.keys(x0),
      _2132: x0 => x0.length,
      _2133: x0 => x0.random(),
      _2134: x0 => x0.random(),
      _2135: (x0,x1) => x0.getRandomValues(x1),
      _2136: () => globalThis.crypto,
      _2138: () => globalThis.Math,
      _2140: Function.prototype.call.bind(Number.prototype.toString),
      _2141: (d, digits) => d.toFixed(digits),
      _2192: x0 => x0.readyState,
      _2194: (x0,x1) => x0.timeout = x1,
      _2196: (x0,x1) => x0.withCredentials = x1,
      _2197: x0 => x0.upload,
      _2198: x0 => x0.responseURL,
      _2199: x0 => x0.status,
      _2200: x0 => x0.statusText,
      _2202: (x0,x1) => x0.responseType = x1,
      _2203: x0 => x0.response,
      _2217: x0 => x0.loaded,
      _2218: x0 => x0.total,
      _4523: x0 => x0.data,
      _4554: x0 => x0.port1,
      _4555: x0 => x0.port2,
      _4561: (x0,x1) => x0.onmessage = x1,
      _4640: (x0,x1) => x0.onerror = x1,
      _4648: x0 => x0.port,
      _4650: (x0,x1) => x0.onerror = x1,
      _10814: x0 => x0.result,
      _10815: x0 => x0.error,
      _10826: (x0,x1) => x0.onupgradeneeded = x1,
      _10828: x0 => x0.oldVersion,
      _10919: x0 => x0.key,
      _10920: x0 => x0.primaryKey,
      _10922: x0 => x0.value,
      _13730: () => globalThis.console,

    };

    const baseImports = {
      dart2wasm: dart2wasm,


      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
    };

    const jsStringPolyfill = {
      "charCodeAt": (s, i) => s.charCodeAt(i),
      "compare": (s1, s2) => {
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
      },
      "concat": (s1, s2) => s1 + s2,
      "equals": (s1, s2) => s1 === s2,
      "fromCharCode": (i) => String.fromCharCode(i),
      "length": (s) => s.length,
      "substring": (s, a, b) => s.substring(a, b),
      "fromCharCodeArray": (a, start, end) => {
        if (end <= start) return '';

        const read = dartInstance.exports.$wasmI16ArrayGet;
        let result = '';
        let index = start;
        const chunkLength = Math.min(end - index, 500);
        let array = new Array(chunkLength);
        while (index < end) {
          const newChunkLength = Math.min(end - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(a, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
    };

    const deferredLibraryHelper = {
      "loadModule": async (moduleName) => {
        if (!loadDeferredWasm) {
          throw "No implementation of loadDeferredWasm provided.";
        }
        const source = await Promise.resolve(loadDeferredWasm(moduleName));
        const module = await ((source instanceof Response)
            ? WebAssembly.compileStreaming(source, this.builtins)
            : WebAssembly.compile(source, this.builtins));
        return await WebAssembly.instantiate(module, {
          ...baseImports,
          ...additionalImports,
          "wasm:js-string": jsStringPolyfill,
          "module0": dartInstance.exports,
        });
      },
    };

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      "deferredLibraryHelper": deferredLibraryHelper,
      "wasm:js-string": jsStringPolyfill,
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}

