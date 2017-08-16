'use strict'

var assert = require('assert');
var crypto = require('crypto');
var MerkleTools = require('../merkletools.js');
var readline = require('readline');

// I/O related variables 
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


// Stored components 
var componentA = { componentID: "SDR1703184662"}
var componentB = { componentID: "3DC027D13824"}
var componentC = { componentID: "2DC033D14233"}
var componentD = { componentID: "fake 1"}
var componentE = { componentID: "fake 2"}

var componentBank = { A: componentA, B: componentB, C: componentC, D: componentD, E: componentE }


// Merkle tree related variables 
var treeOptions = {
  hashType: 'sha256' // optional, defaults to 'sha256'
};


var tree = new MerkleTools(treeOptions); 

var components1 = [JSON.stringify(componentBank['A']), JSON.stringify(componentBank['B']), JSON.stringify(componentBank['C'])]
console.log(components1);
var components2 = [JSON.stringify(componentBank['A']), JSON.stringify(componentBank['C']), JSON.stringify(componentBank['E'])]

// var components2 = ['HALLO', 'WORLD', 'GREAT']

// Make first tree
tree.addLeaves(components1, true);
tree.makeTree();

var isReady = tree.getTreeReadyState();
console.log("Tree is ready: " + isReady); 

var root1 = tree.getMerkleRoot(); 
var buf = root1.slice(0);

console.log('Root1: ' + root1.inspect());  
console.log('Buf  : ' + buf.inspect());  

tree.resetTree(); 

tree.addLeaves(components2, true);
tree.makeTree();
var root2 = tree.getMerkleRoot(); 
console.log('Root2: ' + root2.inspect());





