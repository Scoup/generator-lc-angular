'use strict';
var yeoman  = require('yeoman-generator');
var Main    = require('../main.js');

module.exports = Main.extend({
    constructor: function() {
        yeoman.Base.apply(this, arguments);
        this.type = 'service';
    },

    askForData: function() {
        this.log('askForData');
        var choices = this.getModuleList();

        return this.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Enter a name for service',
                type: 'input'
            },
            {
                name:'module',
                message:'Which module would you like to place the new service?',
                type: 'list',
                choices: choices,
                default: 0
            }
        ]).then(function (answers) {
            this.name = answers.name;
            this.module = this.getModulePath(answers.module);
            this.log(this.module);
        }.bind(this));
    },

    generateFiles: function() {
        // cgUtils.processTemplates(this.name,this.dir,'service',this,null,null,this.module);
    }
});