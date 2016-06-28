'use strict';
var yeoman  = require('yeoman-generator');
var cgUtils = require('../utils.js');

module.exports = yeoman.Base.extend({
    constructor: function() {
        yeoman.Base.apply(this, arguments);
        this.type = 'directive';
    },

    askForData: function() {
        var choices = cgUtils.getModules(this);

        return this.prompt([
            {
                type:'confirm',
                name: 'needpartial',
                message: 'Does this directive need an external html file (i.e. partial)?',
                default: true
            },
            {
                type: 'input',
                name: 'name',
                message: 'Enter a name for directive',
                type: 'input',
                validate: function(input) {
                    //https://github.com/angular/angular.js/commit/634e467172efa696eb32ef8942ffbedeecbd030e
                    return (input === input.trim()) && (input[0].toLowerCase() === input[0]);
                }
            },
            {
                name:'module',
                message:'Which module would you like to place the new directive?',
                type: 'list',
                choices: choices,
                default: 0
            }
        ]).then(function (answers) {
            this.needpartial = answers.needpartial;
            this.name = answers.name;
            this.module = cgUtils.getModulePath(this, answers.module);
            this.log(this.module);
        }.bind(this));
    },

    generateFiles: function() {
        var configName = 'directiveSimpleTemplates';
        var defaultDir = 'templates/simple';
        if (this.needpartial) {
            configName = 'directiveComplexTemplates';
            defaultDir = 'templates/complex';
        }

        this.htmlPath = path.join(this.dir,this.name + '.html').replace(/\\/g,'/');;

        // cgUtils.processTemplates(this.name,this.dir,'directive',this,defaultDir,configName,this.module);
    }
});