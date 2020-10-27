// 11ty configuration

const fs = require('fs');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const pluginNavigation = require('@11ty/eleventy-navigation');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const markdownItEmoji = require('markdown-it-emoji');
const htmlmin = require('html-minifier');
const CleanCSS = require('clean-css');
const simpleIcons = require('simple-icons');
const jsdom = require('jsdom');
const sharp = require('sharp');

const { JSDOM } = jsdom;

module.exports = (eleventyConfig) => {
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.addPlugin(pluginNavigation);

  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.addPassthroughCopy('src/og');
  eleventyConfig.addPassthroughCopy('src/images');
  eleventyConfig.addPassthroughCopy('src/fonts');

  eleventyConfig.addLayoutAlias('base', 'layouts/base.njk');
  eleventyConfig.addLayoutAlias('article', 'layouts/article.njk');

  eleventyConfig.addCollection('articles', (collectionApi) => {
    return collectionApi.getFilteredByGlob('src/articles/*.md');
  });

  // format dates
  const dateformat = require('./src/lib/filters/dateformat');
  eleventyConfig.addFilter('datefriendly', dateformat.friendly);
  eleventyConfig.addFilter('dateymd', dateformat.ymd);

  // format word count and reading time
  eleventyConfig.addFilter('readtime', require('./src/lib/filters/readtime'));

  //format URLs
  eleventyConfig.addFilter('absoluteURL', (url, base) => {
    return new URL(url, base).toString();
  });

  eleventyConfig.addFilter('head', (array, n) => {
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  eleventyConfig.addShortcode('simpleicon', (name) => {
    return simpleIcons.get(name).svg;
  });

  eleventyConfig.addCollection('tagList', (collection) => {
    let tagSet = new Set();
    collection.getAll().forEach(function (item) {
      if ('tags' in item.data) {
        let tags = item.data.tags;
        tags = tags.filter(function (item) {
          switch (item) {
            case 'all':
            case 'nav':
            case 'article':
            case 'articles':
              return false;
          }

          return true;
        });

        for (const tag of tags) {
          tagSet.add(tag);
        }
      }
    });

    return [...tagSet];
  });

  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
  });

  markdownLibrary.use(markdownItAnchor, {
    permalink: true,
    permalinkClass: 'direct-link',
    permalinkSymbol: '#',
  });

  markdownLibrary.use(markdownItEmoji);

  eleventyConfig.setLibrary('md', markdownLibrary);

  if (process.env.NODE_ENV === 'production') {
    eleventyConfig.addTransform(
      'responsiveimg',
      async (content, outputPath) => {
        if (outputPath.endsWith('.html')) {
          const dom = new JSDOM(content);
          const document = dom.window.document;
          const imageElems = document.querySelectorAll('main article img');

          if (imageElems.length === 0) {
            return content;
          }

          for (const imgElem of imageElems) {
            const imgSrc = imgElem.getAttribute('src');
            if (imgSrc.startsWith('/images/')) {
              let srcSet = [];

              const imgSrc90 = imgSrc.replace('/images/', '/images/90/');
              const imgSrc80 = imgSrc.replace('/images/', '/images/80/');
              const imgSrc70 = imgSrc.replace('/images/', '/images/70/');
              const imgSrc60 = imgSrc.replace('/images/', '/images/60/');
              const imgSrc50 = imgSrc.replace('/images/', '/images/50/');
              const imgSrc40 = imgSrc.replace('/images/', '/images/40/');
              const imgSrc30 = imgSrc.replace('/images/', '/images/30/');
              const imgSrc20 = imgSrc.replace('/images/', '/images/20/');
              const imgSrc10 = imgSrc.replace('/images/', '/images/10/');

              const img90 = await sharp('./src' + imgSrc90);
              const md90 = await img90.metadata();
              srcSet.push(`${imgSrc90} ${md90.width}w`);

              const img80 = await sharp('./src' + imgSrc80);
              const md80 = await img80.metadata();
              srcSet.push(`${imgSrc80} ${md80.width}w`);

              const img70 = await sharp('./src' + imgSrc70);
              const md70 = await img70.metadata();
              srcSet.push(`${imgSrc70} ${md70.width}w`);

              const img60 = await sharp('./src' + imgSrc60);
              const md60 = await img60.metadata();
              srcSet.push(`${imgSrc60} ${md60.width}w`);

              const img50 = await sharp('./src' + imgSrc50);
              const md50 = await img50.metadata();
              srcSet.push(`${imgSrc50} ${md50.width}w`);

              const img40 = await sharp('./src' + imgSrc40);
              const md40 = await img40.metadata();
              srcSet.push(`${imgSrc40} ${md40.width}w`);

              const img30 = await sharp('./src' + imgSrc30);
              const md30 = await img30.metadata();
              srcSet.push(`${imgSrc30} ${md30.width}w`);

              const img20 = await sharp('./src' + imgSrc20);
              const md20 = await img20.metadata();
              srcSet.push(`${imgSrc20} ${md20.width}w`);

              const img10 = await sharp('./src' + imgSrc10);
              const md10 = await img10.metadata();
              srcSet.push(`${imgSrc10} ${md10.width}w`);

              srcSet = srcSet.join(', ');

              imgElem.setAttribute('srcset', srcSet);

              const webpSrc = imgSrc
                .replace('/images/', '/images/webp/')
                .replace('.png', '.webp');

              const webpElement = document.createElement('source');
              webpElement.setAttribute('srcset', webpSrc);
              webpElement.setAttribute('type', 'image/webp');

              const pictureElement = document.createElement('picture');
              pictureElement.appendChild(webpElement);
              pictureElement.appendChild(imgElem.cloneNode());

              imgElem.replaceWith(pictureElement);
            }
          }

          return '<!doctype html>' + document.documentElement.outerHTML;
        }

        return content;
      },
    );

    eleventyConfig.addTransform('externallinks', (content, outputPath) => {
      if (outputPath.endsWith('.html')) {
        const dom = new JSDOM(content);
        const document = dom.window.document;
        const linkElems = document.querySelectorAll(
          'a[href^="https://"], a[href^="http://"]',
        );
        linkElems.forEach((elem) => {
          elem.setAttribute('rel', 'noopener noreferrer');
        });
        return '<!doctype html>' + document.documentElement.outerHTML;
      }

      return content;
    });

    eleventyConfig.addTransform('htmlmin', (content, outputPath) => {
      if (outputPath.endsWith('.html')) {
        let minified = htmlmin.minify(content, {
          useShortDoctype: true,
          removeComments: true,
          collapseWhitespace: true,
        });
        return minified;
      }

      return content;
    });
  }

  eleventyConfig.addFilter('cssmin', function (code) {
    return new CleanCSS({}).minify(code).styles;
  });

  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: (err, browserSync) => {
        const content_404 = fs.readFileSync('_site/404.html');
        browserSync.addMiddleware('*', (req, res) => {
          res.write(content_404);
          res.end();
        });
      },
    },
    ui: false,
    ghostMode: false,
  });

  return {
    templateFormats: ['md', 'njk', 'html', 'liquid'],
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
  };
};
