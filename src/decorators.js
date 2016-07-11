import mongoose from 'mongoose';


export function model ( modelName ) {
    return Clazz => {
        let schema = _schema( Clazz );
        return mongoose.model( modelName, schema );
    }
}

export function schema ( clazz, method, descriptor ) {
    clazz['$$schema'] = clazz[method]();
};

export function method ( clazz, method, descriptor ) {
    (clazz['$$methods'] = clazz['$$methods'] || []).push( clazz[method] );
    clazz[`$$method_${method}`] = method;
}

export function statics ( clazz, method, descriptor ) {
    (clazz['$$statics'] = clazz['$$statics'] || []).push( clazz[method] );
}

export function virtual ( path, action = 'get' ) {
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
    return ( clazz  ) => {
        (clazz['$$plugins'] = clazz['$$plugins'] || []).push( {fn: fn, options: opts } )
    }
}

function _schema( Clazz ) {
    const schema    = Clazz.prototype['$$schema'] || {};
    const methods   = Clazz.prototype['$$methods'] || [];
    const statics   = Clazz.prototype['$$statics'] || [];
    const virtuals  = Clazz.prototype['$$virtuals'] || [];
    const plugins   = Clazz.prototype['$$plugins'] || [];

    let clazz  = new Clazz;

    clazz.add( schema );

    methods.forEach( fn => {
        clazz.method( fn.name, fn );
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
