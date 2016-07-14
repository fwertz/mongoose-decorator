import mongoose from 'mongoose';

import {expect,assert} from 'chai';
import {HOOKS,model,pre,post} from '../src/decorators';

describe( 'hooks', ()=> {

    it ( `should only support ${HOOKS}`, () => {
        'init','validate','save','remove','find','update'
        expect( ()=> {
            @model
            class ValidHooksModel extends mongoose.Schema{
                @pre init(){} @pre validate(){} @pre save(){} @pre remove(){} @pre find(){} @pre update(){}
                @post init(){} @post validate(){} @post save(){} @post remove(){} @post find(){} @post update(){}
            }
        }).to.not.throw( Error );

        expect( ()=> {
            @model
            class InvalidHooksModel1 extends mongoose.Schema {
                @pre connect() {}
            }
        }).to.throw( Error );

        expect( ()=> {
            @model
            class InvalidHooksModel2 extends mongoose.Schema {
                @post( 'connect' )
                connect() {}
            }
        }).to.throw( Error );
    });
});