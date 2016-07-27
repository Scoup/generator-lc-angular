'use strict';
var yeoman  = require('yeoman-generator');
var cgUtils = require('../utils.js');
var _       = require('underscore');
var url     = require('url');
var glob    = require('glob');
var path    = require('path');
var chalk   = require('chalk');
var beautify = require('js-beautify').js_beautify;

module.exports = yeoman.Base.extend({
    constructor: function() {
        yeoman.Base.apply(this, arguments);
        this.type = 'partial';
    },

    askForData: function() {
        this.log('askForData');
        var choices = cgUtils.getModules(this);

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
            this.module = cgUtils.getModule(this, answers.module);
            this.log(this.module);
            this._generateFiles();
        }.bind(this));
    },

    _generateFiles: function() {
        var root = this.templatePath('./');
        var files = glob.sync('**', { dot: true, nodir: true, cwd: root });

        var modulePath = this.module.folder;
        for(var i in files) {
            var appname = _.camelize(this.appname);
            var destinationPath = path.join(modulePath, _.slugify(this.name), files[i]);

            this.fs.copyTpl(
                this.templatePath('./' + files[i]),
                this.destinationPath(destinationPath),
                {
                    appname: this.config.get('appname'),
                    ctrlname: this._getCtrlName(),
                    clsname: this._getClsName(),
                    uirouter: this.config.get('uirouter'),
                    jsstrict: this.config.get('jsstrict')
                }
            );
        }
        this._generateRoute();
        this._addJs();
        this._updateLess();
    },

    _getCtrlName: function() {
        return _.camelize(this.name + '-ctrl');
    },

    _getClsName: function() {
        return _.dasherize(this.name);
    },

    _getTemplatePath: function(extension) {
        var extension = extension || '.html';
        var name = _.slugify(this.name);
        return this.module.folder + 'partial/' + name + '/' + name + extension;
    },

    _generateRoute: function() {
        var code, marker;
        if (this.config.get('uirouter')){
            code = this._getUiRoute();
            marker = cgUtils.STATE_MARKER;
        } else {
            code = this._getAngularRoute();
            marker = cgUtils.ROUTE_MARKER;
        }

        cgUtils.addToFile(this.module.file, code, marker);
        this.log.writeln(chalk.green(' updating') + ' %s',path.basename(this.module.file));
    },

    _getAngularRoute: function(route, templatePath) {
        var route = this.route;
        var templatePath = this._getTemplatePath('html');
        var output = '$routeProvider.when(\''+route+'\',{templateUrl: \''+templatePath+'\'});';
        return beautify(output, {indent_size: 4});
    },

    _getUiRoute: function(){
        var name = this._getClsName(); 
        var route = this.route;
        var templatePath = this._getTemplatePath('html');
        var ctrlName = this._getCtrlName();
        var output = "$stateProvider.state('"+name+"', { url: '"+route+"', templateUrl: '"+templatePath+"', controller: '"+ctrlName+"'});";
        return beautify(output, {indent_size: 4});
    },

    _addJs: function() {
        var filename = this._getTemplatePath('js');
        cgUtils.addJs(filename);
    },

    _updateLess: function() {
        var filename = this._getTemplatePath('less');
        cgUtils.addLess(this.module, filename);
    },
});