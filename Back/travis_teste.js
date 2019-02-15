'use strict'

const assert = require('assert');
//var expect = require('chai').expect;
//var addTwoNumbers = require('../addTwoNumbers');

describe('Teste do Backend NodeJS', function () {
  it('deve somar dois numeros', function () {
    
    // 1. ARRANGE
    var x = 5;
    var y = 1;
    var sum1 = x + y;

    // 2. ACT
    //var sum2 = addTwoNumbers(x, y);

    // 3. ASSERT
    //expect(6).to.be.equal(sum1);
    assert.strictEqual(6, sum1);

  });

  it('deve subtrair dois numeros', function () {
    
    // 1. ARRANGE
    var x = 5;
    var y = 1;
    var sum1 = x - y;

    // 2. ACT
    //var sum2 = addTwoNumbers(x, y);

    // 3. ASSERT
    //expect(6).to.be.equal(sum1);
    assert.strictEqual(6, sum1); //vai dar erro!!! forcei mesmo!

  });

});