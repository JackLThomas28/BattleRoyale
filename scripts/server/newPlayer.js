let fs = require('fs');

'use strict';

function createNewPlayer(io, spec){

    let newUser = JSON.stringify(spec);
    fs.appendFile('./assets/players.json', newUser,function(err){
        if(err){
            console.log(err);
        }
    });
}

module.exports.create = (spec) => createNewPlayer(spec);

