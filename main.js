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
        this.log.writeln(chalk.green(' updating') + ' %s',filename);
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
        filePath = filePath || this.getTemplatePath('js');
        this.addToFile(filename, '<script src="' + filePath + '"></script>', this.JS_MARKER);
    },

    /**
     * Return the name of the Controller
     *
     * @returns {string} - nameOfCtrl
     */
    getCtrlName: function() {
        return _.camelize(this.name + '-ctrl');
    },

    /**
     * Return the name of css class
     * 
     * @alias getSlugName
     * @returns {string} - name-of-ctrl
     */
    getClsName: function() {
        return this.getSlugName();
    },

    /**
     * Return the name of the Controller in slug mode
     *
     * @returns {string} - name-of-ctrl
     */
    getSlugName: function() {
        return _.slugify(this.name);
    },

    /**
     * Return the name in CamelMode
     *
     * @returns {string} - nameOfCtrl
     */
    getCamelName: function() {
        return _.camelize(this.name);
    },

    getModuleName: function() {
        if(this.module.folder === '') {
            return _.slugify(this.config.get('appName'));
        } else {
            return _.slugify(this.module.folder);
        }
    }

    /**
     * Update the less file with the new file
     * Add "@import my_file.less" in the less file. If is in a module, insert in a module.less,
     * if is not, add in app.less
     */
    updateLess: function() {
        var name = this.getSlugName();
        var extension = '.less';
        var filename, filePath;

        if(this.type === 'module') {
            filePath = path.join(name, name + extension);
            filename = 'app.less';
        } else {
            filePath = path.join(this.type, name, name + extension);
            if(this.module.folder === '') {
                // main
                filename = 'app.less';
            } else {
                // module
                var moduleName = _.slugify(this.module.name);
                filename = this.module.folder + moduleName + '.less';
            }
        }
        
        var lineToAdd = '@import "{filePath}";'.replace('{filePath}', filePath);
        this.addToFile(filename, lineToAdd, this.LESS_MARKER);
    },

    /**
     * Return the path of the file you need to add, like my_partial.js or my_partial.less
     *
     * @param {string} [extension=html] - The extension of the file you want (html, less, js)
     * @returns {string} - The path of the file
     */
    getTemplatePath: function(extension) {
        var extension = '.' + extension || '.html';
        var name = this.getSlugName();
        if(this.type === 'module') {
            return path.join(this.module.folder, this.type, name + extension);    
        } else {
            return path.join(this.module.folder, this.type, name, name + extension);
        }
    },

    /**
     * Copy the files and apply the template conversion
     *
     * @param {string} fromFolder - The relative path of the command called
     * @param {Object} extra - Extra data to be sent to the template
     * @param {boolean} [replaceName=false] - If true, replace the name of the file with the name of the call
     */
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

    /**
     * Return the full destination of a filename to where need to be copied
     * Check if has module or not to decide the path
     *
     * @param {string} filename - The name of file you want the full destination
     * @returns {string} - Full path to destination
     */
    getDestinationPath: function(filename) {
        if(this.type !== 'module') {
            var modulePath = this.module.folder;
            return path.join(modulePath, this.type, this.getSlugName(), filename);
        } else {
            return path.join(this.getClsName(), filename);
        }
    }
});
