'use strict';
var yeoman  = require('yeoman-generator');
var path    = require('path');
var _       = require('underscore');
var glob    = require('glob');
_.str       = require('underscore.string');
_.mixin(_.str.exports());

module.exports = yeoman.Base.extend({
    constructor: function(args, options, config) {
        yeoman.Base.apply(this, arguments);

        this.config.set('partialDirectory','partial/');
        this.config.set('modalDirectory','partial/');
        this.config.set('directiveDirectory','directive/');
        this.config.set('filterDirectory','filter/');
        this.config.set('serviceDirectory','service/');
        this.config.save();
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
            this._generateFiles();
        }.bind(this));
    },

    _generateFiles: function() {
        var root = this.templatePath('skeleton/');
        var files = glob.sync('**', { dot: true, nodir: true, cwd: root });
        for(var i in files) {
            var appname = files[i] === 'bower.json' ? _.slugify(this.appname) : _.camelize(this.appname);
            this.fs.copyTpl(
                this.templatePath('skeleton/' + files[i]),
                this.destinationPath(files[i]),
                {
                    appname: appname,
                    routerModuleName: this.routerModuleName,
                    uirouter: this.uirouter,
                    jsstrict: this.jsstrict,
                    buildPath: this.buildPath,
                    routerJs: this.routerJs,
                    routerViewDirective: this.routerViewDirective
                }
            );
        }

        this._install();
    },

    _install: function() {
        this.installDependencies({
            skipInstall: this.options['skip-install']
        });
    }
});