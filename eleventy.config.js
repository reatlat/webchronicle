export default async function(eleventyConfig) {

    eleventyConfig.addLayoutAlias("base", "base.njk");

    return {
        templateFormats: ["njk"],
        markdownTemplateEngine: "njk",
        htmlTemplateEngine: "njk",
        dir: {
            input: "./src", // default: "."
            output: "./_site", // default: "_site"
            includes: "_includes", // default: "_includes"
            layouts: "_layouts", // default: "_layouts"
            data: "_data", // default: "_data"
        },
        pathPrefix: "/",
    };
};
