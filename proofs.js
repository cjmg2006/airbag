'use strict'

var assert = require('assert');
var crypto = require('crypto');
var MerkleTools = require('./merkle-tools/merkletools.js');
var sizeof = require('object-sizeof');

var A = "SDR170318466"
var B = "3DC027D13824"
var C = "2DC033D14233"
var D = "3DC027D1fake"

var components1 = [A, B, C];
var components2 = [A, D, C];

var root1;
var proofs1 = []; 

var root2;
var proofs2 = []; 

var tree1 = new MerkleTools(); 
tree1.addLeaves(components1, true); 
tree1.makeTree();
root1 = tree1.getMerkleRoot(); 
proofs1.push(tree1.getProof(0));
proofs1.push(tree1.getProof(1));
proofs1.push(tree1.getProof(2));

console.log("Root 1: " + root1.inspect());

console.log("Proofs for root 1 (A, B, C): \n"); 
console.log(proofs1[0]);
console.log(proofs1[1]);
console.log(proofs1[2]);


var tree2 = new MerkleTools(); 
tree2.addLeaves(components2, true); 
tree2.makeTree();
root2 = tree2.getMerkleRoot(); 
proofs2.push(tree2.getProof(0));
proofs2.push(tree2.getProof(1));
proofs2.push(tree2.getProof(2));


console.log("Root 2: " + root2.inspect());

console.log("Proofs for root 2 (A, D, C): \n"); 
console.log(proofs2[0]);
console.log(proofs2[1]);
console.log(proofs2[2]);
	


