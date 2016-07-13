import mongoose from 'mongoose';

import {expect,assert} from 'chai';
import {model,schema,method} from '../src/decorators';


let methodSchema = {
    firstName: String,
    lastName: String
}

describe( 'method', () => {

    it ( 'should add member fn as model method', () => {
        @model
        class Model4 extends mongoose.Schema{
            @method
            getName () {}
        }

        let m4 = new Model4();
;
        expect( m4.getName ).to.exist;
        expect( m4.getName ).to.be.a( 'function' );
    });

    it ( 'should have access to schema', () => {
       @model
        class Model5 extends mongoose.Schema {
           @schema
           schema() { return methodSchema }

           @method
           fullName() {
               let {firstName, lastName} = this;

               return `${firstName} ${lastName}`;
           }
        }

        let m5 = new Model5( {firstName: 'Mahogany', lastName: 'Jones'} );
        expect( m5.fullName() ).to.equal( 'Mahogany Jones' );
    });
});