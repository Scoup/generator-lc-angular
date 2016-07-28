'use strict';
var yeoman          = require('yeoman-generator');
var path            = require('path');
var fs              = require('fs');
var _               = require('underscore');
var chalk           = require('chalk');
var glob            = require('glob');
_.str               = require('underscore.string');
var ngParseModule   = require('ng-parse-module');

_.mixin(_.str.exports());


module.exports = yeoman.Base.extend({
    JS_MARKER: "<!-- Add New Component JS Above -->",
    LESS_MARKER: "/* Add Component LESS Above */",
    ROUTE_MARKER: "/* Add New Routes Above */",
    STATE_MARKER: "/* Add New States Above */",

    constructor: function() {
        yeoman.Base.apply(this, arguments);
    },

    /**
     * Return a list of the modules of the app, included the main app.js
     *
     * @returns {Array of string} - List of modules
     */
    getModuleList: function() {
        var modules = this.config.get('modules') || [];
        var mainModule = ngParseModule.parse('app.js');
        mainModule.primary = true;

        var choices = _.pluck(modules,'name');
        choices.unshift(mainModule.name + ' (Primary Application Module)');
        return choices;
    },

    /**
     * Return the Module Object
     *
     * @param {string} module - Choosen module
     * @returns {Object} - module
     */
    getModule: function(module) {
        var mainModule  = ngParseModule.parse('app.js');
        mainModule.folder = '';
        module =  _.findWhere(this.config.get('modules'), {name: module})

        return module || mainModule;
    },

    /**
     * Write in a file
     *
     * @param {string} filename - A path to the file to be edited
     * @param {string} lineToAdd - Content to be inserted in the file
     * @param {string} beforeMarkar - A point to where to content will be inserted
     */
    addToFile: function(filename,lineToAdd,beforeMarker){
        this.log(chalk.green(' updating') + ' %s',filename);
        try {
            var fullPath = path.resolve(process.cwd(),filename);
            var fileSrc = fs.readFileSync(fullPath,'utf8');

            var indexOf = fileSrc.indexOf(beforeMarker);
            var lineStart = fileSrc.substring(0,indexOf).lastIndexOf('\n') + 1;
            var indent = fileSrc.substring(lineStart,indexOf);
            fileSrc = fileSrc.substring(0,indexOf) + lineToAdd + "\n" + indent + fileSrc.substring(indexOf);

            fs.writeFileSync(fullPath,fileSrc);
        } catch(e) {
            throw e;
        }
    },

    /**
     * Add a js file inside the index.html
     * 
     * @param {string} filePath - Path of the file to be inserted
     */
    addJs: function(filePath) {
        var filename = 'index.html';
        this.addToFile(filename, '<script src="' + filePath + '"></script>', this.JS_MARKER);
    },

    getCtrlName: function() {
        return _.camelize(this.name + '-ctrl');
    },

    getClsName: function() {
        return _.dasherize(this.name);
    },

    getTemplatePath: function(extension) {
        var extension = '.' + extension || '.html';
        var name = _.slugify(this.name);
        return path.join(this.module.folder, this.type, name + extension);
    },


    generateFiles: function(fromFolder, extra, replaceName) {
        replaceName = replaceName || false;

        var root = this.templatePath(fromFolder);
        var files = glob.sync('**', { dot: true, nodir: true, cwd: root });

        for(var i in files) {
            var file = files[i];

            if(replaceName) {
                var filename = file.indexOf('-spec') < 0 ? this.getClsName() + path.extname(file) : this.getClsName() + '-spec' + path.extname(file);
            }
            var destinationPath = this.getDestinationPath(filename);
            
            this.fs.copyTpl(
                this.templatePath(fromFolder + '/' + files[i]),
                this.destinationPath(destinationPath),
                extra
            );
        }
    },
    // this.destinationPath(this.dir + _.slugify(this.name) + ext),

    getDestinationPath: function(filename) {
        if(this.type !== 'module') {
            var modulePath = this.module.folder;
            return path.join(modulePath, this.type, _.slugify(this.name), filename);
        } else {
            return path.join(this.getClsName(), filename);
        }
    }
});
