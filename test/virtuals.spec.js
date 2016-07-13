import mongoose from 'mongoose';

import {expect,assert} from 'chai';
import {model,schema,virtual} from '../src/decorators';

@model
class VirtualModel extends mongoose.Schema {
    @schema
    schema() {
        return {
            profile : {
                firstName: String,
                lastName: String,
                birthdate: Date
            }
        }
    }

    @virtual( 'name' )
    profileName() {
        let {firstName, lastName } = this.profile;
        return `${firstName} ${lastName}`;
    }

    @virtual( 'age', 'set' )
    setAge( age ) {
        let whatYearIsIt = new Date().getFullYear();
        this.profile.birthdate.setFullYear( whatYearIsIt - age );
    }
}

let vm = new VirtualModel({
    profile: {
        firstName: 'Mahogany',
        lastName: 'Jones',
        birthdate: new Date( '07/27/1996' )
    }
});

describe( 'virtuals', () => {
    it ( 'should fail given no path', () => {
        expect( () => {
            @model
            class Model7 extends mongoose.Schema{
                @virtual
                noPoint() {}
            };
        }).to.throw( Error );
    });
    
    it ( 'should add a virtual getter', () => {
        expect( vm.name )
            .to.exist.and.be.a( 'string' )
            .and.equal( 'Mahogany Jones' );
    });

    it ( 'should add a virtual setter', () => {
        let year = new Date().getFullYear(),
            age  = 27;
        let expectedYear = year - age;

        expect( () => {
            vm.age = age;
            expect( vm.profile.birthdate )
                .to.be.a( 'Date' );

            let bday = vm.profile.birthdate;
            expect( bday.getFullYear() ).to.equal( expectedYear );

        }).to.not.throw( Error );
    });
    
});