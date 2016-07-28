'use strict';
var yeoman  = require('yeoman-generator');
var main    = require('../main.js');

module.exports = Main.extend({
    constructor: function() {
        yeoman.Base.apply(this, arguments);
        this.type = 'filter';
    },

    askForData: function() {
        this.log('askForData');
        var choices = cgUtils.getModuleList();

        return this.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Enter a name for filter',
                type: 'input'
            },
            {
                name:'module',
                message:'Which module would you like to place the new filter?',
                type: 'list',
                choices: choices,
                default: 0
            }
        ]).then(function (answers) {
            this.name = answers.name;
            this.module = cgUtils.getModule(answers.module);
            this._generateFiles();
        }.bind(this));
    },

    _generateFiles: function() {
        var fromFolder = './';
        var extra = {
            appname: this.config.get('appname'),
            ctrlname: this.getCtrlName(),
            clsname: this.getClsName(),
            uirouter: this.config.get('uirouter'),
            jsstrict: this.config.get('jsstrict')
        };
        this.generateFiles(fromFolder, extra, true);
        this.addJs(this.getTemplatePath('js'));
    }
});