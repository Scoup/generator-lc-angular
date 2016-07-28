'use strict';
var yeoman  = require('yeoman-generator');
var glob    = require('glob');
var _       = require('underscore');
var path    = require('path');
var Main    = require('../main.js');

module.exports = Main.extend({
    constructor: function() {
        yeoman.Base.apply(this, arguments);
        this.type = 'directive';
    },

    askForData: function() {
        console.log(this.acd);
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
            this.log(this.module);
            this._generateFiles();
        }.bind(this));
    },

    _generateFiles: function() {
        var configName = 'directiveSimpleTemplates';
        var defaultDir = './simple';
        if (this.needpartial) {
            configName = 'directiveComplexTemplates';
            defaultDir = './complex';
        }

        var root = this.templatePath(defaultDir);
        var files = glob.sync('**', { dot: true, nodir: true, cwd: root });

        var modulePath = this.module.folder;
        for(var i in files) {
            console.log("file", files[i])
            var file = files[i];
            var appname = _.camelize(this.appname);
            var filename = file.indexOf('-spec') < 0 ? this._getClsName() + path.extname(file) : this._getClsName() + '-spec' + path.extname(file);
            var destinationPath = path.join(modulePath, 'directive', _.slugify(this.name), filename);

            this.fs.copyTpl(
                this.templatePath(defaultDir + '/' + files[i]),
                this.destinationPath(destinationPath),
                {
                    appname: this.config.get('appname'),
                    name: this.name,
                    clsName: this._getClsName(),
                    htmlPath: this._getTemplatePath('html'),
                    jsstrict: this.config.get('jsstrict'),
                }
            );
        }
        this._addJs();
        if(this.needpartial) {
            this._updateLess();    
        }
    },

    _getTemplatePath: function(extension) {
        var extension = '.' + extension || '.html';
        var name = _.slugify(this.name);
        return this.module.folder + 'directive/' + name + '/' + name + extension;
    },

    _getClsName: function() {
        return _.dasherize(this.name);
    },

    _addJs: function() {
        var filename = this._getTemplatePath('js');
        this.addJs(filename);
    },

    _updateLess: function() {
        var filename, path;
        var name = this._getClsName();
        if(this.module.folder === '') {
            // main
            filename = 'app.less';
            path = 'directive/' + name + '/' + name + '.less';
        } else {
            // module
            var moduleName = _.slugify(this.module.name);
            filename = this.module.folder + moduleName + '.less';
            path = 'directive/' + name + '/' + name + '.less';
        }
        var lineToAdd = '@import "{path}";'.replace('{path}', path);
        this.addToFile(filename, lineToAdd, cgUtils.LESS_MARKER);
    }

});