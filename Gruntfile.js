'use strict';

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        appConfig: {
            app: require('./bower.json').appPath || './',
            dist: './'
        },

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            js: {
                files: ['<%= appConfig.app %>/js/{,*/}*.js'],
                options: {
                    livereload: true
                }
            },
            styles: {
                files: ['<%= appConfig.app %>/style/{,*/}*.css'],
                options: {
                    livereload: true
                }
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= appConfig.app %>/{,*/}*.html',
                    '<%= appConfig.app %>/style/{,*/}*.css'
                ]
            }
        },

        jshint: {
            all: ['js/*.js']
        },

        uglify: {
            dist: {
                files: {
                    './dist/js/built.js': [
                        './bower_components/jquery/dist/jquery.js',
                        './bower_components/bootstrap/dist/js/bootstrap.min.js',
                        './bower_components/routie/dist/routie.min.js',
                        './bower_components/firebase/firebase.js',
                        './bower_components/lodash/lodash.min.js',
                        './bower_components/toastr/toastr.min.js',
                        './js/app.js',
                        './js/welcome.js',
                        './js/game.js',
                        './js/board.js',
                        './js/fireb.js',
                        './js/utils/utils.js',
                        './js/utils/oauth.js'
                    ]
                }
            }
        },

        cssmin: {
            target: {
                files: {
                    './dist/css/built.css': [
                        './bower_components/bootstrap/dist/css/bootstrap.min.css',
                        './bower_components/toastr/toastr.min.css',
                        './css/main.css'
                    ]
                }
            }
        },

        copy: {
            main: {
                files: [
                    {expand: true, src: ['./*.html', './*.jpg', './*.png', './*.ico', './.htaccess'], dest: './dist/'},
                    {expand: true, src: ['./img/**'], dest: './dist/'},
                    {expand: true, src: ['./bower_components/bootstrap/dist/fonts/**'], dest: './dist/fonts/', filter: 'isFile', flatten: true}
                ]
            }
        },

        usemin: {
            html: './dist/index.html'
        },

        // The actual grunt server settings
        connect: {
            options: {
                port: 9000,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'localhost',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true,
                    base: [
                        '.'
                    ]
                }
            }
        }
    });

    grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
        grunt.task.run(['connect:livereload', 'watch']);
    });

    grunt.registerTask('prod', ['jshint', 'uglify', 'cssmin', 'copy', 'usemin']);

};
