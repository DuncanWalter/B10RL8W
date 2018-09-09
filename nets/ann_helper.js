'use strict'; 

let Math = require("mathjs");
const SEED = 10;


exports.sigmoid = function(n)
{
    return 1/(1+Math.exp(-n));
};

exports.sigmoidDeriv = function(n)
{
    return exports.sigmoid(n)*(1-exports.sigmoid(n));
};

exports.softmax = function(ary)
{
    return ary.map(function(n)
    {
    	Math.exp(n) / (ary.map( m=>Math.exp(n) )).reduce( (x,y)=>x+y );
    });  
};

exports.transpose = function(ary)
{
	return Object.keys(ary[0]).map(function(col)
	{
		ary.map(row => row[col])
	});
};
