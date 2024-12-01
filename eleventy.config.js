import { DateTime } from "luxon";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

export default async function (eleventyConfig) {

    eleventyConfig.addFilter("formatDate", function (timestamp, format = "LLL dd, yyyy") {
        const regex = /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/;
        if (regex.test(timestamp)) {
            timestamp = timestamp.replace(/(\d{2})-(\d{2})-(\d{2})$/, '$1:$2:$3');
        }
        return DateTime.fromISO(timestamp).toFormat(format);
    });

    eleventyConfig.addPassthroughCopy({ "src/public": "/" });

    eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
        // which file extensions to process
        extensions: "html",

        // Add any other Image utility options here:

        // optional, output image formats
        formats: ["webp", "jpeg"],
        // formats: ["auto"],

        // optional, output image widths
        // widths: ["auto"],

        // optional, attributes assigned on <img> override these values.
        defaultAttributes: {
            loading: "lazy",
            decoding: "async",
        },
    });

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
