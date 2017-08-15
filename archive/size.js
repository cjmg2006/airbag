'use strict'

var assert = require('assert');
var crypto = require('crypto');
var MerkleTools = require('./merkle-tools/merkletools.js');
var readline = require('readline');
var SerialPort = require('serialport');
var express = require('express');
var path = require('path');
var app = express();
var sizeof = require('object-sizeof');
var jsonSize = require('json-size')
 
var size = sizeof({foo: 'bar'})
console.log(size); 

// Stored components for Merkle Tree
var componentA = "SDR170318466"
var componentB = "3DC027D13824"
var componentC = "2DC033D14233"
var componentD = "3DC027D1fake"
var componentE = "2DC033D1fake"
var componentBank = { 'A': componentA, 'B': componentB, 'C': componentC, 'D': componentD, 'E': componentE }

var treeOptions = {
  hashType: 'sha256' // optional, defaults to 'sha256'
};


/*******************************************/
// Part A1: Merkle Tree Functions 
/*******************************************/

function convertToComponentString(a) { 
  return componentBank[a];
}

// Function: Gets 3 alphanumeric letters and returns a Merkle tree built from the corresponding components 
function createMerkleTreeAlpha(array) {
	var components = [convertToComponentString(array[0]), convertToComponentString(array[1]), convertToComponentString(array[2])];
	var tree = new MerkleTools(treeOptions); 

	// TODO: add proofs to each individual leaf? 

	return createMerkleTree (components); 
}

function createMerkleTree(components) { 
	var tree = new MerkleTools(treeOptions); 
	tree.addLeaves(components, true); 
	tree.makeTree();

	return tree; 
} 

function generateCombinations(a, b, c) {
  var result = []; 
  result.push([a, b, c]); 
  result.push([a, c, b]); 
  result.push([b, a, c]); 
  result.push([b, c, a]); 
  result.push([c, a, b]); 
  result.push([c, b, a]); 
  return result;
}

function createMerkleRoots(a, b, c) { 
  var result = [];
  var combinations = generateCombinations(a, b, c);
  for (var i = 0; i < combinations.length; i++) { 
    var combo = combinations[i];
    var tree = createMerkleTreeAlpha(combo);
    var root = tree.getMerkleRoot(); 
    console.log(sizeof(root));
    result.push(root);
  } 
  return result;
}

var realAirbagTree = createMerkleTree(['A', 'B', 'C']);
var root = tree.getMerkleRoot();
console.log(sizeof(realAirbagRoots));

