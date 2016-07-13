import mongoose from 'mongoose';

import {expect,assert} from 'chai';
import {model,plugin} from '../src/decorators';

function CreatedAtPlugin ( schema, options ) {
    schema.add( {createdAt: {type: Date, default: Date.now}} );
}

@model
@plugin( CreatedAtPlugin )
class ModelPlugin extends mongoose.Schema {}

describe( 'plugins', () => {
    it ( 'should expect a function', () => {
        expect( () => {
            @model
            @plugin
            class WhatPluginModel extends mongoose.Schema {}
        }).to.throw( Error );
    });

    it ( 'should execute plugin on schema', () => {
        let mp = new ModelPlugin();
        expect( mp.createdAt ).to.exist.and.be.a( 'date' );
    });
});