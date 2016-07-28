'use strict';
var _       = require('underscore');
var path    = require('path');
var Main    = require('../main.js');

module.exports = Main.extend({
    constructor: function() {
        Main.apply(this, arguments);
        this.type = 'directive';
    },

    askForData: function() {
        var choices = this.getModuleList();

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
            this.module = this.getModule(answers.module);
            this._generateFiles();
        }.bind(this));
    },

    _generateFiles: function() {
        var configName = 'directiveSimpleTemplates';
        var fromFolder = './simple';
        if (this.needpartial) {
            configName = 'directiveComplexTemplates';
            fromFolder = './complex';
        }

        var extra = {
            appname: this.getModuleName(),
            name: this.name,
            clsName: this.getClsName(),
            htmlPath: this.getTemplatePath('html'),
            jsstrict: this.config.get('jsstrict'),
        }

        this.generateFiles(fromFolder, extra, true);

        this.addJs();
        if(this.needpartial) {
            this.updateLess();
        }
    }
});