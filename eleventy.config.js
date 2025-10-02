const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {
  // Copy static files
  eleventyConfig.addPassthroughCopy("src/robots.txt.njk");
  eleventyConfig.addPassthroughCopy({"src/assets/images": "assets/images"});
  eleventyConfig.addPassthroughCopy("src/scripts", "assets/js");
  
  // Add filters
  eleventyConfig.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("dd LLL yyyy");
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
  });

  // Add date filter for formatting
  eleventyConfig.addFilter("date", (dateObj, format) => {
    if (!dateObj) return "";
    if (typeof dateObj === 'string') {
      dateObj = new Date(dateObj);
    }
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat(format);
  });

  // Add shortcodes
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // Set custom directories
  return {
    dir: {
      input: "src/content",
      includes: "../_includes",
      data: "../_data",
      output: "_site"
    },
    templateFormats: ["html", "njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
