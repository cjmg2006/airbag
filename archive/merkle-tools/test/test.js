// Github: https://github.com/Tierion/merkle-tools 
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
var componentA = "SDR170318466"
var componentB = "3DC027D13824"
var componentC = "2DC033D14233"
var componentD = "3DC027D1fake"
var componentE = "2DC033D1fake"

var componentBank = { 'A': componentA, 'B': componentB, 'C': componentC, 'D': componentD, 'E': componentE }


// Merkle tree related variables 
var treeOptions = {
  hashType: 'sha256' // optional, defaults to 'sha256'
};
// valid hashTypes include all crypto hash algorithms
// such as 'MD5', 'SHA1', 'SHA224', 'SHA256', 'SHA384', 'SHA512'
// as well as the SHA3 family of algorithms
// including 'SHA3-224', 'SHA3-256', 'SHA3-384', and 'SHA3-512'


// Merkle-tree related functions 
function convertToComponentString(a) { 
  return componentBank[a];
}

// Function: Gets 3 alphanumeric letters and returns a Merkle tree built from the corresponding components 
function createMerkleTree(array) {
	var components = [convertToComponentString(array[0]), convertToComponentString(array[1]), convertToComponentString(array[2])];
	var tree = new MerkleTools(treeOptions); 
	tree.addLeaves(components, true);
	tree.makeTree();

	var root = tree.getMerkleRoot(); 

	// add proofs to each individual leaf? 
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
    var tree = createMerkleTree(combo);
    var root = tree.getMerkleRoot(); 
    result.push(root);
  } 
  return result;
}


function verifyRoot(r, roots)  {
  for (var i = 0; i < roots.length; i++) {
    var root = roots[i];
    if(r.equals(root)) return true;
  }

  return false;

}
/***********************************************/
// STEP 1: Manufacture airbag 

var roots = createMerkleRoots('A', 'C', 'E'); 

// var tree1 = createMerkleTree(['A', 'C', 'E']); 
// var root1 = tree1.getMerkleRoot(); 	
  	 

// STEP 2: Get user input 
console.log("Airbags have been manufactured! There are 5 components (A, B, C, D, E) - some are authentic and some are fake.")
console.log("An airbag has 3 components, and is authentic if it constitutes 3 authentic components.")
rl.question('Guess which components make the real airbag by typing 3 letters below! (e.g. A B C) \n', (answer) => {
  	
  var ans = answer.split(" "); 
  var tree2 = createMerkleTree([ans[0], ans[1], ans[2]]);
  var root2 = tree2.getMerkleRoot(); 

  console.log("Do your parts form a valid part?: " + verifyRoot(root2, roots));
  // console.log("Do your parts form a valid part?: " + root1.equals(root2));

  rl.close();
  
});
