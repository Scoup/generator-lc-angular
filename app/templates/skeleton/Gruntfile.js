/*jslint node: true */
'use strict';

var pkg = require('./package.json');

//Using exclusion patterns slows down Grunt significantly
//instead of creating a set of patterns like '**/*.js' and '!**/node_modules/**'
//this method is used to create a set of inclusive patterns for all subdirectories
//skipping node_modules, bower_components, dist, and any .dirs
//This enables users to create any directory structure they desire.
var createFolderGlobs = function(fileTypePatterns) {
    fileTypePatterns = Array.isArray(fileTypePatterns) ? fileTypePatterns : [fileTypePatterns];
    var ignore = ['node_modules','bower_components','dist','temp'];
    var fs = require('fs');
    return fs.readdirSync(process.cwd())
    .map(function(file){
        if (ignore.indexOf(file) !== -1 ||
            file.indexOf('.') === 0 ||
            !fs.lstatSync(file).isDirectory()) {
            return null;
        } else {
            return fileTypePatterns.map(function(pattern) {
                return file + '/**/' + pattern;
            });
        }
    })
    .filter(function(patterns){
        return patterns;
    })
    .concat(fileTypePatterns);
};

module.exports = function (grunt) {

    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    var connect = {
        main: {
            options: {
                port: 9001,
                middleware: function (connect, options, defaultMiddleware) {
                    if (!Array.isArray(options.base)) {
                        options.base = [options.base];
                    }

                    // Setup the proxy
                    var middlewares = [require('grunt-connect-proxy/lib/utils').proxyRequest];

                    // Serve static files.
                    options.base.forEach(function(base) {
                        middlewares.push(connect.static(base));
                    });

                    // Make directory browse-able.
                    var directory = options.directory || options.base[options.base.length - 1];
                    middlewares.push(connect.directory(directory));

                    return middlewares;
                },
                m1iddleware: function(connect) {
                    return [proxySnippet];
                }
            },
            proxies: [
                {
                    context: '/api',
                    host: 'localhost',
                    port: 3000,
                    // rewrite: {
                    //   '^/api': ''
                    // }
                }
            ]
        }
    };

    var watch = {
        main: {
            options: {
                livereload: true,
                livereloadOnError: false,
                spawn: false
            },
            files: [createFolderGlobs(['*.js','*.less','*.html']),'!_SpecRunner.html','!.grunt'],
            tasks: [] //all the tasks are run dynamically during the watch event handler
        }
    };

    var jshint = {
        main: {
            options: {
                jshintrc: '.jshintrc'
            },
            src: createFolderGlobs('*.js')
        }
    };

    var clean = {
        before:{
            src:['dist','temp']
        },
        after: {
            src:['temp']
        }
    };

    var less = {
        production: {
            options: {
            },
            files: {
                'temp/app.css': 'app.less'
            }
        }
    };

    var ngtemplates = {
        main: {
            options: {
                module: pkg.name,
                htmlmin:'<%%= htmlmin.main.options %>'
            },
            src: [createFolderGlobs('*.html'),'!index.html','!_SpecRunner.html'],
            dest: 'temp/templates.js'
        }
    };

    var copy = {
        main: {
            files: [
                {src: ['img/**'], dest: 'dist/'},
                {src: ['bower_components/font-awesome/fonts/**'], dest: 'dist/',filter:'isFile',expand:true},
                {src: ['bower_components/bootstrap/fonts/**'], dest: 'dist/',filter:'isFile',expand:true}
                //{src: ['bower_components/angular-ui-utils/ui-utils-ieshiv.min.js'], dest: 'dist/'},
                //{src: ['bower_components/select2/*.png','bower_components/select2/*.gif'], dest:'dist/css/',flatten:true,expand:true},
                //{src: ['bower_components/angular-mocks/angular-mocks.js'], dest: 'dist/'}
            ]
        }
    };

    var dom_munger = {
        read: {
            options: {
                read:[
                {selector:'script[data-concat!="false"]',attribute:'src',writeto:'appjs'},
                {selector:'link[rel="stylesheet"][data-concat!="false"]',attribute:'href',writeto:'appcss'}
                ]
            },
            src: 'index.html'
        },
        update: {
            options: {
                remove: ['script[data-remove!="false"]','link[data-remove!="false"]'],
                append: [
                {selector:'body',html:'<script src="app.full.min.js"></script>'},
                {selector:'head',html:'<link rel="stylesheet" href="app.full.min.css">'}
                ]
            },
            src:'index.html',
            dest: 'dist/index.html'
        }
    };

    var cssmin = {
        main: {
            src:['temp/app.css','<%%= dom_munger.data.appcss %>'],
            dest:'dist/app.full.min.css'
        }
    };

    var concat = {
        main: {
            src: ['<%%= dom_munger.data.appjs %>','<%%= ngtemplates.main.dest %>'],
            dest: 'temp/app.full.js'
        }
    };

    var ngAnnotate = {
        main: {
            src:'temp/app.full.js',
            dest: 'temp/app.full.js'
        }
    };

    var uglify = {
        main: {
            src: 'temp/app.full.js',
            dest:'dist/app.full.min.js'
        }
    };

    var htmlmin = {
        main: {
            options: {
                collapseBooleanAttributes: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                removeComments: true,
                removeEmptyAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true
            },
            files: {
                'dist/index.html': 'dist/index.html'
            }
        }
    };

    var karma = {
        options: {
            frameworks: ['jasmine'],
            preprocessors: {
                '**/*.html': 'ng-html2js'
            },
            files: [  
                //this files data is also updated in the watch handler, if updated change there too
                '<%%= dom_munger.data.appjs %>',
                'bower_components/angular-mocks/angular-mocks.js',
                createFolderGlobs(['*-spec.js', '*.html'])
            ],
            logLevel:'ERROR',
            reporters:['mocha'],
            autoWatch: false, //watching is handled by grunt-contrib-watch
            singleRun: true
        },
        all_tests: {
            browsers: ['PhantomJS','Chrome','Firefox']
        },
        during_watch: {
            browsers: ['PhantomJS']
        },
        debug: {
            browsers: ['Chrome', 'Firefox'],
            singleRun: false,
            autoWatch: true
        }
    };

    var imagemin = imagemin: {
        main:{
            files: [{
                expand: true, cwd:'dist/',
                src:['**/{*.png,*.jpg}'],
                dest: 'dist/'
          }]
        }
    };

    grunt.initConfig({
        connect: connect,
        watch: watch,
        jshint: jshint,
        clean: clean,
        less: less,
        ngtemplates: ngtemplates,
        copy: copy,
        dom_munger: dom_munger,
        cssmin: cssmin,
        concat: concat,
        ngAnnotate: ngAnnotate,
        uglify: uglify,
        htmlmin: htmlmin,
        //Imagemin has issues on Windows.  
        //To enable imagemin:
        // - "npm install grunt-contrib-imagemin"
        // - Comment in this section
        // - Add the "imagemin" task after the "htmlmin" task in the build task alias
        // imagemin: imagemin,
        karma: karma
    });

    grunt.registerTask('build',['jshint','clean:before','less','dom_munger','ngtemplates','cssmin','concat','ngAnnotate','uglify','copy','htmlmin','clean:after']);
    grunt.registerTask('serve', ['dom_munger:read','jshint','connect', 'watch']);
    grunt.registerTask('test',['dom_munger:read','karma:all_tests']);
    grunt.registerTask('test_debug',['dom_munger:read','karma:debug']);

    grunt.event.on('watch', function(action, filepath) {
        //https://github.com/gruntjs/grunt-contrib-watch/issues/156
        var tasksToRun = [];

        if (filepath.lastIndexOf('.js') !== -1 && filepath.lastIndexOf('.js') === filepath.length - 3) {
            //lint the changed js file
            grunt.config('jshint.main.src', filepath);
            tasksToRun.push('jshint');

            //find the appropriate unit test and html file for the changed file
            var spec, html;
            if (filepath.lastIndexOf('-spec.js') === -1 || filepath.lastIndexOf('-spec.js') !== filepath.length - 8) {
                spec = filepath.substring(0,filepath.length - 3) + '-spec.js';
                html = filepath.substring(0,filepath.length - 3) + '.html';
            } else {
                spec = filepath;
                html = filepath.substring(0, filepath.length - 8) + '.html';
            }

            //if the spec exists then lets run it
            if (grunt.file.exists(spec)) {
                var files = [].concat(grunt.config('dom_munger.data.appjs'));
                files.push('bower_components/angular-mocks/angular-mocks.js');
                files.push(spec);

                //if the html exists then push to files
                if (grunt.file.exists(html)) {
                    files.push(html);
                }

                grunt.config('karma.options.files', files);
                tasksToRun.push('karma:during_watch');
            }
        }

        //if index.html changed, we need to reread the <script> tags so our next run of karma
        //will have the correct environment
        if (filepath === 'index.html') {
            tasksToRun.push('dom_munger:read');
        }

        grunt.config('watch.main.tasks',tasksToRun);
    });
};
