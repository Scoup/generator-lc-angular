'use strict';
var yeoman  = require('yeoman-generator');
var cgUtils = require('../utils.js');
var _       = require('underscore');
var url     = require('url');
var glob    = require('glob');

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
            this.module = cgUtils.getModulePath(this, answers.module);
            this.log(this.module);
            this._generateFiles();
        }.bind(this));
    },

    _generateFiles: function() {
        var root = this.templatePath('./');
        var files = glob.sync('**', { dot: true, nodir: true, cwd: root });
        for(var i in files) {
            var appname = _.camelize(this.appname);
            this.fs.copyTpl(
                this.templatePath('./' + files[i]),
                this.destinationPath(this.dir + files[i]),
                {
                    appname: this.config.get('appname'),
                    ctrlname: _.camelize(this.name),
                    clsname: _.dasherize(this.name),
                    uirouter: this.config.get('uirouter'),
                    jsstrict: this.config.get('jsstrict')
                }
            );
        }
        // this._generateUiRoute();
    },

    _generateUiRoute: function() {
        routeUrl = this.route.replace(/\\/g,'/');
        var options = {
            url: route,
            templateUrl: routeUrl,
            controller: controller
        };
        return '$routeProvider.when(' + route + ',' + options.toString() + ');';
    }
});