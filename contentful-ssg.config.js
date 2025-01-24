require("dotenv").config();

/*
  * If a content type has a field called "date" whose value lies in the future,
  * then that interferes with Hugo. Hugo only builds individual pages for files
  * where "date" lies in the past.
  * To circumvent this issue, a publish date may be added manually, which tells
  * Hugo to build the page regardless of the specified "date".
  * Therefore, list all content types which require a manually added publish date.
*/
var contentTypesRequiringPublishDate = ["day"];

// List of content types whose entries should appear as individual pages in the navigation.
var contentTypesToInlcudeInNavigation = ["day", "person", "sponsor", "venue"];

/*
  * contenful-ssg generates file names based on the title field of a content type.
  * Certain session formats (like a break) may appear multiple times. Their files
  * would then have the same file name, leading to overwritten and therefore
  * missing files.
  * To circumvent this issue, the automatically generated file name may be
  * customized to include the unique id of an entry, which prevents duplicate
  * file names.
  * Therefore, list of session formats which require including their entry id in
  * the filename.
*/
var sessionFormatsRequiringId = ["Coffee Break", "Lunch Break"];

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Configuration for contentful-ssg.
// See: https://github.com/jungvonmatt/contentful-ssg/tree/main/packages/contentful-ssg
module.exports = {
  environmentId: "master",
  spaceId: `${process.env.SPACE_ID}`,
  accessToken: `${process.env.ACCESS_TOKEN}`,
  previewAccessToken: `${process.env.PREVIEW_ACCESS_TOKEN}`,
  directory: "content",
  plugins: [],
  // Almost redundant since the filename is later changed explicitly anyway,
  // but important for the default case.
  format: "md",
  mapFilename: (transformContext, runtimeContext, defaultValue) => {
    return getCustomFilename(transformContext.entry, defaultValue);
  },
  mapMetaFields: (transformContext, runtimeContext, defaultValue) => {
    return getCustomMetaFields(transformContext.entry, defaultValue);
  }
};

/*
  * Generate custom file names for certain content types to prevent duplicates,
  * since duplicate file names would lead to overwritten and therefore missing
  * files.
*/
function getCustomFilename(entry, defaultFilename) {

  var filename = "";
  var contentType = entry.sys.contentType.sys.id;

  switch (contentType) {
    case "day":
      const date = new Date(entry.fields.date.toString());
      filename = weekdays[date.getDay()].slice(0, 3);
      break;
    case "person":
      filename = getNormalizedFilename(entry.fields.forenames + "-" + entry.fields.surnames);
      break;
    case "role":
      filename = getNormalizedFilename(entry.fields.title + "_" + entry.sys.id);
      break;
    case "room":
      filename = getNormalizedFilename(entry.fields.location);
      break;
    case "session":
      filename = getNormalizedFilename(entry.fields.title);
      if (sessionFormatsRequiringId.includes(entry.fields.format)) {
        filename = getNormalizedFilename(entry.fields.title + "_" + entry.sys.id);
      }
      break;
    case "sessionFormat":
      filename = getNormalizedFilename(entry.fields.type);
      break;
    case "sponsor":
      filename = getNormalizedFilename(entry.fields.name);
      break;
    default:
      // Specifies which field to use for the filename of any entry by default.
      var fieldForFilename = entry.fields.title;

      if (fieldForFilename == undefined) {
        filename = defaultFilename;
      } else {
        filename = getNormalizedFilename(fieldForFilename);
      }
  }

  filename = appendFileExtensionToFilename(filename);
  return filename;
}

