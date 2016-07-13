import mongoose from 'mongoose';

import {expect,assert} from 'chai';
import {model,statics} from '../src/decorators';

describe( 'statics', () => {
    it ( 'should add member fn as a static model fn', () => {
        @model
        class Model6 extends mongoose.Schema {
            @statics
            PublicFields() { return [ 'name', 'birthdate', 'friends'] }
        }
        expect( Model6.PublicFields ).to.exist.and.be.a( 'function' );
    });
});