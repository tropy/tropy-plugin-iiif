# tropy-plugin-iiif

## Installation
[Download the latest release](https://github.com/tropy/tropy-plugin-iiif/releases/latest). In Tropy, navigate to *Preferences… > Plugins* and click *Install Plugin* to select the downloaded ZIP file.

## Usage
Download a IIIF manifest und select *File > Import > tropy-plugin-iiif* to start the import. The plugin tries to map the manifest’s metadata to standard metadata properties. In case the result is not satisfactory, create a custom import template.

## Creating import templates
To create an import template with your own custom mappings, use Tropy’s template editor (*Preferences > Templates*). Create a new template with the properties of your choice. Each property in the template has a label, which represents a metadata label of the IIIF manifest. To figure out which labels are available, open the manifest in a IIIF viewer (look for metadata) or search inside the `metadata` array in the `manifest.json` file itself. E.g. a label `Object type` could be used in the `dc:type` property to map *Object type* to *dc:type*.

## Plugin configuration
To configure the plugin, click its *Settings* button in *Preferences > Plugins*:
  - Choose a plugin *Name* that will show up in the *File > Import* menu (e.g. *IIIF Manifest*).
  - Use the *+* icon at the far right to create new plugin instances (so you can have multiple configurations in parallel).
  - The *Item template* selector lets you pick a custom import template.

## Feedback
Missing a IIIF feature or default mapping? Please head over to the [Tropy forums](https://forums.tropy.org/) and let us know.