/*
  * Normalizes a provided file name according to the following rules:
  *   - Change to lowercase.
  *   - Replace any "/" with "_".
  *   - Replace any whitespace with "-".
  *   - Remove any ".
*/
function getNormalizedFilename(filename) {
  
  var normalizedFilename = filename.toString().toLowerCase().replaceAll("/", "_").replace(/ /g,"-").replaceAll('"', "_");
  return normalizedFilename;

  // This code below causes the following problem:
  // When encoding "ü" to "%c3%bc", only the file names change to "%c3%bc", but links retain "ü".
  // Therefore, any links will then become inaccessible.
  
  // var encodedFilename = encodeURIComponent(normalizedFilename);
  // return encodedFilename;
}

/*
  * Appends the file extension ".md" to a provided filename.
*/
function appendFileExtensionToFilename(normalizedFilename) {
  
  return normalizedFilename + ".md";
}

/*
  * Add custom meta field information to certain content types:
  *   - Overwrite default title fields.
  *   - Include entries in the navigation.
  *   - Add a publish date if applicable.
  *   - Add an alias for Role entries.
*/
function getCustomMetaFields(entry, defaultMetaFields) {

  var customTitle = "";
  var contentType = entry.sys.contentType.sys.id;

  switch (contentType) {
    case "day":
      const date = new Date(entry.fields.date.toString());
      customTitle = weekdays[date.getDay()];
      break;
    case "person":
      customTitle = entry.fields.forenames + " " + entry.fields.surnames;
      break;
    case "room":
      customTitle = entry.fields.location;
      break;
    case "sponsor":
      customTitle = entry.fields.name;
      break;
    default:
      // Specifies which field to use as the title of any entry by default.
      var fieldForTitle = entry.fields.title;
      customTitle = fieldForTitle;
  }

  if (customTitle == undefined) {
    customTitle = "Error in getCustomMetaFields(): defaultTitle field not found";
  }

  var customMetaFields = {
    defaultMetaFields,
    // For content types that already have a title, the line below is
    // redundant, as their title automatically overwrites this one.
    title: customTitle,
  };

  if (isIncludedInNavigation(contentType)) {
    Object.assign(customMetaFields, {
      menu: { main: { parent: contentType } }
    });
  }

  if (isPublishDateRequired(contentType)) {
    Object.assign(customMetaFields, {
      publishDate: "2023-01-01"
    });
  }

  if (contentType == "role") {
    addAliasForRole(customMetaFields, entry);
  }

  if (contentType == "day") {
    addWeightForDay(customMetaFields, entry);
  }
  
  return customMetaFields;
}

/*
  * Return true if the entries of the provided content type 
  * should appear as individual pages in the navigation.
*/
function isIncludedInNavigation(contentType) {

  if (contentTypesToInlcudeInNavigation.includes(contentType)) {
    return true;
  }

  return false;
}

/*
  * Return true if the provided content type requires a manually
  * added publish date that lies in the past.
*/
function isPublishDateRequired(contentType) {

  if (contentTypesRequiringPublishDate.includes(contentType)) {
    return true;
  }

  return false;
}

/*
  * For every entry of the Role content type, add an alias (alternative link)
  * to redirect from its main title URL to that entry, meaning:
  * "/role/keynote-speaker" is added and then redirects to
  * "/role/keynote-speaker_<someId>".
  * 
  * Please note:
  * "/role/keynote-speaker" might hereby link to multiple files like
  * "/role/keynote-speaker_<someId1>" and "/role/keynote-speaker_<someId2>".
*/
function addAliasForRole(customMetaFields, entry) {

  var roleTitle = "/role/" + getNormalizedFilename(entry.fields.title);
  Object.assign(customMetaFields, {
    aliases: roleTitle
  });
}

/*
  * For every entry of the Day content type, add a weight based on the date
  * to define the order of items in the navigation.
*/
function addWeightForDay(customMetaFields, entry) {

  const fullDateTime = entry.fields.date.toString();
    var dateWithDashes = fullDateTime.split("T")[0];
    var dateAsWeight = Number(dateWithDashes.replace("-", "").replace("-", ""));

    Object.assign(customMetaFields, {
      weight: dateAsWeight
    });
}