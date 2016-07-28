'use strict';
var util            = require('util');
var yeoman          = require('yeoman-generator');
var path            = require('path');
var _               = require('underscore');
_.str               = require('underscore.string');
var glob            = require('glob');
var chalk           = require('chalk');
var Main            = require('../main.js');
var ngParseModule   = require('ng-parse-module');

_.mixin(_.str.exports());

module.exports = Main.extend({
    constructor: function() {
        yeoman.Base.apply(this, arguments);
        this.type = 'module';
    },

    askForData: function() {
        var that = this;
        return this.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Enter a name for module',
                type: 'input'
            },
            {
                name: 'dir',
                message:'Where would you like to create the module (must specify a subdirectory)?',
                default: function(data) {
                    return path.join(that.name || data.name,'/');
                },
                validate: function(value) {
                    value = _.str.trim(value);
                    if (_.isEmpty(value) || value[0] === '/' || value[0] === '\\') {
                        return 'Please enter a subdirectory.';
                    }
                    return true;
                }
            }
        ]).then(function (answers) {
            this.name = answers.name;
            this.dir = answers.dir;
            this._generateFiles();
        }.bind(this));
    },

    _generateFiles: function() {
        var fromFolder = './';
        var extra = {
            name: _.camelize(this.name),
            uirouter: this.config.get('uirouter'),
            routerModuleName: this.config.get('uirouter') ? 'ui.router' : 'ngRoute',
            jsstrict: this.config.get('jsstrict')
        };

        this.generateFiles(fromFolder, extra, true);
        this._configData();
        this._registerModule();
    },

    _configData: function() {
        var modules = this.config.get('modules') || [];
        var jsPath = path.join(this.dir, this.name + '.js');
        modules.push({
            name: this.getCamelName(),
            file: jsPath,
            folder: this.dir
        });
        this.config.set('modules',modules);
        this.config.save();

        this.addJs(jsPath);
        this.updateLess();
    },

    /**
     * Register this module in app.js
     */
    _registerModule: function() {
        var dir = '/';
        var file = 'app.js';
        var filePath = path.join(file);
        var module = ngParseModule.parse(filePath);

        module.dependencies.modules.push(this.getCamelName());
        module.save();
        this.log.writeln(chalk.green(' updating') + ' %s',path.basename(file));
    }
});