'use strict';
var yeoman  = require('yeoman-generator');
var util    = require('util');
var path    = require('path');
var cgUtils = require('../utils.js');

module.exports = yeoman.Base.extend({
    constructor: function() {
        yeoman.Base.apply(this, arguments);
    },

    askForData: function() {
        this.log('askForData');
        return this.prompt([
            {
                name: 'appname',
                message: 'What would you like the angular app/module name to be?',
                default: path.basename(process.cwd())
            },
            {
                name: 'router',
                type:'list',
                message: 'Which router would you like to use?',
                default: 0,
                choices: ['Standard Angular Router','Angular UI Router']
            },
            {
                type: 'confirm',
                name: 'jsstrict',
                message: 'Would you like your AngularJS code to \'use strict\'?',
                default: true
            },
            {
                name: 'buildPath',
                message: 'Which path would you like to build your app? Can be changed later in Gruntfile.js',
                default: 'dist'
            }
        ]).then(function (answers) {
            this.appname = answers.appname;

            if (answers.router === 'Angular UI Router') {
                this.uirouter = true;
                this.routerJs = 'bower_components/angular-ui-router/release/angular-ui-router.js';
                this.routerModuleName = 'ui.router';
                this.routerViewDirective = 'ui-view';
            } else {
                this.uirouter = false;
                this.routerJs = 'bower_components/angular-route/angular-route.js';
                this.routerModuleName = 'ngRoute';
                this.routerViewDirective = 'ng-view';
            }

            this.config.set('uirouter',this.uirouter);
            this.config.set('jsstrict', !!answers.jsstrict);
            this.buildPath = answers.buildPath;
            this.directory('skeleton/','./');

            // this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));

            this._end();
        }.bind(this));
    },

    _end: function() {
        this.config.set('partialDirectory','partial/');
        this.config.set('modalDirectory','partial/');
        this.config.set('directiveDirectory','directive/');
        this.config.set('filterDirectory','filter/');
        this.config.set('serviceDirectory','service/');
        var inject = {
            js: {
                file: 'index.html',
                marker: cgUtils.JS_MARKER,
                template: '<script src="<%= filename %>"></script>'
            },
            less: {
                relativeToModule: true,
                file: '<%= module %>.less',
                marker: cgUtils.LESS_MARKER,
                template: '@import "<%= filename %>";'
            }
        };
        this.config.set('inject',inject);
        this.config.save();
        this.installDependencies({ skipInstall: options['skip-install'] });
    },

    generateFiles: function() {
        // var configName = 'directiveSimpleTemplates';
        // var defaultDir = 'templates/simple';
        // if (this.needpartial) {
        //     configName = 'directiveComplexTemplates';
        //     defaultDir = 'templates/complex';
        // }

        // this.htmlPath = path.join(this.dir,this.name + '.html').replace(/\\/g,'/');;

        // cgUtils.processTemplates(this.name,this.dir,'directive',this,defaultDir,configName,this.module);
    }
});