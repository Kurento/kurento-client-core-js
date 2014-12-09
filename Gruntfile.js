/*
 * (C) Copyright 2014 Kurento (http://kurento.org/)
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the GNU Lesser General Public License
 * (LGPL) version 2.1 which accompanies this distribution, and is available at
 * http://www.gnu.org/licenses/lgpl-2.1.html
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 */


module.exports = function(grunt)
{
  var DIST_DIR = 'dist';

  var pkg = grunt.file.readJSON('package.json');

  // Project configuration.
  grunt.initConfig({
    pkg: pkg,

    // Plugins configuration
    clean:
    {
      'code': 'lib'
    },

    // Check if Kurento Module Creator exists
    'path-check':
    {
      'generate plugin': {
        src: 'kurento-module-creator',
        options: {
          tasks: ['shell:kmd']
        }
      }
    },

    shell:
    {
      // Generate the Kurento Javascript client
      kmd: {
        command: [
          'mkdir -p ./lib',
          'kurento-module-creator --delete'
          +' --templates ../../templates'
          +' --rom ./src --codegen ./lib'
        ].join('&&')
      }
    }
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-path-check');
  grunt.loadNpmTasks('grunt-shell');

  // Alias tasks
  grunt.registerTask('default', ['clean', 'path-check:generate plugin']);
};
