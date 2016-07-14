'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.model = model;
exports.schema = schema;
exports.method = method;
exports.statics = statics;
exports.virtual = virtual;
exports.plugin = plugin;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function model(modelName) {
    if (modelName instanceof Function) {
        var name = modelName.name;
        var _schema2 = _schema(modelName);

        return _mongoose2.default.model(name, _schema2);
    } else if ('string' !== typeof modelName) {
        throw Error('Model must specify a name');
    } else {
        return function (Clazz) {
            var schema = _schema(Clazz);
            return _mongoose2.default.model(modelName, schema);
        };
    }
}

function schema(clazz, method, descriptor) {
    clazz['$$schema'] = clazz[method]();
};

function method(clazz, method, descriptor) {
    (clazz['$$methods'] = clazz['$$methods'] || []).push(clazz[method]);
    clazz['$$method_' + method] = method;
}

function statics(clazz, method, descriptor) {
    (clazz['$$statics'] = clazz['$$statics'] || []).push(clazz[method]);
}

function virtual(path) {
    var action = arguments.length <= 1 || arguments[1] === undefined ? 'get' : arguments[1];

    if ('string' !== typeof path) {
        throw new Error('A virtual must have a path');
    }

    return function (clazz, method, descriptor) {
        if (!clazz['$$virtuals']) {
            clazz['$$virtuals'] = {
                get: [],
                set: []
            };
        }

        clazz['$$virtuals'][action].push({ path: path, method: clazz[method] });
    };
}

function plugin(fn, opts) {
    if (!fn instanceof Function) {
        throw new Error('Plugin must be a function');
    }
    return function (clazz) {
        (clazz.prototype['$$plugins'] = clazz.prototype['$$plugins'] || []).push({ fn: fn, options: opts });
    };
}

function _schema(Clazz) {
    var schema = Clazz.prototype['$$schema'] || {};
    var methods = Clazz.prototype['$$methods'] || [];
    var statics = Clazz.prototype['$$statics'] || [];
    var virtuals = Clazz.prototype['$$virtuals'] || [];
    var plugins = Clazz.prototype['$$plugins'] || [];

    var clazz = new Clazz();

    clazz.add(schema);

    methods.forEach(function (fn) {
        clazz.method(fn.name, fn);
    });

    // Statics
    statics.forEach(function (fn) {
        clazz.statics[fn.name] = fn;
    });

    // Virtuals - get/set
    (virtuals['get'] || []).forEach(function (virtual) {
        clazz.virtual(virtual.path)['get'](virtual.method);
    });

    (virtuals['set'] || []).forEach(function (virtual) {
        clazz.virtual(virtual.path)['set'](virtual.method);
    });

    // Plugins
    plugins.forEach(function (plugin) {
        clazz.plugin(plugin.fn, plugin.options);
    });

    return clazz;
}