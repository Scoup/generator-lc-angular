'use strict';
var yeoman          = require('yeoman-generator');
var path            = require('path');
var fs              = require('fs');
var _               = require('underscore');
var chalk           = require('chalk');
_.str               = require('underscore.string');
var ngParseModule   = require('ng-parse-module');

_.mixin(_.str.exports());


exports.JS_MARKER   = "<!-- Add New Component JS Above -->";
exports.LESS_MARKER = "/* Add Component LESS Above */";

exports.ROUTE_MARKER = "/* Add New Routes Above */";
exports.STATE_MARKER = "/* Add New States Above */";

module.exports = yeoman.Base.extend({
    constructor: function() {
        yeoman.Base.apply(this, arguments);
    },

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

    addJs: function(filePath) {
        var filename = 'index.html';
        this.addToFile(filename, '<script src="' + filePath + '"></script>', exports.JS_MARKER);
    }
});
