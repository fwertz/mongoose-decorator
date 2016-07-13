import mongoose from 'mongoose';

import {expect,assert} from 'chai';
import {model} from '../src/decorators';

const testSchema = { name: String, address: mongoose.Schema.Types.Mixed };

describe( 'model', () => {
	it ( 'Should create a model', () => {
		@model
		class Model1 extends mongoose.Schema {}

		let m = new Model1;
	});

	it( 'Should fail to create a non-empty-non-named model', () =>{
		expect( () => {
			@model( 0 )
			class Model0 extends mongoose.Schema {}
		}).to.throw( Error );
	});
});
