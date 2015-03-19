/*
 * grunt-metaparser
 * https://github.com/consortium/grunt-metaparser
 *
 * Copyright (c) 2015 Johannes Amorosa
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks
,
  var cheerio = require('cheerio');

  grunt.registerMultiTask('metaparser', 'A consortium.io html metadata file parser and json generator', function() {
    
    // Iterate over all specified file groups.
    this.files.forEach(function(f) {

      // Concat specified files.
      var src = f.src.filter(function(filepath) {
      
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {

        // next function is inspired/copied from here :
        // https://github.com/wikimedia/html-metadata/blob/master/LICENSE.md
        // Copyright (c) 2015 Marielle Volz

        exports.parseDublinCore = function(chtml, meta){
          var content = {}
          var meta = {},
            metaTags = chtml('meta,link');

          metaTags.each(function() {
            var element = chtml(this),
              isLink = this.name === 'link',
              nameAttr = element.attr(isLink ? 'rel' : 'name');

            // If the element isn't a Dublin Core property, skip it
            if (!nameAttr
              || (nameAttr.substring(0, 3).toUpperCase() !== 'DC.'
                && nameAttr.substring(0, 8).toUpperCase() !== 'DCTERMS.')) {
              return;
            }

            var property = nameAttr.substring(nameAttr.lastIndexOf('.') + 1),
              content = element.attr(isLink ? 'href' : 'content');

            // Lowercase the first character
            property = property.charAt(0).toLowerCase() + property.substr(1);

            // If the property already exists, make the array of contents
            if (meta[property]) {
              if (meta[property] instanceof Array) {
                meta[property].push(content);
              } else {
                meta[property] = [meta[property], content];
              }
            } else {
              meta[property] = content;
            }
          });
      
          return JSON.stringify(meta);
        };

        var $ = cheerio.load(grunt.file.read(filepath));
        
        var filename =  filepath.replace(/^.*[\\\/]/, '');
        var part = '{ "filename":"' + filename + '", "data": ';
        part = part.concat(exports.parseDublinCore($));
        part = part.concat(',"path":"' + filepath + '"')
        part = part + "}"
       
        return part
        //return content;
      }).join(",");

      // add brackets
      src = '[' + src + ']';
      // normalize
      src = grunt.util.normalizelf(src);

      // Write the destination file.
      grunt.file.write(f.dest, src);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });
};