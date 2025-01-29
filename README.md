# DCC Contentful Hugo

## 1 Introduction
A static example implementation of the website for `UX Day Graz`,\
using Hugo and Contentful.


## 2 Features
- Programme shows an overview of all sessions.
- Speakers and Team list the persons involved in the event.
- Venues provide details about the location and rooms.
- Sponsors enable promotion of supporters.
- Registration details a mock page independent of the CMS.


## 3 Installation and Setup
Four steps for complete setup.


### 3.1 Install Hugo
To install Hugo, follow the instructions shown here:
https://gohugo.io/installation/

It is recommended to install the extended edition of Hugo.
The setup was tested and is guaranteed to work with Hugo version `v0.111.3+extended`.


### 3.2 Install npm Packages
First, clone the git repository. Then in the root directory of the repository\
(the folder called `dcc-contentful-hugo/`), run:
```
npm install
```
This installs all necessary packages with appropriate versions.


### 3.3 Pull Data and Build Static Site
**Prerequisites:**
A Contentful account is required, set up with a space containing the content model
(and content). The content model can be imported via the `contentful-cli` from the
file `contentful-content-model-export.json`.
Refer to this page for more information:
https://www.contentful.com/developers/docs/tutorials/cli/import-and-export/

Next, create a file at the root directory of the repository called `.env`.
An example of this file is provided as `example.env`.
It must contain the following 3 variables (including valid values):
`SPACE_ID`, `ACCESS_TOKEN`, `PREVIEW_ACCESS_TOKEN`.

These values can be sourced from Contentful:
When logged in with an account at https://app.contentful.com, click on the
`Settings menu` in the top right, then choose `API keys`. Select an existing
API key, or add a new one. The fields with the necessary values are:
`Space ID`, `Content Delivery API - access token`,
`Content Preview API - access token`.

Next, in the root directory of the repository, run:
```
npx gulp
```
This completes all necessary steps to build the finished product into the
`public/` directory, including running `Hugo`.
For more information, refer to the sections below.

For other available gulp tasks please also refer to the sections below.


### 3.4 Deploy to Webspace
Any files contained in the `public/` directory\
may now be deployed to a desired webspace.\
Since all links are relative, any location is compatible.


## 4 Steps Performed by the gulp Default Task
Internally, gulp is configured to perform the following four steps
when running the default task.

**Note:** A summary of all available steps in gulp (including short descriptions)\
may be displayed by running:
```
npx gulp --tasks
```
The "prerequisites" task only prints information instructing the user to install\
Hugo before continuing (as mentioned above). It serves no other functionality.


### 4.1 Clean
To perform this step, run:
```
npx gulp clean
```
This removes all files inside the `public/` directory, as well as any\
**content files** inside the `content/` directory.

**Content files** are those which are sourced from Contentful and should therefore\
be deleted before pulling new content. This prevents outdated content from being\
displayed on the finished site.\
Any files that are relevant to the structure of the site remain untouched.


### 4.2 Pull Data from Contentful
To perform this step, run:
```
npx gulp fetch
```
\
Gulp internally runs the following command to perform this step:
```
npx cssg fetch -v
```
This uses `contentful-ssg` to pull data (just entries, not assets) from Contentful.\
For more information, refer to the sections below.

**Note:** Using the flag `-v` enables a more detailed verbose output.


### 4.3 Post-Processing
To perform this step, run:
```
npx gulp postprocess
```
Performs post-processing on the person **content files**.

By default, all persons are listed below "Team" in the navigation.\
However, any person with a speaker-role should be listed in the navigation below
"Speakers".\
This change is applied by this gulp task, which manipulates the configuration
within the affected files accordingly.


### 4.4 Build Static Site using Hugo
To perform this step, run:
```
npx gulp build
```
\
Gulp internally runs the following command to perform this step:
```
hugo
```
This builds the static site into the `public/` directory.

**Note 1:** Make sure to `Pull Data from Contentful` first, as described above.\
Otherwise, no content will be displayed on the resulting static site.

**Note 2:** The `public/` directory may be deleted manually before issuing the above\
command.\
By default, Hugo does not clean the directory before building, meaning that\
any old/unwanted files will be retained even after building.\
However, Hugo is configured to do so via the configuration `cleanDestinationDir: true`\
in its config `hugo.yaml`, which forces Hugo to delete any files within the\
`public/` directory before building.\
Still, gulp is configured to do the same, as described in the above section
`Pull Data from Contentful`.

Alternatively, to continuously rebuild the static site on every change\
by running a development Hugo server, use the following command:
```
hugo server
```
Press `CTRL + C` to stop Hugo's development server.


## 5 Further gulp Tasks


### Reset Repository to Default State
To reset the entire repository to a state as if it was just cloned from git, run:
```
npx gulp cleanAll
```
This removes all files generated by `Node`, `contentful-ssg` and `Hugo`,
**including** the `node_modules/` directory!

Therefore, **return to and continue at section 3.2** afterwards!


## 6 Remarks on Custom Configuration
A lot of configuration has gone into tailoring this specific implementation of
using Hugo and Contentful together.\
Most of this custom code is placed in two files:
- `contentful-ssg.config.js` and
- `gulpfile.js`

Please refer to these resources for elaborate comments on specific functionality.


## 7 Remarks on Packages


### Remarks on contentful-ssg
`contentful-ssg` is used to pull data (entries) from Contentful.\
Refer to this page for more information:
https://github.com/jungvonmatt/contentful-ssg/tree/main/packages/contentful-ssg

The data is structured into directories according to the content type names.\
Hugo then uses these files to generate individual pages.

**Note:** These content files are ignored in the git repository\
and therefore missing.\
**Before building the static site using Hugo**,\
the data must be pulled from Contentful.

The pulled entries (data) are stored as markdown files\
inside the `content/` directory.\
It is **important not to delete** this directory, as it also contains files\
and subfolders which are not pulled from Contentful and would therefore be\
lost (like the index page, etc.).

contentful-ssg automatically takes care of removing outdated files before pulling\
from Contentful based on the configuration inside the `.gitignore`:\
"When a .gitignore file is found only ignored files are removed."

Thus, all of the data files which are pulled from Contentful\
are specified in `.gitignore` via a glob pattern.

However, this feature has limitations when used on the Windows operating system.\
Due to a bug in its implementation, the removal of outdate files does not work
on Windows.\
Therefore, gulp is configured to do the same, as described in the above section
`Pull Data from Contentful`.


### Remarks on cssg-plugin-assets
`contentful-ssg` has support for a plugin called `cssg-plugin-assets`\
to also pull assets (like images) from Contentful.\
Refer to this page for more information:\
https://github.com/jungvonmatt/contentful-ssg/tree/main/packages/cssg-plugin-assets

However, this plugin has limitations when used on the Windows operating system.\
For this reason, any assets are being loaded dynamically, instead of being\
stored locally and loaded from the respective webspace.

**Note:** When used, the pulled assets are stored inside the
`static/assets/` directory.\
As opposed to the `content/` directory for `contentful-ssg`,\
this directory is not automatically cleaned when fetching,\
meaning that any old/unwanted files will be retained even after fetching.

Pulling assets from Contentful happens automatically when using the fetch command\
as described in the above section `Pull Data from Contentful`.
