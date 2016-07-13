import mongoose from 'mongoose';

import {expect,assert} from 'chai';
import {model,schema} from '../src/decorators';

const testSchema = {
    name: { type: String, default: 'Mahogany Jones' },
    age: Number,
    address: mongoose.Schema.Types.Mixed
};

describe( 'schema', () => {
    it ( 'Should add schema via constructor', () => {
        @model
        class Model2 extends mongoose.Schema {
            constructor() {
                super();
                this.add( testSchema );
            }
        }

        let m = new Model2();
        expect( m.get( 'name' ) ).to.equal( 'Mahogany Jones' );
    });

    it ( 'Should add schema via @schema', () => {
        @model
        class Model3 extends mongoose.Schema {
            @schema
            schema() {
                return testSchema;
            }
        }

        let m = new Model3();
        expect( m.get( 'name' ) ).to.equal( 'Mahogany Jones' );
    });
});
