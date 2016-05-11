'use strict';
var yeoman = require('yeoman-generator');
var cgUtils = require('../utils.js');
var _ = require('underscore');
var url = require('url');

module.exports = yeoman.Base.extend({
    constructor: function() {
        yeoman.Base.apply(this, arguments);
    },

    askFor: function() {
        var cb = this.async();

        var prompts = [
            {
                name: 'route',
                message: 'Enter your route url (i.e. /mypartial/:id).  If you don\'t want a route added for you, leave this empty.'
            }
        ];

        cgUtils.addNamePrompt(this,prompts,'partial');

        this.prompt(prompts, function (props) {
            if (props.name){
                this.name = props.name;
            }
            this.route = url.resolve('',props.route);
            cgUtils.askForModuleAndDir('partial',this,true,cb);
        }.bind(this));
    },

    files: function() {
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