'use strict'; 

let Math = require("mathjs");
let ANNHelper = require("./ann_helper");

const SEED = 10;

class Vanilla_ANN
{
    constructor(xData, yData, epochs, lr, nodes)
    {
        this.xData = xData;
        this.yData = yData;
        this.epochs = epochs;
        this.lr = lr;
        this.nodes = nodes; //# of nodes per layer
        this.weights = this.initWeights();
    }

    initWeights()
    {
        //random initial weights
        this.weights = Array((this.nodes).length-1);

        for(let i=0; i<this.weights.length; i++)
        {
            this.weights[i] = Math.zeros(this.nodes[i],this.nodes[i+1]);
            this.weights[i] = this.weights[i].map(x => Math.random() );
            console.log(this.weights[i]);
        }

        return this.weights;
    }

    backprop()
    {
        for(let i=0; i<this.epochs; i++)
        {
            //NOTE: will need to add bias terms in future

            //forward propagtion
            let hidden0 = Math.multiply(this.xData,this.weights[0]);
            let activation0 = hidden0.map(x=>ANNHelper.sigmoid(x));
            let output = Math.multiply(activation0,this.weights[1]);

            let err = this.error(output);

            //back propagation
            let dz = Math.multiply(err,this.lr);

            this.weights[1] = Math.add(this.weights[1], Math.multiply(Math.transpose(activation0),dz));

            let dh = Math.dotMultiply(
            	Math.multiply(dz,Math.transpose(this.weights[1])),
            	activation0.map(x=>ANNHelper.sigmoidDeriv(x)));

            this.weights[0] = Math.add(this.weights[0], Math.multiply(Math.transpose(this.xData),dh));
        }

    }

    error(output)
    {
        //NOTE: will need to make more complex error calculation
        return Math.subtract(this.yData,output);
    }

}

function main()
{
    let xData = Math.matrix([ [0,0],[0,1],[1,0],[1,1] ]); //xor function
    let yData = Math.matrix([ [0], [1], [1], [0] ]);

    let ann = new Vanilla_ANN(xData, yData, 50000, 0.1, [2,3,1]);
    ann.backprop();
}

main();



