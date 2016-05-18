'use strict';
var yeoman = require('yeoman-generator');
var cgUtils = require('../utils.js');
var _ = require('underscore');
var url = require('url');

module.exports = yeoman.Base.extend({
    constructor: function() {
        yeoman.Base.apply(this, arguments);
    },

    askForName: function() {
        this.log('askForName');
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
            this.log(answers.name);
        }.bind(this));
    },

    // askForRoute: function() {
    //     return this.prompt({
    //         name: 'route',
    //         message: 'Enter your route url (i.e. /mypartial/:id).  If you don\'t want a route added for you, leave this empty.'
    //     }).then(function(answers) {
    //         this.route = url.resolve('',answers.route);
    //     }.bind(this));
    // },

    // askForModule: function() {
    //     var choices = cgUtils.getModules(this);

    //     this.prompt({
    //         name:'module',
    //         message:'Which module would you like to place the new partial?',
    //         type: 'list',
    //         choices: choices,
    //         default: 0
    //     })
    //     .then(function (answers) {
    //         // var i = choices.indexOf(props.module);

    //         // var module;

    //         // if (i === 0) {
    //         //     module = mainModule;
    //         // } else {
    //         //     module = ngParseModule.parse(modules[i-1].file);
    //         // }

    //         // cb.bind(this)(module);
    //     }.bind(this));
    // },

    // askFor: function() {
    //     this.log('askFor')
    //     var cb = this.async();

    //     var prompts = [
    //         {
    //             name: 'route',
    //             message: 'Enter your route url (i.e. /mypartial/:id).  If you don\'t want a route added for you, leave this empty.'
    //         }
    //     ];

    //     // cgUtils.addNamePrompt(this,prompts,'partial');

    //     return this.prompt(prompts, function (props) {
    //         if (props.name){
    //             this.name = props.name;
    //         }
    //         this.route = url.resolve('',props.route);
    //         cgUtils.askForModuleAndDir('partial',this,true,cb);
    //     }.bind(this));
    // },

    _files: function() {
        this.ctrlname = _.camelize(_.classify(this.name)) + 'Ctrl';
        this.uirouter = this.config.get('uirouter');

        cgUtils.processTemplates(this.name,this.dir,'partial',this,null,null,this.module);

        if (this.route && this.route.length > 0){
            var partialUrl = this.dir + this.name + '.html';
            cgUtils.injectRoute(this.module.file,this.config.get('uirouter'),this.name,this.route,partialUrl,this);
        }
    },

    _generateUiRoute: function(controller,route,routeUrl) {
        routeUrl = routeUrl.replace(/\\/g,'/');
        var options = {
            url: route,
            templateUrl: routeUrl,
            controller: controller
        };
        return '$routeProvider.when(' + route + ',' + options.toString() + ');';
    }
});