'use strict';
var util    = require('util');
var yeoman  = require('yeoman-generator');
var path    = require('path');
var _       = require('underscore');
_.str       = require('underscore.string');
var glob    = require('glob');
var Main    = require('../main.js');
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
        var root = this.templatePath('./');
        var files = glob.sync('**', { dot: true, nodir: true, cwd: root });
        for(var i in files) {
            var appname = _.camelize(this.appname);
            var ext = path.extname(files[i]);
            this.fs.copyTpl(
                this.templatePath('./' + files[i]),
                this.destinationPath(this.dir + _.slugify(this.name) + ext),
                {
                    name: _.camelize(this.name),
                    uirouter: this.config.get('uirouter'),
                    routerModuleName: this.config.get('uirouter') ? 'ui.router' : 'ngRoute',
                    jsstrict: this.config.get('jsstrict')
                }
            );
        }

        this._registerModule();
    },

    _registerModule: function() {
        var modules = this.config.get('modules') || [];
        var jsPath = path.join(this.dir, this.name + '.js');
        modules.push({
            name: _.camelize(this.name),
            file: jsPath,
            folder: this.dir
        });
        this.config.set('modules',modules);
        this.config.save();

        this.addJs(jsPath);

        var clsName = _.slugify(this.name);
        var lessPath = clsName + '/' + clsName + '.less';
        var lineToAdd = '@import "{lessPath}";'.replace('{lessPath}', lessPath);
        var filename = 'app.less';
        this.addToFile(filename, lineToAdd, this.LESS_MARKER);
    }
});