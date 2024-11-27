var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { WalletReadyState, WalletNotReadyError, BaseWalletAdapter, WalletDisconnectedError, WalletDisconnectionError, WalletNotConnectedError, WalletAccountError, WalletConfigError, WalletSendTransactionError, isVersionedTransaction, WalletError, WalletConnectionError, WalletPublicKeyError, WalletSignTransactionError, WalletSignMessageError, WalletSignInError, isWalletAdapterCompatibleStandardWallet } from "@solana/wallet-adapter-base";
import { watch, watchEffect, ref, computed, getCurrentScope, onScopeDispose, unref, toRef as toRef$1, readonly, customRef, onMounted, nextTick, getCurrentInstance, shallowRef, toRaw, defineComponent, openBlock, createElementBlock, createCommentVNode, renderSlot, normalizeProps, guardReactiveProps, createElementVNode, createBlock, toDisplayString, toRefs, useTemplateRef, resolveComponent, Fragment, normalizeClass, Teleport, withModifiers, renderList, createVNode, createTextVNode, withCtx, normalizeStyle } from "vue";
import { PublicKey, VersionedTransaction, Transaction } from "@solana/web3.js";
import { SolanaMobileWalletAdapterWalletName, SolanaMobileWalletAdapter, createDefaultAddressSelector, createDefaultAuthorizationResultCache, createDefaultWalletNotFoundHandler } from "@solana-mobile/wallet-adapter-mobile";
function useAdapterListeners(wallet, unloadingWindow, isUsingMwaOnMobile, deselect, refreshWalletState, handleError) {
  watch(wallet, (newWallet, oldWallet) => {
    const newAdapter = newWallet == null ? void 0 : newWallet.adapter;
    const oldAdapter = oldWallet == null ? void 0 : oldWallet.adapter;
    if (!newAdapter || !oldAdapter) {
      return;
    }
    if (newAdapter.name === oldAdapter.name) {
      return;
    }
    if (oldAdapter.name === SolanaMobileWalletAdapterWalletName) {
      return;
    }
    oldAdapter.disconnect().then();
  });
  const handleAdapterConnect = () => {
    refreshWalletState();
  };
  const handleAdapterDisconnect = () => {
    if (unloadingWindow.value || isUsingMwaOnMobile.value) {
      return;
    }
    deselect(true);
  };
  watchEffect((onInvalidate) => {
    var _a;
    const adapter = (_a = wallet.value) == null ? void 0 : _a.adapter;
    if (!adapter) {
      return;
    }
    const handleAdapterError = (error) => {
      return handleError(error, adapter);
    };
    adapter.on("connect", handleAdapterConnect);
    adapter.on("disconnect", handleAdapterDisconnect);
    adapter.on("error", handleAdapterError);
    onInvalidate(() => {
      adapter.off("connect", handleAdapterConnect);
      adapter.off("disconnect", handleAdapterDisconnect);
      adapter.off("error", handleAdapterError);
    });
  });
}
function useAutoConnect(initialAutoConnect, wallet, isUsingMwaOnMobile, connecting, connected, ready, deselect) {
  const autoConnect = ref(initialAutoConnect);
  const hasAttemptedToAutoConnect = ref(false);
  watch(wallet, () => {
    hasAttemptedToAutoConnect.value = false;
  });
  watchEffect(() => {
    if (hasAttemptedToAutoConnect.value || !autoConnect.value || !wallet.value || !ready.value || connected.value || connecting.value) {
      return;
    }
    (async () => {
      if (!wallet.value) {
        return;
      }
      connecting.value = true;
      hasAttemptedToAutoConnect.value = true;
      try {
        await (isUsingMwaOnMobile.value ? wallet.value.adapter.autoConnect() : wallet.value.adapter.connect());
      } catch {
        deselect();
      } finally {
        connecting.value = false;
      }
    })();
  });
  return autoConnect;
}
function useEnvironment(adapters) {
  const userAgent = getUserAgent();
  const uriForAppIdentity = getUriForAppIdentity();
  const environment = computed(() => getEnvironment(adapters.value, userAgent));
  const isMobile = computed(
    () => environment.value === 1
    /* MOBILE_WEB */
  );
  return {
    userAgent,
    uriForAppIdentity,
    environment,
    isMobile
  };
}
let _userAgent;
function getUserAgent() {
  var _a;
  if (_userAgent === void 0) {
    _userAgent = (_a = globalThis.navigator) == null ? void 0 : _a.userAgent;
  }
  return _userAgent;
}
function getUriForAppIdentity() {
  const location = globalThis.location;
  if (location === void 0) {
    return;
  }
  return `${location.protocol}//${location.host}`;
}
function getEnvironment(adapters, userAgent) {
  const hasInstalledAdapters = adapters.some(
    (adapter) => adapter.name !== SolanaMobileWalletAdapterWalletName && adapter.readyState === WalletReadyState.Installed
  );
  if (hasInstalledAdapters) {
    return 0;
  }
  const isMobile = !!userAgent && isOsThatSupportsMwa(userAgent) && !isWebView(userAgent);
  if (isMobile) {
    return 1;
  }
  return 0;
}
function isOsThatSupportsMwa(userAgent) {
  return /android/i.test(userAgent);
}
function isWebView(userAgent) {
  return /(WebView|Version\/.+(Chrome)\/(\d+)\.(\d+)\.(\d+)\.(\d+)|; wv\).+(Chrome)\/(\d+)\.(\d+)\.(\d+)\.(\d+))/i.test(
    userAgent
  );
}
function useErrorHandler(unloadingWindow, onError) {
  return (error, adapter) => {
    if (unloadingWindow.value) {
      return error;
    }
    if (onError) {
      onError(error, adapter);
      return error;
    }
    if (error instanceof WalletNotReadyError && typeof globalThis !== "undefined" && adapter) {
      window.open(adapter.url, "_blank");
    }
    return error;
  };
}
function useMobileWalletAdapters(adapters, isMobile, uriForAppIdentity, cluster) {
  const mobileWalletAdapter = computed(() => {
    if (!isMobile.value) {
      return;
    }
    const existingMobileWalletAdapter = adapters.value.find(
      (adapter) => adapter.name === SolanaMobileWalletAdapterWalletName
    );
    if (existingMobileWalletAdapter) {
      return existingMobileWalletAdapter;
    }
    return new SolanaMobileWalletAdapter({
      addressSelector: createDefaultAddressSelector(),
      appIdentity: { uri: uriForAppIdentity || void 0 },
      authorizationResultCache: createDefaultAuthorizationResultCache(),
      chain: cluster.value,
      onWalletNotFound: createDefaultWalletNotFoundHandler()
    });
  });
  return computed(() => {
    if (!mobileWalletAdapter.value || adapters.value.includes(mobileWalletAdapter.value)) {
      return adapters.value;
    }
    return [mobileWalletAdapter.value, ...adapters.value];
  });
}
function useReadyStateListeners(wallets2) {
  function handleReadyStateChange(readyState) {
    const previousWallets = wallets2.value;
    const index2 = previousWallets.findIndex(({ adapter }) => adapter === this);
    if (index2 === -1) {
      return;
    }
    wallets2.value = [
      ...previousWallets.slice(0, index2),
      { adapter: this, readyState },
      ...previousWallets.slice(index2 + 1)
    ];
  }
  watchEffect((onInvalidate) => {
    for (const { adapter } of wallets2.value) {
      adapter.on("readyStateChange", handleReadyStateChange, adapter);
    }
    onInvalidate(
      () => {
        for (const { adapter } of wallets2.value) {
          adapter.off("readyStateChange", handleReadyStateChange, adapter);
        }
      }
    );
  });
}
function tryOnScopeDispose(fn) {
  if (getCurrentScope()) {
    onScopeDispose(fn);
    return true;
  }
  return false;
}
function toValue(r) {
  return typeof r === "function" ? r() : unref(r);
}
const isClient = typeof window !== "undefined" && typeof document !== "undefined";
typeof WorkerGlobalScope !== "undefined" && globalThis instanceof WorkerGlobalScope;
const toString = Object.prototype.toString;
const isObject = (val) => toString.call(val) === "[object Object]";
const noop = () => {
};
const isIOS = /* @__PURE__ */ getIsIOS();
function getIsIOS() {
  var _a, _b;
  return isClient && ((_a = window == null ? void 0 : window.navigator) == null ? void 0 : _a.userAgent) && (/iP(?:ad|hone|od)/.test(window.navigator.userAgent) || ((_b = window == null ? void 0 : window.navigator) == null ? void 0 : _b.maxTouchPoints) > 2 && /iPad|Macintosh/.test(window == null ? void 0 : window.navigator.userAgent));
}
function createFilterWrapper(filter, fn) {
  function wrapper(...args) {
    return new Promise((resolve, reject) => {
      Promise.resolve(filter(() => fn.apply(this, args), { fn, thisArg: this, args })).then(resolve).catch(reject);
    });
  }
  return wrapper;
}
const bypassFilter = (invoke) => {
  return invoke();
};
function pausableFilter(extendFilter = bypassFilter) {
  const isActive = ref(true);
  function pause() {
    isActive.value = false;
  }
  function resume() {
    isActive.value = true;
  }
  const eventFilter = (...args) => {
    if (isActive.value)
      extendFilter(...args);
  };
  return { isActive: readonly(isActive), pause, resume, eventFilter };
}
function createSingletonPromise(fn) {
  let _promise;
  function wrapper() {
    if (!_promise)
      _promise = fn();
    return _promise;
  }
  wrapper.reset = async () => {
    const _prev = _promise;
    _promise = void 0;
    if (_prev)
      await _prev;
  };
  return wrapper;
}
function getLifeCycleTarget(target) {
  return getCurrentInstance();
}
function toRef(...args) {
  if (args.length !== 1)
    return toRef$1(...args);
  const r = args[0];
  return typeof r === "function" ? readonly(customRef(() => ({ get: r, set: noop }))) : ref(r);
}
function watchWithFilter(source, cb, options = {}) {
  const {
    eventFilter = bypassFilter,
    ...watchOptions
  } = options;
  return watch(
    source,
    createFilterWrapper(
      eventFilter,
      cb
    ),
    watchOptions
  );
}
function watchPausable(source, cb, options = {}) {
  const {
    eventFilter: filter,
    ...watchOptions
  } = options;
  const { eventFilter, pause, resume, isActive } = pausableFilter(filter);
  const stop = watchWithFilter(
    source,
    cb,
    {
      ...watchOptions,
      eventFilter
    }
  );
  return { stop, pause, resume, isActive };
}
function tryOnMounted(fn, sync = true, target) {
  const instance = getLifeCycleTarget();
  if (instance)
    onMounted(fn, target);
  else if (sync)
    fn();
  else
    nextTick(fn);
}
function useTimeoutFn(cb, interval, options = {}) {
  const {
    immediate = true
  } = options;
  const isPending = ref(false);
  let timer = null;
  function clear() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }
  function stop() {
    isPending.value = false;
    clear();
  }
  function start(...args) {
    clear();
    isPending.value = true;
    timer = setTimeout(() => {
      isPending.value = false;
      timer = null;
      cb(...args);
    }, toValue(interval));
  }
  if (immediate) {
    isPending.value = true;
    if (isClient)
      start();
  }
  tryOnScopeDispose(stop);
  return {
    isPending: readonly(isPending),
    start,
    stop
  };
}
const defaultWindow = isClient ? window : void 0;
const defaultNavigator = isClient ? window.navigator : void 0;
function unrefElement(elRef) {
  var _a;
  const plain = toValue(elRef);
  return (_a = plain == null ? void 0 : plain.$el) != null ? _a : plain;
}
function useEventListener(...args) {
  let target;
  let events;
  let listeners2;
  let options;
  if (typeof args[0] === "string" || Array.isArray(args[0])) {
    [events, listeners2, options] = args;
    target = defaultWindow;
  } else {
    [target, events, listeners2, options] = args;
  }
  if (!target)
    return noop;
  if (!Array.isArray(events))
    events = [events];
  if (!Array.isArray(listeners2))
    listeners2 = [listeners2];
  const cleanups = [];
  const cleanup = () => {
    cleanups.forEach((fn) => fn());
    cleanups.length = 0;
  };
  const register2 = (el, event, listener, options2) => {
    el.addEventListener(event, listener, options2);
    return () => el.removeEventListener(event, listener, options2);
  };
  const stopWatch = watch(
    () => [unrefElement(target), toValue(options)],
    ([el, options2]) => {
      cleanup();
      if (!el)
        return;
      const optionsClone = isObject(options2) ? { ...options2 } : options2;
      cleanups.push(
        ...events.flatMap((event) => {
          return listeners2.map((listener) => register2(el, event, listener, optionsClone));
        })
      );
    },
    { immediate: true, flush: "post" }
  );
  const stop = () => {
    stopWatch();
    cleanup();
  };
  tryOnScopeDispose(stop);
  return stop;
}
let _iOSWorkaround = false;
function onClickOutside(target, handler, options = {}) {
  const { window: window2 = defaultWindow, ignore = [], capture = true, detectIframe = false } = options;
  if (!window2)
    return noop;
  if (isIOS && !_iOSWorkaround) {
    _iOSWorkaround = true;
    Array.from(window2.document.body.children).forEach((el) => el.addEventListener("click", noop));
    window2.document.documentElement.addEventListener("click", noop);
  }
  let shouldListen = true;
  const shouldIgnore = (event) => {
    return toValue(ignore).some((target2) => {
      if (typeof target2 === "string") {
        return Array.from(window2.document.querySelectorAll(target2)).some((el) => el === event.target || event.composedPath().includes(el));
      } else {
        const el = unrefElement(target2);
        return el && (event.target === el || event.composedPath().includes(el));
      }
    });
  };
  function hasMultipleRoots(target2) {
    const vm = toValue(target2);
    return vm && vm.$.subTree.shapeFlag === 16;
  }
  function checkMultipleRoots(target2, event) {
    const vm = toValue(target2);
    const children = vm.$.subTree && vm.$.subTree.children;
    if (children == null || !Array.isArray(children))
      return false;
    return children.some((child) => child.el === event.target || event.composedPath().includes(child.el));
  }
  const listener = (event) => {
    const el = unrefElement(target);
    if (event.target == null)
      return;
    if (!(el instanceof Element) && hasMultipleRoots(target) && checkMultipleRoots(target, event))
      return;
    if (!el || el === event.target || event.composedPath().includes(el))
      return;
    if (event.detail === 0)
      shouldListen = !shouldIgnore(event);
    if (!shouldListen) {
      shouldListen = true;
      return;
    }
    handler(event);
  };
  let isProcessingClick = false;
  const cleanup = [
    useEventListener(window2, "click", (event) => {
      if (!isProcessingClick) {
        isProcessingClick = true;
        setTimeout(() => {
          isProcessingClick = false;
        }, 0);
        listener(event);
      }
    }, { passive: true, capture }),
    useEventListener(window2, "pointerdown", (e) => {
      const el = unrefElement(target);
      shouldListen = !shouldIgnore(e) && !!(el && !e.composedPath().includes(el));
    }, { passive: true }),
    detectIframe && useEventListener(window2, "blur", (event) => {
      setTimeout(() => {
        var _a;
        const el = unrefElement(target);
        if (((_a = window2.document.activeElement) == null ? void 0 : _a.tagName) === "IFRAME" && !(el == null ? void 0 : el.contains(window2.document.activeElement))) {
          handler(event);
        }
      }, 0);
    })
  ].filter(Boolean);
  const stop = () => cleanup.forEach((fn) => fn());
  return stop;
}
function createKeyPredicate(keyFilter) {
  if (typeof keyFilter === "function")
    return keyFilter;
  else if (typeof keyFilter === "string")
    return (event) => event.key === keyFilter;
  else if (Array.isArray(keyFilter))
    return (event) => keyFilter.includes(event.key);
  return () => true;
}
function onKeyStroke(...args) {
  let key;
  let handler;
  let options = {};
  if (args.length === 3) {
    key = args[0];
    handler = args[1];
    options = args[2];
  } else if (args.length === 2) {
    if (typeof args[1] === "object") {
      key = true;
      handler = args[0];
      options = args[1];
    } else {
      key = args[0];
      handler = args[1];
    }
  } else {
    key = true;
    handler = args[0];
  }
  const {
    target = defaultWindow,
    eventName = "keydown",
    passive = false,
    dedupe = false
  } = options;
  const predicate = createKeyPredicate(key);
  const listener = (e) => {
    if (e.repeat && toValue(dedupe))
      return;
    if (predicate(e))
      handler(e);
  };
  return useEventListener(target, eventName, listener, passive);
}
function useMounted() {
  const isMounted = ref(false);
  const instance = getCurrentInstance();
  if (instance) {
    onMounted(() => {
      isMounted.value = true;
    }, instance);
  }
  return isMounted;
}
function useSupported(callback) {
  const isMounted = useMounted();
  return computed(() => {
    isMounted.value;
    return Boolean(callback());
  });
}
function usePermission(permissionDesc, options = {}) {
  const {
    controls = false,
    navigator = defaultNavigator
  } = options;
  const isSupported = useSupported(() => navigator && "permissions" in navigator);
  const permissionStatus = shallowRef();
  const desc = typeof permissionDesc === "string" ? { name: permissionDesc } : permissionDesc;
  const state = shallowRef();
  const update = () => {
    var _a, _b;
    state.value = (_b = (_a = permissionStatus.value) == null ? void 0 : _a.state) != null ? _b : "prompt";
  };
  useEventListener(permissionStatus, "change", update);
  const query = createSingletonPromise(async () => {
    if (!isSupported.value)
      return;
    if (!permissionStatus.value) {
      try {
        permissionStatus.value = await navigator.permissions.query(desc);
      } catch (e) {
        permissionStatus.value = void 0;
      } finally {
        update();
      }
    }
    if (controls)
      return toRaw(permissionStatus.value);
  });
  query();
  if (controls) {
    return {
      state,
      isSupported,
      query
    };
  } else {
    return state;
  }
}
function useClipboard(options = {}) {
  const {
    navigator = defaultNavigator,
    read = false,
    source,
    copiedDuring = 1500,
    legacy = false
  } = options;
  const isClipboardApiSupported = useSupported(() => navigator && "clipboard" in navigator);
  const permissionRead = usePermission("clipboard-read");
  const permissionWrite = usePermission("clipboard-write");
  const isSupported = computed(() => isClipboardApiSupported.value || legacy);
  const text = ref("");
  const copied = ref(false);
  const timeout = useTimeoutFn(() => copied.value = false, copiedDuring);
  function updateText() {
    if (isClipboardApiSupported.value && isAllowed(permissionRead.value)) {
      navigator.clipboard.readText().then((value) => {
        text.value = value;
      });
    } else {
      text.value = legacyRead();
    }
  }
  if (isSupported.value && read)
    useEventListener(["copy", "cut"], updateText);
  async function copy(value = toValue(source)) {
    if (isSupported.value && value != null) {
      if (isClipboardApiSupported.value && isAllowed(permissionWrite.value))
        await navigator.clipboard.writeText(value);
      else
        legacyCopy(value);
      text.value = value;
      copied.value = true;
      timeout.start();
    }
  }
  function legacyCopy(value) {
    const ta = document.createElement("textarea");
    ta.value = value != null ? value : "";
    ta.style.position = "absolute";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  function legacyRead() {
    var _a, _b, _c;
    return (_c = (_b = (_a = document == null ? void 0 : document.getSelection) == null ? void 0 : _a.call(document)) == null ? void 0 : _b.toString()) != null ? _c : "";
  }
  function isAllowed(status) {
    return status === "granted" || status === "prompt";
  }
  return {
    isSupported,
    text,
    copied,
    copy
  };
}
const _global = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
const globalKey = "__vueuse_ssr_handlers__";
const handlers = /* @__PURE__ */ getHandlers();
function getHandlers() {
  if (!(globalKey in _global))
    _global[globalKey] = _global[globalKey] || {};
  return _global[globalKey];
}
function getSSRHandler(key, fallback) {
  return handlers[key] || fallback;
}
function guessSerializerType(rawInit) {
  return rawInit == null ? "any" : rawInit instanceof Set ? "set" : rawInit instanceof Map ? "map" : rawInit instanceof Date ? "date" : typeof rawInit === "boolean" ? "boolean" : typeof rawInit === "string" ? "string" : typeof rawInit === "object" ? "object" : !Number.isNaN(rawInit) ? "number" : "any";
}
const StorageSerializers = {
  boolean: {
    read: (v) => v === "true",
    write: (v) => String(v)
  },
  object: {
    read: (v) => JSON.parse(v),
    write: (v) => JSON.stringify(v)
  },
  number: {
    read: (v) => Number.parseFloat(v),
    write: (v) => String(v)
  },
  any: {
    read: (v) => v,
    write: (v) => String(v)
  },
  string: {
    read: (v) => v,
    write: (v) => String(v)
  },
  map: {
    read: (v) => new Map(JSON.parse(v)),
    write: (v) => JSON.stringify(Array.from(v.entries()))
  },
  set: {
    read: (v) => new Set(JSON.parse(v)),
    write: (v) => JSON.stringify(Array.from(v))
  },
  date: {
    read: (v) => new Date(v),
    write: (v) => v.toISOString()
  }
};
const customStorageEventName = "vueuse-storage";
function useStorage(key, defaults, storage, options = {}) {
  var _a;
  const {
    flush = "pre",
    deep = true,
    listenToStorageChanges = true,
    writeDefaults = true,
    mergeDefaults = false,
    shallow,
    window: window2 = defaultWindow,
    eventFilter,
    onError = (e) => {
      console.error(e);
    },
    initOnMounted
  } = options;
  const data = (shallow ? shallowRef : ref)(typeof defaults === "function" ? defaults() : defaults);
  if (!storage) {
    try {
      storage = getSSRHandler("getDefaultStorage", () => {
        var _a2;
        return (_a2 = defaultWindow) == null ? void 0 : _a2.localStorage;
      })();
    } catch (e) {
      onError(e);
    }
  }
  if (!storage)
    return data;
  const rawInit = toValue(defaults);
  const type = guessSerializerType(rawInit);
  const serializer = (_a = options.serializer) != null ? _a : StorageSerializers[type];
  const { pause: pauseWatch, resume: resumeWatch } = watchPausable(
    data,
    () => write(data.value),
    { flush, deep, eventFilter }
  );
  if (window2 && listenToStorageChanges) {
    tryOnMounted(() => {
      if (storage instanceof Storage)
        useEventListener(window2, "storage", update);
      else
        useEventListener(window2, customStorageEventName, updateFromCustomEvent);
      if (initOnMounted)
        update();
    });
  }
  if (!initOnMounted)
    update();
  function dispatchWriteEvent(oldValue, newValue) {
    if (window2) {
      const payload = {
        key,
        oldValue,
        newValue,
        storageArea: storage
      };
      window2.dispatchEvent(storage instanceof Storage ? new StorageEvent("storage", payload) : new CustomEvent(customStorageEventName, {
        detail: payload
      }));
    }
  }
  function write(v) {
    try {
      const oldValue = storage.getItem(key);
      if (v == null) {
        dispatchWriteEvent(oldValue, null);
        storage.removeItem(key);
      } else {
        const serialized = serializer.write(v);
        if (oldValue !== serialized) {
          storage.setItem(key, serialized);
          dispatchWriteEvent(oldValue, serialized);
        }
      }
    } catch (e) {
      onError(e);
    }
  }
  function read(event) {
    const rawValue = event ? event.newValue : storage.getItem(key);
    if (rawValue == null) {
      if (writeDefaults && rawInit != null)
        storage.setItem(key, serializer.write(rawInit));
      return rawInit;
    } else if (!event && mergeDefaults) {
      const value = serializer.read(rawValue);
      if (typeof mergeDefaults === "function")
        return mergeDefaults(value, rawInit);
      else if (type === "object" && !Array.isArray(value))
        return { ...rawInit, ...value };
      return value;
    } else if (typeof rawValue !== "string") {
      return rawValue;
    } else {
      return serializer.read(rawValue);
    }
  }
  function update(event) {
    if (event && event.storageArea !== storage)
      return;
    if (event && event.key == null) {
      data.value = rawInit;
      return;
    }
    if (event && event.key !== key)
      return;
    pauseWatch();
    try {
      if ((event == null ? void 0 : event.newValue) !== serializer.write(data.value))
        data.value = read(event);
    } catch (e) {
      onError(e);
    } finally {
      if (event)
        nextTick(resumeWatch);
      else
        resumeWatch();
    }
  }
  function updateFromCustomEvent(event) {
    update(event.detail);
  }
  return data;
}
function resolveElement(el) {
  if (typeof Window !== "undefined" && el instanceof Window)
    return el.document.documentElement;
  if (typeof Document !== "undefined" && el instanceof Document)
    return el.documentElement;
  return el;
}
function useLocalStorage(key, initialValue, options = {}) {
  const { window: window2 = defaultWindow } = options;
  return useStorage(key, initialValue, window2 == null ? void 0 : window2.localStorage, options);
}
function checkOverflowScroll(ele) {
  const style = window.getComputedStyle(ele);
  if (style.overflowX === "scroll" || style.overflowY === "scroll" || style.overflowX === "auto" && ele.clientWidth < ele.scrollWidth || style.overflowY === "auto" && ele.clientHeight < ele.scrollHeight) {
    return true;
  } else {
    const parent = ele.parentNode;
    if (!parent || parent.tagName === "BODY")
      return false;
    return checkOverflowScroll(parent);
  }
}
function preventDefault(rawEvent) {
  const e = rawEvent || window.event;
  const _target = e.target;
  if (checkOverflowScroll(_target))
    return false;
  if (e.touches.length > 1)
    return true;
  if (e.preventDefault)
    e.preventDefault();
  return false;
}
const elInitialOverflow = /* @__PURE__ */ new WeakMap();
function useScrollLock(element, initialState = false) {
  const isLocked = ref(initialState);
  let stopTouchMoveListener = null;
  let initialOverflow = "";
  watch(toRef(element), (el) => {
    const target = resolveElement(toValue(el));
    if (target) {
      const ele = target;
      if (!elInitialOverflow.get(ele))
        elInitialOverflow.set(ele, ele.style.overflow);
      if (ele.style.overflow !== "hidden")
        initialOverflow = ele.style.overflow;
      if (ele.style.overflow === "hidden")
        return isLocked.value = true;
      if (isLocked.value)
        return ele.style.overflow = "hidden";
    }
  }, {
    immediate: true
  });
  const lock = () => {
    const el = resolveElement(toValue(element));
    if (!el || isLocked.value)
      return;
    if (isIOS) {
      stopTouchMoveListener = useEventListener(
        el,
        "touchmove",
        (e) => {
          preventDefault(e);
        },
        { passive: false }
      );
    }
    el.style.overflow = "hidden";
    isLocked.value = true;
  };
  const unlock = () => {
    const el = resolveElement(toValue(element));
    if (!el || !isLocked.value)
      return;
    if (isIOS)
      stopTouchMoveListener == null ? void 0 : stopTouchMoveListener();
    el.style.overflow = initialOverflow;
    elInitialOverflow.delete(el);
    isLocked.value = false;
  };
  tryOnScopeDispose(unlock);
  return computed({
    get() {
      return isLocked.value;
    },
    set(v) {
      if (v)
        lock();
      else unlock();
    }
  });
}
function useSelectWalletName(localStorageKey, isMobile) {
  const name = useLocalStorage(
    localStorageKey,
    isMobile.value ? SolanaMobileWalletAdapterWalletName : void 0
  );
  const isUsingMwa = computed(() => name.value === SolanaMobileWalletAdapterWalletName);
  const isUsingMwaOnMobile = computed(() => isUsingMwa.value && isMobile.value);
  const select = (walletName) => {
    if (name.value !== walletName) {
      name.value = walletName;
    }
  };
  const deselect = (force = true) => {
    if (force || isUsingMwa.value) {
      name.value = void 0;
    }
  };
  return {
    name,
    isUsingMwa,
    isUsingMwaOnMobile,
    select,
    deselect
  };
}
const SolanaSignAndSendTransaction = "solana:signAndSendTransaction";
const SolanaSignIn = "solana:signIn";
const SolanaSignMessage = "solana:signMessage";
const SolanaSignTransaction = "solana:signTransaction";
function getCommitment(commitment) {
  switch (commitment) {
    case "processed":
    case "confirmed":
    case "finalized":
    case void 0:
      return commitment;
    case "recent":
      return "processed";
    case "single":
    case "singleGossip":
      return "confirmed";
    case "max":
    case "root":
      return "finalized";
    default:
      return void 0;
  }
}
const SOLANA_MAINNET_CHAIN = "solana:mainnet";
const SOLANA_DEVNET_CHAIN = "solana:devnet";
const SOLANA_TESTNET_CHAIN = "solana:testnet";
const SOLANA_LOCALNET_CHAIN = "solana:localnet";
const MAINNET_ENDPOINT = "https://api.mainnet-beta.solana.com";
function getChainForEndpoint(endpoint) {
  if (endpoint.includes(MAINNET_ENDPOINT))
    return SOLANA_MAINNET_CHAIN;
  if (/\bdevnet\b/i.test(endpoint))
    return SOLANA_DEVNET_CHAIN;
  if (/\btestnet\b/i.test(endpoint))
    return SOLANA_TESTNET_CHAIN;
  if (/\blocalhost\b/i.test(endpoint) || /\b127\.0\.0\.1\b/.test(endpoint))
    return SOLANA_LOCALNET_CHAIN;
  return SOLANA_MAINNET_CHAIN;
}
const StandardConnect = "standard:connect";
const StandardDisconnect = "standard:disconnect";
const StandardEvents = "standard:events";
(function(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
});
(function(receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
});
function arraysEqual(a, b) {
  if (a === b)
    return true;
  const length = a.length;
  if (length !== b.length)
    return false;
  for (let i = 0; i < length; i++) {
    if (a[i] !== b[i])
      return false;
  }
  return true;
}
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var src;
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  function base(ALPHABET) {
    if (ALPHABET.length >= 255) {
      throw new TypeError("Alphabet too long");
    }
    var BASE_MAP = new Uint8Array(256);
    for (var j = 0; j < BASE_MAP.length; j++) {
      BASE_MAP[j] = 255;
    }
    for (var i = 0; i < ALPHABET.length; i++) {
      var x = ALPHABET.charAt(i);
      var xc = x.charCodeAt(0);
      if (BASE_MAP[xc] !== 255) {
        throw new TypeError(x + " is ambiguous");
      }
      BASE_MAP[xc] = i;
    }
    var BASE = ALPHABET.length;
    var LEADER = ALPHABET.charAt(0);
    var FACTOR = Math.log(BASE) / Math.log(256);
    var iFACTOR = Math.log(256) / Math.log(BASE);
    function encode(source) {
      if (source instanceof Uint8Array) ;
      else if (ArrayBuffer.isView(source)) {
        source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
      } else if (Array.isArray(source)) {
        source = Uint8Array.from(source);
      }
      if (!(source instanceof Uint8Array)) {
        throw new TypeError("Expected Uint8Array");
      }
      if (source.length === 0) {
        return "";
      }
      var zeroes = 0;
      var length = 0;
      var pbegin = 0;
      var pend = source.length;
      while (pbegin !== pend && source[pbegin] === 0) {
        pbegin++;
        zeroes++;
      }
      var size = (pend - pbegin) * iFACTOR + 1 >>> 0;
      var b58 = new Uint8Array(size);
      while (pbegin !== pend) {
        var carry = source[pbegin];
        var i2 = 0;
        for (var it1 = size - 1; (carry !== 0 || i2 < length) && it1 !== -1; it1--, i2++) {
          carry += 256 * b58[it1] >>> 0;
          b58[it1] = carry % BASE >>> 0;
          carry = carry / BASE >>> 0;
        }
        if (carry !== 0) {
          throw new Error("Non-zero carry");
        }
        length = i2;
        pbegin++;
      }
      var it2 = size - length;
      while (it2 !== size && b58[it2] === 0) {
        it2++;
      }
      var str = LEADER.repeat(zeroes);
      for (; it2 < size; ++it2) {
        str += ALPHABET.charAt(b58[it2]);
      }
      return str;
    }
    function decodeUnsafe(source) {
      if (typeof source !== "string") {
        throw new TypeError("Expected String");
      }
      if (source.length === 0) {
        return new Uint8Array();
      }
      var psz = 0;
      var zeroes = 0;
      var length = 0;
      while (source[psz] === LEADER) {
        zeroes++;
        psz++;
      }
      var size = (source.length - psz) * FACTOR + 1 >>> 0;
      var b256 = new Uint8Array(size);
      while (source[psz]) {
        var carry = BASE_MAP[source.charCodeAt(psz)];
        if (carry === 255) {
          return;
        }
        var i2 = 0;
        for (var it3 = size - 1; (carry !== 0 || i2 < length) && it3 !== -1; it3--, i2++) {
          carry += BASE * b256[it3] >>> 0;
          b256[it3] = carry % 256 >>> 0;
          carry = carry / 256 >>> 0;
        }
        if (carry !== 0) {
          throw new Error("Non-zero carry");
        }
        length = i2;
        psz++;
      }
      var it4 = size - length;
      while (it4 !== size && b256[it4] === 0) {
        it4++;
      }
      var vch = new Uint8Array(zeroes + (size - it4));
      var j2 = zeroes;
      while (it4 !== size) {
        vch[j2++] = b256[it4++];
      }
      return vch;
    }
    function decode(string) {
      var buffer = decodeUnsafe(string);
      if (buffer) {
        return buffer;
      }
      throw new Error("Non-base" + BASE + " character");
    }
    return {
      encode,
      decodeUnsafe,
      decode
    };
  }
  src = base;
  return src;
}
var bs58$1;
var hasRequiredBs58;
function requireBs58() {
  if (hasRequiredBs58) return bs58$1;
  hasRequiredBs58 = 1;
  const basex = requireSrc();
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  bs58$1 = basex(ALPHABET);
  return bs58$1;
}
var bs58Exports = requireBs58();
const bs58 = /* @__PURE__ */ getDefaultExportFromCjs(bs58Exports);
var __classPrivateFieldSet$1 = function(receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
};
var __classPrivateFieldGet$1 = function(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _StandardWalletAdapter_instances, _StandardWalletAdapter_account, _StandardWalletAdapter_publicKey, _StandardWalletAdapter_connecting, _StandardWalletAdapter_disconnecting, _StandardWalletAdapter_off, _StandardWalletAdapter_supportedTransactionVersions, _StandardWalletAdapter_wallet, _StandardWalletAdapter_readyState, _StandardWalletAdapter_connect, _StandardWalletAdapter_connected, _StandardWalletAdapter_disconnected, _StandardWalletAdapter_reset, _StandardWalletAdapter_changed, _StandardWalletAdapter_signTransaction, _StandardWalletAdapter_signAllTransactions, _StandardWalletAdapter_signMessage, _StandardWalletAdapter_signIn;
class StandardWalletAdapter extends BaseWalletAdapter {
  constructor({ wallet }) {
    super();
    _StandardWalletAdapter_instances.add(this);
    _StandardWalletAdapter_account.set(this, void 0);
    _StandardWalletAdapter_publicKey.set(this, void 0);
    _StandardWalletAdapter_connecting.set(this, void 0);
    _StandardWalletAdapter_disconnecting.set(this, void 0);
    _StandardWalletAdapter_off.set(this, void 0);
    _StandardWalletAdapter_supportedTransactionVersions.set(this, void 0);
    _StandardWalletAdapter_wallet.set(this, void 0);
    _StandardWalletAdapter_readyState.set(this, typeof window === "undefined" || typeof document === "undefined" ? WalletReadyState.Unsupported : WalletReadyState.Installed);
    _StandardWalletAdapter_changed.set(this, (properties) => {
      if ("accounts" in properties) {
        const account = __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").accounts[0];
        if (__classPrivateFieldGet$1(this, _StandardWalletAdapter_account, "f") && !__classPrivateFieldGet$1(this, _StandardWalletAdapter_disconnecting, "f") && account !== __classPrivateFieldGet$1(this, _StandardWalletAdapter_account, "f")) {
          if (account) {
            __classPrivateFieldGet$1(this, _StandardWalletAdapter_instances, "m", _StandardWalletAdapter_connected).call(this, account);
          } else {
            this.emit("error", new WalletDisconnectedError());
            __classPrivateFieldGet$1(this, _StandardWalletAdapter_instances, "m", _StandardWalletAdapter_disconnected).call(this);
          }
        }
      }
      if ("features" in properties) {
        __classPrivateFieldGet$1(this, _StandardWalletAdapter_instances, "m", _StandardWalletAdapter_reset).call(this);
      }
    });
    __classPrivateFieldSet$1(this, _StandardWalletAdapter_wallet, wallet, "f");
    __classPrivateFieldSet$1(this, _StandardWalletAdapter_account, null, "f");
    __classPrivateFieldSet$1(this, _StandardWalletAdapter_publicKey, null, "f");
    __classPrivateFieldSet$1(this, _StandardWalletAdapter_connecting, false, "f");
    __classPrivateFieldSet$1(this, _StandardWalletAdapter_disconnecting, false, "f");
    __classPrivateFieldSet$1(this, _StandardWalletAdapter_off, __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").features[StandardEvents].on("change", __classPrivateFieldGet$1(this, _StandardWalletAdapter_changed, "f")), "f");
    __classPrivateFieldGet$1(this, _StandardWalletAdapter_instances, "m", _StandardWalletAdapter_reset).call(this);
  }
  get name() {
    return __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").name;
  }
  get url() {
    return "https://github.com/solana-labs/wallet-standard";
  }
  get icon() {
    return __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").icon;
  }
  get readyState() {
    return __classPrivateFieldGet$1(this, _StandardWalletAdapter_readyState, "f");
  }
  get publicKey() {
    return __classPrivateFieldGet$1(this, _StandardWalletAdapter_publicKey, "f");
  }
  get connecting() {
    return __classPrivateFieldGet$1(this, _StandardWalletAdapter_connecting, "f");
  }
  get supportedTransactionVersions() {
    return __classPrivateFieldGet$1(this, _StandardWalletAdapter_supportedTransactionVersions, "f");
  }
  get wallet() {
    return __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f");
  }
  get standard() {
    return true;
  }
  destroy() {
    __classPrivateFieldSet$1(this, _StandardWalletAdapter_account, null, "f");
    __classPrivateFieldSet$1(this, _StandardWalletAdapter_publicKey, null, "f");
    __classPrivateFieldSet$1(this, _StandardWalletAdapter_connecting, false, "f");
    __classPrivateFieldSet$1(this, _StandardWalletAdapter_disconnecting, false, "f");
    const off = __classPrivateFieldGet$1(this, _StandardWalletAdapter_off, "f");
    if (off) {
      __classPrivateFieldSet$1(this, _StandardWalletAdapter_off, null, "f");
      off();
    }
  }
  async autoConnect() {
    return __classPrivateFieldGet$1(this, _StandardWalletAdapter_instances, "m", _StandardWalletAdapter_connect).call(this, { silent: true });
  }
  async connect() {
    return __classPrivateFieldGet$1(this, _StandardWalletAdapter_instances, "m", _StandardWalletAdapter_connect).call(this);
  }
  async disconnect() {
    if (StandardDisconnect in __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").features) {
      try {
        __classPrivateFieldSet$1(this, _StandardWalletAdapter_disconnecting, true, "f");
        await __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").features[StandardDisconnect].disconnect();
      } catch (error) {
        this.emit("error", new WalletDisconnectionError(error == null ? void 0 : error.message, error));
      } finally {
        __classPrivateFieldSet$1(this, _StandardWalletAdapter_disconnecting, false, "f");
      }
    }
    __classPrivateFieldGet$1(this, _StandardWalletAdapter_instances, "m", _StandardWalletAdapter_disconnected).call(this);
  }
  async sendTransaction(transaction, connection, options = {}) {
    try {
      const account = __classPrivateFieldGet$1(this, _StandardWalletAdapter_account, "f");
      if (!account)
        throw new WalletNotConnectedError();
      let feature;
      if (SolanaSignAndSendTransaction in __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").features) {
        if (account.features.includes(SolanaSignAndSendTransaction)) {
          feature = SolanaSignAndSendTransaction;
        } else if (SolanaSignTransaction in __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").features && account.features.includes(SolanaSignTransaction)) {
          feature = SolanaSignTransaction;
        } else {
          throw new WalletAccountError();
        }
      } else if (SolanaSignTransaction in __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").features) {
        if (!account.features.includes(SolanaSignTransaction))
          throw new WalletAccountError();
        feature = SolanaSignTransaction;
      } else {
        throw new WalletConfigError();
      }
      const chain = getChainForEndpoint(connection.rpcEndpoint);
      if (!account.chains.includes(chain))
        throw new WalletSendTransactionError();
      try {
        const { signers, ...sendOptions } = options;
        let serializedTransaction;
        if (isVersionedTransaction(transaction)) {
          (signers == null ? void 0 : signers.length) && transaction.sign(signers);
          serializedTransaction = transaction.serialize();
        } else {
          transaction = await this.prepareTransaction(transaction, connection, sendOptions);
          (signers == null ? void 0 : signers.length) && transaction.partialSign(...signers);
          serializedTransaction = new Uint8Array(transaction.serialize({
            requireAllSignatures: false,
            verifySignatures: false
          }));
        }
        if (feature === SolanaSignAndSendTransaction) {
          const [output] = await __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").features[SolanaSignAndSendTransaction].signAndSendTransaction({
            account,
            chain,
            transaction: serializedTransaction,
            options: {
              preflightCommitment: getCommitment(sendOptions.preflightCommitment || connection.commitment),
              skipPreflight: sendOptions.skipPreflight,
              maxRetries: sendOptions.maxRetries,
              minContextSlot: sendOptions.minContextSlot
            }
          });
          return bs58.encode(output.signature);
        } else {
          const [output] = await __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").features[SolanaSignTransaction].signTransaction({
            account,
            chain,
            transaction: serializedTransaction,
            options: {
              preflightCommitment: getCommitment(sendOptions.preflightCommitment || connection.commitment),
              minContextSlot: sendOptions.minContextSlot
            }
          });
          return await connection.sendRawTransaction(output.signedTransaction, {
            ...sendOptions,
            preflightCommitment: getCommitment(sendOptions.preflightCommitment || connection.commitment)
          });
        }
      } catch (error) {
        if (error instanceof WalletError)
          throw error;
        throw new WalletSendTransactionError(error == null ? void 0 : error.message, error);
      }
    } catch (error) {
      this.emit("error", error);
      throw error;
    }
  }
}
_StandardWalletAdapter_account = /* @__PURE__ */ new WeakMap(), _StandardWalletAdapter_publicKey = /* @__PURE__ */ new WeakMap(), _StandardWalletAdapter_connecting = /* @__PURE__ */ new WeakMap(), _StandardWalletAdapter_disconnecting = /* @__PURE__ */ new WeakMap(), _StandardWalletAdapter_off = /* @__PURE__ */ new WeakMap(), _StandardWalletAdapter_supportedTransactionVersions = /* @__PURE__ */ new WeakMap(), _StandardWalletAdapter_wallet = /* @__PURE__ */ new WeakMap(), _StandardWalletAdapter_readyState = /* @__PURE__ */ new WeakMap(), _StandardWalletAdapter_changed = /* @__PURE__ */ new WeakMap(), _StandardWalletAdapter_instances = /* @__PURE__ */ new WeakSet(), _StandardWalletAdapter_connect = async function _StandardWalletAdapter_connect2(input) {
  try {
    if (this.connected || this.connecting)
      return;
    if (__classPrivateFieldGet$1(this, _StandardWalletAdapter_readyState, "f") !== WalletReadyState.Installed)
      throw new WalletNotReadyError();
    __classPrivateFieldSet$1(this, _StandardWalletAdapter_connecting, true, "f");
    if (!__classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").accounts.length) {
      try {
        await __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").features[StandardConnect].connect(input);
      } catch (error) {
        throw new WalletConnectionError(error == null ? void 0 : error.message, error);
      }
    }
    const account = __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").accounts[0];
    if (!account)
      throw new WalletAccountError();
    __classPrivateFieldGet$1(this, _StandardWalletAdapter_instances, "m", _StandardWalletAdapter_connected).call(this, account);
  } catch (error) {
    this.emit("error", error);
    throw error;
  } finally {
    __classPrivateFieldSet$1(this, _StandardWalletAdapter_connecting, false, "f");
  }
}, _StandardWalletAdapter_connected = function _StandardWalletAdapter_connected2(account) {
  let publicKey;
  try {
    publicKey = new PublicKey(account.address);
  } catch (error) {
    throw new WalletPublicKeyError(error == null ? void 0 : error.message, error);
  }
  __classPrivateFieldSet$1(this, _StandardWalletAdapter_account, account, "f");
  __classPrivateFieldSet$1(this, _StandardWalletAdapter_publicKey, publicKey, "f");
  __classPrivateFieldGet$1(this, _StandardWalletAdapter_instances, "m", _StandardWalletAdapter_reset).call(this);
  this.emit("connect", publicKey);
}, _StandardWalletAdapter_disconnected = function _StandardWalletAdapter_disconnected2() {
  __classPrivateFieldSet$1(this, _StandardWalletAdapter_account, null, "f");
  __classPrivateFieldSet$1(this, _StandardWalletAdapter_publicKey, null, "f");
  __classPrivateFieldGet$1(this, _StandardWalletAdapter_instances, "m", _StandardWalletAdapter_reset).call(this);
  this.emit("disconnect");
}, _StandardWalletAdapter_reset = function _StandardWalletAdapter_reset2() {
  var _a, _b;
  const supportedTransactionVersions = SolanaSignAndSendTransaction in __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").features ? __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").features[SolanaSignAndSendTransaction].supportedTransactionVersions : __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").features[SolanaSignTransaction].supportedTransactionVersions;
  __classPrivateFieldSet$1(this, _StandardWalletAdapter_supportedTransactionVersions, arraysEqual(supportedTransactionVersions, ["legacy"]) ? null : new Set(supportedTransactionVersions), "f");
  if (SolanaSignTransaction in __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").features && ((_a = __classPrivateFieldGet$1(this, _StandardWalletAdapter_account, "f")) == null ? void 0 : _a.features.includes(SolanaSignTransaction))) {
    this.signTransaction = __classPrivateFieldGet$1(this, _StandardWalletAdapter_instances, "m", _StandardWalletAdapter_signTransaction);
    this.signAllTransactions = __classPrivateFieldGet$1(this, _StandardWalletAdapter_instances, "m", _StandardWalletAdapter_signAllTransactions);
  } else {
    delete this.signTransaction;
    delete this.signAllTransactions;
  }
  if (SolanaSignMessage in __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").features && ((_b = __classPrivateFieldGet$1(this, _StandardWalletAdapter_account, "f")) == null ? void 0 : _b.features.includes(SolanaSignMessage))) {
    this.signMessage = __classPrivateFieldGet$1(this, _StandardWalletAdapter_instances, "m", _StandardWalletAdapter_signMessage);
  } else {
    delete this.signMessage;
  }
  if (SolanaSignIn in __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").features) {
    this.signIn = __classPrivateFieldGet$1(this, _StandardWalletAdapter_instances, "m", _StandardWalletAdapter_signIn);
  } else {
    delete this.signIn;
  }
}, _StandardWalletAdapter_signTransaction = async function _StandardWalletAdapter_signTransaction2(transaction) {
  try {
    const account = __classPrivateFieldGet$1(this, _StandardWalletAdapter_account, "f");
    if (!account)
      throw new WalletNotConnectedError();
    if (!(SolanaSignTransaction in __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").features))
      throw new WalletConfigError();
    if (!account.features.includes(SolanaSignTransaction))
      throw new WalletAccountError();
    try {
      const signedTransactions = await __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").features[SolanaSignTransaction].signTransaction({
        account,
        transaction: isVersionedTransaction(transaction) ? transaction.serialize() : new Uint8Array(transaction.serialize({
          requireAllSignatures: false,
          verifySignatures: false
        }))
      });
      const serializedTransaction = signedTransactions[0].signedTransaction;
      return isVersionedTransaction(transaction) ? VersionedTransaction.deserialize(serializedTransaction) : Transaction.from(serializedTransaction);
    } catch (error) {
      if (error instanceof WalletError)
        throw error;
      throw new WalletSignTransactionError(error == null ? void 0 : error.message, error);
    }
  } catch (error) {
    this.emit("error", error);
    throw error;
  }
}, _StandardWalletAdapter_signAllTransactions = async function _StandardWalletAdapter_signAllTransactions2(transactions) {
  try {
    const account = __classPrivateFieldGet$1(this, _StandardWalletAdapter_account, "f");
    if (!account)
      throw new WalletNotConnectedError();
    if (!(SolanaSignTransaction in __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").features))
      throw new WalletConfigError();
    if (!account.features.includes(SolanaSignTransaction))
      throw new WalletAccountError();
    try {
      const signedTransactions = await __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").features[SolanaSignTransaction].signTransaction(...transactions.map((transaction) => ({
        account,
        transaction: isVersionedTransaction(transaction) ? transaction.serialize() : new Uint8Array(transaction.serialize({
          requireAllSignatures: false,
          verifySignatures: false
        }))
      })));
      return transactions.map((transaction, index2) => {
        const signedTransaction = signedTransactions[index2].signedTransaction;
        return isVersionedTransaction(transaction) ? VersionedTransaction.deserialize(signedTransaction) : Transaction.from(signedTransaction);
      });
    } catch (error) {
      throw new WalletSignTransactionError(error == null ? void 0 : error.message, error);
    }
  } catch (error) {
    this.emit("error", error);
    throw error;
  }
}, _StandardWalletAdapter_signMessage = async function _StandardWalletAdapter_signMessage2(message) {
  try {
    const account = __classPrivateFieldGet$1(this, _StandardWalletAdapter_account, "f");
    if (!account)
      throw new WalletNotConnectedError();
    if (!(SolanaSignMessage in __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").features))
      throw new WalletConfigError();
    if (!account.features.includes(SolanaSignMessage))
      throw new WalletAccountError();
    try {
      const signedMessages = await __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").features[SolanaSignMessage].signMessage({
        account,
        message
      });
      return signedMessages[0].signature;
    } catch (error) {
      throw new WalletSignMessageError(error == null ? void 0 : error.message, error);
    }
  } catch (error) {
    this.emit("error", error);
    throw error;
  }
}, _StandardWalletAdapter_signIn = async function _StandardWalletAdapter_signIn2(input = {}) {
  try {
    if (!(SolanaSignIn in __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").features))
      throw new WalletConfigError();
    let output;
    try {
      [output] = await __classPrivateFieldGet$1(this, _StandardWalletAdapter_wallet, "f").features[SolanaSignIn].signIn(input);
    } catch (error) {
      throw new WalletSignInError(error == null ? void 0 : error.message, error);
    }
    if (!output)
      throw new WalletSignInError();
    __classPrivateFieldGet$1(this, _StandardWalletAdapter_instances, "m", _StandardWalletAdapter_connected).call(this, output.account);
    return output;
  } catch (error) {
    this.emit("error", error);
    throw error;
  }
};
var __classPrivateFieldGet = function(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = function(receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
};
var _AppReadyEvent_detail;
let wallets = void 0;
const registeredWalletsSet = /* @__PURE__ */ new Set();
function addRegisteredWallet(wallet) {
  cachedWalletsArray = void 0;
  registeredWalletsSet.add(wallet);
}
function removeRegisteredWallet(wallet) {
  cachedWalletsArray = void 0;
  registeredWalletsSet.delete(wallet);
}
const listeners = {};
function getWallets() {
  if (wallets)
    return wallets;
  wallets = Object.freeze({ register, get, on });
  if (typeof window === "undefined")
    return wallets;
  const api = Object.freeze({ register });
  try {
    window.addEventListener("wallet-standard:register-wallet", ({ detail: callback }) => callback(api));
  } catch (error) {
    console.error("wallet-standard:register-wallet event listener could not be added\n", error);
  }
  try {
    window.dispatchEvent(new AppReadyEvent(api));
  } catch (error) {
    console.error("wallet-standard:app-ready event could not be dispatched\n", error);
  }
  return wallets;
}
function register(...wallets2) {
  var _a;
  wallets2 = wallets2.filter((wallet) => !registeredWalletsSet.has(wallet));
  if (!wallets2.length)
    return () => {
    };
  wallets2.forEach((wallet) => addRegisteredWallet(wallet));
  (_a = listeners["register"]) == null ? void 0 : _a.forEach((listener) => guard(() => listener(...wallets2)));
  return function unregister() {
    var _a2;
    wallets2.forEach((wallet) => removeRegisteredWallet(wallet));
    (_a2 = listeners["unregister"]) == null ? void 0 : _a2.forEach((listener) => guard(() => listener(...wallets2)));
  };
}
let cachedWalletsArray;
function get() {
  if (!cachedWalletsArray) {
    cachedWalletsArray = [...registeredWalletsSet];
  }
  return cachedWalletsArray;
}
function on(event, listener) {
  var _a;
  ((_a = listeners[event]) == null ? void 0 : _a.push(listener)) || (listeners[event] = [listener]);
  return function off() {
    var _a2;
    listeners[event] = (_a2 = listeners[event]) == null ? void 0 : _a2.filter((existingListener) => listener !== existingListener);
  };
}
function guard(callback) {
  try {
    callback();
  } catch (error) {
    console.error(error);
  }
}
class AppReadyEvent extends Event {
  get detail() {
    return __classPrivateFieldGet(this, _AppReadyEvent_detail, "f");
  }
  get type() {
    return "wallet-standard:app-ready";
  }
  constructor(api) {
    super("wallet-standard:app-ready", {
      bubbles: false,
      cancelable: false,
      composed: false
    });
    _AppReadyEvent_detail.set(this, void 0);
    __classPrivateFieldSet(this, _AppReadyEvent_detail, api, "f");
  }
  /** @deprecated */
  preventDefault() {
    throw new Error("preventDefault cannot be called");
  }
  /** @deprecated */
  stopImmediatePropagation() {
    throw new Error("stopImmediatePropagation cannot be called");
  }
  /** @deprecated */
  stopPropagation() {
    throw new Error("stopPropagation cannot be called");
  }
}
_AppReadyEvent_detail = /* @__PURE__ */ new WeakMap();
function useStandardWalletAdapters(adapters) {
  const warnings = /* @__PURE__ */ new Set();
  const { get: get2, on: on2 } = getWallets();
  const standardAdapters = shallowRef(
    wrapWalletsWithAdapters(get2())
  );
  watchEffect((onInvalidate) => {
    const listeners2 = [
      on2("register", (...wallets2) => {
        return standardAdapters.value = [
          ...standardAdapters.value,
          ...wrapWalletsWithAdapters(wallets2)
        ];
      }),
      on2("unregister", (...wallets2) => {
        return standardAdapters.value = standardAdapters.value.filter((a) => wallets2.includes(a.wallet));
      })
    ];
    onInvalidate(() => {
      for (const off of listeners2) off();
    });
  });
  return computed(() => [
    ...standardAdapters.value,
    ...adapters.value.filter(({ name }) => {
      if (standardAdapters.value.some((adapter) => adapter.name === name)) {
        if (!warnings.has(name)) {
          warnings.add(name);
          console.warn(
            `${name} was registered as a Standard Wallet. The Wallet Adapter for ${name} can be removed from your app.`
          );
        }
        return false;
      }
      return true;
    })
  ]);
}
function wrapWalletsWithAdapters(wallets2) {
  return wallets2.filter((w) => isWalletAdapterCompatibleStandardWallet(w)).map((wallet) => new StandardWalletAdapter({ wallet }));
}
class WalletNotSelectedError extends WalletError {
  constructor() {
    super(...arguments);
    __publicField(this, "name", "WalletNotSelectedError");
  }
}
class WalletNotInitializedError extends WalletError {
  constructor() {
    super(...arguments);
    __publicField(this, "name", "WalletNotSelectedError");
  }
}
function useTransactionMethods(wallet, handleError) {
  const sendTransaction = async (transaction, connection, options) => {
    var _a;
    const adapter = (_a = wallet.value) == null ? void 0 : _a.adapter;
    if (!adapter) {
      throw handleError(new WalletNotSelectedError());
    }
    if (!adapter.connected) {
      throw handleError(new WalletNotConnectedError(), adapter);
    }
    return await adapter.sendTransaction(transaction, connection, options);
  };
  const signTransaction = computed(() => {
    var _a;
    const adapter = (_a = wallet.value) == null ? void 0 : _a.adapter;
    if (!(adapter && "signTransaction" in adapter)) {
      return;
    }
    return async (transaction) => {
      if (!adapter.connected) {
        throw handleError(new WalletNotConnectedError());
      }
      return await adapter.signTransaction(transaction);
    };
  });
  const signAllTransactions = computed(() => {
    var _a;
    const adapter = (_a = wallet.value) == null ? void 0 : _a.adapter;
    if (!(adapter && "signAllTransactions" in adapter)) {
      return;
    }
    return async (transactions) => {
      if (!adapter.connected) {
        throw handleError(new WalletNotConnectedError());
      }
      return await adapter.signAllTransactions(transactions);
    };
  });
  const signMessage = computed(() => {
    var _a;
    const adapter = (_a = wallet.value) == null ? void 0 : _a.adapter;
    if (!(adapter && "signMessage" in adapter)) {
      return;
    }
    return async (message) => {
      if (!adapter.connected) {
        throw handleError(new WalletNotConnectedError());
      }
      return await adapter.signMessage(message);
    };
  });
  return {
    sendTransaction,
    signTransaction,
    signAllTransactions,
    signMessage
  };
}
function useUnloadingWindow(isUsingMwaOnMobile) {
  const unloadingWindow = ref(false);
  if (typeof globalThis === "undefined") {
    return unloadingWindow;
  }
  const handleBeforeUnload = () => unloadingWindow.value = true;
  watchEffect((onInvalidate) => {
    if (isUsingMwaOnMobile.value) {
      return;
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    onInvalidate(() => window.removeEventListener("beforeunload", handleBeforeUnload));
  });
  return unloadingWindow;
}
function useWalletState(wallets2, name) {
  const wallet = shallowRef();
  const publicKey = ref();
  const connected = ref(false);
  const readyState = ref(WalletReadyState.Unsupported);
  const ready = computed(
    () => readyState.value === WalletReadyState.Installed || readyState.value === WalletReadyState.Loadable
  );
  const refreshWalletState = () => {
    var _a, _b, _c;
    publicKey.value = ((_a = wallet.value) == null ? void 0 : _a.adapter.publicKey) ?? void 0;
    connected.value = ((_b = wallet.value) == null ? void 0 : _b.adapter.connected) ?? false;
    readyState.value = ((_c = wallet.value) == null ? void 0 : _c.readyState) ?? WalletReadyState.Unsupported;
  };
  watchEffect(() => {
    wallet.value = name.value ? wallets2.value.find(({ adapter }) => adapter.name === name.value) ?? void 0 : void 0;
    refreshWalletState();
  });
  return {
    wallet,
    publicKey,
    connected,
    readyState,
    ready,
    refreshWalletState
  };
}
function useWrapAdaptersInWallets(adapters) {
  const wallets2 = shallowRef([]);
  watchEffect(() => {
    wallets2.value = adapters.value.map((newAdapter) => ({
      adapter: newAdapter,
      readyState: newAdapter.readyState
    }));
  });
  return wallets2;
}
function createWalletStore({
  wallets: initialAdapters = [],
  autoConnect: initialAutoConnect = false,
  cluster: initialCluster = "mainnet-beta",
  onError,
  localStorageKey = "walletName"
}) {
  const cluster = ref(initialCluster);
  const connecting = ref(false);
  const disconnecting = ref(false);
  const rawAdapters = shallowRef(initialAdapters);
  const adaptersWithStandardAdapters = useStandardWalletAdapters(rawAdapters);
  const { isMobile, uriForAppIdentity } = useEnvironment(adaptersWithStandardAdapters);
  const adapters = useMobileWalletAdapters(
    adaptersWithStandardAdapters,
    isMobile,
    uriForAppIdentity,
    cluster
  );
  const wallets2 = useWrapAdaptersInWallets(adapters);
  const { name, isUsingMwaOnMobile, select, deselect } = useSelectWalletName(localStorageKey, isMobile);
  const {
    wallet,
    publicKey,
    connected,
    readyState,
    ready,
    refreshWalletState
  } = useWalletState(wallets2, name);
  const unloadingWindow = useUnloadingWindow(isUsingMwaOnMobile);
  const handleError = useErrorHandler(unloadingWindow, onError);
  useReadyStateListeners(wallets2);
  useAdapterListeners(
    wallet,
    unloadingWindow,
    isUsingMwaOnMobile,
    deselect,
    refreshWalletState,
    handleError
  );
  const autoConnect = useAutoConnect(
    initialAutoConnect,
    wallet,
    isUsingMwaOnMobile,
    connecting,
    connected,
    ready,
    deselect
  );
  const { sendTransaction, signTransaction, signAllTransactions, signMessage } = useTransactionMethods(wallet, handleError);
  const connect = async () => {
    if (connected.value || connecting.value || disconnecting.value) {
      return;
    }
    if (!wallet.value) {
      throw handleError(new WalletNotSelectedError());
    }
    const adapter = wallet.value.adapter;
    if (!ready.value) {
      throw handleError(new WalletNotReadyError(), adapter);
    }
    try {
      connecting.value = true;
      await adapter.connect();
    } catch (error) {
      deselect();
      throw error;
    } finally {
      connecting.value = false;
    }
  };
  const disconnect = async () => {
    if (disconnecting.value || !wallet.value) {
      return;
    }
    try {
      disconnecting.value = true;
      await wallet.value.adapter.disconnect();
    } finally {
      disconnecting.value = false;
    }
  };
  return {
    // Props.
    wallets: wallets2,
    autoConnect,
    cluster,
    // Data.
    wallet,
    publicKey,
    readyState,
    ready,
    connected,
    connecting,
    disconnecting,
    // Methods.
    select,
    connect,
    disconnect,
    sendTransaction,
    signTransaction,
    signAllTransactions,
    signMessage
  };
}
let walletStore;
function useWallet() {
  if (walletStore) {
    return walletStore;
  }
  throw new WalletNotInitializedError(
    "Wallet not initialized. Please use the `initWallet` method to initialize the wallet."
  );
}
function initWallet(walletStoreProperties) {
  walletStore = createWalletStore(walletStoreProperties);
}
const _hoisted_1$4 = { class: "swv-button-icon" };
const _hoisted_2$2 = ["src", "alt"];
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "WalletIcon",
  props: {
    wallet: {}
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("i", _hoisted_1$4, [
        _ctx.wallet ? (openBlock(), createElementBlock("img", {
          key: 0,
          src: _ctx.wallet.adapter.icon,
          alt: `${_ctx.wallet.adapter.name} icon`
        }, null, 8, _hoisted_2$2)) : createCommentVNode("", true)
      ]);
    };
  }
});
const _hoisted_1$3 = ["disabled"];
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "WalletConnectButton",
  props: {
    disabled: { type: Boolean, default: false }
  },
  emits: ["click"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const { wallet, connect, connecting, connected } = useWallet();
    const content = computed(() => {
      if (connecting.value)
        return "Connecting ...";
      if (connected.value)
        return "Connected";
      if (wallet.value)
        return "Connect";
      return "Connect Wallet";
    });
    function onClick(event) {
      emit("click", event);
      if (event.defaultPrevented)
        return;
      connect().catch(() => {
      });
    }
    const scope = {
      wallet,
      disabled: __props.disabled,
      connecting,
      connected,
      content,
      onClick
    };
    return (_ctx, _cache) => {
      return renderSlot(_ctx.$slots, "default", normalizeProps(guardReactiveProps(scope)), () => [
        createElementVNode("button", {
          class: "swv-button swv-button-trigger",
          disabled: _ctx.disabled || !unref(wallet) || unref(connecting) || unref(connected),
          onClick
        }, [
          unref(wallet) ? (openBlock(), createBlock(_sfc_main$4, {
            key: 0,
            wallet: unref(wallet)
          }, null, 8, ["wallet"])) : createCommentVNode("", true),
          createElementVNode("span", null, toDisplayString(content.value), 1)
        ], 8, _hoisted_1$3)
      ]);
    };
  }
});
const _hoisted_1$2 = ["disabled"];
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "WalletDisconnectButton",
  props: {
    disabled: { type: Boolean, default: false }
  },
  emits: ["click"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const { wallet, disconnect, disconnecting } = useWallet();
    const content = computed(() => {
      if (disconnecting.value)
        return "Disconnecting ...";
      if (wallet.value)
        return "Disconnect";
      return "Disconnect Wallet";
    });
    function handleClick(event) {
      emit("click", event);
      if (event.defaultPrevented)
        return;
      disconnect().catch(() => {
      });
    }
    const scope = {
      wallet,
      disconnecting,
      disabled: __props.disabled,
      content,
      handleClick
    };
    return (_ctx, _cache) => {
      return renderSlot(_ctx.$slots, "default", normalizeProps(guardReactiveProps(scope)), () => [
        createElementVNode("button", {
          class: "swv-button swv-button-trigger",
          disabled: _ctx.disabled || unref(disconnecting) || !unref(wallet),
          onClick: handleClick
        }, [
          unref(wallet) ? (openBlock(), createBlock(_sfc_main$4, {
            key: 0,
            wallet: unref(wallet)
          }, null, 8, ["wallet"])) : createCommentVNode("", true),
          createElementVNode("span", null, toDisplayString(content.value), 1)
        ], 8, _hoisted_1$2)
      ]);
    };
  }
});
const _sfc_main$1 = defineComponent({
  components: {
    WalletIcon: _sfc_main$4
  },
  props: {
    featured: { type: Number, default: 3 },
    container: { type: String, default: "body" },
    logo: String,
    dark: Boolean
  },
  setup(properties, { slots }) {
    const { featured, container, logo, dark } = toRefs(properties);
    const modalOpened = ref(false);
    const openModal = () => modalOpened.value = true;
    const closeModal = () => modalOpened.value = false;
    const hasLogo = computed(() => !!slots.logo || !!logo.value);
    const modalPanel = useTemplateRef("modalPanel");
    const { wallets: wallets2, select: selectWallet } = useWallet();
    const orderedWallets = computed(() => {
      const installed = [];
      const notDetected = [];
      const loadable = [];
      for (const wallet of wallets2.value) {
        switch (wallet.readyState) {
          case WalletReadyState.NotDetected: {
            notDetected.push(wallet);
            break;
          }
          case WalletReadyState.Loadable: {
            loadable.push(wallet);
            break;
          }
          case WalletReadyState.Installed: {
            installed.push(wallet);
            break;
          }
        }
      }
      return [...installed, ...loadable, ...notDetected];
    });
    const expandedWallets = ref(false);
    const featuredWallets = computed(
      () => orderedWallets.value.slice(0, featured.value)
    );
    const hiddenWallets = computed(
      () => orderedWallets.value.slice(featured.value)
    );
    const walletsToDisplay = computed(
      () => expandedWallets.value ? wallets2.value : featuredWallets.value
    );
    onClickOutside(modalPanel, closeModal);
    onKeyStroke("Escape", closeModal);
    onKeyStroke("Tab", (event) => {
      var _a;
      const focusableElements = ((_a = modalPanel.value) == null ? void 0 : _a.querySelectorAll("button")) ?? [];
      const firstElement = focusableElements == null ? void 0 : focusableElements[0];
      const lastElement = focusableElements == null ? void 0 : focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement && lastElement) {
        lastElement.focus();
        event.preventDefault();
      } else if (!event.shiftKey && document.activeElement === lastElement && firstElement) {
        firstElement.focus();
        event.preventDefault();
      }
    });
    watch(modalOpened, (isOpened) => {
      if (!isOpened) {
        return;
      }
      nextTick(
        () => {
          var _a, _b, _c;
          return (_c = (_b = (_a = modalPanel.value) == null ? void 0 : _a.querySelectorAll("button")) == null ? void 0 : _b[0]) == null ? void 0 : _c.focus();
        }
      );
    });
    const scrollLock = useScrollLock(document.body);
    watch(modalOpened, (isOpened) => scrollLock.value = isOpened);
    const scope = {
      dark,
      logo,
      hasLogo,
      featured,
      container,
      modalPanel,
      modalOpened,
      openModal,
      closeModal,
      expandedWallets,
      walletsToDisplay,
      featuredWallets,
      hiddenWallets,
      selectWallet
    };
    return {
      scope,
      ...scope
    };
  }
});
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _hoisted_1$1 = {
  ref: "modalPanel",
  class: "swv-modal-container"
};
const _hoisted_2$1 = {
  key: 0,
  class: "swv-modal-logo-wrapper"
};
const _hoisted_3$1 = ["src"];
const _hoisted_4$1 = { class: "swv-modal-list" };
const _hoisted_5 = ["onClick"];
const _hoisted_6 = { class: "swv-button" };
const _hoisted_7 = {
  key: 0,
  class: "swv-wallet-status"
};
const _hoisted_8 = ["aria-expanded"];
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_wallet_icon = resolveComponent("wallet-icon");
  return openBlock(), createElementBlock(Fragment, null, [
    createElementVNode("div", {
      class: normalizeClass(_ctx.dark ? "swv-dark" : "")
    }, [
      renderSlot(_ctx.$slots, "default", normalizeProps(guardReactiveProps(_ctx.scope)))
    ], 2),
    _ctx.modalOpened ? (openBlock(), createBlock(Teleport, {
      key: 0,
      to: _ctx.container
    }, [
      createElementVNode("div", {
        "aria-labelledby": "swv-modal-title",
        "aria-modal": "true",
        class: normalizeClass(["swv-modal", _ctx.dark ? "swv-dark" : ""]),
        role: "dialog"
      }, [
        renderSlot(_ctx.$slots, "overlay", normalizeProps(guardReactiveProps(_ctx.scope)), () => [
          _cache[2] || (_cache[2] = createElementVNode("div", { class: "swv-modal-overlay" }, null, -1))
        ]),
        createElementVNode("div", _hoisted_1$1, [
          renderSlot(_ctx.$slots, "modal", normalizeProps(guardReactiveProps(_ctx.scope)), () => [
            createElementVNode("div", {
              class: normalizeClass(["swv-modal-wrapper", { "swv-modal-wrapper-no-logo": !_ctx.hasLogo }])
            }, [
              _ctx.hasLogo ? (openBlock(), createElementBlock("div", _hoisted_2$1, [
                renderSlot(_ctx.$slots, "logo", normalizeProps(guardReactiveProps(_ctx.scope)), () => [
                  createElementVNode("img", {
                    alt: "logo",
                    class: "swv-modal-logo",
                    src: _ctx.logo
                  }, null, 8, _hoisted_3$1)
                ])
              ])) : createCommentVNode("", true),
              _cache[5] || (_cache[5] = createElementVNode("h1", {
                id: "swv-modal-title",
                class: "swv-modal-title"
              }, " Connect Wallet ", -1)),
              createElementVNode("button", {
                class: "swv-modal-button-close",
                onClick: _cache[0] || (_cache[0] = withModifiers((...args) => _ctx.closeModal && _ctx.closeModal(...args), ["prevent"]))
              }, _cache[3] || (_cache[3] = [
                createElementVNode("svg", {
                  width: "14",
                  height: "14"
                }, [
                  createElementVNode("path", { d: "M14 12.461 8.3 6.772l5.234-5.233L12.006 0 6.772 5.234 1.54 0 0 1.539l5.234 5.233L0 12.006l1.539 1.528L6.772 8.3l5.69 5.7L14 12.461z" })
                ], -1)
              ])),
              createElementVNode("ul", _hoisted_4$1, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.walletsToDisplay, (wallet) => {
                  return openBlock(), createElementBlock("li", {
                    key: wallet.adapter.name,
                    onClick: ($event) => {
                      _ctx.selectWallet(wallet.adapter.name);
                      _ctx.closeModal();
                    }
                  }, [
                    createElementVNode("button", _hoisted_6, [
                      createVNode(_component_wallet_icon, { wallet }, null, 8, ["wallet"]),
                      createElementVNode("span", null, toDisplayString(wallet.adapter.name), 1),
                      wallet.readyState === "Installed" ? (openBlock(), createElementBlock("div", _hoisted_7, " Detected ")) : createCommentVNode("", true)
                    ])
                  ], 8, _hoisted_5);
                }), 128))
              ]),
              _ctx.hiddenWallets.length > 0 ? (openBlock(), createElementBlock("button", {
                key: 1,
                "aria-controls": "swv-modal-collapse",
                "aria-expanded": _ctx.expandedWallets,
                class: normalizeClass(["swv-button swv-modal-collapse-button", { "swv-modal-collapse-button-active": _ctx.expandedWallets }]),
                onClick: _cache[1] || (_cache[1] = ($event) => _ctx.expandedWallets = !_ctx.expandedWallets)
              }, [
                createTextVNode(toDisplayString(_ctx.expandedWallets ? "Less" : "More") + " options ", 1),
                _cache[4] || (_cache[4] = createElementVNode("i", { class: "swv-button-icon" }, [
                  createElementVNode("svg", {
                    width: "11",
                    height: "6",
                    xmlns: "http://www.w3.org/2000/svg"
                  }, [
                    createElementVNode("path", { d: "m5.938 5.73 4.28-4.126a.915.915 0 0 0 0-1.322 1 1 0 0 0-1.371 0L5.253 3.736 1.659.272a1 1 0 0 0-1.371 0A.93.93 0 0 0 0 .932c0 .246.1.48.288.662l4.28 4.125a.99.99 0 0 0 1.37.01z" })
                  ])
                ], -1))
              ], 10, _hoisted_8)) : createCommentVNode("", true)
            ], 2)
          ])
        ], 512)
      ], 2)
    ], 8, ["to"])) : createCommentVNode("", true)
  ], 64);
}
const WalletModalProvider = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render]]);
const _hoisted_1 = ["onClick"];
const _hoisted_2 = {
  key: 2,
  class: "swv-dropdown"
};
const _hoisted_3 = ["aria-expanded", "title"];
const _hoisted_4 = ["onClick"];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "WalletMultiButton",
  props: {
    featured: { default: 3 },
    container: { default: "body" },
    logo: {},
    dark: { type: Boolean, default: false }
  },
  setup(__props) {
    const { publicKey, wallet, disconnect } = useWallet();
    const dropdownPanel = useTemplateRef("dropdownPanel");
    const dropdownOpened = ref(false);
    function openDropdown() {
      dropdownOpened.value = true;
    }
    function closeDropdown() {
      dropdownOpened.value = false;
    }
    onClickOutside(dropdownPanel, closeDropdown);
    const publicKeyBase58 = computed(() => {
      var _a;
      return (_a = publicKey.value) == null ? void 0 : _a.toBase58();
    });
    const publicKeyTrimmed = computed(() => {
      if (!wallet.value || !publicKeyBase58.value) {
        return;
      }
      return `${publicKeyBase58.value.slice(0, 4)}..${publicKeyBase58.value.slice(-4)}`;
    });
    const { copy, copied: addressCopied, isSupported: canCopy } = useClipboard();
    const copyAddress = () => publicKeyBase58.value && copy(publicKeyBase58.value);
    const scope = {
      featured: __props.featured,
      container: __props.container,
      logo: __props.logo,
      dark: __props.dark,
      wallet,
      publicKey,
      publicKeyTrimmed,
      publicKeyBase58,
      canCopy,
      addressCopied,
      dropdownPanel,
      dropdownOpened,
      openDropdown,
      closeDropdown,
      copyAddress,
      disconnect
    };
    return (_ctx, _cache) => {
      return openBlock(), createBlock(WalletModalProvider, {
        featured: _ctx.featured,
        container: _ctx.container,
        logo: _ctx.logo,
        dark: _ctx.dark
      }, {
        default: withCtx((modalScope) => [
          renderSlot(_ctx.$slots, "default", normalizeProps(guardReactiveProps({ ...modalScope, ...scope })), () => [
            !unref(wallet) ? (openBlock(), createElementBlock("button", {
              key: 0,
              class: "swv-button swv-button-trigger",
              onClick: modalScope.openModal
            }, " Select Wallet ", 8, _hoisted_1)) : !publicKeyBase58.value ? (openBlock(), createBlock(_sfc_main$3, { key: 1 })) : (openBlock(), createElementBlock("div", _hoisted_2, [
              renderSlot(_ctx.$slots, "dropdown-button", normalizeProps(guardReactiveProps({ ...modalScope, ...scope })), () => [
                createElementVNode("button", {
                  class: "swv-button swv-button-trigger",
                  style: normalizeStyle({ pointerEvents: dropdownOpened.value ? "none" : "auto" }),
                  "aria-expanded": dropdownOpened.value,
                  title: publicKeyBase58.value,
                  onClick: openDropdown
                }, [
                  createVNode(_sfc_main$4, { wallet: unref(wallet) }, null, 8, ["wallet"]),
                  createElementVNode("span", null, toDisplayString(publicKeyTrimmed.value), 1)
                ], 12, _hoisted_3)
              ]),
              renderSlot(_ctx.$slots, "dropdown", normalizeProps(guardReactiveProps({ ...modalScope, ...scope })), () => [
                createElementVNode("ul", {
                  ref_key: "dropdownPanel",
                  ref: dropdownPanel,
                  "aria-label": "dropdown-list",
                  class: normalizeClass(["swv-dropdown-list", { "swv-dropdown-list-active": dropdownOpened.value }]),
                  role: "menu"
                }, [
                  renderSlot(_ctx.$slots, "dropdown-list", normalizeProps(guardReactiveProps({ ...modalScope, ...scope })), () => [
                    unref(canCopy) ? (openBlock(), createElementBlock("li", {
                      key: 0,
                      class: "swv-dropdown-list-item",
                      role: "menuitem",
                      onClick: copyAddress
                    }, toDisplayString(unref(addressCopied) ? "Copied" : "Copy address"), 1)) : createCommentVNode("", true),
                    createElementVNode("li", {
                      class: "swv-dropdown-list-item",
                      role: "menuitem",
                      onClick: ($event) => {
                        modalScope.openModal();
                        closeDropdown();
                      }
                    }, " Change wallet ", 8, _hoisted_4),
                    createElementVNode("li", {
                      class: "swv-dropdown-list-item",
                      role: "menuitem",
                      onClick: _cache[0] || (_cache[0] = ($event) => {
                        unref(disconnect)();
                        closeDropdown();
                      })
                    }, " Disconnect ")
                  ])
                ], 2)
              ])
            ]))
          ])
        ]),
        overlay: withCtx((modalScope) => [
          renderSlot(_ctx.$slots, "modal-overlay", normalizeProps(guardReactiveProps({ ...modalScope, ...scope })))
        ]),
        modal: withCtx((modalScope) => [
          renderSlot(_ctx.$slots, "modal", normalizeProps(guardReactiveProps({ ...modalScope, ...scope })))
        ]),
        _: 3
      }, 8, ["featured", "container", "logo", "dark"]);
    };
  }
});
function useAnchorWallet() {
  const walletStore2 = useWallet();
  return computed(() => {
    if (!walletStore2) {
      return;
    }
    const { signTransaction, signAllTransactions, publicKey } = walletStore2;
    if (!publicKey.value || !signTransaction.value || !signAllTransactions.value) {
      return;
    }
    return {
      publicKey: publicKey.value,
      signTransaction: signTransaction.value,
      signAllTransactions: signAllTransactions.value
    };
  });
}
const index = {
  install: (app, options = {}) => {
    initWallet(options);
    app.config.globalProperties.$wallet = useWallet();
  }
};
export {
  _sfc_main$3 as WalletConnectButton,
  _sfc_main$2 as WalletDisconnectButton,
  _sfc_main$4 as WalletIcon,
  WalletModalProvider,
  _sfc_main as WalletMultiButton,
  WalletNotInitializedError,
  WalletNotSelectedError,
  createWalletStore,
  index as default,
  initWallet,
  useAnchorWallet,
  useWallet
};
//# sourceMappingURL=wallet-adapter-vue.js.map
