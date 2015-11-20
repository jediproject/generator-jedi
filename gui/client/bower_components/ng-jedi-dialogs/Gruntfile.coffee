path = require 'path'

# Build configurations.
module.exports = (grunt) ->
    grunt.initConfig

        # Metadata
        pkg: grunt.file.readJSON('package.json'),

        banner:  '/*\n' +
                    ' <%= pkg.name %> v<%= pkg.version %>\n' +
                    ' <%= pkg.description %>\n' +
                    ' <%= pkg.repository %>\n' +
                    '*/\n'

        # Deletes built file and temp directories.
        clean:
            working:
                src: [
                    'dialogs.js'
                ]

        uglify:

            # concat js files before minification
            js:
                src: ['dialogs.js']
                dest: 'dialogs.min.js'
                options:
                    banner: '<%= banner %>'
                    sourceMap: (fileName) ->
                        fileName.replace /\.js$/, '.map'
        concat:

            # concat js files before minification
            js:
                options:
                    banner: '<%= banner %>'
                    stripBanners: true
                src: [
                    'src/intro.js',
                    'src/dialogs-ctrls.js',
                    'src/dialogs.js',
                    'src/outro.js'
                ]
                dest: 'dialogs.js'

    # Register grunt tasks supplied by grunt-contrib-*.
    # Referenced in package.json.
    # https://github.com/gruntjs/grunt-contrib
    grunt.loadNpmTasks 'grunt-contrib-clean'
    grunt.loadNpmTasks 'grunt-contrib-copy'
    grunt.loadNpmTasks 'grunt-contrib-uglify'
    grunt.loadNpmTasks 'grunt-contrib-concat'

    grunt.registerTask 'default', [
        'clean'
        'concat'
        'uglify'
    ]
