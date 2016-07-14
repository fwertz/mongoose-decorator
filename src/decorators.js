import mongoose from 'mongoose';

export const HOOKS = ['init','validate','save','remove','find','update'];

export function model ( modelName ) {
    if ( modelName instanceof Function ) {
        let name = modelName.name;
        let schema = _schema( modelName );

        return mongoose.model( name , schema );
    } else if ( 'string' !== typeof modelName ) {
        throw Error( 'Model must specify a name' );
    } else {
        return Clazz => {
            let schema = _schema( Clazz );
            return mongoose.model( modelName , schema );
        }
    }
}

export function schema ( clazz, method, descriptor ) {
    clazz['$$schema'] = clazz[method]();
};

export function method ( clazz, method, descriptor ) {
    (clazz['$$methods'] = clazz['$$methods'] || []).push( clazz[method] );
    clazz[`$$method_${method}`] = method;
}

export function pre( ...args ) {
    return _hook( args, 'pre' );
}

export function post ( ...args  ) {
    return _hook( args );
}

export function statics ( clazz, method, descriptor ) {
    (clazz['$$statics'] = clazz['$$statics'] || []).push( clazz[method] );
}

export function virtual ( path, action = 'get' ) {
    if ( 'string' !== typeof path  ) {
        throw new Error( 'A virtual must have a path' );
    }

    return ( clazz, method, descriptor ) => {
        if ( !clazz['$$virtuals'] ) {
            clazz['$$virtuals'] = {
                get: [],
                set: []
            }
        }

        clazz['$$virtuals'][action].push( {path: path, method: clazz[method]} );
    }
}

export function plugin ( fn, opts ) {
    if ( !fn instanceof Function ) {
        throw new Error( 'Plugin must be a function' );
    }
    return ( clazz  ) => {
        (clazz.prototype['$$plugins'] = clazz.prototype['$$plugins'] || []).push( {fn: fn, options: opts } )
    }
}

function _hook ( args, action = 'post' ) {
    let hook = args.length === 3 ? args[1] : args[0];

    if ( !HOOKS.find( h => hook === h ) ) {
        throw new Error( `${hook} is not a supported hook. Supported hooks are ${HOOKS}` );
    }

    if ( args.length === 3 ) {
        if ( !args[0]['$$hooks'] ) {
            args[0]['$$hooks'] = {
                pre: [],
                post: []
            }
        }

        args[0]['$$hooks'][action].push( {hook: hook, method: args[0][args[1]]} );
    } else {
        return( clazz, method ) => {
            if ( !clazz['$$hooks'] ) {
                clazz['$$hooks'] = {
                    pre: [],
                    post: []
                }
            }
            clazz['$$hooks'][action].push( {hook: hook, method: clazz[method]} );
        };
    }
}

function _schema( Clazz ) {
    const schema    = Clazz.prototype['$$schema'] || {};
    const methods   = Clazz.prototype['$$methods'] || [];
    const hooks     = Clazz.prototype['$$hooks'] || [];
    const statics   = Clazz.prototype['$$statics'] || [];
    const virtuals  = Clazz.prototype['$$virtuals'] || [];
    const plugins   = Clazz.prototype['$$plugins'] || [];

    let clazz  = new Clazz;

    clazz.add( schema );

    // Methods
    methods.forEach( fn => {
        clazz.method( fn.name, fn );
    });

    // Hooks - pre/post
    (hooks['pre'] || []).forEach( hook => {
        clazz.pre( hook.hook, hook.method );
    });
    (hooks['post'] || []).forEach( hook => {
        clazz.pre( hook.hook, hook.method );
    });

    // Statics
    statics.forEach( fn => {
        clazz.statics[fn.name] = fn;
    });

    // Virtuals - get/set
    (virtuals['get'] || []).forEach( virtual => {
        clazz.virtual( virtual.path )['get']( virtual.method );
    });

    (virtuals['set'] || []).forEach( virtual => {
        clazz.virtual( virtual.path )['set']( virtual.method );
    });

    // Plugins
    plugins.forEach( plugin => {
        clazz.plugin( plugin.fn, plugin.options );
    });

    return clazz;
}
