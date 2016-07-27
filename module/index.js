'use strict';
var util    = require('util');
var yeoman  = require('yeoman-generator');
var path    = require('path');
var cgUtils = require('../utils.js');
var chalk   = require('chalk');
var _       = require('underscore');
var fs      = require('fs');
_.str       = require('underscore.string');
var glob    = require('glob');
_.mixin(_.str.exports());

module.exports = yeoman.Base.extend({
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
                default: function(data){
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
            this.log(this.module);
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

        var modules = this.config.get('modules') || [];
        modules.push({name:_.camelize(this.name),file:path.join(this.dir,this.name + '.js')});
        this.config.set('modules',modules);
        this.config.save();
    },
});

// var ModuleGenerator = module.exports = function ModuleGenerator(args, options, config) {

//     cgUtils.getNameArg(this,args);

//     yeoman.generators.Base.apply(this, arguments);

//     this.uirouter = this.config.get('uirouter');
//     this.routerModuleName = this.uirouter ? 'ui.router' : 'ngRoute';
// };

// util.inherits(ModuleGenerator, yeoman.generators.Base);

// ModuleGenerator.prototype.askFor = function askFor() {
//     var cb = this.async();
//     var that = this;

//     var prompts = [
//         {
//             name:'dir',
//             message:'Where would you like to create the module (must specify a subdirectory)?',
//             default: function(data){
//                 return path.join(that.name || data.name,'/');
//             },
//             validate: function(value) {
//                 value = _.str.trim(value);
//                 if (_.isEmpty(value) || value[0] === '/' || value[0] === '\\') {
//                     return 'Please enter a subdirectory.';
//                 }
//                 return true;
//             }
//         }
//     ];

//     cgUtils.addNamePrompt(this,prompts,'module');

//     this.prompt(prompts, function (props) {
//         if (props.name){
//             this.name = props.name;
//         }        
//         this.dir = path.join(props.dir,'/');
//         cb();
//     }.bind(this));
// };

// ModuleGenerator.prototype.files = function files() {

//     var module = cgUtils.getParentModule(path.join(this.dir,'..'));
//     module.dependencies.modules.push(_.camelize(this.name));
//     module.save();
//     this.log.writeln(chalk.green(' updating') + ' %s',path.basename(module.file));

//     cgUtils.processTemplates(this.name,this.dir,'module',this,null,null,module);

//     var modules = this.config.get('modules');
//     if (!modules) {
//         modules = [];
//     }
//     modules.push({name:_.camelize(this.name),file:path.join(this.dir,this.name + '.js')});
//     this.config.set('modules',modules);
//     this.config.save();
// };