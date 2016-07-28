'use strict';
var yeoman  = require('yeoman-generator');
var cgUtils = require('../utils.js');

module.exports = yeoman.Base.extend({
    constructor: function() {
        yeoman.Base.apply(this, arguments);
        this.type = 'service';
    },

    askForData: function() {
        this.log('askForData');
        var choices = cgUtils.getModules(this);

        return this.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Enter a name for filter',
                type: 'input'
            },
            {
                name:'module',
                message:'Which module would you like to place the new filter?',
                type: 'list',
                choices: choices,
                default: 0
            }
        ]).then(function (answers) {
            this.name = answers.name;
            this.module = cgUtils.getModule(this, answers.module);
            this.log(this.module);
        }.bind(this));
    },

    generateFiles: function() {
        var root = this.templatePath('./');
        var files = glob.sync('**', { dot: true, nodir: true, cwd: root });

        var modulePath = this.module.folder;
        for(var i in files) {
            var appname = _.camelize(this.appname);
            var destinationPath = path.join(modulePath, _.slugify(this.name), files[i]);

            this.fs.copyTpl(
                this.templatePath('./' + files[i]),
                this.destinationPath(destinationPath),
                {
                    appname: this.config.get('appname'),
                    ctrlname: this._getCtrlName(),
                    clsname: this._getClsName(),
                    uirouter: this.config.get('uirouter'),
                    jsstrict: this.config.get('jsstrict')
                }
            );
        }
        this._generateRoute();
        this._addJs();
        this._updateLess();
        // cgUtils.processTemplates(this.name,this.dir,'filter',this,null,null,this.module);
    }
});