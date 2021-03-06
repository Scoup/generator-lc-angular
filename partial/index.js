'use strict';
var yeoman  = require('yeoman-generator');
var _       = require('underscore');
var url     = require('url');
var glob    = require('glob');
var path    = require('path');
var chalk   = require('chalk');
var Main    = require('../main.js');
var beautify = require('js-beautify').js_beautify;

module.exports = Main.extend({
    constructor: function() {
        yeoman.Base.apply(this, arguments);
        this.type = 'partial';
    },

    askForData: function() {
        var choices = this.getModuleList();

        return this.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Enter a name for partial',
                type: 'input'
            },
            {
                name: 'route',
                message: 'Enter your route url (i.e. /mypartial/:id).  If you don\'t want a route added for you, leave this empty.'
            },
            {
                name:'module',
                message:'Which module would you like to place the new partial?',
                type: 'list',
                choices: choices,
                default: 0
            }
        ]).then(function (answers) {
            this.name = answers.name;
            this.route = url.resolve('',answers.route);
            this.module = this.getModule(answers.module);
            this._generateFiles();
        }.bind(this));
    },

    _generateFiles: function() {
        var fromFolder = './';
        var extra = {
            appname: this.getModuleName(),
            ctrlname: this.getCtrlName(),
            clsname: this.getClsName(),
            uirouter: this.config.get('uirouter'),
            jsstrict: this.config.get('jsstrict')
        };

        this.generateFiles(fromFolder, extra, true);
        this.addJs();
        this._generateRoute();
        this.updateLess();
    },

    _generateRoute: function() {
        var code, marker;
        if (this.config.get('uirouter')){
            code = this._getUiRoute();
            marker = this.STATE_MARKER;
        } else {
            code = this._getAngularRoute();
            marker = this.ROUTE_MARKER;
        }

        this.addToFile(this.module.file, code, marker);
    },

    _getAngularRoute: function(route, templatePath) {
        var route = this.route;
        var templatePath = this.getTemplatePath('html');
        var output = '$routeProvider.when(\''+route+'\',{templateUrl: \''+templatePath+'\'});';
        return beautify(output, {indent_size: 4});
    },

    _getUiRoute: function(){
        var name = this.getClsName(); 
        var route = this.route;
        var templatePath = this.getTemplatePath('html');
        var ctrlName = this.getCtrlName();
        var output = "$stateProvider.state('"+name+"', { url: '"+route+"', templateUrl: '"+templatePath+"', controller: '"+ctrlName+"'});";
        return beautify(output, {indent_size: 4});
    }
});